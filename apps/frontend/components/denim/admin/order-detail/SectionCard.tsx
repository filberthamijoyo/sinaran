import React from 'react';

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onEdit?: () => void;
}

export function SectionCard({ title, icon, children, onEdit }: SectionCardProps) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r4)',
        marginBottom: 12,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          background: 'var(--bg)',
          borderBottom: '1px solid var(--bg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon}
          <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--t1)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {title}
          </h3>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            style={{
              height: 26,
              paddingLeft: 10,
              paddingRight: 10,
              borderRadius: 'var(--r2)',
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--t3)',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 500,
              transition: 'all 0.1s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)';
              (e.currentTarget as HTMLElement).style.color = 'var(--t2)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'var(--t3)';
            }}
          >
            Edit
          </button>
        )}
      </div>
      <div style={{ padding: '16px 20px' }}>
        {children}
      </div>
    </div>
  );
}
