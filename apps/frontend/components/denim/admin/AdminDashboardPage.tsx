'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '../../../lib/authFetch';
import PageHeader from '../../layout/PageHeader';
import { Skeleton } from '../../ui/skeleton';
import {
  Package2, Clock, CheckCircle2, AlertTriangle,
  ChevronRight, TrendingUp, Users, Factory, Building2,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, AreaChart, Area,
} from 'recharts';

interface SummaryData {
  total: number;
  inProgress: number;
  recentlyCompleted: number;
  blockedCount: number;
  stageCounts: Record<string, number>;
  typeCounts: Record<string, number>;
  recentByStage: Record<string, any[]>;
  weeklyEfficiency: Array<{ week: string; avg_efficiency: number; record_count: number }>;
  machineEfficiencyToday: Array<{ machine: string; avg_efficiency: number; record_count: number }>;
  lowEfficiencyMachines: Array<{ machine: string; avg_efficiency: number }>;
  warpingQueue: number;
  topCustomers: Array<{ customer: string; count: number }>;
  avgCycleTime: {
    contract_to_warping: number | null;
    warping_to_indigo: number | null;
    indigo_to_weaving: number | null;
  };
}

type Tab = 'admin' | 'factory' | 'jakarta';

const STAGE_ORDER = [
  { key: 'PENDING_APPROVAL', label: 'Awaiting Approval', short: 'Pending',  color: '#D97706' },
  { key: 'WARPING',          label: 'In Warping',        short: 'Warping',  color: '#6C63FF' },
  { key: 'INDIGO',           label: 'In Indigo',         short: 'Indigo',   color: '#0891B2' },
  { key: 'WEAVING',          label: 'In Weaving',        short: 'Weaving',  color: '#059669' },
  { key: 'INSPECT_GRAY',     label: 'Inspect Gray',      short: 'Inspect',  color: '#D97706' },
  { key: 'BBSF',             label: 'In BBSF',           short: 'BBSF',     color: '#7C3AED' },
  { key: 'INSPECT_FINISH',   label: 'Inspect Finish',    short: 'Finish',   color: '#EA580C' },
  { key: 'COMPLETE',         label: 'Complete',          short: 'Done',     color: '#16A34A' },
];

