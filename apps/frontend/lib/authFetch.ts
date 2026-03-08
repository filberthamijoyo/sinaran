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

export const authFetch = async (
  path: string,
  options: RequestInit = {}
): Promise<any> => {
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
  if (!text) return null;
  const data = JSON.parse(text);
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
};
