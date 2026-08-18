import type { ReactNode } from 'react';
import { DiceMark } from '../common/DiceMark';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-felt px-4 py-10">
      {/* felt-এর উপর মৃদু vignette, যাতে টেবিলের মতো depth বোঝা যায় */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 20%, rgba(211,164,74,0.08), transparent 55%)',
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <DiceMark />
          <div>
            <h1 className="font-display text-2xl font-semibold text-parchment">
              FriendPlay
            </h1>
            <p className="mt-1 text-sm text-mist">বন্ধুদের সাথে Ludo, Spades ও 29</p>
          </div>
        </div>

        <div className="rounded-2xl border border-felt-line bg-parchment p-7 shadow-2xl">
          <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
          <p className="mt-1 text-sm text-ink/60">{subtitle}</p>

          <div className="mt-6">{children}</div>
        </div>

        <div className="mt-5 text-center text-sm text-mist">{footer}</div>
      </div>
    </div>
  );
}
