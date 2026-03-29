import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  backHref?: string;
}

export default function PageHeader({ title, subtitle, actions, backHref }: PageHeaderProps) {
  return (
    <header style={{
      height: 52,
      background: 'rgba(246,248,251,0.85)',
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      borderBottom: '1px solid rgba(227,232,239,0.8)',
      padding: '0 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {backHref && (
          <Link
            href={backHref}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              color: 'var(--t3)',
              transition: 'color 0.12s',
              cursor: 'pointer',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--t2)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--t3)'; }}
          >
            <ChevronLeft size={16} />
            Back
          </Link>
        )}
        {backHref && (
          <span style={{ width: 1, height: 16, background: 'var(--border-2)', margin: '0 0' }} />
        )}
        <h1 style={{ fontSize: 15, fontWeight: 600, color: 'var(--t1)', lineHeight: 1 }}>
          {title}
        </h1>
        {subtitle && (
          <>
            <span style={{ width: 1, height: 16, background: 'var(--border-2)', margin: '0 8px' }} />
            <p style={{ fontSize: 13, color: 'var(--t3)' }}>
              {subtitle}
            </p>
          </>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {actions}
        </div>
      )}
    </header>
  );
}
