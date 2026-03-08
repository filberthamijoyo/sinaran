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
  PO1: 'bg-blue-50 text-blue-700 border-blue-200',
  RP:  'bg-violet-50 text-violet-700 border-violet-200',
  SCN: 'bg-zinc-100 text-zinc-600 border-zinc-200',
};

export default function StageCard({
  stage, label, count, color, textColor, borderColor, recent,
}: StageCardProps) {
  const router = useRouter();

  return (
    <div className={`bg-white rounded-xl border shadow-sm
      overflow-hidden flex flex-col ${borderColor}`}>

      {/* Top accent bar */}
      <div className={`h-1 w-full ${color}`} />

      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center
        justify-between border-b border-zinc-100">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider
            text-zinc-500">{label}</p>
          <p className={`text-3xl font-bold mt-0.5 ${textColor}`}>
            {count}
          </p>
        </div>
        <button
          onClick={() =>
            router.push(`/denim/admin/pipeline?stage=${stage}`)
          }
          className="text-xs text-zinc-400 hover:text-blue-600
            flex items-center gap-0.5 transition-colors"
        >
          View all
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Recent orders list */}
      <div className="flex-1 divide-y divide-zinc-50">
        {recent.length === 0 ? (
          <p className="px-5 py-4 text-xs text-zinc-400 text-center">
            No orders at this stage
          </p>
        ) : (
          recent.map(order => (
            <button
              key={order.kp}
              onClick={() =>
                router.push(`/denim/admin/orders/${order.kp}`)
              }
              className="w-full px-5 py-2.5 flex items-center
                justify-between hover:bg-zinc-50 transition-colors
                text-left group"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold
                    text-zinc-800">
                    {order.kp}
                  </span>
                  {order.kat_kode && (
                    <span className={`inline-flex items-center
                      rounded border px-1.5 py-px text-[10px]
                      font-medium leading-none
                      ${TYPE_COLORS[order.kat_kode]
                        ?? 'bg-zinc-100 text-zinc-600 border-zinc-200'
                      }`}>
                      {order.kat_kode}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 truncate mt-0.5">
                  {order.codename || '—'}
                  {order.permintaan
                    ? ` · ${order.permintaan}` : ''}
                </p>
              </div>
              <div className="flex-shrink-0 ml-3 text-right">
                <p className="text-[10px] text-zinc-400">
                  {order.tgl
                    ? format(new Date(order.tgl), 'd MMM')
                    : '—'}
                </p>
                <ChevronRight className="w-3 h-3 text-zinc-200
                  group-hover:text-zinc-400 ml-auto mt-0.5
                  transition-colors" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
