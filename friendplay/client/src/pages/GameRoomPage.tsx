import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/common/Button';
import { useAuth } from '../features/auth/useAuth';
import { useRoom } from '../features/rooms/useRoom';
import { useSocket } from '../socket/useSocket';
import { useGame } from '../components/game/useGame';
import { LudoGamePanel } from '../components/game/LudoGamePanel';

const GAME_LABELS: Record<string, string> = {
  ludo: 'Ludo',
  spades: 'Spades',
  twenty_nine: '29',
};

export default function GameRoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const { room, closedReason, joinRoom, leaveRoom, clearClosedReason } = useRoom();
  const { gameState, error: gameError, startGame, rollDice, movePiece } = useGame(roomId);

  const [error, setError] = useState('');

  useEffect(() => {
    if (!roomId || !isConnected) return;
    if (room?.id === roomId) return;

    joinRoom(roomId).catch((err) => {
      setError(err instanceof Error ? err.message : 'Room-এ ঢোকা যায়নি');
    });
  }, [roomId, isConnected, room?.id, joinRoom]);

  useEffect(() => {
    if (closedReason) {
      clearClosedReason();
      navigate('/lobby', { replace: true });
    }
  }, [closedReason, clearClosedReason, navigate]);

  async function handleLeave() {
    await leaveRoom();
    navigate('/lobby', { replace: true });
  }

  if (error) {
    return (
      <AppShell>
        <p className="text-ruby">{error}</p>
        <Button onClick={() => navigate('/lobby')} className="mt-4 w-auto px-5">
          লবিতে ফিরে যান
        </Button>
      </AppShell>
    );
  }

  if (!room || room.id !== roomId) {
    return (
      <AppShell>
        <p className="text-mist">Room-এ ঢুকছি…</p>
      </AppShell>
    );
  }

  const myPlayer = room.players.find((p) => p.userId === user?.id);
  const canStart = myPlayer?.isHost && room.status === 'waiting' && room.players.length >= 2;

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-parchment">
            {GAME_LABELS[room.gameType] ?? room.gameType}
          </h1>
          <p className="mt-1 font-mono text-sm text-gold-bright">Room Code: {room.id}</p>
        </div>
        <Button onClick={handleLeave} variant="ghost" className="w-auto px-5">
          Room ছাড়ুন
        </Button>
      </div>

      {room.status === 'waiting' && (
        <>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: room.maxPlayers }).map((_, seat) => {
              const player = room.players.find((p) => p.seat === seat);
              return (
                <div
                  key={seat}
                  className="flex flex-col items-center gap-2 rounded-xl border border-felt-line bg-felt-dark p-5"
                >
                  {player ? (
                    <>
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          player.presence === 'connected' ? 'bg-gold-bright' : 'bg-ruby'
                        }`}
                        title={player.presence === 'connected' ? 'সংযুক্ত' : 'সংযোগ বিচ্ছিন্ন'}
                      />
                      <span className="font-mono text-sm text-parchment">
                        {player.username}
                        {player.userId === user?.id && ' (আপনি)'}
                      </span>
                      {player.isHost && <span className="text-xs text-gold-bright">হোস্ট</span>}
                    </>
                  ) : (
                    <span className="text-sm text-mist">খালি সিট</span>
                  )}
                </div>
              );
            })}
          </div>

          {canStart && (
            <Button onClick={startGame} className="mt-6 w-auto px-6">
              Game শুরু করুন
            </Button>
          )}
          {!canStart && myPlayer?.isHost && room.players.length < 2 && (
            <p className="mt-6 text-sm text-mist">শুরু করতে অন্তত ২ জন খেলোয়াড় লাগবে।</p>
          )}
          {!myPlayer?.isHost && (
            <p className="mt-6 text-sm text-mist">Host game শুরু করার অপেক্ষায়…</p>
          )}
        </>
      )}

      {room.status !== 'waiting' && gameState && user && (
        <div className="mt-8">
          <LudoGamePanel
            gameState={gameState}
            currentUserId={user.id}
            error={gameError}
            onRollDice={rollDice}
            onMovePiece={movePiece}
          />
        </div>
      )}

      {room.status !== 'waiting' && !gameState && (
        <p className="mt-8 text-sm text-mist">Game state লোড হচ্ছে…</p>
      )}
    </AppShell>
  );
}