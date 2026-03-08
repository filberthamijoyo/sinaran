'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './Production.css';
import { API_ENDPOINTS, apiCall } from '../lib/api';
import { usePersistedState } from '../hooks/usePersistedState';
import { formatDecimal, formatInteger } from '../lib/numberFormat';
import { addNumber, displayValue, formatDate, getYear, getYearMonth } from '../lib/utils';
import { CollapsibleFilters } from './ui/CollapsibleFilters';

const API_BASE_URL = API_ENDPOINTS.production;

// Aggregate raw daily rows into a Date‑Wise summary
const aggregateDateWiseSummary = (rows, filters: any = {}) => {
  if (!rows || rows.length === 0) return [];

  const groups = new Map();

  rows.forEach((row) => {
    // Apply filters from main filter section
    if (filters.unitPabrikId && row.millsUnit?.id !== Number(filters.unitPabrikId)) return;
    if (filters.yarnJenisBenangId && row.yarnJenisBenang?.id !== Number(filters.yarnJenisBenangId)) return;
    if (filters.countNeId && row.countNe?.id !== Number(filters.countNeId)) return;
    if (filters.lotBenangId) {
      const lotId = row.lotBenang?.id || row.lot?.id;
      if (lotId !== Number(filters.lotBenangId)) return;
    }
    if (filters.spkId && row.spk?.id !== Number(filters.spkId)) return;
    if (filters.slubCodeId && row.slubCode?.id !== Number(filters.slubCodeId)) return;
    if (filters.colorId && row.warnaConeCheese?.id !== Number(filters.colorId)) return;
    const keyParts = [
      row.productionDate || '',
      row.month || '',
      row.millsUnit?.name || row.unitPabrik?.name || '',
      row.yarnJenisBenang?.name || '',
      row.countNe?.value || '',
    ];
    const key = keyParts.join('|');

    if (!groups.has(key)) {
      groups.set(key, {
        productionDate: row.productionDate,
        day: formatDate(row.productionDate),
        month: row.month || '',
        unitName: row.millsUnit?.name || row.unitPabrik?.name || '',
        yarnJenisBenang: row.yarnJenisBenang?.name || '',
        countNe: row.countNe?.value || '',
        jumlahConesCheese: 0,
        produksiKgs: 0,
        produksiLbs: 0,
        aktualProduksiBales: 0,
        produksi100PercentBales: 0,
        targetProduksiOnTargetOprBales: 0,
        keuntunganKerugianEfisiensiBalesOnTargetOpsOpr: 0,
        targetOpsOpr: 0,
        opsOprAktual: 0,
        opsOprWorked: 0,
        powerElectricMin: 0,
        countMengubahMin: 0,
        creelMengubahMin: 0,
        preventiveMtcMin: 0,
        creelShortStoppageMin: 0,
        totalPenghentianMin: 0,
        powerPenghentian: 0,
        countMengubahLoss: 0,
        creelMengubahLoss: 0,
        preventiveMtcLoss: 0,
        creelShortLoss: 0,
        kerugianTotal: 0,
        produksiEffisiensiPercentSum: 0,
        effisiensiKerjaPercentSum: 0,
        count: 0,
      });
    }

    const agg = groups.get(key);
    addNumber(agg, 'jumlahConesCheese', row.jumlahConesCheese);
    addNumber(agg, 'produksiKgs', row.produksiKgs);
    addNumber(agg, 'produksiLbs', row.produksiLbs);
    addNumber(agg, 'aktualProduksiBales', row.aktualProduksiBales);
    addNumber(agg, 'produksi100PercentBales', row.produksi100PercentBales);
    addNumber(agg, 'targetProduksiOnTargetOprBales', row.targetProduksiOnTargetOprBales);
    addNumber(agg, 'keuntunganKerugianEfisiensiBalesOnTargetOpsOpr', row.keuntunganKerugianEfisiensiBalesOnTargetOpsOpr);
    addNumber(agg, 'targetOpsOpr', row.targetOpsOpr);
    addNumber(agg, 'opsOprAktual', row.opsOprAktual);
    addNumber(agg, 'opsOprWorked', row.opsOprWorked);
    addNumber(agg, 'powerElectricMin', row.powerElectricMin);
    addNumber(agg, 'countMengubahMin', row.countMengubahMin);
    addNumber(agg, 'creelMengubahMin', row.creelMengubahMin);
    addNumber(agg, 'preventiveMtcMin', row.preventiveMtcMin);
    addNumber(agg, 'creelShortStoppageMin', row.creelShortStoppageMin);
    addNumber(agg, 'totalPenghentianMin', row.totalPenghentianMin);
    addNumber(agg, 'powerPenghentian', row.powerPenghentian);
    addNumber(agg, 'countMengubahLoss', row.countMengubahLoss);
    addNumber(agg, 'creelMengubahLoss', row.creelMengubahLoss);
    addNumber(agg, 'preventiveMtcLoss', row.preventiveMtcLoss);
    addNumber(agg, 'creelShortLoss', row.creelShortLoss);
    addNumber(agg, 'kerugianTotal', row.kerugianTotal);
    addNumber(agg, 'produksiEffisiensiPercentSum', row.produksiEffisiensiPercent);
    addNumber(agg, 'effisiensiKerjaPercentSum', row.effisiensiKerjaPercent);
    agg.count += 1;
  });

  const summary = Array.from(groups.values()).map((g) => {
    const denom = g.count > 0 ? g.count : 1;
    return {
      ...g,
      // Convert fact metrics from totals to row-level averages
      jumlahConesCheese: g.jumlahConesCheese / denom,
      produksiKgs: g.produksiKgs / denom,
      produksiLbs: g.produksiLbs / denom,
      aktualProduksiBales: g.aktualProduksiBales / denom,
      produksi100PercentBales: g.produksi100PercentBales / denom,
      targetProduksiOnTargetOprBales: g.targetProduksiOnTargetOprBales / denom,
      keuntunganKerugianEfisiensiBalesOnTargetOpsOpr:
        g.keuntunganKerugianEfisiensiBalesOnTargetOpsOpr / denom,
      targetOpsOpr: g.targetOpsOpr / denom,
      opsOprAktual: g.opsOprAktual / denom,
      opsOprWorked: g.opsOprWorked / denom,
      powerElectricMin: g.powerElectricMin / denom,
      countMengubahMin: g.countMengubahMin / denom,
      creelMengubahMin: g.creelMengubahMin / denom,
      preventiveMtcMin: g.preventiveMtcMin / denom,
      creelShortStoppageMin: g.creelShortStoppageMin / denom,
      totalPenghentianMin: g.totalPenghentianMin / denom,
      powerPenghentian: g.powerPenghentian / denom,
      countMengubahLoss: g.countMengubahLoss / denom,
      creelMengubahLoss: g.creelMengubahLoss / denom,
      preventiveMtcLoss: g.preventiveMtcLoss / denom,
      creelShortLoss: g.creelShortLoss / denom,
      kerugianTotal: g.kerugianTotal / denom,
      // Percentage metrics averaged over contributing rows
      produksiEffisiensiPercentAvg:
        g.count > 0 ? g.produksiEffisiensiPercentSum / g.count : null,
      effisiensiKerjaPercentAvg:
        g.count > 0 ? g.effisiensiKerjaPercentSum / g.count : null,
    };
  });

  summary.sort((a, b) => {
    const da = a.productionDate ? new Date(a.productionDate) : new Date();
    const db = b.productionDate ? new Date(b.productionDate) : new Date();
    if (da.getTime() !== db.getTime()) return da.getTime() - db.getTime();
    return (a.unitName || '').localeCompare(b.unitName || '');
  });

  return summary;
};

