'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/ui/erp/PageShell';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { authFetch } from '@/lib/authFetch';
import { useAuth } from '@/lib/AuthContext';
import { Filter, Plus } from 'lucide-react';
import { format } from 'date-fns';

// ─── Types ──────────────────────────────────────────────────────
interface SalesContract {
  id: number;
  kp: string;
  tgl: string;
  codename: string | null;
  kat_kode: string | null;
  te: number | null;
  acc: string | null;
  pipeline_status: string;
  permintaan: string | null;
  ket_warna: string | null;
  status: string | null;
}

interface Pagination { page: number; limit: number; total: number; pages: number; }
interface ContractsData { items: SalesContract[]; pagination: Pagination; }

// ─── Filters ────────────────────────────────────────────────────
interface FilterState {
  search: string;
  stage: string;
  acc: string;
  type: string;
  dateFrom: string;
  dateTo: string;
}

const DEFAULT_FILTERS: FilterState = {
  search:   '',
  stage:    '',
  acc:      '',
  type:     '',
  dateFrom: '',
  dateTo:   '',
};

function activeFilterCount(f: FilterState): number {
  let n = 0;
  if (f.stage)    n++;
  if (f.acc)      n++;
  if (f.type)     n++;
  if (f.dateFrom) n++;
  if (f.dateTo)   n++;
  return n;
}

// ─── Stage config ───────────────────────────────────────────────
const STAGE_BORDER: Record<string, string> = {
  PENDING_APPROVAL: '#D97706',
  SACON:            '#7C3AED',
  WARPING:          '#4A7A9B',
  INDIGO:           '#0891B2',
  WEAVING:          '#059669',
  INSPECT_GRAY:     '#D97706',
  BBSF:             '#EA580C',
  INSPECT_FINISH:   '#2B506E',
  COMPLETE:         '#059669',
  REJECTED:         '#DC2626',
};

const STAGES = [
  { value: '',                          label: 'All Stages' },
  { value: 'PENDING_APPROVAL',          label: 'Pending' },
  { value: 'SACON',                     label: 'SACON' },
  { value: 'WARPING',                   label: 'Warping' },
  { value: 'INDIGO',                    label: 'Indigo' },
  { value: 'WEAVING',                   label: 'Weaving' },
  { value: 'INSPECT_GRAY',              label: 'Inspect Gray' },
  { value: 'BBSF',                      label: 'BBSF' },
  { value: 'INSPECT_FINISH',            label: 'Inspect Finish' },
  { value: 'COMPLETE',                   label: 'Complete' },
  { value: 'REJECTED',                  label: 'Rejected' },
];

const TYPES = [
  { value: '', label: 'All Types' },
  { value: 'SC', label: 'SC' },
  { value: 'WS', label: 'WS' },
];

const ACC_OPTS = [
  { value: '', label: 'All' },
  { value: 'ACC', label: 'ACC' },
  { value: 'TIDAK ACC', label: 'TIDAK ACC' },
  { value: 'Pending', label: 'Pending' },
];

// ─── Utilities ───────────────────────────────────────────────────
function formatDate(iso: string): string {
  try { return format(new Date(iso), 'd MMM yyyy'); }
  catch { return '—'; }
}

// ─── Skeleton shimmer ───────────────────────────────────────────
const SHIMMER = `
@keyframes __sacon_shimmer__ {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 0.85; }
}`;

