'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { PageShell } from '@/components/ui/erp/PageShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { authFetch } from '@/lib/authFetch';
import { RefreshCw } from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────── */
type SCPagination = { page: number; limit: number; total: number; pages: number };
type SCPaginated  = { items: SC[]; pagination: SCPagination };
type SC = {
  id: number;
  kp: string;
  tgl: string;
  codename: string | null;
  permintaan: string | null;
  kat_kode: string | null;
  status: string | null;
  te: number | null;
  pipeline_status: string;
  acc: string | null;
};

type Decision = 'ALL' | 'ACC' | 'TIDAK ACC';

/* ─────────────────────────────────────────────────────────
   Constants
   ───────────────────────────────────────────────────────── */
const PAGE_SIZE = 50;

const COLS = ['DATE', 'KP CODE', 'CONSTRUCTION', 'TYPE', 'CUSTOMER', 'TE', 'DECISION', 'STAGE'];
const COL_WIDTHS = ['10%', '9%', '1fr', '8%', '14%', '7%', '110px', '130px'];

/* ─────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────── */
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
  } catch { return '—'; }
}

/* ─────────────────────────────────────────────────────────
   Decision badge
   ───────────────────────────────────────────────────────── */
function DecisionBadge({ acc }: { acc: string | null }) {
  const isAcc = acc === 'ACC';
  return (
    <span style={{
      display:       'inline-flex',
      alignItems:    'center',
      gap:           4,
      height:        24,
      padding:       '0 8px',
      borderRadius:  6,
      fontSize:      12,
      fontWeight:    600,
      whiteSpace:    'nowrap',
      background:    isAcc ? '#ECFDF5' : '#FEF2F2',
      color:         isAcc ? '#059669' : '#DC2626',
      border:        `1px solid ${isAcc ? '#A7F3D0' : '#FECACA'}`,
    }}>
      {isAcc ? '✓ ACC' : '✕ TIDAK ACC'}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
   Filter pill bar
   ───────────────────────────────────────────────────────── */
function FilterPills({
  value,
  onChange,
}: {
  value: Decision;
  onChange: (v: Decision) => void;
}) {
  const pills: Decision[] = ['ALL', 'ACC', 'TIDAK ACC'];
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {pills.map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          style={{
            height:        30,
            padding:       '0 14px',
            borderRadius:  20,
            border:        `1px solid ${value === p ? '#1D4ED8' : '#E5E7EB'}`,
            background:    value === p ? '#EFF6FF' : '#FFFFFF',
            color:         value === p ? '#1D4ED8' : '#6B7280',
            fontSize:      12,
            fontWeight:    value === p ? 600 : 500,
            cursor:        'pointer',
            transition:    'all 150ms',
          }}
        >
          {p === 'ALL' ? 'All' : p === 'ACC' ? '✓ ACC' : '✕ TIDAK ACC'}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Pagination controls
   ───────────────────────────────────────────────────────── */
function Pagination({
  page, totalPages, onChange,
}: {
  page: number; totalPages: number; onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const range = 2;
  for (let i = Math.max(1, page - range); i <= Math.min(totalPages, page + range); i++) {
    pages.push(i);
  }

  return (
    <div style={{
      display:       'flex',
      alignItems:    'center',
      justifyContent: 'flex-end',
      gap:           4,
      padding:       '12px 16px',
      borderTop:     '1px solid #F3F4F6',
    }}>
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        style={{
          height: 28, padding: '0 10px', borderRadius: 6,
          border: '1px solid #E5E7EB', background: '#FFFFFF',
          color: page <= 1 ? '#D1D5DB' : '#374151',
          fontSize: 12, cursor: page <= 1 ? 'not-allowed' : 'pointer',
        }}
      >
        ←
      </button>
      {pages[0] > 1 && (
        <>
          <button onClick={() => onChange(1)} style={{ ...pageBtnStyle(false), marginRight: 4 }}>1</button>
          {pages[0] > 2 && <span style={{ color: '#9CA3AF', fontSize: 12 }}>…</span>}
        </>
      )}
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          style={pageBtnStyle(p === page)}
        >
          {p}
        </button>
      ))}
      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span style={{ color: '#9CA3AF', fontSize: 12 }}>…</span>}
          <button onClick={() => onChange(totalPages)} style={{ ...pageBtnStyle(false), marginLeft: 4 }}>{totalPages}</button>
        </>
      )}
      <button
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        style={{
          height: 28, padding: '0 10px', borderRadius: 6,
          border: '1px solid #E5E7EB', background: '#FFFFFF',
          color: page >= totalPages ? '#D1D5DB' : '#374151',
          fontSize: 12, cursor: page >= totalPages ? 'not-allowed' : 'pointer',
        }}
      >
        →
      </button>
    </div>
  );
}

