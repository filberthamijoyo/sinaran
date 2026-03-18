'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

type WeavingSummary = {
  kp: string;
  record_count: number;
  avg_efficiency: number;
  total_meters: number;
  machine_count: number;
  first_date: string | null;
  last_date: string | null;
};

type ApiResponse = {
  data: WeavingSummary[];
  total: number;
  page: number;
  totalPages: number;
};

export default function WeavingListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchKp, setSearchKp] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [data, setData] = useState<WeavingSummary[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchKp);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchKp]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '50',
      });
      if (debouncedSearch) {
        params.set('kp', debouncedSearch);
      }
      
      const res = await fetch(`/api/denim/weaving/records?${params}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const json: ApiResponse = await res.json();
      setData(json.data);
      setTotalPages(json.totalPages);
      setTotal(json.total);
    } catch (err) {
      console.error('Error fetching weaving:', err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatMeters = (meters: number) => {
    return meters.toLocaleString('id-ID');
  };

  const getEfficiencyColor = (eff: number) => {
    if (eff >= 80) return 'text-emerald-400';
    if (eff >= 70) return 'text-amber-400';
    return 'text-red-400';
  };

  const getEfficiencyBg = (eff: number) => {
    if (eff >= 80) return 'bg-emerald-500/15';
    if (eff >= 70) return 'bg-amber-500/15';
    return 'bg-red-500/15';
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Header */}
      <div className="bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] px-8 py-4">
        <h1 className="text-xl font-semibold text-zinc-100">Weaving Records</h1>
      </div>

      <div className="p-8 space-y-6">
        {/* Search Bar */}
        <div className="card-glow rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by KP..."
              value={searchKp}
              onChange={(e) => setSearchKp(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-[hsl(var(--input))] border border-[hsl(var(--border))] rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
            />
            {searchKp && (
              <button
                onClick={() => setSearchKp('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="card-glow rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[hsl(var(--muted))] text-xs font-medium text-zinc-500">
                  <th className="text-left px-4 py-3">KP</th>
                  <th className="text-left px-4 py-3">First Date</th>
                  <th className="text-left px-4 py-3">Last Date</th>
                  <th className="text-right px-4 py-3">Shifts</th>
                  <th className="text-right px-4 py-3">Avg Efficiency</th>
                  <th className="text-right px-4 py-3">Total Meters</th>
                  <th className="text-right px-4 py-3">Machines</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--border))]">
                {loading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <tr key={i} className="hover:bg-[hsl(var(--muted))]">
                        <td colSpan={7} className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2 text-zinc-500">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading...
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                      {debouncedSearch 
                        ? `No weaving records found for '${debouncedSearch}'`
                        : 'No weaving records found'
                      }
                    </td>
                  </tr>
                ) : (
                  data.map((row) => (
                    <tr key={row.kp} className="hover:bg-[hsl(var(--muted))]">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => router.push(`/denim/admin/orders/${row.kp}`)}
                          className="font-mono text-indigo-400 hover:underline cursor-pointer"
                        >
                          {row.kp}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{formatDate(row.first_date)}</td>
                      <td className="px-4 py-3 text-zinc-400">{formatDate(row.last_date)}</td>
                      <td className="px-4 py-3 text-right text-zinc-400">{row.record_count}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-block px-2 py-1 rounded ${getEfficiencyBg(row.avg_efficiency)} ${getEfficiencyColor(row.avg_efficiency)} font-medium`}>
                          {row.avg_efficiency.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-400">{formatMeters(row.total_meters)}</td>
                      <td className="px-4 py-3 text-right text-zinc-400">{row.machine_count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-[hsl(var(--border))] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[hsl(var(--accent))]"
            >
              <ChevronLeft className="w-4 h-4 text-zinc-400" />
            </button>
            <span className="text-sm text-zinc-500 px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-[hsl(var(--border))] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[hsl(var(--accent))]"
            >
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
