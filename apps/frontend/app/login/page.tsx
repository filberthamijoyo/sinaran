'use client';

import { useState, useCallback, useEffect } from 'react';
import { saveAuth } from '@/lib/auth';
import { apiBase } from '@/lib/authFetch';
import FloatingLabelInput from '@/components/login/FloatingLabelInput';

const DEV_ACCOUNTS = [
  { email: 'factory@sinaran.com', password: 'factory123', role: 'Factory' },
  { email: 'jakarta@sinaran.com', password: 'jakarta123', role: 'Jakarta HQ' },
  { email: 'admin@sinaran.com', password: 'admin123', role: 'Administrator' },
] as const;

function homeRedirect(role: string): string {
  if (role === 'admin') return '/denim/admin/dashboard';
  if (role === 'jakarta') return '/denim/approvals/pending';
  return '/denim';
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const login = useCallback(async (emailVal: string, passwordVal: string) => {
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailVal, password: passwordVal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      saveAuth(data.token, data.user);
      window.location.href = homeRedirect(data.user.role);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') login(email, password);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#1a2f44',
        backgroundImage: "url('/denim_bg.jpg')",
        backgroundSize: 'cover',
        backgroundBlendMode: 'multiply',
        backgroundPosition: 'center',
        display: 'flex',
      }}
    >
      {/* Gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to right, rgba(5,10,18,0.82) 0%, rgba(5,10,18,0.78) 38%, rgba(5,10,18,0.38) 65%, rgba(5,10,18,0.10) 100%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* LEFT: Brand section */}
      <div
        style={{
          position: 'relative',
          width: '40%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          paddingLeft: 80,
          paddingRight: 64,
          zIndex: 4,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateX(0)' : 'translateX(-16px)',
          transition: 'opacity 0.9s ease, transform 0.9s ease',
        }}
      >
        {/* Brand content — self-centers vertically */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
          }}
        >
          {/* Eyebrow — monospace, technical */}
          <p
            style={{
              fontSize: 10,
              fontWeight: 400,
              letterSpacing: '0.48em',
              textTransform: 'uppercase',
              color: 'rgba(139,169,196,0.42)',
              fontFamily: '"DM Mono", "Courier New", monospace',
              marginBottom: 24,
            }}
          >
            PT Triputra Textile Industry
          </p>

          {/* Brand name — serif display, large */}
          <h1
            style={{
              fontSize: 96,
              fontWeight: 600,
              fontStyle: 'normal',
              color: '#FFFFFF',
              letterSpacing: '-0.03em',
              lineHeight: 0.88,
              marginBottom: 32,
              fontFamily: '"Playfair Display", Georgia, "Times New Roman", serif',
              textShadow: '0 4px 80px rgba(0,0,0,0.30)',
            }}
          >
            Sinaran
          </h1>

          {/* Divider — two-tone accent */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <div
              style={{
                width: 40,
                height: 1,
                background: 'rgba(139,169,196,0.70)',
              }}
            />
            <div
              style={{
                width: 3,
                height: 3,
                borderRadius: '50%',
                background: 'rgba(139,169,196,0.55)',
                boxShadow: '0 0 8px rgba(139,169,196,0.30)',
              }}
            />
            <div
              style={{
                width: 20,
                height: 1,
                background: 'rgba(139,169,196,0.25)',
              }}
            />
          </div>

          {/* Tagline — serif italic, muted */}
          <p
            style={{
              fontSize: 14,
              fontWeight: 400,
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.30)',
              lineHeight: 1.85,
              letterSpacing: '0.01em',
              fontFamily: '"Playfair Display", Georgia, "Times New Roman", serif',
            }}
          >
            Precision denim manufacturing.<br />Every meter tracked.
          </p>
        </div>

        {/* Footer — pinned to bottom */}
        <p
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.13)',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            fontFamily: '"DM Mono", "Courier New", monospace',
            paddingBottom: 52,
          }}
        >
          Flow Indo
        </p>
      </div>

      {/* RIGHT: Form section */}
      <div
        style={{
          position: 'relative',
          width: '60%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingLeft: 40,
          paddingRight: 80,
          zIndex: 4,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateX(0)' : 'translateX(24px)',
          transition: 'opacity 0.85s ease 0.12s, transform 0.85s ease 0.12s',
        }}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Glass card */}
          <div
            style={{
              backgroundColor: 'rgba(8,14,24,0.55)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.07)',
              borderTop: '1px solid rgba(29,78,216,0.28)',
              padding: '48px 44px',
              boxShadow: '0 32px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            {/* Form header */}
            <div style={{ marginBottom: 40 }}>
              <div
                style={{
                  width: 36,
                  height: 3,
                  background:
                    'linear-gradient(90deg, rgba(139,169,196,0.70) 0%, rgba(139,169,196,0.20) 100%)',
                  borderRadius: 2,
                  marginBottom: 24,
                }}
              />
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '-0.03em',
                  marginBottom: 6,
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                }}
              >
                Sign in
              </h1>
              <p
                style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.38)',
                  letterSpacing: '0.01em',
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                }}
              >
                Access your workspace
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Email field */}
              <FloatingLabelInput
                label="Email"
                type="email"
                value={email}
                onChange={(v) => {
                  setEmail(v);
                  setError('');
                }}
                onKeyDown={handlePasswordKeyDown}
                autoFocus
                autoComplete="email"
                error={error && !password ? error : undefined}
                icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                }
              />

              {/* Password field */}
              <FloatingLabelInput
                label="Password"
                type="password"
                value={password}
                onChange={(v) => {
                  setPassword(v);
                  setError('');
                }}
                onKeyDown={handlePasswordKeyDown}
                autoComplete="current-password"
                error={password ? error : undefined}
              />

              {/* Error — red glass card */}
              {error && !email && !password && (
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 13,
                    color: 'rgba(252,165,165,0.90)',
                    background: 'rgba(127,29,29,0.25)',
                    border: '1px solid rgba(220,38,38,0.25)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    borderRadius: 10,
                    padding: '11px 14px',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    letterSpacing: '0.01em',
                  }}
                >
                  {error}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                onMouseEnter={() => setBtnHovered(true)}
                onMouseLeave={() => setBtnHovered(false)}
                style={{
                  height: 50,
                  width: '100%',
                  borderRadius: 12,
                  marginTop: 8,
                  background:
                    isLoading
                      ? 'linear-gradient(135deg, #3a6a8a 0%, #1a3050 100%)'
                      : btnHovered
                      ? 'linear-gradient(135deg, #5a8aad 0%, #2a4a6a 100%)'
                      : 'linear-gradient(135deg, #4A7A9B 0%, #1E3A52 100%)',
                  border: '1px solid rgba(139,169,196,0.30)',
                  borderTop: '1px solid rgba(200,220,240,0.20)',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow:
                    isLoading || btnHovered
                      ? '0 6px 24px rgba(0,0,0,0.50)'
                      : '0 4px 16px rgba(0,0,0,0.40)',
                  opacity: isLoading ? 0.55 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'background 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease',
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                }}
              >
                {/* Shimmer sweep */}
                {(btnHovered || isLoading) && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.07) 50%, transparent 60%)',
                      animation: 'shimmer 1.2s ease infinite',
                    }}
                  />
                )}
                {isLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.25)',
                        borderTopColor: '#FFFFFF',
                        animation: 'spin 0.7s linear infinite',
                      }}
                    />
                    Signing in&hellip;
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Demo accounts */}
            <div
              style={{
                marginTop: 32,
                borderTop: '1px solid rgba(255,255,255,0.05)',
                paddingTop: 20,
              }}
            >
              <button
                type="button"
                onClick={() => setShowDemo((v) => !v)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '4px 0',
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.14em',
                    color: 'rgba(255,255,255,0.22)',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                  }}
                >
                  Demo accounts
                </span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  style={{
                    transition: 'transform 0.25s ease',
                    transform: showDemo ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  <path
                    d="M2 4l4 4 4-4"
                    stroke="rgba(255,255,255,0.22)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </button>

              {/* Collapsible list */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: showDemo ? '1fr' : '0fr',
                  transition: 'grid-template-rows 0.28s ease',
                }}
              >
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {DEV_ACCOUNTS.map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => login(acc.email, acc.password)}
                        disabled={isLoading}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '11px 14px',
                          backgroundColor: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          borderRadius: 10,
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                          opacity: isLoading ? 0.45 : 1,
                          transition: 'background-color 0.2s ease, border-color 0.2s ease',
                          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                        }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.backgroundColor = 'rgba(255,255,255,0.07)';
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.borderColor = 'rgba(139,169,196,0.20)';
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.backgroundColor = 'rgba(255,255,255,0.04)';
                          (
                            e.currentTarget as HTMLButtonElement
                          ).style.borderColor = 'rgba(255,255,255,0.07)';
                        }}
                      >
                        <span
                          style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}
                        >
                          {acc.email}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            padding: '3px 9px',
                            borderRadius: 5,
                            backgroundColor: 'rgba(74,122,155,0.18)',
                            color: 'rgba(139,169,196,0.85)',
                            border: '1px solid rgba(74,122,155,0.25)',
                            letterSpacing: '0.04em',
                            fontWeight: 500,
                          }}
                        >
                          {acc.role}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with pulsing green dot */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 24,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#10B981',
                animation: 'pulse-dot 2s ease-in-out infinite',
              }}
            />
            <p
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.15)',
                letterSpacing: '0.04em',
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              }}
            >
              v2.0 &middot; PT Triputra Textile
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
