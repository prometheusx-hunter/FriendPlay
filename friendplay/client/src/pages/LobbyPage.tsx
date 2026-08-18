import { AppShell } from '../components/layout/AppShell';
import { useAuth } from '../features/auth/useAuth';

// Phase 2-এ এখানে room creation/join বসবে (WebSocket দিয়ে)
export default function LobbyPage() {
  const { user } = useAuth();

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold text-parchment">
        স্বাগতম, {user?.username}
      </h1>
      <p className="mt-2 text-mist">
        এখান থেকে খেলা শুরু করতে পারবেন — room তৈরি বা join করার অংশটা এখনো তৈরি হয়নি
        (Phase 2)।
      </p>
    </AppShell>
  );
}
