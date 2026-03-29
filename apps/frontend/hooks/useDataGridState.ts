'use client';

import { useState, useMemo, useCallback } from 'react';
import type { BaseGridRow, DataGridConfig, FilterState } from '../lib/types';
import { toStr } from '../lib/utils';

const PAGE_SIZE = 10;

interface RowsState {
  get: BaseGridRow[];
  set: React.Dispatch<React.SetStateAction<BaseGridRow[]>>;
}

interface FiltersState {
  get: FilterState;
  set: React.Dispatch<React.SetStateAction<FilterState>>;
}

interface ActiveCellState {
  get: { rowIndex: number; colIndex: number };
  set: React.Dispatch<React.SetStateAction<{ rowIndex: number; colIndex: number }>>;
}

interface PendingFocusState {
  get: { rowIndex: number; colIndex: number } | null;
  set: React.Dispatch<React.SetStateAction<{ rowIndex: number; colIndex: number } | null>>;
}

interface LoadingState {
  get: boolean;
  set: React.Dispatch<React.SetStateAction<boolean>>;
}

interface SavingRowIdState {
  get: string | null;
  set: React.Dispatch<React.SetStateAction<string | null>>;
}

export interface DataGridStateReturn {
  rows: RowsState;
  filteredRows: BaseGridRow[];
  visibleRows: BaseGridRow[];
  filters: FiltersState;
  loading: LoadingState;
  savingRowId: SavingRowIdState;
  activeCell: ActiveCellState;
  pendingFocus: PendingFocusState;
  pageIndex: number;
  groupHeaderCells: Array<{ label: string; colSpan: number }>;
  pagination: {
    pageIndex: number;
    totalPages: number;
    pageStart: number;
    pageEnd: number;
    setPageIndex: React.Dispatch<React.SetStateAction<number>>;
  };
}

export const useDataGridState = (config: DataGridConfig): DataGridStateReturn => {
  const [rowsState, setRows] = useState<BaseGridRow[]>([config.createEmptyRow()]);
  const [filtersState, setFilters] = useState<FilterState>({});
  const [activeCellState, setActiveCell] = useState({ rowIndex: 0, colIndex: 0 });
  const [pendingFocusState, setPendingFocus] = useState<{ rowIndex: number; colIndex: number } | null>(null);
  const [loadingState, setLoading] = useState(false);
  const [savingRowIdState, setSavingRowId] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);

  // Compute group header cells
  const groupHeaderCells = useMemo(() => {
    if (!config.columnGroups || config.columnGroups.length === 0) return [];

    const indexToGroup: Record<number, string> = {};
    config.columnGroups.forEach((group) => {
      group.children.forEach((childId) => {
        const colIndex = config.columns.findIndex((c) => c.id === childId);
        if (colIndex !== -1) {
          indexToGroup[colIndex] = group.label;
        }
      });
    });

    const cells: Array<{ label: string; colSpan: number }> = [];
    let i = 0;
    while (i < config.columns.length) {
      const groupLabel = indexToGroup[i];
      if (groupLabel) {
        let span = 0;
        while (i + span < config.columns.length && indexToGroup[i + span] === groupLabel) {
          span += 1;
        }
        cells.push({ label: groupLabel, colSpan: span });
        i += span;
      } else {
        let span = 0;
        while (i + span < config.columns.length && !indexToGroup[i + span]) {
          span += 1;
        }
        cells.push({ label: '', colSpan: span });
        i += span;
      }
    }

    return cells;
  }, [config.columns, config.columnGroups]);

  // Filter rows
  const filteredRows = useMemo(() => {
    return rowsState.filter((row) => {
      if (config.dateField) {
        if (filtersState.dateFrom && row[config.dateField] && String(row[config.dateField]) < filtersState.dateFrom) {
          return false;
        }
        if (filtersState.dateTo && row[config.dateField] && String(row[config.dateField]) > filtersState.dateTo) {
          return false;
        }
      }

      Object.keys(filtersState).forEach((key) => {
        if (key === 'dateFrom' || key === 'dateTo') return;
        if (filtersState[key]) {
          const rowValue = toStr(row[key]).toLowerCase();
          if (!rowValue.includes(filtersState[key].toLowerCase())) {
            return false;
          }
        }
      });

      return true;
    });
  }, [rowsState, filtersState, config.dateField]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPageIndex = Math.min(pageIndex, totalPages - 1);
  const pageStart = currentPageIndex * PAGE_SIZE;
  const pageEnd = pageStart + PAGE_SIZE;
  const visibleRows = filteredRows.slice(pageStart, pageEnd);

  return {
    rows: { get: rowsState, set: setRows },
    filteredRows,
    visibleRows,
    filters: { get: filtersState, set: setFilters },
    loading: { get: loadingState, set: setLoading },
    savingRowId: { get: savingRowIdState, set: setSavingRowId },
    activeCell: { get: activeCellState, set: setActiveCell },
    pendingFocus: { get: pendingFocusState, set: setPendingFocus },
    pageIndex,
    groupHeaderCells,
    pagination: {
      pageIndex: currentPageIndex,
      totalPages,
      pageStart,
      pageEnd,
      setPageIndex,
    },
  };
};
