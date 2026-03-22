'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '../../../lib/authFetch';
import PageHeader from '../../layout/PageHeader';
import { Button } from '../../ui/button';
import { Skeleton } from '../../ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '../../ui/table';
import { RefreshCw, Inbox } from 'lucide-react';
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

const stageBadge = (status: string) => {
  const label: Record<string, string> = {
    PENDING_APPROVAL: 'Pending', WARPING: 'Warping',
    INDIGO: 'Indigo', WEAVING: 'Weaving', INSPECT_GRAY: 'Inspect',
    COMPLETE: 'Complete', REJECTED: 'Rejected',
  };
  const bgMap: Record<string, string> = {
    PENDING_APPROVAL: 'rgba(217, 119, 6, 0.15)',
    WARPING: 'rgba(108, 99, 255, 0.15)',
    INDIGO: 'rgba(6, 182, 212, 0.15)',
    WEAVING: 'rgba(22, 163, 74, 0.15)',
    INSPECT_GRAY: 'rgba(249, 115, 22, 0.15)',
    COMPLETE: 'rgba(22, 163, 74, 0.15)',
    REJECTED: 'rgba(220, 38, 38, 0.15)',
  };
  const colorMap: Record<string, string> = {
    PENDING_APPROVAL: '#D97706',
    WARPING: '#6C63FF',
    INDIGO: '#06B6D4',
    WEAVING: '#16A34A',
    INSPECT_GRAY: '#F97316',
    COMPLETE: '#16A34A',
    REJECTED: '#DC2626',
  };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-[9999px] text-xs font-medium"
      style={{
        background: bgMap[status] ?? 'rgba(163, 177, 198, 0.2)',
        color: colorMap[status] ?? '#6B7280',
        boxShadow: '3px 3px 6px rgb(163 177 198 / 0.5), -3px -3px 6px rgba(255,255,255,0.5)',
      }}
    >
      {label[status] ?? status}
    </span>
  );
};

