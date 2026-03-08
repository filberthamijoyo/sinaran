'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '../../../lib/authFetch';
import PageHeader from '../../layout/PageHeader';
import { Skeleton } from '../../ui/skeleton';
import {
  Package2, Clock, CheckCircle2, AlertTriangle,
  ChevronRight, TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';

interface SummaryData {
  total: number;
  recentlyCompleted: number;
  blockedCount: number;
  stageCounts: Record<string, number>;
  typeCounts: Record<string, number>;
  recentByStage: Record<string, any[]>;
}

const STAGE_ORDER = [
  { key: 'PENDING_APPROVAL', label: 'Awaiting Approval',
    short: 'Pending', color: 'bg-amber-500',
    light: 'bg-amber-50', text: 'text-amber-700',
    border: 'border-amber-200', href: '/denim/admin/pipeline?stage=PENDING_APPROVAL' },
  { key: 'WARPING', label: 'In Warping',
    short: 'Warping', color: 'bg-violet-500',
    light: 'bg-violet-50', text: 'text-violet-700',
    border: 'border-violet-200', href: '/denim/admin/warping' },
  { key: 'INDIGO', label: 'In Indigo',
    short: 'Indigo', color: 'bg-cyan-500',
    light: 'bg-cyan-50', text: 'text-cyan-700',
    border: 'border-cyan-200', href: '/denim/admin/indigo' },
  { key: 'WEAVING', label: 'In Weaving',
    short: 'Weaving', color: 'bg-teal-500',
    light: 'bg-teal-50', text: 'text-teal-700',
    border: 'border-teal-200', href: '/denim/admin/weaving' },
  { key: 'INSPECT_GRAY', label: 'Inspect Gray',
    short: 'Inspect', color: 'bg-yellow-400',
    light: 'bg-yellow-50', text: 'text-yellow-700',
    border: 'border-yellow-200', href: '/denim/admin/inspect-gray' },
  { key: 'COMPLETE', label: 'Complete',
    short: 'Done', color: 'bg-green-500',
    light: 'bg-green-50', text: 'text-green-700',
    border: 'border-green-200', href: '/denim/admin/pipeline?stage=COMPLETE' },
];

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  PO1: { label: 'Priority Order (PO1)', color: 'bg-blue-500' },
  RP:  { label: 'Running Process (RP)', color: 'bg-violet-500' },
  SCN: { label: 'Self Order (SCN)', color: 'bg-zinc-400' },
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch('/denim/admin/summary')
      .then(r => setData(r as SummaryData))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const get = (k: string) => data?.stageCounts?.[k] ?? 0;
  const totalActive = STAGE_ORDER.slice(0, 5)
    .reduce((s, st) => s + get(st.key), 0);
  const total = data?.total ?? 0;

  return (
    <div>
      <PageHeader
        title="Factory Overview"
        subtitle={
          loading ? 'Loading...'
            : `${total.toLocaleString()} total orders · ` +
              `${totalActive} active in pipeline`
        }
      />

      <div className="px-8 pb-8 space-y-6">

        {/* ── KPI row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Package2, label: 'Total Orders',
              value: loading ? '—' : total.toLocaleString(),
              sub: 'all time',
              iconCls: 'bg-zinc-100 text-zinc-500' },
            { icon: Clock, label: 'In Pipeline',
              value: loading ? '—' : totalActive.toLocaleString(),
              sub: 'pending + production',
              iconCls: 'bg-blue-50 text-blue-600' },
            { icon: CheckCircle2, label: 'Completed',
              value: loading ? '—'
                : (data?.recentlyCompleted ?? 0).toLocaleString(),
              sub: 'last 30 days',
              iconCls: 'bg-green-50 text-green-600' },
            { icon: AlertTriangle, label: 'Needs Attention',
              value: loading ? '—'
                : (data?.blockedCount ?? 0).toLocaleString(),
              sub: 'pending > 3 days',
              iconCls: 'bg-amber-50 text-amber-600' },
          ].map(k => (
            <div key={k.label}
              className="bg-white rounded-xl border
                border-zinc-200/80 shadow-sm p-5 flex gap-3.5">
              <div className={`p-2 rounded-lg h-fit ${k.iconCls}`}>
                <k.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">{k.label}</p>
                <p className="text-2xl font-bold text-zinc-900 mt-0.5">
                  {k.value}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">{k.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Pipeline funnel ── */}
        <div className="bg-white rounded-xl border border-zinc-200/80
          shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100 flex
            items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">
                Pipeline Funnel
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Click any stage to view all orders at that stage
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-zinc-300" />
          </div>

          <div className="p-6">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {STAGE_ORDER.map((stage, i) => {
                  const count = get(stage.key);
                  const maxCount = Math.max(
                    ...STAGE_ORDER.map(s => get(s.key)), 1
                  );
                  const barPct = Math.max(
                    (count / maxCount) * 100, 2
                  );

                  return (
                    <button
                      key={stage.key}
                      onClick={() => router.push(stage.href)}
                      className="w-full flex items-center gap-4
                        p-3 rounded-lg hover:bg-zinc-50
                        transition-colors group text-left"
                    >
                      {/* Stage number */}
                      <span className="w-5 text-xs text-zinc-400
                        font-mono flex-shrink-0 text-center">
                        {i + 1}
                      </span>

                      {/* Stage label */}
                      <div className="w-36 flex-shrink-0">
                        <span className={`inline-flex items-center
                          rounded-md border px-2 py-0.5 text-xs
                          font-medium ${stage.light} ${stage.text}
                          ${stage.border}`}>
                          {stage.short}
                        </span>
                      </div>

                      {/* Bar */}
                      <div className="flex-1 h-7 bg-zinc-100
                        rounded-md overflow-hidden relative">
                        <div
                          className={`h-full rounded-md transition-all
                            duration-500 ${stage.color} opacity-80`}
                          style={{ width: `${barPct}%` }}
                        />
                        {count > 0 && (
                          <span className="absolute left-3 top-1/2
                            -translate-y-1/2 text-xs font-bold
                            text-white mix-blend-plus-lighter">
                            {count}
                          </span>
                        )}
                      </div>

                      {/* Count + arrow */}
                      <div className="w-16 flex items-center
                        justify-end gap-1.5 flex-shrink-0">
                        <span className="text-sm font-semibold
                          text-zinc-700">
                          {count}
                        </span>
                        <span className="text-xs text-zinc-400">
                          orders
                        </span>
                        <ChevronRight className="w-3.5 h-3.5
                          text-zinc-300 group-hover:text-zinc-500
                          transition-colors" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Order type breakdown ── */}
        {!loading && data && (
          <div className="bg-white rounded-xl border
            border-zinc-200/80 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-zinc-900 mb-5">
              Order Type Breakdown
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.entries(data.typeCounts)
                .filter(([k]) => k && k !== 'UNKNOWN')
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([type, count]) => {
                  const cfg = TYPE_CONFIG[type] ?? {
                    label: type,
                    color: 'bg-zinc-400'
                  };
                  const pct = total > 0
                    ? ((count / total) * 100).toFixed(1) : '0';
                  return (
                    <div key={type}
                      className="flex items-center gap-4 p-4
                        rounded-lg border border-zinc-100
                        hover:border-zinc-200 hover:bg-zinc-50
                        transition-colors cursor-pointer"
                      onClick={() =>
                        router.push(
                          `/denim/admin/orders?type=${type}`
                        )
                      }
                    >
                      <div className={`w-2 h-10 rounded-full
                        flex-shrink-0 ${cfg.color}`} />
                      <div>
                        <p className="text-xs text-zinc-500">
                          {cfg.label}
                        </p>
                        <p className="text-2xl font-bold
                          text-zinc-900 mt-0.5">
                          {count.toLocaleString()}
                        </p>
                        <p className="text-xs text-zinc-400">
                          {pct}% of total
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ── Recent bottlenecks ── */}
        {!loading && data && (data?.blockedCount ?? 0) > 0 && (
          <div className="bg-amber-50 rounded-xl border
            border-amber-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-semibold text-amber-800">
                Needs Attention
              </h2>
              <span className="ml-auto text-xs text-amber-600 font-medium">
                {data.blockedCount} order
                {data.blockedCount !== 1 ? 's' : ''}
                {' '}pending {">"} 3 days
              </span>
            </div>
            <p className="text-xs text-amber-700">
              These orders are waiting for Jakarta approval for more
              than 3 days. Go to{' '}
              <button
                onClick={() =>
                  router.push('/denim/admin/pipeline?stage=PENDING_APPROVAL')
                }
                className="underline font-medium hover:text-amber-900"
              >
                Pending Approval
              </button>
              {' '}to review.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
