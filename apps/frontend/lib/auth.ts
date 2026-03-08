export type UserRole = 'bandung' | 'jakarta' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

const TOKEN_KEY = 'erp_token';
const USER_KEY = 'erp_user';

export const saveAuth = (token: string, user: AuthUser) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const getUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export const clearAuth = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isLoggedIn = (): boolean => !!getToken();
