'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveAuth } from '../../lib/auth';
import { apiBase } from '../../lib/authFetch';
import { useAuth } from '../../lib/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Factory, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const DEV_ACCOUNTS = [
  { email: 'factory@sinaran.com', password: 'factory123', role: 'Factory' },
  { email: 'jakarta@sinaran.com', password: 'jakarta123', role: 'Jakarta HQ' },
  { email: 'admin@sinaran.com', password: 'admin123', role: 'Administrator' },
];

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && user) router.replace('/denim');
  }, [isLoading, user, router]);

  // Show loading on server and during hydration to prevent mismatch
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="flex items-center gap-2 text-zinc-400">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  // Already logged in - redirecting
  if (user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      saveAuth(data.token, data.user);
      // Use window.location for reliable full-page redirect
      window.location.href = '/denim';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (acc: typeof DEV_ACCOUNTS[0]) => {
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: acc.email, password: acc.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      saveAuth(data.token, data.user);
      // Use window.location for reliable full-page redirect
      window.location.href = '/denim';
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-zinc-950">

      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between
        p-12 bg-zinc-900 border-r border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center
            justify-center">
            <Factory className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold">Sinaran ERP</p>
            <p className="text-zinc-500 text-xs">PT Triputra Textile Industry</p>
          </div>
        </div>

        <div>
          <blockquote className="text-zinc-300 text-2xl font-light
            leading-relaxed tracking-tight">
            "From cotton to finished denim — <br />
            every meter tracked."
          </blockquote>
          <p className="mt-4 text-zinc-600 text-sm">
            Denim production pipeline management system.
          </p>
        </div>

        <div className="flex gap-8 text-zinc-600 text-sm">
          <div>
            <p className="text-2xl font-semibold text-zinc-300">4</p>
            <p>Production stages</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-zinc-300">3</p>
            <p>Role levels</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-zinc-300">1</p>
            <p>Source of truth</p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center
        px-8 bg-zinc-950">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center
              justify-center">
              <Factory className="w-4 h-4 text-white" />
            </div>
            <p className="text-white font-semibold">Sinaran ERP</p>
          </div>

          <h2 className="text-white text-2xl font-semibold
            tracking-tight mb-1">
            Sign in
          </h2>
          <p className="text-zinc-500 text-sm mb-8">
            Enter your credentials to access the system.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email"
                className="text-zinc-300 text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@sinaran.com"
                required
                autoFocus
                className="bg-zinc-900 border-zinc-800 text-white
                  placeholder:text-zinc-600 focus:border-blue-500
                  focus:ring-blue-500/20 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password"
                className="text-zinc-300 text-sm">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-zinc-900 border-zinc-800 text-white
                  placeholder:text-zinc-600 focus:border-blue-500
                  focus:ring-blue-500/20 h-10"
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-500/10 border
                border-red-500/20 px-3 py-2.5">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-blue-600 hover:bg-blue-500
                text-white font-medium"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</>
                : 'Sign in'}
            </Button>
          </form>

          {/* Dev quick login */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-zinc-800" />
              <p className="text-zinc-600 text-xs">Dev accounts</p>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>
            <div className="space-y-1.5">
              {DEV_ACCOUNTS.map(acc => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => quickLogin(acc)}
                  disabled={loading}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2',
                    'rounded-md border border-zinc-800 bg-zinc-900/50',
                    'hover:bg-zinc-800/70 hover:border-zinc-700',
                    'transition-colors duration-150 group disabled:opacity-50'
                  )}
                >
                  <span className="text-zinc-400 text-xs group-hover:text-zinc-300">
                    {acc.email}
                  </span>
                  <span className="text-zinc-600 text-xs">{acc.role}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
