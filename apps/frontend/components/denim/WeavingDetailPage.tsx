'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/lib/authFetch';
import { PageShell } from '@/components/ui/erp/PageShell';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

type MachineRow = {
  machine: string;
  recordCount: number;
  avgA: number;
  avgP: number;
  totalMeters: number;
  firstDate: string | null;
  lastDate: string | null;
};

type RecentLog = {
  tanggal: string | null;
  shift: string;
  machine: string;
  meters: number;
  a: number | null;
  p: number | null;
};

type SummaryData = {
  machines: MachineRow[];
  recentLogs: RecentLog[];
  totalMeters: number;
  avgEfficiency: number | null;
  daysActive: number;
};

type ScData = {
  kp: string;
  codename: string | null;
  permintaan: string | null;
  pipeline_status: string;
  te: number | null;
};

type PipelineData = {
  sc: ScData | null;
  weavingSummary: SummaryData | null;
  weaving: Array<{ id: number; tanggal: string; shift: string; machine: string | null; a_pct: number | null; meters: number | null; p_pct: number | null }>;
};

const SHIFT_LABEL: Record<string, string> = {
  '1': 'Shift 1  ·  06:00 – 13:59',
  '2': 'Shift 2  ·  14:00 – 21:59',
  '3': 'Shift 3  ·  22:00 – 05:59',
};

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: 12,
      padding: '16px 20px',
    }}>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 700, color: '#0F1E2E' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function EffPill({ value, suffix = '%' }: { value: number | null; suffix?: string }) {
  if (value == null) return <span style={{ color: '#9CA3AF', fontSize: 13 }}>—</span>;
  const color = value >= 80 ? '#059669' : value >= 70 ? '#D97706' : '#DC2626';
  return (
    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600, color }}>
      {value.toFixed(1)}{suffix}
    </span>
  );
}

