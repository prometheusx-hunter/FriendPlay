import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAuth } from '../features/auth/useAuth';
import { useRoom } from '../features/rooms/useRoom';
import { useSocket } from '../socket/useSocket';
import { socket } from '../socket/socket';
import { listRoomsRequest } from '../features/rooms/roomsApi';
import type { GameType, RoomState } from '../socket/types';

const GAME_LABELS: Record<GameType, string> = {
  ludo: 'Ludo',
  spades: 'Spades',
  twenty_nine: '29',
};

export default function LobbyPage() {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const { createRoom, joinRoom } = useRoom();
  const navigate = useNavigate();

  const [openRooms, setOpenRooms] = useState<RoomState[]>([]);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    listRoomsRequest().then(setOpenRooms).catch(() => setOpenRooms([]));
  }, []);

  useEffect(() => {
    function handleLobbyUpdate(rooms: RoomState[]) {
      setOpenRooms(rooms);
    }
    socket.on('lobby:update', handleLobbyUpdate);
    return () => {
      socket.off('lobby:update', handleLobbyUpdate);
    };
  }, []);

  async function handleCreate(gameType: GameType) {
    setError('');
    setIsBusy(true);
    try {
      const room = await createRoom(gameType);
      navigate(`/room/${room.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Room তৈরি করা যায়নি');
    } finally {
      setIsBusy(false);
    }
  }

  async function handleJoinByCode() {
    if (!joinCode.trim()) return;
    setError('');
    setIsBusy(true);
    try {
      const room = await joinRoom(joinCode.trim().toUpperCase());
      navigate(`/room/${room.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Room-এ ঢোকা যায়নি');
    } finally {
      setIsBusy(false);
    }
  }

  async function handleJoinFromList(roomId: string) {
    setError('');
    setIsBusy(true);
    try {
      const room = await joinRoom(roomId);
      navigate(`/room/${room.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Room-এ ঢোকা যায়নি');
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-parchment">
          স্বাগতম, {user?.username}
        </h1>
        <span
          className={`font-mono text-xs ${isConnected ? 'text-gold-bright' : 'text-ruby'}`}
        >
          {isConnected ? '● সংযুক্ত' : '○ সংযোগ হচ্ছে…'}
        </span>
      </div>

      {error && <p className="mt-3 text-sm text-ruby">{error}</p>}

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold text-parchment">নতুন Room</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {(Object.keys(GAME_LABELS) as GameType[]).map((gameType) => (
            <Button
              key={gameType}
              onClick={() => handleCreate(gameType)}
              disabled={isBusy || !isConnected}
              className="w-auto px-6"
            >
              {GAME_LABELS[gameType]} তৈরি করুন
            </Button>
          ))}
        </div>
      </section>

      <section className="mt-8 max-w-xs">
        <h2 className="font-display text-lg font-semibold text-parchment">Code দিয়ে Join</h2>
        <div className="mt-3 flex items-end gap-2">
          <Input
            label="Room Code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="যেমন: A7K2P9"
            maxLength={6}
          />
          <Button
            onClick={handleJoinByCode}
            disabled={isBusy || !isConnected}
            className="w-auto px-5"
          >
            Join
          </Button>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold text-parchment">খোলা Room-সমূহ</h2>
        {openRooms.length === 0 ? (
          <p className="mt-3 text-sm text-mist">এখন কোনো room খোলা নেই — একটা তৈরি করুন।</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {openRooms.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-felt-line bg-felt-dark px-4 py-3"
              >
                <div>
                  <span className="font-mono text-gold-bright">{r.id}</span>
                  <span className="ml-3 text-sm text-mist">
                    {GAME_LABELS[r.gameType]} · {r.players.length}/{r.maxPlayers} জন
                  </span>
                </div>
                <Button
                  onClick={() => handleJoinFromList(r.id)}
                  disabled={isBusy || !isConnected}
                  variant="ghost"
                  className="w-auto px-4 py-1.5"
                >
                  Join
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}