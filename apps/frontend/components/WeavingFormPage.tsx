'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/lib/authFetch';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, RefreshCw, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
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

export default function WeavingFormPage({ kp }: { kp?: string }) {
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
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl gap-3" style={{ background: '#E0E5EC', boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)', color: '#9CA3AF' }}>
          <Clock className="w-8 h-8" />
          <p className="font-medium" style={{ color: '#6B7280' }}>Waiting for production data</p>
          <p className="text-sm text-center max-w-xs" style={{ color: '#9CA3AF' }}>
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
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>
                  {format(new Date(dateKey), 'EEEE, d MMMM yyyy')}
                </p>
                <div className="space-y-2">
                  {Object.entries(shifts).sort(([a],[b]) => a.localeCompare(b)).map(([shift, rows]) => (
                    <div key={shift} style={{ background: '#E0E5EC', boxShadow: '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)', borderRadius: '20px', overflow: 'hidden' }}>
                      <div className="flex items-center justify-between px-4 py-2.5" style={{ background: '#E0E5EC', borderBottom: '1px solid rgb(163 177 198 / 0.3)' }}>
                        <p className="text-xs font-semibold" style={{ color: '#6B7280' }}>
                          {SHIFT_LABEL[shift] ?? `Shift ${shift}`}
                        </p>
                        <p className="text-xs" style={{ color: '#9CA3AF' }}>{rows.length} machine{rows.length !== 1 ? 's' : ''}</p>
                      </div>
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ background: '#E0E5EC', borderBottom: '1px solid rgb(163 177 198 / 0.3)' }}>
                            <th className="text-left px-4 py-2 text-xs font-medium" style={{ color: '#9CA3AF' }}>Machine</th>
                            <th className="text-right px-4 py-2 text-xs font-medium" style={{ color: '#9CA3AF' }}>Efficiency</th>
                            <th className="text-right px-4 py-2 text-xs font-medium" style={{ color: '#9CA3AF' }}>Meters</th>
                            <th className="text-right px-4 py-2 text-xs font-medium" style={{ color: '#9CA3AF' }}>Source</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map(r => (
                            <tr key={r.id} style={{ background: '#E0E5EC', borderBottom: '1px solid rgb(163 177 198 / 0.3)' }}>
                              <td className="px-4 py-3 font-medium" style={{ color: '#3D4852' }}>{r.machine ?? '—'}</td>
                              <td className="px-4 py-3 text-right font-semibold tabular-nums" style={{ color: '#3D4852' }}>
                                {r.a_pct != null ? `${Number(r.a_pct).toFixed(1)}%` : '—'}
                              </td>
                              <td className="px-4 py-3 text-right tabular-nums" style={{ color: '#6B7280' }}>
                                {r.meters != null ? `${Number(r.meters).toFixed(1)} m` : '—'}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center',
                                  fontSize: '12px', padding: '2px 8px', borderRadius: '9999px',
                                  background: r.source === 'TRIPUTRA' ? 'rgba(108, 99, 255, 0.15)' : 'rgb(163 177 198 / 0.2)',
                                  color: r.source === 'TRIPUTRA' ? '#6C63FF' : '#9CA3AF',
                                  fontWeight: 600
                                }}>
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
          <div style={{ background: '#E0E5EC', boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)', borderRadius: '24px', padding: '24px' }}>
            <div className="flex items-start justify-between gap-6">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#D97706' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#3D4852' }}>Ready to close this weaving job?</p>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: '#9CA3AF' }}>
                    Review all production records above before confirming. Once marked complete, this order moves to
                    <span className="font-medium" style={{ color: '#6B7280' }}> Inspect Gray</span> and cannot be undone.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleConfirm}
                disabled={confirming}
                style={{ background: '#6C63FF', color: '#fff', borderRadius: '16px', border: 'none', boxShadow: '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)', padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}
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
