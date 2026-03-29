'use client';
import React from 'react';

const COLORS: Record<string, string> = {
  PENDING_APPROVAL: '#D97706',
  WARPING: '#4A7A9B',
  INDIGO: '#0891B2',
  WEAVING: '#059669',
  INSPECT_GRAY: '#D97706',
  BBSF: '#EA580C',
  INSPECT_FINISH: '#2B506E',
  COMPLETE: '#059669',
  REJECTED: '#DC2626',
};

interface Props { stageCounts: Record<string, number> }

export default function PipelineStagesCard({ stageCounts }: Props) {
  const activeStages = Object.keys(COLORS).filter(s => (stageCounts[s] ?? 0) > 0);
  const maxCount = Math.max(...activeStages.map(s => stageCounts[s] ?? 0), 1);

  return (
    <div style={{ backgroundColor:'#FFFFFF', border:'1px solid #E5E7EB', borderRadius:12, padding:'20px 24px', minHeight:280, display:'flex', flexDirection:'column' }}>
      <p style={{ fontSize:14, fontWeight:600, color:'#0F1E2E', margin:'0 0 16px 0' }}>Active Pipeline</p>
      {activeStages.length === 0 ? (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flex:1, color:'#9CA3AF', fontSize:13 }}>No active orders</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {activeStages.map(stage => {
            const count = stageCounts[stage] ?? 0;
            const pct = Math.max((count / maxCount) * 100, 2);
            const color = COLORS[stage] ?? '#9CA3AF';
            return (
              <div key={stage} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', color, minWidth:110, flexShrink:0 }}>
                  {stage.replace(/_/g,' ')}
                </span>
                <div style={{
                  flex:            1,
                  height:           8,
                  borderRadius:    4,
                  backgroundColor: '#F3F4F6',
                  position:        'relative',
                  overflow:        'hidden',
                }}>
                  <div style={{
                    position:    'absolute',
                    top:         0,
                    left:        0,
                    bottom:      0,
                    width:       pct + '%',
                    backgroundColor: color,
                    borderRadius:    4,
                    flexShrink:       0,
                  }} />
                </div>
                <span style={{ fontSize:13, fontWeight:600, fontFamily:"'IBM Plex Mono',monospace", color:'#0F1E2E', minWidth:32, textAlign:'right' }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}