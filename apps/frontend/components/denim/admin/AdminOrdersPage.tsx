'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '../../../lib/authFetch';
import PageHeader from '../../layout/PageHeader';
import StatusBadge from '../../ui/StatusBadge';
import { Button } from '../../ui/button';
import { Skeleton } from '../../ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '../../ui/table';
import { RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import OrderFilterBar, {
  FilterState, defaultFilters,
} from '../OrderFilterBar';

type SC = {
  id: number;
  kp: string;
  tgl: string;
  codename: string | null;
  permintaan: string | null;
  kat_kode: string | null;
  ket_warna: string | null;
  status: string | null;
  te: number | null;
  acc: string | null;
  pipeline_status: string;
};

const STAGES = [
  'ALL', 'DRAFT', 'PENDING_APPROVAL', 'REJECTED',
  'WARPING', 'INDIGO', 'WEAVING', 'INSPECT_GRAY', 'COMPLETE',
];

const formatDate = (iso: string) => {
  try { return format(new Date(iso), 'd MMM yyyy'); }
  catch { return '—'; }
};

const TYPE_COLORS: Record<string, string> = {
  PO1: 'bg-blue-50 text-blue-700 border-blue-200',
  RP:  'bg-violet-50 text-violet-700 border-violet-200',
  SCN: 'bg-zinc-100 text-zinc-600 border-zinc-200',
};

interface Props {
  defaultStage?: string;
}

export default function AdminOrdersPage({ defaultStage = 'ALL' }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState<SC[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters(),
    stage: defaultStage,
  });
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
  useEffect(() => { setPage(1); }, [filters]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      <PageHeader
        title="All Orders"
        subtitle={`${total.toLocaleString()} total orders`}
        actions={
          <Button variant="outline" size="sm"
            onClick={fetchOrders}
            className="h-8 w-8 p-0">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        }
      />

      <div className="px-8 pb-8">

        {/* Filters */}
        <div className="flex items-center gap-2 mb-4">
          <OrderFilterBar
            filters={filters}
            onChange={f => { setFilters(f); setPage(1); }}
            showStageFilter={true}
            showTypeFilter={true}
            placeholder="Search by KP..."
          />
          <Button variant="outline" size="sm"
            onClick={fetchOrders}
            className="h-8 w-8 p-0">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border
          border-zinc-200/80 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50/80
                hover:bg-zinc-50/80">
                <TableHead className="text-xs font-semibold
                  text-zinc-500 w-28">Date</TableHead>
                <TableHead className="text-xs font-semibold
                  text-zinc-500 w-24">KP</TableHead>
                <TableHead className="text-xs font-semibold
                  text-zinc-500">Construction</TableHead>
                <TableHead className="text-xs font-semibold
                  text-zinc-500 w-16">Type</TableHead>
                <TableHead className="text-xs font-semibold
                  text-zinc-500">Customer</TableHead>
                <TableHead className="text-xs font-semibold
                  text-zinc-500 w-20">TE</TableHead>
                <TableHead className="text-xs font-semibold
                  text-zinc-500">Color</TableHead>
                <TableHead className="text-xs font-semibold
                  text-zinc-500 w-36">Stage</TableHead>
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
                <TableRow>
                  <TableCell colSpan={8}
                    className="text-center text-zinc-400
                      text-sm py-16">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map(row => (
                  <TableRow
                    key={row.id}
                    className="table-row-hover border-zinc-100"
                    onClick={() =>
                      router.push(`/denim/admin/orders/${row.kp}`)
                    }
                  >
                    <TableCell className="text-sm text-zinc-500">
                      {formatDate(row.tgl)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-mono
                        font-semibold text-zinc-800">
                        {row.kp}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-700">
                      {row.codename || '—'}
                    </TableCell>
                    <TableCell>
                      {row.kat_kode && (
                        <span className={`inline-flex items-center
                          rounded-md border px-2 py-0.5 text-xs
                          font-medium
                          ${TYPE_COLORS[row.kat_kode]
                            ?? 'bg-zinc-100 text-zinc-600'
                          }`}>
                          {row.kat_kode}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-600">
                      {row.permintaan || '—'}
                    </TableCell>
                    <TableCell className="text-sm font-mono
                      text-zinc-600">
                      {row.te?.toLocaleString() || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-600">
                      {row.ket_warna || '—'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={row.pipeline_status || 'DRAFT'}
                      />
                      {(() => {
                        const daysWaiting = row.tgl
                          ? Math.floor((Date.now() - new Date(row.tgl).getTime()) / (1000 * 60 * 60 * 24))
                          : 0;
                        const isStalled = row.pipeline_status === 'PENDING_APPROVAL' && daysWaiting > 30;
                        return isStalled ? (
                          <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                            🕐 Stalled {daysWaiting}d
                          </span>
                        ) : null;
                      })()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-zinc-500">
              Page {page} of {totalPages}
              {' '}· {total.toLocaleString()} orders
            </p>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="h-7 text-xs">
                Previous
              </Button>
              <Button variant="outline" size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="h-7 text-xs">
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
