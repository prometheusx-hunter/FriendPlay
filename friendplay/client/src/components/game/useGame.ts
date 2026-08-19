import { useEffect, useState } from 'react';
import { socket } from '../../socket/socket';
import type { LudoGameState } from '../../socket/types';

export function useGame(roomId: string | undefined) {
  const [gameState, setGameState] = useState<LudoGameState | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setGameState(null);
  }, [roomId]);

  useEffect(() => {
    function handleGameState(state: LudoGameState) {
      if (state.roomId === roomId) {
        setGameState(state);
      }
    }
    socket.on('game:state', handleGameState);
    return () => {
      socket.off('game:state', handleGameState);
    };
  }, [roomId]);

  function startGame() {
    if (!roomId) return;
    setError('');
    socket.emit('game:start', { roomId }, (res) => {
      if (!res.ok) setError(res.message ?? 'Game শুরু করা যায়নি');
    });
  }

  function rollDice() {
    if (!roomId) return;
    setError('');
    socket.emit('game:rollDice', { roomId }, (res) => {
      if (!res.ok) setError(res.message ?? 'Dice roll করা যায়নি');
    });
  }

  function movePiece(pieceId: number) {
    if (!roomId) return;
    setError('');
    socket.emit('game:movePiece', { roomId, pieceId }, (res) => {
      if (!res.ok) setError(res.message ?? 'Move করা যায়নি');
    });
  }

  return { gameState, error, startGame, rollDice, movePiece };
}