function pageBtnStyle(active: boolean): React.CSSProperties {
  return {
    height: 28, padding: '0 10px', borderRadius: 6,
    border: `1px solid ${active ? '#1D4ED8' : '#E5E7EB'}`,
    background: active ? '#EFF6FF' : '#FFFFFF',
    color: active ? '#1D4ED8' : '#374151',
    fontSize: 12, fontWeight: active ? 600 : 400,
    cursor: 'pointer',
  };
}

/* ─────────────────────────────────────────────────────────
   Main component
   ───────────────────────────────────────────────────────── */
export default function ApprovalsHistoryPage({
  initialTotal = 0,
}: {
  initialTotal?: number;
}) {
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [decision, setDecision]   = useState<Decision>('ALL');
  const [loading, setLoading]     = useState(true);
  const [rows, setRows]           = useState<SC[]>([]);
  const [total, setTotal]         = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPage = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        decided:   'true',
        limit:     String(PAGE_SIZE),
        page:      String(p),
        sortField: 'tgl',
        sortDir:   'desc',
      });
      if (search.trim())        params.set('kp', search.trim());
      if (decision !== 'ALL')   params.set('acc', decision);

      const data = await authFetch(`/denim/sales-contracts?${params}`) as SCPaginated;
      setRows(data?.items ?? []);
      if (data?.pagination) {
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.pages);
      }
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [search, decision]);

  useEffect(() => {
    setPage(1);
    fetchPage(1);
  }, [fetchPage]);

  const handlePageChange = (p: number) => {
    setPage(p);
    fetchPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleDecisionChange = (v: Decision) => {
    setDecision(v);
    setPage(1);
  };

  const filteredRows = rows;

  const emptyMessage = decision === 'ALL'
    ? 'No decided contracts yet.'
    : decision === 'ACC'
    ? 'No approved contracts.'
    : 'No rejected contracts.';

  return (
    <PageShell
      title="Approval History"
      subtitle={
        loading
          ? 'Loading…'
          : (
            <span style={{ color: 'rgba(255,255,255,0.60)', fontSize: 13 }}>
              {total} contract{total !== 1 ? 's' : ''} decided
            </span>
          )
      }
    >
      <div style={{ backgroundColor: '#F0F4F8', minHeight: '100vh', padding: '24px 32px' }}>

        {/* ── Controls ── */}
        <div style={{
          display:       'flex',
          gap:           12,
          alignItems:    'center',
          marginBottom:  16,
          flexWrap:      'wrap',
        }}>
          <Input
            type="text"
            placeholder="Search by KP code…"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            style={{ width: 280 }}
          />
          <FilterPills value={decision} onChange={handleDecisionChange} />
          <div style={{ marginLeft: 'auto' }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchPage(page)}
              loading={loading}
              leftIcon={<RefreshCw size={13} />}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* ── Table ── */}
        <div style={{
          background:    '#FFFFFF',
          border:        '1px solid #E5E7EB',
          borderRadius:  12,
          overflow:      'hidden',
        }}>
          {/* Header */}
          <div style={{
            display:           'grid',
            gridTemplateColumns: ['3px', ...COL_WIDTHS].join(' '),
            borderBottom:       '1px solid #E5E7EB',
            background:         '#F9FAFB',
          }}>
            {/* Left stripe */}
            <div />
            {COLS.map((col, i) => (
              <div key={col} style={{
                padding:    '10px 12px',
                fontSize:   11, fontWeight: 600,
                color:      '#9CA3AF',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                {col}
              </div>
            ))}
          </div>

          {/* Body */}
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{
                display:           'grid',
                gridTemplateColumns: ['3px', ...COL_WIDTHS].join(' '),
                borderBottom:       '1px solid #F3F4F6',
                height:             44,
                alignItems:         'center',
              }}>
                <div style={{ background: '#E5E7EB' }} />
                {Array.from({ length: 8 }).map((_, j) => (
                  <div key={j} style={{ padding: '0 12px' }}>
                    <Skeleton
                      style={{
                        height:    12,
                        width:     `${40 + (j * 13) % 40}%`,
                        borderRadius: 4,
                      }}
                    />
                  </div>
                ))}
              </div>
            ))
          ) : filteredRows.length === 0 ? (
            <div style={{ padding: '48px 16px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#6B7280', margin: '0 0 6px' }}>
                {emptyMessage}
              </p>
              <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>
                Decided contracts will appear here once reviewed.
              </p>
            </div>
          ) : (
            filteredRows.map(row => {
              const isAcc = row.acc === 'ACC';
              const borderColor = isAcc ? '#059669' : '#DC2626';

              return (
                <div
                  key={row.id}
                  style={{
                    display:           'grid',
                    gridTemplateColumns: ['3px', ...COL_WIDTHS].join(' '),
                    borderBottom:       '1px solid #F3F4F6',
                    borderLeft:         `3px solid ${borderColor}`,
                    height:             44,
                    alignItems:         'center',
                    transition:         'background 120ms',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  {/* Left stripe */}
                  <div style={{ background: borderColor }} />

                  {/* Date */}
                  <div style={{ padding: '0 12px', fontSize: 13, color: '#6B7280' }}>
                    {formatDate(row.tgl)}
                  </div>

                  {/* KP */}
                  <div style={{
                    padding:  '0 12px',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize:  13,
                    fontWeight: 600,
                    color:     '#1D4ED8',
                  }}>
                    {row.kp}
                  </div>

                  {/* Construction */}
                  <div style={{
                    padding:       '0 12px',
                    fontSize:      13,
                    color:         '#0F1E2E',
                    overflow:      'hidden',
                    textOverflow:  'ellipsis',
                    whiteSpace:    'nowrap',
                  }}>
                    {row.codename || '—'}
                  </div>

                  {/* Type */}
                  <div style={{ padding: '0 12px', fontSize: 12, color: '#6B7280' }}>
                    {row.kat_kode || '—'}
                  </div>

                  {/* Customer */}
                  <div style={{
                    padding:       '0 12px',
                    fontSize:      12,
                    color:         '#6B7280',
                    overflow:      'hidden',
                    textOverflow:  'ellipsis',
                    whiteSpace:    'nowrap',
                  }}>
                    {row.permintaan || '—'}
                  </div>

                  {/* TE */}
                  <div style={{ padding: '0 12px', fontSize: 12, color: '#6B7280' }}>
                    {row.te != null ? row.te.toLocaleString() : '—'}
                  </div>

                  {/* Decision */}
                  <div style={{ padding: '0 12px' }}>
                    <DecisionBadge acc={row.acc} />
                  </div>

                  {/* Stage */}
                  <div style={{ padding: '0 12px' }}>
                    <StatusBadge status={row.pipeline_status} />
                  </div>
                </div>
              );
            })
          )}

          {/* Pagination */}
          {!loading && filteredRows.length > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </PageShell>
  );
}
