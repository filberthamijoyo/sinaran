'use client';

import * as React from 'react';

/* ─────────────────────────────────────────────────────────
   Design tokens (from globals.css)
   ───────────────────────────────────────────────────────── */
const T = {
  contentBg:            'var(--content-bg)',
  border:               'var(--border)',
  cardRadius:           'var(--card-radius)',
  textMuted:            'var(--text-muted)',
  textPrimary:          'var(--text-primary)',
  denim950:             'var(--denim-950)',
  textOnDark:           'var(--text-on-dark)',
  textOnDarkMuted:      'var(--text-on-dark-muted)',
  successBg:            'var(--success-bg)',
  successText:          'var(--success-text)',
  dangerBg:             'var(--danger-bg)',
  dangerText:           'var(--danger-text)',
} as const;

/* ─────────────────────────────────────────────────────────
   Trend badge
   ───────────────────────────────────────────────────────── */
function TrendBadge({ value, label }: { value: number; label: string }) {
  const isPositive = value >= 0;
  return (
    <div style={{
      display:     'inline-flex',
      alignItems:  'center',
      gap:         4,
      marginTop:   6,
    }}>
      <span style={{
        padding:       '1px 6px',
        borderRadius:  'var(--badge-radius)',
        fontSize:      11,
        fontWeight:    600,
        backgroundColor: isPositive ? T.successBg : T.dangerBg,
        color:           isPositive ? T.successText : T.dangerText,
      }}>
        {isPositive ? '+' : ''}{value}%
      </span>
      {label && (
        <span style={{
          fontSize: 11,
          color:    T.textMuted,
        }}>
          {label}
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Skeleton shimmer
   ───────────────────────────────────────────────────────── */
const SHIMMER_KEYFRAMES = `
@keyframes __stat_shimmer__ {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 0.9; }
}
`;

function SkeletonShimmer({ dark = false }: { dark?: boolean }) {
  const baseColor = dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)';
  const pulse = (delay: number): React.CSSProperties => ({
    backgroundColor: baseColor,
    borderRadius:    4,
    animation:       `__stat_shimmer__ 1.5s ease-in-out ${delay}ms infinite`,
  });

  return (
    <>
      <style>{SHIMMER_KEYFRAMES}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <div style={{ height: 11, width: '55%', ...pulse(0) }} />
        <div style={{ height: 36, width: '40%', ...pulse(200) }} />
        <div style={{ height: 12, width: '65%', ...pulse(400) }} />
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   StatCard
   ───────────────────────────────────────────────────────── */
type StatCardVariant = 'light' | 'dark';

interface StatCardProps {
  label:    string;
  value:    string | number;
  /** @deprecated Use sublabel instead */
  sub?:     string;
  sublabel?: string;
  variant?: StatCardVariant;
  trend?:   { value: number; label?: string };
  icon?:    React.ReactNode;
  loading?: boolean;
}

function StatCard({
  label,
  value,
  sublabel,
  variant = 'light',
  trend,
  icon,
  loading = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sub: _sub, // alias for sublabel (backward compat)
}: StatCardProps) {
  const isDark = variant === 'dark';
  const effectiveSublabel = sublabel ?? _sub;

  const cardStyle: React.CSSProperties = isDark
    ? {
        backgroundColor:     '#0D1B3E',
        border:             '1px solid rgba(255,255,255,0.08)',
        borderRadius:       12,
        padding:            '20px 24px',
      }
    : {
        backgroundColor: '#FFFFFF',
        border:          '1px solid #E5E7EB',
        borderRadius:    12,
        padding:         '20px 24px',
      };

  const labelStyle: React.CSSProperties = isDark
    ? {
        fontSize:      11,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        fontWeight:    500,
        color:         'rgba(255,255,255,0.45)',
      }
    : {
        fontSize:      11,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        fontWeight:    500,
        color:         '#9CA3AF',
      };

  const valueStyle: React.CSSProperties = isDark
    ? {
        fontSize:      36,
        fontWeight:    800,
        color:         '#FFFFFF',
        fontFamily:    "'IBM Plex Mono', monospace",
        lineHeight:    1,
      }
    : {
        fontSize:      36,
        fontWeight:    800,
        color:         '#0F1E2E',
        fontFamily:    "'IBM Plex Mono', monospace",
        lineHeight:    1,
      };

  const sublabelStyle: React.CSSProperties = isDark
    ? { fontSize: 12, color: 'rgba(255,255,255,0.40)', marginTop: 6 }
    : { fontSize: 12, color: '#9CA3AF',                marginTop: 6 };

  return (
    <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {icon && (
        <div style={{
          position: 'absolute',
          top:      20,
          right:    24,
          display:  'flex',
          alignItems: 'center',
          color:    isDark ? 'rgba(255,255,255,0.45)' : T.textMuted,
          opacity:  0.6,
        }}>
          {icon}
        </div>
      )}

      {loading ? (
        <SkeletonShimmer dark={isDark} />
      ) : (
        <>
          <p style={{ ...labelStyle, margin: 0 }}>{label}</p>

          <p style={{ ...valueStyle, margin: 0 }}>{value}</p>

          {trend && (
            <TrendBadge value={trend.value} label={trend.label ?? ''} />
          )}

          {effectiveSublabel && (
            <p style={{ ...sublabelStyle, margin: 0 }}>{effectiveSublabel}</p>
          )}
        </>
      )}
    </div>
  );
}

export { StatCard };
export default StatCard;
