'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveAuth } from '../../lib/auth';
import { apiBase } from '../../lib/authFetch';
import { useAuth } from '../../lib/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Loader2 } from 'lucide-react';
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && user) router.replace('/denim');
  }, [isLoading, user, router]);

  if (!mounted || isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#E0E5EC' }}
      >
        <div className="flex items-center gap-2" style={{ color: '#6B7280' }}>
          <div className="relative">
            <div className="w-6 h-6 rounded-full animate-spin"
              style={{
                border: '2px solid rgb(163 177 198 / 0.6)',
                borderTopColor: '#6C63FF',
              }}
            />
          </div>
        </div>
      </div>
    );
  }

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
      window.location.href = '/denim';
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: '#E0E5EC' }}
    >
      {/* Left panel - with neumorphic card style */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: '#E0E5EC',
          boxShadow: 'inset -2px 0 8px rgb(163 177 198 / 0.3)',
        }}
      >
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage: 'linear-gradient(rgba(108, 99, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(108, 99, 255, 1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />

        {/* Logo - inset well */}
        <div className="relative flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              background: '#E0E5EC',
              boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
            }}
          >
            <span
              className="text-lg font-bold"
              style={{
                color: '#6C63FF',
                fontFamily: 'var(--font-mono)',
              }}
            >
              S
            </span>
          </div>
          <div>
            <p className="text-base font-semibold tracking-wide" style={{ color: '#3D4852' }}>SINARAN ERP</p>
            <p className="text-[10px] tracking-widest uppercase" style={{ color: '#9CA3AF' }}>PT Triputra Textile</p>
          </div>
        </div>

        {/* Center quote */}
        <div className="relative">
          <p className="text-4xl font-light leading-snug tracking-tight mb-6" style={{ color: '#3D4852' }}>
            "From cotton<br/>to finished denim —<br/>
            <span style={{ color: '#6C63FF', fontWeight: '500' }}>every meter tracked.</span>"
          </p>
          <p className="text-sm max-w-xs" style={{ color: '#6B7280' }}>Denim production pipeline management system.</p>
        </div>

        {/* Bottom stats */}
        <div className="relative flex gap-12">
          {[
            { n: '4', label: 'Production stages' },
            { n: '3', label: 'Role levels' },
            { n: '1', label: 'Source of truth' },
          ].map(({ n, label }) => (
            <div key={label}>
              <p className="text-3xl font-semibold" style={{ color: '#3D4852', fontFamily: 'var(--font-mono)' }}>{n}</p>
              <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 relative z-10">
        {/* Neumorphic centered card */}
        <div
          className="w-full max-w-sm space-y-8"
          style={{
            background: '#E0E5EC',
            borderRadius: '32px',
            padding: '40px',
            boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
          }}
        >

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: '#E0E5EC',
                boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
              }}
            >
              <span className="text-lg font-bold" style={{ color: '#6C63FF' }}>S</span>
            </div>
            <div>
              <p className="text-base font-semibold tracking-wide" style={{ color: '#3D4852' }}>SINARAN ERP</p>
              <p className="text-[10px] tracking-widest uppercase" style={{ color: '#9CA3AF' }}>PT Triputra Textile</p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3" style={{ color: '#3D4852' }}>
              Welcome back
            </h2>
            <p className="text-base" style={{ color: '#6B7280' }}>
              Enter your credentials to access the system.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium"
                style={{ color: '#6B7280' }}
              >
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
                style={{
                  background: '#E0E5EC',
                  border: 'none',
                  borderRadius: '16px',
                  boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                  color: '#3D4852',
                  padding: '12px 16px',
                  fontSize: '14px',
                  height: '48px',
                }}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium"
                style={{ color: '#6B7280' }}
              >
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  background: '#E0E5EC',
                  border: 'none',
                  borderRadius: '16px',
                  boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                  color: '#3D4852',
                  padding: '12px 16px',
                  fontSize: '14px',
                  height: '48px',
                }}
              />
            </div>

            {error && (
              <div
                className="rounded-[16px] px-4 py-3.5 animate-fade-in-up"
                style={{
                  background: '#E0E5EC',
                  boxShadow: 'inset 6px 6px 10px rgb(220 38 38 / 0.1), inset -6px -6px 10px rgba(255,255,255,0.5)',
                }}
              >
                <p className="text-sm" style={{ color: '#DC2626' }}>{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              style={{
                background: '#6C63FF',
                borderRadius: '16px',
                boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
                color: '#fff',
                border: 'none',
                height: '48px',
                width: '100%',
                fontWeight: '500',
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign in'}
              </span>
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '1px solid rgb(163 177 198 / 0.3)' }} />
            </div>
            <div className="relative flex justify-center text-xs">
              <span
                className="px-4"
                style={{ background: '#E0E5EC', color: '#9CA3AF' }}
              >
                Demo accounts
              </span>
            </div>
          </div>

          {/* Dev quick login */}
          <div className="grid gap-2.5">
            {DEV_ACCOUNTS.map((acc, i) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => quickLogin(acc)}
                disabled={loading}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3.5 rounded-[16px] transition-all duration-200',
                  'disabled:opacity-50'
                )}
                style={{
                  background: '#E0E5EC',
                  boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
                  color: '#6B7280',
                  border: 'none',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-[16px] flex items-center justify-center"
                    style={{
                      background: '#E0E5EC',
                      boxShadow: 'inset 4px 4px 8px rgb(163 177 198 / 0.6), inset -4px -4px 8px rgba(255,255,255,0.5)',
                    }}
                  >
                    <span
                      className="text-sm font-bold"
                      style={{
                        color: acc.role === 'Factory' ? '#6C63FF' : acc.role === 'Jakarta HQ' ? '#6B7280' : '#D97706',
                      }}
                    >
                      {acc.role.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm" style={{ color: '#6B7280' }}>
                    {acc.email}
                  </span>
                </div>
                <span className="text-xs" style={{ color: '#9CA3AF' }}>{acc.role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
