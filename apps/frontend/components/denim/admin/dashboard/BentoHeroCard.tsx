'use client';

export function BentoHeroCard({ total }: { total: number }) {
  const SPARKLINE = [60, 72, 65, 85, 78, 70, 88, 82];

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #0D1B2E 0%, #0A1628 60%, #0D1B35 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 'var(--r4)',
        padding: '24px 26px',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 160,
      }}
    >
      {/* Decorative glow orb */}
      <div style={{
        position: 'absolute',
        right: -40,
        top: -40,
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Decorative grid lines */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.12em',
          color: 'rgba(255,255,255,0.3)',
          textTransform: 'uppercase',
        }}>
          Production Pipeline
        </p>

        <p style={{
          fontSize: 48,
          fontWeight: 700,
          color: '#FFFFFF',
          lineHeight: 1.1,
          fontFamily: "'IBM Plex Mono', monospace",
          letterSpacing: '-0.02em',
          marginTop: 8,
        }}>
          {total > 0 ? total.toLocaleString() : '—'}
        </p>

        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
          total orders
        </p>

        {/* Mini bar chart */}
        <div style={{
          display: 'flex',
          gap: 4,
          alignItems: 'flex-end',
          height: 36,
          marginTop: 16,
        }}>
          {SPARKLINE.map((h, i) => (
            <div key={i} style={{
              flex: 1,
              height: `${h}%`,
              borderRadius: 2,
              background: i === SPARKLINE.length - 1
                ? '#3B82F6'
                : 'rgba(255,255,255,0.12)',
              minWidth: 4,
            }} />
          ))}
        </div>
        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
          this week
        </p>
      </div>
    </div>
  );
}
