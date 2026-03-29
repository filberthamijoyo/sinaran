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
    <div className="rounded-2xl overflow-hidden bg-[#F7F8FA] border border-[#E5E7EB] flex flex-col">

      {/* Top accent bar */}
      <div style={{ height: '4px', width: '100%', background: color || '#6C63FF' }} />

      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-[#E5E7EB]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">{label}</p>
          <p className="text-3xl font-bold mt-0.5 text-[#0F1117]">
            {count}
          </p>
        </div>
        <button
          onClick={() =>
            router.push(`/denim/admin/pipeline?stage=${stage}`)
          }
          className="text-xs flex items-center gap-0.5 transition-colors text-[#6B7280]"
        >
          View all
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Recent orders list */}
      <div className="flex-1">
        {recent.length === 0 ? (
          <p className="px-5 py-4 text-xs text-center text-[#9CA3AF]">
            No orders at this stage
          </p>
        ) : (
          recent.map(order => (
            <button
              key={order.kp}
              onClick={() =>
                router.push(`/denim/admin/orders/${order.kp}`)
              }
              className="w-full px-5 py-2.5 flex items-center justify-between text-left group border-b border-[#E5E7EB] last:border-b-0"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-[#0F1117]">
                    {order.kp}
                  </span>
                  {order.kat_kode && (
                    <span className="inline-flex items-center rounded-full px-1.5 py-px text-[10px] font-medium leading-none bg-[#F3F4F6] text-[#6B7280]">
                      {order.kat_kode}
                    </span>
                  )}
                </div>
                <p className="text-xs truncate mt-0.5 text-[#6B7280]">
                  {order.codename || '—'}
                  {order.permintaan
                    ? ` · ${order.permintaan}` : ''}
                </p>
              </div>
              <div className="flex-shrink-0 ml-3 text-right">
                <p className="text-[10px] text-[#9CA3AF]">
                  {order.tgl
                    ? format(new Date(order.tgl), 'd MMM')
                    : '—'}
                </p>
                <ChevronRight className="w-3 h-3 ml-auto mt-0.5 transition-colors text-[#9CA3AF]" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
