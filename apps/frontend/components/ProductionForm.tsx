'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import './Production.css';
import { API_ENDPOINTS, apiCall } from '../lib/api';
import { usePersistedState } from '../hooks/usePersistedState';
import { parseLocalizedNumber, formatDecimalInput } from '../lib/numberFormat';

const API_BASE_URL = API_ENDPOINTS.production;

// --- Small helpers reused from the list page ---

const formatDate = (dateString: any) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.getDate().toString();
};

const createFullDate = (day: any, month: any, year: any = new Date().getFullYear()) => {
  if (!day || !month) return null;
  const monthMap: Record<string, number> = {
    Januari: 0,
    Februari: 1,
    Maret: 2,
    April: 3,
    Mei: 4,
    Juni: 5,
    Juli: 6,
    Agustus: 7,
    September: 8,
    Oktober: 9,
    November: 10,
    Desember: 11,
  };
  const monthNum =
    monthMap[month] !== undefined ? monthMap[month] : new Date().getMonth();
  const yearNum = year || new Date().getFullYear();
  return new Date(yearNum, monthNum, parseInt(day, 10));
};

const formatDateForAPI = (date: any) => {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
};

const parseNum = (val: any) => parseLocalizedNumber(val);

const createEmptyRow = () => ({
  id: '',
  date: '',
  month: new Date().toLocaleString('id-ID', { month: 'long' }),
  year: new Date().getFullYear(),
  countDescriptionCode: '',
  unitPabrikId: '',
  yarnJenisBenangId: '',
  countNeId: '',
  slubCodeId: '',
  lotBenangId: '',
  spkId: '',
  blendId: '',
  warnaConeCheeseId: '',
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

const mapRecordToForm = (record: any) => {
  if (!record) return createEmptyRow();

  return {
    id: record.id?.toString() || '',
    date: formatDate(record.productionDate),
    month: record.month || '',
    year:
      record.year ||
      (record.productionDate
        ? new Date(record.productionDate).getFullYear()
        : new Date().getFullYear()),
    countDescriptionCode: record.countDescriptionCode?.toString() || '',
    // Backend field is millsUnitId; map it into the Unit Pabrik select
    unitPabrikId: record.millsUnitId?.toString() || '',
    yarnJenisBenangId: record.yarnJenisBenangId?.toString() || '',
    countNeId: record.countNeId?.toString() || '',
    slubCodeId: record.slubCodeId?.toString() || '',
    lotBenangId: record.lotBenangId?.toString() || '',
    spkId: record.spkId?.toString() || '',
    blendId: record.blendId?.toString() || '',
    warnaConeCheeseId: record.warnaConeCheeseId?.toString() || '',
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
    efisiensiBalesVsTarget:
      record.keuntunganKerugianEfisiensiBalesOnTargetOpsOpr?.toString() || '',
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

const mapFormToAPI = (formData: any) => {
  const payload: any = {};

  if (formData.date && formData.month) {
    const fullDate = createFullDate(formData.date, formData.month, formData.year);
    if (fullDate) {
      payload.productionDate = formatDateForAPI(fullDate);
      // Extract year from the date if not explicitly provided
      if (!payload.year && fullDate) {
        payload.year = fullDate.getFullYear();
      }
    }
  }

  if (formData.month) payload.month = formData.month;
  if (formData.year) payload.year = parseInt(formData.year, 10);
  if (formData.countDescriptionCode)
    payload.countDescriptionCode = parseInt(formData.countDescriptionCode, 10);
  // Map Unit Pabrik select to backend millsUnitId foreign key
  if (formData.unitPabrikId) payload.millsUnitId = parseInt(formData.unitPabrikId, 10);
  if (formData.yarnJenisBenangId)
    payload.yarnJenisBenangId = parseInt(formData.yarnJenisBenangId, 10);
  if (formData.countNeId) payload.countNeId = parseInt(formData.countNeId, 10);
  if (formData.slubCodeId) payload.slubCodeId = parseInt(formData.slubCodeId, 10);
  if (formData.lotBenangId) payload.lotBenangId = parseInt(formData.lotBenangId, 10);
  if (formData.spkId) payload.spkId = parseInt(formData.spkId, 10);
  if (formData.blendId) payload.blendId = parseInt(formData.blendId, 10);
  if (formData.warnaConeCheeseId)
    payload.warnaConeCheeseId = parseInt(formData.warnaConeCheeseId, 10);

  if (formData.beratConeKg) payload.beratConeCheeseKg = parseNum(formData.beratConeKg);
  if (formData.tm) payload.tm = parseNum(formData.tm);
  if (formData.tpi) payload.tpi = parseNum(formData.tpi);
  if (formData.speed) payload.speed = parseNum(formData.speed);
  if (formData.spindlesInstalled)
    payload.jumlahSpindelRotorTerpasang = parseNum(formData.spindlesInstalled);
  if (formData.jumlahCones) payload.jumlahConesCheese = parseNum(formData.jumlahCones);
  if (formData.produksiKg) payload.produksiKgs = parseNum(formData.produksiKg);
  if (formData.produksiLbs) payload.produksiLbs = parseNum(formData.produksiLbs);
  if (formData.produksiBalesActual)
    payload.aktualProduksiBales = parseNum(formData.produksiBalesActual);

  if (formData.stopPowerMin !== '') payload.powerElectricMin = parseNum(formData.stopPowerMin);
  if (formData.stopCountChangeMin !== '')
    payload.countMengubahMin = parseNum(formData.stopCountChangeMin);
  if (formData.stopCreelChangeMin !== '')
    payload.creelMengubahMin = parseNum(formData.stopCreelChangeMin);
  if (formData.stopPreventiveMin !== '')
    payload.preventiveMtcMin = parseNum(formData.stopPreventiveMin);
  if (formData.stopCreelShortMin !== '')
    payload.creelShortStoppageMin = parseNum(formData.stopCreelShortMin);
  if (formData.stopTotalMin !== '') payload.totalPenghentianMin = parseNum(formData.stopTotalMin);

  if (formData.hargaPerBale) payload.hargaBenangPerBale = parseNum(formData.hargaPerBale);

  return payload;
};

const getCountNeValue = (countNeId: any, counts: any[]) => {
  if (!countNeId || !counts || counts.length === 0) return null;
  const count = counts.find((c) => c.id === parseInt(countNeId, 10));
  return count?.value ? parseNum(count.value) : null;
};

const calculateProductionValues = (formData: any, counts: any[]) => {
  const result = { ...formData };

  const beratConeKg = parseNum(formData.beratConeKg);
  const jumlahCones = parseNum(formData.jumlahCones);
  const tm = parseNum(formData.tm);
  const countNeValue = getCountNeValue(formData.countNeId, counts);
  const speed = parseNum(formData.speed);
  const spindlesInstalled = parseNum(formData.spindlesInstalled);
  const stopPowerMin = parseNum(formData.stopPowerMin) || 0;
  const stopCountChangeMin = parseNum(formData.stopCountChangeMin) || 0;
  const stopCreelChangeMin = parseNum(formData.stopCreelChangeMin) || 0;
  const stopPreventiveMin = parseNum(formData.stopPreventiveMin) || 0;
  const stopCreelShortMin = parseNum(formData.stopCreelShortMin) || 0;

  if (countNeValue !== null && tm !== null && tm >= 0 && countNeValue > 0) {
    result.tpi = (tm * Math.sqrt(countNeValue)).toFixed(3);
  } else {
    result.tpi = '';
  }

  const tpi = parseNum(result.tpi);

  if (beratConeKg !== null && jumlahCones !== null) {
    result.produksiKg = (beratConeKg * jumlahCones).toFixed(3);
    result.produksiLbs = (beratConeKg * jumlahCones * 2.2046).toFixed(3);
  } else {
    result.produksiKg = '';
    result.produksiLbs = '';
  }

  const produksiLbs = parseNum(result.produksiLbs);

  if (produksiLbs !== null) {
    result.produksiBalesActual = (produksiLbs / 400).toFixed(4);
  } else {
    result.produksiBalesActual = '';
  }

  const produksiBalesActual = parseNum(result.produksiBalesActual);

  if (
    spindlesInstalled !== null &&
    speed !== null &&
    countNeValue !== null &&
    tpi !== null &&
    tpi > 0
  ) {
    const numerator = spindlesInstalled * speed * 1440;
    const denominator = countNeValue * tpi * 840 * 36 * 400;
    result.produksiBales100 = (numerator / denominator).toFixed(4);
  } else {
    result.produksiBales100 = '';
  }

  const produksiBales100 = parseNum(result.produksiBales100);

  if (speed !== null && tpi !== null && tpi > 0 && countNeValue !== null && countNeValue > 0) {
    result.targetOps = (0.254 * speed * 0.9 / tpi / countNeValue).toFixed(6);
  } else {
    result.targetOps = '';
  }

  const targetOps = parseNum(result.targetOps);

  if (spindlesInstalled !== null && targetOps !== null) {
    result.targetBales = (spindlesInstalled * targetOps * 3 / 16 / 400).toFixed(4);
  } else {
    result.targetBales = '';
  }

  const totalPenghentian =
    stopPowerMin + stopCountChangeMin + stopCreelChangeMin + stopPreventiveMin + stopCreelShortMin;
  result.stopTotalMin = totalPenghentian.toString();

  if (spindlesInstalled !== null) {
    const spindlesWorking =
      ((spindlesInstalled * 1440) - (spindlesInstalled * totalPenghentian)) / 1440;
    result.spindlesWorking = spindlesWorking.toFixed(4);
  } else {
    result.spindlesWorking = '';
  }

  const spindlesWorking = parseNum(result.spindlesWorking);

  if (spindlesWorking !== null && spindlesInstalled !== null && spindlesInstalled > 0) {
    result.spindleEffPercent = (spindlesWorking / spindlesInstalled).toFixed(6);
  } else {
    result.spindleEffPercent = '';
  }

  if (produksiLbs !== null && spindlesInstalled !== null && spindlesInstalled > 0) {
    result.opsActual = ((produksiLbs * 16) / 3 / spindlesInstalled).toFixed(6);
  } else {
    result.opsActual = '';
  }

  if (produksiLbs !== null && spindlesWorking !== null && spindlesWorking > 0) {
    result.opsWorked = ((produksiLbs * 16) / 3 / spindlesWorking).toFixed(6);
  } else {
    result.opsWorked = '';
  }

  const opsWorked = parseNum(result.opsWorked);

  if (opsWorked !== null && targetOps !== null && spindlesInstalled !== null) {
    result.efisiensiBalesVsTarget = (
      (opsWorked - targetOps) * spindlesInstalled * 3 / 16 / 400
    ).toFixed(4);
  } else {
    result.efisiensiBalesVsTarget = '';
  }

  if (produksiBalesActual !== null && produksiBales100 !== null && produksiBales100 > 0) {
    result.produksiEffPercent = (produksiBalesActual / produksiBales100).toFixed(4);
  } else {
    result.produksiEffPercent = '';
  }

  if (opsWorked !== null && spindlesInstalled !== null && produksiBales100 !== null && produksiBales100 > 0) {
    const numerator = (opsWorked * spindlesInstalled * 3) / 1600 / 4;
    result.kerjaEffPercent = (numerator / produksiBales100).toFixed(4);
  } else {
    result.kerjaEffPercent = '';
  }

  if (opsWorked !== null && spindlesInstalled !== null) {
    result.lossPowerBales = (
      -(opsWorked * 3 * (spindlesInstalled * stopPowerMin / 1440) / 16 / 400)
    ).toFixed(4);
    result.lossCountChangeBales = (
      -(opsWorked * 3 * (spindlesInstalled * stopCountChangeMin / 1440) / 16 / 400)
    ).toFixed(4);
    result.lossCreelChangeBales = (
      -(opsWorked * 3 * (spindlesInstalled * stopCreelChangeMin / 1440) / 16 / 400)
    ).toFixed(4);
    result.lossPreventiveBales = (
      -(opsWorked * 3 * (spindlesInstalled * stopPreventiveMin / 1440) / 16 / 400)
    ).toFixed(4);
    result.lossCreelShortBales = (
      -(opsWorked * 3 * (spindlesInstalled * stopCreelShortMin / 1440) / 16 / 400)
    ).toFixed(4);
    result.lossTotalBales = (
      -(opsWorked * 3 * (spindlesInstalled * totalPenghentian / 1440) / 16 / 400)
    ).toFixed(4);
  } else {
    result.lossPowerBales = '';
    result.lossCountChangeBales = '';
    result.lossCreelChangeBales = '';
    result.lossPreventiveBales = '';
    result.lossCreelShortBales = '';
    result.lossTotalBales = '';
  }

  return result;
};

const ProductionForm = () => {
  const params = useParams() as any;
  const router = useRouter();

  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const isEdit = Boolean(id);
  const [formData, setFormData, clearPersistedForm] = usePersistedState<any>(
    'form_production_new',
    createEmptyRow as any,
    !isEdit,
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [units, setUnits] = useState<any[]>([]);
  const [yarnTypes, setYarnTypes] = useState<any[]>([]);
  const [counts, setCounts] = useState<any[]>([]);
  const [countDescriptions, setCountDescriptions] = useState<any[]>([]);
  const [slubCodes, setSlubCodes] = useState<any[]>([]);
  const [lots, setLots] = useState<any[]>([]);
  const [spks, setSpks] = useState<any[]>([]);
  const [blends, setBlends] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        setLoading(true);
        const [
          unitsData,
          yarnTypesData,
          countsData,
          countDescriptionsData,
          slubCodesData,
          lotsData,
          spksData,
          blendsData,
          colorsData,
        ] = (await Promise.all([
          apiCall(`${API_BASE_URL}/mills-units`),
          apiCall(`${API_BASE_URL}/yarn-types`),
          apiCall(`${API_BASE_URL}/counts`),
          apiCall(`${API_ENDPOINTS.unified}/count-descriptions`),
          apiCall(`${API_BASE_URL}/slub-codes`),
          apiCall(`${API_BASE_URL}/lots`),
          apiCall(`${API_BASE_URL}/spks`),
          apiCall(`${API_ENDPOINTS.unified}/blends`),
          apiCall(`${API_BASE_URL}/colors`),
        ])) as any[];

        setUnits(unitsData || []);
        setYarnTypes(yarnTypesData || []);
        setCounts(countsData || []);
        setCountDescriptions(countDescriptionsData || []);
        setSlubCodes(slubCodesData || []);
        setLots(lotsData || []);
        setSpks(spksData || []);
        setBlends(blendsData || []);
        setColors(colorsData || []);
      } catch (err: any) {
        const errorMessage = err?.message || err?.toString() || 'Unknown error';
        setFeedback({
          type: 'error',
          message: `Error loading dropdown data: ${errorMessage}`,
        });
      } finally {
        setLoading(false);
      }
    };

    loadDropdowns();
  }, []);

  useEffect(() => {
    const loadExisting = async () => {
      if (!isEdit) {
        setFormData(createEmptyRow());
        return;
      }

      try {
        setLoading(true);
        const record = (await apiCall(`${API_BASE_URL}/records/${id}`)) as any;
        setFormData(mapRecordToForm(record));
      } catch (err: any) {
        setFeedback({ type: 'error', message: `Error loading record: ${err.message}` });
      } finally {
        setLoading(false);
      }
    };

    loadExisting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setFormData((prev: any) => {
      const updated = { ...prev, [name]: value };

      const calculationFields = new Set([
        'beratConeKg',
        'jumlahCones',
        'tm',
        'countNeId',
        'speed',
        'spindlesInstalled',
        'stopPowerMin',
        'stopCountChangeMin',
        'stopCreelChangeMin',
        'stopPreventiveMin',
        'stopCreelShortMin',
      ]);

      if (calculationFields.has(name)) {
        return calculateProductionValues(updated, counts);
      }

      return updated;
    });
  };

  const pageTitle = useMemo(
    () => (isEdit ? 'Edit production row' : 'New production row'),
    [isEdit],
  );

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (!formData.date || !formData.unitPabrikId || !formData.yarnJenisBenangId || !formData.countNeId) {
      setFeedback({
        type: 'error',
        message: 'Required fields: Date, Unit Pabrik, Jenis Benang, Count (Ne).',
      });
      return;
    }

    try {
      setSaving(true);
      const payload = mapFormToAPI(formData);

      if (isEdit) {
        await apiCall(`${API_BASE_URL}/records/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiCall(`${API_BASE_URL}/records`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        clearPersistedForm();
      }

      router.push('/production');
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save record' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit || !id) return;
    if (!window.confirm('Are you sure you want to delete this production record?')) return;

    try {
      setSaving(true);
      await apiCall(`${API_BASE_URL}/records/${id}`, { method: 'DELETE' });
      router.push('/production');
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete record' });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push('/production');
  };

  return (
    <div className="production-module-container">
      <div className="production-module-content">
        <div
          className="form-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h2>{pageTitle}</h2>
            <p>Keep this screen focused on one production day. The database view is on a separate page.</p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={handleBack}>
            Back to database
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

        {loading ? (
          <div className="production-loading">Loading...</div>
        ) : (
          <form className="production-form production-form--standalone" onSubmit={handleSubmit}>
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
                  <label>Year</label>
                  <input
                    type="number"
                    name="year"
                    className="form-control"
                    value={formData.year}
                    onChange={handleChange}
                    min="2000"
                    max="2100"
                  />
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
                  <label>Count Description Code</label>
                  <select
                    name="countDescriptionCode"
                    className="form-control"
                    value={formData.countDescriptionCode}
                    onChange={handleChange}
                  >
                    <option value="">None</option>
                    {countDescriptions.map((cd: any) => (
                      <option key={cd.code} value={cd.code}>
                        {cd.code} - {cd.name}
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
                  <label>Blend</label>
                  <select
                    name="blendId"
                    className="form-control"
                    value={formData.blendId}
                    onChange={handleChange}
                  >
                    <option value="">None</option>
                    {blends.map((blend) => (
                      <option key={blend.id} value={blend.id}>
                        {blend.name}
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
                    type="text"
                    name="beratConeKg"
                    className="form-control"
                    value={formData.beratConeKg}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="production-form-section">
              <h4>Machine parameters</h4>
              <div className="production-form-grid">
                <div className="form-group">
                  <label>TM</label>
                  <input
                    type="text"
                    name="tm"
                    className="form-control"
                    value={formData.tm}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>TPI</label>
                  <input
                    type="text"
                    name="tpi"
                    className="form-control"
                    value={formatDecimalInput(formData.tpi, 3)}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Speed</label>
                  <input
                    type="text"
                    name="speed"
                    className="form-control"
                    value={formData.speed}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Jumlah Spindel / Rotor Terpasang</label>
                  <input
                    type="text"
                    name="spindlesInstalled"
                    className="form-control"
                    value={formData.spindlesInstalled}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="production-form-section">
              <h4>Actual &amp; target production</h4>
              <div className="production-form-grid">
                <div className="form-group">
                  <label>Jumlah Cones / Cheese</label>
                  <input
                    type="text"
                    name="jumlahCones"
                    className="form-control"
                    value={formData.jumlahCones}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Produksi (Kgs)</label>
                  <input
                    type="text"
                    name="produksiKg"
                    className="form-control"
                    value={formatDecimalInput(formData.produksiKg, 3)}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Produksi (Lbs)</label>
                  <input
                    type="text"
                    name="produksiLbs"
                    className="form-control"
                    value={formatDecimalInput(formData.produksiLbs, 3)}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Aktual Produksi (Bales)</label>
                  <input
                    type="text"
                    name="produksiBalesActual"
                    className="form-control"
                    value={formatDecimalInput(formData.produksiBalesActual, 4)}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>100% Produksi (Bales)</label>
                  <input
                    type="text"
                    name="produksiBales100"
                    className="form-control"
                    value={formatDecimalInput(formData.produksiBales100, 4)}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Target Produksi on Target OPR (Bales)</label>
                  <input
                    type="text"
                    name="targetBales"
                    className="form-control"
                    value={formatDecimalInput(formData.targetBales, 4)}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Keuntungan/Kerugian Efisiensi Bales on Target OPS / OPR</label>
                  <input
                    type="text"
                    name="efisiensiBalesVsTarget"
                    className="form-control"
                    value={formatDecimalInput(formData.efisiensiBalesVsTarget, 4)}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Target OPS / OPR</label>
                  <input
                    type="text"
                    name="targetOps"
                    className="form-control"
                    value={formatDecimalInput(formData.targetOps, 6)}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>OPS / OPR Aktual</label>
                  <input
                    type="text"
                    name="opsActual"
                    className="form-control"
                    value={formatDecimalInput(formData.opsActual, 6)}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>OPS / OPR Worked</label>
                  <input
                    type="text"
                    name="opsWorked"
                    className="form-control"
                    value={formatDecimalInput(formData.opsWorked, 6)}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Produksi Effisiensi %</label>
                  <input
                    type="text"
                    name="produksiEffPercent"
                    className="form-control"
                    value={formatDecimalInput(formData.produksiEffPercent, 4)}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Effisiensi % Kerja</label>
                  <input
                    type="text"
                    name="kerjaEffPercent"
                    className="form-control"
                    value={formatDecimalInput(formData.kerjaEffPercent, 4)}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="production-form-section">
              <h4>Stoppages (minutes)</h4>
              <div className="production-form-grid">
                <div className="form-group">
                  <label>Power / Electric (min)</label>
                  <input
                    type="text"
                    name="stopPowerMin"
                    className="form-control"
                    value={formData.stopPowerMin}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Count Mengubah (min)</label>
                  <input
                    type="text"
                    name="stopCountChangeMin"
                    className="form-control"
                    value={formData.stopCountChangeMin}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Creel Mengubah (min)</label>
                  <input
                    type="text"
                    name="stopCreelChangeMin"
                    className="form-control"
                    value={formData.stopCreelChangeMin}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Preventive Mtc/Rotor/Ring Change (min)</label>
                  <input
                    type="text"
                    name="stopPreventiveMin"
                    className="form-control"
                    value={formData.stopPreventiveMin}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Creel Short Stoppage (min)</label>
                  <input
                    type="text"
                    name="stopCreelShortMin"
                    className="form-control"
                    value={formData.stopCreelShortMin}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Total Penghentian (min)</label>
                  <input
                    type="text"
                    name="stopTotalMin"
                    className="form-control"
                    value={formData.stopTotalMin}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="production-form-section">
              <h4>Spindles / rotors</h4>
              <div className="production-form-grid">
                <div className="form-group">
                  <label>Spindles / Rotors Bekerja</label>
                  <input
                    type="text"
                    name="spindlesWorking"
                    className="form-control"
                    value={formatDecimalInput(formData.spindlesWorking, 4)}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Spindle / Rotors Effisiensi (%)</label>
                  <input
                    type="text"
                    name="spindleEffPercent"
                    className="form-control"
                    value={formatDecimalInput(formData.spindleEffPercent, 6)}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="production-form-section">
              <h4>Kerugian produksi (bales) &amp; harga</h4>
              <div className="production-form-grid">
                <div className="form-group">
                  <label>Kerugian Karena Power Penghentian (Bales)</label>
                  <input
                    type="text"
                    name="lossPowerBales"
                    className="form-control"
                    value={formatDecimalInput(formData.lossPowerBales, 4)}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Kerugian Karena Count Mengubah (Bales)</label>
                  <input
                    type="text"
                    name="lossCountChangeBales"
                    className="form-control"
                    value={formatDecimalInput(formData.lossCountChangeBales, 4)}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Kerugian Karena Creel Mengubah (Bales)</label>
                  <input
                    type="text"
                    name="lossCreelChangeBales"
                    className="form-control"
                    value={formatDecimalInput(formData.lossCreelChangeBales, 4)}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Kerugian Karena Preventive MTC/Rotor/Ring (Bales)</label>
                  <input
                    type="text"
                    name="lossPreventiveBales"
                    className="form-control"
                    value={formatDecimalInput(formData.lossPreventiveBales, 4)}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Kerugian Karena Creel (Sliver/Roving) Short (Bales)</label>
                  <input
                    type="text"
                    name="lossCreelShortBales"
                    className="form-control"
                    value={formatDecimalInput(formData.lossCreelShortBales, 4)}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Kerugian Total (Bales)</label>
                  <input
                    type="text"
                    name="lossTotalBales"
                    className="form-control"
                    value={formatDecimalInput(formData.lossTotalBales, 4)}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Harga Benang per Bale</label>
                  <input
                    type="text"
                    name="hargaPerBale"
                    className="form-control"
                    value={formData.hargaPerBale}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="production-form-actions production-form-actions--standalone">
              {isEdit && (
                <button
                  type="button"
                  className="btn btn-secondary production-delete-btn"
                  onClick={handleDelete}
                  disabled={saving}
                >
                  Delete record
                </button>
              )}
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create record'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProductionForm;