function SkeletonRow() {
  return (
    <>
      <style>{SHIMMER}</style>
      {Array.from({ length: 5 }).map((_, j) => (
        <tr key={j} style={{ borderBottom: '1px solid #F3F4F6' }}>
          {[0,1,2,3,4,5,6,7].map(cellIdx => (
            <td key={cellIdx} style={{ padding: '0 16px', height: 44 }}>
              <div style={{
                height:        12,
                borderRadius:  4,
                background:    '#E5E7EB',
                animation:     `__sacon_shimmer__ 1.5s ease-in-out ${j * 100}ms infinite`,
                width:         cellIdx === 2 ? '80%' : '60%',
              }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── Select component ───────────────────────────────────────────
function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label style={{
        display:     'block',
        fontSize:    11,
        fontWeight:  500,
        color:       'var(--text-secondary)',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}>{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width:         '100%',
          height:        32,
          borderRadius:  'var(--input-radius)',
          border:        '1px solid var(--border)',
          background:    'var(--page-bg)',
          color:         'var(--text-primary)',
          fontSize:      13,
          padding:       '0 28px 0 10px',
          cursor:        'pointer',
          appearance:    'none',
          WebkitAppearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%237A96A8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 10px center',
          outline: 'none',
        }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────
export default function SalesContractPage({
  initialData,
}: {
  initialData?: ContractsData;
}) {
  const router        = useRouter();
  const { user }     = useAuth();

  const [rows,    setRows]    = useState<SalesContract[]>(initialData?.items ?? []);
  const [total,   setTotal]   = useState<number>(initialData?.pagination?.total ?? 0);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [page,    setPage]    = useState<number>(1);
  const [showFilters, setShowFilters] = useState(false);
  const LIMIT = 50;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page:  String(page),
        limit: String(LIMIT),
      });
      if (filters.search)   params.set('kp',         filters.search);
      if (filters.stage)    params.set('pipeline_status', filters.stage);
      if (filters.acc)      params.set('acc',         filters.acc);
      if (filters.type)     params.set('kat_kode',    filters.type);
      if (filters.dateFrom) params.set('dateFrom',   filters.dateFrom);
      if (filters.dateTo)   params.set('dateTo',     filters.dateTo);

      const data = await authFetch<ContractsData>(
        `/denim/sales-contracts?${params}`
      );
      setRows(data?.items ?? []);
      setTotal(data?.pagination?.total ?? 0);
    } catch {
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    if (initialData && page === 1) return;
    fetchOrders();
  }, [fetchOrders, initialData]);

  // Reset to page 1 on filter change
  const handleFilterChange = (patch: Partial<FilterState>) => {
    setFilters(f => ({ ...f, ...patch }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const activeCount  = activeFilterCount(filters);
  const totalPages  = Math.ceil(total / LIMIT);
  const start       = (page - 1) * LIMIT + 1;
  const end         = Math.min(page * LIMIT, total);

  const headerActions = (
    user?.role === 'factory' ? (
      <Button
        variant="primary"
        size="sm"
        onClick={() => router.push('/denim/inbox/sacon/new')}
        leftIcon={<Plus size={14} />}
      >
        New Contract
      </Button>
    ) : null
  );

  return (
    <PageShell
      title="Sales Contract"
      subtitle={`${total.toLocaleString()} total`}
      actions={headerActions}
      noPadding
    >
      <div style={{ backgroundColor: '#F0F4F8', minHeight: '100vh', padding: '24px 32px' }}>

        {/* ── Search + Filter bar ── */}
        <div style={{
          display:        'flex',
          alignItems:    'center',
          gap:            12,
          marginBottom:  showFilters ? 12 : 16,
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
            <input
              type="text"
              placeholder="Search KP, construction..."
              value={filters.search}
              onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }}
              onFocus={e => { e.target.style.borderColor = '#4A7A9B'; }}
              onBlur={e => { e.target.style.borderColor = '#E5E7EB'; }}
              style={{
                width:         '100%',
                height:        38,
                borderRadius:  8,
                border:        '1px solid #E5E7EB',
                background:    '#FFFFFF',
                color:         '#0F1E2E',
                fontSize:      14,
                padding:       '0 12px 0 38px',
                outline:       'none',
              }}
            />
            <svg
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9CA3AF' }}
            >
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M11 11L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(v => !v)}
            style={{
              height:        38,
              padding:       '0 14px',
              borderRadius:  8,
              border:        '1px solid #E5E7EB',
              background:    '#FFFFFF',
              fontSize:      13,
              color:         '#374151',
              display:       'flex',
              alignItems:    'center',
              gap:           6,
              cursor:        'pointer',
              transition:    'background 150ms',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FFFFFF'; }}
          >
            <Filter size={13} />
            Filters
            {activeCount > 0 && (
              <span style={{
                background:    '#4A7A9B',
                color:         '#EEF3F7',
                borderRadius:  '99px',
                width:         18,
                height:        18,
                fontSize:      10,
                fontWeight:    700,
                display:       'inline-flex',
                alignItems:    'center',
                justifyContent:'center',
              }}>{activeCount}</span>
            )}
          </button>
        </div>

        {/* ── Collapsible filter panel ── */}
        {showFilters && (
          <div style={{
            background:    'var(--content-bg)',
            border:        '1px solid var(--border)',
            borderRadius:  'var(--card-radius)',
            padding:       '16px 20px',
            marginBottom:  12,
            display:       'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap:           12,
          }}>
            <SelectField
              label="Pipeline Stage"
              value={filters.stage}
              options={STAGES}
              onChange={v => handleFilterChange({ stage: v })}
            />
            <SelectField
              label="ACC Status"
              value={filters.acc}
              options={ACC_OPTS}
              onChange={v => handleFilterChange({ acc: v })}
            />
            <SelectField
              label="Type"
              value={filters.type}
              options={TYPES}
              onChange={v => handleFilterChange({ type: v })}
            />
            <div>
              <label style={{
                display:       'block',
                fontSize:      11,
                fontWeight:    500,
                color:         'var(--text-secondary)',
                marginBottom:  4,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={e => handleFilterChange({ dateFrom: e.target.value })}
                style={{
                  width:         '100%',
                  height:        32,
                  borderRadius:  'var(--input-radius)',
                  border:        '1px solid var(--border)',
                  background:    'var(--page-bg)',
                  color:         'var(--text-primary)',
                  fontSize:      13,
                  padding:       '0 10px',
                  outline:       'none',
                }}
              />
            </div>
            <div>
              <label style={{
                display:       'block',
                fontSize:      11,
                fontWeight:    500,
                color:         'var(--text-secondary)',
                marginBottom:  4,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={e => handleFilterChange({ dateTo: e.target.value })}
                style={{
                  width:         '100%',
                  height:        32,
                  borderRadius:  'var(--input-radius)',
                  border:        '1px solid var(--border)',
                  background:    'var(--page-bg)',
                  color:         'var(--text-primary)',
                  fontSize:      13,
                  padding:       '0 10px',
                  outline:       'none',
                }}
              />
            </div>
            {activeCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  style={{ color: 'var(--danger)', whiteSpace: 'nowrap' }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ── Table ── */}
        <div style={{
          background:    '#FFFFFF',
          border:        '1px solid #E5E7EB',
          borderRadius:  12,
          overflow:      'hidden',
          overflowX:     'auto',
          boxShadow:     'none',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {/* Status stripe — no header text */}
                <th style={{ width: 4, padding: 0 }} />
                {[
                  { key: 'DATE',        label: 'DATE' },
                  { key: 'KP',         label: 'KP CODE' },
                  { key: 'CONSTRUCTION',label: 'CONSTRUCTION' },
                  { key: 'TYPE',       label: 'TYPE' },
                  { key: 'TE',         label: 'TE' },
                  { key: 'ACC',        label: 'ACC' },
                  { key: 'STAGE',      label: 'STAGE' },
                  { key: 'ACTION',     label: '' },
                ].map(h => (
                  <th
                    key={h.key}
                    style={{
                      padding:    '0 16px',
                      height:     36,
                      fontSize:   11,
                      fontWeight: 600,
                      textAlign:  h.key === 'ACTION' ? 'right' : 'left',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color:      '#9CA3AF',
                      whiteSpace: 'nowrap',
                    }}
                  >{h.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRow />
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{ height: 200, textAlign: 'center' }}
                  >
                    <p style={{ fontSize: 14, color: '#9CA3AF' }}>
                      No contracts found
                    </p>
                  </td>
                </tr>
              ) : (
                rows.map(row => {
                  const borderColor = STAGE_BORDER[row.pipeline_status] ?? '#B8CDD9';
                  return (
                    <tr
                      key={row.id}
                      onClick={() => router.push(`/denim/admin/orders/${row.kp}`)}
                      style={{
                        cursor:      'pointer',
                        borderBottom:'1px solid #F3F4F6',
                        transition:  'background 150ms',
                        height:      44,
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      {/* Status stripe */}
                      <td style={{ borderLeft: `3px solid ${borderColor}`, paddingLeft: 13, paddingRight: 0 }} />

                      {/* Date */}
                      <td style={{ padding: '0 16px', fontSize: 13, color: '#6B7280', whiteSpace: 'nowrap' }}>
                        {formatDate(row.tgl)}
                      </td>

                      {/* KP */}
                      <td style={{ padding: '0 16px', height: 44 }}>
                        <span style={{
                          fontFamily:  "'IBM Plex Mono', monospace",
                          fontSize:    13,
                          fontWeight:  600,
                          color:       '#1D4ED8',
                        }}>
                          {row.kp}
                        </span>
                      </td>

                      {/* Construction */}
                      <td style={{
                        padding:    '0 16px',
                        height:     44,
                        fontSize:   13,
                        color:      '#0F1E2E',
                        maxWidth:   220,
                        overflow:   'hidden',
                        textOverflow:'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {row.codename || '—'}
                      </td>

                      {/* Type */}
                      <td style={{ padding: '0 16px', height: 44, fontSize: 12, color: '#6B7280' }}>
                        {row.kat_kode || '—'}
                      </td>

                      {/* TE */}
                      <td style={{ padding: '0 16px', height: 44, fontSize: 12, color: '#6B7280', fontVariantNumeric: 'tabular-nums' }}>
                        {row.te != null ? row.te.toLocaleString() : '—'}
                      </td>

                      {/* ACC */}
                      <td style={{ padding: '0 16px', height: 44 }}>
                        {row.acc === 'ACC' ? (
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#059669' }}>✓ ACC</span>
                        ) : row.acc === 'TIDAK ACC' ? (
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#DC2626' }}>✕ REJ</span>
                        ) : (
                          <span style={{ fontSize: 12, color: '#D1D5DB' }}>—</span>
                        )}
                      </td>

                      {/* Stage */}
                      <td style={{ padding: '0 16px', height: 44 }}>
                        <StatusBadge status={row.pipeline_status} />
                      </td>

                      {/* Action */}
                      <td
                        style={{ padding: '0 16px 0 0', height: 44, textAlign: 'right' }}
                        onClick={e => { e.stopPropagation(); router.push(`/denim/admin/orders/${row.kp}`); }}
                      >
                        <span style={{ fontSize: 12, color: '#1D4ED8', fontWeight: 500, cursor: 'pointer' }}>
                          View →
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* ── Pagination ── */}
          {totalPages > 0 && (
            <div style={{
              display:        'flex',
              alignItems:    'center',
              justifyContent: 'space-between',
              padding:        '12px 16px',
              borderTop:      '1px solid #F3F4F6',
              fontSize:       13,
              color:          '#6B7280',
            }}>
              <span style={{ fontSize: 13, color: '#6B7280' }}>
                Showing {start}–{end} of {total.toLocaleString()} orders
              </span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  style={{
                    height:        32,
                    padding:       '0 12px',
                    borderRadius:   6,
                    border:        '1px solid #E5E7EB',
                    background:    '#FFFFFF',
                    fontSize:       13,
                    color:         page <= 1 ? '#374151' : '#374151',
                    cursor:        page <= 1 ? 'not-allowed' : 'pointer',
                    opacity:       page <= 1 ? 0.4 : 1,
                    display:       'flex',
                    alignItems:    'center',
                    transition:    'background 150ms',
                  }}
                  onMouseEnter={e => { if (page > 1) (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FFFFFF'; }}
                >←</button>

                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = i + 1;
                  const active = p === page;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      style={{
                        height:        32,
                        width:         32,
                        borderRadius:   6,
                        border:        active ? 'none' : '1px solid #E5E7EB',
                        background:    active ? '#1D4ED8' : 'transparent',
                        color:         active ? '#FFFFFF' : '#374151',
                        fontSize:       13,
                        fontWeight:    active ? 600 : 500,
                        cursor:        'pointer',
                        display:       'flex',
                        alignItems:    'center',
                        justifyContent:'center',
                        transition:    'all 0.1s',
                      }}
                    >{p}</button>
                  );
                })}

                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  style={{
                    height:        32,
                    padding:       '0 12px',
                    borderRadius:   6,
                    border:        '1px solid #E5E7EB',
                    background:    '#FFFFFF',
                    fontSize:       13,
                    color:         page >= totalPages ? '#374151' : '#374151',
                    cursor:        page >= totalPages ? 'not-allowed' : 'pointer',
                    opacity:       page >= totalPages ? 0.4 : 1,
                    display:       'flex',
                    alignItems:    'center',
                    transition:    'background 150ms',
                  }}
                  onMouseEnter={e => { if (page < totalPages) (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FFFFFF'; }}
                >→</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .sacontent { padding: 16px !important; }
        }
      `}</style>
    </PageShell>
  );
}
