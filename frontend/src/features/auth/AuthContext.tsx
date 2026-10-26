// Auth context — manages JWT token and current user state
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import api from '@/lib/api';
import type { AuthUser } from '@/types';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (...roles: AuthUser['roles']) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ctn_token'));
  const [isLoading, setIsLoading] = useState(true);

  // On mount, fetch /me if token exists
  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    api
      .get<AuthUser>('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('ctn_token');
        setToken(null);
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ access_token: string }>('/auth/login', { email, password });
    const { access_token } = res.data;
    localStorage.setItem('ctn_token', access_token);
    setToken(access_token);
    const meRes = await api.get<AuthUser>('/auth/me');
    setUser(meRes.data);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('ctn_token');
      setToken(null);
      setUser(null);
    }
  };

  const hasRole = (...roles: AuthUser['roles']) =>
    !!user && roles.some((r) => user.roles.includes(r));

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
