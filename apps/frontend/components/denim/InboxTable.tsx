'use client';

import { useRouter } from 'next/navigation';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from '../ui/table';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';
import { ChevronRight, Inbox } from 'lucide-react';

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

const TYPE_COLORS: Record<string, string> = {
  PO1: 'bg-blue-50 text-blue-700 border-blue-200',
  RP:  'bg-violet-50 text-violet-700 border-violet-200',
  SCN: 'bg-zinc-100 text-zinc-600 border-zinc-200',
};

export default function InboxTable({
  rows,
  loading,
  formBasePath,
  emptyMessage = 'No orders in this queue.',
}: InboxTableProps) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-xl border border-zinc-200/80
      shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-zinc-50/80 hover:bg-zinc-50/80">
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
              text-zinc-500 w-24">TE</TableHead>
            <TableHead className="text-xs font-semibold
              text-zinc-500">Color</TableHead>
            <TableHead className="w-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
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
                className="text-center py-20">
                <Inbox className="w-8 h-8 text-zinc-200
                  mx-auto mb-3" />
                <p className="text-sm text-zinc-400">
                  {emptyMessage}
                </p>
              </TableCell>
            </TableRow>
          ) : (
            rows.map(row => (
              <TableRow
                key={row.id}
                className="table-row-hover border-zinc-100"
                onClick={() =>
                  router.push(`${formBasePath}/${row.kp}`)
                }
              >
                <TableCell className="text-sm text-zinc-500">
                  {formatDate(row.tgl)}
                </TableCell>
                <TableCell>
                  <span className="text-sm font-mono font-semibold
                    text-zinc-800">
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
                        ?? 'bg-zinc-100 text-zinc-600 border-zinc-200'
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
                  <ChevronRight className="w-4 h-4 text-zinc-300" />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
