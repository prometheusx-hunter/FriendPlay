import { Button } from '../common/Button';
import type { LudoGameState } from '../../socket/types';

function describePiece(stepsTaken: number): string {
  if (stepsTaken === -1) return 'ইয়ার্ডে';
  if (stepsTaken === 57) return 'পৌঁছে গেছে ✓';
  if (stepsTaken >= 51) return `হোম স্ট্রেচ ${stepsTaken - 50}/6`;
  return `ঘর ${stepsTaken}`;
}

interface LudoGamePanelProps {
  gameState: LudoGameState;
  currentUserId: string;
  error: string;
  onRollDice: () => void;
  onMovePiece: (pieceId: number) => void;
}

export function LudoGamePanel({
  gameState,
  currentUserId,
  error,
  onRollDice,
  onMovePiece,
}: LudoGamePanelProps) {
  const isMyTurn = gameState.currentTurnUserId === currentUserId;
  const currentTurnPlayer = gameState.players.find(
    (p) => p.userId === gameState.currentTurnUserId,
  );

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

  return (
    <div>
      <div className="flex items-center justify-between rounded-xl border border-felt-line bg-felt-dark p-5">
        <div>
          <p className="text-sm text-mist">এখন turn</p>
          <p className="font-display text-lg text-gold-bright">
            {isMyTurn ? 'আপনার পালা' : currentTurnPlayer?.username}
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-mist">Dice</p>
          <p className="font-mono text-3xl text-parchment">{gameState.lastDice ?? '—'}</p>
        </div>

        {isMyTurn && !gameState.hasRolled && (
          <Button onClick={onRollDice} className="w-auto px-6">
            Roll Dice
          </Button>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-ruby">{error}</p>}

      {isMyTurn && gameState.hasRolled && gameState.movablePieceIds.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {gameState.movablePieceIds.map((pieceId) => (
            <Button
              key={pieceId}
              onClick={() => onMovePiece(pieceId)}
              variant="ghost"
              className="w-auto px-4"
            >
              Piece {pieceId + 1} move করুন
            </Button>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        {gameState.players.map((player) => (
          <div
            key={player.userId}
            className={`rounded-lg border p-4 ${
              player.userId === gameState.currentTurnUserId
                ? 'border-gold bg-felt-dark'
                : 'border-felt-line bg-felt-dark/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-parchment">
                {player.username}
                {player.userId === currentUserId && ' (আপনি)'}
              </span>
              <span className="text-xs text-mist">{player.finishedCount}/4 finished</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {player.pieces.map((piece) => (
                <span
                  key={piece.pieceId}
                  className="rounded border border-felt-line px-2 py-1 text-mist"
                >
                  P{piece.pieceId + 1}: {describePiece(piece.stepsTaken)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}