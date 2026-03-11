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
  PO1: 'bg-blue-50 text-blue-700 border-blue-200',
  RP:  'bg-violet-50 text-violet-700 border-violet-200',
  SCN: 'bg-zinc-100 text-zinc-600 border-zinc-200',
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by original KP code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <Button type="submit" variant="default">
          Search
        </Button>
      </form>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Original KP</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Construction</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Shifts</TableHead>
              <TableHead>Actions</TableHead>
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
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
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
                        className="p-1 hover:bg-muted rounded"
                      >
                        {expandedId === row.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="font-mono font-medium">{row.original_kp}</TableCell>
                    <TableCell>{formatDate(row.tgl)}</TableCell>
                    <TableCell>{row.codename || '—'}</TableCell>
                    <TableCell>
                      {row.status && (
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${TYPE_COLORS[row.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                          {row.status}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
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
                      <TableCell colSpan={8} className="bg-muted/30 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Sales Contract Details */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm">Sales Contract Details</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div><span className="text-muted-foreground">KP:</span> <span className="font-mono">{row.original_kp}</span></div>
                              <div><span className="text-muted-foreground">Date:</span> {formatDate(row.tgl)}</div>
                              <div><span className="text-muted-foreground">Construction:</span> {row.codename || '—'}</div>
                              <div><span className="text-muted-foreground">Type:</span> {row.status || '—'}</div>
                              <div><span className="text-muted-foreground">Width:</span> {row.lebar ? `${row.lebar} cm` : '—'}</div>
                              <div><span className="text-muted-foreground">TE:</span> {row.te || '—'}</div>
                              <div><span className="text-muted-foreground">QR:</span> {row.qr || '—'}</div>
                              <div><span className="text-muted-foreground">PCS:</span> {row.pcs || '—'}</div>
                              <div><span className="text-muted-foreground">Color:</span> {row.ket_warna || '—'}</div>
                              <div><span className="text-muted-foreground">Category:</span> {row.kat_kode || '—'}</div>
                              <div><span className="text-muted-foreground">ACC:</span> {row.acc || '—'}</div>
                            </div>
                          </div>

                          {/* Production Stats */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-sm">Production Summary</h4>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="bg-blue-50 rounded p-3 text-center">
                                <div className="text-2xl font-bold text-blue-700">{getWarpingStats(row).runs}</div>
                                <div className="text-xs text-blue-600">Warping Runs</div>
                                <div className="text-xs text-blue-500">{getWarpingStats(row).beams} beams</div>
                              </div>
                              <div className="bg-indigo-50 rounded p-3 text-center">
                                <div className="text-2xl font-bold text-indigo-700">{getIndigoStats(row).runs}</div>
                                <div className="text-xs text-indigo-600">Indigo Runs</div>
                              </div>
                              <div className="bg-amber-50 rounded p-3 text-center">
                                <div className="text-2xl font-bold text-amber-700">{getWeavingStats(row).count}</div>
                                <div className="text-xs text-amber-600">Weaving Shifts</div>
                                {getWeavingStats(row).avgEff && (
                                  <div className="text-xs text-amber-500">{getWeavingStats(row).avgEff}% eff</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setExpandedId(null)}
                          className="mt-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
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