export default function WeavingDetailPage({ kp }: { kp: string }) {
  const router = useRouter();
  const [data, setData] = useState<PipelineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch<PipelineData>(`/denim/admin/pipeline/${kp}`);
      setData(res);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load weaving data';
      toast.error(message);
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
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to confirm weaving';
      toast.error(message);
    } finally {
      setConfirming(false);
      setShowConfirmModal(false);
    }
  };

  const sc = data?.sc;
  const summary = data?.weavingSummary;
  const records = data?.weaving ?? [];
  const hasData = records.length > 0;

  const subtitleParts = [sc?.codename ?? null, sc?.permintaan ?? null].filter(Boolean);
  const subtitle = subtitleParts.length > 0 ? subtitleParts.join(' · ') : undefined;

  const actions = (
    <Button variant="ghost" size="sm" onClick={() => router.back()}>
      ← Back
    </Button>
  );

  return (
    <PageShell title="Weaving Production" subtitle={subtitle} actions={actions} noPadding>
      <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {[0, 1, 2, 3].map(i => <Skeleton key={i} style={{ height: 72, borderRadius: 12 }} />)}
            </div>
            <Skeleton style={{ height: 300, borderRadius: 12 }} />
          </div>
        )}

        {!loading && !hasData && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '64px 32px', gap: 12,
            background: '#F7F8FA', border: '1px solid #E5E7EB', borderRadius: 12,
          }}>
            <AlertTriangle style={{ color: '#9CA3AF', width: 32, height: 32 }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: '#6B7280' }}>Waiting for production data</p>
            <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', maxWidth: 360 }}>
              TRIPUTRA sync will populate this automatically once looms start running on this KP.
            </p>
            <Button variant="secondary" size="sm" onClick={load} leftIcon={<RefreshCw size={13} />}>
              Refresh
            </Button>
          </div>
        )}

        {!loading && hasData && (
          <>
            {/* Summary tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              <StatTile
                label="Total Meters Woven"
                value={summary?.totalMeters != null ? `${summary.totalMeters.toLocaleString('id-ID')} m` : '—'}
                sub={summary?.daysActive ? `${summary.daysActive} day${summary.daysActive !== 1 ? 's' : ''} active` : undefined}
              />
              <StatTile
                label="Avg Efficiency (A%)"
                value={summary?.avgEfficiency != null ? `${(summary.avgEfficiency).toFixed(1)}%` : '—'}
                sub={summary?.machines.length ? `${summary.machines.length} machine${summary.machines.length !== 1 ? 's' : ''}` : undefined}
              />
              <StatTile
                label="Avg Pick (P%)"
                value={summary?.machines.length
                  ? (summary.machines.reduce((s, m) => s + m.avgP, 0) / summary.machines.length).toFixed(1) + '%'
                  : '—'}
              />
              <StatTile
                label="Days Active"
                value={String(summary?.daysActive ?? 0)}
              />
            </div>

            {/* Machine breakdown */}
            {summary && summary.machines.length > 0 && (
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: 12,
                overflow: 'hidden',
              }}>
                <div style={{
                  padding: '12px 20px',
                  borderBottom: '1px solid #E5E7EB',
                  background: '#F9FAFB',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Machine Breakdown</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                      {['MACHINE', 'RECORDS', 'METERS', 'A%', 'P%', 'LAST ACTIVE'].map(h => (
                        <th key={h} style={{
                          padding: '10px 16px',
                          fontSize: 11, fontWeight: 500,
                          color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em',
                          textAlign: h === 'MACHINE' ? 'left' : 'right',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {summary.machines.map((row, i) => (
                      <tr key={row.machine} style={{
                        borderBottom: i < summary.machines.length - 1 ? '1px solid #F3F4F6' : 'none',
                        background: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                      }}>
                        <td style={{ padding: '10px 16px', fontWeight: 600, color: '#0F1E2E' }}>
                          {row.machine}
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: 13, color: '#6B7280', textAlign: 'right' }}>
                          {row.recordCount}
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", color: '#6B7280', textAlign: 'right' }}>
                          {row.totalMeters.toLocaleString('id-ID')} m
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'right' }}><EffPill value={row.avgA} /></td>
                        <td style={{ padding: '10px 16px', textAlign: 'right' }}><EffPill value={row.avgP} /></td>
                        <td style={{ padding: '10px 16px', fontSize: 12, color: '#9CA3AF', textAlign: 'right' }}>
                          {row.lastDate ? format(new Date(row.lastDate), 'd MMM yyyy') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Recent datalog */}
            {summary && summary.recentLogs.length > 0 && (
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: 12,
                overflow: 'hidden',
              }}>
                <div style={{
                  padding: '12px 20px',
                  borderBottom: '1px solid #E5E7EB',
                  background: '#F9FAFB',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Recent Datalog (Last 10)</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                      {['DATE', 'SHIFT', 'MACHINE', 'METERS', 'A%', 'P%'].map(h => (
                        <th key={h} style={{
                          padding: '10px 16px',
                          fontSize: 11, fontWeight: 500,
                          color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em',
                          textAlign: h === 'DATE' || h === 'SHIFT' || h === 'MACHINE' ? 'left' : 'right',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {summary.recentLogs.map((row, i) => (
                      <tr key={i} style={{
                        borderBottom: i < summary.recentLogs.length - 1 ? '1px solid #F3F4F6' : 'none',
                        background: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                      }}>
                        <td style={{ padding: '10px 16px', fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>
                          {row.tanggal ? format(new Date(row.tanggal), 'd MMM yyyy') : '—'}
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: 12, color: '#6B7280' }}>
                          {SHIFT_LABEL[row.shift] ?? `Shift ${row.shift}`}
                        </td>
                        <td style={{ padding: '10px 16px', fontWeight: 600, fontSize: 13, color: '#0F1E2E' }}>
                          {row.machine}
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", color: '#6B7280', textAlign: 'right' }}>
                          {row.meters.toLocaleString('id-ID')} m
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'right' }}><EffPill value={row.a} /></td>
                        <td style={{ padding: '10px 16px', textAlign: 'right' }}><EffPill value={row.p} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Confirm complete */}
            <div style={{
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: 12,
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 16,
            }}>
              <AlertTriangle style={{ color: '#D97706', width: 20, height: 20, marginTop: 2, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#92400E', marginBottom: 4 }}>Ready to close this weaving job?</p>
                <p style={{ fontSize: 13, color: '#92400E', lineHeight: 1.5 }}>
                  Review all production records above before confirming. Once marked complete, this order moves to
                  {' '}<strong>Inspect Gray</strong> and cannot be undone.
                </p>
              </div>
              <Button
                onClick={() => setShowConfirmModal(true)}
                style={{ background: '#1D4ED8', color: '#FFFFFF', border: 'none', flexShrink: 0 }}
              >
                <CheckCircle2 size={14} style={{ marginRight: 6 }} />
                Mark Weaving Complete
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Confirm modal */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.50)',
          backdropFilter: 'blur(4px)',
          zIndex: 50,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          paddingTop: '15vh',
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 16,
            padding: '28px 32px',
            width: 480, maxWidth: '90vw',
            boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F1E2E', marginBottom: 6 }}>
              Confirm Weaving Complete
            </h2>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>
              KP <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#1D4ED8', fontWeight: 600 }}>{kp}</span>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { label: 'Total Meters', value: summary?.totalMeters != null ? `${summary.totalMeters.toLocaleString('id-ID')} m` : '—' },
                { label: 'Avg Efficiency', value: summary?.avgEfficiency != null ? `${(summary.avgEfficiency).toFixed(1)}%` : '—' },
                { label: 'Machines', value: String(summary?.machines.length ?? 0) },
                { label: 'Days Active', value: String(summary?.daysActive ?? 0) },
              ].map(row => (
                <div key={row.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  height: 36, borderBottom: '1px solid #F3F4F6',
                }}>
                  <span style={{ fontSize: 12, color: '#9CA3AF' }}>{row.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#0F1E2E' }}>{row.value}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  height: 36, padding: '0 16px', borderRadius: 8,
                  background: '#FFFFFF', border: '1px solid #E5E7EB',
                  color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Cancel
              </button>
              <Button
                onClick={handleConfirm}
                loading={confirming}
                style={{ background: '#1D4ED8', color: '#FFFFFF', border: 'none' }}
              >
                Confirm &amp; Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
