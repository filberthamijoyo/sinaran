'use client';

import React, { useEffect, useState, useRef, Suspense, useDeferredValue } from 'react';
import { PageShell } from '../../ui/erp/PageShell';
import { authFetch } from '../../../lib/authFetch';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import dynamic from 'next/dynamic';

// ─── Module-level chart dynamic imports (ERROR 2 fix) ──────────────────
const BarChart      = dynamic(() => import('recharts').then(m => ({ default: m.BarChart })),      { ssr: false });
const AreaChart     = dynamic(() => import('recharts').then(m => ({ default: m.AreaChart })),     { ssr: false });
const LineChart     = dynamic(() => import('recharts').then(m => ({ default: m.LineChart })),     { ssr: false });
const ScatterChart  = dynamic(() => import('recharts').then(m => ({ default: m.ScatterChart })),  { ssr: false });
const Bar           = dynamic(() => import('recharts').then(m => ({ default: m.Bar })),           { ssr: false });
const Area          = dynamic(() => import('recharts').then(m => ({ default: m.Area })),          { ssr: false });
const Line          = dynamic(() => import('recharts').then(m => ({ default: m.Line })),           { ssr: false });
const Scatter       = dynamic(() => import('recharts').then(m => ({ default: m.Scatter })),        { ssr: false });
const XAxis         = dynamic(() => import('recharts').then(m => ({ default: m.XAxis })),          { ssr: false });
const YAxis         = dynamic(() => import('recharts').then(m => ({ default: m.YAxis })),          { ssr: false });
const CartesianGrid  = dynamic(() => import('recharts').then(m => ({ default: m.CartesianGrid })), { ssr: false });
const Tooltip        = dynamic(() => import('recharts').then(m => ({ default: m.Tooltip })),       { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(m => ({ default: m.ResponsiveContainer })), { ssr: false });
const Legend        = dynamic(() => import('recharts').then(m => ({ default: m.Legend })),         { ssr: false });
const Cell          = dynamic(() => import('recharts').then(m => ({ default: m.Cell })),           { ssr: false });
const ZAxis         = dynamic(() => import('recharts').then(m => ({ default: m.ZAxis })),          { ssr: false });

// ─── Types ──────────────────────────────────────────────────────────
type ThroughputPoint = { bucket: string; stage: string; count: number };
type ThroughputResponse = { period: string; data: ThroughputPoint[] };

type AnalyticsData = {
  weeklyEfficiency: Array<{ week: string; avg_efficiency: number; record_count: number }>;
  weeklyProduction: Array<{ week: string; total_meters: number; total_picks: number; record_count: number }>;
  monthlyChemicals: Array<{ month: string; avg_indigo: number; avg_caustic: number; avg_hydro: number }>;
  cycleTimeDistribution: Array<{ kp: string; days_contract_to_weaving: number | null }>;
  efficiencyByMachine: Array<{ machine: string; avg_efficiency: number; record_count: number }>;
  bbsfSanforStats: Array<{ week: string; sanfor_type: string; avg_shrinkage: number; record_count: number }>;
};

type KpSearchResult = {
  kp: string;
  codename: string;
  kat_kode: string;
  ket_warna: string | null;
  tgl: string;
  pipeline_status: string;
};

type PipelineData = {
  sc: { kp: string; codename: string | null; kat_kode: string | null; tgl: string | null; te: number | null; acc: string | null; pipeline_status: string; permintaan: string | null } | null;
  warping: { no_mc: string; rpm: number; total_beam: number; total_putusan: number; elongasi: number; strength: number; cv_pct: number; beam_count: number; tgl: string | null } | null;
  indigo: { mc: string; speed: number; indigo_conc: number; caustic: number; hydro: number; elongasi: number; total_meters: number; tgl: string | null } | null;
  weaving: Array<{ avg_efficiency: number; total_meters: number; record_count: number; shift_count: number }>;
  inspectGray: Array<{ total_rolls: number; grade_a_count: number; grade_b_count: number; grade_reject_count: number }>;
  bbsfWashing: Array<{ washing_speed: number; susut: number }>;
  bbsfSanfor: Array<{ susut_sanfor: number; sanfor_type: string }>;
  inspectFinish: Array<{ total_rolls: number; grade_a_count: number; total_kg: number }>;
};

// ─── Chart colours ──────────────────────────────────────────────────────
const STAGE_COLORS: Record<string, string> = {
  WARPING:         '#4A7A9B',
  INDIGO:          '#0891B2',
  WEAVING:         '#059669',
  INSPECT_GRAY:    '#D97706',
  BBSF:            '#EA580C',
  INSPECT_FINISH:  '#2B506E',
  COMPLETE:        '#059669',
  REJECTED:        '#DC2626',
};

const CHEM_LINES = {
  Indigo:  '#0891B2',
  Caustic: '#D97706',
  Hydro:   '#7C3AED',
};

// ─── Shared chart utilities ─────────────────────────────────────────────
function ChartSkeleton({ height }: { height: number }) {
  return (
    <div
      style={{
        height,
        borderRadius: 8,
        background: '#F3F4F6',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes __analytics_shimmer__ {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .analytics-shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
          animation: __analytics_shimmer__ 1.5s ease-in-out infinite;
        }
      `}</style>
      <div className="analytics-shimmer" style={{ position: 'absolute', inset: 0 }} />
    </div>
  );
}

const TOOLTIP_DARK_STYLE = {
  background:   'var(--denim-950)',
  border:       '1px solid rgba(255,255,255,0.12)',
  borderRadius:  8,
  padding:      '8px 12px',
  fontSize:     12,
  color:        '#EEF3F7',
  boxShadow:    '0 4px 12px rgba(0,0,0,0.3)',
};

// ─── Tab bar ───────────────────────────────────────────────────────────
function TabBar({ tabs, active, onChange }: {
  tabs: Array<{ key: string; label: string }>;
  active: string;
  onChange: (k: string) => void;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        display:       'inline-flex',
        gap:           2,
        background:    '#FFFFFF',
        border:        '1px solid #E5E7EB',
        borderRadius:  10,
        padding:       '4px',
      }}>
        {tabs.map(t => {
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              style={{
                height:       32,
                padding:     '0 16px',
                borderRadius: 7,
                fontSize:    13,
                fontWeight:  500,
                cursor:     'pointer',
                border:     'none',
                transition: 'background 150ms ease, color 150ms ease',
                background: isActive ? '#1D4ED8' : 'transparent',
                color:      isActive ? '#FFFFFF' : '#6B7280',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = '#F3F4F6';
                  (e.currentTarget as HTMLElement).style.color    = '#374151';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color    = '#6B7280';
                }
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Chart components (ERROR 1 fix: all sync, no async/await) ──────────

// SECTION 1 — Stage Throughput
function StageThroughputChart({ period }: { period: 'week' | 'month' }) {
  const [data, setData] = useState<ThroughputPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch<ThroughputResponse>(`/denim/admin/throughput?period=${period}`)
      .then(d => setData(d?.data ?? []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) return <ChartSkeleton height={240} />;
  if (data.length === 0) {
    return (
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: 13, color: '#9CA3AF' }}>No throughput data yet.</p>
      </div>
    );
  }

  const stages = Object.keys(STAGE_COLORS).filter(k => data[0] && k in (data[0] as Record<string, unknown>));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
        <Tooltip contentStyle={TOOLTIP_DARK_STYLE} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: 'var(--text-muted)', paddingTop: 8 }} />
        {stages.map(stage => (
          <Bar key={stage} dataKey={stage} fill={STAGE_COLORS[stage]} radius={[3, 3, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// SECTION 2 LEFT — Weekly Efficiency Area
function WeeklyEfficiencyChart() {
  const [data, setData] = useState<Array<{ week: string; label: string; avg_efficiency: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch<AnalyticsData>('/denim/analytics/full')
      .then(d => {
        const weekly = (d?.weeklyEfficiency ?? []).map(w => ({
          ...w,
          label: format(parseISO(w.week), 'MMM d'),
        }));
        setData(weekly.slice(-8));
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ChartSkeleton height={240} />;
  const current = data.length > 0 ? data[data.length - 1].avg_efficiency.toFixed(1) : null;

  return (
    <div>
      {current ? (
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>{current}%</span>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>avg this week</p>
        </div>
      ) : (
        <div style={{ height: 52 }} />
      )}
      <ResponsiveContainer width="100%" height={170}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="analyticsEffGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#4A7A9B" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#4A7A9B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
          <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
          <Tooltip contentStyle={TOOLTIP_DARK_STYLE} formatter={(v: unknown) => [`${Number(v).toFixed(1)}%`, 'Efficiency']} />
          <Area
            type="monotone" dataKey="avg_efficiency" stroke="#4A7A9B" strokeWidth={2}
            fill="url(#analyticsEffGrad)" dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// SECTION 2 RIGHT — Efficiency by Machine
function EfficiencyByMachineChart() {
  const [data, setData] = useState<Array<{ machine: string; avg_efficiency: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch<AnalyticsData>('/denim/analytics/full')
      .then(d => setData((d?.efficiencyByMachine ?? []).slice(0, 30)))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ChartSkeleton height={240} />;

  const getBarColor = (eff: number) =>
    eff >= 80 ? '#059669' : eff >= 70 ? '#D97706' : '#DC2626';

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={v => `${v}%`} />
        <YAxis dataKey="machine" type="category" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} width={50} />
        <Tooltip contentStyle={TOOLTIP_DARK_STYLE} formatter={(v: unknown) => [`${Number(v).toFixed(1)}%`, 'Efficiency']} />
        <Bar dataKey="avg_efficiency" fill="#1D4ED8" radius={[0, 3, 3, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={getBarColor(entry.avg_efficiency)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// SECTION 3 — Production Volume
function ProductionVolumeChart() {
  const [data, setData] = useState<Array<{ week: string; label: string; total_meters: number; total_picks: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch<AnalyticsData>('/denim/analytics/full')
      .then(d => {
        const weekly = (d?.weeklyProduction ?? []).map(w => ({
          ...w,
          label: format(parseISO(w.week), 'MMM d'),
        }));
        setData(weekly.slice(-12));
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ChartSkeleton height={240} />;
  if (data.length === 0) {
    return (
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: 13, color: '#9CA3AF' }}>No production data yet.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip contentStyle={TOOLTIP_DARK_STYLE} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: 'var(--text-muted)', paddingTop: 8 }} />
        <Bar dataKey="total_meters" name="Meters" fill="#4A7A9B" radius={[3, 3, 0, 0]} />
        <Bar dataKey="total_picks" name="Picks"   fill="#6A96B2" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// SECTION 4 — Chemical Usage
function ChemicalUsageChart() {
  const [data, setData] = useState<Array<{ month: string; label: string; avg_indigo: number; avg_caustic: number; avg_hydro: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch<AnalyticsData>('/denim/analytics/full')
      .then(d => {
        const monthly = (d?.monthlyChemicals ?? []).map(m => ({
          ...m,
          label: format(parseISO(m.month), 'MMM yyyy'),
        }));
        setData(monthly.slice(-12));
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ChartSkeleton height={240} />;
  if (data.length === 0) {
    return (
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: 13, color: '#9CA3AF' }}>No chemical data yet.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
        <Tooltip contentStyle={TOOLTIP_DARK_STYLE} formatter={(v: unknown) => [`${Number(v).toFixed(2)} g/L`, '']} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: 'var(--text-muted)', paddingTop: 8 }} />
        <Line type="monotone" dataKey="avg_indigo"  name="Indigo"  stroke={CHEM_LINES.Indigo}  strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="avg_caustic" name="Caustic" stroke={CHEM_LINES.Caustic} strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="avg_hydro"   name="Hydro"   stroke={CHEM_LINES.Hydro}   strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// SECTION 5 — BBSF Shrinkage
function BBSFShrinkageChart() {
  const [data, setData] = useState<Array<{ week: string; label: string; sanfor_type: string; avg_shrinkage: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch<AnalyticsData>('/denim/analytics/full')
      .then(d => {
        const stats = (d?.bbsfSanforStats ?? []).map(s => ({
          ...s,
          label: format(parseISO(s.week), 'MMM d'),
        }));
        setData(stats.slice(-12));
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ChartSkeleton height={240} />;
  if (data.length === 0) {
    return (
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: 13, color: '#9CA3AF' }}>No BBSF data yet.</p>
      </div>
    );
  }

  const types = [...new Set(data.map(d => d.sanfor_type))];
  const BBSF_COLORS: Record<string, string> = {
    'Zero Wash': '#059669',
    'Soft Finish': '#0891B2',
    'Normal': '#D97706',
  };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `${v}%`} />
        <Tooltip contentStyle={TOOLTIP_DARK_STYLE} formatter={(v: unknown) => [`${Number(v).toFixed(2)}%`, 'Shrinkage']} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: 'var(--text-muted)', paddingTop: 8 }} />
        {types.map(type => (
          <Line
            key={type}
            type="monotone"
            dataKey={`avg_shrinkage_${type}` as string}
            name={type}
            stroke={BBSF_COLORS[type] ?? '#4A7A9B'}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// SECTION 6 — Cycle Time Distribution
function CycleTimeChart() {
  const [data, setData] = useState<Array<{ kp: string; days: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch<AnalyticsData>('/denim/analytics/full')
      .then(d => {
        const cycles = (d?.cycleTimeDistribution ?? [])
          .filter(c => c.days_contract_to_weaving != null)
          .map(c => ({ kp: c.kp, days: c.days_contract_to_weaving as number }));
        setData(cycles);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ChartSkeleton height={200} />;
  if (data.length === 0) {
    return (
      <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontSize: 13, color: '#9CA3AF' }}>No completed cycle data yet.</p>
      </div>
    );
  }

  const scatterData = data.map((d, i) => ({ x: d.days, y: (i % 10) + 1, kp: d.kp }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <ScatterChart margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="x" name="Days" tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
          tickFormatter={v => `${v}d`
          }
          label={{ value: 'Days to weaving', position: 'insideBottom', offset: -2, fontSize: 10, fill: 'var(--text-muted)' }}
        />
        <YAxis dataKey="y" hide />
        <Tooltip
          contentStyle={TOOLTIP_DARK_STYLE}
          formatter={(v: unknown, name: unknown) => {
            if (name === 'x') {
              const item = data.find(s => s.days === v);
              return [`${v} days`, item?.kp ?? ''] as [string, string];
            }
            return [String(v), String(name)] as [string, string];
          }}
        />
        <Scatter dataKey="x" fill="#4A7A9B" />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

// ─── Overview Tab ───────────────────────────────────────────────────────
function OverviewTab() {
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  const periodToggle = (
    <div style={{ display: 'flex', gap: 4 }}>
      {(['week', 'month'] as const).map(p => (
        <button
          key={p}
          onClick={() => setPeriod(p)}
          style={{
            height:       28,
            padding:     '0 12px',
            borderRadius: 14,
            fontSize:    12,
            fontWeight:  500,
            cursor:     'pointer',
            border:     'none',
            background:  period === p ? 'rgba(255,255,255,0.15)' : 'transparent',
            color:       period === p ? '#EEF3F7' : 'rgba(238,243,247,0.45)',
            transition:  'background 150ms',
          }}
        >
          {p.charAt(0).toUpperCase() + p.slice(1)}
        </button>
      ))}
    </div>
  );

  const GRID_2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* SECTION 1 — Stage Throughput */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border:         '1px solid #E5E7EB',
        borderRadius:  12,
        padding:       '20px 24px',
      }}>
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#0F1E2E' }}>Stage Throughput</p>
            <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>How many orders completed each stage per period</p>
          </div>
          {periodToggle}
        </div>
        <div style={{ minHeight: 240, width: '100%' }}>
          <StageThroughputChart period={period} />
        </div>
      </div>

      {/* SECTION 2 — Weaving Efficiency */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border:         '1px solid #E5E7EB',
        borderRadius:  12,
        padding:       '20px 24px',
      }}>
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#0F1E2E' }}>Weaving Efficiency</p>
          <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Weekly average efficiency across all machines</p>
        </div>
        <div style={GRID_2}>
          <WeeklyEfficiencyChart />
          <EfficiencyByMachineChart />
        </div>
      </div>

      {/* SECTION 3 — Production Volume */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border:         '1px solid #E5E7EB',
        borderRadius:  12,
        padding:       '20px 24px',
      }}>
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#0F1E2E' }}>Production Volume</p>
          <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Weekly meters and picks produced</p>
        </div>
        <div style={{ minHeight: 240, width: '100%' }}>
          <ProductionVolumeChart />
        </div>
      </div>

      {/* SECTION 4 — Chemical Usage */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border:         '1px solid #E5E7EB',
        borderRadius:  12,
        padding:       '20px 24px',
      }}>
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#0F1E2E' }}>Chemical Usage</p>
          <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Monthly chemical concentrations (g/L)</p>
        </div>
        <div style={{ minHeight: 240, width: '100%' }}>
          <ChemicalUsageChart />
        </div>
      </div>

      {/* SECTION 5 — BBSF Shrinkage */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border:         '1px solid #E5E7EB',
        borderRadius:  12,
        padding:       '20px 24px',
      }}>
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#0F1E2E' }}>BBSF Shrinkage</p>
          <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Weekly average shrinkage percentage by sanfor type</p>
        </div>
        <div style={{ minHeight: 240, width: '100%' }}>
          <BBSFShrinkageChart />
        </div>
      </div>

      {/* SECTION 6 — Cycle Time */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border:         '1px solid #E5E7EB',
        borderRadius:  12,
        padding:       '20px 24px',
      }}>
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#0F1E2E' }}>Cycle Time Distribution</p>
          <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>Days from contract to weaving completion per order</p>
        </div>
        <div style={{ minHeight: 240, width: '100%' }}>
          <CycleTimeChart />
        </div>
      </div>

    </div>
  );
}

// ─── KP Comparison Tab ──────────────────────────────────────────────────

function KPComparisonTab() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [results, setResults] = useState<KpSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [pinnedKps, setPinnedKps] = useState<Array<{ kp: string; data: PipelineData }>>([]);
  const [loadingKp, setLoadingKp] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (!deferredQuery.trim()) { setResults([]); setShowDropdown(false); return; }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await authFetch<{ results: KpSearchResult[] }>(
          `/denim/admin/kp-search?q=${encodeURIComponent(deferredQuery)}&limit=50`
        );
        const unique = (res?.results ?? []).filter(
          (item, i, self) => self.findIndex(t => t.kp === item.kp) === i
        );
        setResults(unique);
        setShowDropdown(true);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [deferredQuery]);

  const pinKp = async (kp: string) => {
    if (pinnedKps.length >= 5) return;
    if (pinnedKps.find(p => p.kp === kp)) return;
    setLoadingKp(kp);
    try {
      const data = await authFetch<PipelineData>(`/denim/admin/pipeline/${kp}`);
      setPinnedKps(prev => [...prev, { kp, data }]);
      setShowDropdown(false);
      setQuery('');
      inputRef.current?.focus();
    } catch { /* no-op */ }
    finally { setLoadingKp(null); }
  };

  const unpinKp = (kp: string) =>
    setPinnedKps(prev => prev.filter(p => p.kp !== kp));

  // ── Comparison table rows ──────────────────────────────────────
  type TableRow = {
    section: string;
    label: string;
    values: (string | number | null)[];
    field?: string;
  };

  function buildRows(pinned: typeof pinnedKps): TableRow[] {
    return [
      // Sales Contract
      { section: 'Sales Contract', label: 'Date',           values: pinned.map(p => p.data.sc?.tgl ? format(parseISO(p.data.sc.tgl), 'd MMM yyyy') : null) },
      { section: 'Sales Contract', label: 'Construction',    values: pinned.map(p => p.data.sc?.codename ?? null) },
      { section: 'Sales Contract', label: 'Type',           values: pinned.map(p => p.data.sc?.kat_kode ?? null) },
      { section: 'Sales Contract', label: 'TE',             values: pinned.map(p => p.data.sc?.te ?? null), field: 'te' },
      { section: 'Sales Contract', label: 'ACC',              values: pinned.map(p => p.data.sc?.acc ?? null) },
      { section: 'Sales Contract', label: 'Stage',             values: pinned.map(p => p.data.sc?.pipeline_status ?? null) },
      // Warping
      { section: 'Warping', label: 'Machine',        values: pinned.map(p => p.data.warping?.no_mc ?? null) },
      { section: 'Warping', label: 'Elongasi',       values: pinned.map(p => p.data.warping?.elongasi ?? null), field: 'elongasi' },
      { section: 'Warping', label: 'Strength',       values: pinned.map(p => p.data.warping?.strength ?? null), field: 'strength' },
      { section: 'Warping', label: 'CV%',            values: pinned.map(p => p.data.warping?.cv_pct ?? null), field: 'cv_pct' },
      { section: 'Warping', label: 'Total Putusan',  values: pinned.map(p => p.data.warping?.total_putusan ?? null), field: 'putusan_total' },
      { section: 'Warping', label: 'Beam Count',      values: pinned.map(p => p.data.warping?.beam_count ?? null), field: 'beam_count' },
      // Indigo
      { section: 'Indigo', label: 'Machine',          values: pinned.map(p => p.data.indigo?.mc ?? null) },
      { section: 'Indigo', label: 'Speed',            values: pinned.map(p => p.data.indigo?.speed ?? null), field: 'speed' },
      { section: 'Indigo', label: 'Indigo g/L',       values: pinned.map(p => p.data.indigo?.indigo_conc ?? null), field: 'indigo_conc' },
      { section: 'Indigo', label: 'Elongasi IDG',    values: pinned.map(p => p.data.indigo?.elongasi ?? null), field: 'elongasi' },
      { section: 'Indigo', label: 'Total Meters',    values: pinned.map(p => p.data.indigo?.total_meters ?? null), field: 'total_meters' },
      // Weaving
      { section: 'Weaving', label: 'Avg Efficiency',  values: pinned.map(p => p.data.weaving?.[0]?.avg_efficiency ?? null), field: 'avg_efficiency' },
      { section: 'Weaving', label: 'Total Meters',    values: pinned.map(p => p.data.weaving?.[0]?.total_meters ?? null), field: 'total_meters' },
      { section: 'Weaving', label: 'Shifts',          values: pinned.map(p => p.data.weaving?.[0]?.shift_count ?? p.data.weaving?.[0]?.record_count ?? null) },
      // Inspect Gray
      { section: 'Inspect Gray', label: 'Total Rolls',      values: pinned.map(p => p.data.inspectGray?.[0]?.total_rolls ?? null), field: 'total_rolls' },
      { section: 'Inspect Gray', label: 'Grade A Count',   values: pinned.map(p => p.data.inspectGray?.[0]?.grade_a_count ?? null), field: 'grade_a_count' },
      { section: 'Inspect Gray', label: 'Grade B Count',    values: pinned.map(p => p.data.inspectGray?.[0]?.grade_b_count ?? null), field: 'grade_b_count' },
      { section: 'Inspect Gray', label: 'Reject Count',     values: pinned.map(p => p.data.inspectGray?.[0]?.grade_reject_count ?? null), field: 'grade_reject_count' },
      // BBSF
      { section: 'BBSF', label: 'Washing Speed',   values: pinned.map(p => p.data.bbsfWashing?.[0]?.washing_speed ?? null), field: 'washing_speed' },
      { section: 'BBSF', label: 'Susut Sanfor',    values: pinned.map(p => p.data.bbsfSanfor?.[0]?.susut_sanfor ?? null), field: 'susut_sanfor' },
      // Inspect Finish
      { section: 'Inspect Finish', label: 'Total Rolls',  values: pinned.map(p => p.data.inspectFinish?.[0]?.total_rolls ?? null), field: 'total_rolls' },
      { section: 'Inspect Finish', label: 'Grade A Count',values: pinned.map(p => p.data.inspectFinish?.[0]?.grade_a_count ?? null), field: 'grade_a_count' },
      { section: 'Inspect Finish', label: 'Total KG',    values: pinned.map(p => p.data.inspectFinish?.[0]?.total_kg ?? null), field: 'total_kg' },
    ];
  }

  const HIGHER_BETTER = new Set(['avg_efficiency','elongasi','strength','total_meters','grade_a_pct','total_rolls','grade_a_count','total_kg','total_beam','beam_count','speed','indigo_conc','washing_speed']);
  const LOWER_BETTER  = new Set(['putusan_total','grade_reject_pct','susut_lusi','susut_pakan','susut_sanfor','cv_pct','grade_b_count','grade_reject_count']);

  const cellStyle = (rowValues: number[], field: string, val: number | null): React.CSSProperties => {
    if (val == null) return { fontSize: 13, color: '#D1D5DB', fontStyle: 'italic' };
    const numeric = rowValues.filter(v => v != null);
    if (numeric.length < 2) return { fontSize: 13, color: '#0F1E2E' };
    const min = Math.min(...numeric), max = Math.max(...numeric);
    if (val === max) return { fontSize: 13, fontWeight: 600, color: '#059669', background: '#ECFDF5', borderRadius: 4, padding: '2px 6px' };
    if (val === min) return { fontSize: 13, fontWeight: 600, color: '#DC2626', background: '#FEF2F2', borderRadius: 4, padding: '2px 6px' };
    return { fontSize: 13, color: '#0F1E2E' };
  };

  const rows = buildRows(pinnedKps);

  return (
    <div>
      {/* Search input */}
      <div style={{ position: 'relative' }}>
        <span style={{
          position:   'absolute',
          left:       14,
          top:        '50%',
          transform:  'translateY(-50%)',
          color:     'var(--text-muted)',
          fontSize:   14,
          pointerEvents: 'none',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10 10L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </span>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search by KP code, construction, or type..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
          onBlur={() => { setTimeout(() => setShowDropdown(false), 150); }}
          style={{
            width:        '100%',
            height:       38,
            borderRadius: 8,
            border:      '1px solid #E5E7EB',
            background:  '#FFFFFF',
            padding:     '0 14px 0 40px',
            fontSize:    14,
            color:      '#0F1E2E',
            outline:    'none',
            boxSizing:  'border-box',
          }}
        />

        {/* Dropdown */}
        {showDropdown && (
          <div style={{
            position:     'absolute',
            top:         'calc(100% + 4px)',
            left:        0,
            right:       0,
            background:  'var(--content-bg)',
            border:      '1px solid var(--border)',
            borderRadius: 8,
            boxShadow:   '0 4px 16px rgba(0,0,0,0.08)',
            maxHeight:   240,
            overflowY:   'auto',
            zIndex:      30,
          }}>
            {loading ? (
              <div style={{ padding: '12px 14px' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ height: 14, borderRadius: 4, background: 'var(--denim-100)', marginBottom: 8, animation: `__hist_shimmer__ 1.5s ease-in-out ${i * 100}ms infinite` }} />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div style={{ padding: '16px 14px', textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No results found.</p>
              </div>
            ) : (
              results.map(r => (
                <div
                  key={r.kp}
                  onMouseDown={() => pinKp(r.kp)}
                  style={{
                    padding:     '10px 14px',
                    cursor:     'pointer',
                    borderBottom: '1px solid var(--denim-100)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--denim-50)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>{r.kp}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.kat_kode || '—'}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {r.codename || '—'} · {r.pipeline_status}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Pinned chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {pinnedKps.length === 0 && (
          <div style={{
            display:       'inline-flex',
            alignItems:   'center',
            padding:       '4px 12px',
            borderRadius:  20,
            border:       '1px dashed #E5E7EB',
            fontSize:     12,
            color:        '#9CA3AF',
          }}>
            Add up to 5 KPs to compare
          </div>
        )}
        {pinnedKps.map(p => (
          <div
            key={p.kp}
            style={{
              display:       'inline-flex',
              alignItems:   'center',
              gap:          6,
              background:   '#FFFFFF',
              border:       '1px solid #E5E7EB',
              borderRadius:  20,
              padding:       '4px 10px 4px 12px',
              fontSize:     12,
            }}
          >
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: '#1D4ED8', fontSize: 13 }}>{p.kp}</span>
            <button
              onClick={() => unpinKp(p.kp)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 0, fontSize: 14, color: '#9CA3AF', lineHeight: 1,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#DC2626'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#9CA3AF'; }}
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      {/* Comparison table or empty state */}
      {pinnedKps.length === 0 ? (
        <div style={{
          padding:       '64px 20px',
          textAlign:    'center',
          background:   '#FFFFFF',
          border:       '1px solid #E5E7EB',
          borderRadius: 12,
        }}>
          <p style={{ fontSize: 14, color: '#9CA3AF' }}>Search for KP codes above to start comparing.</p>
        </div>
      ) : (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <th style={{
                  width: 160, padding: '0 12px', height: 36,
                  fontSize: 11, fontWeight: 500, color: '#9CA3AF',
                  textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left',
                  position: 'sticky', left: 0, background: '#F9FAFB', zIndex: 2,
                }}>
                  Field
                </th>
                {pinnedKps.map(p => (
                  <th key={p.kp} style={{
                    padding: '0 12px', height: 36, minWidth: 160,
                    fontSize: 13, fontWeight: 600, color: '#1D4ED8',
                    fontFamily: "'IBM Plex Mono', monospace", textAlign: 'left',
                  }}>
                    {p.kp}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => {
                const isSection = row.section !== rows[ri - 1]?.section;
                return (
                  <React.Fragment key={`${row.section}-${row.label}-${ri}`}>
                    {isSection && (
                      <tr>
                        <td colSpan={pinnedKps.length + 1} style={{
                          background:    '#F9FAFB',
                          padding:       '8px 12px',
                          fontSize:      11,
                          fontWeight:    600,
                          color:         '#9CA3AF',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          borderTop:     '1px solid #E5E7EB',
                        }}>
                          {row.section}
                        </td>
                      </tr>
                    )}
                    <tr style={{ borderBottom: '0.5px solid #F3F4F6' }}>
                      <td style={{
                        padding: '0 12px', height: 36,
                        fontSize: 12, fontWeight: 500, color: '#6B7280',
                        position: 'sticky', left: 0, background: '#F9FAFB', zIndex: 1,
                      }}>
                        {row.label}
                      </td>
                      {row.values.map((val, ci) => {
                        const numVals = row.values.filter(v => typeof v === 'number') as number[];
                        const style = row.field ? cellStyle(numVals, row.field, val as number | null) : { fontSize: 13, color: '#0F1E2E' };
                        return (
                          <td key={ci} style={{ padding: '0 12px', height: 36, ...style }}>
                            {val == null ? (
                              <span style={{ fontSize: 13, color: '#D1D5DB', fontStyle: 'italic' }}>Not started</span>
                            ) : typeof val === 'number' ? (
                              Number(val).toFixed(2)
                            ) : (
                              String(val)
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────
function AnalyticsContent() {
  const [activeTab, setActiveTab] = useState<'overview' | 'comparison'>('overview');

  return (
    <div style={{ backgroundColor: '#F0F4F8', minHeight: '100vh' }}>
      <PageShell
        title="Analytics"
        subtitle="Production insights and performance analysis"
        noPadding
      >
        <div style={{ padding: '28px 32px' }}>
          <TabBar
            tabs={[
              { key: 'overview',   label: 'Overview' },
              { key: 'comparison', label: 'KP Comparison' },
            ]}
            active={activeTab}
            onChange={k => setActiveTab(k as 'overview' | 'comparison')}
          />
          {activeTab === 'overview'   && <OverviewTab />}
          {activeTab === 'comparison' && <KPComparisonTab />}
        </div>
      </PageShell>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div style={{ background: 'var(--page-bg)', minHeight: '100vh' }} />}>
      <AnalyticsContent />
    </Suspense>
  );
}
