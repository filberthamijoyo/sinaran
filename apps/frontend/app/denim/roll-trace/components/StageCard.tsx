'use client';

import { type LucideIcon } from 'lucide-react';
import { CheckCircle, Minus } from 'lucide-react';

export function StageCard({
  title,
  icon: Icon,
  data,
  details,
}: {
  title: string;
  icon: LucideIcon;
  data: Record<string, unknown> | null;
  details: { label: string; value: string | number | null | undefined; highlight?: boolean }[];
}) {
  const hasData = data !== null && Object.keys(data).length > 0;

  return (
    <div
      className="relative rounded-xl p-6 border border-[#E5E7EB]"
      style={{ background: '#FFFFFF' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="p-2 rounded-lg"
          style={{
            background: hasData ? 'var(--success-bg, #ECFDF5)' : 'var(--card-muted, #F7F8FA)',
            color: hasData ? 'var(--success, #059669)' : 'var(--text-muted, #9CA3AF)',
          }}
        >
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-lg" style={{ color: '#3D4852' }}>{title}</h3>
        {hasData ? (
          <CheckCircle className="w-5 h-5 ml-auto" style={{ color: 'var(--success, #059669)' }} />
        ) : (
          <Minus className="w-5 h-5 ml-auto" style={{ color: 'var(--text-muted, #9CA3AF)' }} />
        )}
      </div>

      {hasData ? (
        <div className="space-y-2">
          {details.map((detail, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span style={{ color: 'var(--text-secondary, #6B7280)' }}>{detail.label}</span>
              <span
                className={detail.highlight ? 'font-medium' : ''}
                style={{
                  color: detail.highlight ? 'var(--warning, #D97706)' : '#3D4852',
                }}
              >
                {detail.value ?? '—'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm" style={{ color: 'var(--text-muted, #9CA3AF)' }}>No data available</p>
      )}
    </div>
  );
}
