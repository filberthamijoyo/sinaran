export type UserRole = 'factory' | 'jakarta' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  stage?: string;
}

const TOKEN_KEY = 'erp_token';
const USER_KEY = 'erp_user';

export const saveAuth = (token: string, user: AuthUser) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // Mirror to HttpOnly-inaccessible cookies so middleware can read them
  document.cookie = `erp_token=${token}; path=/; SameSite=Lax; max-age=86400`;
  document.cookie = `erp_user=${encodeURIComponent(JSON.stringify(user))}; path=/; SameSite=Lax; max-age=86400`;
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

// getStoredUser — exported alias for use by client-only components
// (avoids calling from server-side code that imports auth.ts)
export const getStoredUser = (): AuthUser | null => getUser();

export const clearAuth = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = 'erp_token=; path=/; max-age=0';
  document.cookie = 'erp_user=; path=/; max-age=0';
};

export const isLoggedIn = (): boolean => !!getToken();
