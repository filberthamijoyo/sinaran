'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { PageShell } from '@/components/ui/erp/PageShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { authFetch } from '@/lib/authFetch';
import { CheckCircle, ChevronDown } from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────── */
type SCPagination = { page: number; limit: number; total: number; pages: number };
type SCPaginated = { items: SC[]; pagination: SCPagination };
type SC = {
  id: number;
  kp: string;
  tgl: string;
  codename: string | null;
  permintaan: string | null;
  kat_kode: string | null;
  status: string | null;
  te: number | null;
  ket_warna: string | null;
  pipeline_status: string;
  kons_kode: string | null;
  kode_number: string | null;
  ket_ct_ws: string | null;
  sisir: string | null;
  p_kons: string | null;
  ne_k_lusi: string | null;
  ne_lusi: number | null;
  sp_lusi: string | null;
  lot_lusi: string | null;
  ne_k_pakan: string | null;
  ne_pakan: number | null;
  sp_pakan: string | null;
  j: number | null;
  j_c: number | null;
  b_c: number | null;
  tb: number | null;
  tb_real: number | null;
  bale_lusi: number | null;
  total_pakan: number | null;
  bale_pakan: number | null;
  ts: string | null;
  proses: string | null;
  remarks: string | null;
};

/* ─────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────── */
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
  } catch { return '—'; }
}

function fmt(v: unknown): string {
  if (v == null) return '—';
  if (typeof v === 'number') return v.toLocaleString('en-US', { maximumFractionDigits: 4 });
  if (typeof v === 'string' && v.trim() !== '') return v;
  return '—';
}

/* ─────────────────────────────────────────────────────────
   Detail Panel (rendered inline below expanded row)
   ───────────────────────────────────────────────────────── */
