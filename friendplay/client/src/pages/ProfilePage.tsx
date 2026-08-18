import { AppShell } from '../components/layout/AppShell';
import { useAuth } from '../features/auth/useAuth';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold text-parchment">প্রোফাইল</h1>
      <div className="mt-6 max-w-sm rounded-xl border border-felt-line bg-felt-dark p-6">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-mist">Username</dt>
            <dd className="font-mono text-parchment">{user?.username}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-mist">Email</dt>
            <dd className="font-mono text-parchment">{user?.email}</dd>
          </div>
        </dl>
      </div>
      <p className="mt-4 text-sm text-mist">
        Match history ও statistics Phase 4-এ যোগ হবে।
      </p>
    </AppShell>
  );
}
