'use client';

/**
 * @deprecated Indigo division now follows the List + Form UX:
 * - `/indigo` → `IndigoListPage`
 * - `/indigo/new` and `/indigo/edit/[id]` → `IndigoFormPage`
 *
 * This legacy DataGrid-based rapid entry page is kept for reference only.
 */
import React, { useState, useEffect } from 'react';
import { DataGrid } from './ui/DataGrid';
import { API_ENDPOINTS, apiCall } from '../lib/api';
import { toYMD, toStr, generateLocalId } from '../lib/utils';
import type { DataGridConfig, BaseGridRow } from '../lib/types';
import { INDIGO_COLUMNS, INDIGO_COLUMN_GROUPS } from './indigoConfig';

const API_BASE_URL = API_ENDPOINTS.indigo;

const createEmptyRow = (): BaseGridRow => {
  const base: BaseGridRow = {
    _localId: generateLocalId(),
    _status: 'new',
    _error: '',
    id: null,
  };

  INDIGO_COLUMNS.forEach((col) => {
    base[col.id] = '';
  });

  return base;
};

const mapRecordToRow = (record: Record<string, unknown>): BaseGridRow => {
  const row = createEmptyRow();
  row._localId = `existing-${record.id}`;
  row._status = 'clean';
  row.id = record.id as number;

  INDIGO_COLUMNS.forEach((col) => {
    if (col.id === 'tanggal') {
      row.tanggal = toYMD(record.tanggal as any);
    } else {
      row[col.id] = toStr(record[col.id]);
    }
  });

  return row;
};

const buildSubmitPayload = (row: BaseGridRow): Record<string, unknown> => {
  const payload: Record<string, unknown> = {};
  INDIGO_COLUMNS.forEach((col) => {
    payload[col.id] = row[col.id] ?? '';
  });
  return payload;
};

function IndigoDivisionPage() {
  const [countDescriptions, setCountDescriptions] = useState<Array<{ code: string; name: string }>>([]);

  useEffect(() => {
    const fetchCountDescriptions = async () => {
      try {
        const response = (await apiCall(
          `${API_ENDPOINTS.unified}/count-descriptions`,
        )) as Array<{ code: string; name: string }>;
        setCountDescriptions(response || []);
      } catch (err) {
        console.error('Error loading count descriptions:', err);
      }
    };

    fetchCountDescriptions();
  }, []);

  const config: DataGridConfig = {
    columns: INDIGO_COLUMNS,
    columnGroups: INDIGO_COLUMN_GROUPS,
    apiEndpoint: API_BASE_URL,
    dateField: 'tanggal',
    requiredFields: ['tanggal'],
    createEmptyRow,
    mapRecordToRow,
    buildSubmitPayload,
  };

  const filterFields = [
    { id: 'dateFrom', label: 'Date from', type: 'date' as const },
    { id: 'dateTo', label: 'Date to', type: 'date' as const },
    {
      id: 'countDescriptionCode',
      label: 'Filter by NE',
      type: 'select' as const,
      options: [
        { value: '', label: 'All NE' },
        ...countDescriptions.map((cd) => ({ value: cd.code, label: cd.name })),
      ],
    },
  ];

  return (
    <DataGrid
      config={config}
      title="Indigo Division – Rapid Data Entry"
      description="Excel-style grid optimised for keyboard-only input. Use arrow keys, Tab, and Enter to move between cells."
      filterFields={filterFields}
    />
  );
}

export default IndigoDivisionPage;
