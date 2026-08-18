import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuth } from '../features/auth/useAuth';
import { extractErrorMessage } from '../features/auth/authApi';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate('/lobby', { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, 'লগইন ব্যর্থ হয়েছে, আবার চেষ্টা করুন'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="স্বাগতম ফিরে"
      subtitle="টেবিলে বন্ধুরা অপেক্ষা করছে"
      footer={
        <>
          অ্যাকাউন্ট নেই?{' '}
          <Link to="/register" className="font-semibold text-gold-bright hover:underline">
            রেজিস্টার করুন
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="আপনার পাসওয়ার্ড"
          autoComplete="current-password"
          required
        />

        {error && (
          <p role="alert" className="text-sm text-ruby">
            {error}
          </p>
        )}

        <Button type="submit" isLoading={isSubmitting} className="mt-1">
          লগইন করুন
        </Button>
      </form>
    </AuthLayout>
  );
}
