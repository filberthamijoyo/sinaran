'use client';
import { useEffect, useState, useCallback } from 'react';
import { authFetch } from '../../../../lib/authFetch';
import PageHeader from '../../../../components/layout/PageHeader';
import StatusBadge from '../../../../components/ui/StatusBadge';
import { Skeleton } from '../../../../components/ui/skeleton';
import { Button } from '../../../../components/ui/button';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '../../../../components/ui/table';
import { RefreshCw, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function RejectedPage() {
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authFetch(
        '/denim/sales-contracts?pipeline_status=REJECTED&limit=100'
      ) as any;
      setRows(data?.items || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const fmt = (iso: string) => {
    try { return format(new Date(iso), 'd MMM yyyy'); }
    catch { return '—'; }
  };

  return (
    <div>
      <PageHeader
        title="Rejected Orders"
        subtitle={`${rows.length} orders sent back to Bandung`}
        actions={
          <Button variant="outline" size="sm"
            onClick={fetch_} className="h-8 w-8 p-0">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        }
      />
      <div className="px-8 pb-8">
        <div className="bg-white rounded-xl border
          border-zinc-200/80 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50/80 hover:bg-zinc-50/80">
                <TableHead className="text-xs font-semibold text-zinc-500">Date</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500">KP</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500">Construction</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500">Customer</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500">TE</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500">Stage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <XCircle className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
                    <p className="text-sm text-zinc-400">No rejected orders.</p>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row: any) => (
                  <TableRow
                    key={row.id}
                    className="table-row-hover border-zinc-100"
                    onClick={() => router.push(`/denim/orders/${row.kp}`)}
                  >
                    <TableCell className="text-sm text-zinc-500">{fmt(row.tgl)}</TableCell>
                    <TableCell>
                      <span className="text-sm font-mono font-semibold text-zinc-800">
                        {row.kp}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-zinc-700">{row.codename || '—'}</TableCell>
                    <TableCell className="text-sm text-zinc-600">{row.permintaan || '—'}</TableCell>
                    <TableCell className="text-sm font-mono text-zinc-600">
                      {row.te?.toLocaleString() || '—'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={row.pipeline_status || 'REJECTED'} />
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
