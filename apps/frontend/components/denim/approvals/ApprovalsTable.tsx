'use client';

import { useState, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '../../ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

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

interface ApprovalsTableProps {
  rows: SC[];
  loading: boolean;
  selectedKps: Set<string>;
  onSelectionChange: (kps: Set<string>) => void;
  onOpenReview: (sc: SC) => void;
}

export default function ApprovalsTable({
  rows, loading, selectedKps, onSelectionChange, onOpenReview,
}: ApprovalsTableProps) {
  const allKs = rows.map(r => r.kp);
  const allSelected = allKs.length > 0 && allKs.every(kp => selectedKps.has(kp));
  const someSelected = allKs.some(kp => selectedKps.has(kp));

  const toggleAll = () => {
    if (allSelected) onSelectionChange(new Set());
    else onSelectionChange(new Set(allKs));
  };

  const toggleRow = (kp: string) => {
    const next = new Set(selectedKps);
    if (next.has(kp)) next.delete(kp); else next.add(kp);
    onSelectionChange(next);
  };

  return (
    <div className="rounded-xl overflow-hidden bg-white border border-[#E5E7EB]">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-[#E5E7EB]">
            <TableHead className="w-10 bg-white">
              <input
                type="checkbox"
                checked={allSelected}
                ref={el => { if (el) el.indeterminate = someSelected && !allSelected; }}
                onChange={toggleAll}
                className="w-4 h-4 cursor-pointer"
                style={{ accentColor: '#1D4ED8' }}
                aria-label="Select all"
              />
            </TableHead>
            {['Date', 'KP', 'Construction', 'Type', 'Customer', 'TE', 'Action'].map(h => (
              <TableHead key={h} className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] bg-white">
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="border-b border-[#E5E7EB]">
                {Array.from({ length: 8 }).map((_, j) => (
                  <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8}>
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 bg-[#F7F8FA] border border-[#E5E7EB]">
                    <CheckCircle2 className="w-8 h-8 text-[#6B7280]" />
                  </div>
                  <p className="text-sm font-medium text-[#0F1117]">All caught up</p>
                  <p className="text-xs mt-1 text-[#6B7280]">No pending approvals at the moment</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            rows.map(row => (
              <TableRow
                key={row.id}
                className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB] transition-colors"
              >
                <TableCell className="w-10">
                  <input
                    type="checkbox"
                    checked={selectedKps.has(row.kp)}
                    onChange={() => toggleRow(row.kp)}
                    className="w-4 h-4 cursor-pointer"
                    style={{ accentColor: '#1D4ED8' }}
                    aria-label={`Select ${row.kp}`}
                  />
                </TableCell>
                <TableCell className="text-sm text-[#6B7280]">{formatDate(row.tgl)}</TableCell>
                <TableCell>
                  <span className="text-sm font-mono font-semibold text-[#1D4ED8]">{row.kp}</span>
                </TableCell>
                <TableCell className="text-sm text-[#0F1117]">{row.codename || '—'}</TableCell>
                <TableCell>
                  {row.kat_kode && (
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#EFF6FF] text-[#1D4ED8]">
                      {row.kat_kode}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-[#6B7280]">{row.permintaan || '—'}</TableCell>
                <TableCell className="text-sm font-mono text-[#6B7280]">{row.te?.toLocaleString() || '—'}</TableCell>
                <TableCell>
                  <Button size="sm" variant="secondary" onClick={() => onOpenReview(row)}>
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