interface Props {
  defaultStage?: string;
  initialData?: {
    items: SC[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export default function AdminOrdersPage({ defaultStage = 'ALL', initialData }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState<SC[]>(initialData?.items ?? []);
  const [loading, setLoading] = useState(!initialData);
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters(),
    stage: defaultStage,
  });
  const [page, setPage] = useState(initialData ? 1 : 1);
  const [total, setTotal] = useState(initialData?.pagination?.total ?? 0);
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

  useEffect(() => {
    if (!initialData) {
      fetchOrders();
    }
  }, [fetchOrders, initialData]);

  useEffect(() => {
    if (!initialData || page > 1) {
      fetchOrders();
    }
  }, [page]);

  useEffect(() => { setPage(1); }, [filters]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      <PageHeader
        title="All Orders"
        subtitle={`${total.toLocaleString()} orders`}
        actions={
          <Button
            size="sm"
            onClick={fetchOrders}
            className="h-8 w-8 p-0"
            style={{
              background: '#E0E5EC',
              borderRadius: '16px',
              boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
            }}
          >
            <RefreshCw className="w-3.5 h-3.5" style={{ color: '#6B7280' }} />
          </Button>
        }
      />

      <div className="px-4 sm:px-8 pb-8">

        {/* Filters */}
        <div className="pt-4 flex items-center gap-2 mb-4">
          <OrderFilterBar
            filters={filters}
            onChange={f => { setFilters(f); setPage(1); }}
            showStageFilter={true}
            showTypeFilter={true}
            placeholder="Search by KP..."
          />
          <Button
            size="sm"
            onClick={fetchOrders}
            className="h-8 w-8 p-0"
            style={{
              background: '#E0E5EC',
              borderRadius: '16px',
              boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
            }}
          >
            <RefreshCw className="w-3.5 h-3.5" style={{ color: '#6B7280' }} />
          </Button>
        </div>

        {totalPages > 1 && (
          <div
            className="flex items-center justify-between mt-4"
            style={{
              background: '#E0E5EC',
              borderRadius: '16px',
              padding: '10px 16px',
              boxShadow: '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)',
            }}
          >
            <p className="text-xs" style={{ color: '#9CA3AF' }}>
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
                  borderRadius: '16px',
                  boxShadow: '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)',
                  color: '#3D4852',
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
                  borderRadius: '16px',
                  boxShadow: '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)',
                  color: '#3D4852',
                }}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div
          style={{
            background: '#E0E5EC',
            boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
            borderRadius: '32px',
            overflow: 'hidden',
          }}
        >
          <Table>
            <TableHeader>
              <TableRow
                style={{ background: '#E0E5EC' }}
              >
                <TableHead
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ background: '#E0E5EC', color: '#9CA3AF' }}
                >
                  Date
                </TableHead>
                <TableHead
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ background: '#E0E5EC', color: '#9CA3AF' }}
                >
                  KP
                </TableHead>
                <TableHead
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ background: '#E0E5EC', color: '#9CA3AF' }}
                >
                  Construction
                </TableHead>
                <TableHead
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ background: '#E0E5EC', color: '#9CA3AF' }}
                >
                  Type
                </TableHead>
                <TableHead
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ background: '#E0E5EC', color: '#9CA3AF' }}
                >
                  Customer
                </TableHead>
                <TableHead
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ background: '#E0E5EC', color: '#9CA3AF' }}
                >
                  TE
                </TableHead>
                <TableHead
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ background: '#E0E5EC', color: '#9CA3AF' }}
                >
                  Color
                </TableHead>
                <TableHead
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ background: '#E0E5EC', color: '#9CA3AF' }}
                >
                  Stage
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow
                    key={i}
                    style={{
                      background: '#E0E5EC',
                      borderBottom: '1px solid rgb(163 177 198 / 0.4)',
                    }}
                  >
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton
                          className="h-4 w-full"
                          style={{
                            background: '#E0E5EC',
                            boxShadow: '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)',
                          }}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow
                  style={{
                    background: '#E0E5EC',
                    borderBottom: '1px solid rgb(163 177 198 / 0.4)',
                  }}
                >
                  <TableCell colSpan={8}>
                    <div
                      className="flex flex-col items-center justify-center py-16"
                      style={{ color: '#6B7280' }}
                    >
                      <Inbox className="w-10 h-10 mb-3" style={{ color: '#9CA3AF' }} />
                      <p className="text-sm font-medium" style={{ color: '#6B7280' }}>No orders found</p>
                      <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Try adjusting your filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map(row => (
                  <TableRow
                    key={row.id}
                    style={{
                      background: '#E0E5EC',
                      borderBottom: '1px solid rgb(163 177 198 / 0.4)',
                    }}
                    className="cursor-pointer transition-all duration-100"
                    onClick={() =>
                      router.push(`/denim/admin/orders/${row.kp}`)
                    }
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)';
                      e.currentTarget.style.transform = 'translateX(2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateX(0px)';
                    }}
                  >
                    <TableCell className="text-sm" style={{ color: '#6B7280' }}>
                      {formatDate(row.tgl)}
                    </TableCell>
                    <TableCell>
                      <span
                        className="font-mono font-semibold text-sm tracking-wide"
                        style={{ color: '#6C63FF' }}
                      >
                        {row.kp}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm" style={{ color: '#3D4852' }}>
                      {row.codename || '—'}
                    </TableCell>
                    <TableCell>
                      {row.kat_kode && (
                        <span
                          className="inline-flex items-center rounded-[9999px] px-3 py-1 text-xs font-bold"
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
                    <TableCell className="text-sm font-mono" style={{ color: '#6B7280' }}>
                      {row.te?.toLocaleString() || '—'}
                    </TableCell>
                    <TableCell className="text-sm" style={{ color: '#6B7280' }}>
                      {row.ket_warna || '—'}
                    </TableCell>
                    <TableCell>
                      {stageBadge(row.pipeline_status || 'DRAFT')}
                      {(() => {
                        const daysWaiting = row.tgl
                          ? Math.floor((Date.now() - new Date(row.tgl).getTime()) / (1000 * 60 * 60 * 24))
                          : 0;
                        const isStalled = row.pipeline_status === 'PENDING_APPROVAL' && daysWaiting > 30;
                        return isStalled ? (
                          <span
                            className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-[9999px] text-xs font-bold"
                            style={{
                              background: '#E0E5EC',
                              color: '#D97706',
                              boxShadow: '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)',
                            }}
                          >
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

      </div>
    </div>
  );
}
