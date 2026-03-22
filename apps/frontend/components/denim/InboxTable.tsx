'use client';

import { useRouter } from 'next/navigation';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '../ui/table';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';
import { ChevronRight, Inbox, CheckCircle2 } from 'lucide-react';

export type InboxRow = {
  id: number;
  kp: string;
  tgl: string;
  codename: string | null;
  permintaan: string | null;
  kat_kode: string | null;
  ket_warna: string | null;
  te: number | null;
  pipeline_status: string;
};

interface InboxTableProps {
  rows: InboxRow[];
  loading: boolean;
  formBasePath: string;
  // e.g. '/denim/inbox/warping' — row click goes to
  // formBasePath/[kp]
  emptyMessage?: string;
}

const formatDate = (iso: string) => {
  try { return format(new Date(iso), 'd MMM yyyy'); }
  catch { return '—'; }
};

export default function InboxTable({
  rows,
  loading,
  formBasePath,
  emptyMessage = 'No orders in this queue.',
}: InboxTableProps) {
  const router = useRouter();

  return (
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
            <TableHead className="w-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
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
                  className="flex flex-col items-center justify-center py-20 gap-3"
                  style={{ color: '#6B7280' }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: '#E0E5EC',
                      boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                    }}
                  >
                    <CheckCircle2 className="w-6 h-6" style={{ color: '#9CA3AF' }} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: '#6B7280' }}>
                    Queue is clear
                  </p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>
                    No orders waiting in this stage.
                  </p>
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
                  router.push(`${formBasePath}/${row.kp}`)
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
                    className="text-sm font-mono font-semibold"
                    style={{ color: '#3D4852' }}
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
                  <ChevronRight className="w-4 h-4" style={{ color: '#9CA3AF' }} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
