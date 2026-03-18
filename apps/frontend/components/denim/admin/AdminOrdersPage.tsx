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

const TYPE_COLORS: Record<string, string> = {
  PO1: 'bg-indigo-500/10 text-indigo-400',
  RP:  'bg-violet-500/10 text-violet-400',
  SCN: '',
};

const stageBadge = (status: string) => {
  const map: Record<string, string> = {
    PENDING_APPROVAL: 'bg-amber-500/10 text-amber-400',
    WARPING:   'bg-indigo-500/10 text-indigo-400',
    INDIGO:    'bg-cyan-500/10 text-cyan-400',
    WEAVING:   'bg-emerald-500/10 text-emerald-400',
    INSPECT_GRAY: 'bg-orange-500/10 text-orange-400',
    COMPLETE:  'bg-emerald-500/10 text-emerald-400',
    REJECTED:  'bg-red-500/10 text-red-400',
  };
  const label: Record<string, string> = {
    PENDING_APPROVAL: 'Pending', WARPING: 'Warping',
    INDIGO: 'Indigo', WEAVING: 'Weaving', INSPECT_GRAY: 'Inspect',
    COMPLETE: 'Complete', REJECTED: 'Rejected',
  };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-[9999px] text-xs font-medium"
      style={{
        background: '#E0E5EC',
        color: '#3D4852',
        boxShadow: '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)',
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

        {/* Table */}
        <div
          className="rounded-[32px] p-6 overflow-x-auto"
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
                <TableHead
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: '#9CA3AF' }}
                >
                  Date
                </TableHead>
                <TableHead
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: '#9CA3AF' }}
                >
                  KP
                </TableHead>
                <TableHead
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: '#9CA3AF' }}
                >
                  Construction
                </TableHead>
                <TableHead
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: '#9CA3AF' }}
                >
                  Type
                </TableHead>
                <TableHead
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: '#9CA3AF' }}
                >
                  Customer
                </TableHead>
                <TableHead
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: '#9CA3AF' }}
                >
                  TE
                </TableHead>
                <TableHead
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: '#9CA3AF' }}
                >
                  Color
                </TableHead>
                <TableHead
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: '#9CA3AF' }}
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
                      borderBottom: '1px solid rgb(163 177 198 / 0.3)',
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
                    borderBottom: '1px solid rgb(163 177 198 / 0.3)',
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
                      borderBottom: '1px solid rgb(163 177 198 / 0.3)',
                    }}
                    className="cursor-pointer transition-all duration-100 hover:translate-y-[-1px]"
                    onClick={() =>
                      router.push(`/denim/admin/orders/${row.kp}`)
                    }
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
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

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
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
                  boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
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
                  boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
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
