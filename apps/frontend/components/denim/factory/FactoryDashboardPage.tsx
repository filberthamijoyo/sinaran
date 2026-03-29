'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/ui/erp/PageShell';
import { SectionCard } from '@/components/ui/erp/SectionCard';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { authFetch } from '@/lib/authFetch';
import { CheckCircle, Plus } from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────── */
interface SalesContract {
  kp: string;
  tgl: string;
  construction?: string;
  customer?: string;
  pipeline_status: string;
  createdAt?: string;
  updatedAt?: string;
  /** actual efficiency or score if present */
  te?: string | number;
}

type FactoryStage = 'warping' | 'indigo' | 'weaving' | 'inspect_gray' | 'bbsf' | 'inspect_finish' | 'sacon';

const STAGE_LABELS: Record<FactoryStage, string> = {
  warping:        'Warping',
  indigo:         'Indigo',
  weaving:        'Weaving',
  inspect_gray:   'Inspect Gray',
  bbsf:           'BBSF',
  inspect_finish: 'Inspect Finish',
  sacon:          'Sacon',
};

const STAGE_ORDER: FactoryStage[] = [
  'warping', 'indigo', 'weaving', 'inspect_gray', 'bbsf', 'inspect_finish', 'sacon',
];

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function stageTitle(stage: string): string {
  return capitalize(STAGE_LABELS[stage as FactoryStage] ?? stage);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const today = new Date();
  return d.getFullYear() === today.getFullYear()
    && d.getMonth() === today.getMonth()
    && d.getDate() === today.getDate();
}

/* ─────────────────────────────────────────────────────────
   Main
   ───────────────────────────────────────────────────────── */
