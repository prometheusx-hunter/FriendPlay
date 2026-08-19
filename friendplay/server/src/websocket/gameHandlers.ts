import { Server, Socket } from 'socket.io';
import { roomStore } from './roomStore';
import { gameStore } from '../games/shared/gameStore';
import { createLudoGame, cleanupLudoGame, movePiece, rollDice } from '../games/ludo/LudoEngine';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from './types';

type AppServer = Server<ClientToServerEvents, ServerToClientEvents, object, SocketData>;
type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, object, SocketData>;

function broadcastLobby(io: AppServer) {
  io.emit('lobby:update', roomStore.listOpenRooms());
}

export function registerGameHandlers(io: AppServer, socket: AppSocket) {
  const { userId } = socket.data;

  socket.on('game:start', ({ roomId }, ack) => {
    const result = roomStore.startGame(roomId, userId);
    if (!result.ok) {
      ack({ ok: false, message: result.message });
      return;
    }

    const state = createLudoGame(roomId, result.players);
    gameStore.set(roomId, state);

    ack({ ok: true });

    const room = roomStore.getRoom(roomId);
    if (room) io.to(roomId).emit('room:update', room);
    io.to(roomId).emit('game:state', state);
    broadcastLobby(io);
  });

  socket.on('game:rollDice', ({ roomId }, ack) => {
    const state = gameStore.get(roomId);
    if (!state) {
      ack({ ok: false, message: 'Game পাওয়া যায়নি' });
      return;
    }

    const result = rollDice(state, userId);
    if (!result.ok) {
      ack({ ok: false, message: result.message });
      return;
    }

    ack({ ok: true });
    io.to(roomId).emit('game:state', result.state);
  });

  socket.on('game:movePiece', ({ roomId, pieceId }, ack) => {
    const state = gameStore.get(roomId);
    if (!state) {
      ack({ ok: false, message: 'Game পাওয়া যায়নি' });
      return;
    }

    const result = movePiece(state, userId, pieceId);
    if (!result.ok) {
      ack({ ok: false, message: result.message });
      return;
    }

    ack({ ok: true });
    io.to(roomId).emit('game:state', result.state);

    if (result.state.status === 'finished') {
      const room = roomStore.setStatus(roomId, 'finished');
      if (room) io.to(roomId).emit('room:update', room);
    }
  });
}

export function cleanupGameForRoom(roomId: string) {
  gameStore.delete(roomId);
  cleanupLudoGame(roomId);
}