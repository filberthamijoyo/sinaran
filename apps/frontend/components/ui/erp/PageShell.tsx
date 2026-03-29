'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

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
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    setCanGoBack(window.history.length > 1);
  }, []);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {canGoBack && (
            <button
              onClick={() => router.back()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: 'rgba(15,30,46,0.08)',
                border: '1px solid rgba(15,30,46,0.12)',
                cursor: 'pointer',
                flexShrink: 0,
                color: '#0F1E2E',
                transition: 'background-color 150ms',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(15,30,46,0.14)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(15,30,46,0.08)';
              }}
            >
              <ChevronLeft size={18} />
            </button>
          )}
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
        </div>
        {actions && (
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 'auto' }}>
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
