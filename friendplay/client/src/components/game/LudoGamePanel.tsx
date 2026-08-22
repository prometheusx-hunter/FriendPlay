import { useEffect, useRef } from 'react';
import { LudoBoard } from './LudoBoard';
import { DiceRoller } from './DiceRoller';
import { PlayerBadge } from './PlayerBadge';
import type { LudoGameState, LudoPlayerState } from '../../socket/types';

interface LudoGamePanelProps {
  gameState: LudoGameState;
  currentUserId: string;
  error: string;
  onRollDice: () => void;
  onMovePiece: (pieceId: number) => void;
}

function getPlayerBySeat(players: LudoPlayerState[], seat: number) {
  return players.find((p) => p.seat === seat);
}

// Wait for the dice-roll animation to finish (see DiceRoller's SPIN_TICKS *
// TICK_MS) before auto-moving, so the player sees the roll land first.
const AUTO_MOVE_DELAY_MS = 650;

export function LudoGamePanel({
  gameState,
  currentUserId,
  error,
  onRollDice,
  onMovePiece,
}: LudoGamePanelProps) {
  const isMyTurn = gameState.currentTurnUserId === currentUserId;

  // Tracks the last (turn, dice, piece) combo we've already auto-moved for,
  // so a re-render doesn't fire the same auto-move twice.
  const autoMovedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isMyTurn || !gameState.hasRolled) return;
    if (gameState.movablePieceIds.length !== 1) return;

    const pieceId = gameState.movablePieceIds[0];
    const signature = `${gameState.currentTurnUserId}:${gameState.lastDice}:${pieceId}`;
    if (autoMovedRef.current === signature) return;
    autoMovedRef.current = signature;

    const timer = setTimeout(() => onMovePiece(pieceId), AUTO_MOVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [
    isMyTurn,
    gameState.hasRolled,
    gameState.movablePieceIds,
    gameState.currentTurnUserId,
    gameState.lastDice,
    onMovePiece,
  ]);

  if (gameState.status === 'finished') {
    const winner = gameState.players.find((p) => p.userId === gameState.winnerUserId);
    return (
      <div className="rounded-xl border border-gold bg-felt-dark p-6 text-center">
        <p className="font-display text-xl text-gold-bright">
          🏆 {winner?.username ?? 'একজন খেলোয়াড়'} জিতেছে!
        </p>
        <p className="mt-2 text-sm text-mist">
          Finish order: {gameState.finishOrder.join(' → ')}
        </p>
      </div>
    );
  }

  const seatPlayer = (seat: number) => getPlayerBySeat(gameState.players, seat);
  const isTurn = (seat: number) => seatPlayer(seat)?.userId === gameState.currentTurnUserId;
  const isSelf = (seat: number) => seatPlayer(seat)?.userId === currentUserId;

  // Only ask the player to pick when there's an actual choice to make.
  const showPieceChoices =
    isMyTurn && gameState.hasRolled && gameState.movablePieceIds.length > 1;

  return (
    <div>
      <div className="flex justify-center">
        <DiceRoller
          value={gameState.lastDice}
          canRoll={isMyTurn && !gameState.hasRolled}
          onRoll={onRollDice}
        />
      </div>

      {error && <p className="mt-3 text-center text-sm text-ruby">{error}</p>}

      <div className="mt-6 flex flex-col items-center gap-4 lg:flex-row lg:items-center lg:justify-center lg:gap-6">
        <div className="flex flex-row gap-3 lg:flex-col lg:justify-between lg:self-stretch">
          <PlayerBadge seat={0} player={seatPlayer(0)} isCurrentTurn={isTurn(0)} isSelf={isSelf(0)} />
          <PlayerBadge seat={3} player={seatPlayer(3)} isCurrentTurn={isTurn(3)} isSelf={isSelf(3)} />
        </div>

        <LudoBoard gameState={gameState} currentUserId={currentUserId} onPieceClick={onMovePiece} />

        <div className="flex flex-row gap-3 lg:flex-col lg:justify-between lg:self-stretch">
          <PlayerBadge seat={1} player={seatPlayer(1)} isCurrentTurn={isTurn(1)} isSelf={isSelf(1)} />
          <PlayerBadge seat={2} player={seatPlayer(2)} isCurrentTurn={isTurn(2)} isSelf={isSelf(2)} />
        </div>
      </div>

      {showPieceChoices && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {gameState.movablePieceIds.map((pieceId) => (
            <button
              key={pieceId}
              onClick={() => onMovePiece(pieceId)}
              className="rounded-md border border-felt-line px-4 py-1.5 text-sm text-parchment hover:border-gold hover:text-gold"
            >
              Piece {pieceId + 1} move করুন
            </button>
          ))}
        </div>
      )}
    </div>
  );
}