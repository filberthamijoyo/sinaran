'use client';

import { Input } from '../ui/input';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '../ui/select';
import { Button } from '../ui/button';
import { Search, ArrowUpDown, X } from 'lucide-react';

export type SortField = 'tgl' | 'kp' | 'codename' | 'permintaan' | 'te';
export type SortDir = 'asc' | 'desc';

export interface FilterState {
  search: string;        // KP search — startsWith + contains
  sortField: SortField;
  sortDir: SortDir;
  stage?: string;        // pipeline_status filter (optional)
  type?: string;         // kat_kode filter (optional)
}

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  showStageFilter?: boolean;
  showTypeFilter?: boolean;
  placeholder?: string;
}

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'tgl',       label: 'Date' },
  { value: 'kp',        label: 'KP' },
  { value: 'codename',  label: 'Construction' },
  { value: 'permintaan',label: 'Customer' },
  { value: 'te',        label: 'TE' },
];

const STAGES = [
  'ALL', 'DRAFT', 'PENDING_APPROVAL', 'REJECTED',
  'WARPING', 'INDIGO', 'WEAVING', 'INSPECT_GRAY', 'BBSF', 'INSPECT_FINISH', 'COMPLETE',
];

const TYPES = ['ALL', 'PO1', 'RP', 'SCN'];

export function defaultFilters(): FilterState {
  return {
    search: '',
    sortField: 'tgl',
    sortDir: 'desc',   // newest first by default
    stage: 'ALL',
    type: 'ALL',
  };
}

export default function OrderFilterBar({
  filters,
  onChange,
  showStageFilter = false,
  showTypeFilter = false,
  placeholder = 'Search by KP...',
}: Props) {
  const set = (patch: Partial<FilterState>) =>
    onChange({ ...filters, ...patch });

  const hasActiveFilters =
    filters.search !== '' ||
    filters.sortField !== 'tgl' ||
    filters.sortDir !== 'desc' ||
    (showStageFilter && filters.stage !== 'ALL') ||
    (showTypeFilter && filters.type !== 'ALL');

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2
          -translate-y-1/2 w-3.5 h-3.5
          pointer-events-none" style={{ color: '#9CA3AF' }} />
        <Input
          placeholder={placeholder}
          value={filters.search}
          onChange={e => set({ search: e.target.value })}
          className="pl-8 h-8 text-sm w-52"
          style={{
            background: '#E0E5EC',
            color: '#3D4852',
            boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
            border: 'none',
            borderRadius: '16px',
          }}
        />
        {filters.search && (
          <button
            onClick={() => set({ search: '' })}
            className="absolute right-2 top-1/2 -translate-y-1/2"
            style={{ color: '#9CA3AF' }}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Sort field */}
      <Select
        value={filters.sortField}
        onValueChange={v => set({ sortField: v as SortField })}
      >
        <SelectTrigger className="h-8 text-sm w-36"
          style={{
            background: '#E0E5EC',
            color: '#3D4852',
            boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
            border: 'none',
            borderRadius: '16px',
          }}
        >
          <ArrowUpDown className="w-3 h-3 mr-1.5 flex-shrink-0" style={{ color: '#9CA3AF' }} />
          <SelectValue />
        </SelectTrigger>
        <SelectContent style={{ background: '#E0E5EC', boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)', border: 'none', borderRadius: '16px' }}>
          {SORT_OPTIONS.map(o => (
            <SelectItem key={o.value} value={o.value} style={{ color: '#3D4852' }}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sort direction toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          set({ sortDir: filters.sortDir === 'desc' ? 'asc' : 'desc' })
        }
        className="h-8 px-3 text-xs gap-1.5"
        style={{
          background: '#E0E5EC',
          color: '#6B7280',
          boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
          border: 'none',
          borderRadius: '16px',
        }}
      >
        {filters.sortDir === 'desc' ? '↓ Newest' : '↑ Oldest'}
      </Button>

      {/* Stage filter (optional) */}
      {showStageFilter && (
        <Select
          value={filters.stage ?? 'ALL'}
          onValueChange={v => set({ stage: v })}
        >
          <SelectTrigger className="h-8 text-sm w-44"
            style={{
              background: '#E0E5EC',
              color: '#3D4852',
              boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
              border: 'none',
              borderRadius: '16px',
            }}
          >
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent style={{ background: '#E0E5EC', boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)', border: 'none', borderRadius: '16px' }}>
            {STAGES.map(s => (
              <SelectItem key={s} value={s} style={{ color: '#3D4852' }}>
                {s === 'ALL' ? 'All Stages'
                  : s.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Type filter (optional) */}
      {showTypeFilter && (
        <Select
          value={filters.type ?? 'ALL'}
          onValueChange={v => set({ type: v })}
        >
          <SelectTrigger className="h-8 text-sm w-32"
            style={{
              background: '#E0E5EC',
              color: '#3D4852',
              boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
              border: 'none',
              borderRadius: '16px',
            }}
          >
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent style={{ background: '#E0E5EC', boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)', border: 'none', borderRadius: '16px' }}>
            {TYPES.map(t => (
              <SelectItem key={t} value={t} style={{ color: '#3D4852' }}>
                {t === 'ALL' ? 'All Types' : t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Reset */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({
            search: '',
            sortField: 'tgl',
            sortDir: 'desc',
            stage: 'ALL',
            type: 'ALL',
          })}
          className="h-8 px-2 text-xs"
          style={{ color: '#9CA3AF' }}
        >
          Reset
        </Button>
      )}
    </div>
  );
}