const NM_TOOLTIP_STYLE = {
  backgroundColor: '#E0E5EC',
  border: 'none',
  borderRadius: '16px',
  boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
  color: '#3D4852',
  fontSize: '12px',
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('admin');
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const activeTabRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    activeTabRef.current = tabRefs.current[activeTab] ?? null;
  }, [activeTab]);

  useEffect(() => {
    authFetch('/denim/admin/summary')
      .then(r => setData(r as SummaryData))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getStageCount = (key: string) => data?.stageCounts?.[key] ?? 0;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'admin',   label: 'Admin / Owner', icon: Package2  },
    { id: 'factory', label: 'Factory',       icon: Factory   },
    { id: 'jakarta', label: 'Jakarta HQ',    icon: Building2 },
  ];

  const total = data?.total ?? 0;
  const chartData = data?.weeklyEfficiency.map(w => ({
    ...w,
    weekLabel: format(new Date(w.week), 'MMM d'),
  })) ?? [];

  const funnelData = STAGE_ORDER.map(s => ({
    name: s.short,
    status: s.key,
    count: getStageCount(s.key),
    color: s.color,
  })).filter(d => d.count > 0);

  const machineStatus = data?.machineEfficiencyToday.map(m => ({
    ...m,
    status: m.avg_efficiency >= 80 ? 'good' : m.avg_efficiency >= 70 ? 'average' : 'low',
  })).sort((a, b) => a.avg_efficiency - b.avg_efficiency) ?? [];

  const avgEfficiencyToday = machineStatus.length > 0
    ? (machineStatus.reduce((s, m) => s + m.avg_efficiency, 0) / machineStatus.length).toFixed(1)
    : '';

  const activeLooms   = machineStatus.length;
  const lowEffCount   = data?.lowEfficiencyMachines.length ?? 0;
  const completedThisMonth = data?.stageCounts['COMPLETE'] ?? 0;
  const rejectedCount = data?.stageCounts['REJECTED'] ?? 0;

  // Shared chart axis styles
  const axisStyle = { fontSize: 11, fill: '#9CA3AF', fontFamily: 'DM Sans, sans-serif' };
  const gridStyle = { stroke: 'rgb(163 177 198 / 0.3)', strokeDasharray: '3 3' };

  return (
    <div style={{ background: '#E0E5EC', minHeight: '100%' }}>
      <PageHeader
        title="Dashboard"
        subtitle={loading ? 'Loading…' : `${total.toLocaleString()} total orders`}
      />

      {/* Tab Navigation */}
      <div className="px-4 sm:px-8 pt-5 pb-0">
        <div
          className="inline-flex gap-1 p-1.5 rounded-2xl"
          style={{ boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)', background: '#E0E5EC' }}
        >
          {tabs.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={el => { tabRefs.current[tab.id] = el; }}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300"
                style={active ? {
                  background: '#E0E5EC',
                  color: '#6C63FF',
                  boxShadow: '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)',
                  fontWeight: 600,
                } : { color: '#9CA3AF' }}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 sm:px-8 py-6">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-[24px] h-28 animate-shimmer"
                style={{ background: '#E0E5EC', boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)' }} />
            ))}
          </div>
        ) : (
          <>
            {/* ==================== TAB 1: ADMIN / OWNER ==================== */}
            {activeTab === 'admin' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <NmKpiCard label="Total Orders"     value={total.toLocaleString()}                        sub="all time"         icon={Package2}      accent="#6C63FF" />
                  <NmKpiCard label="In Progress"      value={(data?.inProgress ?? 0).toLocaleString()}      sub="active in pipeline" icon={Clock}        accent="#D97706" />
                  <NmKpiCard label="Completed"        value={(data?.recentlyCompleted ?? 0).toLocaleString()} sub="last 30 days"   icon={CheckCircle2}  accent="#16A34A" />
                  <NmKpiCard label="Needs Attention"  value={(data?.blockedCount ?? 0).toLocaleString()}    sub="pending > 3 days" icon={AlertTriangle}  accent="#DC2626" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <NmChartCard title="Weekly Efficiency (8 Weeks)">
                    <ResponsiveContainer width="100%" height={240}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="effGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#6C63FF" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#6C63FF" stopOpacity={0}   />
                          </linearGradient>
                        </defs>
                        <CartesianGrid {...gridStyle} />
                        <XAxis dataKey="weekLabel" tick={axisStyle} axisLine={false} tickLine={false} />
                        <YAxis domain={[60, 100]} tick={axisStyle} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={NM_TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, 'Efficiency']} />
                        <Area type="monotone" dataKey="avg_efficiency" stroke="#6C63FF" strokeWidth={2.5} fill="url(#effGrad)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </NmChartCard>

                  <NmChartCard title="Pipeline Status">
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={funnelData} layout="vertical">
                        <CartesianGrid {...gridStyle} />
                        <XAxis type="number" tick={axisStyle} axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" tick={axisStyle} axisLine={false} tickLine={false} width={60} />
                        <Tooltip contentStyle={NM_TOOLTIP_STYLE} />
                        <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                          {funnelData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </NmChartCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <NmChartCard title="Top 5 Customers" icon={<Users className="w-4 h-4" />}>
                    {(!data?.topCustomers || data.topCustomers.length === 0) ? (
                      <p className="text-sm py-4" style={{ color: '#9CA3AF' }}>No customer data</p>
                    ) : (
                      <div className="space-y-1 mt-2">
                        {data.topCustomers.slice(0, 5).map((c, i) => (
                          <div key={i} className="flex items-center justify-between py-2.5"
                            style={{ borderBottom: i < 4 ? '1px solid rgb(163 177 198 / 0.3)' : 'none' }}>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono w-3" style={{ color: '#9CA3AF' }}>{i + 1}</span>
                              <span className="text-sm truncate max-w-[160px]" style={{ color: '#3D4852' }}>{c.customer}</span>
                            </div>
                            <span className="text-xs font-bold font-mono" style={{ color: '#D97706' }}>{c.count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </NmChartCard>

                  <NmChartCard title="Average Cycle Time">
                    {(() => {
                      const stages = [
                        { name: 'Contract → Warping', days: data?.avgCycleTime.contract_to_warping ?? null, color: '#6B7280' },
                        { name: 'Warping → Indigo',   days: data?.avgCycleTime.warping_to_indigo   ?? null, color: '#6C63FF' },
                        { name: 'Indigo → Weaving',   days: data?.avgCycleTime.indigo_to_weaving   ?? null, color: '#0891B2' },
                      ].filter(s => s.days !== null);
                      const maxDays  = Math.max(...stages.map(s => s.days ?? 0), 1);
                      const totalDays = stages.reduce((sum, s) => sum + (s.days ?? 0), 0);
                      if (stages.length === 0 || totalDays === 0) return <p className="text-sm" style={{ color: '#9CA3AF' }}>No cycle time data</p>;
                      return (
                        <div className="space-y-3 mt-2">
                          {stages.map(stage => (
                            <div key={stage.name} className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: stage.color }} />
                              <span className="text-xs w-32 truncate" style={{ color: '#6B7280' }}>{stage.name}</span>
                              <div className="flex-1 h-6 rounded-xl overflow-hidden relative"
                                style={{ boxShadow: 'inset 3px 3px 6px rgb(163 177 198 / 0.6), inset -3px -3px 6px rgba(255,255,255,0.5)', background: '#E0E5EC' }}>
                                <div className="h-full rounded-xl transition-all duration-500"
                                  style={{ width: `${((stage.days ?? 0) / maxDays) * 100}%`, background: stage.color, opacity: 0.7 }} />
                                <span className="absolute inset-0 flex items-center pl-2 text-[10px] font-semibold" style={{ color: '#3D4852' }}>
                                  {stage.days?.toFixed(1)} days
                                </span>
                              </div>
                              <span className="text-[10px] w-10 text-right" style={{ color: '#9CA3AF' }}>
                                {Math.round(((stage.days ?? 0) / totalDays) * 100)}%
                              </span>
                            </div>
                          ))}
                          <div className="flex items-center justify-between pt-3 mt-1"
                            style={{ borderTop: '1px solid rgb(163 177 198 / 0.4)' }}>
                            <span className="text-xs" style={{ color: '#6B7280' }}>Total Cycle Time</span>
                            <span className="text-sm font-bold" style={{ color: '#D97706' }}>{totalDays.toFixed(1)} days</span>
                          </div>
                        </div>
                      );
                    })()}
                  </NmChartCard>
                </div>
              </div>
            )}

            {/* ==================== TAB 2: FACTORY ==================== */}
            {activeTab === 'factory' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <NmKpiCard label="Active Looms Today"    value={activeLooms.toString()}      sub="machines running"    icon={Factory}       accent="#6C63FF" />
                  <NmKpiCard label="Avg Efficiency Today"  value={`${avgEfficiencyToday}%`}    sub="all machines"        icon={TrendingUp}    accent="#16A34A" />
                  <NmKpiCard label="Low Efficiency Alerts" value={lowEffCount.toString()}       sub="machines below 70%"  icon={AlertTriangle} accent="#DC2626" />
                </div>

                <NmChartCard title="Machine Status Today">
                  <table className="w-full mt-2">
                    <thead>
                      <tr>
                        {['Machine','Shifts','Avg Efficiency','Status'].map(h => (
                          <th key={h} className={`text-[10px] font-bold uppercase tracking-widest py-2 ${h === 'Machine' ? 'text-left' : 'text-right last:text-center'}`}
                            style={{ color: '#9CA3AF', borderBottom: '1px solid rgb(163 177 198 / 0.4)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {machineStatus.map((m, i) => (
                        <tr key={m.machine}
                          style={{ borderBottom: i < machineStatus.length - 1 ? '1px solid rgb(163 177 198 / 0.3)' : 'none' }}>
                          <td className="py-2.5 text-sm font-mono font-medium" style={{ color: '#3D4852' }}>{m.machine}</td>
                          <td className="py-2.5 text-sm text-right" style={{ color: '#6B7280' }}>{m.record_count}</td>
                          <td className="py-2.5 text-sm text-right font-semibold" style={{ color: '#3D4852' }}>{m.avg_efficiency}%</td>
                          <td className="py-2.5 text-center">
                            <NmStatusPill status={m.status} />
                          </td>
                        </tr>
                      ))}
                      {machineStatus.length === 0 && (
                        <tr><td colSpan={4} className="py-8 text-center text-sm" style={{ color: '#9CA3AF' }}>No machine data for today</td></tr>
                      )}
                    </tbody>
                  </table>
                </NmChartCard>

                {/* Warping Queue */}
                <div className="rounded-[24px] p-6 flex items-center justify-between"
                  style={{ background: '#E0E5EC', boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)' }}>
                  <div>
                    <h3 className="text-sm font-bold font-display" style={{ color: '#D97706' }}>Awaiting Production</h3>
                    <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Orders waiting for warping</p>
                    <button onClick={() => router.push('/denim/admin/orders?status=PENDING_APPROVAL')}
                      className="mt-3 text-xs font-medium underline transition-colors"
                      style={{ color: '#D97706' }}>
                      View pending orders →
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold font-display" style={{ color: '#D97706' }}>{data?.warpingQueue ?? 0}</p>
                    <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>orders</p>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB 3: JAKARTA HQ ==================== */}
            {activeTab === 'jakarta' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <NmKpiCard label="Total Contracts"      value={total.toLocaleString()}                        sub="all time"         icon={Package2}     accent="#6C63FF" />
                  <NmKpiCard label="Active Orders"        value={(data?.inProgress ?? 0).toLocaleString()}      sub="in production"    icon={Clock}        accent="#D97706" />
                  <NmKpiCard label="Completed This Month" value={completedThisMonth.toLocaleString()}           sub="all time total"   icon={CheckCircle2} accent="#16A34A" />
                  <NmKpiCard label="Rejected"             value={rejectedCount.toLocaleString()}                sub="cancelled orders" icon={AlertTriangle} accent="#DC2626" />
                </div>

                <NmChartCard title="Customer Overview">
                  <table className="w-full mt-2">
                    <thead>
                      <tr>
                        {['Customer','Total Orders','Completed','In Progress'].map((h, i) => (
                          <th key={h} className={`text-[10px] font-bold uppercase tracking-widest py-2 ${i === 0 ? 'text-left' : 'text-right'}`}
                            style={{ color: '#9CA3AF', borderBottom: '1px solid rgb(163 177 198 / 0.4)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data?.topCustomers.map((c, i) => (
                        <tr key={i} style={{ borderBottom: i < (data.topCustomers.length - 1) ? '1px solid rgb(163 177 198 / 0.3)' : 'none' }}>
                          <td className="py-2.5 text-sm" style={{ color: '#3D4852' }}>{c.customer}</td>
                          <td className="py-2.5 text-sm text-right" style={{ color: '#6B7280' }}>{c.count}</td>
                          <td className="py-2.5 text-sm text-right font-semibold" style={{ color: '#16A34A' }}>{c.count}</td>
                          <td className="py-2.5 text-sm text-right" style={{ color: '#6C63FF' }}>0</td>
                        </tr>
                      ))}
                      {(!data?.topCustomers || data.topCustomers.length === 0) && (
                        <tr><td colSpan={4} className="py-8 text-center text-sm" style={{ color: '#9CA3AF' }}>No customer data</td></tr>
                      )}
                    </tbody>
                  </table>
                </NmChartCard>

                {/* Cycle time flow */}
                <NmChartCard title="Production Cycle Time">
                  <div className="flex items-center justify-center gap-2 flex-wrap mt-4">
                    {[
                      { label: 'Contract', sub: 'Received',         color: '#6B7280', days: null },
                      { label: 'Warping',  sub: 'Beam Prep',        color: '#6C63FF', days: data?.avgCycleTime.contract_to_warping },
                      { label: 'Indigo',   sub: 'Dyeing',           color: '#0891B2', days: data?.avgCycleTime.warping_to_indigo   },
                      { label: 'Weaving',  sub: 'Fabric Production', color: '#16A34A', days: data?.avgCycleTime.indigo_to_weaving  },
                    ].map((stage, i) => (
                      <div key={stage.label} className="flex items-center gap-2">
                        {i > 0 && (
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-semibold" style={{ color: '#D97706' }}>
                              {stage.days?.toFixed(1) ?? '—'} days
                            </span>
                            <ChevronRight className="w-5 h-5" style={{ color: '#9CA3AF' }} />
                          </div>
                        )}
                        <div className="flex flex-col items-center px-5 py-3 rounded-2xl"
                          style={{ background: '#E0E5EC', boxShadow: '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)' }}>
                          <p className="text-base font-bold font-display" style={{ color: stage.color }}>{stage.label}</p>
                          <p className="text-[10px]" style={{ color: '#9CA3AF' }}>{stage.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </NmChartCard>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function NmKpiCard({ label, value, sub, icon: Icon, accent }: {
  label: string; value: string; sub: string; icon: any; accent: string;
}) {
  return (
    <div className="rounded-[24px] p-5 transition-all duration-300 hover:-translate-y-0.5"
      style={{ background: '#E0E5EC', boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)' }}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: '#9CA3AF' }}>{label}</p>
        <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ boxShadow: 'inset 3px 3px 6px rgb(163 177 198 / 0.6), inset -3px -3px 6px rgba(255,255,255,0.5)', background: '#E0E5EC' }}>
          <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
        </div>
      </div>
      <p className="text-3xl font-bold tracking-tight font-display" style={{ color: accent }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{sub}</p>
    </div>
  );
}

function NmChartCard({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-[24px] p-6"
      style={{ background: '#E0E5EC', boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)' }}>
      <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] flex items-center gap-2" style={{ color: '#9CA3AF' }}>
        {icon}{title}
      </h3>
      {children}
    </div>
  );
}

function NmStatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; dot: string }> = {
    good:    { label: 'Good',    color: '#16A34A', dot: '#22C55E' },
    average: { label: 'Average', color: '#D97706', dot: '#FBBF24' },
    low:     { label: 'Low',     color: '#DC2626', dot: '#EF4444' },
  };
  const c = map[status] ?? map.average;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: '#E0E5EC', color: c.color, boxShadow: '3px 3px 6px rgb(163 177 198 / 0.5), -3px -3px 6px rgba(255,255,255,0.5)' }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.dot }} />
      {c.label}
    </span>
  );
}