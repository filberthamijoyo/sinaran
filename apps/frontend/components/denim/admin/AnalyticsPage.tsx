'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { authFetch } from '../../../lib/authFetch';
import PageHeader from '../../layout/PageHeader';
import { Skeleton } from '../../ui/skeleton';
import { Search, Loader2, Inbox } from 'lucide-react';
import StatusBadge from '../../ui/StatusBadge';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, Legend, AreaChart, Area,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { CHART_COLORS, chartDefaults } from '../../../lib/chart-theme';

interface AnalyticsData {
  weeklyEfficiency: Array<{ week: string; avg_efficiency: number; record_count: number }>;
  weeklyProduction: Array<{ week: string; total_meters: number; total_picks: number; record_count: number }>;
  monthlyChemicals: Array<{ month: string; avg_indigo: number; avg_caustic: number; avg_hydro: number }>;
  cycleTimeDistribution: Array<{ kp: string; days_contract_to_weaving: number | null }>;
  machineList: string[];
  efficiencyByMachine: Array<{ machine: string; avg_efficiency: number; record_count: number }>;
  productionVelocity: Array<{ day: string; total_meters: number; machines: number }>;
  machineHeatmap: Array<{ machine: string; week: string; avg_efficiency: number; records: number }>;
}

interface KpData {
  // Sales Contract
  sc: { kp: string; codename: string; kat_kode: string; te: string; ket_warna: string; tgl: Date } | null;
  // Warping
  warping: { tgl: Date; no_mc: string; rpm: number; total_beam: number; total_putusan: number; elongasi: number; strength: number; cv_pct: number; tension_badan: number; tension_pinggir: number } | null;
  // Indigo
  indigo: { tgl: Date; mc: string; speed: number; bak_celup: number; indigo: number; caustic: number; hydro: number; temp_dryer: number; strength: number; elongasi: number } | null;
  // Weaving Summary
  weavingSummary: { totalRecords: number; avgEfficiency: number; totalMeters: number; uniqueMachines: number; firstDate: string; lastDate: string } | null;
}

type KpSearchResult = {
  kp: string;
  codename: string;
  kat_kode: string;
  ket_warna: string | null;
  tgl: string;
  pipeline_status: string;
  has_warping: boolean;
  has_indigo: boolean;
  weaving_count: number;
  avg_efficiency: number | null;
};

type Tab = 'efficiency' | 'production' | 'comparison' | 'machines';

