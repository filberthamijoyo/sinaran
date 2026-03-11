'use client';

import { useEffect, useState } from 'react';
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
  ResponsiveContainer, BarChart, Bar, Cell,
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
  { key: 'PENDING_APPROVAL', label: 'Awaiting Approval', short: 'Pending', color: 'bg-amber-500' },
  { key: 'WARPING', label: 'In Warping', short: 'Warping', color: 'bg-violet-500' },
  { key: 'INDIGO', label: 'In Indigo', short: 'Indigo', color: 'bg-cyan-500' },
  { key: 'WEAVING', label: 'In Weaving', short: 'Weaving', color: 'bg-teal-500' },
  { key: 'INSPECT_GRAY', label: 'Inspect Gray', short: 'Inspect', color: 'bg-yellow-400' },
  { key: 'COMPLETE', label: 'Complete', short: 'Done', color: 'bg-green-500' },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('admin');

  useEffect(() => {
    authFetch('/denim/admin/summary')
      .then(r => setData(r as SummaryData))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getStageCount = (key: string) => data?.stageCounts?.[key] ?? 0;

  // Tab button styles
  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'admin', label: 'Admin / Owner', icon: Package2 },
    { id: 'factory', label: 'Factory', icon: Factory },
    { id: 'jakarta', label: 'Jakarta HQ', icon: Building2 },
  ];

  const totalActive = STAGE_ORDER.slice(0, 5)
    .reduce((s, st) => s + getStageCount(st.key), 0);
  const total = data?.total ?? 0;

  // Format week date for chart
  const chartData = data?.weeklyEfficiency.map(w => ({
    ...w,
    weekLabel: format(new Date(w.week), 'MMM d'),
  })) ?? [];

  // Pipeline funnel data
  const funnelData = STAGE_ORDER.map(s => ({
    name: s.short,
    count: getStageCount(s.key),
    fill: s.color.replace('bg-', ''),
  })).filter(d => d.count > 0);

  // Machine status with status badge
  const machineStatus = data?.machineEfficiencyToday.map(m => ({
    ...m,
    status: m.avg_efficiency >= 80 ? 'good' : m.avg_efficiency >= 70 ? 'average' : 'low',
  })).sort((a, b) => a.avg_efficiency - b.avg_efficiency) ?? [];

  const avgEfficiencyToday = machineStatus.length > 0
    ? (machineStatus.reduce((s, m) => s + m.avg_efficiency, 0) / machineStatus.length).toFixed(1)
    : '';

  const activeLooms = machineStatus.length;
  const lowEffCount = data?.lowEfficiencyMachines.length ?? 0;

  // Completed this month
  const completedThisMonth = data?.stageCounts['COMPLETE'] ?? 0;
  const rejectedCount = data?.stageCounts['REJECTED'] ?? 0;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={loading ? 'Loading...' : `${total.toLocaleString()} total orders`}
      />

      {/* Tab Navigation */}
      <div className="px-8 mb-6 border-b border-zinc-200">
        <div className="flex gap-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
          </div>

      <div className="px-8 pb-8">
            {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
                ))}
              </div>
            ) : (
          <>
            {/* ==================== TAB 1: ADMIN / OWNER ==================== */}
            {activeTab === 'admin' && (
              <div className="space-y-6">
                {/* Row 1: 4 KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <KpiCard
                    label="Total Orders"
                    value={total.toLocaleString()}
                    sub="all time"
                    icon={Package2}
                    iconBg="bg-zinc-100"
                    iconColor="text-zinc-500"
                  />
                  <KpiCard
                    label="In Progress"
                    value={(data?.inProgress ?? 0).toLocaleString()}
                    sub="active in pipeline"
                    icon={Clock}
                    iconBg="bg-blue-50"
                    iconColor="text-blue-600"
                  />
                  <KpiCard
                    label="Completed"
                    value={(data?.recentlyCompleted ?? 0).toLocaleString()}
                    sub="last 30 days"
                    icon={CheckCircle2}
                    iconBg="bg-green-50"
                    iconColor="text-green-600"
                  />
                  <KpiCard
                    label="Needs Attention"
                    value={(data?.blockedCount ?? 0).toLocaleString()}
                    sub="pending > 3 days"
                    icon={AlertTriangle}
                    iconBg="bg-amber-50"
                    iconColor="text-amber-600"
                  />
                </div>

                {/* Row 2: Two Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Weekly Efficiency Line Chart */}
                  <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-6">
                    <h3 className="text-sm font-semibold text-zinc-900 mb-4">
                      Weekly Efficiency (8 Weeks)
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="weekLabel" tick={{ fontSize: 11 }} stroke="#999" />
                          <YAxis domain={[60, 100]} tick={{ fontSize: 11 }} stroke="#999" />
                          <Tooltip
                            contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5' }}
                            formatter={(value: number) => [`${value}%`, 'Efficiency']}
                          />
                          <Line
                            type="monotone"
                            dataKey="avg_efficiency"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ fill: '#3b82f6', r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Pipeline Funnel Bar Chart */}
                  <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-6">
                    <h3 className="text-sm font-semibold text-zinc-900 mb-4">
                      Pipeline Status
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={funnelData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis type="number" tick={{ fontSize: 11 }} stroke="#999" />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="#999" width={60} />
                          <Tooltip
                            contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5' }}
                          />
                          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                            {funnelData.map((entry, index) => (
                              <Cell key={index} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Row 3: Two Panels */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Customers */}
                  <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-6">
                    <h3 className="text-sm font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Top 5 Customers
                    </h3>
                    <div className="space-y-3">
                      {data?.topCustomers.map((c, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
                          <span className="text-sm text-zinc-700">{c.customer}</span>
                          <span className="text-sm font-semibold text-zinc-900">{c.count}</span>
                        </div>
                      ))}
                      {(!data?.topCustomers || data.topCustomers.length === 0) && (
                        <p className="text-sm text-zinc-400">No customer data</p>
                      )}
                    </div>
                  </div>

                  {/* Cycle Time */}
                  <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-6">
                    <h3 className="text-sm font-semibold text-zinc-900 mb-4">
                      Average Cycle Time
                    </h3>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <span className="px-3 py-2 bg-zinc-100 rounded-lg text-zinc-700">
                        Contract
                      </span>
                      <span className="text-blue-600 font-medium">
                        {data?.avgCycleTime.contract_to_warping?.toFixed(1) ?? '—'} days
                      </span>
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                      <span className="px-3 py-2 bg-violet-100 rounded-lg text-violet-700">
                        Warping
                      </span>
                      <span className="text-blue-600 font-medium">
                        {data?.avgCycleTime.warping_to_indigo?.toFixed(1) ?? '—'} days
                      </span>
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                      <span className="px-3 py-2 bg-cyan-100 rounded-lg text-cyan-700">
                        Indigo
                      </span>
                      <span className="text-blue-600 font-medium">
                        {data?.avgCycleTime.indigo_to_weaving?.toFixed(1) ?? '—'} days
                      </span>
                      <span className="px-3 py-2 bg-teal-100 rounded-lg text-teal-700">
                        Weaving
                        </span>
                      </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB 2: FACTORY ==================== */}
            {activeTab === 'factory' && (
              <div className="space-y-6">
                {/* Row 1: 3 KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <KpiCard
                    label="Active Looms Today"
                    value={activeLooms.toString()}
                    sub="machines running"
                    icon={Factory}
                    iconBg="bg-teal-50"
                    iconColor="text-teal-600"
                  />
                  <KpiCard
                    label="Avg Efficiency Today"
                    value={`${avgEfficiencyToday}%`}
                    sub="all machines"
                    icon={TrendingUp}
                    iconBg="bg-blue-50"
                    iconColor="text-blue-600"
                  />
                  <KpiCard
                    label="Low Efficiency Alerts"
                    value={lowEffCount.toString()}
                    sub="machines below 70%"
                    icon={AlertTriangle}
                    iconBg="bg-red-50"
                    iconColor="text-red-600"
                  />
                </div>

                {/* Row 2: Machine Status Table */}
                <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-zinc-100">
                    <h3 className="text-sm font-semibold text-zinc-900">
                      Machine Status Today
                    </h3>
                  </div>
                  <table className="w-full">
                    <thead className="bg-zinc-50">
                      <tr>
                        <th className="text-left text-xs font-medium text-zinc-500 px-6 py-3">Machine</th>
                        <th className="text-right text-xs font-medium text-zinc-500 px-6 py-3">Shifts</th>
                        <th className="text-right text-xs font-medium text-zinc-500 px-6 py-3">Avg Efficiency</th>
                        <th className="text-center text-xs font-medium text-zinc-500 px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {machineStatus.map(m => (
                        <tr key={m.machine} className="hover:bg-zinc-50">
                          <td className="px-6 py-3 text-sm font-mono text-zinc-900">{m.machine}</td>
                          <td className="px-6 py-3 text-sm text-right text-zinc-600">{m.record_count}</td>
                          <td className="px-6 py-3 text-sm text-right text-zinc-900 font-medium">{m.avg_efficiency}%</td>
                          <td className="px-6 py-3 text-center">
                            {m.status === 'good' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                🟢 Good
                              </span>
                            )}
                            {m.status === 'average' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                                🟡 Average
                              </span>
                            )}
                            {m.status === 'low' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                                🔴 Low
                          </span>
                        )}
                          </td>
                        </tr>
                      ))}
                      {machineStatus.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-sm text-zinc-400">
                            No machine data for today
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                      </div>

                {/* Row 3: Warping Queue */}
                <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-amber-800">
                        Awaiting Production
                      </h3>
                      <p className="text-xs text-amber-600 mt-1">
                        Orders waiting for warping
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-amber-800">
                        {data?.warpingQueue ?? 0}
                      </p>
                      <p className="text-xs text-amber-600">orders</p>
                    </div>
                      </div>
                  <button
                    onClick={() => router.push('/denim/admin/orders?status=PENDING_APPROVAL')}
                    className="mt-4 text-sm text-amber-700 hover:text-amber-900 underline"
                  >
                    View pending orders →
                    </button>
                </div>
              </div>
            )}

            {/* ==================== TAB 3: JAKARTA HQ ==================== */}
            {activeTab === 'jakarta' && (
              <div className="space-y-6">
                {/* Row 1: 4 KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <KpiCard
                    label="Total Contracts"
                    value={total.toLocaleString()}
                    sub="all time"
                    icon={Package2}
                    iconBg="bg-zinc-100"
                    iconColor="text-zinc-500"
                  />
                  <KpiCard
                    label="Active Orders"
                    value={(data?.inProgress ?? 0).toLocaleString()}
                    sub="in production"
                    icon={Clock}
                    iconBg="bg-blue-50"
                    iconColor="text-blue-600"
                  />
                  <KpiCard
                    label="Completed This Month"
                    value={completedThisMonth.toLocaleString()}
                    sub="all time total"
                    icon={CheckCircle2}
                    iconBg="bg-green-50"
                    iconColor="text-green-600"
                  />
                  <KpiCard
                    label="Rejected"
                    value={rejectedCount.toLocaleString()}
                    sub="cancelled orders"
                    icon={AlertTriangle}
                    iconBg="bg-red-50"
                    iconColor="text-red-600"
                  />
                </div>

                {/* Row 2: Top Customers Table */}
                <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-zinc-100">
                    <h3 className="text-sm font-semibold text-zinc-900">
                      Customer Overview
                    </h3>
                  </div>
                  <table className="w-full">
                    <thead className="bg-zinc-50">
                      <tr>
                        <th className="text-left text-xs font-medium text-zinc-500 px-6 py-3">Customer</th>
                        <th className="text-right text-xs font-medium text-zinc-500 px-6 py-3">Total Orders</th>
                        <th className="text-right text-xs font-medium text-zinc-500 px-6 py-3">Completed</th>
                        <th className="text-right text-xs font-medium text-zinc-500 px-6 py-3">In Progress</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {data?.topCustomers.map((c, i) => (
                        <tr key={i} className="hover:bg-zinc-50">
                          <td className="px-6 py-3 text-sm text-zinc-900">{c.customer}</td>
                          <td className="px-6 py-3 text-sm text-right text-zinc-600">{c.count}</td>
                          <td className="px-6 py-3 text-sm text-right text-green-600">
                            {c.count} {/* Assuming all completed for now */}
                          </td>
                          <td className="px-6 py-3 text-sm text-right text-blue-600">0</td>
                        </tr>
                      ))}
                      {(!data?.topCustomers || data.topCustomers.length === 0) && (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-sm text-zinc-400">
                            No customer data
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Row 3: Cycle Time Visual */}
                <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-zinc-900 mb-6">
                    Production Cycle Time
                  </h3>
                  <div className="flex items-center justify-center gap-0 flex-wrap">
                    <div className="flex flex-col items-center">
                      <div className="px-6 py-4 bg-zinc-100 rounded-xl border-2 border-zinc-300">
                        <p className="text-lg font-bold text-zinc-800">Contract</p>
                        <p className="text-xs text-zinc-500">Received</p>
                      </div>
                      <div className="my-2 text-blue-600 font-semibold">
                        {data?.avgCycleTime.contract_to_warping?.toFixed(1) ?? '—'} days
                      </div>
                    </div>

                    <ChevronRight className="w-6 h-6 text-zinc-400 mx-2" />

                    <div className="flex flex-col items-center">
                      <div className="px-6 py-4 bg-violet-100 rounded-xl border-2 border-violet-300">
                        <p className="text-lg font-bold text-violet-800">Warping</p>
                        <p className="text-xs text-violet-500">Beam Prep</p>
                      </div>
                      <div className="my-2 text-blue-600 font-semibold">
                        {data?.avgCycleTime.warping_to_indigo?.toFixed(1) ?? '—'} days
                      </div>
                    </div>

                    <ChevronRight className="w-6 h-6 text-zinc-400 mx-2" />

                    <div className="flex flex-col items-center">
                      <div className="px-6 py-4 bg-cyan-100 rounded-xl border-2 border-cyan-300">
                        <p className="text-lg font-bold text-cyan-800">Indigo</p>
                        <p className="text-xs text-cyan-500">Dyeing</p>
                      </div>
                      <div className="my-2 text-blue-600 font-semibold">
                        {data?.avgCycleTime.indigo_to_weaving?.toFixed(1) ?? '—'} days
          </div>
        </div>

                    <ChevronRight className="w-6 h-6 text-zinc-400 mx-2" />

                    <div className="flex flex-col items-center">
                      <div className="px-6 py-4 bg-teal-100 rounded-xl border-2 border-teal-300">
                        <p className="text-lg font-bold text-teal-800">Weaving</p>
                        <p className="text-xs text-teal-500">Fabric Production</p>
                      </div>
                    </div>
                  </div>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}

// KPI Card Component
function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string;
  sub: string;
  icon: any;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-5 flex gap-3.5">
      <div className={`p-2 rounded-lg h-fit ${iconBg} ${iconColor}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="text-2xl font-bold text-zinc-900 mt-0.5">{value}</p>
        <p className="text-xs text-zinc-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}
