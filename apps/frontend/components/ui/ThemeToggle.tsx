'use client';

/**
 * ThemeToggle — polished dark/light mode toggle.
 *
 * Implementation: plain React state + useEffect toggling `dark` on <html>.
 * No next-themes dependency required. Respects prefers-color-scheme on first
 * mount, then persists the user's choice to localStorage.
 *
 * Variants:
 *   default       — icon button for light backgrounds
 *   sidebar        — single icon button with blue glow for dark sidebar
 *   sidebarSegmented — Light | Dark segmented pill bar for dark sidebar
 */

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme') as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeToggle({ variant = 'default' }: { variant?: 'default' | 'sidebar' | 'sidebarSegmented' }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  /* Hydration guard: read theme after mount to avoid SSR mismatch */
  useEffect(() => {
    setTheme(getInitialTheme());
    setMounted(true);
  }, []);

  /* Sync theme to <html> class + localStorage */
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  /* Avoid flash of wrong icon during SSR */
  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        style={{
          width: variant === 'sidebarSegmented' ? 80 : 36,
          height: 36,
          borderRadius: variant === 'sidebarSegmented' ? 8 : '8px',
          border: `1px solid #21262D`,
          cursor: 'default',
          background: 'transparent',
          flexShrink: 0,
        }}
      />
    );
  }

  const isDark = theme === 'dark';

  /* ---- Segmented pill: Light | Dark bar ---- */
  if (variant === 'sidebarSegmented') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 36,
          borderRadius: 8,
          border: `1px solid ${T.border}`,
          background: T.bg,
          padding: 3,
          gap: 2,
          flexShrink: 0,
        }}
      >
        {/* Light side */}
        <button
          onClick={() => setTheme('light')}
          aria-label="Switch to light mode"
          title="Light mode"
          style={{
            flex: 1,
            height: '100%',
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: !isDark ? 'rgba(29,110,240,0.2)' : 'transparent',
            color: !isDark ? T.textBright : T.text,
            fontSize: 12,
            fontWeight: !isDark ? 600 : 400,
            transition: 'background 150ms, color 150ms',
          }}
        >
          <Sun size={13} strokeWidth={2} />
        </button>

        {/* Dark side */}
        <button
          onClick={() => setTheme('dark')}
          aria-label="Switch to dark mode"
          title="Dark mode"
          style={{
            flex: 1,
            height: '100%',
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isDark ? 'rgba(29,110,240,0.25)' : 'transparent',
            color: isDark ? T.textBright : T.text,
            fontSize: 12,
            fontWeight: isDark ? 600 : 400,
            transition: 'background 150ms, color 150ms',
          }}
        >
          <Moon size={13} strokeWidth={2} />
        </button>
      </div>
    );
  }

  /* ---- Sidebar variant: icon button for dark sidebar ---- */
  if (variant === 'sidebar') {
    return (
      <button
        onClick={toggle}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{
          width: 36,
          height: 36,
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDark ? 'rgba(29,78,216,0.2)' : 'rgba(29,78,216,0.1)',
          color: isDark ? '#93C5FD' : '#1D4ED8',
          transition: 'background 200ms ease, color 200ms ease',
          flexShrink: 0,
          boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = isDark
            ? 'rgba(29,78,216,0.3)'
            : 'rgba(29,78,216,0.15)';
          (e.currentTarget as HTMLElement).style.color = '#FFFFFF';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = isDark
            ? 'rgba(29,78,216,0.2)'
            : 'rgba(29,78,216,0.1)';
          (e.currentTarget as HTMLElement).style.color = isDark ? '#93C5FD' : '#1D4ED8';
        }}
      >
        {isDark ? (
          <Sun size={16} strokeWidth={2} />
        ) : (
          <Moon size={16} strokeWidth={2} />
        )}
      </button>
    );
  }

  /* ---- Default variant: button for light backgrounds ---- */
  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`
        w-10 h-10 rounded-lg border-none cursor-pointer flex items-center justify-center flex-shrink-0
        transition-all duration-200
        ${isDark
          ? 'bg-[#1D4ED8] text-white hover:bg-[#2563EB]'
          : 'bg-[#F7F8FA] text-[#374151] border border-[#E5E7EB] hover:bg-[#F3F4F6]'
        }
      `}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
      }}
    >
      {isDark ? (
        <Sun size={17} strokeWidth={2} />
      ) : (
        <Moon size={17} strokeWidth={2} />
      )}
    </button>
  );
}

/* Local tokens used only by sidebarSegmented (matches @/components/layout/sidebar/tokens) */
const T = {
  border:     '#21262D',
  bg:         '#0D1117',
  text:       '#8B949E',
  textBright: '#F0F6FC',
} as const;
