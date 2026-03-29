'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '../../../ui/table';

export function formatDate(iso: string | null) {
  if (!iso) return '—';
  try { return format(new Date(iso), 'd MMM yyyy'); }
  catch { return '—'; }
}

export function formatDateTime(iso: string | null) {
  if (!iso) return '—';
  try { return format(new Date(iso), 'd MMM yyyy HH:mm'); }
  catch { return '—'; }
}

function format(date: Date, pattern: string): string {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const d = date.getDate();
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  if (pattern === 'd MMM yyyy') return `${d} ${m} ${y}`;
  if (pattern === 'd MMM yyyy HH:mm') {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${d} ${m} ${y} ${hh}:${mm}`;
  }
  return `${d} ${m} ${y}`;
}

export function SectionIcon({ hasData }: { hasData: boolean }) {
  if (hasData) {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" fill="#D1FAE5" />
        <path d="M6 10l3 3 5-6" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1" />
    </svg>
  );
}

const STAGE_DOT_COLORS: Record<string, string> = {
  PENDING_APPROVAL: '#D97706',
  WARPING:          '#2563EB',
  INDIGO:           '#0891B2',
  WEAVING:          '#059669',
  INSPECT_GRAY:     '#D97706',
  BBSF:             '#7C3AED',
  INSPECT_FINISH:   '#EA580C',
  COMPLETE:         '#059669',
};

export function SectionCard({
  title,
  subtitle,
  icon,
  dotColor,
  children,
  onEdit,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  dotColor?: string;
  children: React.ReactNode;
  onEdit?: () => void;
}) {
  return (
    <div
      style={{
        background: 'var(--white)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-xl)',
        marginBottom: 12,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 22px',
          borderBottom: '1px solid var(--surface-2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {dotColor && (
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: dotColor, flexShrink: 0,
            }} />
          )}
          {icon}
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{title}</h3>
            {subtitle && <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{subtitle}</p>}
          </div>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-md)',
              height: 32,
              padding: '0 12px',
              fontSize: 12,
              color: 'var(--text-3)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.12s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--surface)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-2)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-3)';
            }}
          >
            Edit
          </button>
        )}
      </div>
      <div style={{ padding: '0 22px 20px' }}>{children}</div>
    </div>
  );
}

// Reusable collapsible MachineCard — used by Weaving, Inspect Gray, Inspect Finish, BBSF Sanfor
export function MachineCard({
  machineName,
  summary,
  children,
  defaultOpen = false,
}: {
  machineName: string;
  summary: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        background: 'var(--white)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        overflow: 'hidden',
        marginBottom: 8,
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          transition: 'background 0.1s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px 12px' }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 13, color: 'var(--text-1)' }}>{machineName}</span>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{summary}</span>
        </div>
        <ChevronDown
          style={{
            width: 16,
            height: 16,
            color: 'var(--text-3)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
          }}
        />
      </button>

      {open && (
        <div style={{ borderTop: '1px solid var(--surface-2)', padding: 16 }}>
          {children}
        </div>
      )}
    </div>
  );
}
