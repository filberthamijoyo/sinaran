import React from 'react';

interface PageShellProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  noPadding?: boolean;
}

export function PageShell({
  title,
  subtitle,
  actions,
  children,
  noPadding = false,
}: PageShellProps) {
  return (
    <>
      <header
        style={{
          height: '56px',
          position: 'sticky',
          top: 0,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: '#0F1E2E',
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
              {subtitle}
            </div>
          )}
        </div>
        {actions && (
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            {actions}
          </div>
        )}
      </header>
      <div
        style={{
          flex: 1,
          padding: noPadding ? 0 : '28px 32px',
        }}
      >
        {children}
      </div>
    </>
  );
}

export default PageShell;
