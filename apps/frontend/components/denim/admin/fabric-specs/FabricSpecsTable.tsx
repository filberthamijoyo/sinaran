'use client';

import { useEffect, useState, useCallback, CSSProperties } from 'react';
import { authFetch } from '../../../../lib/authFetch';
import PageHeader from '../../../layout/PageHeader';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Skeleton } from '../../../ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '../../../ui/table';
import { Search, Plus, Edit3, Inbox } from 'lucide-react';
import type { FabricSpec } from './types';

const KAT_KODE_OPTIONS = ['SC', 'WS', 'Other'];

const CATEGORY_COLORS: Record<string, CSSProperties> = {
  SC:    { background: '#EFF6FF', color: '#1D4ED8' },
  WS:    { background: '#F0FDFA', color: '#0891B2' },
  Other: { background: '#F9FAFB', color: '#6B7280' },
};

function getCategoryColor(kat_kode: string | null): CSSProperties {
  if (!kat_kode) return CATEGORY_COLORS.Other;
  return CATEGORY_COLORS[kat_kode] || CATEGORY_COLORS.Other;
}

type Props = {
  rows: FabricSpec[];
  loading: boolean;
  search: string;
  katKode: string;
  onSearchChange: (v: string) => void;
  onKatKodeChange: (v: string) => void;
  onRefresh: () => void;
  onEdit: (spec: FabricSpec) => void;
  onNew: () => void;
};

export function FabricSpecsTable({
  rows, loading, search, katKode, onSearchChange, onKatKodeChange, onRefresh, onEdit, onNew,
}: Props) {
  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <Input
            placeholder="Search by item, kons_kode, kode..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <Select value={katKode} onValueChange={onKatKodeChange}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {KAT_KODE_OPTIONS.map(opt => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={onNew}
          className="ml-auto h-9 px-4 text-sm bg-[#1D4ED8] text-white border-none rounded-lg">
          <Plus className="w-4 h-4 mr-1.5" />
          New Spec
        </Button>
      </div>

      <div className="rounded-xl overflow-hidden bg-white border border-[#E5E7EB]">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#E5E7EB]">
              {['Item', 'Category', 'TE', 'Ne Lusi / Ne Pakan', 'Sisir / Pick', 'Warna', 'Used In', ''].map((h, i) => (
                <TableHead key={i} className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <div className="flex flex-col items-center justify-center py-16 text-[#6B7280]">
                    <Inbox className="w-10 h-10 mb-3" />
                    <p className="text-sm font-medium">No fabric specs found</p>
                    <p className="text-xs mt-1">Try adjusting your search</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              rows.map(spec => (
                <TableRow key={spec.id}
                  className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB] transition-colors"
                >
                  <TableCell>
                    <div className="font-medium text-sm text-[#0F1117]">{spec.item}</div>
                    <div className="text-xs text-[#6B7280]">{spec.kons_kode}</div>
                  </TableCell>
                  <TableCell>
                    <span style={getCategoryColor(spec.kat_kode)} className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold">
                      {spec.kat_kode || '—'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-[#6B7280]">{spec.te ?? '—'}</TableCell>
                  <TableCell className="text-sm text-[#6B7280]">
                    {spec.lusi_ne || '—'} / {spec.pakan_ne || '—'}
                  </TableCell>
                  <TableCell className="text-sm text-[#6B7280]">
                    {spec.sisir || '—'} / {spec.pick ?? '—'}
                  </TableCell>
                  <TableCell className="text-sm text-[#6B7280]">{spec.warna || '—'}</TableCell>
                  <TableCell>
                    {spec.usage_count > 0 ? (
                      <span style={{
                        backgroundColor: '#EFF6FF',
                        color: '#1D4ED8',
                        borderRadius: 12,
                        padding: '2px 8px',
                        fontSize: 12,
                        fontWeight: 600,
                      }}>
                        {spec.usage_count}
                      </span>
                    ) : (
                      <span style={{ fontSize: 13, color: '#9CA3AF' }}>0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(spec)}
                      className="h-7 px-2 text-[#6B7280]">
                      <Edit3 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
