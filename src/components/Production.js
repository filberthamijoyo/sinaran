import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Production.css';
import { API_ENDPOINTS, apiCall } from '../config/api';

const API_BASE_URL = API_ENDPOINTS.production;

// Helper to format date for display
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.getDate().toString();
};

// Helper to create full date from day and month
const createFullDate = (day, month, year = new Date().getFullYear()) => {
  if (!day || !month) return null;
  // Map Indonesian month names to numbers
  const monthMap = {
    'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3,
    'Mei': 4, 'Juni': 5, 'Juli': 6, 'Agustus': 7,
    'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
  };
  const monthNum = monthMap[month] !== undefined ? monthMap[month] : new Date().getMonth();
  return new Date(year, monthNum, parseInt(day));
};

// Helper to format date for API (YYYY-MM-DD)
const formatDateForAPI = (date) => {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
};

// Aggregate raw daily rows into a Date‑Wise summary (similar to Date Wise Sum-Table 1.csv)
const aggregateDateWiseSummary = (rows) => {
  if (!rows || rows.length === 0) return [];

  const groups = new Map();

  const addNumber = (obj, field, value) => {
    if (value === null || value === undefined || value === '') return;
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return;
    obj[field] += num;
  };

  rows.forEach((row) => {
    const keyParts = [
      row.productionDate || '',
      row.month || '',
      row.unitPabrik?.name || '',
      row.yarnJenisBenang?.name || '',
      row.countNe?.value || '',
    ];
    const key = keyParts.join('|');

    if (!groups.has(key)) {
      groups.set(key, {
        // Group identifiers
        productionDate: row.productionDate,
        day: formatDate(row.productionDate),
        month: row.month || '',
        unitName: row.unitPabrik?.name || '',
        yarnJenisBenang: row.yarnJenisBenang?.name || '',
        countNe: row.countNe?.value || '',

        // Sum fields
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

        // For averages
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

  const summary = Array.from(groups.values()).map((g) => ({
    ...g,
    produksiEffisiensiPercentAvg:
      g.count > 0 ? g.produksiEffisiensiPercentSum / g.count : null,
    effisiensiKerjaPercentAvg:
      g.count > 0 ? g.effisiensiKerjaPercentSum / g.count : null,
  }));

  // Sort by date then unit
  summary.sort((a, b) => {
    const da = a.productionDate ? new Date(a.productionDate) : new Date();
    const db = b.productionDate ? new Date(b.productionDate) : new Date();
    if (da.getTime() !== db.getTime()) return da - db;
    return (a.unitName || '').localeCompare(b.unitName || '');
  });

  return summary;
};

// Map backend record to frontend form data
const mapRecordToForm = (record) => {
  if (!record) return createEmptyRow();
  
  return {
    id: record.id?.toString() || '',
    date: formatDate(record.productionDate),
    month: record.month || '',
    unitPabrikId: record.unitPabrikId?.toString() || '',
    unitPabrik: record.unitPabrik?.name || '',
    yarnJenisBenangId: record.yarnJenisBenangId?.toString() || '',
    yarnJenisBenang: record.yarnJenisBenang?.name || '',
    countNeId: record.countNeId?.toString() || '',
    countNe: record.countNe?.value || '',
    slubCodeId: record.slubCodeId?.toString() || '',
    slubCode: record.slubCode?.name || '',
    lotBenangId: record.lotBenangId?.toString() || '',
    lotBenang: record.lotBenang?.name || '',
    spkId: record.spkId?.toString() || '',
    spk: record.spk?.name || '',
    warnaConeCheeseId: record.warnaConeCheeseId?.toString() || '',
    warnaCone: record.warnaConeCheese?.name || '',
    beratConeKg: record.beratConeCheeseKg?.toString() || '',
    tm: record.tm?.toString() || '',
    tpi: record.tpi?.toString() || '',
    speed: record.speed?.toString() || '',
    spindlesInstalled: record.jumlahSpindelRotorTerpasang?.toString() || '',
    jumlahCones: record.jumlahConesCheese?.toString() || '',
    produksiKg: record.produksiKgs?.toString() || '',
    produksiLbs: record.produksiLbs?.toString() || '',
    produksiBalesActual: record.aktualProduksiBales?.toString() || '',
    produksiBales100: record.produksi100PercentBales?.toString() || '',
    targetBales: record.targetProduksiOnTargetOprBales?.toString() || '',
    efisiensiBalesVsTarget: record.keuntunganKerugianEfisiensiBalesOnTargetOpsOpr?.toString() || '',
    targetOps: record.targetOpsOpr?.toString() || '',
    opsActual: record.opsOprAktual?.toString() || '',
    opsWorked: record.opsOprWorked?.toString() || '',
    produksiEffPercent: record.produksiEffisiensiPercent?.toString() || '',
    kerjaEffPercent: record.effisiensiKerjaPercent?.toString() || '',
    stopPowerMin: record.powerElectricMin?.toString() || '',
    stopCountChangeMin: record.countMengubahMin?.toString() || '',
    stopCreelChangeMin: record.creelMengubahMin?.toString() || '',
    stopPreventiveMin: record.preventiveMtcMin?.toString() || '',
    stopCreelShortMin: record.creelShortStoppageMin?.toString() || '',
    stopTotalMin: record.totalPenghentianMin?.toString() || '',
    spindlesWorking: record.spindlesRotorsBekerja?.toString() || '',
    spindleEffPercent: record.spindlesRotorsEffisiensi?.toString() || '',
    lossPowerBales: record.powerPenghentian?.toString() || '',
    lossCountChangeBales: record.countMengubahLoss?.toString() || '',
    lossCreelChangeBales: record.creelMengubahLoss?.toString() || '',
    lossPreventiveBales: record.preventiveMtcLoss?.toString() || '',
    lossCreelShortBales: record.creelShortLoss?.toString() || '',
    lossTotalBales: record.kerugianTotal?.toString() || '',
    hargaPerBale: record.hargaBenangPerBale?.toString() || '',
  };
};

// Map frontend form data to backend API payload
const mapFormToAPI = (formData) => {
  const payload = {};
  
  // Date handling
  if (formData.date && formData.month) {
    const fullDate = createFullDate(formData.date, formData.month);
    if (fullDate) {
      payload.productionDate = formatDateForAPI(fullDate);
    }
  }
  
  if (formData.month) payload.month = formData.month;
  
  // Foreign keys (use IDs if available, otherwise try to find by name)
  if (formData.unitPabrikId) payload.unitPabrikId = parseInt(formData.unitPabrikId);
  if (formData.yarnJenisBenangId) payload.yarnJenisBenangId = parseInt(formData.yarnJenisBenangId);
  if (formData.countNeId) payload.countNeId = parseInt(formData.countNeId);
  if (formData.slubCodeId) payload.slubCodeId = formData.slubCodeId ? parseInt(formData.slubCodeId) : null;
  if (formData.lotBenangId) payload.lotBenangId = formData.lotBenangId ? parseInt(formData.lotBenangId) : null;
  if (formData.spkId) payload.spkId = formData.spkId ? parseInt(formData.spkId) : null;
  if (formData.warnaConeCheeseId) payload.warnaConeCheeseId = formData.warnaConeCheeseId ? parseInt(formData.warnaConeCheeseId) : null;
  
  // Numeric fields
  if (formData.beratConeKg) payload.beratConeCheeseKg = parseFloat(formData.beratConeKg);
  if (formData.tm) payload.tm = parseFloat(formData.tm);
  if (formData.tpi) payload.tpi = parseFloat(formData.tpi);
  if (formData.speed) payload.speed = parseInt(formData.speed);
  if (formData.spindlesInstalled) payload.jumlahSpindelRotorTerpasang = parseInt(formData.spindlesInstalled);
  if (formData.jumlahCones) payload.jumlahConesCheese = parseInt(formData.jumlahCones);
  
  // Production values (calculated fields - backend will calculate these, but we can send if provided)
  if (formData.produksiKg) payload.produksiKgs = parseFloat(formData.produksiKg);
  if (formData.produksiLbs) payload.produksiLbs = parseFloat(formData.produksiLbs);
  if (formData.produksiBalesActual) payload.aktualProduksiBales = parseFloat(formData.produksiBalesActual);
  
  // Stoppages
  if (formData.stopPowerMin !== '') payload.powerElectricMin = formData.stopPowerMin ? parseInt(formData.stopPowerMin) : null;
  if (formData.stopCountChangeMin !== '') payload.countMengubahMin = formData.stopCountChangeMin ? parseInt(formData.stopCountChangeMin) : null;
  if (formData.stopCreelChangeMin !== '') payload.creelMengubahMin = formData.stopCreelChangeMin ? parseInt(formData.stopCreelChangeMin) : null;
  if (formData.stopPreventiveMin !== '') payload.preventiveMtcMin = formData.stopPreventiveMin ? parseInt(formData.stopPreventiveMin) : null;
  if (formData.stopCreelShortMin !== '') payload.creelShortStoppageMin = formData.stopCreelShortMin ? parseInt(formData.stopCreelShortMin) : null;
  if (formData.stopTotalMin !== '') payload.totalPenghentianMin = formData.stopTotalMin ? parseInt(formData.stopTotalMin) : null;
  
  // Other calculated fields (backend calculates these)
  if (formData.hargaPerBale) payload.hargaBenangPerBale = parseFloat(formData.hargaPerBale);
  
  return payload;
};

// Helper function to parse numeric value from string
const parseNum = (val) => {
  if (!val || val === '') return null;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? null : parsed;
};

// Helper function to get countNe value from counts array
const getCountNeValue = (countNeId, counts) => {
  if (!countNeId || !counts || counts.length === 0) return null;
  const count = counts.find(c => c.id === parseInt(countNeId));
  return count?.value ? parseFloat(count.value) : null;
};

// Calculate all production values based on input fields
const calculateProductionValues = (formData, counts) => {
  const result = { ...formData };
  
  // Extract values
  const beratConeKg = parseNum(formData.beratConeKg);
  const jumlahCones = parseNum(formData.jumlahCones);
  const tm = parseNum(formData.tm);
  const countNeValue = getCountNeValue(formData.countNeId, counts);
  const speed = parseNum(formData.speed);
  const spindlesInstalled = parseNum(formData.spindlesInstalled);
  const opsWorked = parseNum(formData.opsWorked);
  const stopPowerMin = parseNum(formData.stopPowerMin) || 0;
  const stopCountChangeMin = parseNum(formData.stopCountChangeMin) || 0;
  const stopCreelChangeMin = parseNum(formData.stopCreelChangeMin) || 0;
  const stopPreventiveMin = parseNum(formData.stopPreventiveMin) || 0;
  const stopCreelShortMin = parseNum(formData.stopCreelShortMin) || 0;
  
  // 1. Calculate TPI: TM * sqrt(count (Ne))
  if (countNeValue !== null && tm !== null && tm >= 0 && countNeValue > 0) {
    result.tpi = (tm * Math.sqrt(countNeValue)).toFixed(3);
  } else {
    result.tpi = '';
  }
  
  const tpi = parseNum(result.tpi);
  
  // 2. Calculate produksi(kgs): berat cone/cheese(kgs) * jumlah cones/cheese
  if (beratConeKg !== null && jumlahCones !== null) {
    result.produksiKg = (beratConeKg * jumlahCones).toFixed(3);
  } else {
    result.produksiKg = '';
  }
  
  const produksiKg = parseNum(result.produksiKg);
  
  // 3. Calculate produksi(lbs): berat cone/cheese(kgs) * jumlah cones/cheese * 2.2046
  if (beratConeKg !== null && jumlahCones !== null) {
    result.produksiLbs = (beratConeKg * jumlahCones * 2.2046).toFixed(3);
  } else {
    result.produksiLbs = '';
  }
  
  const produksiLbs = parseNum(result.produksiLbs);
  
  // 4. Calculate produksi(bales): produksi(lbs) / 400
  if (produksiLbs !== null) {
    result.produksiBalesActual = (produksiLbs / 400).toFixed(4);
  } else {
    result.produksiBalesActual = '';
  }
  
  const produksiBalesActual = parseNum(result.produksiBalesActual);
  
  // 5. Calculate 100% produksi(bales): (Jumlah Spindel/Rotor Terpasang * speed * 1440) / (count(ne) * TPI * 840 * 36 * 400)
  if (spindlesInstalled !== null && speed !== null && countNeValue !== null && tpi !== null && tpi > 0) {
    const numerator = spindlesInstalled * speed * 1440;
    const denominator = countNeValue * tpi * 840 * 36 * 400;
    result.produksiBales100 = (numerator / denominator).toFixed(4);
  } else {
    result.produksiBales100 = '';
  }
  
  const produksiBales100 = parseNum(result.produksiBales100);
  
  // 8. Calculate target OPS/OPR: 0.254 * speed * 0.9 / TPI / count(NE)
  if (speed !== null && tpi !== null && tpi > 0 && countNeValue !== null && countNeValue > 0) {
    result.targetOps = (0.254 * speed * 0.9 / tpi / countNeValue).toFixed(6);
  } else {
    result.targetOps = '';
  }
  
  const targetOps = parseNum(result.targetOps);
  
  // 6. Calculate Target produksi on target OPR(bales): jumlah spindel/rotor terpasang * target OPS/OPR * 3 / 16 / 400
  if (spindlesInstalled !== null && targetOps !== null) {
    result.targetBales = (spindlesInstalled * targetOps * 3 / 16 / 400).toFixed(4);
  } else {
    result.targetBales = '';
  }
  
  // 13. Calculate total penghentian: sum of all stoppages
  const totalPenghentian = stopPowerMin + stopCountChangeMin + stopCreelChangeMin + stopPreventiveMin + stopCreelShortMin;
  result.stopTotalMin = totalPenghentian.toString();
  
  // 14. Calculate spindles/rotors bekerja: (jumlah spindel/rotor terpasang * 1440) - (jumlah spindel/rotor terpasang * TotalPenghentian(min)) / 1440
  if (spindlesInstalled !== null) {
    const spindlesWorking = (spindlesInstalled * 1440 - spindlesInstalled * totalPenghentian) / 1440;
    result.spindlesWorking = spindlesWorking.toFixed(4);
  } else {
    result.spindlesWorking = '';
  }
  
  const spindlesWorking = parseNum(result.spindlesWorking);
  
  // 15. Calculate spindles/rotors effisiensi: spindles/rotors bekerja / Jumlah Spindel/Rotor Terpasang
  if (spindlesWorking !== null && spindlesInstalled !== null && spindlesInstalled > 0) {
    result.spindleEffPercent = ((spindlesWorking / spindlesInstalled) * 100).toFixed(6);
  } else {
    result.spindleEffPercent = '';
  }
  
  // 9. Calculate OPS/OPR aktual: (produksi(LBS) * 16) / 3 / jumlah spindel/rotor terpasang
  if (produksiLbs !== null && spindlesInstalled !== null && spindlesInstalled > 0) {
    result.opsActual = ((produksiLbs * 16) / 3 / spindlesInstalled).toFixed(6);
  } else {
    result.opsActual = '';
  }
  
  // Alternative OPS/OPR aktual using spindles/rotors bekerja (if available)
  // This is already calculated above, but we keep the first one as primary
  
  // 7. Calculate Keuntungan atau kerugian efisiensi bales on target OPS/OPR: (OPS/OPR worked - target OPS/OPR) * jumlah spindel/rotor terpasang * 3 / 16 / 400
  if (opsWorked !== null && targetOps !== null && spindlesInstalled !== null) {
    result.efisiensiBalesVsTarget = ((opsWorked - targetOps) * spindlesInstalled * 3 / 16 / 400).toFixed(4);
  } else {
    result.efisiensiBalesVsTarget = '';
  }
  
  // 11. Calculate produksi effisiensi%: aktual produksi(bales) / 100% produksi(bales)
  if (produksiBalesActual !== null && produksiBales100 !== null && produksiBales100 > 0) {
    result.produksiEffPercent = ((produksiBalesActual / produksiBales100) * 100).toFixed(4);
  } else {
    result.produksiEffPercent = '';
  }
  
  // 12. Calculate effisiensi% kerja: (OPS/OPR worked * jumlah spindel/rotor terpasang * 3 / 1600 / 4) / 100% produksi(bales)
  if (opsWorked !== null && spindlesInstalled !== null && produksiBales100 !== null && produksiBales100 > 0) {
    const numerator = opsWorked * spindlesInstalled * 3 / 1600 / 4;
    result.kerjaEffPercent = ((numerator / produksiBales100) * 100).toFixed(4);
  } else {
    result.kerjaEffPercent = '';
  }
  
  // Loss calculations (all negative values)
  // power penghentian: -(OPS/OPR worked * 3 * (jumlah spindel/rotor terpasang * power/electric (min) / 1440)/ 16 / 400)
  if (opsWorked !== null && spindlesInstalled !== null) {
    result.lossPowerBales = (-(opsWorked * 3 * (spindlesInstalled * stopPowerMin / 1440) / 16 / 400)).toFixed(4);
  } else {
    result.lossPowerBales = '';
  }
  
  // count mengubah: -(OPS/OPR worked * 3 * (jumlah spindel/rotor terpasang * count mengubah(min) / 1440)) / 16 / 400
  if (opsWorked !== null && spindlesInstalled !== null) {
    result.lossCountChangeBales = (-(opsWorked * 3 * (spindlesInstalled * stopCountChangeMin / 1440) / 16 / 400)).toFixed(4);
  } else {
    result.lossCountChangeBales = '';
  }
  
  // creel mengubah: -(OPS/OPR worked * 3 * (jumlah spindel/rotor terpasang * creel mengubah(min) / 1440)) / 16 / 400
  if (opsWorked !== null && spindlesInstalled !== null) {
    result.lossCreelChangeBales = (-(opsWorked * 3 * (spindlesInstalled * stopCreelChangeMin / 1440) / 16 / 400)).toFixed(4);
  } else {
    result.lossCreelChangeBales = '';
  }
  
  // preventive MTC./rotor/ring cup change: -(OPS/OPR worked * 3 * (jumlah spindel/rotor terpasang * Preventive Mtc/Rotor/Ring Change Stoppage (min) / 1440)) / 16 / 400
  if (opsWorked !== null && spindlesInstalled !== null) {
    result.lossPreventiveBales = (-(opsWorked * 3 * (spindlesInstalled * stopPreventiveMin / 1440) / 16 / 400)).toFixed(4);
  } else {
    result.lossPreventiveBales = '';
  }
  
  // Creel (Sliver/Roving) Short: -(OPS/OPR worked * 3 * (jumlah spindel/rotor terpasang * Creel Short Stoppage (min) / 1440)) / 16 / 400
  if (opsWorked !== null && spindlesInstalled !== null) {
    result.lossCreelShortBales = (-(opsWorked * 3 * (spindlesInstalled * stopCreelShortMin / 1440) / 16 / 400)).toFixed(4);
  } else {
    result.lossCreelShortBales = '';
  }
  
  // kerugian total: -(OPS/OPR worked * 3 * (jumlah spindel/rotor terpasang * total penghentian (min) / 1440)) / 16 / 400
  if (opsWorked !== null && spindlesInstalled !== null) {
    result.lossTotalBales = (-(opsWorked * 3 * (spindlesInstalled * totalPenghentian / 1440) / 16 / 400)).toFixed(4);
  } else {
    result.lossTotalBales = '';
  }
  
  return result;
};

const createEmptyRow = () => ({
  id: '',
  date: '',
  month: new Date().toLocaleString('id-ID', { month: 'long' }),
  unitPabrikId: '',
  unitPabrik: '',
  yarnJenisBenangId: '',
  yarnJenisBenang: '',
  countNeId: '',
  countNe: '',
  slubCodeId: '',
  slubCode: '',
  lotBenangId: '',
  lotBenang: '',
  spkId: '',
  spk: '',
  warnaConeCheeseId: '',
  warnaCone: '',
  beratConeKg: '',
  tm: '',
  tpi: '',
  speed: '',
  spindlesInstalled: '',
  jumlahCones: '',
  produksiKg: '',
  produksiLbs: '',
  produksiBalesActual: '',
  produksiBales100: '',
  targetBales: '',
  efisiensiBalesVsTarget: '',
  targetOps: '',
  opsActual: '',
  opsWorked: '',
  produksiEffPercent: '',
  kerjaEffPercent: '',
  stopPowerMin: '',
  stopCountChangeMin: '',
  stopCreelChangeMin: '',
  stopPreventiveMin: '',
  stopCreelShortMin: '',
  stopTotalMin: '',
  spindlesWorking: '',
  spindleEffPercent: '',
  lossPowerBales: '',
  lossCountChangeBales: '',
  lossCreelChangeBales: '',
  lossPreventiveBales: '',
  lossCreelShortBales: '',
  lossTotalBales: '',
  hargaPerBale: '',
});

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

function Production() {
  const navigate = useNavigate();
  const [activeTab] = useState('database');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState(createEmptyRow());
  const [editingMode, setEditingMode] = useState('create');
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  
  // Filter states
  const [filters, setFilters] = useState({
    period: 'monthly', // daily | monthly | yearly | range
    day: todayYMD(),
    month: currentYM(),
    year: currentYear(),
    filterMonth: '', // Independent month filter
    unitPabrikId: '',
    yarnJenisBenangId: '',
    countNeId: '',
    lotBenangId: '',
    spkId: '',
    slubCodeId: '',
    colorId: '',
    startDate: '',
    endDate: '',
    // Numeric range filters
    produksiKgsMin: '',
    produksiKgsMax: '',
    aktualBalesMin: '',
    aktualBalesMax: '',
    effProduksiMin: '',
    effProduksiMax: ''
  });
  
  // Dropdown data
  const [units, setUnits] = useState([]);
  const [yarnTypes, setYarnTypes] = useState([]);
  const [counts, setCounts] = useState([]);
  const [slubCodes, setSlubCodes] = useState([]);
  const [lots, setLots] = useState([]);
  const [spks, setSpks] = useState([]);
  const [colors, setColors] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  // Derived: date-wise summary based on current rows (frontend aggregation)
  const dateWiseSummary = React.useMemo(
    () => aggregateDateWiseSummary(rows),
    [rows]
  );

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        setLoadingDropdowns(true);
        const [unitsData, yarnTypesData, countsData, slubCodesData, lotsData, spksData, colorsData] = await Promise.all([
          apiCall(`${API_BASE_URL}/mills-units`),
          apiCall(`${API_BASE_URL}/yarn-types`),
          apiCall(`${API_BASE_URL}/counts`),
          apiCall(`${API_BASE_URL}/slub-codes`),
          apiCall(`${API_BASE_URL}/lots`),
          apiCall(`${API_BASE_URL}/spks`),
          apiCall(`${API_BASE_URL}/colors`)
        ]);
        
        setUnits(unitsData || []);
        setYarnTypes(yarnTypesData || []);
        setCounts(countsData || []);
        setSlubCodes(slubCodesData || []);
        setLots(lotsData || []);
        setSpks(spksData || []);
        setColors(colorsData || []);
      } catch (err) {
        console.error('Error fetching dropdowns:', err);
        setFeedback({ type: 'error', message: `Error loading dropdown data: ${err.message}` });
      } finally {
        setLoadingDropdowns(false);
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
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
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
    // Reset to first page when clearing filters
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

      // Add period filters
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

      // Add other filters
      if (filters.filterMonth) params.append('filterMonth', filters.filterMonth);
      if (filters.unitPabrikId) params.append('unitPabrikId', filters.unitPabrikId);
      if (filters.yarnJenisBenangId) params.append('yarnJenisBenangId', filters.yarnJenisBenangId);
      if (filters.countNeId) params.append('countNeId', filters.countNeId);
      if (filters.lotBenangId) params.append('lotBenangId', filters.lotBenangId);
      if (filters.spkId) params.append('spkId', filters.spkId);
      if (filters.slubCodeId) params.append('slubCodeId', filters.slubCodeId);
      if (filters.colorId) params.append('colorId', filters.colorId);
      
      // Add numeric range filters
      if (filters.produksiKgsMin) params.append('produksiKgsMin', filters.produksiKgsMin);
      if (filters.produksiKgsMax) params.append('produksiKgsMax', filters.produksiKgsMax);
      if (filters.aktualBalesMin) params.append('aktualBalesMin', filters.aktualBalesMin);
      if (filters.aktualBalesMax) params.append('aktualBalesMax', filters.aktualBalesMax);
      if (filters.effProduksiMin) params.append('effProduksiMin', filters.effProduksiMin);
      if (filters.effProduksiMax) params.append('effProduksiMax', filters.effProduksiMax);
      
      const data = await apiCall(`${API_BASE_URL}/records?${params}`);
      setRows(data.data || []);
      setPagination(data.pagination || pagination);
    } catch (err) {
      setFeedback({ type: 'error', message: `Error loading records: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Recalculate values when counts are loaded or when calculation-dependent fields change
  useEffect(() => {
    if (!loadingDropdowns && counts.length > 0) {
      // Only recalculate if we have the necessary data
      const needsRecalculation = 
        formData.beratConeKg || formData.jumlahCones || formData.tm || 
        formData.countNeId || formData.speed || formData.spindlesInstalled ||
        formData.opsWorked || formData.stopPowerMin || formData.stopCountChangeMin ||
        formData.stopCreelChangeMin || formData.stopPreventiveMin || formData.stopCreelShortMin;
      
      if (needsRecalculation) {
        setFormData(prev => calculateProductionValues(prev, counts));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counts, loadingDropdowns]);

  const handleSelectRow = (row) => {
    // Navigate to the dedicated detail/edit page so the user can see the full record
    navigate(`/production/edit/${row.id}`);
  };

  const handleNewRow = () => {
    setSelectedId(null);
    setFormData(createEmptyRow());
    setEditingMode('create');
    setFeedback({ type: '', message: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle dropdown selections that need to update both ID and name
    if (name.endsWith('Id')) {
      const baseName = name.replace('Id', '');
      const selectedItem = findItemByName(baseName, value);
      setFormData((prev) => {
        const updated = {
          ...prev,
          [name]: value,
          [baseName]: selectedItem?.name || ''
        };
        // Recalculate after updating countNeId
        if (name === 'countNeId') {
          return calculateProductionValues(updated, counts);
        }
        return updated;
      });
    } else {
      setFormData((prev) => {
        const updated = {
          ...prev,
          [name]: value,
        };
        // Recalculate for fields that affect calculations
        const calculationFields = [
          'beratConeKg', 'jumlahCones', 'tm', 'speed', 'spindlesInstalled',
          'opsWorked', 'stopPowerMin', 'stopCountChangeMin', 'stopCreelChangeMin',
          'stopPreventiveMin', 'stopCreelShortMin'
        ];
        if (calculationFields.includes(name)) {
          return calculateProductionValues(updated, counts);
        }
        return updated;
      });
    }
  };

  const findItemByName = (type, id) => {
    const idNum = parseInt(id);
    const maps = {
      unitPabrik: units,
      yarnJenisBenang: yarnTypes,
      countNe: counts,
      slubCode: slubCodes,
      lotBenang: lots,
      spk: spks,
      warnaCone: colors
    };
    return maps[type]?.find(item => item.id === idNum);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    // Validation
    if (!formData.date || !formData.unitPabrikId || !formData.yarnJenisBenangId || !formData.countNeId) {
      setFeedback({
        type: 'error',
        message: 'Required fields: Date, Unit Pabrik, Jenis Benang, Count (Ne).',
      });
      return;
    }

    try {
      setLoading(true);
      const payload = mapFormToAPI(formData);

      if (editingMode === 'create') {
        const created = await apiCall(`${API_BASE_URL}/records`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setFeedback({ type: 'success', message: 'Production record created successfully!' });
        setSelectedId(created.id);
        setFormData(mapRecordToForm(created));
        setEditingMode('edit');
      } else {
        await apiCall(`${API_BASE_URL}/records/${selectedId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setFeedback({ type: 'success', message: 'Production record updated successfully!' });
      }
      
      await fetchRecords(pagination.page);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save record' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id = null) => {
    const recordId = id || selectedId;
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
      
      // If we deleted the currently selected record, clear the form
      if (recordId === selectedId) {
        setSelectedId(null);
        setFormData(createEmptyRow());
        setEditingMode('create');
      }
      
      await fetchRecords(pagination.page);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete record' });
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (row) => {
    try {
      setLoading(true);
      // Fetch the full record to get all data
      const record = await apiCall(`${API_BASE_URL}/records/${row.id}`);
      const formDataMapped = mapRecordToForm(record);
      
      // Remove the ID to create a new record
      const duplicateData = {
        ...formDataMapped,
        id: ''
      };
      
      // Create the duplicate
      const payload = mapFormToAPI(duplicateData);
      const created = await apiCall(`${API_BASE_URL}/records`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      setFeedback({ type: 'success', message: 'Production record duplicated successfully!' });
      setSelectedId(created.id);
      setFormData(mapRecordToForm(created));
      setEditingMode('edit');
      await fetchRecords(pagination.page);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to duplicate record' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditRow = (row) => {
    navigate(`/production/edit/${row.id}`);
  };

  return (
    <div className="production-page page-card">
      <div className="page-card-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="page-card-title">Production Database</h2>
            <p className="page-card-subtitle">
              Daily production &amp; efficiency data, aligned with{' '}
              <strong>Laporan_Produksi_dan_Effisiensi_Benang_Harian_TPTI_Februari-26</strong>.
            </p>
          </div>
          <Link 
            to="/production/admin" 
            className="btn btn-secondary"
            style={{ marginTop: '10px' }}
          >
            Manage Dropdowns
          </Link>
        </div>
      </div>

      <div className="page-card-body">
        <div className="production-tabs">
          <button
            type="button"
            className={`production-tab ${activeTab === 'database' ? 'active' : ''}`}
          >
            Database (Daily Report)
          </button>
        </div>

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
          {/* Left side: table / list view */}
          <section className="production-table-panel">
            <div className="production-table-header">
              <div>
                <h3 className="section-heading">Database rows</h3>
                <p className="production-table-subtitle">
                  Select a row to edit, or create a new entry for a production day.
                </p>
              </div>
              <button type="button" className="btn btn-secondary" onClick={handleNewRow}>
                New row
              </button>
            </div>

            {/* Filters Section */}
            <div className="filters-section">
              <div className="filters-header-row">
                <h3>Filters</h3>
                <button onClick={handleClearFilters} className="btn-clear">
                  Clear Filters
                </button>
              </div>
              <div className="filters-grid">
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
              </div>
            </div>

            <div className="production-table-wrapper">
              <table className="production-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Month</th>
                    <th>Unit</th>
                    <th>Jenis Benang</th>
                    <th>Count (Ne)</th>
                    <th>Lot</th>
                    <th>SPK</th>
                    <th>Produksi (Kgs)</th>
                    <th>Aktual (Bales)</th>
                    <th>Eff. Produksi %</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="production-empty">
                        {loading ? 'Loading...' : 'No rows yet. Use "New row" to start adding data.'}
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr
                        key={row.id}
                        className={row.id === selectedId ? 'selected' : ''}
                        onClick={() => handleSelectRow(row)}
                      >
                        <td>{formatDate(row.productionDate)}</td>
                        <td>{row.month}</td>
                        <td>{row.unitPabrik?.name || ''}</td>
                        <td>{row.yarnJenisBenang?.name || ''}</td>
                        <td>{row.countNe?.value || ''}</td>
                        <td>{row.lotBenang?.name || ''}</td>
                        <td>{row.spk?.name || ''}</td>
                        <td>{row.produksiKgs || ''}</td>
                        <td>{row.aktualProduksiBales || ''}</td>
                        <td>{row.produksiEffisiensiPercent || ''}</td>
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

            {/* Date-wise summary (frontend aggregation similar to Date Wise Sum-Table 1.csv) */}
            <div className="production-table-header" style={{ marginTop: '32px' }}>
              <div>
                <h3 className="section-heading">Date-wise Summary (Frontend)</h3>
                <p className="production-table-subtitle">
                  Aggregated by date, unit, yarn type, and count from the filtered database rows.
                </p>
              </div>
            </div>

            <div className="production-table-wrapper">
              <table className="production-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Month</th>
                    <th>Unit</th>
                    <th>Jenis Benang</th>
                    <th>Count (Ne)</th>
                    <th>Jumlah Cones</th>
                    <th>Produksi (Kgs)</th>
                    <th>Produksi (Lbs)</th>
                    <th>Aktual (Bales)</th>
                    <th>100% Produksi (Bales)</th>
                    <th>Target Produksi (Bales)</th>
                    <th>Eff. Produksi % (avg)</th>
                    <th>Eff. Kerja % (avg)</th>
                    <th>Total Penghentian (min)</th>
                    <th>Kerugian Total (Bales)</th>
                  </tr>
                </thead>
                <tbody>
                  {dateWiseSummary.length === 0 ? (
                    <tr>
                      <td colSpan={15} className="production-empty">
                        {loading
                          ? 'Loading summary...'
                          : 'No summary yet. Adjust filters or add rows.'}
                      </td>
                    </tr>
                  ) : (
                    dateWiseSummary.map((row, idx) => (
                      <tr key={`${row.productionDate || ''}-${row.unitName || ''}-${idx}`}>
                        <td>{row.day}</td>
                        <td>{row.month}</td>
                        <td>{row.unitName}</td>
                        <td>{row.yarnJenisBenang}</td>
                        <td>{row.countNe}</td>
                        <td>{row.jumlahConesCheese?.toFixed(0)}</td>
                        <td>{row.produksiKgs?.toFixed(2)}</td>
                        <td>{row.produksiLbs?.toFixed(2)}</td>
                        <td>{row.aktualProduksiBales?.toFixed(2)}</td>
                        <td>{row.produksi100PercentBales?.toFixed(2)}</td>
                        <td>{row.targetProduksiOnTargetOprBales?.toFixed(2)}</td>
                        <td>
                          {row.produksiEffisiensiPercentAvg != null
                            ? row.produksiEffisiensiPercentAvg.toFixed(2)
                            : ''}
                        </td>
                        <td>
                          {row.effisiensiKerjaPercentAvg != null
                            ? row.effisiensiKerjaPercentAvg.toFixed(2)
                            : ''}
                        </td>
                        <td>{row.totalPenghentianMin?.toFixed(0)}</td>
                        <td>{row.kerugianTotal?.toFixed(2)}</td>
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
          </section>

          {/* Right side: form for viewing / editing a single row */}
          <section className="production-form-panel">
            <h3 className="section-heading">
              {editingMode === 'create' ? 'Create new production row' : 'Edit production row'}
            </h3>

            {loadingDropdowns ? (
              <div>Loading dropdowns...</div>
            ) : (
              <form className="production-form" onSubmit={handleSubmit}>
                {/* Identity */}
                <div className="production-form-section">
                  <h4>Identity &amp; yarn</h4>
                  <div className="production-form-grid">
                    <div className="form-group">
                      <label>
                        Date <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        name="date"
                        className="form-control"
                        value={formData.date}
                        onChange={handleChange}
                        min="1"
                        max="31"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Month</label>
                      <select
                        name="month"
                        className="form-control"
                        value={formData.month}
                        onChange={handleChange}
                      >
                        <option value="Januari">Januari</option>
                        <option value="Februari">Februari</option>
                        <option value="Maret">Maret</option>
                        <option value="April">April</option>
                        <option value="Mei">Mei</option>
                        <option value="Juni">Juni</option>
                        <option value="Juli">Juli</option>
                        <option value="Agustus">Agustus</option>
                        <option value="September">September</option>
                        <option value="Oktober">Oktober</option>
                        <option value="November">November</option>
                        <option value="Desember">Desember</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>
                        Unit Pabrik <span className="required">*</span>
                      </label>
                      <select
                        name="unitPabrikId"
                        className="form-control"
                        value={formData.unitPabrikId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Unit</option>
                        {units.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>
                        Jenis Benang <span className="required">*</span>
                      </label>
                      <select
                        name="yarnJenisBenangId"
                        className="form-control"
                        value={formData.yarnJenisBenangId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Yarn Type</option>
                        {yarnTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>
                        Count (Ne) <span className="required">*</span>
                      </label>
                      <select
                        name="countNeId"
                        className="form-control"
                        value={formData.countNeId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Count</option>
                        {counts.map((count) => (
                          <option key={count.id} value={count.id}>
                            {count.value}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Slub Code</label>
                      <select
                        name="slubCodeId"
                        className="form-control"
                        value={formData.slubCodeId}
                        onChange={handleChange}
                      >
                        <option value="">None</option>
                        {slubCodes.map((code) => (
                          <option key={code.id} value={code.id}>
                            {code.name || code.code || `Slub ${code.id}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Lot Benang</label>
                      <select
                        name="lotBenangId"
                        className="form-control"
                        value={formData.lotBenangId}
                        onChange={handleChange}
                      >
                        <option value="">None</option>
                        {lots.map((lot) => (
                          <option key={lot.id} value={lot.id}>
                            {lot.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>SPK</label>
                      <select
                        name="spkId"
                        className="form-control"
                        value={formData.spkId}
                        onChange={handleChange}
                      >
                        <option value="">None</option>
                        {spks.map((spk) => (
                          <option key={spk.id} value={spk.id}>
                            {spk.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Warna Cone / Cheese</label>
                      <select
                        name="warnaConeCheeseId"
                        className="form-control"
                        value={formData.warnaConeCheeseId}
                        onChange={handleChange}
                      >
                        <option value="">None</option>
                        {colors.map((color) => (
                          <option key={color.id} value={color.id}>
                            {color.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Berat Cone / Cheese (Kg)</label>
                      <input
                        type="number"
                        step="0.001"
                        name="beratConeKg"
                        className="form-control"
                        value={formData.beratConeKg}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Machine / technical */}
                <div className="production-form-section">
                  <h4>Machine parameters</h4>
                  <div className="production-form-grid">
                    <div className="form-group">
                      <label>TM</label>
                      <input
                        type="number"
                        step="0.01"
                        name="tm"
                        className="form-control"
                        value={formData.tm}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>TPI</label>
                      <input
                        type="number"
                        step="0.001"
                        name="tpi"
                        className="form-control"
                        value={formData.tpi}
                        onChange={handleChange}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>Speed</label>
                      <input
                        type="number"
                        name="speed"
                        className="form-control"
                        value={formData.speed}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Jumlah Spindel / Rotor Terpasang</label>
                      <input
                        type="number"
                        name="spindlesInstalled"
                        className="form-control"
                        value={formData.spindlesInstalled}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Output */}
                <div className="production-form-section">
                  <h4>Actual &amp; target production</h4>
                  <div className="production-form-grid">
                    <div className="form-group">
                      <label>Jumlah Cones / Cheese</label>
                      <input
                        type="number"
                        name="jumlahCones"
                        className="form-control"
                        value={formData.jumlahCones}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Produksi (Kgs)</label>
                      <input
                        type="number"
                        step="0.001"
                        name="produksiKg"
                        className="form-control"
                        value={formData.produksiKg}
                        onChange={handleChange}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>Produksi (Lbs)</label>
                      <input
                        type="number"
                        step="0.001"
                        name="produksiLbs"
                        className="form-control"
                        value={formData.produksiLbs}
                        onChange={handleChange}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>Aktual Produksi (Bales)</label>
                      <input
                        type="number"
                        step="0.0001"
                        name="produksiBalesActual"
                        className="form-control"
                        value={formData.produksiBalesActual}
                        onChange={handleChange}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>100% Produksi (Bales)</label>
                      <input
                        type="number"
                        step="0.0001"
                        name="produksiBales100"
                        className="form-control"
                        value={formData.produksiBales100}
                        onChange={handleChange}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>Target Produksi on Target OPR (Bales)</label>
                      <input
                        type="number"
                        step="0.0001"
                        name="targetBales"
                        className="form-control"
                        value={formData.targetBales}
                        onChange={handleChange}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>
                        Keuntungan/Kerugian Efisiensi Bales on Target OPS / OPR
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        name="efisiensiBalesVsTarget"
                        className="form-control"
                        value={formData.efisiensiBalesVsTarget}
                        onChange={handleChange}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>Target OPS / OPR</label>
                      <input
                        type="number"
                        step="0.000001"
                        name="targetOps"
                        className="form-control"
                        value={formData.targetOps}
                        onChange={handleChange}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>OPS / OPR Aktual</label>
                      <input
                        type="number"
                        step="0.000001"
                        name="opsActual"
                        className="form-control"
                        value={formData.opsActual}
                        onChange={handleChange}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>OPS / OPR Worked</label>
                      <input
                        type="number"
                        step="0.000001"
                        name="opsWorked"
                        className="form-control"
                        value={formData.opsWorked}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Produksi Effisiensi %</label>
                      <input
                        type="number"
                        step="0.0001"
                        name="produksiEffPercent"
                        className="form-control"
                        value={formData.produksiEffPercent}
                        onChange={handleChange}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>Effisiensi % Kerja</label>
                      <input
                        type="number"
                        step="0.0001"
                        name="kerjaEffPercent"
                        className="form-control"
                        value={formData.kerjaEffPercent}
                        onChange={handleChange}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Stoppages */}
                <div className="production-form-section">
                  <h4>Stoppages (minutes)</h4>
                  <div className="production-form-grid">
                    <div className="form-group">
                      <label>Power / Electric (min)</label>
                      <input
                        type="number"
                        name="stopPowerMin"
                        className="form-control"
                        value={formData.stopPowerMin}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Count Mengubah (min)</label>
                      <input
                        type="number"
                        name="stopCountChangeMin"
                        className="form-control"
                        value={formData.stopCountChangeMin}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Creel Mengubah (min)</label>
                      <input
                        type="number"
                        name="stopCreelChangeMin"
                        className="form-control"
                        value={formData.stopCreelChangeMin}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Preventive Mtc/Rotor/Ring Change (min)</label>
                      <input
                        type="number"
                        name="stopPreventiveMin"
                        className="form-control"
                        value={formData.stopPreventiveMin}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Creel Short Stoppage (min)</label>
                      <input
                        type="number"
                        name="stopCreelShortMin"
                        className="form-control"
                        value={formData.stopCreelShortMin}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Total Penghentian (min)</label>
                      <input
                        type="number"
                        name="stopTotalMin"
                        className="form-control"
                        value={formData.stopTotalMin}
                        onChange={handleChange}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Spindles / rotors */}
                <div className="production-form-section">
                  <h4>Spindles / rotors</h4>
                  <div className="production-form-grid">
                    <div className="form-group">
                      <label>Spindles / Rotors Bekerja</label>
                      <input
                        type="number"
                        step="0.0001"
                        name="spindlesWorking"
                        className="form-control"
                        value={formData.spindlesWorking}
                        onChange={handleChange}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>Spindle / Rotors Effisiensi (%)</label>
                      <input
                        type="number"
                        step="0.000001"
                        name="spindleEffPercent"
                        className="form-control"
                        value={formData.spindleEffPercent}
                        onChange={handleChange}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Losses & price */}
                <div className="production-form-section">
                  <h4>Kerugian produksi (bales) &amp; harga</h4>
                  <div className="production-form-grid">
                    <div className="form-group">
                      <label>Kerugian Karena Power Penghentian (Bales)</label>
                      <input
                        type="number"
                        step="0.0001"
                        name="lossPowerBales"
                        className="form-control"
                        value={formData.lossPowerBales}
                        onChange={handleChange}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>Kerugian Karena Count Mengubah (Bales)</label>
                      <input
                        type="number"
                        step="0.0001"
                        name="lossCountChangeBales"
                        className="form-control"
                        value={formData.lossCountChangeBales}
                        onChange={handleChange}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>Kerugian Karena Creel Mengubah (Bales)</label>
                      <input
                        type="number"
                        step="0.0001"
                        name="lossCreelChangeBales"
                        className="form-control"
                        value={formData.lossCreelChangeBales}
                        onChange={handleChange}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>Kerugian Karena Preventive MTC/Rotor/Ring (Bales)</label>
                      <input
                        type="number"
                        step="0.0001"
                        name="lossPreventiveBales"
                        className="form-control"
                        value={formData.lossPreventiveBales}
                        onChange={handleChange}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>Kerugian Karena Creel (Sliver/Roving) Short (Bales)</label>
                      <input
                        type="number"
                        step="0.0001"
                        name="lossCreelShortBales"
                        className="form-control"
                        value={formData.lossCreelShortBales}
                        onChange={handleChange}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>Kerugian Total (Bales)</label>
                      <input
                        type="number"
                        step="0.0001"
                        name="lossTotalBales"
                        className="form-control"
                        value={formData.lossTotalBales}
                        onChange={handleChange}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>Harga Benang per Bale</label>
                      <input
                        type="number"
                        step="0.01"
                        name="hargaPerBale"
                        className="form-control"
                        value={formData.hargaPerBale}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="production-form-actions">
                  {selectedId && (
                    <button
                      type="button"
                      className="btn btn-secondary production-delete-btn"
                      onClick={handleDelete}
                    >
                      Delete record
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {editingMode === 'create' ? 'Create record' : 'Save changes'}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default Production;
