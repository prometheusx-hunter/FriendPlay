import { createContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { socket } from './socket';
import { useAuth } from '../features/auth/useAuth';

interface SocketContextValue {
  isConnected: boolean;
}

export const SocketContext = createContext<SocketContextValue>({ isConnected: false });

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      socket.disconnect();
      setIsConnected(false);
      return;
    }

    socket.connect();

    function handleConnect() {
      setIsConnected(true);
    }
    function handleDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [user, isLoading]);

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ isConnected }}>{children}</SocketContext.Provider>
  );
}