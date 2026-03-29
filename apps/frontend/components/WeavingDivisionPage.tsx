'use client';

import React, { useState, useMemo } from 'react';
import { DataGrid } from './ui/DataGrid';
import { toYMD, toStr, generateLocalId } from '../lib/utils';
import type { DataGridConfig, BaseGridRow } from '../lib/types';

// Weaving grid columns based on Triputra Datalog (WV)(Production).csv
export const WEAVING_BASE_COLUMNS = [
  // Identity / setup
  { id: 'tanggal', label: 'TANGGAL', width: 160, type: 'date' as const, placeholder: 'YYYY-MM-DD' },
  { id: 'shift', label: 'SHIFT', width: 90, type: 'text' as const },
  { id: 'machine', label: 'MACHINE', width: 120, type: 'text' as const },
  { id: 'kp', label: 'KP', width: 110, type: 'text' as const },
  { id: 'warpSupplier', label: 'WARP SUPPLIER', width: 150, type: 'text' as const },
  { id: 'sizing', label: 'SIZING', width: 130, type: 'text' as const },
  { id: 'beam', label: 'BEAM', width: 110, type: 'number' as const },
  { id: 'kodeKain', label: 'KODE KAIN', width: 170, type: 'text' as const },
  { id: 'operator', label: 'OPERATOR', width: 160, type: 'text' as const },

  // Performance / efficiency
  { id: 'aPercent', label: 'A%', width: 110, type: 'number' as const },
  { id: 'pPercent', label: 'P%', width: 110, type: 'number' as const },
  { id: 'rpm', label: 'RPM', width: 120, type: 'number' as const },
  { id: 'kpicks', label: 'KPICKS', width: 130, type: 'number' as const },
  { id: 'meters', label: 'METERS', width: 130, type: 'number' as const },

  // Warp stops
  { id: 'warpNo', label: 'WARP NO', width: 120, type: 'number' as const },
  { id: 'warpStopPerHour', label: 'WARP STOP/HR', width: 150, type: 'number' as const },
  { id: 'warpStop', label: 'WARP/STOP', width: 130, type: 'number' as const },

  // Weft stops
  { id: 'weftNo', label: 'WEFT NO', width: 120, type: 'number' as const },
  { id: 'weftStopPerHour', label: 'WEFT STOP/HR', width: 150, type: 'number' as const },
  { id: 'weftStop', label: 'WEFT/STOP', width: 130, type: 'number' as const },

  // Bobbin stops
  { id: 'bobbinNo', label: 'BOBBIN NO', width: 130, type: 'number' as const },
  { id: 'bobbinStopPerHour', label: 'BOBBIN STOP/HR', width: 160, type: 'number' as const },
  { id: 'bobbinStop', label: 'BOBBIN/STOP', width: 130, type: 'number' as const },

  // Stattempt stops
  { id: 'stattemptNo', label: 'STATTEMPT NO', width: 150, type: 'number' as const },
  { id: 'stattemptStopPerHour', label: 'STATTEMPT STOP/HR', width: 190, type: 'number' as const },
  { id: 'stattemptStop', label: 'STATTEMPT/STOP', width: 150, type: 'number' as const },

  // Other / long stops
  { id: 'otherStopsNo', label: 'OTHER STOPS NO', width: 170, type: 'number' as const },
  { id: 'otherStopsTime', label: 'OTHER STOPS TIME', width: 170, type: 'text' as const, placeholder: 'HH:MM' },
  { id: 'longStopsNo', label: 'LONG STOPS NO', width: 160, type: 'number' as const },
  { id: 'longStopsTime', label: 'LONG STOPS TIME', width: 160, type: 'text' as const, placeholder: 'HH:MM' },

  // Derived metrics
  { id: 'ms', label: 'M/S', width: 110, type: 'number' as const },
  { id: 'bPerHour', label: 'B/HR', width: 110, type: 'number' as const },

  // Misc
  { id: 'merk', label: 'MERK', width: 140, type: 'text' as const },
  { id: 'area', label: 'AREA', width: 120, type: 'text' as const },
];

