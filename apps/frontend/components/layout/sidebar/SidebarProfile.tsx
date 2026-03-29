'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Settings, LogOut } from 'lucide-react';
import { T } from './tokens';

type Props = {
  userName?: string;
  email?: string;
  role: string;
  onLogout: () => void;
};

const ROLE_LABELS: Record<string, string> = {
  admin:   'Administrator',
  factory: 'Factory Floor',
  jakarta: 'Jakarta HQ',
};

export default function SidebarProfile({ userName, email, role, onLogout }: Props) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [menuOpen]);

  const cfg = T.role[role as keyof typeof T.role] ?? T.role.admin;
  const roleLabel = ROLE_LABELS[role] ?? role;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Avatar + info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Avatar circle */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          background: T.avatarBg,
          boxShadow: `0 0 0 2px rgba(255,255,255,0.25)`,
          fontSize: 13, fontWeight: 700,
          color: T.text,
        }}>
          {(userName || role || 'U')[0].toUpperCase()}
        </div>

        {/* Name + email */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 13, fontWeight: 700, color: T.text,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            lineHeight: 1.3,
          }}>
            {userName || role || 'User'}
          </p>
          {email && (
            <p style={{
              fontSize: 10.5, color: T.textMid,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              marginTop: 1,
            }}>
              {email}
            </p>
          )}
        </div>

        {/* More menu */}
        <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            title="Account options"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 30, height: 30, borderRadius: T.radius,
              background: T.hover,
              border: `1px solid ${T.border}`,
              color: T.text,
              cursor: 'pointer',
              transition: 'all 180ms ease',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = T.borderStrong;
              el.style.borderColor = T.borderStrong;
            }}
            onMouseLeave={e => {
              if (!menuOpen) {
                const el = e.currentTarget as HTMLElement;
                el.style.background = T.hover;
                el.style.borderColor = T.border;
              }
            }}
          >
            <MoreHorizontal size={14} />
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute', bottom: '100%', right: 0,
              marginBottom: 8,
              background: '#0A1628',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: `1px solid rgba(255,255,255,0.10)`,
              borderRadius: T.radius,
              overflow: 'hidden',
              minWidth: 160,
              boxShadow: `0 -8px 32px rgba(0,0,0,0.4)`,
              zIndex: 100,
            }}>
              {/* Settings */}
              <button
                onClick={() => { setMenuOpen(false); router.push('/settings'); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '10px 14px',
                  border: 'none', background: 'transparent',
                  color: '#EEF3F7', fontSize: 13, cursor: 'pointer', textAlign: 'left',
                  transition: 'background 150ms',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <Settings size={14} style={{ color: 'rgba(238,243,247,0.55)', flexShrink: 0 }} />
                Settings
              </button>

              {/* Divider */}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 10px' }} />

              {/* Sign out */}
              <button
                onClick={() => { setMenuOpen(false); onLogout(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '10px 14px',
                  border: 'none', background: 'transparent',
                  color: '#E05C5C', fontSize: 13, cursor: 'pointer', textAlign: 'left',
                  transition: 'background 150ms',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(224,92,92,0.10)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <LogOut size={14} style={{ flexShrink: 0 }} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Role badge */}
      <span style={{
        display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start',
        padding: '3px 10px', borderRadius: 20,
        background: cfg.bg,
        color: cfg.text,
        border: `1px solid ${T.borderStrong}`,
        fontSize: 10, fontWeight: 600, letterSpacing: '0.05em',
      }}>
        {roleLabel}
      </span>
    </div>
  );
}
