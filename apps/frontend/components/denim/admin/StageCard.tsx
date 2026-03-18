'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface RecentOrder {
  kp: string;
  tgl: string;
  codename: string | null;
  permintaan: string | null;
  kat_kode: string | null;
  te: number | null;
}

interface StageCardProps {
  stage: string;
  label: string;
  count: number;
  color: string;       // Tailwind bg class for the top accent
  textColor: string;   // Tailwind text class for count
  borderColor: string; // Tailwind border class
  recent: RecentOrder[];
}

const TYPE_COLORS: Record<string, string> = {
  PO1: 'text-[#6C63FF]',
  RP:  'text-[#6C63FF]',
  SCN: 'text-[#6B7280]',
};

export default function StageCard({
  stage, label, count, color, textColor, borderColor, recent,
}: StageCardProps) {
  const router = useRouter();

  return (
    <div style={{
      background: '#E0E5EC',
      borderRadius: '32px',
      overflow: 'hidden',
      flex: 'flex',
      flexDirection: 'column',
      boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
    }}>

      {/* Top accent bar */}
      <div style={{ height: '4px', width: '100%', background: color || '#6C63FF' }} />

      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgb(163 177 198 / 0.3)' }}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7280' }}>{label}</p>
          <p className="text-3xl font-bold mt-0.5" style={{ color: '#3D4852' }}>
            {count}
          </p>
        </div>
        <button
          onClick={() =>
            router.push(`/denim/admin/pipeline?stage=${stage}`)
          }
          className="text-xs flex items-center gap-0.5 transition-colors"
          style={{ color: '#6B7280' }}
        >
          View all
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Recent orders list */}
      <div className="flex-1">
        {recent.length === 0 ? (
          <p className="px-5 py-4 text-xs text-center" style={{ color: '#9CA3AF' }}>
            No orders at this stage
          </p>
        ) : (
          recent.map(order => (
            <button
              key={order.kp}
              onClick={() =>
                router.push(`/denim/admin/orders/${order.kp}`)
              }
              className="w-full px-5 py-2.5 flex items-center justify-between text-left group"
              style={{ borderBottom: '1px solid rgb(163 177 198 / 0.3)' }}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold" style={{ color: '#3D4852' }}>
                    {order.kp}
                  </span>
                  {order.kat_kode && (
                    <span className="inline-flex items-center rounded-[9999px] px-1.5 py-px text-[10px] font-medium leading-none" style={{ background: '#E0E5EC', color: TYPE_COLORS[order.kat_kode] || '#6B7280', boxShadow: '3px 3px 6px rgb(163 177 198 / 0.6), -3px -3px 6px rgba(255,255,255,0.5)' }}>
                      {order.kat_kode}
                    </span>
                  )}
                </div>
                <p className="text-xs truncate mt-0.5" style={{ color: '#6B7280' }}>
                  {order.codename || '—'}
                  {order.permintaan
                    ? ` · ${order.permintaan}` : ''}
                </p>
              </div>
              <div className="flex-shrink-0 ml-3 text-right">
                <p className="text-[10px]" style={{ color: '#9CA3AF' }}>
                  {order.tgl
                    ? format(new Date(order.tgl), 'd MMM')
                    : '—'}
                </p>
                <ChevronRight className="w-3 h-3 ml-auto mt-0.5 transition-colors" style={{ color: '#9CA3AF' }} />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