const DEFAULT_FROM = '2025-01-01';
const DEFAULT_TO = new Date().toISOString().split('T')[0];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('efficiency');
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const activeTabRef = useRef<HTMLButtonElement | null>(null);

  // Filter state
  const [fromDate, setFromDate] = useState(DEFAULT_FROM);
  const [toDate, setToDate] = useState(DEFAULT_TO);
  const [selectedMachine, setSelectedMachine] = useState('all');

  // KP Search & Comparison state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCodename, setSearchCodename] = useState('all');
  const [searchKatKode, setSearchKatKode] = useState('all');
  const [kpFilterFrom, setKpFilterFrom] = useState('');
  const [kpFilterTo, setKpFilterTo] = useState('');
  const [searchResults, setSearchResults] = useState<KpSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [codenameOptions, setCodenameOptions] = useState<string[]>([]);
  const [katKodeOptions, setKatKodeOptions] = useState<string[]>([]);
  const [pinnedKps, setPinnedKps] = useState<KpData[]>([]);
  const [loadingKpCode, setLoadingKpCode] = useState<string | null>(null);

  // Get URL query params
  const searchParams = useSearchParams();
  const kpFromUrl = searchParams.get('kp');
  const tabFromUrl = searchParams.get('tab');

  // Handle kp query param from URL - auto-pin the KP
  useEffect(() => {
    if (kpFromUrl && activeTab === 'comparison') {
      const fetchAndPinKp = async () => {
        if (pinnedKps.some(k => k.sc?.kp === kpFromUrl)) {
          return; // Already pinned
        }
        setLoadingKpCode(kpFromUrl);
        try {
          const result = await authFetch(`/denim/admin/pipeline/${kpFromUrl}`);
          if (result) {
            setPinnedKps(prev => [...prev, result as KpData]);
          }
        } catch (err) {
          console.error('Failed to fetch KP:', err);
        } finally {
          setLoadingKpCode(null);
        }
      };
      fetchAndPinKp();
    }
  }, [kpFromUrl, activeTab]);

  // Switch to comparison tab if tab=comparison in URL
  useEffect(() => {
    if (tabFromUrl === 'comparison') {
      setActiveTab('comparison');
    }
  }, [tabFromUrl]);

  // Update activeTabRef when activeTab changes
  useEffect(() => {
    activeTabRef.current = tabRefs.current[activeTab] ?? null;
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        from: fromDate,
        to: toDate,
        machine: selectedMachine,
      });
      const result = await authFetch(`/denim/analytics/full?${params}`);
      setData(result as AnalyticsData);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchKpSearch();
  }, []);

  const handleApply = () => {
    fetchData();
  };

  // KP Search function
  const fetchKpSearch = async (query?: string, filterFrom?: string, filterTo?: string) => {
    setSearchLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      const q = query ?? searchQuery;
      if (q) params.set('q', q);
      if (searchCodename !== 'all') params.set('codename', searchCodename);
      if (searchKatKode !== 'all') params.set('kat_kode', searchKatKode);
      const from = filterFrom ?? kpFilterFrom;
      const to = filterTo ?? kpFilterTo;
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const result: any = await authFetch(`/denim/admin/kp-search?${params}`);
      // Deduplicate results by KP to avoid duplicate keys
      const uniqueResults = (result.results || []).filter(
        (item: KpSearchResult, index: number, self: KpSearchResult[]) =>
          self.findIndex((t: KpSearchResult) => t.kp === item.kp) === index
      );
      setSearchResults(uniqueResults);
      if (result.codenameOptions?.length) setCodenameOptions(result.codenameOptions);
      if (result.katKodeOptions?.length) setKatKodeOptions(result.katKodeOptions);
    } catch (err) {
      console.error('Failed to search KPs:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'comparison') {
        fetchKpSearch();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchCodename, searchKatKode, activeTab]);

  const pinKp = async (kp: string) => {
    if (pinnedKps.length >= 4) return;
    if (pinnedKps.find(p => p.sc?.kp === kp)) return;
    setLoadingKpCode(kp);
    try {
      const result: any = await authFetch(`/denim/admin/pipeline/${kp}`);
      setPinnedKps(prev => [...prev, result as KpData]);
    } catch (err) {
      console.error('Failed to load KP:', err);
      alert(`KP ${kp} not found`);
    } finally {
      setLoadingKpCode(null);
    }
  };

  const unpinKp = (kp: string) => {
    setPinnedKps(prev => prev.filter(p => p.sc?.kp !== kp));
  };

  // Computed values
  const tabs: { id: Tab; label: string }[] = [
    { id: 'efficiency', label: 'Efficiency' },
    { id: 'production', label: 'Production' },
    { id: 'comparison', label: 'KP Comparison' },
    { id: 'machines', label: 'Machines' },
  ];

  // Efficiency tab calculations
  const avgEfficiency = data?.weeklyEfficiency.length
    ? (data.weeklyEfficiency.reduce((s, w) => s + w.avg_efficiency, 0) / data.weeklyEfficiency.length).toFixed(1)
    : '0';
  const totalShifts = data?.weeklyEfficiency.reduce((s, w) => s + w.record_count, 0) ?? 0;
  const bestWeek = data?.weeklyEfficiency.reduce((best, w) => 
    w.avg_efficiency > (best?.avg_efficiency ?? 0) ? w : best, null as any);

  // Production tab calculations
  const totalMeters = data?.weeklyProduction.reduce((s, w) => s + w.total_meters, 0) ?? 0;
  const totalPicks = data?.weeklyProduction.reduce((s, w) => s + w.total_picks, 0) ?? 0;
  const avgWeeklyOutput = data?.weeklyProduction.length ? (totalMeters / data.weeklyProduction.length).toFixed(0) : '0';

  // Format data for charts
  const efficiencyChartData = data?.weeklyEfficiency.map(w => ({
    ...w,
    weekLabel: format(parseISO(w.week), 'MMM d'),
  })) ?? [];

  const productionChartData = data?.weeklyProduction.map(w => ({
    ...w,
    weekLabel: format(parseISO(w.week), 'MMM d'),
  })) ?? [];

  const chemicalChartData = data?.monthlyChemicals.map(m => ({
    ...m,
    monthLabel: format(parseISO(m.month), 'MMM yyyy'),
  })) ?? [];

  const machineChartData = data?.efficiencyByMachine.map(m => ({
    ...m,
    fill: m.avg_efficiency >= 80 ? '#16a34a' : m.avg_efficiency >= 70 ? '#ca8a04' : '#dc2626',
  })) ?? [];

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Production insights and performance analysis"
      />

      {/* Filter Bar */}
      <div
        className="px-4 sm:px-8 py-4"
        style={{
          background: '#E0E5EC',
          boxShadow: 'inset 0 2px 4px rgb(163 177 198 / 0.3)',
        }}
      >
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#9CA3AF' }}>From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{
                background: '#E0E5EC',
                border: 'none',
                borderRadius: '16px',
                boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                padding: '8px 12px',
                fontSize: '14px',
                color: '#3D4852',
              }}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#9CA3AF' }}>To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{
                background: '#E0E5EC',
                border: 'none',
                borderRadius: '16px',
                boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                padding: '8px 12px',
                fontSize: '14px',
                color: '#3D4852',
              }}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#9CA3AF' }}>Machine</label>
            <select
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
              style={{
                background: '#E0E5EC',
                border: 'none',
                borderRadius: '16px',
                boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                padding: '8px 12px',
                fontSize: '14px',
                color: '#3D4852',
                minWidth: '160px',
              }}
            >
              <option value="all">All Machines</option>
              {data?.machineList.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleApply}
            style={{
              background: '#6C63FF',
              borderRadius: '16px',
              boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
              color: '#fff',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              border: 'none',
            }}
          >
            Apply
          </button>
        </div>
            </div>

      {/* Tab Navigation */}
      <div
        className="px-4 sm:px-8"
        style={{
          background: '#E0E5EC',
          boxShadow: 'inset 0 2px 4px rgb(163 177 198 / 0.3)',
        }}
      >
        <div className="flex gap-8 relative">
          {tabs.map(tab => (
            <button
              key={tab.id}
              ref={el => { tabRefs.current[tab.id] = el; }}
              onClick={() => setActiveTab(tab.id)}
              className="pb-3 text-sm font-medium transition-colors"
              style={{
                borderBottom: activeTab === tab.id ? '2px solid #6C63FF' : '2px solid transparent',
                color: activeTab === tab.id ? '#6C63FF' : '#9CA3AF',
              }}
            >
              {tab.label}
            </button>
          ))}
          {/* Sliding indicator */}
          <div
            className="absolute bottom-0 h-0.5 transition-all duration-300 ease-out"
            style={{
              background: '#6C63FF',
              width: activeTabRef.current?.offsetWidth ?? 0,
              transform: `translateX(${activeTabRef.current?.offsetLeft ?? 0}px)`,
            }}
          />
        </div>
        </div>

      <div className="px-4 sm:px-8 pb-8">
        {loading ? (
          <div className="space-y-4 mt-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full"
                style={{
                  background: '#E0E5EC',
                  boxShadow: '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)',
                  borderRadius: '32px',
                }}
              />
            ))}
          </div>
        ) : (
          <>
            {/* ==================== TAB 1: EFFICIENCY ==================== */}
            {activeTab === 'efficiency' && (
              <div className="space-y-6 mt-6">
                {/* Row 1: 3 KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div
                    className="rounded-[32px] p-5"
                    style={{
                      background: '#E0E5EC',
                      boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
                    }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Avg Efficiency</p>
                    <p className="text-3xl font-bold mt-1" style={{ color: '#3D4852' }}>{avgEfficiency}%</p>
                  </div>
                  <div
                    className="rounded-[32px] p-5"
                    style={{
                      background: '#E0E5EC',
                      boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
                    }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Total Shifts</p>
                    <p className="text-3xl font-bold mt-1" style={{ color: '#3D4852' }}>{totalShifts.toLocaleString()}</p>
                  </div>
                  <div
                    className="rounded-[32px] p-5"
                    style={{
                      background: '#E0E5EC',
                      boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
                    }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Best Week</p>
                    <p className="text-xl font-bold mt-1" style={{ color: '#3D4852' }}>
                      {bestWeek ? `${bestWeek.avg_efficiency}%` : '—'}
                    </p>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>
                      {bestWeek ? format(parseISO(bestWeek.week), 'MMM d, yyyy') : ''}
                    </p>
                  </div>
                </div>

                {/* Row 2: Weekly Efficiency Line Chart */}
                <div
                  className="rounded-[32px] p-6"
                  style={{
                    background: '#E0E5EC',
                    boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
                  }}
                >
                  <h3 className="text-sm font-semibold mb-4" style={{ color: '#3D4852' }}>
                    Weekly Efficiency
                  </h3>
                  {efficiencyChartData.length === 0 ? (
                    <div className="h-72 flex items-center justify-center" style={{ color: '#9CA3AF' }}>
                      No efficiency data available for the selected period
                    </div>
                  ) : (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={efficiencyChartData}>
                          <defs>
                            <linearGradient id="effGradientAnalytics" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={CHART_COLORS.indigo} stopOpacity={0.15}/>
                              <stop offset="95%" stopColor={CHART_COLORS.indigo} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid {...chartDefaults.cartesianGrid} />
                          <XAxis dataKey="weekLabel" {...chartDefaults.xAxis} />
                          <YAxis domain={[50, 100]} {...chartDefaults.yAxis} />
                          <Tooltip {...chartDefaults.tooltip} formatter={(value: number) => [`${value}%`, 'Efficiency']} />
                          <Area
                            type="monotone"
                            dataKey="avg_efficiency"
                            stroke={CHART_COLORS.indigo}
                            strokeWidth={2}
                            fill="url(#effGradientAnalytics)"
                            dot={false}
                            name="Efficiency %"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Row 3: Efficiency by Machine Bar Chart */}
                {selectedMachine === 'all' && machineChartData.length > 0 && (
                  <div
                    className="rounded-[32px] p-6"
                    style={{
                      background: '#E0E5EC',
                      boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
                    }}
                  >
                    <h3 className="text-sm font-semibold mb-4" style={{ color: '#3D4852' }}>
                      Efficiency by Machine
                    </h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={machineChartData.slice(0, 30)} layout="vertical">
                          <CartesianGrid {...chartDefaults.cartesianGrid} />
                          <XAxis type="number" domain={[0, 100]} {...chartDefaults.xAxis} />
                          <YAxis dataKey="machine" type="category" tick={{ fontSize: 10 }} stroke="#999" width={50} />
                          <Tooltip {...chartDefaults.tooltip} formatter={(value: number) => [`${value}%`, 'Efficiency']} />
                          <Bar dataKey="avg_efficiency" name="Efficiency %">
                            {machineChartData.slice(0, 30).map((entry, index) => (
                              <Cell key={index} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ==================== TAB 2: PRODUCTION ==================== */}
            {activeTab === 'production' && (
              <div className="space-y-6 mt-6">
                {/* Row 1: 3 KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div
                  className="rounded-[32px] p-5"
                  style={{
                    background: '#E0E5EC',
                    boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
                  }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Total Meters</p>
                  <p className="text-3xl font-bold mt-1" style={{ color: '#3D4852' }}>{parseInt(String(totalMeters)).toLocaleString()}</p>
                </div>
                <div
                  className="rounded-[32px] p-5"
                  style={{
                    background: '#E0E5EC',
                    boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
                  }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Total Picks</p>
                  <p className="text-3xl font-bold mt-1" style={{ color: '#3D4852' }}>{parseInt(String(totalPicks)).toLocaleString()}</p>
                </div>
                <div
                  className="rounded-[32px] p-5"
                  style={{
                    background: '#E0E5EC',
                    boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
                  }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Avg Weekly Output</p>
                  <p className="text-3xl font-bold mt-1" style={{ color: '#3D4852' }}>{parseInt(avgWeeklyOutput).toLocaleString()}</p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>meters/week</p>
          </div>
        </div>

                {/* Row 2: Weekly Production Bar Chart */}
                <div
                  className="rounded-[32px] p-6"
                  style={{
                    background: '#E0E5EC',
                    boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
                  }}
                >
                  <h3 className="text-sm font-semibold mb-4" style={{ color: '#3D4852' }}>
                    Weekly Production
                  </h3>
                  {productionChartData.length === 0 ? (
                    <div className="h-72 flex items-center justify-center" style={{ color: '#9CA3AF' }}>
                      No production data available for the selected period
                    </div>
                  ) : (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={productionChartData}>
                          <CartesianGrid {...chartDefaults.cartesianGrid} />
                          <XAxis dataKey="weekLabel" {...chartDefaults.xAxis} />
                          <YAxis {...chartDefaults.yAxis} />
                          <Tooltip {...chartDefaults.tooltip} formatter={(value: number, name: string) => [value.toLocaleString(), name === 'total_meters' ? 'Meters' : 'Picks']} />
                          <Legend />
                          <Bar dataKey="total_meters" fill={CHART_COLORS.indigo} name="Meters" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="total_picks" fill={CHART_COLORS.slate} name="Picks" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
          
                {/* Row 3: Chemical Usage Line Chart */}
                <div
                  className="rounded-[32px] p-6"
                  style={{
                    background: '#E0E5EC',
                    boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
                  }}
                >
                  <h3 className="text-sm font-semibold mb-4" style={{ color: '#3D4852' }}>
                    Chemical Usage Over Time
                  </h3>
                  {chemicalChartData.length === 0 ? (
                    <div className="h-72 flex items-center justify-center" style={{ color: '#9CA3AF' }}>
                      No chemical usage data available for the selected period
                    </div>
                  ) : (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chemicalChartData}>
                          <CartesianGrid {...chartDefaults.cartesianGrid} />
                          <XAxis dataKey="monthLabel" {...chartDefaults.xAxis} />
                          <YAxis {...chartDefaults.yAxis} />
                          <Tooltip {...chartDefaults.tooltip} formatter={(value: number, name: string) => [`${value} g/L`, name === 'avg_indigo' ? 'Indigo' : name === 'avg_caustic' ? 'Caustic' : 'Hydro']} />
                          <Legend />
                          <Line type="monotone" dataKey="avg_indigo" stroke={CHART_COLORS.indigo} strokeWidth={2} dot={{ r: 3 }} name="Indigo" />
                          <Line type="monotone" dataKey="avg_caustic" stroke={CHART_COLORS.amber} strokeWidth={2} dot={{ r: 3 }} name="Caustic" />
                          <Line type="monotone" dataKey="avg_hydro" stroke={CHART_COLORS.emerald} strokeWidth={2} dot={{ r: 3 }} name="Hydro" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ==================== TAB 3: KP COMPARISON ==================== */}
            {activeTab === 'comparison' && (
              <div className="mt-6">
                {/* Two-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  {/* LEFT PANEL - Find KPs */}
                  <div
                    className="lg:col-span-2 rounded-[32px] p-4"
                    style={{
                      background: '#E0E5EC',
                      boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
                    }}
                  >
                    <h3 className="text-sm font-semibold mb-3" style={{ color: '#3D4852' }}>Find KPs</h3>
                    
                    {/* Search input */}
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
                      <input
                        type="text"
                        placeholder="Search KP, construction, color..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          width: '100%',
                          paddingLeft: '2.25rem',
                          paddingRight: '2.25rem',
                          paddingTop: '0.5rem',
                          paddingBottom: '0.5rem',
                          background: '#E0E5EC',
                          border: 'none',
                          borderRadius: '16px',
                          boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                          fontSize: '14px',
                          color: '#3D4852',
                        }}
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          style={{
                            position: 'absolute',
                            right: '0.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#9CA3AF',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '18px',
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>

                    {/* Filter dropdowns */}
                    <div className="flex gap-2 mb-3">
                      <select
                        value={searchCodename}
                        onChange={(e) => setSearchCodename(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          background: '#E0E5EC',
                          border: 'none',
                          borderRadius: '16px',
                          boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                          fontSize: '12px',
                          color: '#3D4852',
                        }}
                      >
                        <option value="all">All Constructions</option>
                        {codenameOptions.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <select
                        value={searchKatKode}
                        onChange={(e) => setSearchKatKode(e.target.value)}
                        style={{
                          width: '6rem',
                          padding: '6px 8px',
                          background: '#E0E5EC',
                          border: 'none',
                          borderRadius: '16px',
                          boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                          fontSize: '12px',
                          color: '#3D4852',
                        }}
                      >
                        <option value="all">All Types</option>
                        {katKodeOptions.map(k => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </div>

                    {/* Date filter row */}
                    <div className="flex flex-wrap gap-2 mt-2 mb-3">
                      <div className="flex-1">
                        <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#9CA3AF' }}>From</label>
                        <input type="date" value={kpFilterFrom}
                          onChange={e => { setKpFilterFrom(e.target.value); fetchKpSearch(undefined, e.target.value, undefined); }}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            background: '#E0E5EC',
                            border: 'none',
                            borderRadius: '16px',
                            boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                            fontSize: '12px',
                            color: '#3D4852',
                          }} />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#9CA3AF' }}>To</label>
                        <input type="date" value={kpFilterTo}
                          onChange={e => { setKpFilterTo(e.target.value); fetchKpSearch(undefined, undefined, e.target.value); }}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            background: '#E0E5EC',
                            border: 'none',
                            borderRadius: '16px',
                            boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                            fontSize: '12px',
                            color: '#3D4852',
                          }} />
                      </div>
                    </div>

                    {/* Results list */}
                    <div className="overflow-y-auto max-h-[480px]">
                      {searchLoading ? (
                        <>
                          {[1, 2, 3].map(i => (
                            <div key={i} style={{ borderBottom: '1px solid rgb(163 177 198 / 0.3)', padding: '12px' }}>
                              <div className="h-4 rounded w-16 mb-2" style={{ background: '#E0E5EC', boxShadow: 'inset 3px 3px 6px rgb(163 177 198 / 0.6), inset -3px -3px 6px rgba(255,255,255,0.5)' }}></div>
                              <div className="h-3 rounded w-32 mb-1" style={{ background: '#E0E5EC', boxShadow: 'inset 3px 3px 6px rgb(163 177 198 / 0.6), inset -3px -3px 6px rgba(255,255,255,0.5)' }}></div>
                              <div className="h-3 rounded w-24" style={{ background: '#E0E5EC', boxShadow: 'inset 3px 3px 6px rgb(163 177 198 / 0.6), inset -3px -3px 6px rgba(255,255,255,0.5)' }}></div>
                            </div>
                          ))}
                        </>
                      ) : searchResults.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8" style={{ color: '#9CA3AF' }}>
                          <Inbox className="w-8 h-8 mb-2" />
                          <p className="text-sm font-medium">No KPs found</p>
                          <p className="text-xs mt-1">Try a different search term</p>
                        </div>
                      ) : (
                        searchResults.map((result) => {
                          const isPinned = pinnedKps.some(p => p.sc?.kp === result.kp);
                          const isFull = pinnedKps.length >= 4 && !isPinned;
                          const isLoading = loadingKpCode === result.kp;
                          return (
                            <div
                              key={result.kp}
                              onClick={() => {
                                if (!isPinned && !isFull && !isLoading) {
                                  pinKp(result.kp);
                                }
                              }}
                              style={{
                                borderBottom: '1px solid rgb(163 177 198 / 0.3)',
                                padding: '12px',
                                background: isPinned ? 'rgb(108 99 255 / 0.1)' : isFull ? 'rgba(224, 229, 236, 0.5)' : '#E0E5EC',
                                cursor: isPinned ? 'default' : isFull ? 'not-allowed' : 'pointer',
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-semibold text-sm" style={{ color: '#6C63FF' }}>{result.kp}</span>
                                  <StatusBadge status={result.pipeline_status} size="sm" />
                                </div>
                                {isLoading ? (
                                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                                ) : isPinned ? (
                                  <span className="text-green-600 text-xs font-bold">✓</span>
                                ) : null}
                              </div>
                              <div className="text-sm mt-1" style={{ color: '#6B7280' }}>{result.codename}</div>
                              <div className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                                {result.ket_warna || '—'} · {result.kat_kode} · {result.tgl ? format(new Date(result.tgl), 'dd MMM yyyy') : '—'}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                {result.has_warping && (
                                  <span className="text-xs px-1.5 py-0.5 rounded-[9999px]" style={{ background: '#E0E5EC', color: '#6B7280', boxShadow: '3px 3px 6px rgb(163 177 198 / 0.6), -3px -3px 6px rgba(255,255,255,0.5)' }}>W</span>
                                )}
                                {result.has_indigo && (
                                  <span className="text-xs px-1.5 py-0.5 rounded-[9999px]" style={{ background: '#E0E5EC', color: '#6B7280', boxShadow: '3px 3px 6px rgb(163 177 198 / 0.6), -3px -3px 6px rgba(255,255,255,0.5)' }}>I</span>
                                )}
                                {result.weaving_count > 0 && (
                                  <span className="text-xs px-1.5 py-0.5 rounded-[9999px]" style={result.avg_efficiency && result.avg_efficiency >= 80 ? { background: 'rgb(22 163 74 / 0.15)', color: '#16A34A', boxShadow: '3px 3px 6px rgb(163 177 198 / 0.6), -3px -3px 6px rgba(255,255,255,0.5)' } : result.avg_efficiency && result.avg_efficiency >= 70 ? { background: 'rgb(217 119 6 / 0.15)', color: '#D97706', boxShadow: '3px 3px 6px rgb(163 177 198 / 0.6), -3px -3px 6px rgba(255,255,255,0.5)' } : { background: 'rgb(220 38 38 / 0.15)', color: '#DC2626', boxShadow: '3px 3px 6px rgb(163 177 198 / 0.6), -3px -3px 6px rgba(255,255,255,0.5)' }}>
                                    ⌛ {result.weaving_count} shifts · {result.avg_efficiency?.toFixed(1) ?? '—'}%
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    
                    {/* Results count */}
                    {!searchLoading && (
                      <div className="text-xs mt-2" style={{ color: '#9CA3AF' }}>
                        Showing {searchResults.length} results
                      </div>
          )}
        </div>

                  {/* RIGHT PANEL - Compare */}
                  <div className="lg:col-span-3">
                    {/* Pinned chips */}
                    {pinnedKps.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {pinnedKps.map((kp) => (
                          <span key={kp.sc?.kp} style={{ background: 'rgb(108 99 255 / 0.1)', border: '1px solid rgb(108 99 255 / 0.2)', color: '#6C63FF', borderRadius: '9999px', padding: '4px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {kp.sc?.kp} · {kp.sc?.codename?.substring(0, 15)}...
                            <button onClick={() => unpinKp(kp.sc!.kp)} style={{ background: 'none', border: 'none', color: '#6C63FF', cursor: 'pointer', marginLeft: '4px' }}>×</button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Empty state */}
                    {pinnedKps.length < 2 && (
                      <div
                        className="rounded-[32px] p-12 text-center"
                        style={{
                          background: '#E0E5EC',
                          boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
                        }}
                      >
                        <p style={{ color: '#9CA3AF' }}>
                          {pinnedKps.length === 0 
                            ? 'Add 2–4 KPs from the left panel to compare them'
                            : 'Add one more KP to start comparing'
                          }
                        </p>
                      </div>
                    )}

                    {/* Comparison table */}
                    {pinnedKps.length >= 2 && (
                      <div
                        className="rounded-[32px] overflow-hidden"
                        style={{
                          background: '#E0E5EC',
                          boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
                        }}
                      >
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead style={{ background: '#E0E5EC' }}>
                              <tr style={{ background: '#E0E5EC', borderBottom: '1px solid rgb(163 177 198 / 0.3)' }}>
                                <th className="text-left text-xs font-bold uppercase tracking-widest px-4 py-3 w-40" style={{ color: '#9CA3AF' }}>Metric</th>
                                {pinnedKps.map((kp) => (
                                  <th key={kp.sc?.kp} className="text-right text-xs font-bold uppercase tracking-widest px-4 py-3" style={{ color: '#9CA3AF' }}>
                                    <div className="font-mono" style={{ color: '#3D4852' }}>{kp.sc?.kp}</div>
                                    <div className="text-[10px] font-normal truncate max-w-[120px]" style={{ color: '#9CA3AF' }}>{kp.sc?.codename}</div>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody style={{ borderBottom: '1px solid rgb(163 177 198 / 0.3)' }}>
                              {/* Sales Contract Section */}
                              <tr><td colSpan={pinnedKps.length + 1} style={{ background: 'rgb(163 177 198 / 0.15)', padding: '8px 16px' }}><span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>Sales Contract</span></td></tr>
                              <ComparisonRow label="Construction (codename)" values={pinnedKps.map(p => p.sc?.codename ?? '—')} />
                              <ComparisonRow label="Type (kat_kode)" values={pinnedKps.map(p => p.sc?.kat_kode ?? '—')} />
                              <ComparisonRow label="TE" values={pinnedKps.map(p => p.sc?.te?.toString() ?? '—')} />
                              <ComparisonRow label="Color (ket_warna)" values={pinnedKps.map(p => p.sc?.ket_warna ?? '—')} />
                              <ComparisonRow label="Date" values={pinnedKps.map(p => p.sc?.tgl ? format(new Date(p.sc.tgl), 'yyyy-MM-dd') : '—')} />

                              {/* Warping Section */}
                              <tr><td colSpan={pinnedKps.length + 1} style={{ background: 'rgb(108 99 255 / 0.1)', padding: '8px 16px' }}><span style={{ fontSize: '12px', fontWeight: 600, color: '#6C63FF' }}>Warping</span></td></tr>
                              <ComparisonRow label="Date" values={pinnedKps.map(p => p.warping?.tgl ? format(new Date(p.warping.tgl), 'yyyy-MM-dd') : '—')} />
                              <ComparisonRow label="Machine No" values={pinnedKps.map(p => p.warping?.no_mc ?? '—')} />
                              <ComparisonRow label="RPM" values={pinnedKps.map(p => p.warping?.rpm?.toString() ?? '—')} />
                              <ComparisonRow label="Total Beam" values={pinnedKps.map(p => p.warping?.total_beam?.toString() ?? '—')} />
                              <ComparisonRow label="Total Putusan" values={pinnedKps.map(p => p.warping?.total_putusan?.toString() ?? '—')} />
                              <ComparisonRow label="Elongasi" values={pinnedKps.map(p => p.warping?.elongasi?.toString() ?? '—')} isNumeric higherIsBetter={false} />
                              <ComparisonRow label="Strength" values={pinnedKps.map(p => p.warping?.strength?.toString() ?? '—')} isNumeric />
                              <ComparisonRow label="CV%" values={pinnedKps.map(p => p.warping?.cv_pct?.toString() ?? '—')} isNumeric higherIsBetter={false} />
                              <ComparisonRow label="Tension Badan" values={pinnedKps.map(p => p.warping?.tension_badan?.toString() ?? '—')} isNumeric />
                              <ComparisonRow label="Tension Pinggir" values={pinnedKps.map(p => p.warping?.tension_pinggir?.toString() ?? '—')} isNumeric />

                              {/* Indigo Section */}
                              <tr><td colSpan={pinnedKps.length + 1} style={{ background: 'rgb(6 182 212 / 0.1)', padding: '8px 16px' }}><span style={{ fontSize: '12px', fontWeight: 600, color: '#0891B2' }}>Indigo</span></td></tr>
                              <ComparisonRow label="Date" values={pinnedKps.map(p => p.indigo?.tgl ? format(new Date(p.indigo.tgl), 'yyyy-MM-dd') : '—')} />
                              <ComparisonRow label="Machine" values={pinnedKps.map(p => p.indigo?.mc ?? '—')} />
                              <ComparisonRow label="Speed" values={pinnedKps.map(p => p.indigo?.speed?.toString() ?? '—')} isNumeric />
                              <ComparisonRow label="Bak Celup" values={pinnedKps.map(p => p.indigo?.bak_celup?.toString() ?? '—')} isNumeric />
                              <ComparisonRow label="Indigo g/L" values={pinnedKps.map(p => p.indigo?.indigo?.toString() ?? '—')} isNumeric />
                              <ComparisonRow label="Caustic g/L" values={pinnedKps.map(p => p.indigo?.caustic?.toString() ?? '—')} isNumeric />
                              <ComparisonRow label="Hydro g/L" values={pinnedKps.map(p => p.indigo?.hydro?.toString() ?? '—')} isNumeric />
                              <ComparisonRow label="Temp Dryer" values={pinnedKps.map(p => p.indigo?.temp_dryer?.toString() ?? '—')} isNumeric />
                              <ComparisonRow label="Strength" values={pinnedKps.map(p => p.indigo?.strength?.toString() ?? '—')} isNumeric />
                              <ComparisonRow label="Elongasi" values={pinnedKps.map(p => p.indigo?.elongasi?.toString() ?? '—')} isNumeric />

                              {/* Weaving Summary */}
                              <tr><td colSpan={pinnedKps.length + 1} style={{ background: 'rgb(20 184 166 / 0.1)', padding: '8px 16px' }}><span style={{ fontSize: '12px', fontWeight: 600, color: '#0D9488' }}>Weaving Summary</span></td></tr>
                              <ComparisonRow label="Total Records" values={pinnedKps.map(p => p.weavingSummary?.totalRecords?.toString() ?? '—')} />
                              <ComparisonRow label="Avg Efficiency %" values={pinnedKps.map(p => p.weavingSummary?.avgEfficiency?.toFixed(1) ?? '—')} isNumeric />
                              <ComparisonRow label="Total Meters" values={pinnedKps.map(p => p.weavingSummary?.totalMeters?.toLocaleString() ?? '—')} />
                              <ComparisonRow label="Unique Machines" values={pinnedKps.map(p => p.weavingSummary?.uniqueMachines?.toString() ?? '—')} />
                              <ComparisonRow label="Date Range" values={pinnedKps.map(p => p.weavingSummary
                                ? `${new Date(p.weavingSummary.firstDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} – ${new Date(p.weavingSummary.lastDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}`
                                : '—')} />
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ==================== TAB 4: MACHINES ==================== */}
        {activeTab === 'machines' && (
          <MachinesTab data={data} />
        )}
      </div>
    </div>
  );
}

// Comparison Row Component
function ComparisonRow({
  label,
  values,
  isNumeric = false,
  higherIsBetter = true,
}: {
  label: string;
  values: string[];
  isNumeric?: boolean;
  higherIsBetter?: boolean;
}) {
  // Parse numeric values
  const numericValues = values.map(v => {
    if (v === '—') return null;
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  });

  // Determine best and worst indices for numeric rows
  let bestIdx = -1;
  let worstIdx = -1;
  
  if (isNumeric) {
    const validValues = numericValues.map((v, i) => v !== null ? { v, i } : null).filter(Boolean) as { v: number; i: number }[];
    if (validValues.length >= 2) {
      if (higherIsBetter) {
        bestIdx = validValues.reduce((a, b) => a.v > b.v ? a : b).i;
        worstIdx = validValues.reduce((a, b) => a.v < b.v ? a : b).i;
      } else {
        bestIdx = validValues.reduce((a, b) => a.v < b.v ? a : b).i;
        worstIdx = validValues.reduce((a, b) => a.v > b.v ? a : b).i;
      }
    }
  }

  // Check if all non-dash values are the same (for non-numeric)
  const nonDashValues = values.filter(v => v !== '—');
  const allSame = nonDashValues.length > 1 && nonDashValues.every(v => v === nonDashValues[0]);
  const hasDiff = nonDashValues.length > 1 && !allSame;

  return (
    <tr style={hasDiff && !isNumeric ? { background: 'rgb(254 243 199 / 0.3)' } : {}}>
      <td className="px-4 py-2 text-sm" style={{ color: '#6B7280' }}>{label}</td>
      {values.map((v, i) => {
        const isBest = i === bestIdx;
        const isWorst = i === worstIdx;
        return (
          <td
            key={i}
            className="px-4 py-2 text-sm text-right font-medium"
            style={isBest ? { color: '#16A34A', background: 'rgb(220 252 171 / 0.3)' } : isWorst ? { color: '#DC2626', background: 'rgb(254 226 226 / 0.3)' } : { color: '#3D4852' }}
          >
            {v}
          </td>
        );
      })}
    </tr>
  );
}

// Machines Tab Component
function MachinesTab({ data }: { data: AnalyticsData | null }) {
  const [showAllMachines, setShowAllMachines] = useState(false);

  // Format velocity data - sort by date first, then format
  const velocityData = (data?.productionVelocity ?? [])
    .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime())
    .map((v, idx) => ({
      ...v,
      dayLabel: format(parseISO(v.day), 'MMM d'),
      showLabel: idx % 7 === 0, // Show every 7th label
    }));

  // Get Y-axis domain from actual data (explicitly set 0 as min)
  const maxMeters = Math.max(...(data?.productionVelocity ?? []).map(v => v.total_meters), 0);
  const yAxisDomain: [number, number] = [0, Math.ceil(maxMeters * 1.1)];

  // Prepare heatmap data
  const heatmapData = data?.machineHeatmap ?? [];
  
  // Get unique weeks (last 8 weeks)
  const weeks = [...new Set(heatmapData.map(h => h.week))].sort();

  // Build heatmap grid - with performance toggle
  const allMachines = [...new Set(heatmapData.map(h => h.machine))].sort();
  const displayedMachines = showAllMachines ? allMachines : allMachines.slice(0, 50);

  const heatmapGrid = displayedMachines.map(machine => {
    const machineData: { [week: string]: number | null } = {};
    weeks.forEach(week => {
      const entry = heatmapData.find(h => h.machine === machine && h.week === week);
      machineData[week] = entry?.avg_efficiency ?? null;
    });
    return { machine, data: machineData };
  });

  // KPI calculations
  const totalMeters60d = data?.productionVelocity.reduce((s, v) => s + v.total_meters, 0) ?? 0;
  const avgMachines = data?.productionVelocity.length
    ? (data.productionVelocity.reduce((s, v) => s + v.machines, 0) / data.productionVelocity.length).toFixed(1)
    : '0';
  const activeMachines = allMachines.length;

  // Helper for cell background - neumorphic style
  const getCellColor = (eff: number | null) => {
    if (eff === null) return { background: 'rgb(163 177 198 / 0.1)' };
    if (eff >= 80) return { background: 'rgb(22 163 74 / 0.15)' };
    if (eff >= 70) return { background: 'rgb(217 119 6 / 0.15)' };
    return { background: 'rgb(220 38 38 / 0.15)' };
  };

  // Helper for text color - soft, muted colors
  const getTextColor = (eff: number | null) => {
    if (eff === null) return { color: '#9CA3AF' };
    if (eff >= 80) return { color: 'rgb(22 163 74 / 0.7)' };
    if (eff >= 70) return { color: 'rgb(217 119 6 / 0.7)' };
    return { color: 'rgb(220 38 38 / 0.7)' };
  };

  return (
    <div className="space-y-6 mt-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          className="rounded-[32px] p-5"
          style={{
            background: '#E0E5EC',
            boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Total Production (60 days)</p>
          <p className="text-3xl font-bold mt-1" style={{ color: '#3D4852' }}>
            {Math.round(totalMeters60d).toLocaleString()}
          </p>
          <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>meters</p>
        </div>
        <div
          className="rounded-[32px] p-5"
          style={{
            background: '#E0E5EC',
            boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Avg Machines Active</p>
          <p className="text-3xl font-bold mt-1" style={{ color: '#3D4852' }}>{avgMachines}</p>
          <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>machines/day</p>
        </div>
        <div
          className="rounded-[32px] p-5"
          style={{
            background: '#E0E5EC',
            boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Active Machines</p>
          <p className="text-3xl font-bold mt-1" style={{ color: '#3D4852' }}>{activeMachines}</p>
          <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>in last 8 weeks</p>
        </div>
      </div>

      {/* Production Velocity Chart */}
      <div
        className="rounded-[32px] p-6"
        style={{
          background: '#E0E5EC',
          boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
        }}
      >
        <h3 className="text-xs font-medium mb-4" style={{ color: '#6B7280' }}>
          Production Velocity — Daily Meters
        </h3>
        {velocityData.length === 0 ? (
          <div className="h-72 flex items-center justify-center" style={{ color: '#9CA3AF' }}>
            No production data available
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData}>
                <defs>
                  <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.emerald} stopOpacity={0.2}/>
                    <stop offset="100%" stopColor={CHART_COLORS.emerald} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid {...chartDefaults.cartesianGrid} />
                <XAxis 
                  dataKey="dayLabel" 
                  {...chartDefaults.xAxis}
                  interval={6}
                  tickFormatter={(value, index) => index % 7 === 0 ? value : ''}
                />
                <YAxis domain={[0, yAxisDomain[1]] as [number, number]} {...chartDefaults.yAxis} />
                <Tooltip 
                  {...chartDefaults.tooltip} 
                  formatter={(value: number) => [`${value.toLocaleString()} m`, 'Meters']}
                />
                <Area
                  type="monotone"
                  dataKey="total_meters"
                  stroke={CHART_COLORS.emerald}
                  strokeWidth={2}
                  fill="url(#velocityGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: CHART_COLORS.emerald }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Machine Efficiency Heatmap */}
      <div
        className="rounded-[32px] p-6"
        style={{
          background: '#E0E5EC',
          boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
        }}
      >
        <h3 className="text-sm font-semibold mb-4" style={{ color: '#3D4852' }}>
          Machine Efficiency Heatmap (8 Weeks)
        </h3>
        
        {/* Horizontal scroll container */}
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Header row */}
            <div className="flex items-center">
              <div className="w-16 flex-shrink-0" />
              <div 
                className="flex gap-0.5"
                style={{ width: `${weeks.length * 36}px` }}
              >
                {weeks.map(week => (
                  <div 
                    key={week} 
                    className="w-8 flex-shrink-0 text-[9px] text-center font-medium"
                  >
                    {format(parseISO(week), 'MMM d')}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Data rows */}
            {heatmapGrid.map(({ machine, data: weekData }) => (
              <div key={machine} className="flex items-center py-0.5">
                <div className="w-16 flex-shrink-0 text-[10px] font-mono truncate pr-2" style={{ color: '#6B7280' }}>
                  {machine}
                </div>
                <div 
                  className="flex gap-0.5"
                  style={{ width: `${weeks.length * 36}px` }}
                >
                  {weeks.map(week => {
                    const eff = weekData[week];
                    return (
                      <div
                        key={week}
                        className="w-8 h-6 flex-shrink-0 flex items-center justify-center rounded text-[9px] font-medium"
                        style={{ ...getCellColor(eff), ...getTextColor(eff) }}
                        title={eff !== null ? `${machine} - Week of ${format(parseISO(week), 'MMM d')}: ${eff}%` : 'No data'}
                      >
                        {eff !== null ? `${eff}%` : '—'}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Show all machines toggle */}
        {allMachines.length > 50 && (
          <button
            onClick={() => setShowAllMachines(!showAllMachines)}
            style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#9CA3AF' }}
          >
            {showAllMachines ? 'Show less' : `Show all ${allMachines.length} machines`}
          </button>
        )}

        {/* Compact Legend */}
        <div className="flex items-center gap-3 mt-3 pt-3" style={{ borderTop: '1px solid rgb(163 177 198 / 0.3)' }}>
          <span className="text-[10px] uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Legend:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'rgb(22 163 74 / 0.15)', border: '1px solid rgb(22 163 74 / 0.3)' }} />
            <span className="text-[10px]" style={{ color: 'rgb(22 163 74 / 0.7)' }}>≥80%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'rgb(217 119 6 / 0.15)', border: '1px solid rgb(217 119 6 / 0.3)' }} />
            <span className="text-[10px]" style={{ color: 'rgb(217 119 6 / 0.7)' }}>70-79%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'rgb(220 38 38 / 0.15)', border: '1px solid rgb(220 38 38 / 0.3)' }} />
            <span className="text-[10px]" style={{ color: 'rgb(220 38 38 / 0.7)' }}>&lt;70%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'rgb(163 177 198 / 0.1)', border: '1px solid rgb(163 177 198 / 0.2)' }} />
            <span className="text-[10px]" style={{ color: '#9CA3AF' }}>No data</span>
          </div>
        </div>
      </div>
    </div>
  );
}
