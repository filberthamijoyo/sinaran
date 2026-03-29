'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { T } from './tokens';
import type { NavSection } from './navConfig';
import SidebarItem from './SidebarItem';

type Props = {
  section: NavSection;
  defaultOpen?: boolean;
  collapsed?: boolean;
};

export default function SidebarSection({ section, defaultOpen = true, collapsed = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  /* ── Collapsed: icon-only column ─────────────────── */
  if (collapsed) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 4, marginBottom: 16,
        padding: '6px 4px',
        borderRadius: T.radius,
        background: T.hover,
        border: `1px solid ${T.border}`,
      }}>
        {section.items.map(item => (
          <SidebarItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            badge={item.badge}
            collapsed
          />
        ))}
      </div>
    );
  }

  /* ── Expanded ───────────────────────────────────── */
  return (
    <div style={{ marginBottom: 20 }}>
      {/* Section label row */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center',
          width: '100%', padding: '0 4px',
          border: 'none', background: 'transparent', cursor: 'pointer',
          gap: 10, marginBottom: open ? 6 : 0,
          transition: 'margin-bottom 220ms ease',
          borderRadius: T.radiusSm,
        }}
      >
        {/* Left accent bar — very dark navy on light denim */}
        <div style={{
          width: 2, height: 12,
          borderRadius: 1,
          background: T.accent,
          flexShrink: 0,
          opacity: open ? 1 : 0.4,
          transition: 'opacity 220ms ease',
        }} />
        <span style={{
          fontSize: 10.5, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.09em',
          color: T.textMuted,
          opacity: open ? 1 : 0.5,
          transition: 'opacity 220ms ease',
          flex: 1, textAlign: 'left',
        }}>
          {section.label}
        </span>
        <ChevronDown
          size={13} strokeWidth={2.5}
          style={{
            color: T.textMuted,
            opacity: open ? 0.7 : 0.35,
            transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 220ms ease',
            flexShrink: 0,
          }}
        />
      </button>

      {/* Nav items */}
      {open && (
        <div style={{
          borderLeft: `1px solid ${T.border}`,
          marginLeft: 7,
          paddingLeft: 10,
        }}>
          {section.items.map(item => (
            <SidebarItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              badge={item.badge}
            />
          ))}
        </div>
      )}
    </div>
  );
}
