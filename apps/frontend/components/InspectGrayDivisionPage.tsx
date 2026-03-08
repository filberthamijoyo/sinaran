'use client';

import React, { useState, useEffect } from 'react';
import { DataGrid } from './ui/DataGrid';
import { API_ENDPOINTS } from '../lib/api';
import { toYMD, toStr, generateLocalId } from '../lib/utils';
import type { DataGridConfig, BaseGridRow } from '../lib/types';

const API_BASE_URL = API_ENDPOINTS.inspectGray || `${API_ENDPOINTS.quality}/inspect-gray`;

// Inspect Gray grid columns based on LAPORAN IP GREIGE 26.csv
const INSPECT_GRAY_COLUMNS = [
  // Leading metadata / identification columns
  { id: 'n', label: 'N', width: 80, type: 'text' as const },
  { id: 'tanggal', label: 'TG', width: 140, type: 'date' as const, placeholder: 'YYYY-MM-DD' },
  { id: 'kp', label: 'KP', width: 140, type: 'text' as const },
  { id: 'd', label: 'D', width: 260, type: 'text' as const },
  { id: 'mc', label: 'MC', width: 110, type: 'text' as const },
  { id: 'bm', label: 'BM', width: 110, type: 'number' as const },
  { id: 'sn1', label: 'SN', width: 140, type: 'text' as const },
  { id: 'sn2', label: 'SN2', width: 200, type: 'text' as const },
  { id: 'gd', label: 'GD', width: 90, type: 'text' as const },
  { id: 'bme', label: 'BME', width: 130, type: 'number' as const },
  { id: 'sjW', label: 'W', width: 120, type: 'number' as const },
  { id: 'sjG', label: 'G', width: 120, type: 'number' as const },
  { id: 'opg', label: 'OPG', width: 120, type: 'text' as const },
  { id: 'tglPotong', label: 'TGL POTONG', width: 140, type: 'date' as const, placeholder: 'YYYY-MM-DD' },
  { id: 'noPot', label: 'NO POT', width: 110, type: 'number' as const },

  // JENIS CACAT subcolumns (nullable)
  { id: 'bmc', label: 'BMC', width: 110, type: 'number' as const },
  { id: 'br', label: 'BR', width: 110, type: 'number' as const },
  { id: 'btl', label: 'BTL', width: 110, type: 'number' as const },
  { id: 'bts', label: 'BTS', width: 110, type: 'number' as const },
  { id: 'lm', label: 'LM', width: 110, type: 'number' as const },
  { id: 'lkc', label: 'LKC', width: 110, type: 'number' as const },
  { id: 'lks', label: 'LKS', width: 110, type: 'number' as const },
  { id: 'ld', label: 'LD', width: 110, type: 'number' as const },
  { id: 'lb', label: 'LB', width: 110, type: 'number' as const },
  { id: 'pp', label: 'PP', width: 110, type: 'number' as const },
  { id: 'pts', label: 'PTS', width: 110, type: 'number' as const },
  { id: 'pd', label: 'PD', width: 110, type: 'number' as const },
  { id: 'lkt', label: 'LKT', width: 110, type: 'number' as const },
  { id: 'pk', label: 'PK', width: 110, type: 'number' as const },
  { id: 'lp', label: 'LP', width: 110, type: 'number' as const },
  { id: 'plc', label: 'PLC', width: 110, type: 'number' as const },
  { id: 'j', label: 'J', width: 110, type: 'number' as const },
  { id: 'kk', label: 'KK', width: 110, type: 'number' as const },
  { id: 'bta', label: 'BTA', width: 110, type: 'number' as const },
  { id: 'pj', label: 'PJ', width: 110, type: 'number' as const },
  { id: 'rp', label: 'RP', width: 110, type: 'number' as const },
  { id: 'pb', label: 'PB', width: 110, type: 'number' as const },
  { id: 'xpd', label: 'XPD', width: 110, type: 'number' as const },
  { id: 'pks', label: 'PKS', width: 110, type: 'number' as const },
  { id: 'ko', label: 'KO', width: 110, type: 'number' as const },
  { id: 'db', label: 'DB', width: 110, type: 'number' as const },
  { id: 'bl', label: 'BL', width: 110, type: 'number' as const },
  { id: 'ptr', label: 'PTR', width: 110, type: 'number' as const },
  { id: 'pkt', label: 'PKT', width: 110, type: 'number' as const },
  { id: 'fly', label: 'FLY', width: 110, type: 'number' as const },
  { id: 'ls', label: 'LS', width: 110, type: 'number' as const },
  { id: 'lpb', label: 'LPB', width: 110, type: 'number' as const },
  { id: 'pBulu', label: 'P.BULU', width: 130, type: 'number' as const },
  { id: 'smg', label: 'SMG', width: 110, type: 'number' as const },
  { id: 'sms', label: 'SMS', width: 110, type: 'number' as const },
  { id: 'aw', label: 'AW', width: 110, type: 'number' as const },
  { id: 'pl', label: 'PL', width: 110, type: 'number' as const },
  { id: 'na', label: 'NA', width: 110, type: 'number' as const },
  { id: 'pss', label: 'PSS', width: 110, type: 'number' as const },
  { id: 'luper', label: 'LUPER', width: 110, type: 'number' as const },
  { id: 'ptn', label: 'PTN', width: 110, type: 'number' as const },
  { id: 'b', label: 'B', width: 110, type: 'number' as const },
  { id: 'r', label: 'R', width: 110, type: 'number' as const },
  { id: 'lKecil', label: 'L.KECIL', width: 130, type: 'number' as const },
  { id: 'sl', label: 'SL', width: 110, type: 'number' as const },
  { id: 'pTimbul', label: 'P.TIMBUL', width: 130, type: 'number' as const },
  { id: 'mf', label: 'MF', width: 110, type: 'number' as const },
  { id: 'bCelup', label: 'B.CELUP', width: 130, type: 'number' as const },
  { id: 'pTumpuk', label: 'P.TUMPUK', width: 130, type: 'number' as const },
  { id: 'bBar', label: 'B.BAR', width: 130, type: 'number' as const },
  { id: 'sml', label: 'SML', width: 110, type: 'number' as const },
  { id: 'pSlub', label: 'P.SLUB', width: 130, type: 'number' as const },
  { id: 'pBelang', label: 'P.BELANG', width: 140, type: 'number' as const },
  { id: 'crossing', label: 'CROSSING', width: 140, type: 'number' as const },
  { id: 'xSambung', label: 'X.SAMBUNG', width: 140, type: 'number' as const },
  { id: 'pJelek', label: 'P.JELEK', width: 130, type: 'number' as const },
  { id: 'lipatan', label: 'LIPATAN', width: 130, type: 'number' as const },
];