// Extra Triputra raw efficiency percentage columns (read-only, optional)
export const WEAVING_TRIPUTRA_COLUMNS = [
  { id: 'aPercentTriputra', label: 'A% (Triputra)', width: 130, type: 'number' as const, readOnly: true },
  { id: 'pPercentTriputra', label: 'P% (Triputra)', width: 130, type: 'number' as const, readOnly: true },
  { id: 'warpPercentTriputra', label: 'WARP% (Triputra)', width: 150, type: 'number' as const, readOnly: true },
  { id: 'weftPercentTriputra', label: 'WEFT% (Triputra)', width: 150, type: 'number' as const, readOnly: true },
  { id: 'bobbinPercentTriputra', label: 'BOBBIN% (Triputra)', width: 170, type: 'number' as const, readOnly: true },
  { id: 'osPercentTriputra', label: 'OS% (Triputra)', width: 130, type: 'number' as const, readOnly: true },
  { id: 'lsPercentTriputra', label: 'LS% (Triputra)', width: 130, type: 'number' as const, readOnly: true },
];

const createEmptyRow = (): BaseGridRow => {
  const now = new Date();
  const base: BaseGridRow = {
    _localId: generateLocalId('NEW'),
    _status: 'new',
    _error: '',
    id: null,
  };

  [...WEAVING_BASE_COLUMNS, ...WEAVING_TRIPUTRA_COLUMNS].forEach((col) => {
    if (col.id === 'tanggal') {
      base[col.id] = toYMD(now);
    } else {
      base[col.id] = '';
    }
  });

  return base;
};

const mapRecordToRow = (record: Record<string, unknown>): BaseGridRow => {
  const row = createEmptyRow();
  row._localId = `existing-${record.id}`;
  row._status = 'clean';
  row.id = record.id as number;

  [...WEAVING_BASE_COLUMNS, ...WEAVING_TRIPUTRA_COLUMNS].forEach((col) => {
    if (col.id === 'tanggal') {
      row.tanggal = toYMD(record.tanggal as Date | string | null | undefined);
    } else {
      row[col.id] = toStr(record[col.id]);
    }
  });

  return row;
};

const buildSubmitPayload = (row: BaseGridRow): Record<string, unknown> => {
  const payload: Record<string, unknown> = {};
  [...WEAVING_BASE_COLUMNS, ...WEAVING_TRIPUTRA_COLUMNS].forEach((col) => {
    payload[col.id] = row[col.id] ?? '';
  });
  return payload;
};

function WeavingDivisionPage() {
  const [showTriputraRaw, setShowTriputraRaw] = useState(false);

  const weavingColumns = useMemo(
    () => (showTriputraRaw ? [...WEAVING_BASE_COLUMNS, ...WEAVING_TRIPUTRA_COLUMNS] : WEAVING_BASE_COLUMNS),
    [showTriputraRaw]
  );

  const columnGroups = useMemo(() => {
    return [
      {
        label: 'WEAVING PRODUCTION (TRIPUTRA DATALOG WV – PRODUCTION)',
        children: weavingColumns.map((col) => col.id),
      },
    ];
  }, [weavingColumns]);

  const config: DataGridConfig = useMemo(
    () => ({
      columns: weavingColumns,
      columnGroups,
      // No API endpoint - local-only mode
      dateField: 'tanggal',
      requiredFields: ['tanggal'],
      createEmptyRow,
      mapRecordToRow,
      buildSubmitPayload,
    }),
    [weavingColumns, columnGroups]
  );

  const filterFields = [
    { id: 'dateFrom', label: 'Date from', type: 'date' as const },
    { id: 'dateTo', label: 'Date to', type: 'date' as const },
  ];

  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end', padding: '0 1rem' }}>
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={showTriputraRaw}
            onChange={(e) => setShowTriputraRaw(e.target.checked)}
          />
          Show raw Triputra %
        </label>
      </div>
      <DataGrid
        config={config}
        title="Weaving Division – Rapid Data Entry"
        description="Excel-style grid optimised for keyboard-only input. Use arrow keys, Tab, and Enter to move between cells."
        filterFields={filterFields}
      />
    </div>
  );
}

export default WeavingDivisionPage;