// Aggregate by month - calculates averages for the selected month
const aggregateMonthlySummary = (rows, selectedMonth, filters: any = {}) => {
  if (!rows || rows.length === 0) return [];

  const groups = new Map();

  rows.forEach((row) => {
    // Derive a canonical YYYY-MM key from productionDate (or fallback)
    const rowMonth = getYearMonth(row.productionDate || row.month) || '';
    // Filter by selected month (YYYY-MM) if provided
    if (selectedMonth && rowMonth !== selectedMonth) return;
    
    // Apply filters from main filter section
    if (filters.unitPabrikId && row.millsUnit?.id !== Number(filters.unitPabrikId)) return;
    if (filters.yarnJenisBenangId && row.yarnJenisBenang?.id !== Number(filters.yarnJenisBenangId)) return;
    if (filters.countNeId && row.countNe?.id !== Number(filters.countNeId)) return;
    if (filters.lotBenangId) {
      const lotId = row.lotBenang?.id || row.lot?.id;
      if (lotId !== Number(filters.lotBenangId)) return;
    }
    if (filters.spkId && row.spk?.id !== Number(filters.spkId)) return;
    if (filters.slubCodeId && row.slubCode?.id !== Number(filters.slubCodeId)) return;
    if (filters.colorId && row.warnaConeCheese?.id !== Number(filters.colorId)) return;

    // Group by month (YYYY-MM), unit, yarn type, count, lot, SPK, slub and colour
    const keyParts = [
      rowMonth,
      row.millsUnit?.name || row.unitPabrik?.name || '',
      row.yarnJenisBenang?.name || '',
      row.countNe?.value || '',
      row.lotBenang?.name || '',
      row.spk?.name || '',
      row.slubCode?.name || row.slubCode?.code || '',
      row.warnaConeCheese?.name || '',
    ];
    const key = keyParts.join('|');

    if (!groups.has(key)) {
      groups.set(key, {
        month: rowMonth,
        unitName: row.millsUnit?.name || row.unitPabrik?.name || '',
        yarnJenisBenang: row.yarnJenisBenang?.name || '',
        countNe: row.countNe?.value || '',
        lotName: row.lotBenang?.name || '',
        spkName: row.spk?.name || '',
        slubCode: row.slubCode?.name || row.slubCode?.code || '',
        colorName: row.warnaConeCheese?.name || '',
        jumlahConesCheese: 0,
        produksiKgs: 0,
        produksiLbs: 0,
        aktualProduksiBales: 0,
        produksi100PercentBales: 0,
        targetProduksiOnTargetOprBales: 0,
        keuntunganKerugianEfisiensiBalesOnTargetOpsOpr: 0,
        targetOpsOpr: 0,
        opsOprAktual: 0,
        opsOprWorked: 0,
        powerElectricMin: 0,
        countMengubahMin: 0,
        creelMengubahMin: 0,
        preventiveMtcMin: 0,
        creelShortStoppageMin: 0,
        totalPenghentianMin: 0,
        powerPenghentian: 0,
        countMengubahLoss: 0,
        creelMengubahLoss: 0,
        preventiveMtcLoss: 0,
        creelShortLoss: 0,
        kerugianTotal: 0,
        produksiEffisiensiPercentSum: 0,
        effisiensiKerjaPercentSum: 0,
        count: 0,
      });
    }

    const agg = groups.get(key);
    addNumber(agg, 'jumlahConesCheese', row.jumlahConesCheese);
    addNumber(agg, 'produksiKgs', row.produksiKgs);
    addNumber(agg, 'produksiLbs', row.produksiLbs);
    addNumber(agg, 'aktualProduksiBales', row.aktualProduksiBales);
    addNumber(agg, 'produksi100PercentBales', row.produksi100PercentBales);
    addNumber(agg, 'targetProduksiOnTargetOprBales', row.targetProduksiOnTargetOprBales);
    addNumber(agg, 'keuntunganKerugianEfisiensiBalesOnTargetOpsOpr', row.keuntunganKerugianEfisiensiBalesOnTargetOpsOpr);
    addNumber(agg, 'targetOpsOpr', row.targetOpsOpr);
    addNumber(agg, 'opsOprAktual', row.opsOprAktual);
    addNumber(agg, 'opsOprWorked', row.opsOprWorked);
    addNumber(agg, 'powerElectricMin', row.powerElectricMin);
    addNumber(agg, 'countMengubahMin', row.countMengubahMin);
    addNumber(agg, 'creelMengubahMin', row.creelMengubahMin);
    addNumber(agg, 'preventiveMtcMin', row.preventiveMtcMin);
    addNumber(agg, 'creelShortStoppageMin', row.creelShortStoppageMin);
    addNumber(agg, 'totalPenghentianMin', row.totalPenghentianMin);
    addNumber(agg, 'powerPenghentian', row.powerPenghentian);
    addNumber(agg, 'countMengubahLoss', row.countMengubahLoss);
    addNumber(agg, 'creelMengubahLoss', row.creelMengubahLoss);
    addNumber(agg, 'preventiveMtcLoss', row.preventiveMtcLoss);
    addNumber(agg, 'creelShortLoss', row.creelShortLoss);
    addNumber(agg, 'kerugianTotal', row.kerugianTotal);
    addNumber(agg, 'produksiEffisiensiPercentSum', row.produksiEffisiensiPercent);
    addNumber(agg, 'effisiensiKerjaPercentSum', row.effisiensiKerjaPercent);
    agg.count += 1;
  });

  const summary = Array.from(groups.values()).map((g) => {
    const denom = g.count > 0 ? g.count : 1;
    return {
      ...g,
      // Convert fact metrics from totals to row-level averages
      jumlahConesCheese: g.jumlahConesCheese / denom,
      produksiKgs: g.produksiKgs / denom,
      produksiLbs: g.produksiLbs / denom,
      aktualProduksiBales: g.aktualProduksiBales / denom,
      produksi100PercentBales: g.produksi100PercentBales / denom,
      targetProduksiOnTargetOprBales: g.targetProduksiOnTargetOprBales / denom,
      keuntunganKerugianEfisiensiBalesOnTargetOpsOpr:
        g.keuntunganKerugianEfisiensiBalesOnTargetOpsOpr / denom,
      targetOpsOpr: g.targetOpsOpr / denom,
      opsOprAktual: g.opsOprAktual / denom,
      opsOprWorked: g.opsOprWorked / denom,
      powerElectricMin: g.powerElectricMin / denom,
      countMengubahMin: g.countMengubahMin / denom,
      creelMengubahMin: g.creelMengubahMin / denom,
      preventiveMtcMin: g.preventiveMtcMin / denom,
      creelShortStoppageMin: g.creelShortStoppageMin / denom,
      totalPenghentianMin: g.totalPenghentianMin / denom,
      powerPenghentian: g.powerPenghentian / denom,
      countMengubahLoss: g.countMengubahLoss / denom,
      creelMengubahLoss: g.creelMengubahLoss / denom,
      preventiveMtcLoss: g.preventiveMtcLoss / denom,
      creelShortLoss: g.creelShortLoss / denom,
      kerugianTotal: g.kerugianTotal / denom,
      // Percentage metrics averaged over contributing rows
      produksiEffisiensiPercentAvg:
        g.count > 0 ? g.produksiEffisiensiPercentSum / g.count : null,
      effisiensiKerjaPercentAvg:
        g.count > 0 ? g.effisiensiKerjaPercentSum / g.count : null,
    };
  });

  summary.sort((a, b) => {
    if (a.month !== b.month) return (a.month || '').localeCompare(b.month || '');
    return (a.unitName || '').localeCompare(b.unitName || '');
  });

  return summary;
};

