/**
 * MEDYX — authentication context.
 *
 * Holds session state and exposes actions. Deliberately free of any capsule /
 * animation concerns so the visual layer stays swappable.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi, type AuthUser, type SignupPayload } from './api';

interface AuthContextValue {
  user: AuthUser | null;
  /** True until the initial /auth/me check resolves. */
  initialising: boolean;
  login: (email: string, password: string, expectedRole?: 'patient' | 'pharmacy') => Promise<AuthUser>;
  signup: (payload: SignupPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initialising, setInitialising] = useState(true);

  // Session persistence: restore on mount from the HttpOnly cookie.
  useEffect(() => {
    let cancelled = false;
    authApi
      .me()
      .then((u) => !cancelled && setUser(u))
      .catch(() => !cancelled && setUser(null))
      .finally(() => !cancelled && setInitialising(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback<AuthContextValue['login']>(
    async (email, password, expectedRole) => {
      const { user: next } = await authApi.login({ email, password, expectedRole });
      setUser(next);
      return next;
    },
    [],
  );

  const signup = useCallback<AuthContextValue['signup']>(async (payload) => {
    const { user: next } = await authApi.signup(payload);
    setUser(next);
    return next;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {});
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    setUser(await authApi.me());
  }, []);

  const value = useMemo(
    () => ({ user, initialising, login, signup, logout, refresh }),
    [user, initialising, login, signup, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