export default function FactoryDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const stage = (user as { stage?: string } | null)?.stage ?? 'warping';
  const stageName = stageTitle(stage);
  const isSacon = stage === 'sacon';

  const [rows, setRows] = useState<SalesContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const upperStage = stage.toUpperCase();
      const data = await authFetch<{ data: SalesContract[] }>(
        `/denim/sales-contracts?pipeline_status=${upperStage}&limit=100`
      );
      setRows(data?.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [stage]);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  const completedToday = rows.filter(r =>
    r.updatedAt && isToday(r.updatedAt)
  ).length;

  const queueRows = rows.slice(0, 5);
  const inboxHref = isSacon ? '/denim/inbox/sacon' : `/denim/inbox/${stage}`;
  const newOrderHref = '/denim/inbox/sacon/new';

  return (
    <div style={{ backgroundColor: '#F0F4F8', minHeight: '100vh' }}>
      <PageShell
        title={`${stageName} Station`}
        subtitle={user ? `Welcome back, ${user.name}` : ''}
        actions={
          isSacon ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Plus size={13} />}
                onClick={() => router.push(newOrderHref)}
                style={{ color: '#1D4ED8', fontSize: 13, fontWeight: 500 }}
              >
                New Order →
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(inboxHref)}
                style={{ color: '#1D4ED8', fontSize: 13, fontWeight: 500 }}
              >
                Open Inbox →
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(inboxHref)}
              style={{ color: '#1D4ED8', fontSize: 13, fontWeight: 500 }}
            >
              Open Inbox →
            </Button>
          )
        }
      >
        {/* ── KPI Row ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          marginBottom: 20,
        }}>
          <StatCard
            variant="dark"
            label="PENDING IN QUEUE"
            value={loading ? '' : rows.length}
            loading={loading}
            sublabel={`orders awaiting ${stageName.toLowerCase()}`}
          />
          <StatCard
            variant="light"
            label="COMPLETED TODAY"
            value={loading ? '' : completedToday}
            loading={loading}
            sublabel="orders moved forward"
          />
          <StatCard
            variant="light"
            label="YOUR STAGE"
            value={stageName}
            loading={loading}
            sublabel="assigned workstation"
          />
        </div>

        {/* ── Your Queue ── */}
        <SectionCard
          title="Your Queue"
          subtitle="Orders pending your action"
          action={
            <button
              onClick={() => router.push(inboxHref)}
              style={{
                background: 'none', border: 'none',
                fontSize: 13, fontWeight: 500, color: '#1D4ED8',
                cursor: 'pointer', fontFamily: 'inherit', padding: 0,
              }}
            >
              Open Inbox →
            </button>
          }
        >
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 0' }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ height: 40, background: '#F3F4F6', borderRadius: 6 }} />
              ))}
            </div>
          ) : error ? (
            <div style={{ padding: '8px 0' }}>
              <p style={{ fontSize: 12, color: 'var(--danger-text)' }}>{error}</p>
              <Button variant="secondary" size="sm" onClick={fetchQueue} style={{ marginTop: 8 }}>Retry</Button>
            </div>
          ) : queueRows.length === 0 ? (
            <div style={{
              padding: '32px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CheckCircle size={20} style={{ color: '#059669' }} />
              </div>
              <p style={{ fontSize: 14, color: '#059669', fontWeight: 500, margin: 0 }}>
                Your queue is clear
              </p>
              <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0, marginTop: 4 }}>
                No orders pending at {stageName.toLowerCase()} right now.
              </p>
            </div>
          ) : (
            <div>
              {/* Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '80px 100px 1fr 60px 90px',
                borderBottom: '1px solid #E5E7EB',
                padding: '0 16px',
                gap: 8,
                height: 36,
                alignItems: 'center',
              }}>
                {['Date', 'KP', 'Construction', 'TE', 'Action'].map(c => (
                  <span key={c} style={{
                    fontSize: 11, fontWeight: 500, color: '#9CA3AF',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>{c}</span>
                ))}
              </div>
              {/* Rows */}
              {queueRows.map((row, i) => (
                <div
                  key={row.kp}
                  onClick={() => router.push(`${inboxHref}/${row.kp}`)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 100px 1fr 60px 90px',
                    borderBottom: i < queueRows.length - 1 ? '1px solid #F3F4F6' : 'none',
                    height: 40,
                    alignItems: 'center',
                    gap: 8,
                    padding: '0 16px',
                    cursor: 'pointer',
                    transition: 'background 120ms',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  {/* Date */}
                  <span style={{ fontSize: 11, color: '#6B7280' }}>
                    {row.tgl ? formatDate(row.tgl) : '—'}
                  </span>
                  {/* KP */}
                  <span style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 12, fontWeight: 600, color: '#1D4ED8',
                  }}>
                    {row.kp}
                  </span>
                  {/* Construction */}
                  <span style={{
                    fontSize: 12, color: '#6B7280',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {row.construction ?? '—'}
                  </span>
                  {/* TE */}
                  <span style={{
                    fontSize: 12, color: '#6B7280',
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}>
                    {row.te ?? '—'}
                  </span>
                  {/* Action */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={e => { e.stopPropagation(); router.push(`${inboxHref}/${row.kp}`); }}
                      style={{
                        background: 'none', border: 'none',
                        fontSize: 12, fontWeight: 500, color: '#1D4ED8',
                        cursor: 'pointer', fontFamily: 'inherit', padding: '2px 0',
                      }}
                    >
                      Fill Form →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ── History ── */}
        <div style={{ marginTop: 16 }}>
          <SectionCard
            title="History"
            subtitle="Recent submissions"
            action={
              <button
                onClick={() => router.push(`/denim/inbox/${stage}/history`)}
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
            <div style={{ padding: '16px 4px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <p style={{ fontSize: 13, color: '#6B7280', flex: 1 }}>
                View your submission history and track past orders.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push(`/denim/inbox/${stage}/history`)}
              >
                View History →
              </Button>
            </div>
          </SectionCard>
        </div>

        <style>{`
          @media (max-width: 767px) {
            div[style*="repeat(3, 1fr)"] {
              grid-template-columns: 1fr !important;
            }
            div[style*="gridTemplateColumns: '80px 100px 1fr 60px 90px'"] {
              grid-template-columns: 72px 1fr 60px !important;
            }
          }
        `}</style>
      </PageShell>
    </div>
  );
}
