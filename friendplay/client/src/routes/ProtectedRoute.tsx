import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // /me চেক শেষ না হওয়া পর্যন্ত কিছু দেখানো হচ্ছে না — এতে login পেজে ফ্ল্যাশ হবে না
    return (
      <div className="flex min-h-screen items-center justify-center bg-felt text-mist">
        লোড হচ্ছে…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
