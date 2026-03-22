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

type Props = {
  initialData?: ApiResponse;
};

export default function WarpingListPage({ initialData }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(!initialData);
  const [searchKp, setSearchKp] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [data, setData] = useState<WarpingRecord[]>(initialData?.data ?? []);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages ?? 1);
  const [total, setTotal] = useState(initialData?.total ?? 0);

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
    if (!initialData) {
      fetchData();
    }
  }, [fetchData, initialData]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen" style={{ background: '#E0E5EC' }}>
      {/* Header */}
      <div className="px-8 py-4" style={{ background: '#E0E5EC', boxShadow: '0 2px 8px rgb(163 177 198 / 0.3)' }}>
        <h1 className="text-xl font-semibold" style={{ color: '#3D4852' }}>Warping Records</h1>
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
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Date</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Machine</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>RPM</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Total Beam</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Putusan</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Elongasi</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Strength</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>CV%</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgb(163 177 198 / 0.3)' }}>
                        <td colSpan={9} className="px-4 py-4">
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
                    <td colSpan={9} className="px-4 py-8 text-center" style={{ color: '#9CA3AF' }}>
                      {debouncedSearch
                        ? `No warping records found for '${debouncedSearch}'`
                        : 'No warping records found'
                      }
                    </td>
                  </tr>
                ) : (
                  data.map((row) => (
                    <tr key={row.id} style={{ background: '#E0E5EC', borderBottom: '1px solid rgb(163 177 198 / 0.3)' }}>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => router.push(`/denim/admin/orders/${row.kp}`)}
                          style={{ fontFamily: 'monospace', fontWeight: 600, color: '#6C63FF', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                        >
                          {row.kp}
                        </button>
                      </td>
                      <td className="px-4 py-3" style={{ color: '#6B7280' }}>{formatDate(row.tgl)}</td>
                      <td className="px-4 py-3" style={{ color: '#6B7280' }}>{row.no_mc || '—'}</td>
                      <td className="px-4 py-3 text-right" style={{ color: '#6B7280' }}>{row.rpm ?? '—'}</td>
                      <td className="px-4 py-3 text-right" style={{ color: '#6B7280' }}>{row.total_beam ?? '—'}</td>
                      <td className="px-4 py-3 text-right" style={{ color: '#6B7280' }}>{row.total_putusan ?? '—'}</td>
                      <td className="px-4 py-3 text-right" style={{ color: '#6B7280' }}>{row.elongasi ?? '—'}</td>
                      <td className="px-4 py-3 text-right" style={{ color: '#6B7280' }}>{row.strength ?? '—'}</td>
                      <td className="px-4 py-3 text-right" style={{ color: '#6B7280' }}>{row.cv_pct ?? '—'}</td>
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
