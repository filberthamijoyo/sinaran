import React from 'react';

export const STAGE_DOT_COLORS: Record<string, string> = {
  PENDING_APPROVAL: '#D97706',
  WARPING:          '#2563EB',
  INDIGO:           '#0891B2',
  WEAVING:          '#059669',
  INSPECT_GRAY:     '#D97706',
  BBSF:             '#7C3AED',
  INSPECT_FINISH:   '#EA580C',
  COMPLETE:         '#059669',
};

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
