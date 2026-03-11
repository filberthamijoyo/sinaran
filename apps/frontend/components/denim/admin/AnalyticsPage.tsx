'use client';

import { useEffect, useState } from 'react';
import { authFetch } from '../../../lib/authFetch';
import PageHeader from '../../layout/PageHeader';
import { Skeleton } from '../../ui/skeleton';
import { Search, Loader2 } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface AnalyticsData {
  weeklyEfficiency: Array<{ week: string; avg_efficiency: number; record_count: number }>;
  weeklyProduction: Array<{ week: string; total_meters: number; total_picks: number; record_count: number }>;
  monthlyChemicals: Array<{ month: string; avg_indigo: number; avg_caustic: number; avg_hydro: number }>;
  cycleTimeDistribution: Array<{ kp: string; days_contract_to_weaving: number | null }>;
  machineList: string[];
  efficiencyByMachine: Array<{ machine: string; avg_efficiency: number; record_count: number }>;
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

type Tab = 'efficiency' | 'production' | 'comparison';

const DEFAULT_FROM = '2025-01-01';
const DEFAULT_TO = new Date().toISOString().split('T')[0];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('efficiency');

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
    fill: m.avg_efficiency >= 80 ? '#22c55e' : m.avg_efficiency >= 70 ? '#eab308' : '#ef4444',
  })) ?? [];

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Production insights and performance analysis"
      />

      {/* Filter Bar */}
      <div className="px-8 py-4 bg-white border-b border-zinc-200">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Machine</label>
            <select
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
              className="px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
            >
              <option value="all">All Machines</option>
              {data?.machineList.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Apply
          </button>
        </div>
            </div>

      {/* Tab Navigation */}
      <div className="px-8 border-b border-zinc-200">
        <div className="flex gap-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        </div>

      <div className="px-8 pb-8">
        {loading ? (
          <div className="space-y-4 mt-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <>
            {/* ==================== TAB 1: EFFICIENCY ==================== */}
            {activeTab === 'efficiency' && (
              <div className="space-y-6 mt-6">
                {/* Row 1: 3 KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-5">
                    <p className="text-xs text-zinc-500">Avg Efficiency</p>
                    <p className="text-3xl font-bold text-zinc-900 mt-1">{avgEfficiency}%</p>
                  </div>
                  <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-5">
                    <p className="text-xs text-zinc-500">Total Shifts</p>
                    <p className="text-3xl font-bold text-zinc-900 mt-1">{totalShifts.toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-5">
                    <p className="text-xs text-zinc-500">Best Week</p>
                    <p className="text-xl font-bold text-zinc-900 mt-1">
                      {bestWeek ? `${bestWeek.avg_efficiency}%` : '—'}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {bestWeek ? format(parseISO(bestWeek.week), 'MMM d, yyyy') : ''}
                    </p>
                  </div>
                </div>

                {/* Row 2: Weekly Efficiency Line Chart */}
                <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-zinc-900 mb-4">
                    Weekly Efficiency
            </h3>
                  {efficiencyChartData.length === 0 ? (
                    <div className="h-72 flex items-center justify-center text-zinc-400">
                      No efficiency data available for the selected period
                    </div>
                  ) : (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={efficiencyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="weekLabel" tick={{ fontSize: 11 }} stroke="#999" />
                          <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} stroke="#999" />
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
                            name="Efficiency %"
                          />
                        </LineChart>
              </ResponsiveContainer>
                    </div>
            )}
          </div>

                {/* Row 3: Efficiency by Machine Bar Chart */}
                {selectedMachine === 'all' && machineChartData.length > 0 && (
                  <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-6">
                    <h3 className="text-sm font-semibold text-zinc-900 mb-4">
                      Efficiency by Machine
            </h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={machineChartData.slice(0, 30)} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#999" />
                          <YAxis dataKey="machine" type="category" tick={{ fontSize: 10 }} stroke="#999" width={50} />
                          <Tooltip
                            contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5' }}
                            formatter={(value: number) => [`${value}%`, 'Efficiency']}
                          />
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
                  <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-5">
                    <p className="text-xs text-zinc-500">Total Meters</p>
                    <p className="text-3xl font-bold text-zinc-900 mt-1">{parseInt(String(totalMeters)).toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-5">
                    <p className="text-xs text-zinc-500">Total Picks</p>
                    <p className="text-3xl font-bold text-zinc-900 mt-1">{parseInt(String(totalPicks)).toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-5">
                    <p className="text-xs text-zinc-500">Avg Weekly Output</p>
                    <p className="text-3xl font-bold text-zinc-900 mt-1">{parseInt(avgWeeklyOutput).toLocaleString()}</p>
                    <p className="text-xs text-zinc-400">meters/week</p>
          </div>
        </div>

                {/* Row 2: Weekly Production Bar Chart */}
                <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-zinc-900 mb-4">
                    Weekly Production
            </h3>
                  {productionChartData.length === 0 ? (
                    <div className="h-72 flex items-center justify-center text-zinc-400">
                      No production data available for the selected period
                    </div>
                  ) : (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={productionChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="weekLabel" tick={{ fontSize: 11 }} stroke="#999" />
                          <YAxis tick={{ fontSize: 11 }} stroke="#999" />
                          <Tooltip
                            contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5' }}
                            formatter={(value: number, name: string) => [value.toLocaleString(), name === 'total_meters' ? 'Meters' : 'Picks']}
                          />
                          <Legend />
                          <Bar dataKey="total_meters" fill="#3b82f6" name="Meters" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="total_picks" fill="#71717a" name="Picks" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
          </div>
          
                {/* Row 3: Chemical Usage Line Chart */}
                <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-zinc-900 mb-4">
                    Chemical Usage Over Time
                  </h3>
                  {chemicalChartData.length === 0 ? (
                    <div className="h-72 flex items-center justify-center text-zinc-400">
                      No chemical usage data available for the selected period
            </div>
          ) : (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chemicalChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} stroke="#999" />
                          <YAxis tick={{ fontSize: 11 }} stroke="#999" />
                          <Tooltip
                            contentStyle={{ borderRadius: 8, border: '1px solid #e5e5e5' }}
                            formatter={(value: number, name: string) => [`${value} g/L`, name === 'avg_indigo' ? 'Indigo' : name === 'avg_caustic' ? 'Caustic' : 'Hydro']}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="avg_indigo" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Indigo" />
                          <Line type="monotone" dataKey="avg_caustic" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} name="Caustic" />
                          <Line type="monotone" dataKey="avg_hydro" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Hydro" />
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
                  <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200/80 shadow-sm p-4">
                    <h3 className="text-sm font-semibold text-zinc-900 mb-3">Find KPs</h3>
                    
                    {/* Search input */}
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Search KP, construction, color..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
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
                        className="flex-1 px-2 py-1.5 border border-zinc-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Constructions</option>
                        {codenameOptions.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <select
                        value={searchKatKode}
                        onChange={(e) => setSearchKatKode(e.target.value)}
                        className="w-24 px-2 py-1.5 border border-zinc-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Types</option>
                        {katKodeOptions.map(k => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </div>

                    {/* Date filter row */}
                    <div className="flex gap-2 mt-2 mb-3">
                      <div className="flex-1">
                        <label className="block text-xs text-zinc-500 mb-1">From</label>
                        <input type="date" value={kpFilterFrom}
                          onChange={e => { setKpFilterFrom(e.target.value); fetchKpSearch(undefined, e.target.value, undefined); }}
                          className="w-full px-2 py-1.5 border border-zinc-300 rounded-lg text-xs" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-zinc-500 mb-1">To</label>
                        <input type="date" value={kpFilterTo}
                          onChange={e => { setKpFilterTo(e.target.value); fetchKpSearch(undefined, undefined, e.target.value); }}
                          className="w-full px-2 py-1.5 border border-zinc-300 rounded-lg text-xs" />
                      </div>
                    </div>

                    {/* Results list */}
                    <div className="overflow-y-auto max-h-[480px]">
                      {searchLoading ? (
                        <>
                          {[1, 2, 3].map(i => (
                            <div key={i} className="border-b border-zinc-100 p-3 animate-pulse">
                              <div className="h-4 bg-zinc-200 rounded w-16 mb-2"></div>
                              <div className="h-3 bg-zinc-200 rounded w-32 mb-1"></div>
                              <div className="h-3 bg-zinc-200 rounded w-24"></div>
                            </div>
                          ))}
                        </>
                      ) : searchResults.length === 0 ? (
                        <div className="p-4 text-center text-zinc-400 text-sm">
                          No KPs found
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
                              className={`border-b border-zinc-100 p-3 transition-colors ${
                                isPinned 
                                  ? 'bg-blue-50 border-blue-300 cursor-default' 
                                  : isFull 
                                    ? 'opacity-50 cursor-not-allowed' 
                                    : 'cursor-pointer hover:bg-blue-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-mono font-bold text-sm">{result.kp}</span>
                                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${result.pipeline_status === 'COMPLETE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {result.pipeline_status}
                                  </span>
                                </div>
                                {isLoading ? (
                                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                                ) : isPinned ? (
                                  <span className="text-green-600 text-xs font-bold">✓</span>
                                ) : null}
                              </div>
                              <div className="text-sm text-zinc-600 mt-1">{result.codename}</div>
                              <div className="text-xs text-zinc-400 mt-0.5">
                                {result.ket_warna || '—'} · {result.kat_kode} · {result.tgl ? format(new Date(result.tgl), 'dd MMM yyyy') : '—'}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                {result.has_warping && (
                                  <span className="text-xs px-1.5 py-0.5 bg-violet-100 text-violet-700 rounded">W</span>
                                )}
                                {result.has_indigo && (
                                  <span className="text-xs px-1.5 py-0.5 bg-cyan-100 text-cyan-700 rounded">I</span>
                                )}
                                {result.weaving_count > 0 && (
                                  <span className={`text-xs px-1.5 py-0.5 rounded ${result.avg_efficiency && result.avg_efficiency >= 80 ? 'bg-green-100 text-green-700' : result.avg_efficiency && result.avg_efficiency >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
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
                      <div className="text-xs text-zinc-400 mt-2">
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
                          <span key={kp.sc?.kp} className="bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-3 py-1 text-xs flex items-center gap-1">
                            {kp.sc?.kp} · {kp.sc?.codename?.substring(0, 15)}...
                            <button onClick={() => unpinKp(kp.sc!.kp)} className="text-blue-400 hover:text-blue-700 ml-1">×</button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Empty state */}
                    {pinnedKps.length < 2 && (
                      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-12 text-center">
                        <p className="text-zinc-400">
                          {pinnedKps.length === 0 
                            ? 'Add 2–4 KPs from the left panel to compare them'
                            : 'Add one more KP to start comparing'
                          }
                        </p>
                      </div>
                    )}

                    {/* Comparison table */}
                    {pinnedKps.length >= 2 && (
                      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-zinc-50">
                              <tr>
                                <th className="text-left text-xs font-medium text-zinc-500 px-4 py-3 w-40">Metric</th>
                                {pinnedKps.map((kp) => (
                                  <th key={kp.sc?.kp} className="text-right text-xs font-medium text-zinc-500 px-4 py-3">
                                    <div className="font-mono">{kp.sc?.kp}</div>
                                    <div className="text-[10px] font-normal text-zinc-400 truncate max-w-[120px]">{kp.sc?.codename}</div>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                              {/* Sales Contract Section */}
                              <tr className="bg-amber-50"><td colSpan={pinnedKps.length + 1} className="px-4 py-2 text-xs font-semibold text-amber-800">Sales Contract</td></tr>
                              <ComparisonRow label="Construction (codename)" values={pinnedKps.map(p => p.sc?.codename ?? '—')} />
                              <ComparisonRow label="Type (kat_kode)" values={pinnedKps.map(p => p.sc?.kat_kode ?? '—')} />
                              <ComparisonRow label="TE" values={pinnedKps.map(p => p.sc?.te?.toString() ?? '—')} />
                              <ComparisonRow label="Color (ket_warna)" values={pinnedKps.map(p => p.sc?.ket_warna ?? '—')} />
                              <ComparisonRow label="Date" values={pinnedKps.map(p => p.sc?.tgl ? format(new Date(p.sc.tgl), 'yyyy-MM-dd') : '—')} />

                              {/* Warping Section */}
                              <tr className="bg-violet-50"><td colSpan={pinnedKps.length + 1} className="px-4 py-2 text-xs font-semibold text-violet-800">Warping</td></tr>
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
                              <tr className="bg-cyan-50"><td colSpan={pinnedKps.length + 1} className="px-4 py-2 text-xs font-semibold text-cyan-800">Indigo</td></tr>
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
                              <tr className="bg-teal-50"><td colSpan={pinnedKps.length + 1} className="px-4 py-2 text-xs font-semibold text-teal-800">Weaving Summary</td></tr>
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
    <tr className={hasDiff && !isNumeric ? 'bg-amber-50' : ''}>
      <td className="px-4 py-2 text-sm text-zinc-600">{label}</td>
      {values.map((v, i) => {
        const isBest = i === bestIdx;
        const isWorst = i === worstIdx;
        return (
          <td
            key={i}
            className={`px-4 py-2 text-sm text-right font-medium ${
              isBest ? 'text-green-700 bg-green-50' :
              isWorst ? 'text-red-700 bg-red-50' :
              'text-zinc-900'
            }`}
          >
            {v}
          </td>
        );
      })}
    </tr>
  );
}
