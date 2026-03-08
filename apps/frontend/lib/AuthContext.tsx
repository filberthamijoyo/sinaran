'use client';

import React, {
  createContext, useContext, useEffect, useState, ReactNode
} from 'react';
import { AuthUser, getUser, getToken, clearAuth } from './auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null, token: null, logout: () => {}, isLoading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Only runs on client after hydration
    const storedUser = getUser();
    const storedToken = getToken();
    setUser(storedUser);
    setToken(storedToken);
    setIsLoading(false);
  }, []);

  const logout = () => {
    clearAuth();
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
