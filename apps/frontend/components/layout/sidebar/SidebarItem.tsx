'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import React from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { T } from './tokens';

type Props = {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  active?: boolean;
  collapsed?: boolean;
};

export default function SidebarItem({ href, icon, label, badge, active, collapsed = false }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  let isActive = active ?? false;
  if (!isActive) {
    try {
      const url = new URL(href, 'http://x');
      const tab = url.searchParams.get('tab');
      isActive = tab
        ? pathname.startsWith(url.pathname) && (searchParams.get('tab') || 'admin') === tab
        : pathname === href || (href !== '/denim' && pathname.startsWith(href + '/'));
    } catch {
      isActive = pathname === href || (href !== '/denim' && pathname.startsWith(href + '/'));
    }
  }

  /* ── Collapsed: circular icon button ─────────────── */
  if (collapsed) {
    const inner = (
      <Link
        href={href}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 36, height: 36,
          borderRadius: T.radius,
          background: isActive ? T.active : 'transparent',
          border: isActive ? `1.5px solid ${T.borderStrong}` : `1px solid ${T.border}`,
          textDecoration: 'none',
          transition: 'all 180ms ease',
          boxShadow: 'none',
        }}
      >
        <span style={{
          color: T.text,
          display: 'flex', alignItems: 'center',
          transition: 'color 180ms ease',
        }}>
          {icon}
        </span>
      </Link>
    );
    return (
      <Tooltip>
        <TooltipTrigger asChild>{inner}</TooltipTrigger>
        <TooltipContent
          side="right"
          style={{
            background: '#0A1628',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            color: '#EEF3F7',
            border: `1px solid rgba(255,255,255,0.10)`,
            borderTop: `2px solid #0A1628`,
            borderRadius: T.radius,
            padding: '6px 12px', fontSize: 12, fontWeight: 500,
            boxShadow: `0 8px 24px rgba(0,0,0,0.4)`,
            marginLeft: 6,
          }}
        >
          <span style={{ color: '#EEF3F7' }}>{label}</span>
          {badge != null && badge > 0 && (
            <span style={{
              marginLeft: 8, display: 'inline-flex', alignItems: 'center',
              justifyContent: 'center',
              minWidth: 16, height: 16, borderRadius: 8,
              background: T.badgeBg, color: T.text,
              fontSize: 10, fontWeight: 600, padding: '0 4px',
            }}>
              {badge}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  /* ── Expanded: icon + label + badge ─────────────── */
  return (
    <Link
      href={href}
      style={{
        display: 'flex', alignItems: 'center', gap: 11,
        height: 40, padding: '0 10px 0 12px',
        borderRadius: T.radius,
        background: isActive ? T.active : 'transparent',
        borderLeft: isActive ? `3px solid ${T.accent}` : '1px solid transparent',
        borderTopRightRadius: T.radius,
        borderBottomRightRadius: T.radius,
        color: T.text,
        fontSize: 13, fontWeight: isActive ? 700 : 500,
        textDecoration: 'none',
        transition: 'all 180ms ease',
        marginBottom: 3,
        cursor: 'pointer',
        position: 'relative',
      }}
      onMouseEnter={e => {
        if (!isActive) {
          const el = e.currentTarget as HTMLElement;
          el.style.background = T.hover;
          el.style.borderColor = T.border;
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          const el = e.currentTarget as HTMLElement;
          el.style.background = 'transparent';
          el.style.borderColor = 'transparent';
        }
      }}
    >
      {/* Icon */}
      <span style={{
        color: T.text,
        display: 'flex', alignItems: 'center', flexShrink: 0,
        transition: 'color 180ms ease',
      }}>
        {icon}
      </span>

      {/* Label */}
      <span style={{
        flex: 1, minWidth: 0, overflow: 'hidden',
        textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        color: isActive ? T.textBright : T.text,
      }}>
        {label}
      </span>

      {/* Badge */}
      {badge != null && badge > 0 && (
        <span style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minWidth: 20, height: 20, borderRadius: 10,
          background: T.badgeBg, color: T.text,
          fontSize: 10, fontWeight: 600, padding: '0 7px', flexShrink: 0,
        }}>
          {badge}
        </span>
      )}

      {/* Active indicator — right edge accent line */}
      {isActive && (
        <div style={{
          position: 'absolute',
          right: 0, top: '50%', transform: 'translateY(-50%)',
          width: 3, height: '50%',
          borderRadius: 1.5,
          background: T.accent,
          opacity: 0.4,
        }} />
      )}
    </Link>
  );
}
