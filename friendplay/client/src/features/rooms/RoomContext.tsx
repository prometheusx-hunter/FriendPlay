import { createContext, useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { socket } from '../../socket/socket';
import type { GameType, RoomState } from '../../socket/types';

interface RoomContextValue {
  room: RoomState | null;
  closedReason: string | null;
  createRoom: (gameType: GameType) => Promise<RoomState>;
  joinRoom: (roomId: string) => Promise<RoomState>;
  leaveRoom: () => Promise<void>;
  clearClosedReason: () => void;
}

export const RoomContext = createContext<RoomContextValue | undefined>(undefined);

export function RoomProvider({ children }: { children: ReactNode }) {
  const [room, setRoom] = useState<RoomState | null>(null);
  const [closedReason, setClosedReason] = useState<string | null>(null);

  useEffect(() => {
    function handleRoomUpdate(updated: RoomState) {
      setRoom((current) => (!current || current.id === updated.id ? updated : current));
    }

    function handleRoomClosed(payload: { roomId: string; reason: string }) {
      setRoom((current) => {
        if (current?.id === payload.roomId) {
          setClosedReason(payload.reason);
          return null;
        }
        return current;
      });
    }

    socket.on('room:update', handleRoomUpdate);
    socket.on('room:closed', handleRoomClosed);

    return () => {
      socket.off('room:update', handleRoomUpdate);
      socket.off('room:closed', handleRoomClosed);
    };
  }, []);

  const createRoom = useCallback((gameType: GameType) => {
    return new Promise<RoomState>((resolve, reject) => {
      socket.emit('room:create', { gameType }, (res) => {
        if (res.ok) {
          setRoom(res.room);
          resolve(res.room);
        } else {
          reject(new Error(res.message));
        }
      });
    });
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    return new Promise<RoomState>((resolve, reject) => {
      socket.emit('room:join', { roomId }, (res) => {
        if (res.ok) {
          setRoom(res.room);
          resolve(res.room);
        } else {
          reject(new Error(res.message));
        }
      });
    });
  }, []);

  const leaveRoom = useCallback(() => {
    return new Promise<void>((resolve) => {
      if (!room) {
        resolve();
        return;
      }
      socket.emit('room:leave', { roomId: room.id }, () => {
        setRoom(null);
        resolve();
      });
    });
  }, [room]);

  const clearClosedReason = useCallback(() => setClosedReason(null), []);

  return (
    <RoomContext.Provider
      value={{ room, closedReason, createRoom, joinRoom, leaveRoom, clearClosedReason }}
    >
      {children}
    </RoomContext.Provider>
  );
}