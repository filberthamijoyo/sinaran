// Shared types for AdminDashboard panels

export interface SummaryData {
  total: number;
  inProgress: number;
  recentlyCompleted: number;
  blockedCount: number;
  stageCounts: Record<string, number>;
  typeCounts: Record<string, number>;
  recentByStage: Record<string, any[]>;
  weeklyEfficiency: Array<{ week: string; avg_efficiency: number; record_count: number }>;
  machineEfficiencyToday: Array<{ machine: string; avg_efficiency: number; record_count: number }>;
  lowEfficiencyMachines: Array<{ machine: string; avg_efficiency: number }>;
  warpingQueue: number;
  topCustomers: Array<{ customer: string; count: number }>;
  avgCycleTime: {
    contract_to_warping: number | null;
    warping_to_indigo: number | null;
    indigo_to_weaving: number | null;
  };
}

export type Tab = 'owner' | 'factory' | 'jakarta';

export interface StageMeta {
  key: string;
  label: string;
  short: string;
  color: string;
}

export const STAGE_ORDER: StageMeta[] = [
  { key: 'PENDING_APPROVAL', label: 'Awaiting Approval', short: 'Pending',  color: '#D97706' },
  { key: 'WARPING',          label: 'In Warping',        short: 'Warping',  color: '#1D4ED8' },
  { key: 'INDIGO',           label: 'In Indigo',         short: 'Indigo',   color: '#0891B2' },
  { key: 'WEAVING',          label: 'In Weaving',        short: 'Weaving',  color: '#059669' },
  { key: 'INSPECT_GRAY',     label: 'Inspect Gray',      short: 'Inspect',  color: '#D97706' },
  { key: 'BBSF',             label: 'In BBSF',           short: 'BBSF',     color: '#7C3AED' },
  { key: 'INSPECT_FINISH',   label: 'Inspect Finish',    short: 'Finish',   color: '#EA580C' },
  { key: 'COMPLETE',         label: 'Complete',          short: 'Done',     color: '#059669' },
];

export const NM_TOOLTIP_STYLE = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  color: '#0F1117',
  fontSize: '12px',
};

export const axisStyle = { fontSize: 11, fill: '#9CA3AF', fontFamily: 'var(--font-sans)' };

// ================================================================
// DashboardSummary
// ================================================================
export interface RecentActivityItem {
  kp: string;
  pipeline_status: string;
  updatedAt: string;
}

export interface DashboardSummary extends SummaryData {
  recentActivity?: RecentActivityItem[];
}

// ================================================================
// STAGE_ACTIVITY_CONFIG
// ================================================================
export const STAGE_ACTIVITY_CONFIG: Record<string, { label: string; icon: string; color: string; bgColor: string }> = {
  PENDING_APPROVAL: { label: 'Awaiting Approval', icon: '⏳', color: '#D97706', bgColor: '#FFFBEB' },
  WARPING:          { label: 'In Warping',        icon: '🧵', color: '#1D4ED8', bgColor: '#EFF6FF' },
  INDIGO:           { label: 'In Indigo',          icon: '🪣', color: '#0891B2', bgColor: '#F0FDFA' },
  WEAVING:          { label: 'In Weaving',        icon: '🏭', color: '#059669', bgColor: '#ECFDF5' },
  INSPECT_GRAY:     { label: 'Inspect Gray',       icon: '🔍', color: '#D97706', bgColor: '#FFFBEB' },
  BBSF:             { label: 'In BBSF',            icon: '⚙️', color: '#7C3AED', bgColor: '#F5F3FF' },
  INSPECT_FINISH:   { label: 'Inspect Finish',    icon: '✅', color: '#EA580C', bgColor: '#FFF7ED' },
  COMPLETE:         { label: 'Complete',           icon: '🎉', color: '#059669', bgColor: '#ECFDF5' },
  REJECTED:         { label: 'Rejected',           icon: '❌', color: '#DC2626', bgColor: '#FEF2F2' },
};

// ================================================================
// STAGE_COLORS (shared across dashboard components)
// ================================================================
export const STAGE_COLORS: Record<string, string> = {
  PENDING_APPROVAL: '#D97706',
  WARPING:          '#4A7A9B',
  INDIGO:           '#0891B2',
  WEAVING:          '#059669',
  INSPECT_GRAY:    '#D97706',
  BBSF:             '#EA580C',
  INSPECT_FINISH:  '#2B506E',
  COMPLETE:         '#059669',
  REJECTED:         '#DC2626',
  DRAFT:            '#8B95A3',
  STALED:           '#8B95A3',
  APPROVED:         '#059669',
};

// ================================================================
// formatRelativeTime
// ================================================================
export function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1)  return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)   return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7)     return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

// ================================================================
// CHART_TOOLTIP_LIGHT
// ================================================================
export const CHART_TOOLTIP_LIGHT = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  fontSize: '12px',
  color: '#0F1117',
  padding: '8px 12px',
};
