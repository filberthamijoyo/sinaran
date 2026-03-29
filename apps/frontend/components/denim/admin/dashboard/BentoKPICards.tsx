'use client';

import { Activity } from 'lucide-react';

interface Props {
  inProgress: number;
  needsAttention: number;
}

export function BentoKPICards({ inProgress, needsAttention }: Props) {
  return (
    <>
      {/* In Progress — light */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r4)',
        padding: '18px 20px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 120,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--t3)',
          }}>
            In Progress
          </p>
          <Activity size={14} style={{ color: 'var(--blue)' }} />
        </div>
        <div>
          <p style={{
            fontSize: 36,
            fontWeight: 700,
            color: 'var(--t1)',
            fontFamily: "'IBM Plex Mono', monospace",
            lineHeight: 1.1,
            marginTop: 6,
          }}>
            {inProgress > 0 ? inProgress.toLocaleString() : '—'}
          </p>
          <p style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>
            active pipeline
          </p>
        </div>
      </div>

      {/* Needs Attention — dark red */}
      <div style={{
        background: '#1A0A0A',
        border: '1px solid rgba(220,38,38,0.2)',
        borderRadius: 'var(--r4)',
        padding: '18px 20px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 120,
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(220,38,38,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <p style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.3)',
        }}>
          Needs Attention
        </p>
        <div>
          <p style={{
            fontSize: 36,
            fontWeight: 700,
            color: '#F87171',
            fontFamily: "'IBM Plex Mono', monospace",
            lineHeight: 1.1,
            marginTop: 6,
          }}>
            {needsAttention > 0 ? needsAttention.toLocaleString() : '—'}
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
            pending &gt; 3 days
          </p>
        </div>
      </div>
    </>
  );
}
