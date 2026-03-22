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
import { RefreshCw, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function ApprovedPage() {
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      // ACC = approved, fetch all non-PENDING, non-DRAFT, non-REJECTED
      const data = await authFetch(
        '/denim/sales-contracts?acc=ACC&limit=100'
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
        title="Approved Orders"
        subtitle={`${rows.length} orders approved and in production`}
        actions={
          <Button variant="outline" size="sm"
            onClick={fetch_} className="h-8 w-8 p-0">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        }
      />
      <div className="px-4 sm:px-8 pb-8">
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
              <TableRow style={{ background: '#E0E5EC', borderBottom: '1px solid rgb(163 177 198 / 0.3)' }}>
                <TableHead className="text-xs font-semibold" style={{ background: '#E0E5EC', color: '#9CA3AF' }}>Date</TableHead>
                <TableHead className="text-xs font-semibold" style={{ background: '#E0E5EC', color: '#9CA3AF' }}>KP</TableHead>
                <TableHead className="text-xs font-semibold" style={{ background: '#E0E5EC', color: '#9CA3AF' }}>Construction</TableHead>
                <TableHead className="text-xs font-semibold" style={{ background: '#E0E5EC', color: '#9CA3AF' }}>Customer</TableHead>
                <TableHead className="text-xs font-semibold" style={{ background: '#E0E5EC', color: '#9CA3AF' }}>TE</TableHead>
                <TableHead className="text-xs font-semibold" style={{ background: '#E0E5EC', color: '#9CA3AF' }}>Stage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} style={{ background: '#E0E5EC', borderBottom: '1px solid rgb(163 177 198 / 0.3)' }}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" style={{ background: '#E0E5EC', boxShadow: 'inset 3px 3px 6px rgb(163 177 198 / 0.6), inset -3px -3px 6px rgba(255,255,255,0.5)' }} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow style={{ background: '#E0E5EC', borderBottom: '1px solid rgb(163 177 198 / 0.3)' }}>
                  <TableCell colSpan={6} className="text-center py-16">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2" style={{ color: '#9CA3AF' }} />
                    <p className="text-sm" style={{ color: '#6B7280' }}>No approved orders yet.</p>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row: any) => (
                  <TableRow
                    key={row.id}
                    style={{
                      background: '#E0E5EC',
                      borderBottom: '1px solid rgb(163 177 198 / 0.3)',
                      cursor: 'pointer',
                    }}
                    onClick={() => router.push(`/denim/orders/${row.kp}`)}
                  >
                    <TableCell className="text-sm" style={{ color: '#6B7280' }}>{fmt(row.tgl)}</TableCell>
                    <TableCell>
                      <span className="text-sm font-mono font-semibold" style={{ color: '#6C63FF' }}>
                        {row.kp}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm" style={{ color: '#3D4852' }}>{row.codename || '—'}</TableCell>
                    <TableCell className="text-sm" style={{ color: '#6B7280' }}>{row.permintaan || '—'}</TableCell>
                    <TableCell className="text-sm font-mono" style={{ color: '#6B7280' }}>
                      {row.te?.toLocaleString() || '—'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={row.pipeline_status || 'APPROVED'} />
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
