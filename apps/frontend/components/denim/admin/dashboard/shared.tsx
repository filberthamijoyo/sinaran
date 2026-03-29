'use client';

import React from 'react';
import {
  Package2, Clock, CheckCircle2, AlertTriangle,
  TrendingUp, Factory, Users,
} from 'lucide-react';

interface NmKpiCardProps {
  label: string;
  value: string;
  sub: string;
  icon: 'Package2' | 'Clock' | 'CheckCircle2' | 'AlertTriangle' | 'TrendingUp' | 'Factory' | 'Users';
  accent: string;
}

const ICONS = { Package2, Clock, CheckCircle2, AlertTriangle, TrendingUp, Factory, Users };

export function NmKpiCard({ label, value, sub, icon, accent }: NmKpiCardProps) {
  const Icon = ICONS[icon];
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r4)',
        padding: 20,
        boxShadow: 'var(--shadow-sm)',
        minHeight: 120,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{
          fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.1em', color: 'var(--t3)',
        }}>
          {label}
        </p>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 'var(--r2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
          }}
        >
          <Icon size={14} style={{ color: accent }} />
        </div>
      </div>
      <p style={{
        fontSize: 28, fontWeight: 700, color: accent, lineHeight: 1.1, marginBottom: 4,
        fontVariantNumeric: 'tabular-nums',
        fontFamily: "'IBM Plex Mono', monospace",
      }}>
        {value}
      </p>
      <p style={{ fontSize: 11, color: 'var(--t3)' }}>{sub}</p>
    </div>
  );
}

interface NmChartCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function NmChartCard({ title, icon, children }: NmChartCardProps) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r4)',
        padding: 20,
        boxShadow: 'var(--shadow-sm)',
        minHeight: 200,
      }}
    >
      <p
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--t1)',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {icon}{title}
      </p>
      {children}
    </div>
  );
}

export function NmStatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; dot: string }> = {
    good:    { label: 'Good',    color: '#059669', dot: '#22C55E' },
    average: { label: 'Average', color: '#D97706', dot: '#FBBF24' },
    low:     { label: 'Low',    color: '#DC2626', dot: '#EF4444' },
  };
  const c = map[status] ?? map.average;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        borderRadius: 'var(--r2)',
        padding: '2px 8px',
        fontSize: 12,
        fontWeight: 500,
        background: 'var(--surface-2)',
        color: c.color,
        border: '1px solid var(--border)',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}
