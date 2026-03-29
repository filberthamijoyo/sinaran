'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { PageShell } from '@/components/ui/erp/PageShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import PipelineStagesCard from './PipelineStagesCard';
import { authFetch } from '@/lib/authFetch';

// ─── Chart dynamic imports ──────────────────────────────────────
const BarChart = dynamic(() =>
  import('recharts').then(m => ({ default: m.BarChart })), { ssr: false }
);
const Bar = dynamic(() =>
  import('recharts').then(m => ({ default: m.Bar })), { ssr: false }
);
const XAxis = dynamic(() =>
  import('recharts').then(m => ({ default: m.XAxis })), { ssr: false }
);
const YAxis = dynamic(() =>
  import('recharts').then(m => ({ default: m.YAxis })), { ssr: false }
);
const Tooltip = dynamic(() =>
  import('recharts').then(m => ({ default: m.Tooltip })), { ssr: false }
);
const ResponsiveContainer = dynamic(() =>
  import('recharts').then(m => ({ default: m.ResponsiveContainer })), { ssr: false }
);
const LineChart = dynamic(() =>
  import('recharts').then(m => ({ default: m.LineChart })), { ssr: false }
);
const Line = dynamic(() =>
  import('recharts').then(m => ({ default: m.Line })), { ssr: false }
);
const Area = dynamic(() =>
  import('recharts').then(m => ({ default: m.Area })), { ssr: false }
);

// ─── Types ──────────────────────────────────────────────────────
interface StaleOrder { kp: string; pipeline_status: string; tgl: string; }
interface RecentActivity { kp: string; pipeline_status: string; updatedAt: string; codename?: string; }
interface WeeklyEffWeek { week: string; avg_efficiency: number; record_count: number; }

interface ThroughputPoint { bucket: string; stage: string; count: number; }
interface ThroughputData { period: string; data: ThroughputPoint[]; }

interface AdminSummary {
  total: number;
  inProgress: number;
  recentlyCompleted: number;
  blockedCount: number;
  stageCounts: Record<string, number>;
  typeCounts: Record<string, number>;
  weeklyEfficiency: WeeklyEffWeek[];
  staleOrders: StaleOrder[];
  recentActivity: RecentActivity[];
}

type Period = 'day' | 'week' | 'month';

// ─── Stage config ───────────────────────────────────────────────
const CHART_STAGES = ['WARPING', 'INDIGO', 'WEAVING', 'INSPECT_GRAY', 'BBSF', 'INSPECT_FINISH', 'COMPLETE'];

const STAGE_COLORS: Record<string, string> = {
  PENDING_APPROVAL: '#D97706',
  WARPING:          '#4A7A9B',
  INDIGO:           '#0891B2',
  WEAVING:          '#059669',
  INSPECT_GRAY:     '#D97706',
  BBSF:             '#EA580C',
  INSPECT_FINISH:   '#2B506E',
  COMPLETE:         '#059669',
  REJECTED:         '#DC2626',
};

