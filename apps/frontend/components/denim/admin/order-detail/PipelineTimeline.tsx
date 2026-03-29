'use client';

import { Check } from 'lucide-react';

const STAGES = [
  { key: 'PENDING_APPROVAL', label: 'Pending' },
  { key: 'WARPING',          label: 'Warping' },
  { key: 'INDIGO',           label: 'Indigo' },
  { key: 'WEAVING',          label: 'Weaving' },
  { key: 'INSPECT_GRAY',     label: 'Inspect Gray' },
  { key: 'BBSF',             label: 'BBSF' },
  { key: 'INSPECT_FINISH',   label: 'Inspect Finish' },
];

interface PipelineTimelineProps {
  currentStage: string;
  activeSection?: string;
}

export function PipelineTimeline({ currentStage, activeSection }: PipelineTimelineProps) {
  const currentIdx = STAGES.findIndex(s => s.key === currentStage);
  const activeSectionIdx = STAGES.findIndex(s => s.key === activeSection);
  const isComplete = currentStage === 'COMPLETE';
  const isRejected = currentStage === 'REJECTED';

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        padding: '12px 28px',
        position: 'sticky',
        top: 56,
        zIndex: 10,
        display: 'flex',
        alignItems: 'flex-start',
        overflowX: 'auto',
      }}
    >
      <style>{`
        @keyframes __tl_pulse__ {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1;   }
        }
      `}</style>

      {STAGES.map((stage, idx) => {
        // True completion: stages before current are done
        const trulyCompleted = idx < currentIdx || isComplete;

        // For REJECTED: only PENDING_APPROVAL (idx 0) is complete, rest are upcoming
        const isRejectedComplete = isRejected && idx === 0;
        const isRejectedUpcoming = isRejected && idx > 0;

        const isActive = !trulyCompleted && !isRejectedUpcoming
          ? (isRejected ? false : idx === currentIdx)
          : false;

        // Scroll-spy: if activeSection matches this stage, show the spy ring
        const isScrolledTo = activeSectionIdx !== -1 && idx === activeSectionIdx && !isActive;

        const circleBase: React.CSSProperties = {
          width:         32,
          height:        32,
          borderRadius: '50%',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          flexShrink:   0,
          transition:   'box-shadow 0.2s, background 0.2s',
        };

        let circleStyle: React.CSSProperties;
        if (isActive) {
          circleStyle = {
            ...circleBase,
            background: '#1D4ED8',
            color:      '#FFFFFF',
            boxShadow:  '0 0 0 4px rgba(29,78,216,0.15)',
          };
        } else if (isScrolledTo) {
          circleStyle = {
            ...circleBase,
            background: '#F3F4F6',
            color:      '#9CA3AF',
            boxShadow:  '0 0 0 4px rgba(29,78,216,0.20)',
          };
        } else if (isRejectedComplete || trulyCompleted) {
          circleStyle = {
            ...circleBase,
            background: '#059669',
            color:      '#FFFFFF',
          };
        } else {
          circleStyle = {
            ...circleBase,
            background: '#F3F4F6',
            color:      '#9CA3AF',
          };
        }

        const labelColor = isActive
          ? '#1D4ED8'
          : isScrolledTo
          ? '#374151'
          : trulyCompleted || isRejectedComplete
          ? '#6B7280'
          : '#9CA3AF';

        // Connector state
        const connectorDone = idx < (isComplete ? STAGES.length - 1 : currentIdx) || isComplete;

        return (
          <div
            key={stage.key}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            {/* Stage item */}
            <div style={{
              display:       'flex',
              flexDirection: 'column',
              alignItems:    'center',
              gap:           6,
              minWidth:      72,
            }}>
              {/* Circle */}
              <div style={circleStyle}>
                {trulyCompleted || isRejectedComplete || isComplete ? (
                  <Check size={13} strokeWidth={2.5} />
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 600 }}>{idx + 1}</span>
                )}
              </div>
              {/* Label */}
              <span style={{
                fontSize:    10,
                textAlign:   'center',
                maxWidth:    60,
                whiteSpace:  'nowrap',
                overflow:    'hidden',
                textOverflow:'ellipsis',
                color:       labelColor,
                fontWeight:  isActive ? 600 : 400,
              }}>
                {stage.label}
              </span>
            </div>

            {/* Connector */}
            {idx < STAGES.length - 1 && (
              <div style={{
                flex:        1,
                height:       2,
                minWidth:     8,
                marginTop:    0,
                marginBottom: 18,
                background:   connectorDone || isComplete
                  ? 'rgba(5,150,105,0.30)'
                  : '#E5E7EB',
                transition:  'background 0.2s',
                position:    'relative',
                top:         -1,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
