'use client';

import * as React from 'react';

/* ─────────────────────────────────────────────────────────
   Design tokens (from globals.css)
   ───────────────────────────────────────────────────────── */
const T = {
  denim100:    'var(--denim-100)',
  textMuted:   'var(--text-muted)',
  badgeRadius: 'var(--badge-radius)',

  // Stage token backgrounds
  stagePendingBg:    'var(--stage-pending-bg)',
  stagePendingText: 'var(--stage-pending-text)',
  stageSaconBg:     'var(--stage-sacon-bg)',
  stageSaconText:   'var(--stage-sacon-text)',
  stageWarpingBg:   'var(--stage-warping-bg)',
  stageWarpingText: 'var(--stage-warping-text)',
  stageIndigoBg:    'var(--stage-indigo-bg)',
  stageIndigoText:  'var(--stage-indigo-text)',
  stageWeavingBg:   'var(--stage-weaving-bg)',
  stageWeavingText: 'var(--stage-weaving-text)',
  stageGrayBg:      'var(--stage-gray-bg)',
  stageGrayText:    'var(--stage-gray-text)',
  stageBbsfBg:      'var(--stage-bbsf-bg)',
  stageBbsfText:    'var(--stage-bbsf-text)',
  stageFinishBg:    'var(--stage-finish-bg)',
  stageFinishText:  'var(--stage-finish-text)',
  stageCompleteBg:  'var(--stage-complete-bg)',
  stageCompleteText:'var(--stage-complete-text)',
  stageRejectedBg:  'var(--stage-rejected-bg)',
  stageRejectedText:'var(--stage-rejected-text)',
  stageStaledBg:   'var(--stage-staled-bg)',
  stageStaledText: 'var(--stage-staled-text)',
} as const;

/* ─────────────────────────────────────────────────────────
   Stage → style map
   ───────────────────────────────────────────────────────── */
const stageStyles: Record<string, React.CSSProperties> = {
  PENDING_APPROVAL: { backgroundColor: T.stagePendingBg,  color: T.stagePendingText },
  SACON:            { backgroundColor: T.stageSaconBg,    color: T.stageSaconText   },
  WARPING:          { backgroundColor: T.stageWarpingBg,  color: T.stageWarpingText},
  INDIGO:           { backgroundColor: T.stageIndigoBg,   color: T.stageIndigoText },
  WEAVING:          { backgroundColor: T.stageWeavingBg,  color: T.stageWeavingText},
  INSPECT_GRAY:     { backgroundColor: T.stageGrayBg,     color: T.stageGrayText   },
  BBSF:             { backgroundColor: T.stageBbsfBg,     color: T.stageBbsfText   },
  INSPECT_FINISH:   { backgroundColor: T.stageFinishBg,   color: T.stageFinishText },
  COMPLETE:         { backgroundColor: T.stageCompleteBg, color: T.stageCompleteText},
  REJECTED:         { backgroundColor: T.stageRejectedBg, color: T.stageRejectedText},
  STALED:           { backgroundColor: T.stageStaledBg,    color: T.stageStaledText },
};

const defaultStyle: React.CSSProperties = {
  backgroundColor: T.denim100,
  color:           T.textMuted,
};

/* ─────────────────────────────────────────────────────────
   Label overrides
   ───────────────────────────────────────────────────────── */
const LABEL: Record<string, string> = {
  PENDING_APPROVAL: 'Pending',
  INSPECT_GRAY:    'Inspect Gray',
  INSPECT_FINISH:  'Inspect Finish',
};

function toTitleCase(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function labelFor(status: string): string {
  return LABEL[status] ?? toTitleCase(status);
}

/* ─────────────────────────────────────────────────────────
   StatusBadge
   ───────────────────────────────────────────────────────── */
interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string;
  /** @deprecated no longer changes styling */
  size?: 'sm' | 'md';
}

function StatusBadge({ status, style, ...rest }: StatusBadgeProps) {
  const stageStyle = stageStyles[status] ?? defaultStyle;

  return (
    <span
      style={{
        borderRadius: T.badgeRadius,
        padding:      '2px 8px',
        fontSize:    11,
        fontWeight:  500,
        display:     'inline-flex',
        alignItems:  'center',
        gap:         4,
        whiteSpace:  'nowrap',
        ...stageStyle,
        ...style,
      }}
      {...rest}
    >
      {labelFor(status)}
    </span>
  );
}

export { StatusBadge };
export default StatusBadge;
