'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { motion, useReducedMotion } from 'framer-motion';

const PIPELINE_STAGES = [
  { key: 'PENDING_APPROVAL', label: 'Pending',  color: '#D97706' },
  { key: 'WARPING',          label: 'Warping',  color: '#003D6B' },
  { key: 'INDIGO',           label: 'Indigo',   color: '#006874' },
  { key: 'WEAVING',          label: 'Weaving',  color: '#059669' },
  { key: 'INSPECT_GRAY',     label: 'Inspect',  color: '#B45309' },
  { key: 'BBSF',             label: 'BBSF',      color: '#6750A4' },
  { key: 'INSPECT_FINISH',   label: 'Finish',   color: '#9F1239' },
  { key: 'COMPLETE',         label: 'Complete',  color: '#059669' },
];

const NODE_R   = 18;
const NODE_D   = NODE_R * 2;
const STEP_W   = 80;
const NODE_Y   = 32;
const SVG_W    = STEP_W * (PIPELINE_STAGES.length - 1) + NODE_D + 32;
const SVG_H    = NODE_D + 32;

interface StageCardHeaderProps {
  label: string;
  count: number;
  stage: string;
}

export default function StageCardHeader({ label, count, stage }: StageCardHeaderProps) {
  const currentIdx = PIPELINE_STAGES.findIndex(s => s.key === stage);
  const shouldReduce = useReducedMotion();

  return (
    <div className="px-5 pt-4 pb-3 flex items-start justify-between" style={{ borderBottom: '1px solid rgba(193,199,206,0.5)' }}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#4B5563' }}>{label}</p>
        <p className="text-3xl font-bold mt-0.5" style={{ color: '#111827' }}>{count}</p>
      </div>

      {/* Pipeline mini-viz */}
      <div style={{ overflowX: 'auto', paddingBottom: '4px', maxWidth: '260px' }}>
        <svg
          width={SVG_W}
          height={SVG_H}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ display: 'block', maxWidth: '100%' }}
          aria-hidden="true"
        >
          {PIPELINE_STAGES.map((st, i) => {
            if (i === PIPELINE_STAGES.length - 1) return null;
            const x1 = NODE_D / 2 + i * STEP_W;
            const x2 = x1 + STEP_W;
            const isComplete = i < currentIdx;
            return (
              <g key={`conn-${st.key}`}>
                <line
                  x1={x1} y1={NODE_Y} x2={x2} y2={NODE_Y}
                  stroke={isComplete ? st.color : '#D1D5DB'}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                {isComplete && (
                  <motion.line
                    x1={x1} y1={NODE_Y} x2={x2} y2={NODE_Y}
                    stroke={st.color}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={shouldReduce ? { duration: 0.01 } : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
              </g>
            );
          })}

          {PIPELINE_STAGES.map((st, i) => {
            const cx = NODE_D / 2 + i * STEP_W;
            const isPending = i > currentIdx;
            const isActive  = i === currentIdx;
            const isDone    = i < currentIdx;

            return (
              <g key={`node-${st.key}`}>
                {isActive && !shouldReduce && (
                  <circle
                    cx={cx} cy={NODE_Y} r={NODE_R + 4}
                    fill="none"
                    stroke={st.color}
                    strokeWidth={2}
                    opacity={0.6}
                    style={{ animation: 'pipelinePulse 1.8s ease-out infinite' }}
                  />
                )}
                <circle
                  cx={cx} cy={NODE_Y}
                  r={NODE_R}
                  fill={isPending ? 'transparent' : st.color}
                  stroke={isPending ? '#D1D5DB' : st.color}
                  strokeWidth={isPending ? 2 : 0}
                />
                {isDone && (
                  <motion.path
                    d={`M${cx - 6} ${NODE_Y} L${cx - 2} ${NODE_Y + 4} L${cx + 6} ${NODE_Y - 4}`}
                    fill="none"
                    stroke="white"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={shouldReduce ? { duration: 0.01 } : { duration: 0.35, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
              </g>
            );
          })}
        </svg>
        <style>{`
          @keyframes pipelinePulse {
            0%   { r: 18; opacity: 0.7; }
            100% { r: 30; opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}