// Aggregate by year - calculates averages for the selected year
const aggregateYearlySummary = (rows, selectedYear, filters: any = {}) => {
  if (!rows || rows.length === 0) return [];

  const groups = new Map();

  rows.forEach((row) => {
    // Prefer explicit year field from backend; fall back to productionDate.
    const rowYear = row.year ? String(row.year) : getYear(row.productionDate);
    // Filter by selected year if provided
    if (selectedYear && rowYear !== selectedYear) return;
    
    // Apply filters from main filter section
    if (filters.unitPabrikId && row.millsUnit?.id !== Number(filters.unitPabrikId)) return;
    if (filters.yarnJenisBenangId && row.yarnJenisBenang?.id !== Number(filters.yarnJenisBenangId)) return;
    if (filters.countNeId && row.countNe?.id !== Number(filters.countNeId)) return;
    if (filters.lotBenangId) {
      const lotId = row.lotBenang?.id || row.lot?.id;
      if (lotId !== Number(filters.lotBenangId)) return;
    }
    if (filters.spkId && row.spk?.id !== Number(filters.spkId)) return;
    if (filters.slubCodeId && row.slubCode?.id !== Number(filters.slubCodeId)) return;
    if (filters.colorId && row.warnaConeCheese?.id !== Number(filters.colorId)) return;

    // Group by year, unit, yarn type, count, lot, SPK, slub and colour
    const keyParts = [
      rowYear,
      row.millsUnit?.name || row.unitPabrik?.name || '',
      row.yarnJenisBenang?.name || '',
      row.countNe?.value || '',
      row.lotBenang?.name || '',
      row.spk?.name || '',
      row.slubCode?.name || row.slubCode?.code || '',
      row.warnaConeCheese?.name || '',
    ];
    const key = keyParts.join('|');

    if (!groups.has(key)) {
      groups.set(key, {
        year: rowYear,
        unitName: row.millsUnit?.name || row.unitPabrik?.name || '',
        yarnJenisBenang: row.yarnJenisBenang?.name || '',
        countNe: row.countNe?.value || '',
        lotName: row.lotBenang?.name || '',
        spkName: row.spk?.name || '',
        slubCode: row.slubCode?.name || row.slubCode?.code || '',
        colorName: row.warnaConeCheese?.name || '',
        jumlahConesCheese: 0,
        produksiKgs: 0,
        produksiLbs: 0,
        aktualProduksiBales: 0,
        produksi100PercentBales: 0,
        targetProduksiOnTargetOprBales: 0,
        keuntunganKerugianEfisiensiBalesOnTargetOpsOpr: 0,
        targetOpsOpr: 0,
        opsOprAktual: 0,
        opsOprWorked: 0,
        powerElectricMin: 0,
        countMengubahMin: 0,
        creelMengubahMin: 0,
        preventiveMtcMin: 0,
        creelShortStoppageMin: 0,
        totalPenghentianMin: 0,
        powerPenghentian: 0,
        countMengubahLoss: 0,
        creelMengubahLoss: 0,
        preventiveMtcLoss: 0,
        creelShortLoss: 0,
        kerugianTotal: 0,
        produksiEffisiensiPercentSum: 0,
        effisiensiKerjaPercentSum: 0,
        count: 0,
      });
    }

    const agg = groups.get(key);
    addNumber(agg, 'jumlahConesCheese', row.jumlahConesCheese);
    addNumber(agg, 'produksiKgs', row.produksiKgs);
    addNumber(agg, 'produksiLbs', row.produksiLbs);
    addNumber(agg, 'aktualProduksiBales', row.aktualProduksiBales);
    addNumber(agg, 'produksi100PercentBales', row.produksi100PercentBales);
    addNumber(agg, 'targetProduksiOnTargetOprBales', row.targetProduksiOnTargetOprBales);
    addNumber(agg, 'keuntunganKerugianEfisiensiBalesOnTargetOpsOpr', row.keuntunganKerugianEfisiensiBalesOnTargetOpsOpr);
    addNumber(agg, 'targetOpsOpr', row.targetOpsOpr);
    addNumber(agg, 'opsOprAktual', row.opsOprAktual);
    addNumber(agg, 'opsOprWorked', row.opsOprWorked);
    addNumber(agg, 'powerElectricMin', row.powerElectricMin);
    addNumber(agg, 'countMengubahMin', row.countMengubahMin);
    addNumber(agg, 'creelMengubahMin', row.creelMengubahMin);
    addNumber(agg, 'preventiveMtcMin', row.preventiveMtcMin);
    addNumber(agg, 'creelShortStoppageMin', row.creelShortStoppageMin);
    addNumber(agg, 'totalPenghentianMin', row.totalPenghentianMin);
    addNumber(agg, 'powerPenghentian', row.powerPenghentian);
    addNumber(agg, 'countMengubahLoss', row.countMengubahLoss);
    addNumber(agg, 'creelMengubahLoss', row.creelMengubahLoss);
    addNumber(agg, 'preventiveMtcLoss', row.preventiveMtcLoss);
    addNumber(agg, 'creelShortLoss', row.creelShortLoss);
    addNumber(agg, 'kerugianTotal', row.kerugianTotal);
    addNumber(agg, 'produksiEffisiensiPercentSum', row.produksiEffisiensiPercent);
    addNumber(agg, 'effisiensiKerjaPercentSum', row.effisiensiKerjaPercent);
    agg.count += 1;
  });

  const summary = Array.from(groups.values()).map((g) => {
    const denom = g.count > 0 ? g.count : 1;
    return {
      ...g,
      // Convert fact metrics from totals to row-level averages
      jumlahConesCheese: g.jumlahConesCheese / denom,
      produksiKgs: g.produksiKgs / denom,
      produksiLbs: g.produksiLbs / denom,
      aktualProduksiBales: g.aktualProduksiBales / denom,
      produksi100PercentBales: g.produksi100PercentBales / denom,
      targetProduksiOnTargetOprBales: g.targetProduksiOnTargetOprBales / denom,
      keuntunganKerugianEfisiensiBalesOnTargetOpsOpr:
        g.keuntunganKerugianEfisiensiBalesOnTargetOpsOpr / denom,
      targetOpsOpr: g.targetOpsOpr / denom,
      opsOprAktual: g.opsOprAktual / denom,
      opsOprWorked: g.opsOprWorked / denom,
      powerElectricMin: g.powerElectricMin / denom,
      countMengubahMin: g.countMengubahMin / denom,
      creelMengubahMin: g.creelMengubahMin / denom,
      preventiveMtcMin: g.preventiveMtcMin / denom,
      creelShortStoppageMin: g.creelShortStoppageMin / denom,
      totalPenghentianMin: g.totalPenghentianMin / denom,
      powerPenghentian: g.powerPenghentian / denom,
      countMengubahLoss: g.countMengubahLoss / denom,
      creelMengubahLoss: g.creelMengubahLoss / denom,
      preventiveMtcLoss: g.preventiveMtcLoss / denom,
      creelShortLoss: g.creelShortLoss / denom,
      kerugianTotal: g.kerugianTotal / denom,
      // Percentage metrics averaged over contributing rows
      produksiEffisiensiPercentAvg:
        g.count > 0 ? g.produksiEffisiensiPercentSum / g.count : null,
      effisiensiKerjaPercentAvg:
        g.count > 0 ? g.effisiensiKerjaPercentSum / g.count : null,
    };
  });

  summary.sort((a, b) => {
    if (a.year !== b.year) return (a.year || '').localeCompare(b.year || '');
    return (a.unitName || '').localeCompare(b.unitName || '');
  });

  return summary;
};

// Helper functions for date filters
const todayYMD = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const currentYM = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const currentYear = () => {
  return new Date().getFullYear().toString();
};

const getDefaultFilters = () => ({
    period: 'monthly',
    day: todayYMD(),
    month: currentYM(),
    year: currentYear(),
    filterMonth: '',
    unitPabrikId: '',
    yarnJenisBenangId: '',
    countNeId: '',
    lotBenangId: '',
    spkId: '',
    slubCodeId: '',
    colorId: '',
    startDate: '',
    endDate: '',
    produksiKgsMin: '',
    produksiKgsMax: '',
    aktualBalesMin: '',
    aktualBalesMax: '',
    effProduksiMin: '',
    effProduksiMax: ''
  });

