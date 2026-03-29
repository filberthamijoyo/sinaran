'use client';

import { Search, ArrowUpDown, X } from 'lucide-react';

export type SortField = 'tgl' | 'kp' | 'codename' | 'permintaan' | 'te';
export type SortDir = 'asc' | 'desc';

export interface FilterState {
  search: string;
  sortField: SortField;
  sortDir: SortDir;
  stage?: string;
  type?: string;
}

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  showStageFilter?: boolean;
  showTypeFilter?: boolean;
  placeholder?: string;
}

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'tgl',        label: 'Date' },
  { value: 'kp',         label: 'KP' },
  { value: 'codename',   label: 'Construction' },
  { value: 'permintaan', label: 'Customer' },
  { value: 'te',         label: 'TE' },
];

const STAGES = [
  'ALL', 'DRAFT', 'PENDING_APPROVAL', 'REJECTED',
  'WARPING', 'INDIGO', 'WEAVING', 'INSPECT_GRAY', 'BBSF', 'INSPECT_FINISH', 'COMPLETE',
];

const TYPES = ['ALL', 'PO1', 'RP', 'SCN'];

const STAGE_LABELS: Record<string, string> = {
  ALL: 'All Stages',
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'Pending Approval',
  REJECTED: 'Rejected',
  WARPING: 'Warping',
  INDIGO: 'Indigo',
  WEAVING: 'Weaving',
  INSPECT_GRAY: 'Inspect Gray',
  BBSF: 'BBSF',
  INSPECT_FINISH: 'Inspect Finish',
  COMPLETE: 'Complete',
};

export function defaultFilters(): FilterState {
  return {
    search: '',
    sortField: 'tgl',
    sortDir: 'desc',
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
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search
          size={14}
          style={{
            position: 'absolute',
            left: 9,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--t3)',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          placeholder={placeholder}
          value={filters.search}
          onChange={e => set({ search: e.target.value })}
          style={{
            height: 30,
            paddingLeft: 30,
            paddingRight: filters.search ? 30 : 10,
            fontSize: 12,
            borderRadius: 'var(--r2)',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--t1)',
            width: 208,
            outline: 'none',
            transition: 'border-color 0.12s, box-shadow 0.12s',
            boxShadow: 'var(--shadow-xs)',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = 'var(--blue)';
            e.currentTarget.style.boxShadow = 'var(--shadow-blue)';
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
          }}
        />
        {filters.search && (
          <button
            onClick={() => set({ search: '' })}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--t3)',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Sort field */}
      <select
        value={filters.sortField}
        onChange={e => set({ sortField: e.target.value as SortField })}
        style={{
          height: 30,
          padding: '0 10px',
          fontSize: 12,
          borderRadius: 'var(--r2)',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--t1)',
          cursor: 'pointer',
          outline: 'none',
          boxShadow: 'var(--shadow-xs)',
          minWidth: 144,
        }}
      >
        {SORT_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Sort direction toggle */}
      <button
        onClick={() => set({ sortDir: filters.sortDir === 'desc' ? 'asc' : 'desc' })}
        style={{
          height: 30,
          padding: '0 10px',
          fontSize: 11,
          fontWeight: 500,
          borderRadius: 'var(--r2)',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--t2)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          boxShadow: 'var(--shadow-xs)',
          transition: 'all 0.1s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)';
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-2)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'var(--surface)';
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
        }}
      >
        <ArrowUpDown size={12} />
        {filters.sortDir === 'desc' ? '↓ Newest' : '↑ Oldest'}
      </button>

      {/* Stage filter */}
      {showStageFilter && (
        <select
          value={filters.stage ?? 'ALL'}
          onChange={e => set({ stage: e.target.value })}
          style={{
            height: 30,
            padding: '0 10px',
            fontSize: 12,
            borderRadius: 'var(--r2)',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--t1)',
            cursor: 'pointer',
            outline: 'none',
            boxShadow: 'var(--shadow-xs)',
            minWidth: 176,
          }}
        >
          {STAGES.map(s => (
            <option key={s} value={s}>{STAGE_LABELS[s] ?? s.replace('_', ' ')}</option>
          ))}
        </select>
      )}

      {/* Type filter */}
      {showTypeFilter && (
        <select
          value={filters.type ?? 'ALL'}
          onChange={e => set({ type: e.target.value })}
          style={{
            height: 30,
            padding: '0 10px',
            fontSize: 12,
            borderRadius: 'var(--r2)',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--t1)',
            cursor: 'pointer',
            outline: 'none',
            boxShadow: 'var(--shadow-xs)',
            minWidth: 128,
          }}
        >
          {TYPES.map(t => (
            <option key={t} value={t}>{t === 'ALL' ? 'All Types' : t}</option>
          ))}
        </select>
      )}

      {/* Reset */}
      {hasActiveFilters && (
        <button
          onClick={() => onChange({
            search: '',
            sortField: 'tgl',
            sortDir: 'desc',
            stage: 'ALL',
            type: 'ALL',
          })}
          style={{
            height: 30,
            padding: '0 8px',
            fontSize: 11,
            borderRadius: 'var(--r2)',
            border: 'none',
            background: 'transparent',
            color: 'var(--t3)',
            cursor: 'pointer',
            transition: 'color 0.1s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--t2)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--t3)'; }}
        >
          Reset
        </button>
      )}
    </div>
  );
}
