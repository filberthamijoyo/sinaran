'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/ui/erp/PageShell';
import { SectionCard } from '@/components/ui/erp/SectionCard';
import { StatCard } from '@/components/ui/stat-card';
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
        {/* ── KPI Row ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 20,
        }}>
          <StatCard
            variant="dark"
            label="TOTAL CONTRACTS"
            value={loading ? '' : (data?.total ?? 0)}
            loading={loading}
          />
          <StatCard
            variant="light"
            label="PENDING APPROVAL"
            value={loading ? '' : pendingCount}
            loading={loading}
            trend={pendingCount > 0 ? { value: pendingCount, label: 'need review' } : undefined}
          />
          <StatCard
            variant="light"
            label="PENDING SACON"
            value={loading ? '' : (stageCounts['SACON'] ?? 0)}
            loading={loading}
          />
          <StatCard
            variant="dark"
            label="COMPLETED THIS MONTH"
            value={loading ? '' : (data?.recentlyCompleted ?? 0)}
            loading={loading}
          />
        </div>

        {/* ── Two-column panels ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '3fr 2fr',
          gap: 16,
          marginBottom: 16,
        }}>
          {/* Left: Pending Approvals */}
          <SectionCard
            title="Pending Approvals"
            subtitle="Sales contracts awaiting your decision"
            action={
              <button
                onClick={() => router.push('/denim/approvals/pending')}
                style={{
                  background: 'none', border: 'none',
                  fontSize: 13, fontWeight: 500, color: '#1D4ED8',
                  cursor: 'pointer', fontFamily: 'inherit', padding: 0,
                }}
              >
                Review All →
              </button>
            }
          >
            {loading ? (
              <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{ height: 40, background: '#F3F4F6', borderRadius: 6 }} />
                ))}
              </div>
            ) : error ? (
              <div style={{ padding: '16px 0' }}>
                <p style={{ fontSize: 12, color: 'var(--danger-text)' }}>{error}</p>
                <Button variant="secondary" size="sm" onClick={fetchSummary} style={{ marginTop: 8 }}>Retry</Button>
              </div>
            ) : (
              <PendingApprovalsPanel items={pendingApprovals.slice(0, 5)} onRefresh={fetchSummary} />
            )}
          </SectionCard>

          {/* Right: Pending Sacon */}
          <SectionCard
            title="Pending Sacon"
            subtitle="Sacon samples awaiting ACC decision"
            action={
              <button
                onClick={() => router.push('/denim/approvals/sacon')}
                style={{
                  background: 'none', border: 'none',
                  fontSize: 13, fontWeight: 500, color: '#1D4ED8',
                  cursor: 'pointer', fontFamily: 'inherit', padding: 0,
                }}
              >
                View All →
              </button>
            }
          >
            {loading ? (
              <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{ height: 40, background: '#F3F4F6', borderRadius: 6 }} />
                ))}
              </div>
            ) : (
              <PendingSaconPanel items={pendingSacons.slice(0, 5)} onRefresh={fetchSummary} />
            )}
          </SectionCard>
        </div>

        {/* ── Pipeline Status ── */}
        <SectionCard
          title="Pipeline Status"
          subtitle="Current order distribution across all stages"
        >
          <div style={{ marginTop: 8 }}>
            <PipelineBars stageCounts={stageCounts} />
          </div>
        </SectionCard>

        <style>{`
          @media (max-width: 1023px) {
            div[style*="repeat(4, 1fr)"] {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
          @media (max-width: 767px) {
            div[style*="repeat(4, 1fr)"] {
              grid-template-columns: 1fr !important;
            }
            div[style*="3fr 2fr"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </PageShell>
    </div>
  );
}
