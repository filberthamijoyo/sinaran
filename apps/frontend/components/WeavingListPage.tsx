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
    if (eff >= 80) return '#16A34A';
    if (eff >= 70) return '#D97706';
    return '#DC2626';
  };

  const getEfficiencyBg = (eff: number) => {
    if (eff >= 80) return 'rgba(22, 163, 74, 0.15)';
    if (eff >= 70) return 'rgba(217, 119, 6, 0.15)';
    return 'rgba(220, 38, 38, 0.15)';
  };

  return (
    <div className="min-h-screen" style={{ background: '#E0E5EC' }}>
      {/* Header */}
      <div className="px-8 py-4" style={{ background: '#E0E5EC', boxShadow: '0 2px 8px rgb(163 177 198 / 0.3)' }}>
        <h1 className="text-xl font-semibold" style={{ color: '#3D4852' }}>Weaving Records</h1>
      </div>

      <div className="p-8 space-y-6">
        {/* Search Bar */}
        <div
          style={{
            background: '#E0E5EC',
            boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
            borderRadius: '24px',
            padding: '16px',
          }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
            <input
              type="text"
              placeholder="Search by KP..."
              value={searchKp}
              onChange={(e) => setSearchKp(e.target.value)}
              style={{ background: '#E0E5EC', border: 'none', outline: 'none', borderRadius: '16px', boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)', padding: '10px 16px 10px 40px', color: '#3D4852', width: '100%', fontSize: '14px' }}
            />
            {searchKp && (
              <button
                onClick={() => setSearchKp('')}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', lineHeight: 1 }}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div
          style={{
            background: '#E0E5EC',
            boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
            borderRadius: '32px',
            overflow: 'hidden',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: '#E0E5EC' }}>
                <tr style={{ background: '#E0E5EC' }}>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>KP</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>First Date</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Last Date</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Shifts</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Avg Efficiency</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Total Meters</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Machines</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgb(163 177 198 / 0.3)' }}>
                        <td colSpan={7} className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2" style={{ color: '#9CA3AF' }}>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Loading...
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center" style={{ color: '#9CA3AF' }}>
                      {debouncedSearch
                        ? `No weaving records found for '${debouncedSearch}'`
                        : 'No weaving records found'
                      }
                    </td>
                  </tr>
                ) : (
                  data.map((row) => (
                    <tr key={row.kp} style={{ background: '#E0E5EC', borderBottom: '1px solid rgb(163 177 198 / 0.3)' }}>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => router.push(`/denim/admin/orders/${row.kp}`)}
                          style={{ fontFamily: 'monospace', fontWeight: 600, color: '#6C63FF', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                        >
                          {row.kp}
                        </button>
                      </td>
                      <td className="px-4 py-3" style={{ color: '#6B7280' }}>{formatDate(row.first_date)}</td>
                      <td className="px-4 py-3" style={{ color: '#6B7280' }}>{formatDate(row.last_date)}</td>
                      <td className="px-4 py-3 text-right" style={{ color: '#6B7280' }}>{row.record_count}</td>
                      <td className="px-4 py-3 text-right">
                        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '9999px', background: getEfficiencyBg(row.avg_efficiency), color: getEfficiencyColor(row.avg_efficiency), fontWeight: 600, fontSize: '13px' }}>
                          {row.avg_efficiency.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right" style={{ color: '#6B7280' }}>{formatMeters(row.total_meters)}</td>
                      <td className="px-4 py-3 text-right" style={{ color: '#6B7280' }}>{row.machine_count}</td>
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
              style={{ background: '#E0E5EC', border: 'none', borderRadius: '16px', boxShadow: '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)', padding: '8px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
            >
              <ChevronLeft className="w-4 h-4" style={{ color: '#6B7280' }} />
            </button>
            <span className="text-sm px-2" style={{ color: '#9CA3AF' }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ background: '#E0E5EC', border: 'none', borderRadius: '16px', boxShadow: '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)', padding: '8px', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
            >
              <ChevronRight className="w-4 h-4" style={{ color: '#6B7280' }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
