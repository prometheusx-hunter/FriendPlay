import { Server, Socket } from 'socket.io';
import { roomStore } from './roomStore';
import { cleanupGameForRoom } from './gameHandlers';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
} from './types';

type AppServer = Server<ClientToServerEvents, ServerToClientEvents, object, SocketData>;
type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, object, SocketData>;

function broadcastLobby(io: AppServer) {
  io.emit('lobby:update', roomStore.listOpenRooms());
}

export function registerRoomHandlers(io: AppServer, socket: AppSocket) {
  const { userId, username } = socket.data;

  const existingRoomId = roomStore.getRoomIdForUser(userId);
  if (existingRoomId) {
    const result = roomStore.joinRoom(existingRoomId, {
      userId,
      username,
      socketId: socket.id,
    });
    if (result.ok) {
      socket.join(existingRoomId);
      io.to(existingRoomId).emit('room:update', result.room);
    }
  }

  socket.on('room:create', ({ gameType }, ack) => {
    const room = roomStore.createRoom(gameType, {
      userId,
      username,
      socketId: socket.id,
    });
    socket.join(room.id);
    ack({ ok: true, room });
    broadcastLobby(io);
  });

  socket.on('room:join', ({ roomId }, ack) => {
    const result = roomStore.joinRoom(roomId, {
      userId,
      username,
      socketId: socket.id,
    });
    if (!result.ok) {
      ack(result);
      return;
    }
    socket.join(roomId);
    ack(result);
    io.to(roomId).emit('room:update', result.room);
    broadcastLobby(io);
  });

    socket.on('room:leave', ({ roomId }, ack) => {
    const room = roomStore.removePlayer(roomId, userId);
    socket.leave(roomId);
    if (room) {
      io.to(roomId).emit('room:update', room);
    } else {
      io.to(roomId).emit('room:closed', { roomId, reason: 'সব প্লেয়ার রুম ছেড়ে গেছে' });
      cleanupGameForRoom(roomId);
    }
    ack({ ok: true });
    broadcastLobby(io);
  });

  socket.on('disconnect', () => {
    const result = roomStore.markDisconnected(userId);
    if (result) {
      io.to(result.roomId).emit('room:update', result.room);
    }
  });
}