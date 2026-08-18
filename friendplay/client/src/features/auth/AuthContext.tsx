import { createContext, useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  loginRequest,
  logoutRequest,
  meRequest,
  registerRequest,
} from './authApi';
import type { LoginPayload, RegisterPayload, User } from './authApi';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean; // প্রথমবার /me চেক করার সময়কার loading state
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Page reload হলেও cookie-তে valid token থাকলে session ফিরিয়ে আনা
  useEffect(() => {
    meRequest()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const loggedInUser = await loginRequest(payload);
    setUser(loggedInUser);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const newUser = await registerRequest(payload);
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
