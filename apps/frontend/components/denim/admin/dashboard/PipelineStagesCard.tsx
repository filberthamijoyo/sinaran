'use client';

import React from 'react';

const STAGE_CONFIG: Array<{ key: string; label: string; color: string }> = [
  { key: 'PENDING_APPROVAL', label: 'Pending',        color: '#D97706' },
  { key: 'SACON',            label: 'Sacon',           color: '#7C3AED' },
  { key: 'WARPING',          label: 'Warping',         color: '#4A7A9B' },
  { key: 'INDIGO',           label: 'Indigo',          color: '#0891B2' },
  { key: 'WEAVING',          label: 'Weaving',         color: '#059669' },
  { key: 'INSPECT_GRAY',     label: 'Inspect Gray',    color: '#D97706' },
  { key: 'BBSF',             label: 'BBSF',            color: '#EA580C' },
  { key: 'INSPECT_FINISH',   label: 'Inspect Finish',  color: '#2B506E' },
  { key: 'COMPLETE',         label: 'Complete',        color: '#059669' },
  { key: 'REJECTED',         label: 'Rejected',        color: '#DC2626' },
];

interface Props {
  stageCounts: Record<string, number>;
}

export default function PipelineStagesCard({ stageCounts }: Props) {
  const activeStages = STAGE_CONFIG.filter(s => (stageCounts[s.key] ?? 0) > 0);
  const maxCount = Math.max(...activeStages.map(s => stageCounts[s.key] ?? 0), 1);

  if (activeStages.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: 120, color: '#9CA3AF', fontSize: 13 }}>
        No active orders
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {activeStages.map(stage => {
        const count = stageCounts[stage.key] ?? 0;
        const pct = Math.max((count / maxCount) * 100, 2);

        return (
          <div key={stage.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

            <span style={{
              fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const,
              letterSpacing: '0.05em', color: stage.color,
              minWidth: 100, flexShrink: 0
            }}>
              {stage.label}
            </span>

            <div style={{
              flex: 1, height: 8, backgroundColor: '#F3F4F6',
              borderRadius: 4, overflow: 'hidden'
            }}>
              <div style={{
                width: `${pct}%`,
                height: 8,
                backgroundColor: stage.color,
                borderRadius: 4,
                display: 'block',
              }} />
            </div>

            <span style={{
              fontSize: 13, fontWeight: 600,
              fontFamily: "'IBM Plex Mono', monospace",
              color: '#0F1E2E', minWidth: 32, textAlign: 'right' as const
            }}>
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
