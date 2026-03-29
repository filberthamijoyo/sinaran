import { getToken, clearAuth } from './auth';

const getApiUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost';
  const port = process.env.NEXT_PUBLIC_API_PORT;
  const isProduction =
    baseUrl.startsWith('https://') ||
    (baseUrl.startsWith('http://') && !baseUrl.includes('localhost'));
  const effectivePort = port || (isProduction ? '' : '3001');
  const base = baseUrl.replace(/\/$/, '');
  return effectivePort ? `${base}:${effectivePort}/api` : `${base}/api`;
};

export const apiBase = getApiUrl();

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  [key: string]: unknown;
}

export const authFetch = async <T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${apiBase}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearAuth();
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  const text = await res.text();
  if (!text) return null as T;
  const data: ApiResponse<T> = JSON.parse(text);
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data as T;
};
