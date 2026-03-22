'use client';

import { useEffect, useState, useCallback } from 'react';
import { authFetch } from '../../../lib/authFetch';
import PageHeader from '../../layout/PageHeader';
import { Button } from '../../ui/button';
import { Skeleton } from '../../ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '../../ui/table';
import { Archive, Search, ChevronDown, ChevronUp, X } from 'lucide-react';
import { format } from 'date-fns';

type ArchivedKP = {
  id: number;
  kp: string;
  original_kp: string;
  tgl: string;
  codename: string | null;
  kat_kode: string | null;
  ket_warna: string | null;
  status: string | null;
  te: number | null;
  lebar: number | null;
  qr: number | null;
  pcs: number | null;
  acc: string | null;
  pipeline_status: string;
  kp_status: string;
};

const formatDate = (iso: string) => {
  try { return format(new Date(iso), 'd MMM yyyy'); }
  catch { return '—'; }
};

const TYPE_COLORS: Record<string, string> = {
  PO1: 'rgba(59, 130, 246, 0.15)',
  RP:  'rgba(139, 92, 246, 0.15)',
  SCN: ''
};

export default function KpArchivePage() {
  const [rows, setRows] = useState<ArchivedKP[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchArchived = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      const res = await authFetch(`/denim/admin/kp-archive?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRows(data);
      }
    } catch (err) {
      console.error('Failed to fetch archive:', err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchArchived();
  }, [fetchArchived]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Calculate stats
  const getWeavingStats = (record: ArchivedKP) => {
    return { count: 0, avgEff: null };
  };

  const getWarpingStats = (record: ArchivedKP) => {
    return { runs: 0, beams: 0 };
  };

  const getIndigoStats = (record: ArchivedKP) => {
    return { runs: 0 };
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="KP Archive"
        subtitle="Rejected contracts whose KP codes have been recycled"
      />

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#9CA3AF' }} />
          <input
            type="text"
            placeholder="Search by original KP code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-10 rounded-[16px] text-sm"
            style={{
              background: '#E0E5EC',
              color: '#3D4852',
              boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
              border: 'none',
            }}
          />
        </div>
        <Button type="submit" variant="default">
          Search
        </Button>
      </form>

      {/* Table */}
      <div style={{
        background: '#E0E5EC',
        borderRadius: '32px',
        overflow: 'hidden',
        boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
      }}>
        <Table>
          <TableHeader>
            <TableRow style={{ background: '#E0E5EC', borderBottom: '1px solid rgb(163 177 198 / 0.3)' }}>
              <TableHead className="w-12"></TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Original KP</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Date</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Construction</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Type</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Status</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Shifts</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12" style={{ color: '#9CA3AF' }}>
                  {search ? (
                    <>No archived KPs matching '{search}'</>
                  ) : (
                    <>
                      <Archive className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No archived KPs yet</p>
                      <p className="text-sm">Rejected contracts will appear here with their original KP codes</p>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <>
                  <TableRow key={row.id}>
                    <TableCell>
                      <button
                        onClick={() => toggleExpand(row.id)}
                        className="p-1 rounded-[8px]" style={{ background: 'transparent' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgb(163 177 198 / 0.3)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        {expandedId === row.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="font-mono font-semibold text-sm" style={{ color: '#6C63FF' }}>{row.original_kp}</TableCell>
                    <TableCell>{formatDate(row.tgl)}</TableCell>
                    <TableCell>{row.codename || '—'}</TableCell>
                    <TableCell>
                      {row.status && (
                        <span className={`inline-flex px-2 py-0.5 rounded-[9999px] text-xs font-medium ${TYPE_COLORS[row.status] || ''}`} style={TYPE_COLORS[row.status] ? {} : { background: '#E0E5EC', color: '#6B7280', boxShadow: '3px 3px 6px rgb(163 177 198 / 0.6), -3px -3px 6px rgba(255,255,255,0.5)' }}>
                          {row.status}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, background: 'rgba(220, 38, 38, 0.15)', color: '#DC2626' }}>
                        REJECTED
                      </span>
                    </TableCell>
                    <TableCell>—</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(row.id)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedId === row.id && (
                    <TableRow key={`${row.id}-detail`}>
                      <TableCell colSpan={8} className="p-4" style={{ background: '#E0E5EC' }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Sales Contract Details */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm" style={{ color: '#3D4852' }}>Sales Contract Details</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div><span style={{ color: '#6B7280' }}>KP:</span> <span className="font-mono font-semibold" style={{ color: '#D97706' }}>{row.original_kp}</span></div>
                              <div><span style={{ color: '#6B7280' }}>Date:</span> {formatDate(row.tgl)}</div>
                              <div><span style={{ color: '#6B7280' }}>Construction:</span> {row.codename || '—'}</div>
                              <div><span style={{ color: '#6B7280' }}>Type:</span> {row.status || '—'}</div>
                              <div><span style={{ color: '#6B7280' }}>Width:</span> {row.lebar ? `${row.lebar} cm` : '—'}</div>
                              <div><span style={{ color: '#6B7280' }}>TE:</span> {row.te || '—'}</div>
                              <div><span style={{ color: '#6B7280' }}>QR:</span> {row.qr || '—'}</div>
                              <div><span style={{ color: '#6B7280' }}>PCS:</span> {row.pcs || '—'}</div>
                              <div><span style={{ color: '#6B7280' }}>Color:</span> {row.ket_warna || '—'}</div>
                              <div><span style={{ color: '#6B7280' }}>Category:</span> {row.kat_kode || '—'}</div>
                              <div><span style={{ color: '#6B7280' }}>ACC:</span> {row.acc || '—'}</div>
                            </div>
                          </div>

                          {/* Production Stats */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm" style={{ color: '#3D4852' }}>Production Summary</h4>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="rounded-[16px] p-3 text-center" style={{ background: '#E0E5EC', boxShadow: 'inset 3px 3px 6px rgb(163 177 198 / 0.6), inset -3px -3px 6px rgba(255,255,255,0.5)' }}>
                                <div className="text-2xl font-bold" style={{ color: '#6C63FF' }}>{getWarpingStats(row).runs}</div>
                                <div className="text-xs" style={{ color: '#6B7280' }}>Warping Runs</div>
                                <div className="text-xs" style={{ color: '#9CA3AF' }}>{getWarpingStats(row).beams} beams</div>
                              </div>
                              <div className="rounded-[16px] p-3 text-center" style={{ background: '#E0E5EC', boxShadow: 'inset 3px 3px 6px rgb(163 177 198 / 0.6), inset -3px -3px 6px rgba(255,255,255,0.5)' }}>
                                <div className="text-2xl font-bold" style={{ color: '#6C63FF' }}>{getIndigoStats(row).runs}</div>
                                <div className="text-xs" style={{ color: '#6B7280' }}>Indigo Runs</div>
                              </div>
                              <div className="rounded-[16px] p-3 text-center" style={{ background: '#E0E5EC', boxShadow: 'inset 3px 3px 6px rgb(163 177 198 / 0.6), inset -3px -3px 6px rgba(255,255,255,0.5)' }}>
                                <div className="text-2xl font-bold" style={{ color: '#D97706' }}>{getWeavingStats(row).count}</div>
                                <div className="text-xs" style={{ color: '#6B7280' }}>Weaving Shifts</div>
                                {getWeavingStats(row).avgEff && (
                                  <div className="text-xs" style={{ color: '#9CA3AF' }}>{getWeavingStats(row).avgEff}% eff</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setExpandedId(null)}
                          className="mt-4 flex items-center gap-1 text-sm"
                          style={{ color: '#6B7280' }}
                        >
                          <X className="h-4 w-4" /> Close
                        </button>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