// Column group configuration for the multi-row header
const INSPECT_GRAY_COLUMN_GROUPS = [
  {
    label: 'SJ',
    children: ['sjW', 'sjG'],
  },
  {
    label: 'JENIS CACAT',
    children: [
      'bmc',
      'br',
      'btl',
      'bts',
      'lm',
      'lkc',
      'lks',
      'ld',
      'lb',
      'pp',
      'pts',
      'pd',
      'lkt',
      'pk',
      'lp',
      'plc',
      'j',
      'kk',
      'bta',
      'pj',
      'rp',
      'pb',
      'xpd',
      'pks',
      'ko',
      'db',
      'bl',
      'ptr',
      'pkt',
      'fly',
      'ls',
      'lpb',
      'pBulu',
      'smg',
      'sms',
      'aw',
      'pl',
      'na',
      'pss',
      'luper',
      'ptn',
      'b',
      'r',
      'lKecil',
      'sl',
      'pTimbul',
      'mf',
      'bCelup',
      'pTumpuk',
      'bBar',
      'sml',
      'pSlub',
      'pBelang',
      'crossing',
      'xSambung',
      'pJelek',
      'lipatan',
    ],
  },
];

const createEmptyRow = (): BaseGridRow => {
  const base: BaseGridRow = {
    _localId: generateLocalId(),
    _status: 'new',
    _error: '',
    id: null,
  };

  INSPECT_GRAY_COLUMNS.forEach((col) => {
    base[col.id] = '';
  });

  return base;
};

const mapRecordToRow = (record: Record<string, unknown>): BaseGridRow => {
  const row = createEmptyRow();
  row._localId = `existing-${record.id}`;
  row._status = 'clean';
  row.id = record.id as number;

  INSPECT_GRAY_COLUMNS.forEach((col) => {
    if (col.id === 'tanggal' || col.id === 'tglPotong') {
      row[col.id] = toYMD(record[col.id] as any);
    } else if (col.type === 'number') {
      row[col.id] = record[col.id] != null ? String(record[col.id]) : '';
    } else {
      row[col.id] = toStr(record[col.id]);
    }
  });

  return row;
};

const buildSubmitPayload = (row: BaseGridRow): Record<string, unknown> => {
  const payload: Record<string, unknown> = {};
  INSPECT_GRAY_COLUMNS.forEach((col) => {
    payload[col.id] = row[col.id] ?? null;
  });
  return payload;
};

function InspectGrayDivisionPage() {
  const config: DataGridConfig = {
    columns: INSPECT_GRAY_COLUMNS,
    columnGroups: INSPECT_GRAY_COLUMN_GROUPS,
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
    { id: 'kp', label: 'KP', type: 'text' as const },
    { id: 'mc', label: 'Machine', type: 'text' as const },
  ];

  return (
    <DataGrid
      config={config}
      title="Inspect Gray Division – Rapid Data Entry"
      description="Excel-style grid optimised for keyboard-only input. Use arrow keys, Tab, and Enter to move between cells."
      filterFields={filterFields}
    />
  );
}

export default InspectGrayDivisionPage;
