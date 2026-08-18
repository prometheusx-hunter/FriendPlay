import { useParams } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';

// Phase 2/3-এ এখানে WebSocket room join আর game board বসবে
export default function GameRoomPage() {
  const { roomId } = useParams();

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold text-parchment">
        Room: {roomId}
      </h1>
      <p className="mt-2 text-mist">Game board এখানে Phase 3-এ যোগ হবে।</p>
    </AppShell>
  );
}