function DetailPanel({ row }: { row: SC }) {
  const S = {
    title: { fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 10 },
    label: { fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.06em', color: '#9CA3AF', marginBottom: 3, display: 'block' as const },
    value: { fontSize: 14, fontWeight: 500, color: '#0F1E2E' },
    empty: { fontSize: 14, color: '#D1D5DB' },
  };

  return (
    <div style={{
      backgroundColor: '#F9FAFB',
      borderTop: '1px solid #E5E7EB',
      borderBottom: '2px solid #E5E7EB',
      padding: '20px 24px',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>

        {/* Section: Order Details */}
        <div>
          <p style={S.title}>Order Details</p>
          <Field label="KP Code"       value={row.kp}           mono S={S} />
          <Field label="Date"         value={formatDate(row.tgl)} S={S} />
          <Field label="Codename"     value={row.codename}    S={S} />
          <Field label="Type"         value={row.kat_kode}    S={S} />
          <Field label="Customer"     value={row.permintaan}   S={S} />
          <Field label="Color"        value={row.ket_warna}   S={S} />
          <Field label="Status"       value={row.status}      S={S} />
          <Field label="Remarks"      value={row.remarks}     S={S} />
        </div>

        {/* Section: Yarn Specification */}
        <div>
          <p style={S.title}>Yarn Specification</p>
          <Field label="TE"           value={fmt(row.te)}          S={S} />
          <Field label="SISIR"        value={row.sisir}            S={S} />
          <Field label="P (Kons)"      value={row.p_kons}           S={S} />
          <Field label="Ne K Lusi"    value={row.ne_k_lusi}        S={S} />
          <Field label="Ne Lusi"      value={fmt(row.ne_lusi)}      S={S} />
          <Field label="Sp Lusi"      value={row.sp_lusi}          S={S} />
          <Field label="Lot Lusi"     value={row.lot_lusi}         S={S} />
          <Field label="Ne K Pakan"   value={row.ne_k_pakan}       S={S} />
          <Field label="Ne Pakan"      value={fmt(row.ne_pakan)}    S={S} />
          <Field label="Sp Pakan"     value={row.sp_pakan || row.proses} S={S} />
        </div>

        {/* Section: Measurements */}
        <div>
          <p style={S.title}>Measurements</p>
          <Field label="J (Panjang Tarikan)" value={fmt(row.j)} S={S} />
          <Field label="J/C"                 value={fmt(row.j_c)} S={S} />
          <Field label="B/C"                   value={fmt(row.b_c)}  S={S} />
          <Field label="TB Total"              value={fmt(row.tb)}   S={S} />
          <Field label="TB Real"               value={fmt(row.tb_real)} S={S} />
          <Field label="Bale Lusi"             value={fmt(row.bale_lusi)} S={S} />
          <Field label="Total Pakan"           value={fmt(row.total_pakan)} S={S} />
          <Field label="Bale Pakan"            value={fmt(row.bale_pakan)} S={S} />
          <Field label="Date Submitted"    value={row.ts ? formatDate(row.ts) : '—'} S={S} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, mono, S }: { label: string; value?: string | null; mono?: boolean; S: { label: React.CSSProperties; value: React.CSSProperties; empty: React.CSSProperties } }) {
  const isEmpty = !value || value === '—';
  return (
    <div style={{ marginBottom: 10 }}>
      <span style={S.label}>{label}</span>
      <span style={{ ...S.value, ...(mono ? { fontFamily: "'IBM Plex Mono', monospace", color: '#1D4ED8' } : {}), ...(isEmpty ? { color: '#D1D5DB' } : {}) }}>
        {isEmpty ? '—' : value}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Inline Approve Confirm Row
   ───────────────────────────────────────────────────────── */
function ApproveConfirmRow({
  kp,
  onConfirm,
  onCancel,
  loading,
}: {
  kp: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px',
      background: '#F0FDF4',
      borderTop: '1px solid #BBF7D0',
    }}>
      <span style={{ fontSize: 13, color: '#065F46', flexShrink: 0 }}>
        Approve this contract?
      </span>
      <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
        <Button variant="primary" size="sm" loading={loading} onClick={onConfirm}>
          Confirm
        </Button>
        <Button variant="ghost" size="sm" disabled={loading} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Inline Reject Row
   ───────────────────────────────────────────────────────── */
function RejectRow({
  kp,
  reason,
  loading,
  onChange,
  onConfirm,
  onCancel,
}: {
  kp: string;
  reason: string;
  loading: boolean;
  onChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 10,
      padding: '12px 16px',
      background: '#FFF1F2',
      borderTop: '1px solid #FECDD3',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 13, color: '#991B1B', flexShrink: 0 }}>
          Reject {kp} — provide a reason:
        </span>
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <Button variant="ghost" size="sm" disabled={loading} onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            loading={loading}
            disabled={!reason.trim()}
            onClick={onConfirm}
          >
            Confirm Rejection
          </Button>
        </div>
      </div>
      <textarea
        value={reason}
        onChange={e => onChange(e.target.value)}
        placeholder="Rejection reason (required)…"
        rows={2}
        style={{
          width: '100%', resize: 'none',
          border: '1px solid #FECDD3',
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: 13, fontFamily: 'inherit', color: '#0F1E2E',
          background: '#fff', outline: 'none',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main
   ───────────────────────────────────────────────────────── */
export default function PendingApprovalsPage({ initialData }: { initialData?: SCPaginated }) {
  const [rows, setRows] = useState<SC[]>(initialData?.items || []);
  const [loading, setLoading] = useState(!initialData);

  // Inline row actions
  const [confirmingKp, setConfirmingKp] = useState<string | null>(null);
  const [rejectingKp, setRejectingKp] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actioningKp, setActioningKp] = useState<string | null>(null);

  // Expand state
  const [expandedKp, setExpandedKp] = useState<string | null>(null);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Bulk reject modal
  const [bulkRejectOpen, setBulkRejectOpen] = useState(false);
  const [bulkReason, setBulkReason] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  // Search
  const [search, setSearch] = useState('');

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        pipeline_status: 'PENDING_APPROVAL',
        limit: '100',
        sortField: 'tgl',
        sortDir: 'desc',
      });
      if (search) params.set('kp', search);
      const data = await authFetch(`/denim/sales-contracts?${params}`) as SCPaginated;
      setRows(data?.items || []);
    } catch { /* keep existing rows on error */ }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => {
    if (initialData) return;
    fetchPending();
  }, [fetchPending]);

  const handleApprove = async () => {
    if (!confirmingKp) return;
    setActioningKp(confirmingKp);
    try {
      await authFetch(`/denim/sales-contracts/${confirmingKp}/decision`, {
        method: 'POST',
        body: JSON.stringify({ decision: 'approve' }),
      });
      setConfirmingKp(null);
      fetchPending();
    } catch { /* silently handled */ }
    finally { setActioningKp(null); }
  };

  const handleReject = async () => {
    if (!rejectingKp || !rejectReason.trim()) return;
    setActioningKp(rejectingKp);
    try {
      await authFetch(`/denim/sales-contracts/${rejectingKp}/decision`, {
        method: 'POST',
        body: JSON.stringify({ decision: 'reject', rejection_reason: rejectReason }),
      });
      setRejectingKp(null);
      setRejectReason('');
      fetchPending();
    } catch { /* silently handled */ }
    finally { setActioningKp(null); }
  };

  const handleBulkApprove = async () => {
    const kps = rows.filter(r => selectedIds.has(r.id)).map(r => r.kp);
    setBulkLoading(true);
    try {
      await Promise.all(kps.map(kp =>
        authFetch(`/denim/sales-contracts/${kp}/decision`, {
          method: 'POST',
          body: JSON.stringify({ decision: 'approve' }),
        })
      ));
      setSelectedIds(new Set());
      fetchPending();
    } catch { /* silently handled */ }
    finally { setBulkLoading(false); }
  };

  const handleBulkReject = async () => {
    if (!bulkReason.trim()) return;
    const kps = rows.filter(r => selectedIds.has(r.id)).map(r => r.kp);
    setBulkLoading(true);
    try {
      await Promise.all(kps.map(kp =>
        authFetch(`/denim/sales-contracts/${kp}/decision`, {
          method: 'POST',
          body: JSON.stringify({ decision: 'reject', rejection_reason: bulkReason }),
        })
      ));
      setBulkRejectOpen(false);
      setBulkReason('');
      setSelectedIds(new Set());
      fetchPending();
    } catch { /* silently handled */ }
    finally { setBulkLoading(false); }
  };

  const filteredRows = useMemo(() =>
    search.trim()
      ? rows.filter(r => r.kp.toLowerCase().includes(search.toLowerCase()))
      : rows,
  [rows, search]);

  const allSelected = filteredRows.length > 0 && filteredRows.every(r => selectedIds.has(r.id));
  const selectedCount = selectedIds.size;

  const COLS = ['DATE', 'KP CODE', 'CONSTRUCTION', 'TYPE', 'CUSTOMER', 'TE', 'ACTION'];
  // grid: chevron(32px) + checkbox(36px) + stripe(3px) + COL_WIDTHS
  const COL_WIDTHS = ['9%', '9%', '1fr', '8%', '14%', '7%', '120px'];

  return (
    <PageShell
      title="Pending Approvals"
      subtitle={
        loading ? 'Loading…' : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <span style={{ color: 'rgba(255,255,255,0.60)' }}>
              {filteredRows.length} contract{filteredRows.length !== 1 ? 's' : ''} awaiting decision
            </span>
            <span style={{
              backgroundColor: '#EFF6FF',
              color: '#1D4ED8',
              borderRadius: 20,
              padding: '2px 10px',
              fontSize: 12,
              fontWeight: 600,
            }}>
              {filteredRows.length}
            </span>
          </div>
        )
      }
    >
      {/* ── Search ── */}
      <div style={{ backgroundColor: '#F0F4F8', minHeight: '100vh', padding: '24px 32px' }}>
        <div style={{ marginBottom: 16 }}>
          <Input
            type="text"
            placeholder="Search by KP code…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 280 }}
          />
        </div>

        {/* ── Table ── */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: 12,
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: ['32px', '36px', '3px', ...COL_WIDTHS].join(' '),
            borderBottom: '1px solid #E5E7EB',
            background: '#F9FAFB',
          }}>
            {/* Chevron placeholder */}
            <div />
            {/* Checkbox */}
            <div style={{ padding: '10px 0 10px 12px', display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={e => {
                  if (e.target.checked) {
                    setSelectedIds(new Set(filteredRows.map(r => r.id)));
                  } else {
                    setSelectedIds(new Set());
                  }
                }}
                style={{ width: 15, height: 15, cursor: 'pointer', accentColor: '#4A7A9B' }}
              />
            </div>
            {/* Border stripe placeholder */}
            <div />
            {/* Column labels */}
            {COLS.map(col => (
              <div key={col} style={{
                padding: '10px 12px',
                fontSize: 11, fontWeight: 600,
                color: '#9CA3AF',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                {col}
              </div>
            ))}
          </div>

          {/* Body */}
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{
                display: 'grid',
                gridTemplateColumns: ['32px', '36px', '3px', ...COL_WIDTHS].join(' '),
                borderBottom: '1px solid #F3F4F6',
                height: 44, alignItems: 'center',
              }}>
                <div />
                <div style={{ padding: '0 12px' }}>
                  <Skeleton style={{ height: 12, width: '60%', borderRadius: 4 }} />
                </div>
                <div />
                {Array.from({ length: 7 }).map((_, j) => (
                  <div key={j} style={{ padding: '0 12px' }}>
                    <Skeleton style={{ height: 12, width: j === 2 ? '60%' : `${40 + (j * 13) % 40}%`, borderRadius: 4 }} />
                  </div>
                ))}
              </div>
            ))
          ) : filteredRows.length === 0 ? (
            <div style={{ padding: '48px 16px', textAlign: 'center' }}>
              <CheckCircle size={40} style={{ color: '#059669', margin: '0 auto 12px', display: 'block', opacity: 0.6 }} />
              <p style={{ fontSize: 15, fontWeight: 600, color: '#059669', margin: '0 0 6px' }}>
                No pending approvals
              </p>
              <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>
                All contracts have been reviewed
              </p>
            </div>
          ) : (
            filteredRows.map(row => {
              const isExpanded      = expandedKp === row.kp;
              const isApproveConfirming = confirmingKp === row.kp;
              const isRejecting     = rejectingKp === row.kp;
              const isActioning     = actioningKp === row.kp;

              return (
                <div key={row.id}>
                  {/* Main row */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: ['32px', '36px', '3px', ...COL_WIDTHS].join(' '),
                      borderBottom: '1px solid #F3F4F6',
                      borderLeft: `3px solid #D97706`,
                      height: 44,
                      alignItems: 'center',
                      background: selectedIds.has(row.id)
                        ? 'rgba(74,122,155,0.05)'
                        : 'transparent',
                      transition: 'background 120ms',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                      if (!selectedIds.has(row.id)) {
                        (e.currentTarget as HTMLElement).style.background = '#F9FAFB';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!selectedIds.has(row.id)) {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }
                    }}
                    onClick={e => {
                      const target = e.target as HTMLElement;
                      // Don't toggle if clicking the checkbox or action buttons
                      if (
                        target.tagName === 'INPUT' ||
                        target.tagName === 'BUTTON' ||
                        target.closest('button') ||
                        target.closest('input')
                      ) return;
                      setExpandedKp(isExpanded ? null : row.kp);
                    }}
                  >
                    {/* Chevron */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ChevronDown
                        size={14}
                        style={{
                          color: '#9CA3AF',
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 200ms',
                        }}
                      />
                    </div>

                    {/* Checkbox */}
                    <div style={{ padding: '0 0 0 0', display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={e => {
                          setSelectedIds(prev => {
                            const next = new Set(prev);
                            if (e.target.checked) next.add(row.id);
                            else next.delete(row.id);
                            return next;
                          });
                        }}
                        style={{ width: 15, height: 15, cursor: 'pointer', accentColor: '#4A7A9B' }}
                      />
                    </div>

                    {/* Border stripe */}
                    <div />

                    {/* Date */}
                    <div style={{ padding: '0 12px', fontSize: 13, color: '#6B7280' }}>
                      {formatDate(row.tgl)}
                    </div>

                    {/* KP */}
                    <div style={{ padding: '0 12px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600, color: '#1D4ED8' }}>
                      {row.kp}
                    </div>

                    {/* Construction */}
                    <div style={{ padding: '0 12px', fontSize: 13, color: '#0F1E2E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.codename || '—'}
                    </div>

                    {/* Type */}
                    <div style={{ padding: '0 12px', fontSize: 12, color: '#6B7280' }}>
                      {row.kat_kode || '—'}
                    </div>

                    {/* Customer — Task 3: safe fallback */}
                    <div style={{ padding: '0 12px', fontSize: 12, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {typeof row.permintaan === 'string' ? row.permintaan : '—'}
                    </div>

                    {/* TE */}
                    <div style={{ padding: '0 12px', fontSize: 12, color: '#6B7280' }}>
                      {row.te != null ? row.te.toLocaleString() : '—'}
                    </div>

                    {/* Action */}
                    <div style={{ padding: '0 12px', display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      {isApproveConfirming ? (
                        <button
                          onClick={() => setConfirmingKp(null)}
                          style={{
                            height: 28, padding: '0 12px', borderRadius: 6,
                            border: '1px solid #E5E7EB', background: '#FFFFFF',
                            fontSize: 12, color: '#374151', cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      ) : (
                        <button
                          disabled={isActioning}
                          onClick={() => { setConfirmingKp(row.kp); setRejectingKp(null); }}
                          style={{
                            height: 28, padding: '0 12px', borderRadius: 6,
                            border: '1px solid #A7F3D0', background: '#ECFDF5',
                            color: '#059669', fontSize: 12, fontWeight: 600,
                            cursor: isActioning ? 'not-allowed' : 'pointer',
                            opacity: isActioning ? 0.6 : 1,
                            transition: 'background 150ms',
                          }}
                          onMouseEnter={e => { if (!isActioning) (e.currentTarget as HTMLElement).style.background = '#D1FAE5'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#ECFDF5'; }}
                        >
                          Approve
                        </button>
                      )}
                      {isRejecting ? (
                        <button
                          onClick={() => { setRejectingKp(null); setRejectReason(''); }}
                          style={{
                            height: 28, padding: '0 12px', borderRadius: 6,
                            border: '1px solid #E5E7EB', background: '#FFFFFF',
                            fontSize: 12, color: '#374151', cursor: 'pointer',
                          }}
                        >
                          Cancel
                        </button>
                      ) : (
                        <button
                          disabled={isActioning}
                          onClick={() => { setRejectingKp(row.kp); setConfirmingKp(null); }}
                          style={{
                            height: 28, padding: '0 12px', borderRadius: 6,
                            border: '1px solid #FECACA', background: '#FEF2F2',
                            color: '#DC2626', fontSize: 12, fontWeight: 600,
                            cursor: isActioning ? 'not-allowed' : 'pointer',
                            opacity: isActioning ? 0.6 : 1,
                            transition: 'background 150ms',
                          }}
                          onMouseEnter={e => { if (!isActioning) (e.currentTarget as HTMLElement).style.background = '#FEE2E2'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; }}
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Detail Panel — Task 1 */}
                  {isExpanded && <DetailPanel row={row} />}

                  {/* Inline Approve Confirm */}
                  {isApproveConfirming && (
                    <ApproveConfirmRow
                      kp={row.kp}
                      loading={isActioning && confirmingKp === row.kp}
                      onConfirm={handleApprove}
                      onCancel={() => setConfirmingKp(null)}
                    />
                  )}

                  {/* Inline Reject */}
                  {isRejecting && (
                    <RejectRow
                      kp={row.kp}
                      reason={rejectReason}
                      loading={isActioning && rejectingKp === row.kp}
                      onChange={setRejectReason}
                      onConfirm={handleReject}
                      onCancel={() => { setRejectingKp(null); setRejectReason(''); }}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ── Bulk Reject Modal (inline below bulk bar) ── */}
        {bulkRejectOpen && (
          <div style={{
            position: 'fixed', bottom: 64, left: 'var(--sidebar-width)', right: 0,
            background: '#FFF1F2', borderTop: '1px solid #FECDD3',
            padding: '16px 32px', zIndex: 31,
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <p style={{ fontSize: 13, color: '#991B1B', fontWeight: 500, margin: 0 }}>
              Bulk rejection — same reason will apply to all {selectedCount} selected contracts:
            </p>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <textarea
                value={bulkReason}
                onChange={e => setBulkReason(e.target.value)}
                placeholder="Rejection reason (required)…"
                rows={2}
                style={{
                  flex: 1, resize: 'none', border: '1px solid #FECDD3',
                  borderRadius: 8, padding: '8px 12px',
                  fontSize: 13, fontFamily: 'inherit', color: '#0F1E2E',
                  background: '#fff', outline: 'none', boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  variant="danger"
                  size="sm"
                  loading={bulkLoading}
                  disabled={!bulkReason.trim()}
                  onClick={handleBulkReject}
                >
                  Reject {selectedCount}
                </Button>
                <Button variant="ghost" size="sm" disabled={bulkLoading} onClick={() => { setBulkRejectOpen(false); setBulkReason(''); }}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Sticky Bulk Action Bar ── */}
        {selectedCount > 0 && (
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 'var(--sidebar-width)',
            right: 0,
            height: 56,
            background: `linear-gradient(to right, #0D1F3C, #1A3050)`,
            backgroundImage: `url('/denim_bg.jpg'), linear-gradient(to right, #0D1F3C, #1A3050)`,
            backgroundSize: 'cover, auto',
            backgroundBlendMode: 'multiply, normal',
            backgroundPosition: 'center, 0 0',
            borderTop: '1px solid rgba(255,255,255,0.10)',
            padding: '0 32px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            zIndex: bulkRejectOpen ? 29 : 30,
          }}>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 13, fontWeight: 600, color: '#EEF3F7',
            }}>
              {selectedCount} selected
            </span>

            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.12)' }} />

            {bulkRejectOpen ? (
              <span style={{ fontSize: 12, color: 'rgba(238,243,247,0.50)' }}>
                Enter rejection reason below…
              </span>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  loading={bulkLoading}
                  onClick={handleBulkApprove}
                >
                  Approve All
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setBulkRejectOpen(true)}
                >
                  Reject All
                </Button>
              </>
            )}

            <div style={{ marginLeft: 'auto' }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
                style={{ color: 'rgba(238,243,247,0.60)' }}
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 1023px) {
          div[style*="repeat"] {
            overflow-x: auto;
          }
        }
      `}</style>
    </PageShell>
  );
}
