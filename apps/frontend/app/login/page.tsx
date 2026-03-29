'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { saveAuth } from '@/lib/auth';
import { apiBase } from '@/lib/authFetch';

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
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
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

  const emailFilled = email.length > 0;
  const passwordFilled = password.length > 0;

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: '#1a2f44',
      backgroundImage: "url('/denim_bg.jpg')",
      backgroundSize: 'cover',
      backgroundBlendMode: 'multiply',
      backgroundPosition: 'center',
    }}>
      {/* Gradient overlay — dark left, bright right */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to right, rgba(5,10,18,0.80) 0%, rgba(5,10,18,0.50) 25%, rgba(5,10,18,0.10) 50%, transparent 75%)',
        pointerEvents: 'none', zIndex: 2,
      }} />

      {/* LEFT: Brand section */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: '25%', height: '100%',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'flex-start',
        paddingLeft: 72, paddingRight: 36,
        zIndex: 4,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateX(0)' : 'translateX(-16px)',
        transition: 'opacity 0.8s ease, transform 0.8s ease',
      }}>
        {/* Top — ERP company label */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          marginBottom: 40,
        }}>
          {/* Shine line extending left */}
          <div style={{ width: 40, height: 1, background: 'linear-gradient(to right, rgba(139,169,196,0.15), rgba(139,169,196,0.50))' }} />
          {/* Shine dot */}
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(139,169,196,0.60)', boxShadow: '0 0 8px rgba(139,169,196,0.50)' }} />
          {/* Label */}
          <span style={{
            fontSize: 9, fontWeight: 500,
            letterSpacing: '0.42em', textTransform: 'uppercase',
            color: 'rgba(139,169,196,0.70)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            textShadow: '0 0 20px rgba(139,169,196,0.30)',
          }}>Flow Indo</span>
        </div>

        {/* Heading — Sinaran */}
        <h1 style={{
          fontSize: 80, fontWeight: 800,
          color: '#FFFFFF',
          letterSpacing: '-0.04em', lineHeight: 0.85,
          marginBottom: 10,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textShadow: '0 2px 32px rgba(0,0,0,0.30)',
        }}>Sinaran</h1>

        {/* Shine streaks under heading */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
          {/* Bright main streak */}
          <div style={{ width: 64, height: 1, background: 'linear-gradient(to right, rgba(139,169,196,0.70), rgba(139,169,196,0.15))' }} />
          {/* Glow dot */}
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(139,169,196,0.75)', boxShadow: '0 0 10px rgba(139,169,196,0.60)' }} />
          {/* Faint secondary streak */}
          <div style={{ width: 24, height: 1, background: 'rgba(139,169,196,0.20)' }} />
        </div>

        {/* Tagline */}
        <p style={{
          fontSize: 13, fontWeight: 400,
          color: 'rgba(255,255,255,0.55)',
          lineHeight: 1.85, marginBottom: 36,
          letterSpacing: '0.01em',
          maxWidth: 225,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>Precision denim manufacturing, every meter tracked.</p>

        {/* Bottom — shine accent before company */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 28, height: 1, background: 'rgba(139,169,196,0.30)' }} />
          <div style={{ width: 2, height: 2, borderRadius: '50%', background: 'rgba(139,169,196,0.40)' }} />
          <div style={{ width: 12, height: 1, background: 'rgba(139,169,196,0.15)' }} />
        </div>

        {/* Company */}
        <p style={{
          fontSize: 10,
          color: 'rgba(255,255,255,0.22)',
          letterSpacing: '0.08em',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>PT Triputra Textile Industry</p>
      </div>

      {/* RIGHT: Form section */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '75%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 4,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s',
      }}>
        <div style={{
          width: '100%', maxWidth: 420,
          padding: '0 40px',
        }}>
          {/* Card */}
          <div style={{
            backgroundColor: 'rgba(8,14,24,0.55)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.07)',
            borderTop: '1px solid rgba(139,169,196,0.25)',
            padding: '48px 44px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}>
            {/* Form header — minimal, no text clutter */}
            <div style={{ marginBottom: 40 }}>
              <div style={{
                width: 36, height: 3,
                background: 'linear-gradient(90deg, rgba(139,169,196,0.70) 0%, rgba(139,169,196,0.20) 100%)',
                borderRadius: 2,
                marginBottom: 24,
              }} />
              <h1 style={{
                fontSize: 26, fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.03em',
                marginBottom: 6,
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}>Sign in</h1>
              <p style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.38)',
                letterSpacing: '0.01em',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}>Access your workspace</p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Email field */}
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: 'block',
                  fontSize: 11, fontWeight: 600,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: emailFocused || emailFilled
                    ? 'rgba(139,169,196,0.90)'
                    : 'rgba(255,255,255,0.38)',
                  marginBottom: 10,
                  transition: 'color 0.25s ease',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    onKeyDown={handlePasswordKeyDown}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    style={{
                      width: '100%',
                      height: 50,
                      boxSizing: 'border-box',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${emailFocused ? 'rgba(139,169,196,0.55)' : 'rgba(255,255,255,0.09)'}`,
                      borderRadius: 12,
                      color: '#FFFFFF',
                      fontSize: 14,
                      padding: '0 16px 0 16px',
                      outline: 'none',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      transition: 'border-color 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease',
                      boxShadow: emailFocused
                        ? '0 0 0 3px rgba(139,169,196,0.10), inset 0 1px 3px rgba(0,0,0,0.20)'
                        : 'inset 0 1px 3px rgba(0,0,0,0.15)',
                    }}
                  />
                </div>
              </div>

              {/* Password field */}
              <div style={{ marginBottom: 8 }}>
                <label style={{
                  display: 'block',
                  fontSize: 11, fontWeight: 600,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: passwordFocused || passwordFilled
                    ? 'rgba(139,169,196,0.90)'
                    : 'rgba(255,255,255,0.38)',
                  marginBottom: 10,
                  transition: 'color 0.25s ease',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    onKeyDown={handlePasswordKeyDown}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    style={{
                      width: '100%',
                      height: 50,
                      boxSizing: 'border-box',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${passwordFocused ? 'rgba(139,169,196,0.55)' : 'rgba(255,255,255,0.09)'}`,
                      borderRadius: 12,
                      color: '#FFFFFF',
                      fontSize: 14,
                      padding: '0 16px',
                      outline: 'none',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      transition: 'border-color 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease',
                      boxShadow: passwordFocused
                        ? '0 0 0 3px rgba(139,169,196,0.10), inset 0 1px 3px rgba(0,0,0,0.20)'
                        : 'inset 0 1px 3px rgba(0,0,0,0.15)',
                    }}
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  marginTop: 14,
                  fontSize: 13,
                  color: '#FCA5A5',
                  background: 'rgba(220,38,38,0.08)',
                  border: '1px solid rgba(220,38,38,0.20)',
                  borderRadius: 10,
                  padding: '11px 14px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  letterSpacing: '0.01em',
                }}>{error}</div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                onMouseEnter={() => setBtnHovered(true)}
                onMouseLeave={() => setBtnHovered(false)}
                style={{
                  height: 50, width: '100%',
                  borderRadius: 12,
                  marginTop: 24,
                  background: isLoading
                    ? 'linear-gradient(135deg, #3a6a8a 0%, #1a3050 100%)'
                    : btnHovered
                      ? 'linear-gradient(135deg, #5a8aad 0%, #2a4a6a 100%)'
                      : 'linear-gradient(135deg, #4A7A9B 0%, #1E3A52 100%)',
                  border: '1px solid rgba(139,169,196,0.30)',
                  borderTop: '1px solid rgba(200,220,240,0.20)',
                  color: '#FFFFFF',
                  fontSize: 14, fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: isLoading || btnHovered
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
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                {/* Shimmer overlay on hover */}
                {btnHovered && !isLoading && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.07) 50%, transparent 60%)',
                    animation: 'shimmer 1.2s ease infinite',
                  }} />
                )}
                {isLoading ? (
                  <>
                    <span style={{
                      display: 'inline-block',
                      width: 14, height: 14,
                      borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.25)',
                      borderTopColor: '#FFFFFF',
                      animation: 'spin 0.7s linear infinite',
                      marginRight: 10,
                      flexShrink: 0,
                    }} />
                    Authenticating…
                  </>
                ) : 'Sign In'}
              </button>
              <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes shimmer {
                  0%   { transform: translateX(-100%); }
                  100% { transform: translateX(100%); }
                }
              `}</style>
            </form>

            {/* Demo accounts toggle */}
            <div style={{
              marginTop: 32,
              borderTop: '1px solid rgba(255,255,255,0.05)',
              paddingTop: 20,
            }}>
              <button
                type="button"
                onClick={() => setShowDemo(d => !d)}
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
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                <span style={{
                  fontSize: 11,
                  letterSpacing: '0.14em',
                  color: 'rgba(255,255,255,0.22)',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                }}>Demo accounts</span>
                <svg
                  width="12" height="12"
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

              {showDemo && (
                <div style={{
                  marginTop: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  animation: 'fadeIn 0.2s ease',
                }}>
                  {DEV_ACCOUNTS.map(acc => (
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
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.07)';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,169,196,0.20)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.04)';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)';
                      }}
                    >
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{acc.email}</span>
                      <span style={{
                        fontSize: 10,
                        padding: '3px 9px', borderRadius: 5,
                        backgroundColor: 'rgba(74,122,155,0.18)',
                        color: 'rgba(139,169,196,0.85)',
                        border: '1px solid rgba(74,122,155,0.25)',
                        letterSpacing: '0.04em',
                        fontWeight: 500,
                      }}>{acc.role}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer — subtle */}
          <p style={{
            textAlign: 'center',
            marginTop: 24,
            fontSize: 11,
            color: 'rgba(255,255,255,0.15)',
            letterSpacing: '0.04em',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}>PT Triputra Textile Industry · v2.0</p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
