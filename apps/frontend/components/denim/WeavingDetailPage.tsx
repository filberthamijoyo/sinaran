'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/lib/authFetch';
import { PageShell } from '@/components/ui/erp/PageShell';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { RefreshCw, AlertTriangle } from 'lucide-react';

type MachineRow = {
  machine: string;
  recordCount: number;
  avgA: number;
  avgP: number;
  totalMeters: number;
  firstDate: string | null;
  lastDate: string | null;
};

type LogRow = {
  tanggal: string | null;
  shift: string;
  machine: string;
  meters: number;
  a: number | null;
  p: number | null;
};

type SummaryData = {
  machines: MachineRow[];
  recentLogs: LogRow[];
  totalMeters: number;
  avgEfficiency: number | null;
  daysActive: number;
};

type SortKey = 'tanggal' | 'shift' | 'machine' | 'meters' | 'a' | 'p';
type SortDir = 'asc' | 'desc';

const SHIFT_LABEL: Record<string, string> = {
  '1': 'Shift 1  ·  06:00 – 13:59',
  '2': 'Shift 2  ·  14:00 – 21:59',
  '3': 'Shift 3  ·  22:00 – 05:59',
};

const PAGE_SIZE = 20;

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

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span style={{ marginLeft: 4, fontSize: 10, color: active ? '#1D4ED8' : '#D1D5DB' }}>
      {dir === 'asc' ? '▲' : '▼'}
    </span>
  );
}

