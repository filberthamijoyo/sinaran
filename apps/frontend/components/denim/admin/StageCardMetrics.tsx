'use client';

import React, { useRef, useCallback } from 'react';
import { motion, useTransform, useMotionValue } from 'framer-motion';
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

interface StageCardMetricsProps {
  recent: RecentOrder[];
}

const TYPE_COLORS: Record<string, string> = {
  PO1: 'text-[#003D6B]',
  RP:  'text-[#003D6B]',
  SCN: 'text-[#4B5563]',
};

export default function StageCardMetrics({ recent }: StageCardMetricsProps) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduce = false;
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const opacity = useMotionValue(0);
  const bg = useTransform([glowX, glowY, opacity], ([x, y, o]) =>
    `radial-gradient(circle at ${x}% ${y}%, rgba(0,61,107,0.09) 0%, transparent 55%)`
  );

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    glowX.set(((e.clientX - rect.left) / rect.width)  * 100);
    glowY.set(((e.clientY - rect.top)  / rect.height) * 100);
    opacity.set(1);
  }, [shouldReduce, glowX, glowY, opacity]);

  const onMouseLeave = useCallback(() => {
    opacity.set(0);
  }, [opacity]);

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ position: 'relative', overflow: 'hidden', borderRadius: 'inherit' }}
    >
      <motion.div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: bg,
          opacity,
          transition: 'opacity 200ms',
          pointerEvents: 'none',
          borderRadius: 'inherit',
          zIndex: 1,
        }}
      />
      <div style={{ position: 'relative', zIndex: 2 }}>
        {recent.length === 0 ? (
          <p className="px-5 py-4 text-xs text-center" style={{ color: '#9CA3AF' }}>
            No orders at this stage
          </p>
        ) : (
          recent.map((order, idx) => (
            <button
              key={order.kp}
              onClick={() => router.push(`/denim/admin/orders/${order.kp}`)}
              className="w-full px-5 py-2.5 flex items-start justify-between text-left group transition-colors"
              style={{ borderBottom: idx < recent.length - 1 ? '1px solid rgba(193,199,206,0.5)' : 'none' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,61,107,0.04)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="kp-code">{order.kp}</span>
                  {order.kat_kode && (
                    <span
                      className="inline-flex items-center rounded-[9999px] px-1.5 py-px text-[10px] font-medium leading-none"
                      style={{
                        background: '#E2EBF3',
                        color: TYPE_COLORS[order.kat_kode] || '#4B5563',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                      }}
                    >
                      {order.kat_kode}
                    </span>
                  )}
                </div>
                <p className="text-xs truncate mt-0.5" style={{ color: '#4B5563' }}>
                  {order.codename || '—'}
                  {order.permintaan ? ` · ${order.permintaan}` : ''}
                </p>
              </div>
              <div className="flex-shrink-0 ml-3 text-right">
                <p className="text-[10px]" style={{ color: '#9CA3AF' }}>
                  {order.tgl ? format(new Date(order.tgl), 'd MMM') : '—'}
                </p>
                <ChevronRight
                  className="w-3 h-3 ml-auto mt-0.5 transition-transform group-hover:translate-x-0.5"
                  style={{ color: '#9CA3AF' }}
                />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
