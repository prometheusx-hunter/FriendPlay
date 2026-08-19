import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { env } from '../config/env';
import { socketAuthMiddleware } from './socketAuth';
import { registerRoomHandlers } from './roomHandlers';
import { registerGameHandlers, cleanupGameForRoom } from './gameHandlers';
import { roomStore, setOnRoomExpired } from './roomStore';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from './types';

export function initializeSocket(httpServer: HttpServer) {
  const io = new Server<ClientToServerEvents, ServerToClientEvents, object, SocketData>(
    httpServer,
    {
      cors: {
        origin: env.CLIENT_URL,
        credentials: true,
      },
    },
  );

  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    registerRoomHandlers(io, socket);
    registerGameHandlers(io, socket);
  });

  setOnRoomExpired((roomId, room) => {
    if (room) {
      io.to(roomId).emit('room:update', room);
    } else {
      io.to(roomId).emit('room:closed', { roomId, reason: 'সব প্লেয়ার disconnect হয়ে গেছে' });
      cleanupGameForRoom(roomId);
    }
    io.emit('lobby:update', roomStore.listOpenRooms());
  });

  return io;
}