function DatlogTable({
  rows,
}: {
  rows: LogRow[];
}) {
  const [sortKey, setSortKey] = useState<SortKey>('tanggal');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setPage(1);
  };

  const sorted = [...rows].sort((a, b) => {
    let av: string | number = '', bv: string | number = '';
    switch (sortKey) {
      case 'tanggal': av = a.tanggal ?? ''; bv = b.tanggal ?? ''; break;
      case 'shift':   av = a.shift;         bv = b.shift;          break;
      case 'machine': av = a.machine;        bv = b.machine;         break;
      case 'meters':  av = a.meters;         bv = b.meters;          break;
      case 'a':       av = a.a ?? -1;        bv = b.a ?? -1;         break;
      case 'p':       av = a.p ?? -1;        bv = b.p ?? -1;         break;
    }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageRows = sorted.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);
  const totalRecords = rows.length;

  const TH_STYLE = (active: boolean): React.CSSProperties => ({
    padding: '10px 16px',
    fontSize: 11,
    fontWeight: 500,
    color: active ? '#1D4ED8' : '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  });

  return (
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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
          Datalog ({totalRecords.toLocaleString('id-ID')} records)
        </span>
        <span style={{ fontSize: 12, color: '#9CA3AF' }}>
          Page {pageSafe} of {totalPages}
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
              <th style={{ ...TH_STYLE(sortKey === 'tanggal'), textAlign: 'left' }}
                  onClick={() => handleSort('tanggal')}>
                DATE <SortIcon active={sortKey === 'tanggal'} dir={sortKey === 'tanggal' ? sortDir : 'asc'} />
              </th>
              <th style={{ ...TH_STYLE(sortKey === 'shift'), textAlign: 'left' }}
                  onClick={() => handleSort('shift')}>
                SHIFT <SortIcon active={sortKey === 'shift'} dir={sortKey === 'shift' ? sortDir : 'asc'} />
              </th>
              <th style={{ ...TH_STYLE(sortKey === 'machine'), textAlign: 'left' }}
                  onClick={() => handleSort('machine')}>
                MACHINE <SortIcon active={sortKey === 'machine'} dir={sortKey === 'machine' ? sortDir : 'asc'} />
              </th>
              <th style={{ ...TH_STYLE(sortKey === 'meters'), textAlign: 'right' }}
                  onClick={() => handleSort('meters')}>
                METERS <SortIcon active={sortKey === 'meters'} dir={sortKey === 'meters' ? sortDir : 'asc'} />
              </th>
              <th style={{ ...TH_STYLE(sortKey === 'a'), textAlign: 'right' }}
                  onClick={() => handleSort('a')}>
                A% <SortIcon active={sortKey === 'a'} dir={sortKey === 'a' ? sortDir : 'asc'} />
              </th>
              <th style={{ ...TH_STYLE(sortKey === 'p'), textAlign: 'right' }}
                  onClick={() => handleSort('p')}>
                P% <SortIcon active={sortKey === 'p'} dir={sortKey === 'p' ? sortDir : 'asc'} />
              </th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <tr key={i} style={{
                borderBottom: '1px solid #F3F4F6',
                height: 36,
                background: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
              }}>
                <td style={{ padding: '0 16px', height: 36, fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>
                  {row.tanggal ? format(new Date(row.tanggal), 'd MMM yyyy') : '—'}
                </td>
                <td style={{ padding: '0 16px', height: 36, fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>
                  {SHIFT_LABEL[row.shift] ?? `Shift ${row.shift}`}
                </td>
                <td style={{ padding: '0 16px', height: 36, fontWeight: 600, fontSize: 13, color: '#0F1E2E', whiteSpace: 'nowrap' }}>
                  {row.machine}
                </td>
                <td style={{ padding: '0 16px', height: 36, fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", color: '#6B7280', textAlign: 'right' }}>
                  {row.meters.toLocaleString('id-ID')} m
                </td>
                <td style={{ padding: '0 16px', height: 36, textAlign: 'right' }}>
                  <EffPill value={row.a} />
                </td>
                <td style={{ padding: '0 16px', height: 36, textAlign: 'right' }}>
                  <EffPill value={row.p} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{
          padding: '10px 20px',
          borderTop: '1px solid #F3F4F6',
          background: '#F9FAFB',
          display: 'flex',
          gap: 8,
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}>
          <Button
            variant="secondary"
            size="sm"
            disabled={pageSafe <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            ← Prev
          </Button>
          <span style={{ fontSize: 12, color: '#6B7280', minWidth: 80, textAlign: 'center' }}>
            {pageSafe} / {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={pageSafe >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  );
}

export default function WeavingDetailPage({ kp }: { kp: string }) {
  const router = useRouter();
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch<SummaryData>(`/denim/weaving-summary/${kp}`);
      setData(res);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load weaving data';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [kp]);

  useEffect(() => { load(); }, [load]);

  const hasData = data && data.recentLogs.length > 0;

  const actions = (
    <Button variant="ghost" size="sm" onClick={() => router.back()}>
      ← Back
    </Button>
  );

  return (
    <PageShell title="Weaving Production" subtitle={`KP ${kp}`} actions={actions} noPadding>
      <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {[0, 1, 2, 3].map(i => <Skeleton key={i} style={{ height: 72, borderRadius: 12 }} />)}
            </div>
            <Skeleton style={{ height: 400, borderRadius: 12 }} />
          </div>
        )}

        {!loading && !hasData && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '64px 32px', gap: 12,
            background: '#F7F8FA', border: '1px solid #E5E7EB', borderRadius: 12,
          }}>
            <AlertTriangle style={{ color: '#9CA3AF', width: 32, height: 32 }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: '#6B7280' }}>No production records found</p>
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
                value={data.totalMeters > 0 ? `${data.totalMeters.toLocaleString('id-ID')} m` : '—'}
                sub={data.daysActive ? `${data.daysActive} day${data.daysActive !== 1 ? 's' : ''} active` : undefined}
              />
              <StatTile
                label="Avg Efficiency (A%)"
                value={data.avgEfficiency != null ? `${data.avgEfficiency.toFixed(1)}%` : '—'}
                sub={data.machines?.length ? `${data.machines.length} machine${data.machines.length !== 1 ? 's' : ''}` : undefined}
              />
              <StatTile
                label="Avg Pick (P%)"
                value={data.machines.length
                  ? (data.machines.reduce((s, m) => s + m.avgP, 0) / data.machines.length).toFixed(1) + '%'
                  : '—'}
              />
              <StatTile
                label="Days Active"
                value={String(data.daysActive ?? 0)}
              />
            </div>

            {/* Machine breakdown */}
            {data.machines.length > 0 && (
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
                    {data.machines.map((row, i) => (
                      <tr key={row.machine} style={{
                        borderBottom: i < data.machines.length - 1 ? '1px solid #F3F4F6' : 'none',
                        height: 36,
                        background: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                      }}>
                        <td style={{ padding: '0 16px', height: 36, fontWeight: 600, color: '#0F1E2E' }}>
                          {row.machine}
                        </td>
                        <td style={{ padding: '0 16px', height: 36, fontSize: 13, color: '#6B7280', textAlign: 'right' }}>
                          {row.recordCount.toLocaleString('id-ID')}
                        </td>
                        <td style={{ padding: '0 16px', height: 36, fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", color: '#6B7280', textAlign: 'right' }}>
                          {row.totalMeters.toLocaleString('id-ID')} m
                        </td>
                        <td style={{ padding: '0 16px', height: 36, textAlign: 'right' }}><EffPill value={row.avgA} /></td>
                        <td style={{ padding: '0 16px', height: 36, textAlign: 'right' }}><EffPill value={row.avgP} /></td>
                        <td style={{ padding: '0 16px', height: 36, fontSize: 12, color: '#9CA3AF', textAlign: 'right' }}>
                          {row.lastDate ? format(new Date(row.lastDate), 'd MMM yyyy') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Datalog table */}
            <DatlogTable rows={data.recentLogs} />
          </>
        )}
      </div>
    </PageShell>
  );
}
