'use client';

import { useEffect, useState, useCallback } from 'react';
import { authFetch } from '../../lib/authFetch';
import PageHeader from '../layout/PageHeader';
import StatusBadge from '../ui/StatusBadge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '../ui/table';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '../ui/dialog';
import { CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '../../lib/AuthContext';
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
  status: string | null;
  te: number | null;
  ket_warna: string | null;
  pipeline_status: string;
};

const formatDate = (iso: string) => {
  try { return format(new Date(iso), 'd MMM yyyy'); }
  catch { return '—'; }
};

const SC_TYPE_COLORS: Record<string, string> = {
  PO1: 'bg-blue-50 text-blue-700 border-blue-200',
  RP:  'bg-violet-50 text-violet-700 border-violet-200',
  SCN: 'bg-zinc-100 text-zinc-600 border-zinc-200',
};

export default function PendingApprovalsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<SC[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SC | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actioning, setActioning] = useState<'approve' | 'reject' | null>(null);
  const [filters, setFilters] = useState<FilterState>(defaultFilters());

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        pipeline_status: 'PENDING_APPROVAL',
        limit: '100',
        sortField: filters.sortField,
        sortDir: filters.sortDir,
      });
      if (filters.search) params.set('kp', filters.search);
      const data = await authFetch(
        `/denim/sales-contracts?${params}`
      ) as any;
      setRows(data?.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const openDialog = (sc: SC) => {
    setSelected(sc);
    setDialogOpen(true);
  };

  const handleDecision = async (decision: 'approve' | 'reject') => {
    if (!selected) return;
    setActioning(decision);
    try {
      await authFetch(
        `/denim/sales-contracts/${selected.kp}/decision`,
        {
          method: 'POST',
          body: JSON.stringify({ decision }),
        }
      );
      toast.success(
        decision === 'approve'
          ? `KP ${selected.kp} approved. Sent to warping.`
          : `KP ${selected.kp} rejected. Bandung notified.`
      );
      setDialogOpen(false);
      setSelected(null);
      fetchPending();
    } catch (err: any) {
      toast.error(err.message || 'Action failed.');
    } finally {
      setActioning(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Pending Approvals"
        subtitle={`${rows.length} orders awaiting your review`}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPending}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        }
      />

      <div className="px-8 pb-8">
        <div className="mb-4">
          <OrderFilterBar
            filters={filters}
            onChange={setFilters}
            placeholder="Search by KP..."
          />
        </div>
        <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50/80 hover:bg-zinc-50/80">
                <TableHead className="text-xs font-semibold text-zinc-500 w-28">Date</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 w-24">KP</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500">Construction</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 w-20">Type</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500">Customer</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 w-20">TE</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500 w-28">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16">
                    <CheckCircle2 className="w-8 h-8 text-green-300 mx-auto mb-2" />
                    <p className="text-sm text-zinc-400">All caught up — no pending approvals.</p>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map(row => (
                  <TableRow key={row.id} className="border-zinc-100">
                    <TableCell className="text-sm text-zinc-500">{formatDate(row.tgl)}</TableCell>
                    <TableCell>
                      <span className="text-sm font-mono font-semibold text-zinc-800">{row.kp}</span>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-700">{row.codename || '—'}</TableCell>
                    <TableCell>
                      {row.kat_kode && (
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${SC_TYPE_COLORS[row.kat_kode] ?? 'bg-zinc-100 text-zinc-600 border-zinc-200'}`}>
                          {row.kat_kode}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-600">{row.permintaan || '—'}</TableCell>
                    <TableCell className="text-sm font-mono text-zinc-600">{row.te?.toLocaleString() || '—'}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => openDialog(row)} className="h-7 text-xs border-zinc-200 hover:border-zinc-300">
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Review dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="font-mono text-blue-600">{selected?.kp}</span>
              <span className="text-zinc-400 font-normal text-sm">— Review Order</span>
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Construction</p>
                  <p className="font-medium text-zinc-800">{selected.codename || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Type</p>
                  <p className="font-medium text-zinc-800">{selected.status || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Customer</p>
                  <p className="font-medium text-zinc-800">{selected.permintaan || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">TE</p>
                  <p className="font-mono font-medium text-zinc-800">{selected.te?.toLocaleString() || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Color</p>
                  <p className="font-medium text-zinc-800">{selected.ket_warna || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Date</p>
                  <p className="font-medium text-zinc-800">{formatDate(selected.tgl)}</p>
                </div>
              </div>

              <p className="text-xs text-zinc-500">
                Your decision will be immediately sent to the Bandung team. If approved, the order moves to the warping queue.
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              disabled={!!actioning}
              className="flex-1 border-red-200 text-red-600
                hover:bg-red-50 hover:text-red-700 hover:border-red-300"
              onClick={() => handleDecision('reject')}
            >
              {actioning === 'reject' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-1.5" />
                  Reject
                </>
              )}
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-500 text-white"
              disabled={!!actioning}
              onClick={() => handleDecision('approve')}
            >
              {actioning === 'approve' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Approve
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
