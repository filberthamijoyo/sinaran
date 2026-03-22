'use client';

import { useEffect, useState, useCallback } from 'react';
import { authFetch } from '../../lib/authFetch';
import PageHeader from '../layout/PageHeader';
import StatusBadge from '../ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '../ui/table';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogDescription,
} from '../ui/dialog';
import { CheckCircle2, XCircle, Loader2, RefreshCw, ExternalLink } from 'lucide-react';
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
  PO1: 'text-[#6C63FF]',
  RP:  'text-[#6C63FF]',
  SCN: 'text-[#6B7280]',
};

export default function PendingApprovalsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<SC[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SC | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actioning, setActioning] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
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
    setRejectionReason('');
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
          body: JSON.stringify({ 
            decision,
            rejection_reason: decision === 'reject' ? rejectionReason : undefined,
          }),
        }
      );
      toast.success(
        decision === 'approve'
          ? `KP ${selected.kp} approved. Sent to warping.`
          : `KP ${selected.kp} rejected. Bandung notified.`
      );
      setDialogOpen(false);
      setSelected(null);
      setRejectionReason('');
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
            size="sm"
            onClick={fetchPending}
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
        }
      />

      <div className="px-4 sm:px-8 pb-8">
        <div className="mb-4">
          <OrderFilterBar
            filters={filters}
            onChange={setFilters}
            placeholder="Search by KP..."
          />
        </div>
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
                <TableHead className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9CA3AF' }}>Action</TableHead>
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
                <TableRow
                  style={{
                    background: '#E0E5EC',
                    borderBottom: '1px solid rgb(163 177 198 / 0.3)',
                  }}
                >
                  <TableCell colSpan={7}>
                    <div
                      className="flex flex-col items-center justify-center py-16"
                      style={{ color: '#6B7280' }}
                    >
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                        style={{
                          background: '#E0E5EC',
                          boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                        }}
                      >
                        <CheckCircle2 className="w-8 h-8" style={{ color: '#9CA3AF' }} />
                      </div>
                      <p className="text-sm font-medium" style={{ color: '#6B7280' }}>All caught up</p>
                      <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>No pending approvals at the moment</p>
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
                  >
                    <TableCell className="text-sm" style={{ color: '#6B7280' }}>{formatDate(row.tgl)}</TableCell>
                    <TableCell>
                      <span className="text-sm font-mono font-semibold" style={{ color: '#3D4852' }}>{row.kp}</span>
                    </TableCell>
                    <TableCell className="text-sm" style={{ color: '#3D4852' }}>{row.codename || '—'}</TableCell>
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
                    <TableCell className="text-sm" style={{ color: '#6B7280' }}>{row.permintaan || '—'}</TableCell>
                    <TableCell className="text-sm font-mono" style={{ color: '#6B7280' }}>{row.te?.toLocaleString() || '—'}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => openDialog(row)}
                        className="h-7 text-xs"
                        style={{
                          background: '#E0E5EC',
                          color: '#3D4852',
                          boxShadow: '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)',
                          border: 'none',
                        }}
                      >
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
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        if (!open) setRejectionReason('');
        setDialogOpen(open);
      }}>
        <DialogContent
          style={{
            background: '#E0E5EC',
            boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
            border: 'none',
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="font-mono" style={{ color: '#6C63FF' }}>{selected?.kp}</span>
              <span className="font-normal text-sm" style={{ color: '#6B7280' }}>— Review Order</span>
            </DialogTitle>
            <a
              href={`/denim/admin/orders/${selected?.kp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs hover:underline flex items-center gap-1"
              style={{ color: '#6C63FF' }}
            >
              View full order <ExternalLink className="w-3 h-3" />
            </a>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div
                className="rounded-lg p-4 grid grid-cols-2 gap-3 text-sm"
                style={{
                  background: '#E0E5EC',
                  boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                }}
              >
                <div>
                  <p className="text-xs mb-0.5" style={{ color: '#6B7280' }}>Construction</p>
                  <p className="font-medium" style={{ color: '#3D4852' }}>{selected.codename || '—'}</p>
                </div>
                <div>
                  <p className="text-xs mb-0.5" style={{ color: '#6B7280' }}>Type</p>
                  <p className="font-medium" style={{ color: '#3D4852' }}>{selected.status || '—'}</p>
                </div>
                <div>
                  <p className="text-xs mb-0.5" style={{ color: '#6B7280' }}>Customer</p>
                  <p className="font-medium" style={{ color: '#3D4852' }}>{selected.permintaan || '—'}</p>
                </div>
                <div>
                  <p className="text-xs mb-0.5" style={{ color: '#6B7280' }}>TE</p>
                  <p className="font-mono font-medium" style={{ color: '#3D4852' }}>{selected.te?.toLocaleString() || '—'}</p>
                </div>
                <div>
                  <p className="text-xs mb-0.5" style={{ color: '#6B7280' }}>Color</p>
                  <p className="font-medium" style={{ color: '#3D4852' }}>{selected.ket_warna || '—'}</p>
                </div>
                <div>
                  <p className="text-xs mb-0.5" style={{ color: '#6B7280' }}>Date</p>
                  <p className="font-medium" style={{ color: '#3D4852' }}>{formatDate(selected.tgl)}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: '#6B7280' }}>
                  Rejection Reason <span style={{ color: '#6B7280' }}>(optional)</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="e.g. Construction spec needs revision, wrong TE value..."
                  rows={3}
                  className="w-full text-sm rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2"
                  style={{
                    background: '#E0E5EC',
                    color: '#3D4852',
                    boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                    border: 'none',
                  }}
                />
              </div>

              <DialogDescription className="text-xs" style={{ color: '#6B7280' }}>
                Your decision will be immediately sent to the Bandung team. If approved, the order moves to the warping queue.
              </DialogDescription>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              disabled={!!actioning}
              onClick={() => handleDecision('reject')}
              style={{
                background: '#E0E5EC',
                color: '#DC2626',
                boxShadow: '5px 5px 10px rgb(163 177 198 / 0.6), -5px -5px 10px rgba(255,255,255,0.5)',
                border: 'none',
              }}
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
              style={{
                background: '#16A34A',
                color: '#FFFFFF',
                border: 'none',
              }}
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
