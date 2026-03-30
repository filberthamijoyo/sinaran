import React from 'react';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  variant?: 'default' | 'dimmed';
  noPadding?: boolean;
}

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  variant = 'default',
  noPadding = false,
}: SectionCardProps) {
  const isDimmed = variant === 'dimmed';

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: 12,
        overflow: 'hidden',
        opacity: isDimmed ? 0.45 : 1,
        pointerEvents: isDimmed ? 'none' : 'auto',
        marginBottom: 16,
      }}
    >
      <div
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid #F3F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <h3
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#0F1E2E',
              margin: 0,
            }}
          >
            {title}
          </h3>
          {subtitle && (
            <span
              style={{
                fontSize: 12,
                color: '#9CA3AF',
                marginTop: 2,
                display: 'block',
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>

      {isDimmed ? (
        <div style={{
          padding: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 8,
          color: '#9CA3AF',
          fontSize: 13,
        }}>
          {children}
        </div>
      ) : (
        <div style={{ padding: noPadding ? 0 : 20 }}>{children}</div>
      )}
    </div>
  );
}

export default SectionCard;
