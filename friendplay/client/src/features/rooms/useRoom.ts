import { useContext } from 'react';
import { RoomContext } from './RoomContext';

export function useRoom() {
  const ctx = useContext(RoomContext);
  if (!ctx) {
    throw new Error('useRoom must be used inside <RoomProvider>');
  }
  return ctx;
}