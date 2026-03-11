'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

type WarpingRecord = {
  id: number;
  kp: string;
  tgl: string | null;
  no_mc: string | null;
  rpm: number | null;
  total_beam: number | null;
  total_putusan: number | null;
  elongasi: number | null;
  strength: number | null;
  cv_pct: number | null;
  tension_badan: number | null;
  tension_pinggir: number | null;
};

type ApiResponse = {
  data: WarpingRecord[];
  total: number;
  page: number;
  totalPages: number;
};

export default function WarpingListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchKp, setSearchKp] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [data, setData] = useState<WarpingRecord[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Debounce search by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchKp);
      setPage(1); // Reset to page 1 on search
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
      
      const res = await fetch(`/api/denim/warping/records?${params}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const json: ApiResponse = await res.json();
      setData(json.data);
      setTotalPages(json.totalPages);
      setTotal(json.total);
    } catch (err) {
      console.error('Error fetching warping:', err);
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

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 px-8 py-4">
        <h1 className="text-xl font-semibold text-zinc-900">Warping Records</h1>
      </div>

      <div className="p-8 space-y-6">
        {/* Search Bar */}
        <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by KP..."
              value={searchKp}
              onChange={(e) => setSearchKp(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchKp && (
              <button
                onClick={() => setSearchKp('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-50 text-xs font-medium text-zinc-500">
                  <th className="text-left px-4 py-3">KP</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Machine</th>
                  <th className="text-right px-4 py-3">RPM</th>
                  <th className="text-right px-4 py-3">Total Beam</th>
                  <th className="text-right px-4 py-3">Putusan</th>
                  <th className="text-right px-4 py-3">Elongasi</th>
                  <th className="text-right px-4 py-3">Strength</th>
                  <th className="text-right px-4 py-3">CV%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {loading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <tr key={i} className="hover:bg-zinc-50">
                        <td colSpan={9} className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2 text-zinc-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading...
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-zinc-400">
                      {debouncedSearch 
                        ? `No warping records found for '${debouncedSearch}'`
                        : 'No warping records found'
                      }
                    </td>
                  </tr>
                ) : (
                  data.map((row) => (
                    <tr key={row.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => router.push(`/denim/admin/orders/${row.kp}`)}
                          className="font-mono text-blue-600 hover:underline cursor-pointer"
                        >
                          {row.kp}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-zinc-600">{formatDate(row.tgl)}</td>
                      <td className="px-4 py-3 text-zinc-600">{row.no_mc || '—'}</td>
                      <td className="px-4 py-3 text-right text-zinc-600">{row.rpm ?? '—'}</td>
                      <td className="px-4 py-3 text-right text-zinc-600">{row.total_beam ?? '—'}</td>
                      <td className="px-4 py-3 text-right text-zinc-600">{row.total_putusan ?? '—'}</td>
                      <td className="px-4 py-3 text-right text-zinc-600">{row.elongasi ?? '—'}</td>
                      <td className="px-4 py-3 text-right text-zinc-600">{row.strength ?? '—'}</td>
                      <td className="px-4 py-3 text-right text-zinc-600">{row.cv_pct ?? '—'}</td>
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
              className="p-2 rounded-lg border border-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-zinc-600 px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
