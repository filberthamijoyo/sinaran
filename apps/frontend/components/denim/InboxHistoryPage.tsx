'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageShell } from '../ui/erp/PageShell';
import { Button } from '../ui/button';
import { authFetch } from '../../lib/authFetch';
import { StatusBadge } from '../ui/StatusBadge';
import { format } from 'date-fns';

type RecordItem = Record<string, unknown>;

type PaginatedRecords<T> = {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
};

type Filter = 'ALL' | 'RECENT' | 'THIS_WEEK' | 'THIS_MONTH';

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try { return format(new Date(iso), 'd MMM yyyy'); }
  catch { return '—'; }
}

const SHIMMER = `
@keyframes __hist_shimmer__ { 0%,100%{opacity:0.4} 50%{opacity:0.85} }`;

// ─── Filter pills ───────────────────────────────────────────────
const FILTER_PILLS: { value: Filter; label: string }[] = [
  { value: 'ALL',        label: 'All' },
  { value: 'RECENT',    label: 'Recent' },
  { value: 'THIS_WEEK', label: 'This Week' },
  { value: 'THIS_MONTH', label: 'This Month' },
];

function FilterBar({ value, onChange }: { value: Filter; onChange: (v: Filter) => void }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
      {FILTER_PILLS.map(p => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          style={{
            height:        30,
            padding:       '0 14px',
            borderRadius:  20,
            border:       `1px solid ${value === p.value ? '#1D4ED8' : '#E5E7EB'}`,
            background:   value === p.value ? '#EFF6FF' : '#FFFFFF',
            color:        value === p.value ? '#1D4ED8' : '#6B7280',
            fontSize:     12,
            fontWeight:   value === p.value ? 600 : 500,
            cursor:      'pointer',
            fontFamily:  'inherit',
            transition:  'all 150ms',
          }}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

// ─── History table ────────────────────────────────────────────
function HistoryTable({
  apiEndpoint,
  stageColor,
  stageName,
}: {
  apiEndpoint: string;
  stageColor: string;
  stageName: string;
}) {
  const [rows,     setRows]     = useState<RecordItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,  setFilter]   = useState<Filter>('ALL');
  const [error,   setError]    = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await authFetch<PaginatedRecords<RecordItem>>(apiEndpoint);
      setRows(Array.isArray(result?.data) ? result.data : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [apiEndpoint]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const filtered = rows.filter(r => {
    if (filter === 'ALL') return true;
    const createdAt = (r.submitted_at as string | undefined)
      ?? (r.created_at as string | undefined)
      ?? (r.tanggal as string | undefined);
    if (!createdAt) return false;
    const d = new Date(createdAt);
    const now = new Date();
    if (filter === 'THIS_WEEK') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return d >= startOfWeek;
    }
    if (filter === 'THIS_MONTH') {
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }
    if (filter === 'RECENT') {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      return d >= sevenDaysAgo;
    }
    return true;
  });

  const cols = ['DATE', 'KP CODE', 'CONSTRUCTION', 'STAGE', 'SUBMITTED BY'];

  return (
    <>
      <FilterBar value={filter} onChange={setFilter} />

      <div style={{
        background:    '#FFFFFF',
        border:       '1px solid #E5E7EB',
        borderRadius: 12,
        overflow:     'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <th style={{ width: 3, padding: 0 }} />
              {cols.map(h => (
                <th key={h} style={{
                  padding:       '0 16px',
                  height:       36,
                  fontSize:     11,
                  fontWeight:   600,
                  color:        '#9CA3AF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  whiteSpace:  'nowrap',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <>
                <style>{SHIMMER}</style>
                {[0, 1, 2, 3].map(i => (
                  <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', height: 44 }}>
                    <td style={{ borderLeft: `3px solid ${stageColor}`, padding: 0 }} />
                    {[0, 1, 2, 3, 4, 5].map(j => (
                      <td key={j} style={{ padding: '0 16px', height: 44 }}>
                        <div style={{
                          height:    12,
                          borderRadius: 4,
                          background: '#E5E7EB',
                          animation: `__hist_shimmer__ 1.5s ease-in-out ${i * 100}ms infinite`,
                          width:    j === 2 ? '80%' : '60%',
                        }} />
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            ) : error ? (
              <tr>
                <td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center' }}>
                  <p style={{ fontSize: 13, color: '#DC2626', marginBottom: 8 }}>{error}</p>
                  <Button variant="secondary" size="sm" onClick={fetchRecords}>Retry</Button>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: '#ECFDF5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 16,
                    }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M5 10L8.5 13.5L15 7" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p style={{ fontSize: 16, fontWeight: 600, color: '#0F1E2E', margin: '0 0 4px' }}>
                      All caught up
                    </p>
                    <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>
                      No records found
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.slice(0, 100).map((row, i) => {
                const date = (row.tgl as string | undefined)
                  ?? (row.tanggal as string | undefined)
                  ?? (row.tg as string | undefined);
                const kp = row.kp as string | undefined;
                const codename = row.codename as string | undefined;
                const submittedBy = row.submitted_by as string | undefined;
                const submittedAt = (row.submitted_at as string | undefined)
                  ?? (row.created_at as string | undefined);

                return (
                  <tr
                    key={`${kp ?? i}`}
                    style={{
                      borderBottom: '1px solid #F3F4F6',
                      height: 44,
                      cursor: 'pointer',
                      transition: 'background 150ms',
                    }}
                    onClick={() => { if (kp) window.location.href = `/denim/admin/orders/${kp}`; }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <td style={{ borderLeft: `3px solid ${stageColor}`, padding: 0 }} />
                    <td style={{ padding: '0 16px', height: 44, fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>
                      {formatDate(date)}
                    </td>
                    <td style={{ padding: '0 16px', height: 44 }}>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600, color: '#1D4ED8' }}>
                        {kp || '—'}
                      </span>
                    </td>
                    <td style={{
                      padding: '0 16px', height: 44,
                      fontSize: 13, color: '#0F1E2E',
                      maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {codename || '—'}
                    </td>
                    <td style={{ padding: '0 16px', height: 44 }}>
                      <StatusBadge status={stageName.toUpperCase().replace(' ', '_')} />
                    </td>
                    <td style={{ padding: '0 16px', height: 44, fontSize: 12, color: '#6B7280' }}>
                      {submittedBy ?? (submittedAt ? formatDate(submittedAt) : '—')}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── Stage config ───────────────────────────────────────────────
const STAGE_CONFIG: Record<string, {
  title: string;
  color: string;
  endpoint: string;
}> = {
  warping:       { title: 'Warping',         color: '#4A7A9B', endpoint: '/api/denim/warping-runs'           },
  indigo:        { title: 'Indigo',           color: '#0891B2', endpoint: '/api/denim/indigo-runs'            },
  weaving:       { title: 'Weaving',          color: '#059669', endpoint: '/api/denim/weaving/records'        },
  'inspect-gray': { title: 'Inspect Gray',    color: '#7C3AED', endpoint: '/api/denim/inspect-gray-records'  },
  bbsf:          { title: 'BBSF',            color: '#B45309', endpoint: '/api/denim/bbsf-washing-runs'       },
  'inspect-finish': { title: 'Inspect Finish', color: '#BE185D', endpoint: '/api/denim/inspect-finish-records' },
};

interface InboxHistoryPageProps {
  stage: string;
}

export default function InboxHistoryPage({ stage }: InboxHistoryPageProps) {
  const config = STAGE_CONFIG[stage];

  if (!config) {
    return (
      <div style={{ padding: '48px 32px' }}>
        <p style={{ fontSize: 15, color: '#DC2626' }}>
          History not available for this stage.
        </p>
      </div>
    );
  }

  const actions = (
    <button
      onClick={() => { window.location.href = `/denim/inbox/${stage}`; }}
      style={{
        display:       'inline-flex',
        alignItems:   'center',
        gap:          6,
        height:       32,
        padding:      '0 12px',
        background:   '#FFFFFF',
        border:       '1px solid #E5E7EB',
        borderRadius: 'var(--button-radius)',
        fontSize:     13,
        fontWeight:   500,
        color:        '#374151',
        cursor:       'pointer',
        fontFamily:   'inherit',
      }}
    >
      &larr; Back to Inbox
    </button>
  );

  return (
    <PageShell
      title={`${config.title} History`}
      subtitle="All submissions"
      actions={actions}
      noPadding
    >
      <div style={{ padding: '24px 32px' }}>
        <HistoryTable
          apiEndpoint={config.endpoint}
          stageColor={config.color}
          stageName={config.title}
        />
      </div>
    </PageShell>
  );
}