// ─── Utility ────────────────────────────────────────────────────
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1)  return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)   return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7)     return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function stageDaysAgo(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

function formatBucket(iso: string, period: Period): string {
  const d = new Date(iso);
  if (period === 'day') {
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  }
  if (period === 'week') {
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  }
  return d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
}

function buildChartData(raw: ThroughputPoint[], period: Period): Record<string, string | number>[] {
  const buckets = [...new Set(raw.map(r => r.bucket))].sort();
  const keys = [...new Set(raw.map(r => r.stage))];
  return buckets.map(bucket => {
    const row: Record<string, string | number> = { bucket, label: formatBucket(bucket, period) };
    keys.forEach(k => {
      const entry = raw.find(r => r.bucket === bucket && r.stage === k);
      row[k] = entry?.count ?? 0;
    });
    return row;
  });
}

// ─── Throughput helpers ─────────────────────────────────────────
interface ThroughputStat { label: string; count: number; }

function todayCounts(data: ThroughputPoint[]): ThroughputStat[] {
  const stageMap: Record<string, string> = {
    PENDING_APPROVAL: 'contracts',
    WARPING:          'warping',
    BBSF:             'bbsf',
    COMPLETE:         'completed',
  };
  const result: Record<string, number> = { contracts: 0, warping: 0, bbsf: 0, completed: 0 };
  data.forEach(p => {
    const key = stageMap[p.stage];
    if (key) result[key] = (result[key] ?? 0) + p.count;
  });
  return [
    { label: 'Contracts Today',  count: result.contracts },
    { label: 'Warping Today',    count: result.warping   },
    { label: 'BBSF Today',        count: result.bbsf      },
    { label: 'Completed Today',  count: result.completed },
  ];
}

// ─── Hero Card: Production Pipeline ─────────────────────────────
function HeroCard({
  total,
  loading,
  period,
  onPeriodChange,
  throughputData,
  throughputLoading,
  throughputError,
  onRetryThroughput,
}: {
  total: number;
  loading: boolean;
  period: Period;
  onPeriodChange: (p: Period) => void;
  throughputData: ThroughputData | null;
  throughputLoading: boolean;
  throughputError: string | null;
  onRetryThroughput: () => void;
}) {
  const chartData = throughputData?.data ? buildChartData(throughputData.data, period) : [];
  const keys = throughputData?.data
    ? [...new Set(throughputData.data.map(d => d.stage))].filter(k => CHART_STAGES.includes(k))
    : CHART_STAGES;
  const PERIODS: Period[] = ['day', 'week', 'month'];

  const darkTooltip = {
    backgroundColor: '#1A3050',
    border:          '1px solid rgba(255,255,255,0.12)',
    borderRadius:    8,
    color:           '#EEF3F7',
    fontSize:        12,
    padding:         '8px 12px',
  };

  return (
    <div style={{
      backgroundColor:     '#0D1B3E',
      backgroundImage:     "url('/denim_bg.jpg')",
      backgroundSize:      'cover',
      backgroundBlendMode: 'multiply',
      border:              '1px solid rgba(255,255,255,0.08)',
      borderRadius:        12,
      padding:             '28px 32px',
      display:             'flex',
      flexDirection:       'column',
      justifyContent:      'space-between',
      minHeight:           200,
    }}>
      <p style={{
        fontSize:      10,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color:         'rgba(255,255,255,0.45)',
        margin:        0,
        marginBottom:  8,
      }}>
        Production Pipeline
      </p>

      <div>
        {loading ? (
          <div style={{ height: 76, display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: 120, height: 20,
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 4,
            }} />
          </div>
        ) : (
          <p style={{
            fontSize:      56,
            fontWeight:    800,
            color:         '#FFFFFF',
            fontFamily:    "'IBM Plex Mono', monospace",
            letterSpacing: '-0.02em',
            lineHeight:    1,
            margin:        0,
          }}>
            {total.toLocaleString()}
          </p>
        )}
        <p style={{
          fontSize: 13,
          color:    'rgba(255,255,255,0.45)',
          margin:   '6px 0 0 0',
        }}>
          total orders
        </p>
      </div>

      <div>
        {/* Period toggle */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 12 }}>
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              style={{
                border:      'none',
                borderRadius: 16,
                padding:     '3px 12px',
                fontSize:    12,
                fontWeight:  500,
                cursor:      'pointer',
                transition:  'all 0.15s',
                background:   period === p ? 'rgba(255,255,255,0.15)' : 'transparent',
                color:        period === p ? '#EEF3F7' : 'rgba(238,243,247,0.45)',
              }}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {throughputError ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 120 }}>
            <p style={{ color: 'rgba(252,165,165,0.8)', fontSize: 12 }}>{throughputError}</p>
            <button
              onClick={onRetryThroughput}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 6,
                color: 'rgba(238,243,247,0.70)',
                padding: '4px 12px',
                fontSize: 12,
                cursor: 'pointer',
                marginTop: 8,
              }}
            >Retry</button>
          </div>
        ) : (
          <div style={{ height: 120 }}>
            {throughputLoading || chartData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <p style={{ color: 'rgba(238,243,247,0.35)', fontSize: 12 }}>
                  {throughputLoading ? 'Loading…' : 'No throughput data yet'}
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -24 }}>
                  <XAxis
                    dataKey="label"
                    tick={{ fill: 'rgba(238,243,247,0.40)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'rgba(238,243,247,0.40)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip contentStyle={darkTooltip} />
                  {keys.map(stage => (
                    <Bar
                      key={stage}
                      dataKey={stage}
                      fill={STAGE_COLORS[stage] ?? '#4A7A9B'}
                      radius={[3, 3, 0, 0]}
                      maxBarSize={40}
                      stackId="a"
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── KPI Card: In Progress ───────────────────────────────────────
function KpiCardInProgress({ count, loading }: { count: number; loading: boolean }) {
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border:         '1px solid #E5E7EB',
      borderRadius:   12,
      padding:        '20px 24px',
    }}>
      <p style={{
        fontSize:      11,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        fontWeight:    500,
        color:         '#9CA3AF',
        margin:        0,
        marginBottom:  10,
      }}>
        In Progress
      </p>
      {loading ? (
        <div style={{ width: 100, height: 36, background: '#F3F4F6', borderRadius: 4 }} />
      ) : (
        <p style={{
          fontSize:      44,
          fontWeight:    800,
          color:         '#0F1E2E',
          fontFamily:    "'IBM Plex Mono', monospace",
          lineHeight:    1,
          margin:        0,
        }}>
          {count}
        </p>
      )}
      <p style={{ fontSize: 13, color: '#6B7280', margin: '8px 0 0 0' }}>
        currently in pipeline
      </p>
    </div>
  );
}

// ─── KPI Card: Needs Attention ───────────────────────────────────
function KpiCardAttention({ count, loading }: { count: number; loading: boolean }) {
  return (
    <div style={{
      backgroundColor: '#1A0505',
      border:         '1px solid rgba(220,38,38,0.20)',
      borderRadius:   12,
      padding:        '20px 24px',
    }}>
      <p style={{
        fontSize:      11,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        fontWeight:    500,
        color:         'rgba(220,38,38,0.60)',
        margin:        0,
        marginBottom:  10,
      }}>
        Needs Attention
      </p>
      {loading ? (
        <div style={{ width: 100, height: 36, background: 'rgba(220,38,38,0.10)', borderRadius: 4 }} />
      ) : (
        <p style={{
          fontSize:      44,
          fontWeight:    800,
          color:         '#DC2626',
          fontFamily:    "'IBM Plex Mono', monospace",
          lineHeight:    1,
          margin:        0,
        }}>
          {count}
        </p>
      )}
      <p style={{ fontSize: 13, color: 'rgba(220,38,38,0.50)', margin: '8px 0 0 0' }}>
        blocked or stale
      </p>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────
function StatCardRow({
  label,
  value,
  sublabel,
  loading,
}: {
  label: string;
  value: number | string;
  sublabel: string;
  loading: boolean;
}) {
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border:         '1px solid #E5E7EB',
      borderRadius:   10,
      padding:        '16px 20px',
    }}>
      <p style={{
        fontSize:      10,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        fontWeight:    500,
        color:         '#9CA3AF',
        margin:        0,
        marginBottom:  8,
      }}>
        {label}
      </p>
      {loading ? (
        <div style={{ width: 60, height: 24, background: '#F3F4F6', borderRadius: 4 }} />
      ) : (
        <p style={{
          fontSize:      28,
          fontWeight:    700,
          color:          '#0F1E2E',
          fontFamily:    "'IBM Plex Mono', monospace",
          lineHeight:    1,
          margin:        0,
        }}>
          {value}
        </p>
      )}
      <p style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 0 0' }}>
        {sublabel}
      </p>
    </div>
  );
}

// ─── Card: Weaving Efficiency ────────────────────────────────────
function WeavingEfficiencyCard({ weeklyEfficiency }: { weeklyEfficiency: WeeklyEffWeek[] }) {
  const currentWeek = weeklyEfficiency[weeklyEfficiency.length - 1];
  const currentAvg  = currentWeek?.avg_efficiency;

  const lineData = weeklyEfficiency.map(w => ({
    week: new Date(w.week).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
    eff:  w.avg_efficiency,
  }));

  const lightTooltip = {
    backgroundColor: '#FFFFFF',
    border:          '1px solid #E5E7EB',
    borderRadius:    8,
    color:           '#0F1117',
    fontSize:        12,
    padding:         '8px 12px',
  };

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border:         '1px solid #E5E7EB',
      borderRadius:   12,
      padding:        '20px 24px',
      minHeight:      280,
      display:        'flex',
      flexDirection:  'column',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#0F1E2E', margin: 0 }}>
          Weaving Efficiency
        </p>
        <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0 }}>
          weekly avg
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 16 }}>
        <span style={{
          fontSize:    36,
          fontWeight:  700,
          color:       '#0F1E2E',
          fontFamily:  "'IBM Plex Mono', monospace",
          lineHeight:  1,
        }}>
          {currentAvg != null ? `${currentAvg.toFixed(1)}%` : '—'}
        </span>
        <span style={{ fontSize: 12, color: '#6B7280', paddingBottom: 4 }}>
          current week
        </span>
      </div>

      {lineData.length === 0 ? (
        <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <p style={{ color: '#9CA3AF', fontSize: 12 }}>No weaving data</p>
        </div>
      ) : (
        <div style={{ height: 100, flex: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 4, right: 0, bottom: 0, left: -24 }}>
              <XAxis
                dataKey="week"
                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
              />
              <Tooltip contentStyle={lightTooltip} formatter={(v) => [`${Number(v).toFixed(1)}%`, 'Efficiency']} />
              <Area
                type="monotone"
                dataKey="eff"
                stroke="transparent"
                fill="rgba(74,122,155,0.08)"
              />
              <Line
                type="monotone"
                dataKey="eff"
                stroke="#4A7A9B"
                strokeWidth={2}
                dot={{ r: 3, fill: '#4A7A9B', strokeWidth: 0 }}
                activeDot={{ r: 4, fill: '#4A7A9B', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ─── Card: Stale Orders ──────────────────────────────────────────
function StaleOrdersCard({ staleOrders }: { staleOrders: StaleOrder[] }) {
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border:         '1px solid #E5E7EB',
      borderRadius:   12,
      padding:        '20px 24px',
    }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: '#0F1E2E', margin: '0 0 4px 0' }}>
        Stale Orders
      </p>
      <p style={{ fontSize: 12, color: '#9CA3AF', margin: '0 0 14px 0' }}>
        Active orders with no updates in 7+ days
      </p>

      {staleOrders.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80 }}>
          <p style={{ color: '#9CA3AF', fontSize: 13 }}>No stale orders</p>
        </div>
      ) : (
        <>
          <div style={{
            display:        'grid',
            gridTemplateColumns: '80px 1fr 56px',
            gap:             8,
            paddingBottom:   8,
            borderBottom:   '1px solid #F3F4F6',
            marginBottom:   4,
          }}>
            {['KP', 'Stage', 'Days'].map(h => (
              <span key={h} style={{
                fontSize: 10, fontWeight: 600, color: '#9CA3AF',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                {h}
              </span>
            ))}
          </div>
          {staleOrders.map(order => {
            const days = stageDaysAgo(order.tgl);
            const daysColor = days > 14 ? '#DC2626' : days >= 7 ? '#D97706' : '#9CA3AF';
            return (
              <div
                key={order.kp}
                style={{
                  display:        'grid',
                  gridTemplateColumns: '80px 1fr 56px',
                  gap:             8,
                  paddingTop:      8,
                  paddingBottom:   8,
                  borderBottom:    '1px solid #F9FAFB',
                  alignItems:     'center',
                }}
              >
                <span style={{
                  fontFamily:  "'IBM Plex Mono', monospace",
                  fontSize:    12,
                  fontWeight:  600,
                  color:       '#1D4ED8',
                }}>
                  {order.kp}
                </span>
                <StatusBadge
                  status={order.pipeline_status}
                  style={{ justifySelf: 'start', fontSize: 10, padding: '1px 6px' }}
                />
                <span style={{ fontSize: 12, color: daysColor, textAlign: 'right' }}>
                  {days}d
                </span>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

// ─── Card: Recent Activity ───────────────────────────────────────
function RecentActivityCard({ recentActivity }: { recentActivity: RecentActivity[] }) {
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border:         '1px solid #E5E7EB',
      borderRadius:   12,
      padding:        '20px 24px',
    }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: '#0F1E2E', margin: '0 0 16px 0' }}>
        Recent Activity
      </p>

      {recentActivity.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 80 }}>
          <p style={{ color: '#9CA3AF', fontSize: 12 }}>No recent activity</p>
        </div>
      ) : (
        recentActivity.slice(0, 10).map((item, i) => (
          <div
            key={`${item.kp}-${item.updatedAt}-${i}`}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:           12,
              height:        40,
              borderBottom:  i < 9 ? '1px solid #F9FAFB' : 'none',
            }}
          >
            <span style={{
              width:        8,
              height:       8,
              borderRadius: '50%',
              backgroundColor: STAGE_COLORS[item.pipeline_status] ?? '#9CA3AF',
              flexShrink:   0,
            }} />
            <span style={{
              fontFamily:  "'IBM Plex Mono', monospace",
              fontSize:    13,
              fontWeight:  600,
              color:       '#1D4ED8',
            }}>
              {item.kp}
            </span>
            <span style={{ fontSize: 12, color: '#6B7280' }}>
              {item.pipeline_status.replace(/_/g, ' ').toLowerCase()}
            </span>
            <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 'auto' }}>
              {timeAgo(item.updatedAt)}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [summary,          setSummary]           = useState<AdminSummary | null>(null);
  const [throughputDay,   setThroughputDay]      = useState<ThroughputData | null>(null);
  const [summaryLoading,  setSummaryLoading]     = useState(true);
  const [summaryError,    setSummaryError]       = useState<string | null>(null);
  const [throughputLoading, setThroughputLoading] = useState(true);
  const [throughputError,   setThroughputError]   = useState<string | null>(null);
  const [period,          setPeriod]             = useState<Period>('day');

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const data = await authFetch<AdminSummary>('/denim/admin/summary');
      setSummary(data);
    } catch (e: unknown) {
      setSummaryError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const fetchThroughputDay = useCallback(async () => {
    setThroughputLoading(true);
    setThroughputError(null);
    try {
      const data = await authFetch<ThroughputData>('/denim/admin/throughput?period=day');
      setThroughputDay(data);
    } catch (e: unknown) {
      setThroughputError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setThroughputLoading(false);
    }
  }, []);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);
  useEffect(() => { fetchThroughputDay(); }, [fetchThroughputDay]);

  const todayStats     = throughputDay?.data ? todayCounts(throughputDay.data) : [];
  const contractsToday  = todayStats.find(s => s.label === 'Contracts Today')?.count ?? 0;
  const warpingToday    = todayStats.find(s => s.label === 'Warping Today')?.count ?? 0;
  const bbsfToday        = todayStats.find(s => s.label === 'BBSF Today')?.count ?? 0;
  const completedToday   = todayStats.find(s => s.label === 'Completed Today')?.count ?? 0;

  const stageCounts      = summary?.stageCounts ?? {};
  const recentActivity   = summary?.recentActivity ?? [];
  const staleOrders       = summary?.staleOrders ?? [];
  const weeklyEfficiency  = summary?.weeklyEfficiency ?? [];
  const total             = summary?.total ?? 0;
  const inProgress        = summary?.inProgress ?? 0;
  const blockedCount      = summary?.blockedCount ?? 0;

  return (
    <PageShell
      title="Admin Dashboard"
      subtitle="Factory-wide overview"
      noPadding
    >
      <div
        style={{
          backgroundColor: '#F0F4F8',
          padding:         '24px 28px',
          display:         'flex',
          flexDirection:   'column',
          gap:              16,
          maxWidth:         '100%',
          width:            '100%',
          boxSizing:        'border-box',
        }}
      >
        {/* ── Row 1: Hero + KPI cluster ───────────────────────── */}
        <div
          style={{
            display:           'grid',
            gridTemplateColumns: '2fr 1fr',
            gap:               16,
            minHeight:         200,
          }}
        >
          <HeroCard
            total={total}
            loading={summaryLoading}
            period={period}
            onPeriodChange={setPeriod}
            throughputData={throughputDay}
            throughputLoading={throughputLoading}
            throughputError={throughputError}
            onRetryThroughput={fetchThroughputDay}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <KpiCardInProgress count={inProgress} loading={summaryLoading} />
            <KpiCardAttention count={blockedCount} loading={summaryLoading} />
          </div>
        </div>

        {/* ── Row 2: 4 stat cards ────────────────────────────── */}
        <div
          style={{
            display:           'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap:               12,
          }}
        >
          <StatCardRow
            label="Contracts Today"
            value={throughputLoading ? '' : contractsToday}
            sublabel="new orders"
            loading={throughputLoading}
          />
          <StatCardRow
            label="Warping Today"
            value={throughputLoading ? '' : warpingToday}
            sublabel="units entered"
            loading={throughputLoading}
          />
          <StatCardRow
            label="BBSF Today"
            value={throughputLoading ? '' : bbsfToday}
            sublabel="units processed"
            loading={throughputLoading}
          />
          <StatCardRow
            label="Completed Today"
            value={throughputLoading ? '' : completedToday}
            sublabel="orders finished"
            loading={throughputLoading}
          />
        </div>

        {/* ── Row 3: Weaving Efficiency + Active Pipeline ───── */}
        <div
          style={{
            display:           'grid',
            gridTemplateColumns: '1fr 1fr',
            gap:               16,
            minHeight:         280,
          }}
        >
          <WeavingEfficiencyCard weeklyEfficiency={weeklyEfficiency} />
          <PipelineStagesCard stageCounts={stageCounts} />
        </div>

        {/* ── Row 4: Stale Orders + Recent Activity ──────────── */}
        <div
          style={{
            display:           'grid',
            gridTemplateColumns: '1fr 1fr',
            gap:               16,
          }}
        >
          <StaleOrdersCard staleOrders={staleOrders} />
          <RecentActivityCard recentActivity={recentActivity} />
        </div>
      </div>

      {/* ── Responsive ──────────────────────────────────────── */}
      <style>{`
        @media (max-width: 1023px) {
          .admin-dashboard-grid > div,
          .admin-dashboard-grid .row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </PageShell>
  );
}
