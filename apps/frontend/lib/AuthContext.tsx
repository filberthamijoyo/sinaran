'use client';

import React, {
  createContext, useContext, useSyncExternalStore, useState, useEffect, ReactNode,
} from 'react';
import { AuthUser, getUser, getToken, clearAuth } from './auth';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  logout: () => void;
  isLoading: boolean;
}

type AuthSnapshot = { user: AuthUser | null; token: string | null };

// Module-level singleton — created once at file import time.
// The _snap object is mutated in-place and always returns the SAME
// frozen reference from getSnapshot(), so useSyncExternalStore never
// sees a "changed" snapshot and won't create infinite render loops.
const SERVER_SNAPSHOT: AuthSnapshot = { user: null, token: null };

const singleton = (() => {
  let _user: AuthUser | null = null;
  let _token: string | null = null;
  let _listeners = new Set<() => void>();
  let _snap: AuthSnapshot = { user: null, token: null };

  return {
    get user() { return _user; },
    get token() { return _token; },
    setAuth(u: AuthUser | null, t: string | null) {
      _user = u;
      _token = t;
      _snap = { user: _user, token: _token };
      _listeners.forEach(l => l());
    },
    subscribe(fn: () => void) {
      _listeners.add(fn);
      return () => { _listeners.delete(fn); };
    },
    getSnapshot(): AuthSnapshot { return _snap; },
  };
})();

const AuthContext = createContext<AuthContextType>({
  user: null, token: null, logout: () => {}, isLoading: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const snap = useSyncExternalStore(
    (fn) => singleton.subscribe(fn),
    () => singleton.getSnapshot(),
    // Server snapshot — MUST be the same cached reference every time
    () => SERVER_SNAPSHOT,
  );

  // Read localStorage on mount — this populates the singleton synchronously
  // so useSyncExternalStore immediately reflects the correct user state.
  // We still track isLoading for RequireAuth to guard against the
  // useSyncExternalStore picking the server snapshot on first render.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = getUser();
      const token = getToken();
      if (user || token) {
        singleton.setAuth(user, token);
      }
    }
    setIsLoading(false);
  }, []);

  const logout = () => {
    clearAuth();
    document.cookie = 'erp_token=; path=/; max-age=0';
    document.cookie = 'erp_user=; path=/; max-age=0';
    singleton.setAuth(null, null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user: snap.user, token: snap.token, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export { getUser, getToken, clearAuth };
export const useAuth = () => useContext(AuthContext);
