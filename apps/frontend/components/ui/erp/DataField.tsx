import * as React from "react";

interface DataFieldProps {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  className?: string;
}

export function DataField({ label, value, mono, className }: DataFieldProps) {
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: '#9CA3AF',
      }}>
        {label}
      </span>
      <span
        style={{
          fontSize: 14,
          fontWeight: mono ? 600 : 400,
          color: '#0F1117',
          fontFamily: mono ? "'IBM Plex Mono', monospace" : 'inherit',
        }}
      >
        {value ?? '—'}
      </span>
    </div>
  );
}
