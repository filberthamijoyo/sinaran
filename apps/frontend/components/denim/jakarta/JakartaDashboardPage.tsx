'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/ui/erp/PageShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authFetch } from '@/lib/authFetch';

/* ─────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────── */
interface RecentByStage {
  PENDING_APPROVAL?: SalesContract[];
  SACON?: SalesContract[];
}

interface SalesContract {
  kp: string;
  tgl: string;
  construction?: string;
  customer?: string;
  pipeline_status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SummaryData {
  total: number;
  inProgress: number;
  recentlyCompleted: number;
  stageCounts: Record<string, number>;
  recentByStage: RecentByStage;
}

/* ─────────────────────────────────────────────────────────
   Design tokens
   ───────────────────────────────────────────────────────── */
const T = {
  border:        '#E5E7EB',
  textPrimary:   '#0F1E2E',
  textSecondary: '#6B7280',
  textMuted:     '#9CA3AF',
  primary:       '#1D4ED8',
  successBg:    '#ECFDF5',
  successText:  '#059669',
  dangerBg:     '#FEF2F2',
  dangerBorder: '#FECACA',
} as const;

/* ─────────────────────────────────────────────────────────
   Pipeline bar config
   ───────────────────────────────────────────────────────── */
const PIPELINE_STAGES = [
  { key: 'PENDING_APPROVAL', label: 'Pending',     color: '#D97706' },
  { key: 'SACON',            label: 'Sacon',       color: '#7C3AED' },
  { key: 'WARPING',          label: 'Warping',     color: '#2563EB' },
  { key: 'INDIGO',           label: 'Indigo',      color: '#0891B2' },
  { key: 'WEAVING',          label: 'Weaving',     color: '#059669' },
  { key: 'INSPECT_GRAY',     label: 'Inspect Gray',color: '#D97706' },
  { key: 'BBSF',             label: 'BBSF',        color: '#7C3AED' },
  { key: 'INSPECT_FINISH',   label: 'Inspect Finish', color: '#EA580C' },
  { key: 'COMPLETE',         label: 'Complete',    color: '#059669' },
  { key: 'REJECTED',         label: 'Rejected',    color: '#DC2626' },
];

/* ─────────────────────────────────────────────────────────
   Mini table header / row helpers
   ───────────────────────────────────────────────────────── */
function MiniTableHeader({ cols }: { cols: string[] }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: cols.map((_, i, arr) =>
        i === arr.length - 1 ? '1fr' : '1fr'
      ).join(' '),
      borderBottom: `1px solid ${T.border}`,
      padding: '0 16px',
      gap: 8,
      height: 36,
      alignItems: 'center',
    }}>
      {cols.map(c => (
        <span key={c} style={{
          fontSize: 11, fontWeight: 500, color: T.textMuted,
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>{c}</span>
      ))}
    </div>
  );
}

