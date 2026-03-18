import { cn } from '../../lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: 'default' | 'green' | 'amber' | 'red' | 'blue';
  className?: string;
}

const accentMap = {
  default: '#3D4852',
  green:   '#16A34A',
  amber:   '#D97706',
  red:     '#DC2626',
  blue:    '#6C63FF',
};

export function StatCard({ label, value, sub, accent = 'default', className }: StatCardProps) {
  return (
    <div
      className={cn('rounded-[24px] p-5 transition-all duration-300', className)}
      style={{ background: '#E0E5EC', boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)' }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-2" style={{ color: '#9CA3AF' }}>
        {label}
      </p>
      <p className="text-2xl font-bold tracking-tight font-display" style={{ color: accentMap[accent] }}>
        {value}
      </p>
      {sub && (
        <p className="text-xs mt-1.5" style={{ color: '#6B7280' }}>{sub}</p>
      )}
    </div>
  );
}