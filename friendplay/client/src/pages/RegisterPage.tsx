import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuth } from '../features/auth/useAuth';
import { extractErrorMessage } from '../features/auth/authApi';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await register({ username, email, password });
      navigate('/lobby', { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, 'রেজিস্ট্রেশন ব্যর্থ হয়েছে, আবার চেষ্টা করুন'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="নতুন অ্যাকাউন্ট খুলুন"
      subtitle="একটা username বেছে নিন যা অন্যরা দেখবে"
      footer={
        <>
          আগে থেকেই অ্যাকাউন্ট আছে?{' '}
          <Link to="/login" className="font-semibold text-gold-bright hover:underline">
            লগইন করুন
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="যেমন: rahim_gamer"
          autoComplete="username"
          minLength={3}
          maxLength={20}
          required
        />
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
          placeholder="কমপক্ষে ৮ ক্যারেক্টার"
          autoComplete="new-password"
          minLength={8}
          required
        />

        {error && (
          <p role="alert" className="text-sm text-ruby">
            {error}
          </p>
        )}

        <Button type="submit" isLoading={isSubmitting} className="mt-1">
          অ্যাকাউন্ট তৈরি করুন
        </Button>
      </form>
    </AuthLayout>
  );
}