function ProductionList() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [filtersExpanded, setFiltersExpanded] = usePersistedState('production_list_filters_expanded', false);
  const [summaryExpanded, setSummaryExpanded] = usePersistedState('production_list_summary_expanded', false);
  const [summaryViewMode, setSummaryViewMode] = usePersistedState('production_list_summary_view_mode', 'daily');

  // Filter states - persisted so filters remain when switching tabs
  const [filters, setFilters] = usePersistedState('production_list_filters', getDefaultFilters);
  
  // Dropdown data
  const [units, setUnits] = useState([]);
  const [yarnTypes, setYarnTypes] = useState([]);
  const [counts, setCounts] = useState([]);
  const [slubCodes, setSlubCodes] = useState([]);
  const [lots, setLots] = useState([]);
  const [spks, setSpks] = useState([]);
  const [colors, setColors] = useState([]);
  const [, setBlends] = useState([]);
  const [, setRayonBrands] = useState([]);

  // Derived: summary based on view mode + a TOTAL row
  const summary = React.useMemo(() => {
    let baseSummary;
    if (summaryViewMode === 'monthly') {
      baseSummary = aggregateMonthlySummary(rows, filters.filterMonth || filters.month, filters);
    } else if (summaryViewMode === 'yearly') {
      baseSummary = aggregateYearlySummary(rows, filters.year, filters);
    } else {
      baseSummary = aggregateDateWiseSummary(rows, filters);
    }

    if (!baseSummary || baseSummary.length === 0) return baseSummary || [];

    // Build TOTAL rows:
    // - First, one TOTAL row per mills unit (OE, RING, etc.) so you can see
    //   the average efficiency per unit.
    // - Finally, a global TOTAL row for all mills combined.
    // - Sum-based metrics are simple sums across all rows
    // - Percentage metrics use: (sum of per-unit averages) / (number of units)
    // - Textual columns use descriptive labels instead of being left blank
    const total = {
      day: summaryViewMode === 'daily' ? 'TOTAL' : '',
      month: summaryViewMode === 'monthly' ? 'TOTAL' : '',
      year: summaryViewMode === 'yearly' ? 'TOTAL' : '',
      unitName: 'ALL MILLS',
      yarnJenisBenang: 'ALL',
      countNe: 'ALL',
      lotName: 'ALL',
      spkName: 'ALL',
      slubCode: 'ALL',
      colorName: 'ALL',
      jumlahConesCheese: 0,
      produksiKgs: 0,
      produksiLbs: 0,
      aktualProduksiBales: 0,
      produksi100PercentBales: 0,
      targetProduksiOnTargetOprBales: 0,
      keuntunganKerugianEfisiensiBalesOnTargetOpsOpr: 0,
      targetOpsOpr: 0,
      opsOprAktual: 0,
      opsOprWorked: 0,
      powerElectricMin: 0,
      countMengubahMin: 0,
      creelMengubahMin: 0,
      preventiveMtcMin: 0,
      creelShortStoppageMin: 0,
      totalPenghentianMin: 0,
      powerPenghentian: 0,
      countMengubahLoss: 0,
      creelMengubahLoss: 0,
      preventiveMtcLoss: 0,
      creelShortLoss: 0,
      kerugianTotal: 0,
      produksiEffisiensiPercentAvg: null,
      effisiensiKerjaPercentAvg: null,
      // For MAV (mean average value) of efficiency % across all rows
      effProdSum: 0,
      effProdCount: 0,
      effKerjaSum: 0,
      effKerjaCount: 0,
      // Number of summary rows contributing to TOTAL (used for averaging)
      _rowCount: 0,
      isTotalRow: true,
    };

    // Sum metrics and collect per‑unit aggregates
    const perUnit = new Map();

    baseSummary.forEach((row) => {
      total.jumlahConesCheese += row.jumlahConesCheese || 0;
      total.produksiKgs += row.produksiKgs || 0;
      total.produksiLbs += row.produksiLbs || 0;
      total.aktualProduksiBales += row.aktualProduksiBales || 0;
      total.produksi100PercentBales += row.produksi100PercentBales || 0;
      total.targetProduksiOnTargetOprBales += row.targetProduksiOnTargetOprBales || 0;
      total.keuntunganKerugianEfisiensiBalesOnTargetOpsOpr +=
        row.keuntunganKerugianEfisiensiBalesOnTargetOpsOpr || 0;
      total.targetOpsOpr += row.targetOpsOpr || 0;
      total.opsOprAktual += row.opsOprAktual || 0;
      total.opsOprWorked += row.opsOprWorked || 0;
      total.powerElectricMin += row.powerElectricMin || 0;
      total.countMengubahMin += row.countMengubahMin || 0;
      total.creelMengubahMin += row.creelMengubahMin || 0;
      total.preventiveMtcMin += row.preventiveMtcMin || 0;
      total.creelShortStoppageMin += row.creelShortStoppageMin || 0;
      total.totalPenghentianMin += row.totalPenghentianMin || 0;
      total.powerPenghentian += row.powerPenghentian || 0;
      total.countMengubahLoss += row.countMengubahLoss || 0;
      total.creelMengubahLoss += row.creelMengubahLoss || 0;
      total.preventiveMtcLoss += row.preventiveMtcLoss || 0;
      total.creelShortLoss += row.creelShortLoss || 0;
      total.kerugianTotal += row.kerugianTotal || 0;
      if (row.produksiEffisiensiPercentAvg != null) {
        total.effProdSum += row.produksiEffisiensiPercentAvg;
        total.effProdCount += 1;
      }
      if (row.effisiensiKerjaPercentAvg != null) {
        total.effKerjaSum += row.effisiensiKerjaPercentAvg;
        total.effKerjaCount += 1;
      }

      const unitKey = row.unitName || '';
      if (!unitKey) return;
      if (!perUnit.has(unitKey)) {
        perUnit.set(unitKey, {
          // Sum-based metrics per mills unit (will be converted to MAV later)
          jumlahConesCheese: 0,
          produksiKgs: 0,
          produksiLbs: 0,
          aktualProduksiBales: 0,
          produksi100PercentBales: 0,
          targetProduksiOnTargetOprBales: 0,
          keuntunganKerugianEfisiensiBalesOnTargetOpsOpr: 0,
          targetOpsOpr: 0,
          opsOprAktual: 0,
          opsOprWorked: 0,
          powerElectricMin: 0,
          countMengubahMin: 0,
          creelMengubahMin: 0,
          preventiveMtcMin: 0,
          creelShortStoppageMin: 0,
          totalPenghentianMin: 0,
          powerPenghentian: 0,
          countMengubahLoss: 0,
          creelMengubahLoss: 0,
          preventiveMtcLoss: 0,
          creelShortLoss: 0,
          kerugianTotal: 0,
          rowCount: 0,
          // Efficiency aggregates per mills unit
          effProdSum: 0,
          effProdCount: 0,
          effKerjaSum: 0,
          effKerjaCount: 0,
        });
      }
      const agg = perUnit.get(unitKey);
      // Per‑unit sums (will be converted to MAV using agg.rowCount)
      agg.jumlahConesCheese += row.jumlahConesCheese || 0;
      agg.produksiKgs += row.produksiKgs || 0;
      agg.produksiLbs += row.produksiLbs || 0;
      agg.aktualProduksiBales += row.aktualProduksiBales || 0;
      agg.produksi100PercentBales += row.produksi100PercentBales || 0;
      agg.targetProduksiOnTargetOprBales +=
        row.targetProduksiOnTargetOprBales || 0;
      agg.keuntunganKerugianEfisiensiBalesOnTargetOpsOpr +=
        row.keuntunganKerugianEfisiensiBalesOnTargetOpsOpr || 0;
      agg.targetOpsOpr += row.targetOpsOpr || 0;
      agg.opsOprAktual += row.opsOprAktual || 0;
      agg.opsOprWorked += row.opsOprWorked || 0;
      agg.powerElectricMin += row.powerElectricMin || 0;
      agg.countMengubahMin += row.countMengubahMin || 0;
      agg.creelMengubahMin += row.creelMengubahMin || 0;
      agg.preventiveMtcMin += row.preventiveMtcMin || 0;
      agg.creelShortStoppageMin += row.creelShortStoppageMin || 0;
      agg.totalPenghentianMin += row.totalPenghentianMin || 0;
      agg.powerPenghentian += row.powerPenghentian || 0;
      agg.countMengubahLoss += row.countMengubahLoss || 0;
      agg.creelMengubahLoss += row.creelMengubahLoss || 0;
      agg.preventiveMtcLoss += row.preventiveMtcLoss || 0;
      agg.creelShortLoss += row.creelShortLoss || 0;
      agg.kerugianTotal += row.kerugianTotal || 0;
      agg.rowCount += 1;

      // Per‑unit efficiencies
      if (row.produksiEffisiensiPercentAvg != null) {
        agg.effProdSum += row.produksiEffisiensiPercentAvg;
        agg.effProdCount += 1;
      }
      if (row.effisiensiKerjaPercentAvg != null) {
        agg.effKerjaSum += row.effisiensiKerjaPercentAvg;
        agg.effKerjaCount += 1;
      }

      // Track number of summary rows contributing to the global TOTAL
      total._rowCount += 1;
    });

    const unitCount = perUnit.size;
    const unitTotalRows = [];
    if (unitCount > 0) {
      perUnit.forEach((agg, unitName) => {
        const unitEffProd =
          agg.effProdCount > 0 ? agg.effProdSum / agg.effProdCount : null;
        const unitEffKerja =
          agg.effKerjaCount > 0 ? agg.effKerjaSum / agg.effKerjaCount : null;

        // For all numeric fact metrics we show MAV (sum / rowCount) per unit.
        const denom = agg.rowCount > 0 ? agg.rowCount : 1;
        const unitJumlahConesAvg = agg.jumlahConesCheese / denom;
        const unitProduksiKgsAvg = agg.produksiKgs / denom;
        const unitProduksiLbsAvg = agg.produksiLbs / denom;
        const unitAktualBalesAvg = agg.aktualProduksiBales / denom;
        const unitProd100BalesAvg = agg.produksi100PercentBales / denom;
        const unitTargetProdBalesAvg =
          agg.targetProduksiOnTargetOprBales / denom;
        const unitPowerElectricMinAvg = agg.powerElectricMin / denom;
        const unitCountMengubahMinAvg = agg.countMengubahMin / denom;
        const unitCreelMengubahMinAvg = agg.creelMengubahMin / denom;
        const unitPreventiveMtcMinAvg = agg.preventiveMtcMin / denom;
        const unitCreelShortStoppageMinAvg =
          agg.creelShortStoppageMin / denom;
        const unitTotalPenghentianAvg = agg.totalPenghentianMin / denom;
        const unitPowerPenghentianAvg = agg.powerPenghentian / denom;
        const unitCountMengubahLossAvg = agg.countMengubahLoss / denom;
        const unitCreelMengubahLossAvg = agg.creelMengubahLoss / denom;
        const unitPreventiveMtcLossAvg = agg.preventiveMtcLoss / denom;
        const unitCreelShortLossAvg = agg.creelShortLoss / denom;
        const unitKerugianTotalAvg = agg.kerugianTotal / denom;

        // Collect rows so the table shows one TOTAL row per mills unit
        unitTotalRows.push({
          day: summaryViewMode === 'daily' ? 'TOTAL' : '',
          month: summaryViewMode === 'monthly' ? 'TOTAL' : '',
          year: summaryViewMode === 'yearly' ? 'TOTAL' : '',
          unitName,
          yarnJenisBenang: 'ALL',
          countNe: 'ALL',
          lotName: 'ALL',
          spkName: 'ALL',
          slubCode: 'ALL',
          colorName: 'ALL',
          jumlahConesCheese: unitJumlahConesAvg,
          produksiKgs: unitProduksiKgsAvg,
          produksiLbs: unitProduksiLbsAvg,
          aktualProduksiBales: unitAktualBalesAvg,
          produksi100PercentBales: unitProd100BalesAvg,
          targetProduksiOnTargetOprBales: unitTargetProdBalesAvg,
          keuntunganKerugianEfisiensiBalesOnTargetOpsOpr:
            agg.keuntunganKerugianEfisiensiBalesOnTargetOpsOpr,
          targetOpsOpr: agg.targetOpsOpr,
          opsOprAktual: agg.opsOprAktual,
          opsOprWorked: agg.opsOprWorked,
          powerElectricMin: unitPowerElectricMinAvg,
          countMengubahMin: unitCountMengubahMinAvg,
          creelMengubahMin: unitCreelMengubahMinAvg,
          preventiveMtcMin: unitPreventiveMtcMinAvg,
          creelShortStoppageMin: unitCreelShortStoppageMinAvg,
          totalPenghentianMin: unitTotalPenghentianAvg,
          powerPenghentian: unitPowerPenghentianAvg,
          countMengubahLoss: unitCountMengubahLossAvg,
          creelMengubahLoss: unitCreelMengubahLossAvg,
          preventiveMtcLoss: unitPreventiveMtcLossAvg,
          creelShortLoss: unitCreelShortLossAvg,
          kerugianTotal: unitKerugianTotalAvg,
          produksiEffisiensiPercentAvg: unitEffProd,
          effisiensiKerjaPercentAvg: unitEffKerja,
          isUnitTotalRow: true,
        });
      });
    }

    // For the global TOTAL row, show MAV (sum of all rows / number of rows)
    // for all numeric fact metrics:
    if (total.effProdCount > 0) {
      total.produksiEffisiensiPercentAvg = total.effProdSum / total.effProdCount;
    }
    if (total.effKerjaCount > 0) {
      total.effisiensiKerjaPercentAvg = total.effKerjaSum / total.effKerjaCount;
    }
    if (total._rowCount > 0) {
      const denom = total._rowCount;
      total.jumlahConesCheese = total.jumlahConesCheese / denom;
      total.produksiKgs = total.produksiKgs / denom;
      total.produksiLbs = total.produksiLbs / denom;
      total.aktualProduksiBales = total.aktualProduksiBales / denom;
      total.produksi100PercentBales = total.produksi100PercentBales / denom;
      total.targetProduksiOnTargetOprBales =
        total.targetProduksiOnTargetOprBales / denom;
      total.targetOpsOpr = total.targetOpsOpr / denom;
      total.opsOprAktual = total.opsOprAktual / denom;
      total.opsOprWorked = total.opsOprWorked / denom;
      total.powerElectricMin = total.powerElectricMin / denom;
      total.countMengubahMin = total.countMengubahMin / denom;
      total.creelMengubahMin = total.creelMengubahMin / denom;
      total.preventiveMtcMin = total.preventiveMtcMin / denom;
      total.creelShortStoppageMin = total.creelShortStoppageMin / denom;
      total.totalPenghentianMin = total.totalPenghentianMin / denom;
      total.powerPenghentian = total.powerPenghentian / denom;
      total.countMengubahLoss = total.countMengubahLoss / denom;
      total.creelMengubahLoss = total.creelMengubahLoss / denom;
      total.preventiveMtcLoss = total.preventiveMtcLoss / denom;
      total.creelShortLoss = total.creelShortLoss / denom;
      total.kerugianTotal = total.kerugianTotal / denom;
    }

    // Append per‑mills TOTAL rows, then global TOTAL as the final row
    return [...baseSummary, ...unitTotalRows, total];
  }, [rows, summaryViewMode, filters]);

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [unitsData, yarnTypesData, countsData, slubCodesData, lotsData, spksData, colorsData, blendsData, rayonBrandsData] = await Promise.all([
          apiCall(`${API_BASE_URL}/mills-units`),
          apiCall(`${API_BASE_URL}/yarn-types`),
          apiCall(`${API_BASE_URL}/counts`),
          apiCall(`${API_BASE_URL}/slub-codes`),
          apiCall(`${API_BASE_URL}/lots`),
          apiCall(`${API_BASE_URL}/spks`),
          apiCall(`${API_BASE_URL}/colors`),
          apiCall(`${API_ENDPOINTS.unified}/blends`).catch(() => []), // Optional, may not exist
          apiCall(`${API_BASE_URL}/rayon-brands`).catch(() => []) // Optional, may not exist
        ]);
        
        setUnits((unitsData as any[]) || []);
        setYarnTypes((yarnTypesData as any[]) || []);
        setCounts((countsData as any[]) || []);
        setSlubCodes((slubCodesData as any[]) || []);
        setLots((lotsData as any[]) || []);
        setSpks((spksData as any[]) || []);
        setColors((colorsData as any[]) || []);
        setBlends((blendsData as any[]) || []);
        setRayonBrands((rayonBrandsData as any[]) || []);
      } catch (err) {
        console.error('Error fetching dropdowns:', err);
        const errorMessage = err?.message || err?.toString() || 'Unknown error';
        setFeedback({ type: 'error', message: `Error loading dropdown data: ${errorMessage}` });
      }
    };
    
    fetchDropdowns();
  }, []);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters(getDefaultFilters());
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Fetch production records
  const fetchRecords = async (page = 1) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      });

      if (filters.period) {
        params.append('period', filters.period);
        if (filters.period === 'daily' && filters.day) {
          params.append('day', filters.day);
        }
        if (filters.period === 'monthly' && filters.month) {
          params.append('month', filters.month);
        }
        if (filters.period === 'yearly' && filters.year) {
          params.append('year', filters.year);
        }
        if (filters.period === 'range') {
          if (filters.startDate) params.append('startDate', filters.startDate);
          if (filters.endDate) params.append('endDate', filters.endDate);
        }
      }

      if (filters.filterMonth) params.append('filterMonth', filters.filterMonth);
      // Map frontend unit filter to backend mills unit filter
      if (filters.unitPabrikId) params.append('millsUnitId', filters.unitPabrikId);
      if (filters.yarnJenisBenangId) params.append('yarnTypeId', filters.yarnJenisBenangId);
      if (filters.countNeId) params.append('countNeId', filters.countNeId);
      if (filters.lotBenangId) params.append('lotId', filters.lotBenangId);
      if (filters.spkId) params.append('spkId', filters.spkId);
      if (filters.slubCodeId) params.append('slubCodeId', filters.slubCodeId);
      if (filters.colorId) params.append('colorId', filters.colorId);
      if (filters.produksiKgsMin) params.append('produksiKgsMin', filters.produksiKgsMin);
      if (filters.produksiKgsMax) params.append('produksiKgsMax', filters.produksiKgsMax);
      if (filters.aktualBalesMin) params.append('aktualBalesMin', filters.aktualBalesMin);
      if (filters.aktualBalesMax) params.append('aktualBalesMax', filters.aktualBalesMax);
      if (filters.effProduksiMin) params.append('effProduksiMin', filters.effProduksiMin);
      if (filters.effProduksiMax) params.append('effProduksiMax', filters.effProduksiMax);
      
      const data = (await apiCall(`${API_BASE_URL}/records?${params}`)) as any;
      setRows(data?.data || []);
      setPagination(data?.pagination || pagination);
    } catch (err) {
      const message =
        (err as any)?.message || (err as any)?.toString?.() || 'Unknown error';
      setFeedback({ type: 'error', message: `Error loading records: ${message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleSelectRow = (row) => {
    router.push(`/production/edit/${row.id}`);
  };

  const handleDelete = async (id = null) => {
    const recordId = id;
    if (!recordId) return;
    
    if (!window.confirm('Are you sure you want to delete this production record?')) {
      return;
    }

    try {
      setLoading(true);
      await apiCall(`${API_BASE_URL}/records/${recordId}`, {
        method: 'DELETE'
      });
      setFeedback({ type: 'success', message: 'Production record deleted successfully!' });
      await fetchRecords(pagination.page);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete record' });
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = (row) => {
    router.push(`/production/edit/${row.id}`);
  };

  const handleEditRow = (row) => {
    router.push(`/production/edit/${row.id}`);
  };

  return (
    <div className="production-module-container">
      <div className="production-list-header">
        <h2>Production Reports</h2>
        <p>View and manage daily production &amp; efficiency data.</p>
      </div>

      <div className="production-module-content">
        {feedback.message && (
          <div
            className={`production-alert production-alert--${
              feedback.type === 'error' ? 'error' : 'success'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {loading && <div className="production-loading">Loading...</div>}

        <div className="production-layout">
          <section className="production-table-panel production-table-panel--full">
            {/* Filters Section - Collapsible */}
            <CollapsibleFilters
              expanded={filtersExpanded}
              onToggle={() => setFiltersExpanded(!filtersExpanded)}
              actions={
                <button onClick={handleClearFilters} className="btn-clear">
                  Clear Filters
                </button>
              }
            >
              <div className="filter-group">
                <label>Period</label>
                <select name="period" value={filters.period} onChange={handleFilterChange}>
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="range">Custom Range</option>
                </select>
              </div>

              {filters.period === 'daily' && (
                <div className="filter-group">
                  <label>Day</label>
                  <input type="date" name="day" value={filters.day} onChange={handleFilterChange} />
                </div>
              )}

              {filters.period === 'monthly' && (
                <div className="filter-group">
                  <label>Month</label>
                  <input type="month" name="month" value={filters.month} onChange={handleFilterChange} />
                </div>
              )}

              {filters.period === 'yearly' && (
                <div className="filter-group">
                  <label>Year</label>
                  <input
                    type="number"
                    name="year"
                    min="2000"
                    max="2100"
                    value={filters.year}
                    onChange={handleFilterChange}
                  />
                </div>
              )}

              {filters.period === 'range' && (
                <>
                  <div className="filter-group">
                    <label>Start Date</label>
                    <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                  </div>
                  <div className="filter-group">
                    <label>End Date</label>
                    <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                  </div>
                </>
              )}

              <div className="filter-group">
                <label>Unit Pabrik</label>
                <select name="unitPabrikId" value={filters.unitPabrikId} onChange={handleFilterChange}>
                  <option value="">All Units</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Yarn Type</label>
                <select name="yarnJenisBenangId" value={filters.yarnJenisBenangId} onChange={handleFilterChange}>
                  <option value="">All Types</option>
                  {yarnTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Count (Ne)</label>
                <select name="countNeId" value={filters.countNeId} onChange={handleFilterChange}>
                  <option value="">All Counts</option>
                  {counts.map((count) => (
                    <option key={count.id} value={count.id}>
                      {count.value}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Lot</label>
                <select name="lotBenangId" value={filters.lotBenangId} onChange={handleFilterChange}>
                  <option value="">All Lots</option>
                  {lots.map((lot) => (
                    <option key={lot.id} value={lot.id}>
                      {lot.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>SPK</label>
                <select name="spkId" value={filters.spkId} onChange={handleFilterChange}>
                  <option value="">All SPKs</option>
                  {spks.map((spk) => (
                    <option key={spk.id} value={spk.id}>
                      {spk.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Month (Filter)</label>
                <input
                  type="month"
                  name="filterMonth"
                  value={filters.filterMonth}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="filter-group">
                <label>Slub Code</label>
                <select name="slubCodeId" value={filters.slubCodeId} onChange={handleFilterChange}>
                  <option value="">All Slub Codes</option>
                  {slubCodes.map((slub) => (
                    <option key={slub.id} value={slub.id}>
                      {slub.name || slub.code || slub.value}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Color (Warna Cone)</label>
                <select name="colorId" value={filters.colorId} onChange={handleFilterChange}>
                  <option value="">All Colors</option>
                  {colors.map((color) => (
                    <option key={color.id} value={color.id}>
                      {color.name || color.code || color.value}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Produksi (Kgs) Min</label>
                <input
                  type="number"
                  name="produksiKgsMin"
                  value={filters.produksiKgsMin}
                  onChange={handleFilterChange}
                  step="0.01"
                  placeholder="Min"
                />
              </div>

              <div className="filter-group">
                <label>Produksi (Kgs) Max</label>
                <input
                  type="number"
                  name="produksiKgsMax"
                  value={filters.produksiKgsMax}
                  onChange={handleFilterChange}
                  step="0.01"
                  placeholder="Max"
                />
              </div>

              <div className="filter-group">
                <label>Aktual (Bales) Min</label>
                <input
                  type="number"
                  name="aktualBalesMin"
                  value={filters.aktualBalesMin}
                  onChange={handleFilterChange}
                  step="0.01"
                  placeholder="Min"
                />
              </div>

              <div className="filter-group">
                <label>Aktual (Bales) Max</label>
                <input
                  type="number"
                  name="aktualBalesMax"
                  value={filters.aktualBalesMax}
                  onChange={handleFilterChange}
                  step="0.01"
                  placeholder="Max"
                />
              </div>

              <div className="filter-group">
                <label>Eff. Produksi % Min</label>
                <input
                  type="number"
                  name="effProduksiMin"
                  value={filters.effProduksiMin}
                  onChange={handleFilterChange}
                  step="0.01"
                  placeholder="Min"
                />
              </div>

              <div className="filter-group">
                <label>Eff. Produksi % Max</label>
                <input
                  type="number"
                  name="effProduksiMax"
                  value={filters.effProduksiMax}
                  onChange={handleFilterChange}
                  step="0.01"
                  placeholder="Max"
                />
              </div>
            </CollapsibleFilters>

            {/* Main Table */}
            <div className="production-table-header">
              <div>
                <h3 className="section-heading">Production Records</h3>
                <p className="production-table-subtitle">
                  Showing {rows.length} of {pagination.total} records. Click a row to edit.
                </p>
              </div>
            </div>

            <div className="production-table-wrapper">
              <table className="production-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Year</th>
                    <th>Month</th>
                    <th>Mills Unit</th>
                    <th>Jenis Benang</th>
                    <th>Count (Ne)</th>
                    <th>Slub Code</th>
                    <th>Lot</th>
                    <th>SPK</th>
                    <th>Color</th>
                    <th>Berat Cone (Kgs)</th>
                    <th>TM</th>
                    <th>TPI</th>
                    <th>Speed</th>
                    <th>Spindel / Rotor Terpasang</th>
                    <th>Jumlah Cones</th>
                    <th>Produksi (Kgs)</th>
                    <th>Produksi (Lbs)</th>
                    <th>Aktual (Bales)</th>
                    <th>100% Produksi (Bales)</th>
                    <th>Target Produksi (Bales)</th>
                    <th>Target OPS / OPR</th>
                    <th>OPS / OPR Aktual</th>
                    <th>OPS / OPR Worked</th>
                    <th>Power / Electric (min)</th>
                    <th>Count Mengubah (min)</th>
                    <th>Creel Mengubah (min)</th>
                    <th>Preventive MTC (min)</th>
                    <th>Creel Short (min)</th>
                    <th>Total Penghentian (min)</th>
                    <th>Power Penghentian (Bales)</th>
                    <th>Count Mengubah Loss (Bales)</th>
                    <th>Creel Mengubah Loss (Bales)</th>
                    <th>Preventive MTC Loss (Bales)</th>
                    <th>Creel Short Loss (Bales)</th>
                    <th>Keuntungan / Kerugian Efisiensi (Bales)</th>
                    <th>Eff. Produksi %</th>
                    <th>Eff. Kerja %</th>
                    <th>Kerugian Total (Bales)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={40} className="production-empty">
                        {loading ? 'Loading...' : 'No records found. Use "New Production Entry" to add data.'}
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => handleSelectRow(row)}
                      >
                        <td>{displayValue(formatDate(row.productionDate))}</td>
                        <td>{displayValue(getYear(row.productionDate))}</td>
                        <td>{displayValue(row.month)}</td>
                        <td>{displayValue(row.millsUnit?.name || row.unitPabrik?.name)}</td>
                        <td>{displayValue(row.yarnJenisBenang?.name)}</td>
                        <td>{displayValue(row.countNe?.value)}</td>
                        <td>{displayValue(row.slubCode?.name || row.slubCode?.code)}</td>
                        <td>{displayValue(row.lotBenang?.name)}</td>
                        <td>{displayValue(row.spk?.name)}</td>
                        <td>{displayValue(row.warnaConeCheese?.name)}</td>
                        <td>{displayValue(row.beratConeCheeseKg, (v) => formatDecimal(v, 3))}</td>
                        <td>{displayValue(row.tm, (v) => formatDecimal(v, 2))}</td>
                        <td>{displayValue(row.tpi, (v) => formatDecimal(v, 2))}</td>
                        <td>{displayValue(row.speed)}</td>
                        <td>{displayValue(row.jumlahSpindelRotorTerpasang)}</td>
                        <td>{displayValue(row.jumlahConesCheese)}</td>
                        <td>{displayValue(row.produksiKgs, (v) => formatDecimal(v, 2))}</td>
                        <td>{displayValue(row.produksiLbs, (v) => formatDecimal(v, 2))}</td>
                        <td>{displayValue(row.aktualProduksiBales, (v) => formatDecimal(v, 2))}</td>
                        <td>{displayValue(row.produksi100PercentBales, (v) => formatDecimal(v, 2))}</td>
                        <td>{displayValue(row.targetProduksiOnTargetOprBales, (v) => formatDecimal(v, 2))}</td>
                        <td>{displayValue(row.targetOpsOpr, (v) => formatDecimal(v, 4))}</td>
                        <td>{displayValue(row.opsOprAktual, (v) => formatDecimal(v, 4))}</td>
                        <td>{displayValue(row.opsOprWorked, (v) => formatDecimal(v, 4))}</td>
                        <td>{displayValue(row.powerElectricMin)}</td>
                        <td>{displayValue(row.countMengubahMin)}</td>
                        <td>{displayValue(row.creelMengubahMin)}</td>
                        <td>{displayValue(row.preventiveMtcMin)}</td>
                        <td>{displayValue(row.creelShortStoppageMin)}</td>
                        <td>{displayValue(row.totalPenghentianMin)}</td>
                        <td>{displayValue(row.powerPenghentian, (v) => formatDecimal(v, 2))}</td>
                        <td>{displayValue(row.countMengubahLoss, (v) => formatDecimal(v, 2))}</td>
                        <td>{displayValue(row.creelMengubahLoss, (v) => formatDecimal(v, 2))}</td>
                        <td>{displayValue(row.preventiveMtcLoss, (v) => formatDecimal(v, 2))}</td>
                        <td>{displayValue(row.creelShortLoss, (v) => formatDecimal(v, 2))}</td>
                        <td>{displayValue(
                          row.keuntunganKerugianEfisiensiBalesOnTargetOpsOpr,
                          (v) => formatDecimal(v, 2)
                        )}</td>
                        <td>{displayValue(row.produksiEffisiensiPercent, (v) => formatDecimal(v, 2))}</td>
                        <td>{displayValue(row.effisiensiKerjaPercent, (v) => formatDecimal(v, 2))}</td>
                        <td>{displayValue(row.kerugianTotal, (v) => formatDecimal(v, 2))}</td>
                        <td className="production-actions-cell" onClick={(e) => e.stopPropagation()}>
                          <div className="production-row-actions">
                            <button
                              type="button"
                              className="production-action-btn production-action-btn--edit"
                              onClick={() => handleEditRow(row)}
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              className="production-action-btn production-action-btn--duplicate"
                              onClick={() => handleDuplicate(row)}
                              title="Duplicate"
                            >
                              📋
                            </button>
                            <button
                              type="button"
                              className="production-action-btn production-action-btn--delete"
                              onClick={() => handleDelete(row.id)}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="production-pagination">
                <button
                  onClick={() => fetchRecords(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </button>
                <span>Page {pagination.page} of {pagination.totalPages}</span>
                <button
                  onClick={() => fetchRecords(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </button>
              </div>
            )}

            {/* Summary Section - Collapsible */}
            <div className="production-table-header" style={{ marginTop: '24px' }}>
              <button
                type="button"
                className="filters-toggle-btn"
                onClick={() => setSummaryExpanded(!summaryExpanded)}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                <span>{summaryExpanded ? '▼' : '▶'}</span>
                <div>
                  <h3 className="section-heading" style={{ margin: 0 }}>
                    {summaryViewMode === 'monthly' ? 'Monthly Summary' : 
                     summaryViewMode === 'yearly' ? 'Yearly Summary' : 
                     'Daily Summary'}
                  </h3>
                  <p className="production-table-subtitle" style={{ margin: '0.1rem 0 0' }}>
                    {summaryViewMode === 'monthly' 
                      ? `Aggregated averages for ${filters.filterMonth || filters.month || 'selected month'}.`
                      : summaryViewMode === 'yearly'
                      ? `Aggregated averages for year ${filters.year || 'selected year'}.`
                      : 'Aggregated by date, unit, yarn type, and count from filtered records.'}
                  </p>
                </div>
              </button>
            </div>

            {summaryExpanded && (
              <div>
                {/* View Mode Selector and Filters */}
                <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <label style={{ fontWeight: 600 }}>Summary View:</label>
                  <select
                    value={summaryViewMode}
                    onChange={(e) => setSummaryViewMode(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    <option value="daily">Daily</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  
                  {summaryViewMode === 'monthly' && (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <label>Month:</label>
                      <input
                        type="month"
                        value={filters.filterMonth || filters.month}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFilters(prev => ({ ...prev, filterMonth: value, month: value }));
                        }}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                    </div>
                  )}
                  
                  {summaryViewMode === 'yearly' && (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <label>Year:</label>
                      <input
                        type="number"
                        min="2000"
                        max="2100"
                        value={filters.year}
                        onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', width: '100px' }}
                      />
                    </div>
                  )}
                </div>

                <div className="production-table-wrapper">
                  <table className="production-table">
                    <thead>
                      <tr>
                        {summaryViewMode === 'daily' && <th>Date</th>}
                        {summaryViewMode === 'monthly' && <th>Month</th>}
                        {summaryViewMode === 'yearly' && <th>Year</th>}
                        <th>Mills Unit</th>
                        <th>Jenis Benang</th>
                        <th>Count (Ne)</th>
                        <th>Lot</th>
                        <th>SPK</th>
                        <th>Slub Code</th>
                        <th>Color</th>
                        <th>Jumlah Cones</th>
                        <th>Produksi (Kgs)</th>
                        <th>Produksi (Lbs)</th>
                        <th>Aktual (Bales)</th>
                        <th>100% Produksi (Bales)</th>
                        <th>Target Produksi (Bales)</th>
                        <th>Target OPS / OPR</th>
                        <th>OPS / OPR Aktual</th>
                        <th>OPS / OPR Worked</th>
                        <th>Power / Electric (min)</th>
                        <th>Count Mengubah (min)</th>
                        <th>Creel Mengubah (min)</th>
                        <th>Preventive MTC (min)</th>
                        <th>Creel Short (min)</th>
                        <th>Total Penghentian (min)</th>
                        <th>Power Penghentian (Bales)</th>
                        <th>Count Mengubah Loss (Bales)</th>
                        <th>Creel Mengubah Loss (Bales)</th>
                        <th>Preventive MTC Loss (Bales)</th>
                        <th>Creel Short Loss (Bales)</th>
                        <th>Keuntungan / Kerugian Efisiensi (Bales)</th>
                        <th>Eff. Produksi % (avg)</th>
                        <th>Eff. Kerja % (avg)</th>
                        <th>Kerugian Total (Bales)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.length === 0 ? (
                        <tr>
                          <td colSpan={50} className="production-empty">
                            {loading
                              ? 'Loading summary...'
                              : 'No summary available. Adjust filters or add records.'}
                          </td>
                        </tr>
                      ) : (
                        summary.map((row, idx) => (
                          <tr key={`${row.productionDate || row.month || row.year || ''}-${row.unitName || ''}-${idx}`}>
                            {summaryViewMode === 'daily' && <td>{displayValue(row.day)}</td>}
                            {summaryViewMode === 'monthly' && <td>{displayValue(row.month)}</td>}
                            {summaryViewMode === 'yearly' && <td>{displayValue(row.year)}</td>}
                            <td>{displayValue(row.unitName || row.millsUnit?.name || row.unitPabrik?.name)}</td>
                            <td>{displayValue(row.yarnJenisBenang)}</td>
                            <td>{displayValue(row.countNe)}</td>
                            <td>{displayValue(row.lotName)}</td>
                            <td>{displayValue(row.spkName)}</td>
                            <td>{displayValue(row.slubCode)}</td>
                            <td>{displayValue(row.colorName)}</td>
                            <td>{displayValue(row.jumlahConesCheese, (v) => formatInteger(v))}</td>
                            <td>{displayValue(row.produksiKgs, (v) => formatDecimal(v, 2))}</td>
                            <td>{displayValue(row.produksiLbs, (v) => formatDecimal(v, 2))}</td>
                            <td>{displayValue(row.aktualProduksiBales, (v) => formatDecimal(v, 2))}</td>
                            <td>{displayValue(row.produksi100PercentBales, (v) => formatDecimal(v, 2))}</td>
                            <td>{displayValue(row.targetProduksiOnTargetOprBales, (v) => formatDecimal(v, 2))}</td>
                            <td>{displayValue(row.targetOpsOpr, (v) => formatDecimal(v, 4))}</td>
                            <td>{displayValue(row.opsOprAktual, (v) => formatDecimal(v, 4))}</td>
                            <td>{displayValue(row.opsOprWorked, (v) => formatDecimal(v, 4))}</td>
                            <td>{displayValue(row.powerElectricMin, (v) => formatInteger(v))}</td>
                            <td>{displayValue(row.countMengubahMin, (v) => formatInteger(v))}</td>
                            <td>{displayValue(row.creelMengubahMin, (v) => formatInteger(v))}</td>
                            <td>{displayValue(row.preventiveMtcMin, (v) => formatInteger(v))}</td>
                            <td>{displayValue(row.creelShortStoppageMin, (v) => formatInteger(v))}</td>
                            <td>{displayValue(row.totalPenghentianMin, (v) => formatInteger(v))}</td>
                            <td>{displayValue(row.powerPenghentian, (v) => formatDecimal(v, 2))}</td>
                            <td>{displayValue(row.countMengubahLoss, (v) => formatDecimal(v, 2))}</td>
                            <td>{displayValue(row.creelMengubahLoss, (v) => formatDecimal(v, 2))}</td>
                            <td>{displayValue(row.preventiveMtcLoss, (v) => formatDecimal(v, 2))}</td>
                            <td>{displayValue(row.creelShortLoss, (v) => formatDecimal(v, 2))}</td>
                            <td>{displayValue(
                              row.keuntunganKerugianEfisiensiBalesOnTargetOpsOpr,
                              (v) => formatDecimal(v, 2)
                            )}</td>
                            <td>{displayValue(
                              row.produksiEffisiensiPercentAvg,
                              (v) => formatDecimal(v, 2)
                            )}</td>
                            <td>{displayValue(
                              row.effisiensiKerjaPercentAvg,
                              (v) => formatDecimal(v, 2)
                            )}</td>
                            <td>{displayValue(row.kerugianTotal, (v) => formatDecimal(v, 2))}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default ProductionList;