function MiniTableRow({
  style,
  children,
}: {
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr',
      borderBottom: `1px solid #F3F4F6`,
      padding: '0 16px',
      height: 40,
      alignItems: 'center',
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Pending Approvals — left panel
   ───────────────────────────────────────────────────────── */
function PendingApprovalsPanel({
  items,
  onRefresh,
}: {
  items: SalesContract[];
  onRefresh: () => void;
}) {
  const [expandedReject, setExpandedReject] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [loadingKp, setLoadingKp] = useState<string | null>(null);

  const handleApprove = async (kp: string) => {
    setLoadingKp(kp);
    try {
      await authFetch(`/denim/sales-contracts/${kp}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'approve' }),
      });
      onRefresh();
    } catch {
      // silently fail for now
    } finally {
      setLoadingKp(null);
    }
  };

  const handleReject = async (kp: string) => {
    if (!rejectReason.trim()) return;
    setLoadingKp(kp);
    try {
      await authFetch(`/denim/sales-contracts/${kp}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'reject', rejection_reason: rejectReason }),
      });
      setExpandedReject(null);
      setRejectReason('');
      onRefresh();
    } catch {
      // silently fail
    } finally {
      setLoadingKp(null);
    }
  };

  const handleCloseReject = (kp: string) => {
    setExpandedReject(kp === expandedReject ? null : kp);
    setRejectReason('');
  };

  return (
    <div>
      {items.length === 0 ? (
        <div style={{ padding: '24px 16px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: T.textMuted }}>No pending approvals</p>
        </div>
      ) : (
        <div>
          <MiniTableHeader cols={['Date', 'KP', 'Construction', 'Customer', 'Action']} />
          {items.map(item => (
            <div key={item.kp}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '80px 100px 1fr 80px 130px',
                borderBottom: `1px solid #F3F4F6`,
                height: 40,
                alignItems: 'center',
                gap: 8,
                padding: '0 16px',
              }}>
                {/* Date */}
                <span style={{ fontSize: 11, color: T.textSecondary }}>
                  {item.tgl ? new Date(item.tgl).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
                </span>
                {/* KP */}
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12, fontWeight: 600, color: T.primary,
                }}>
                  {item.kp}
                </span>
                {/* Construction */}
                <span style={{ fontSize: 12, color: T.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.construction ?? '—'}
                </span>
                {/* Customer */}
                <span style={{ fontSize: 12, color: T.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.customer ?? '—'}
                </span>
                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <Button
                    variant="primary"
                    size="sm"
                    loading={loadingKp === item.kp}
                    onClick={() => handleApprove(item.kp)}
                    style={{ fontSize: 11, height: 26, padding: '0 10px', borderRadius: 20, fontWeight: 600 }}
                  >
                    ACC
                  </Button>
                  {expandedReject === item.kp ? (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCloseReject(item.kp)}
                      style={{ fontSize: 11, height: 26, padding: '0 8px' }}
                    >
                      ✕
                    </Button>
                  ) : (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setExpandedReject(item.kp)}
                      style={{ fontSize: 11, height: 26, padding: '0 10px', borderRadius: 20, fontWeight: 600 }}
                    >
                      REJ
                    </Button>
                  )}
                </div>
              </div>

              {/* Inline rejection reason */}
              {expandedReject === item.kp && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 100px 1fr 80px 130px',
                  gap: 8,
                  alignItems: 'center',
                  padding: '8px 16px',
                  background: T.dangerBg,
                  borderBottom: `1px solid ${T.dangerBorder}`,
                }}>
                  <div />
                  <div />
                  <Input
                    placeholder="Rejection reason…"
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    style={{ height: 30, fontSize: 12 }}
                  />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Button
                      variant="danger"
                      size="sm"
                      loading={loadingKp === item.kp}
                      onClick={() => handleReject(item.kp)}
                      disabled={!rejectReason.trim()}
                      style={{ fontSize: 11, height: 26, padding: '0 8px' }}
                    >
                      Confirm REJ
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Pending Sacon — right panel
   ───────────────────────────────────────────────────────── */
function PendingSaconPanel({
  items,
  onRefresh,
}: {
  items: SalesContract[];
  onRefresh: () => void;
}) {
  const [expandedReject, setExpandedReject] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [loadingKp, setLoadingKp] = useState<string | null>(null);

  const handleAcc = async (kp: string) => {
    setLoadingKp(kp);
    try {
      await authFetch(`/denim/sales-contracts/${kp}/sacon-decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'ACC' }),
      });
      onRefresh();
    } catch {
      // silently fail
    } finally {
      setLoadingKp(null);
    }
  };

  const handleTolak = async (kp: string) => {
    if (!rejectReason.trim()) return;
    setLoadingKp(kp);
    try {
      await authFetch(`/denim/sales-contracts/${kp}/sacon-decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'TIDAK ACC', rejection_reason: rejectReason }),
      });
      setExpandedReject(null);
      setRejectReason('');
      onRefresh();
    } catch {
      // silently fail
    } finally {
      setLoadingKp(null);
    }
  };

  return (
    <div>
      {items.length === 0 ? (
        <div style={{ padding: '24px 16px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: T.textMuted }}>No pending sacon</p>
        </div>
      ) : (
        <div>
          <MiniTableHeader cols={['Date', 'KP', 'Construction', 'Action']} />
          {items.map(item => (
            <div key={item.kp}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '80px 100px 1fr 140px',
                borderBottom: `1px solid #F3F4F6`,
                height: 40,
                alignItems: 'center',
                gap: 8,
                padding: '0 16px',
              }}>
                {/* Date */}
                <span style={{ fontSize: 11, color: T.textSecondary }}>
                  {item.tgl ? new Date(item.tgl).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '—'}
                </span>
                {/* KP */}
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12, fontWeight: 600, color: T.primary,
                }}>
                  {item.kp}
                </span>
                {/* Construction */}
                <span style={{ fontSize: 12, color: T.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.construction ?? '—'}
                </span>
                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <Button
                    variant="primary"
                    size="sm"
                    loading={loadingKp === item.kp}
                    onClick={() => handleAcc(item.kp)}
                    style={{ fontSize: 11, height: 26, padding: '0 10px', borderRadius: 20, fontWeight: 600 }}
                  >
                    ACC
                  </Button>
                  {expandedReject === item.kp ? (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => { setExpandedReject(null); setRejectReason(''); }}
                      style={{ fontSize: 11, height: 26, padding: '0 8px' }}
                    >
                      ✕
                    </Button>
                  ) : (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setExpandedReject(item.kp)}
                      style={{ fontSize: 11, height: 26, padding: '0 10px', borderRadius: 20, fontWeight: 600 }}
                    >
                      TIDAK ACC
                    </Button>
                  )}
                </div>
              </div>

              {/* Inline rejection */}
              {expandedReject === item.kp && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 100px 1fr 140px',
                  gap: 8,
                  alignItems: 'center',
                  padding: '8px 16px',
                  background: T.dangerBg,
                  borderBottom: `1px solid ${T.dangerBorder}`,
                }}>
                  <div />
                  <div />
                  <Input
                    placeholder="Reason for rejection…"
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    style={{ height: 30, fontSize: 12 }}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    loading={loadingKp === item.kp}
                    onClick={() => handleTolak(item.kp)}
                    disabled={!rejectReason.trim()}
                    style={{ fontSize: 11, height: 26, padding: '0 8px' }}
                  >
                    Confirm
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Pipeline Status — CSS bar chart
   ───────────────────────────────────────────────────────── */
function PipelineBars({ stageCounts }: { stageCounts: Record<string, number> }) {
  const total = Object.values(stageCounts).reduce((s, v) => s + v, 0);
  if (total === 0) {
    return (
      <div style={{ padding: '16px 0', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: T.textMuted }}>No pipeline data</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {PIPELINE_STAGES.map(({ key, label, color }) => {
        const count = stageCounts[key] ?? 0;
        if (count === 0) return null;
        const pct = (count / total) * 100;
        return (
          <div
            key={key}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              height: 36,
            }}
          >
            {/* Stage label */}
            <div style={{ minWidth: 120 }}>
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                color,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                {label}
              </span>
            </div>
            {/* Bar */}
            <div style={{
              flex: 1, height: 8,
              background: '#F3F4F6',
              borderRadius: 4, overflow: 'hidden',
              position: 'relative',
            }}>
              <div style={{
                position:   'absolute',
                top:        0,
                left:       0,
                width:      `${pct}%`,
                height:     '100%',
                background: color,
                borderRadius: 4,
                transition: 'width 400ms ease',
              }} />
            </div>
            {/* Count */}
            <span style={{
              minWidth: 32, textAlign: 'right',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 13, fontWeight: 600, color: '#0F1E2E',
            }}>
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main
   ───────────────────────────────────────────────────────── */
export default function JakartaDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authFetch<SummaryData>('/denim/admin/summary');
      setData(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  const pendingApprovals = data?.recentByStage.PENDING_APPROVAL ?? [];
  const pendingSacons = data?.recentByStage.SACON ?? [];
  const stageCounts = data?.stageCounts ?? {};
  const pendingCount = stageCounts['PENDING_APPROVAL'] ?? 0;

  const completedThisMonth = stageCounts['COMPLETE'] ?? 0;
  const inPipeline = ['WARPING','INDIGO','WEAVING','INSPECT_GRAY','BBSF','INSPECT_FINISH']
    .reduce((s, k) => s + (stageCounts[k] ?? 0), 0);

  return (
    <div style={{ backgroundColor: '#F0F4F8', minHeight: '100vh' }}>
      <PageShell
        title="Dashboard"
        subtitle="Jakarta HQ"
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/denim/approvals/pending')}
            style={{ color: '#1D4ED8', fontSize: 13, fontWeight: 500 }}
          >
            Review All →
          </Button>
        }
      >
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16, boxSizing: 'border-box' }}>

          {/* ── Row 1: Hero (2fr) + KPI stack (1fr) ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, minHeight: 220 }}>
            {/* Dark hero: Total Contracts */}
            <div style={{
              backgroundColor: '#0D1B3E',
              backgroundImage: "url('/denim_bg.jpg')",
              backgroundSize: 'cover',
              backgroundBlendMode: 'multiply',
              borderRadius: 12,
              padding: '28px 32px',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <p style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
                Total Contracts
              </p>
              <div>
                <p style={{ fontSize: 64, fontWeight: 800, color: '#FFFFFF', fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '-0.02em', lineHeight: 1, margin: 0 }}>
                  {loading ? '—' : (data?.total ?? 0).toLocaleString()}
                </p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '6px 0 0 0' }}>
                  all time
                </p>
              </div>
            </div>

            {/* KPI stack: Pending + Sacon */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Pending Approval */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 24px', flex: 1 }}>
                <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, color: '#D97706', margin: 0, marginBottom: 10 }}>
                  Pending Approval
                </p>
                <p style={{ fontSize: 44, fontWeight: 800, color: '#0F1E2E', fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1, margin: 0 }}>
                  {loading ? '—' : pendingCount}
                </p>
                <p style={{ fontSize: 13, color: '#9CA3AF', margin: '8px 0 0 0' }}>
                  need review
                </p>
              </div>
              {/* Sacon Wait */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 24px', flex: 1 }}>
                <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, color: '#7C3AED', margin: 0, marginBottom: 10 }}>
                  Sacon Wait
                </p>
                <p style={{ fontSize: 44, fontWeight: 800, color: '#0F1E2E', fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1, margin: 0 }}>
                  {loading ? '—' : (stageCounts['SACON'] ?? 0)}
                </p>
                <p style={{ fontSize: 13, color: '#9CA3AF', margin: '8px 0 0 0' }}>
                  awaiting ACC
                </p>
              </div>
            </div>
          </div>

          {/* ── Row 2: 3 stat cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {/* Pending Approval */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 20px' }}>
              <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, color: '#D97706', margin: 0, marginBottom: 8 }}>
                Pending Approval
              </p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#0F1E2E', fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1, margin: 0 }}>
                {loading ? '—' : pendingCount}
              </p>
              <p style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 0 0' }}>
                awaiting Jakarta review
              </p>
            </div>
            {/* Completed */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 20px' }}>
              <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, color: '#059669', margin: 0, marginBottom: 8 }}>
                Completed
              </p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#0F1E2E', fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1, margin: 0 }}>
                {loading ? '—' : completedThisMonth}
              </p>
              <p style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 0 0' }}>
                orders completed
              </p>
            </div>
            {/* Active Pipeline */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 20px' }}>
              <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, color: '#0891B2', margin: 0, marginBottom: 8 }}>
                Active Pipeline
              </p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#0F1E2E', fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1, margin: 0 }}>
                {loading ? '—' : inPipeline}
              </p>
              <p style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 0 0' }}>
                orders in production
              </p>
            </div>
          </div>

          {/* ── Row 3: Pending Approvals mini-table (3fr) + Pipeline bars (2fr) ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16, minHeight: 300 }}>
            {/* Left: Pending Approvals */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '12px 20px', borderBottom: '1px solid #E5E7EB', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#0F1E2E', margin: 0 }}>
                    Pending Approvals
                  </p>
                  <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>
                    Sales contracts awaiting your decision
                  </p>
                </div>
                <button
                  onClick={() => router.push('/denim/approvals/pending')}
                  style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 500, color: '#1D4ED8', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
                >
                  Review All →
                </button>
              </div>
              <div style={{ flex: 1, overflow: 'auto' }}>
                {loading ? (
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ height: 40, background: '#F3F4F6', borderRadius: 6 }} />
                    ))}
                  </div>
                ) : error ? (
                  <div style={{ padding: 16 }}>
                    <p style={{ fontSize: 12, color: '#DC2626' }}>{error}</p>
                    <Button variant="secondary" size="sm" onClick={fetchSummary} style={{ marginTop: 8 }}>Retry</Button>
                  </div>
                ) : (
                  <PendingApprovalsPanel items={pendingApprovals.slice(0, 5)} onRefresh={fetchSummary} />
                )}
              </div>
            </div>

            {/* Right: Pipeline Status bars */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 24px' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#0F1E2E', margin: '0 0 16px 0' }}>
                Pipeline Status
              </p>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {PIPELINE_STAGES.slice(0, 5).map(stage => (
                    <div key={stage.key} style={{ height: 36, background: '#F3F4F6', borderRadius: 6 }} />
                  ))}
                </div>
              ) : (
                <PipelineBars stageCounts={stageCounts} />
              )}
            </div>
          </div>

        </div>

        <style>{`
          @media (max-width: 1023px) {
            div[style*="2fr 1fr"] { grid-template-columns: 1fr !important; }
          }
          @media (max-width: 767px) {
            div[style*="2fr 1fr"] { grid-template-columns: 1fr !important; }
            div[style*="3fr 2fr"] { grid-template-columns: 1fr !important; }
            div[style*="repeat(3, 1fr)"] { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </PageShell>
    </div>
  );
}
