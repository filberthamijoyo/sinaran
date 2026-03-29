'use client';

import { useCallback, useEffect, useRef } from 'react';
import { apiCall } from '../lib/api';
import type { BaseGridRow, DataGridConfig } from '../lib/types';
import { useDataGridState } from './useDataGridState';
import { useDataGridKeyboard } from './useDataGridKeyboard';

export interface UseDataGridReturn {
  rows: BaseGridRow[];
  filteredRows: BaseGridRow[];
  visibleRows: BaseGridRow[];
  filters: ReturnType<typeof useDataGridState>['filters']['get'];
  loading: boolean;
  savingRowId: string | null;
  activeCell: { rowIndex: number; colIndex: number };
  groupHeaderCells: Array<{ label: string; colSpan: number }>;
  pagination: ReturnType<typeof useDataGridState>['pagination'];
  handlers: {
    handleFilterChange: (field: string, value: string) => void;
    addRow: () => void;
    handleCellChange: (rowIndex: number, columnId: string, value: string) => void;
    handleKeyDown: (event: React.KeyboardEvent, rowIndex: number, colIndex: number) => void;
    saveRow: (rowIndex: number) => Promise<void>;
    focusCell: (rowIndex: number, colIndex: number) => void;
  };
}

export const useDataGrid = (config: DataGridConfig): UseDataGridReturn => {
  const state = useDataGridState(config);
  const configRef = useRef(config);
  configRef.current = config;

  // Keep refs to state setters for use in callbacks
  const setRowsRef = useRef(state.rows.set);
  const setFiltersRef = useRef(state.filters.set);
  const setActiveCellRef = useRef(state.activeCell.set);
  const setPendingFocusRef = useRef(state.pendingFocus.set);
  const setLoadingRef = useRef(state.loading.set);
  const setSavingRowIdRef = useRef(state.savingRowId.set);

  // Update refs when they change
  useEffect(() => {
    setRowsRef.current = state.rows.set;
    setFiltersRef.current = state.filters.set;
    setActiveCellRef.current = state.activeCell.set;
    setPendingFocusRef.current = state.pendingFocus.set;
    setLoadingRef.current = state.loading.set;
    setSavingRowIdRef.current = state.savingRowId.set;
  }, [state.rows.set, state.filters.set, state.activeCell.set, state.pendingFocus.set, state.loading.set, state.savingRowId.set]);

  // Focus management
  useEffect(() => {
    const pendingFocus = state.pendingFocus.get;
    if (!pendingFocus) return;
    const { rowIndex, colIndex } = pendingFocus;
    const selector = `[data-row="${rowIndex}"][data-col="${colIndex}"]`;
    const el = document.querySelector(selector);
    if (el && el instanceof HTMLElement) {
      el.focus();
    }
  }, [state.pendingFocus.get, state.visibleRows.length, state.pagination.pageStart]);

  const focusCell = useCallback((rowIndex: number, colIndex: number) => {
    setActiveCellRef.current({ rowIndex, colIndex });
    setPendingFocusRef.current({ rowIndex, colIndex });
  }, []);

  const handleFilterChange = useCallback((field: string, value: string) => {
    setFiltersRef.current((prev) => ({ ...prev, [field]: value }));
  }, []);

  const addRow = useCallback(() => {
    setRowsRef.current((prev) => [configRef.current.createEmptyRow(), ...prev]);
    state.pagination.setPageIndex(0);
  }, [state.pagination]);

  const updateRow = useCallback((rowIndex: number, updater: BaseGridRow | ((row: BaseGridRow) => BaseGridRow)) => {
    setRowsRef.current((prev) => {
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

  const handleKeyDown = useDataGridKeyboard({
    rowsCount: state.rows.get.length,
    columnsCount: config.columns.length,
    focusCell,
    addRow,
  });

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      if (!config.apiEndpoint) {
        setRowsRef.current([configRef.current.createEmptyRow()]);
        setLoadingRef.current(false);
        return;
      }

      try {
        setLoadingRef.current(true);
        const params = new URLSearchParams({
          limit: '200',
          page: '1',
        });

        const filters = state.filters.get;
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

        const mappedRows = (records as Record<string, unknown>[]).map((record) => {
          return configRef.current.mapRecordToRow(record);
        });

        setRowsRef.current(mappedRows.length > 0 ? [configRef.current.createEmptyRow(), ...mappedRows] : [configRef.current.createEmptyRow()]);
      } catch (err) {
        console.error('Error loading records:', err);
      } finally {
        setLoadingRef.current(false);
      }
    };

    fetchData();
  }, [config.apiEndpoint, state.filters.get, config.dateField]);

  const saveRow = useCallback(
    async (rowIndex: number) => {
      const rows = state.rows.get;
      const row = rows[rowIndex];
      if (!row) return;

      if (config.requiredFields) {
        for (const field of config.requiredFields) {
          if (!row[field as keyof BaseGridRow]) {
            setRowsRef.current((prev) => {
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

      setSavingRowIdRef.current(row._localId);
      setRowsRef.current((prev) => {
        const next = [...prev];
        next[rowIndex] = { ...row, _status: 'saving', _error: '' };
        return next;
      });

      if (!config.apiEndpoint) {
        setRowsRef.current((prev) => {
          const next = [...prev];
          const updated = { ...row };
          updated._status = 'clean';
          updated._error = '';
          next[rowIndex] = updated;

          const isLastRow = rowIndex === prev.length - 1;
          if (isLastRow) {
            next.push(configRef.current.createEmptyRow());
          }

          return next;
        });
        setSavingRowIdRef.current(null);
        return;
      }

      try {
        const payload = config.buildSubmitPayload(row);
        const isNew = !row.id;
        const url = isNew ? `${config.apiEndpoint}/records` : `${config.apiEndpoint}/records/${row.id}`;
        const method = isNew ? 'POST' : 'PUT';

        const saved = (await apiCall(url, { method, body: payload })) as { id: number };

        setRowsRef.current((prev) => {
          const next = [...prev];
          const updated = { ...row };
          updated.id = saved.id;
          updated._status = 'clean';
          updated._error = '';
          next[rowIndex] = updated;

          const isLastRow = rowIndex === prev.length - 1;
          if (isLastRow) {
            next.push(configRef.current.createEmptyRow());
          }

          return next;
        });
      } catch (err) {
        console.error('Error saving row:', err);
        setRowsRef.current((prev) => {
          const next = [...prev];
          next[rowIndex] = {
            ...row,
            _status: 'error',
            _error: err instanceof Error ? err.message : 'Failed to save row',
          };
          return next;
        });
      } finally {
        setSavingRowIdRef.current(null);
      }
    },
    [state.rows.get, config],
  );

  return {
    rows: state.rows.get,
    filteredRows: state.filteredRows,
    visibleRows: state.visibleRows,
    filters: state.filters.get,
    loading: state.loading.get,
    savingRowId: state.savingRowId.get,
    activeCell: state.activeCell.get,
    groupHeaderCells: state.groupHeaderCells,
    pagination: state.pagination,
    handlers: {
      handleFilterChange,
      addRow,
      handleCellChange,
      handleKeyDown: handleKeyDown.handleKeyDown,
      saveRow,
      focusCell,
    },
  };
};
