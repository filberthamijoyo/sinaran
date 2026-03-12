'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '../lib/authFetch';
import PageHeader from '../layout/PageHeader';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { Loader2, RefreshCw, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

type WeavingRecord = {
  id: number;
  tanggal: string;
  shift: string;
  machine: string | null;
  a_pct: number | null;
  meters: number | null;
  source: string | null;
};

type WeavingSummary = {
  totalRecords: number;
  avgEfficiency: number | null;
  totalMeters: number;
  uniqueMachines: number;
  firstDate: string;
  lastDate: string;
};

type PipelineData = {
  sc: { kp: string; codename: string | null; permintaan: string | null; pipeline_status: string } | null;
  weaving: WeavingRecord[];
  weavingSummary: WeavingSummary | null;
};

const SHIFT_LABEL: Record<string, string> = {
  '1': 'Shift 1  ·  06:00 – 13:59',
  '2': 'Shift 2  ·  14:00 – 21:59',
  '3': 'Shift 3  ·  22:00 – 05:59',
};

function effColor(v: number | null) {
  if (v == null) return 'text-zinc-400';
  if (v >= 80) return 'text-emerald-600';
  if (v >= 70) return 'text-amber-500';
  return 'text-red-500';
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5">
      <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-semibold text-zinc-900 tracking-tight">{value}</p>
      {sub && <p className="text-xs text-zinc-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function WeavingFormPage({ kp }: { kp: string }) {
  const router = useRouter();
  const [data, setData] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`/denim/admin/pipeline/${kp}`) as PipelineData;
      setData(res);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load weaving data');
    } finally {
      setLoading(false);
    }
  }, [kp]);

  useEffect(() => { load(); }, [load]);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await authFetch('/denim/weaving', {
        method: 'POST',
        body: JSON.stringify({ kp }),
      });
      toast.success('Weaving complete. Moving to Inspect Gray.');
      router.push('/denim/inbox/weaving');
    } catch (e: any) {
      toast.error(e.message || 'Failed to confirm weaving');
    } finally {
      setConfirming(false);
    }
  };

  const records = data?.weaving ?? [];
  const summary = data?.weavingSummary;
  const hasData = records.length > 0;

  // Group by date → shift
  const grouped = records.reduce((acc, r) => {
    const dateKey = format(new Date(r.tanggal), 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = {} as Record<string, WeavingRecord[]>;
    const s = String(r.shift);
    if (!acc[dateKey][s]) acc[dateKey][s] = [];
    acc[dateKey][s].push(r);
    return acc;
  }, {} as Record<string, Record<string, WeavingRecord[]>>);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-start justify-between">
        <PageHeader
          title="Weaving Production"
          subtitle={data?.sc ? `${kp} · ${data.sc.codename ?? ''}` : kp}
        />
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="mt-1">
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <Skeleton className="h-48 rounded-xl" />
        </div>
      )}

      {/* Empty state */}
      {!loading && !hasData && (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-zinc-200 rounded-2xl text-zinc-400 gap-3">
          <Clock className="w-8 h-8" />
          <p className="font-medium text-zinc-600">Waiting for production data</p>
          <p className="text-sm text-center max-w-xs">
            TRIPUTRA sync will populate this automatically once looms start running on this KP.
          </p>
        </div>
      )}

      {/* Data loaded */}
      {!loading && hasData && (
        <>
          {/* Summary stats */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Records" value={summary.totalRecords} />
              <StatCard
                label="Avg Efficiency"
                value={summary.avgEfficiency != null ? `${summary.avgEfficiency.toFixed(1)}%` : '—'}
              />
              <StatCard
                label="Total Meters"
                value={`${summary.totalMeters.toFixed(1)} m`}
              />
              <StatCard
                label="Machines"
                value={summary.uniqueMachines}
                sub={`${format(new Date(summary.firstDate), 'd MMM')} – ${format(new Date(summary.lastDate), 'd MMM yyyy')}`}
              />
            </div>
          )}

          {/* Production records */}
          <div className="space-y-6">
            {Object.entries(grouped).sort(([a],[b]) => a.localeCompare(b)).map(([dateKey, shifts]) => (
              <div key={dateKey}>
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">
                  {format(new Date(dateKey), 'EEEE, d MMMM yyyy')}
                </p>
                <div className="space-y-2">
                  {Object.entries(shifts).sort(([a],[b]) => a.localeCompare(b)).map(([shift, rows]) => (
                    <div key={shift} className="border border-zinc-200 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between bg-zinc-50 px-4 py-2.5 border-b border-zinc-200">
                        <p className="text-xs font-semibold text-zinc-600">
                          {SHIFT_LABEL[shift] ?? `Shift ${shift}`}
                        </p>
                        <p className="text-xs text-zinc-400">{rows.length} machine{rows.length !== 1 ? 's' : ''}</p>
                      </div>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-zinc-100">
                            <th className="text-left px-4 py-2 text-xs font-medium text-zinc-400">Machine</th>
                            <th className="text-right px-4 py-2 text-xs font-medium text-zinc-400">Efficiency</th>
                            <th className="text-right px-4 py-2 text-xs font-medium text-zinc-400">Meters</th>
                            <th className="text-right px-4 py-2 text-xs font-medium text-zinc-400">Source</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map(r => (
                            <tr key={r.id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50 transition-colors">
                              <td className="px-4 py-3 font-medium text-zinc-800">{r.machine ?? '—'}</td>
                              <td className={`px-4 py-3 text-right font-semibold tabular-nums ${effColor(r.a_pct)}`}>
                                {r.a_pct != null ? `${Number(r.a_pct).toFixed(1)}%` : '—'}
                              </td>
                              <td className="px-4 py-3 text-right text-zinc-600 tabular-nums">
                                {r.meters != null ? `${Number(r.meters).toFixed(1)} m` : '—'}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium ${
                                  r.source === 'TRIPUTRA'
                                    ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100'
                                    : 'bg-zinc-100 text-zinc-500'
                                }`}>
                                  {r.source ?? 'MANUAL'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Confirm action */}
          <div className="border border-zinc-200 rounded-2xl p-6 bg-zinc-50">
            <div className="flex items-start justify-between gap-6">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-zinc-800">Ready to close this weaving job?</p>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                    Review all production records above before confirming. Once marked complete, this order moves to
                    <span className="font-medium text-zinc-700"> Inspect Gray</span> and cannot be undone.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleConfirm}
                disabled={confirming}
                className="shrink-0 bg-zinc-900 hover:bg-zinc-700 text-white px-5"
              >
                {confirming
                  ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Confirming…</>
                  : <><CheckCircle2 className="w-4 h-4 mr-2" />Mark Weaving Complete</>
                }
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
