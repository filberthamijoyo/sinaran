'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '../../lib/authFetch';
import PageHeader from '../layout/PageHeader';
import StatusBadge from '../ui/StatusBadge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Plus, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import OrderFilterBar, {
  FilterState, defaultFilters,
} from './OrderFilterBar';

type SC = {
  id: number;
  kp: string;
  tgl: string;
  codename: string | null;
  permintaan: string | null;
  kat_kode: string | null;
  ket_warna: string | null;
  status: string | null;
  acc: string | null;
  pipeline_status: string;
  te: number | null;
};

const formatDate = (iso: string) => {
  try { return format(new Date(iso), 'd MMM yyyy'); }
  catch { return '—'; }
};

const SC_TYPE_COLORS: Record<string, string> = {
  PO1: 'text-[#6C63FF]',
  RP:  'text-[#6C63FF]',
  SCN: 'text-[#6B7280]',
};

export default function MyOrdersPage() {
  const router = useRouter();
  const [rows, setRows] = useState<SC[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(defaultFilters());
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 50;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
        sortField: filters.sortField,
        sortDir: filters.sortDir,
      });
      if (filters.search) params.set('kp', filters.search);
      if (filters.stage && filters.stage !== 'ALL')
        params.set('pipeline_status', filters.stage);
      if (filters.type && filters.type !== 'ALL')
        params.set('type', filters.type);
      const data = await authFetch(
        `/denim/sales-contracts?${params}`
      ) as any;
      setRows(data?.items || []);
      setTotal(data?.pagination?.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [filters]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      <PageHeader
        title="My Orders"
        subtitle={`${total.toLocaleString()} total orders`}
        actions={
          <Button
            onClick={() => router.push('/denim/new-order')}
            style={{
              background: '#6C63FF',
              color: '#FFFFFF',
              border: 'none',
            }}
            className="h-8 text-sm gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            New Order
          </Button>
        }
      />

      <div className="px-4 sm:px-8 pb-8">
        {/* Search + refresh */}
        <div className="flex items-center gap-2 mb-4">
          <OrderFilterBar
            filters={filters}
            onChange={f => { setFilters(f); setPage(1); }}
            showStageFilter={true}
            showTypeFilter={true}
            placeholder="Search by KP (e.g. BQQS)..."
          />
          <Button
            size="sm"
            onClick={fetchOrders}
            className="h-8 w-8 p-0"
            style={{
              background: '#E0E5EC',
              color: '#6B7280',
              boxShadow: '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)',
              border: 'none',
            }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Table */}
        <div
          className="rounded-[32px] p-6 overflow-hidden"
          style={{
            background: '#E0E5EC',
            boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
          }}
        >
          <Table>
            <TableHeader>
              <TableRow
                style={{
                  background: '#E0E5EC',
                  borderBottom: '1px solid rgb(163 177 198 / 0.3)',
                }}
              >
                <TableHead className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Date</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>KP</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Construction</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Type</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Customer</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>TE</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Color</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Pipeline</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow
                  style={{
                    background: '#E0E5EC',
                    borderBottom: '1px solid rgb(163 177 198 / 0.3)',
                  }}
                >
                  <TableCell colSpan={8}
                    className="text-center text-sm py-16"
                    style={{ color: '#6B7280' }}
                  >
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map(row => (
                  <TableRow
                    key={row.id}
                    style={{
                      background: '#E0E5EC',
                      borderBottom: '1px solid rgb(163 177 198 / 0.3)',
                    }}
                    className="cursor-pointer transition-all duration-100 hover:translate-x-[2px]"
                    onClick={() =>
                      router.push(`/denim/orders/${row.kp}`)
                    }
                  >
                    <TableCell className="text-sm" style={{ color: '#6B7280' }}>
                      {formatDate(row.tgl)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-mono font-semibold"
                        style={{ color: '#3D4852' }}>
                        {row.kp}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm" style={{ color: '#3D4852' }}>
                      {row.codename || '—'}
                    </TableCell>
                    <TableCell>
                      {row.kat_kode && (
                        <span className={`inline-flex items-center rounded-[9999px] px-3 py-1 text-xs font-bold`}
                          style={{
                            background: '#E0E5EC',
                            color: '#3D4852',
                            boxShadow: '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)',
                          }}
                        >
                          {row.kat_kode}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm" style={{ color: '#6B7280' }}>
                      {row.permintaan || '—'}
                    </TableCell>
                    <TableCell className="text-sm font-mono"
                      style={{ color: '#6B7280' }}>
                      {row.te?.toLocaleString() || '—'}
                    </TableCell>
                    <TableCell className="text-sm" style={{ color: '#6B7280' }}>
                      {row.ket_warna || '—'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={row.pipeline_status || 'DRAFT'}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs" style={{ color: '#6B7280' }}>
              Page {page} of {totalPages}
              {' '}· {total.toLocaleString()} orders
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="h-7 text-xs"
                style={{
                  background: '#E0E5EC',
                  color: '#3D4852',
                  boxShadow: '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)',
                  border: 'none',
                }}
              >
                Previous
              </Button>
              <Button
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="h-7 text-xs"
                style={{
                  background: '#E0E5EC',
                  color: '#3D4852',
                  boxShadow: '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)',
                  border: 'none',
                }}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
