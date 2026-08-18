import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth';

const navLinks = [
  { to: '/lobby', label: 'লবি' },
  { to: '/leaderboard', label: 'লিডারবোর্ড' },
  { to: '/profile', label: 'প্রোফাইল' },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-felt text-parchment">
      <header className="border-b border-felt-line">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link to="/lobby" className="font-display text-lg font-semibold text-parchment">
            FriendPlay
          </Link>

          <nav className="flex items-center gap-5 text-sm">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className="text-mist hover:text-gold-bright">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 text-sm">
            <span className="font-mono text-gold-bright">{user?.username}</span>
            <button
              onClick={handleLogout}
              className="rounded-md border border-felt-line px-3 py-1.5 text-mist hover:border-ruby hover:text-ruby"
            >
              লগআউট
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">{children}</main>
    </div>
  );
}
