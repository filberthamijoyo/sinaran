'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { apiCall } from '../lib/api';
import { toYMD, toStr } from '../lib/utils';
import type { BaseGridRow, DataGridConfig, FilterState, PaginationState, RowStatus } from '../lib/types';

const PAGE_SIZE = 10;

export const useDataGrid = (config: DataGridConfig) => {
  const [rows, setRows] = useState<BaseGridRow[]>([config.createEmptyRow()]);
  const [filters, setFilters] = useState<FilterState>({});
  const [activeCell, setActiveCell] = useState({ rowIndex: 0, colIndex: 0 });
  const [pendingFocus, setPendingFocus] = useState<{ rowIndex: number; colIndex: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingRowId, setSavingRowId] = useState<string | null>(null);
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
    return rows.filter((row) => {
      // Date filtering
      if (config.dateField) {
        if (filters.dateFrom && row[config.dateField] && String(row[config.dateField]) < filters.dateFrom) {
          return false;
        }
        if (filters.dateTo && row[config.dateField] && String(row[config.dateField]) > filters.dateTo) {
          return false;
        }
      }

      // Other filters
      Object.keys(filters).forEach((key) => {
        if (key === 'dateFrom' || key === 'dateTo') return;
        if (filters[key]) {
          const rowValue = toStr(row[key]).toLowerCase();
          if (!rowValue.includes(filters[key].toLowerCase())) {
            return false;
          }
        }
      });

      return true;
    });
  }, [rows, filters, config.dateField]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPageIndex = Math.min(pageIndex, totalPages - 1);
  const pageStart = currentPageIndex * PAGE_SIZE;
  const pageEnd = pageStart + PAGE_SIZE;
  const visibleRows = filteredRows.slice(pageStart, pageEnd);

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      // Skip API call if endpoint is not configured
      if (!config.apiEndpoint) {
        setRows([config.createEmptyRow()]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const params = new URLSearchParams({
          limit: '200',
          page: '1',
        });

        if (config.dateField) {
          if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
          if (filters.dateTo) params.append('dateTo', filters.dateTo);
        }

        Object.keys(filters).forEach((key) => {
          if (key !== 'dateFrom' && key !== 'dateTo' && filters[key]) {
            params.append(key, filters[key]);
          }
        });

        const response = (await apiCall(`${config.apiEndpoint}/records?${params.toString()}`)) as {
          records?: unknown[];
        };
        const records = response.records || [];

        const mappedRows = records.map((record: Record<string, unknown>) => {
          return config.mapRecordToRow(record);
        });

        setRows(mappedRows.length > 0 ? [config.createEmptyRow(), ...mappedRows] : [config.createEmptyRow()]);
      } catch (err) {
        console.error('Error loading records:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [config.apiEndpoint, filters, config.dateField]);

  // Focus management
  useEffect(() => {
    if (!pendingFocus) return;
    const { rowIndex, colIndex } = pendingFocus;
    const selector = `[data-row="${rowIndex}"][data-col="${colIndex}"]`;
    const el = document.querySelector(selector);
    if (el && el instanceof HTMLElement) {
      el.focus();
    }
    setPendingFocus(null);
  }, [pendingFocus, visibleRows.length, pageStart]);

  const handleFilterChange = useCallback((field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  const addRow = useCallback(() => {
    setRows((prev) => [config.createEmptyRow(), ...prev]);
    setPageIndex(0);
  }, [config]);

  const updateRow = useCallback((rowIndex: number, updater: BaseGridRow | ((row: BaseGridRow) => BaseGridRow)) => {
    setRows((prev) => {
      const next = [...prev];
      const original = next[rowIndex];
      const updated = typeof updater === 'function' ? updater(original) : updater;
      next[rowIndex] = {
        ...updated,
        _status: original._status === 'new' ? 'new' : 'dirty',
      };
      return next;
    });
  }, []);

  const handleCellChange = useCallback((rowIndex: number, columnId: string, value: string) => {
    updateRow(rowIndex, (row) => ({
      ...row,
      [columnId]: value,
      _error: '',
    }));
  }, [updateRow]);

  const focusCell = useCallback((rowIndex: number, colIndex: number) => {
    setActiveCell({ rowIndex, colIndex });
    setPendingFocus({ rowIndex, colIndex });
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, rowIndex: number, colIndex: number) => {
      const { key } = event;
      const lastRowIndex = rows.length - 1;
      const lastColIndex = config.columns.length - 1;

      if (key === 'ArrowRight') {
        event.preventDefault();
        const nextCol = Math.min(colIndex + 1, lastColIndex);
        focusCell(rowIndex, nextCol);
      } else if (key === 'ArrowLeft') {
        event.preventDefault();
        const prevCol = Math.max(colIndex - 1, 0);
        focusCell(rowIndex, prevCol);
      } else if (key === 'ArrowDown') {
        event.preventDefault();
        const nextRow = Math.min(rowIndex + 1, lastRowIndex);
        focusCell(nextRow, colIndex);
      } else if (key === 'ArrowUp') {
        event.preventDefault();
        const prevRow = Math.max(rowIndex - 1, 0);
        focusCell(prevRow, colIndex);
      } else if (key === 'Enter') {
        if (rowIndex === lastRowIndex && colIndex === lastColIndex) {
          event.preventDefault();
          addRow();
          setPendingFocus({ rowIndex: 0, colIndex: 0 });
        } else {
          event.preventDefault();
          const nextCol = colIndex === lastColIndex ? 0 : colIndex + 1;
          const nextRow = colIndex === lastColIndex ? Math.min(rowIndex + 1, lastRowIndex) : rowIndex;
          focusCell(nextRow, nextCol);
        }
      }
    },
    [rows.length, config.columns.length, focusCell, addRow],
  );

  const saveRow = useCallback(
    async (rowIndex: number) => {
      const row = rows[rowIndex];
      if (!row) return;

      // Validate required fields
      if (config.requiredFields) {
        for (const field of config.requiredFields) {
          if (!row[field]) {
            setRows((prev) => {
              const next = [...prev];
              next[rowIndex] = {
                ...row,
                _status: row._status,
                _error: `${field} is required`,
              };
              return next;
            });
            return;
          }
        }
      }

      setSavingRowId(row._localId);
      setRows((prev) => {
        const next = [...prev];
        next[rowIndex] = { ...row, _status: 'saving', _error: '' };
        return next;
      });

      // If no API endpoint, just mark as clean locally
      if (!config.apiEndpoint) {
        setRows((prev) => {
          const next = [...prev];
          const updated = { ...row };
          updated._status = 'clean';
          updated._error = '';
          next[rowIndex] = updated;

          const isLastRow = rowIndex === prev.length - 1;
          if (isLastRow) {
            next.push(config.createEmptyRow());
          }

          return next;
        });
        setSavingRowId(null);
        return;
      }

      try {
        const payload = config.buildSubmitPayload(row);
        const isNew = !row.id;
        const url = isNew ? `${config.apiEndpoint}/records` : `${config.apiEndpoint}/records/${row.id}`;
        const method = isNew ? 'POST' : 'PUT';

        const saved = (await apiCall(url, { method, body: payload })) as { id: number };

        setRows((prev) => {
          const next = [...prev];
          const updated = { ...row };
          updated.id = saved.id;
          updated._status = 'clean';
          updated._error = '';
          next[rowIndex] = updated;

          const isLastRow = rowIndex === prev.length - 1;
          if (isLastRow) {
            next.push(config.createEmptyRow());
          }

          return next;
        });
      } catch (err) {
        console.error('Error saving row:', err);
        setRows((prev) => {
          const next = [...prev];
          next[rowIndex] = {
            ...row,
            _status: 'error',
            _error: err instanceof Error ? err.message : 'Failed to save row',
          };
          return next;
        });
      } finally {
        setSavingRowId(null);
      }
    },
    [rows, config],
  );

  return {
    rows,
    filteredRows,
    visibleRows,
    filters,
    loading,
    savingRowId,
    activeCell,
    groupHeaderCells,
    pagination: {
      pageIndex: currentPageIndex,
      totalPages,
      pageStart,
      pageEnd,
      setPageIndex,
    },
    handlers: {
      handleFilterChange,
      addRow,
      handleCellChange,
      handleKeyDown,
      saveRow,
      focusCell,
    },
  };
};
