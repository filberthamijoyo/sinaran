import { cn } from '../../lib/utils';

type Status =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'WARPING'
  | 'INDIGO'
  | 'WEAVING'
  | 'INSPECT_GRAY'
  | 'COMPLETE';

const config: Record<Status, { label: string; className: string }> = {
  DRAFT: {
    label: 'Draft',
    className: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  },
  PENDING_APPROVAL: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  APPROVED: {
    label: 'Approved',
    className: 'bg-green-50 text-green-700 border-green-200',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  WARPING: {
    label: 'Warping',
    className: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  INDIGO: {
    label: 'Indigo',
    className: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  WEAVING: {
    label: 'Weaving',
    className: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  INSPECT_GRAY: {
    label: 'Inspect Gray',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
  COMPLETE: {
    label: 'Complete',
    className: 'bg-green-50 text-green-700 border-green-200',
  },
};

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({
  status,
  size = 'sm',
}: StatusBadgeProps) {
  const s = status as Status;
  const c = config[s] ?? {
    label: status,
    className: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        c.className
      )}
    >
      {c.label}
    </span>
  );
}
