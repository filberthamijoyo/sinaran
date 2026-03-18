import { cn } from '../../lib/utils';

type Status =
  | 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'
  | 'WARPING' | 'INDIGO' | 'WEAVING' | 'INSPECT_GRAY'
  | 'BBSF' | 'INSPECT_FINISH' | 'COMPLETE';

const config: Record<Status, { label: string; color: string; dot: string }> = {
  DRAFT:           { label: 'Draft',          color: '#6B7280', dot: '#9CA3AF' },
  PENDING_APPROVAL:{ label: 'Pending',        color: '#D97706', dot: '#F59E0B' },
  APPROVED:        { label: 'Approved',       color: '#16A34A', dot: '#22C55E' },
  REJECTED:        { label: 'Rejected',       color: '#DC2626', dot: '#EF4444' },
  WARPING:         { label: 'Warping',        color: '#6C63FF', dot: '#8B84FF' },
  INDIGO:          { label: 'Indigo',         color: '#0891B2', dot: '#22D3EE' },
  WEAVING:         { label: 'Weaving',        color: '#16A34A', dot: '#22C55E' },
  INSPECT_GRAY:    { label: 'Inspect Gray',   color: '#D97706', dot: '#FBBF24' },
  BBSF:            { label: 'BBSF',           color: '#7C3AED', dot: '#A78BFA' },
  INSPECT_FINISH:  { label: 'Inspect Finish', color: '#EA580C', dot: '#FB923C' },
  COMPLETE:        { label: 'Complete',       color: '#16A34A', dot: '#22C55E' },
};

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const s = status as Status;
  const c = config[s] ?? { label: status, color: '#6B7280', dot: '#9CA3AF' };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
      style={{
        background: '#E0E5EC',
        color: c.color,
        boxShadow: '3px 3px 6px rgb(163 177 198 / 0.5), -3px -3px 6px rgba(255,255,255,0.5)',
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.dot }} />
      {c.label}
    </span>
  );
}