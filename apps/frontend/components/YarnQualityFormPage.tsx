'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import './Production.css';
import { API_ENDPOINTS, apiCall } from '../lib/api';
import { parseLocalizedNumber } from '../lib/numberFormat';
import { toYMD, toStr } from '../lib/utils';

const API_BASE_URL = API_ENDPOINTS.quality;

type Column = {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'readonly';
  placeholder?: string;
};

// Mapping of text fields that should use dropdown UI instead of free text.
// We keep the existing `*Input` fields for display, but the actual selected
// value is the corresponding `*Id` field stored in the form row, similar to
// how the Production form works.
const DROPDOWN_FIELD_CONFIG: Record<
  string,
  {
    idField: string;
    sourceKey:
      | 'countNe'
      | 'lots'
      | 'spks'
      | 'yarnTypes'
      | 'blends'
      | 'suppliers'
      | 'millsUnits'
      | 'processSteps'
      | 'testTypes'
      | 'sides'
      | 'slubCodes';
  }
> = {
  countNeIdInput: { idField: 'countNeId', sourceKey: 'countNe' },
  lotInput: { idField: 'lotId', sourceKey: 'lots' },
  spkInput: { idField: 'spkId', sourceKey: 'spks' },
  yarnTypeInput: { idField: 'yarnTypeId', sourceKey: 'yarnTypes' },
  blendInput: { idField: 'blendId', sourceKey: 'blends' },
  slubCodeInput: { idField: 'slubCodeId', sourceKey: 'slubCodes' },
  supplierInput: { idField: 'supplierId', sourceKey: 'suppliers' },
  millsUnitInput: { idField: 'millsUnitId', sourceKey: 'millsUnits' },
  processStepInput: { idField: 'processStepId', sourceKey: 'processSteps' },
  testTypeInput: { idField: 'testTypeId', sourceKey: 'testTypes' },
  sideInput: { idField: 'sideId', sourceKey: 'sides' },
};

const YARN_COLUMNS: Column[] = [
  // Identification / dimensions
  { id: 'testDate', label: 'Test Date', type: 'date', placeholder: 'YYYY-MM-DD' },
  { id: 'countDescriptionCode', label: 'Count Desc (Auto)', type: 'readonly' },
  { id: 'countNeIdInput', label: 'Count NE', type: 'text', placeholder: 'e.g. 30' },
  { id: 'lotInput', label: 'Lot', type: 'text', placeholder: 'Lot (e.g. 1000.0)' },
  { id: 'spkInput', label: 'SPK', type: 'text', placeholder: 'SPK name' },
  { id: 'yarnTypeInput', label: 'Yarn Type', type: 'text', placeholder: 'Yarn type' },
  { id: 'blendInput', label: 'Blend', type: 'text', placeholder: 'Blend (optional)' },
  { id: 'slubCodeInput', label: 'Slub Code', type: 'text', placeholder: 'Code (opt.)' },
  { id: 'supplierInput', label: 'Supplier', type: 'text', placeholder: 'Supplier' },
  { id: 'millsUnitInput', label: 'Mills Unit', type: 'text', placeholder: 'Unit' },
  { id: 'processStepInput', label: 'Process Step', type: 'text', placeholder: 'Process step' },
  { id: 'testTypeInput', label: 'Test Type', type: 'text', placeholder: 'Test type' },
  { id: 'machineNo', label: 'Machine No', type: 'number' },
  { id: 'sideInput', label: 'Side', type: 'text', placeholder: 'A/B/...' },

  // Spinning parameters
  { id: 'sliverRovingNe', label: 'Sliver/Roving Ne', type: 'number' },
  { id: 'totalDraft', label: 'Total Draft (Auto)', type: 'readonly' },
  { id: 'twistMultiplier', label: 'TM', type: 'number' },
  { id: 'tpi', label: 'TPI (Auto)', type: 'readonly' },
  { id: 'tpm', label: 'TPM (Auto)', type: 'readonly' },
  { id: 'actualTwist', label: 'Actual Twist', type: 'number' },
  { id: 'rotorSpindleSpeed', label: 'Rotor/Spindle Speed', type: 'number' },

  // Count variation
  { id: 'meanNe', label: 'Mean Ne', type: 'number' },
  { id: 'minNe', label: 'Min Ne', type: 'number' },
  { id: 'maxNe', label: 'Max Ne', type: 'number' },
  { id: 'cvCountPercent', label: 'CV% Count', type: 'number' },

  // Strength properties
  { id: 'meanStrengthCn', label: 'Mean Strength (CN)', type: 'number' },
  { id: 'minStrengthCn', label: 'Min Strength (CN)', type: 'number' },
  { id: 'maxStrengthCn', label: 'Max Strength (CN)', type: 'number' },
  { id: 'cvStrengthPercent', label: 'CV% Strength', type: 'number' },
  { id: 'tenacityCnTex', label: 'Tenacity CN/Tex (Auto)', type: 'readonly' },
  { id: 'elongationPercent', label: 'Elongation %', type: 'number' },
  { id: 'clsp', label: 'CLSP (Auto)', type: 'readonly' },

  // Evenness / Uster
  { id: 'uPercent', label: 'U%', type: 'number' },
  { id: 'cvB', label: 'CVb', type: 'number' },
  { id: 'cvm', label: 'CVm', type: 'number' },
  { id: 'cvm1m', label: 'CVm 1m', type: 'number' },
  { id: 'cvm3m', label: 'CVm 3m', type: 'number' },
  { id: 'cvm10m', label: 'CVm 10m', type: 'number' },

  // IPI Ring
  { id: 'thin50Percent', label: 'Thin-50%', type: 'number' },
  { id: 'thick50Percent', label: 'Thick+50%', type: 'number' },
  { id: 'neps200Percent', label: 'Neps+200%', type: 'number' },
  { id: 'neps280Percent', label: 'Neps+280%', type: 'number' },
  { id: 'ipis', label: 'IPIs (Auto)', type: 'readonly' },

  // IPI OE
  { id: 'oeIpi', label: 'OE IPI (Auto)', type: 'readonly' },
  { id: 'thin30Percent', label: 'Thin-30%', type: 'number' },
  { id: 'thin40Percent', label: 'Thin-40%', type: 'number' },
  { id: 'thick35Percent', label: 'Thick+35%', type: 'number' },
  { id: 'neps140Percent', label: 'Neps+140%', type: 'number' },
  { id: 'shortIpi', label: 'Short IPI (Auto)', type: 'readonly' },

  // Hairiness & spectrogram
  { id: 'hairiness', label: 'Hairiness', type: 'number' },
  { id: 'sh', label: 'SH', type: 'number' },
  { id: 's1uPlusS2u', label: 'S1u + S2u', type: 'number' },
  { id: 's3u', label: 'S3u', type: 'number' },
  { id: 'dr1_5m5Percent', label: 'DR 1.5m 5%', type: 'number' },

  // Remarks
  { id: 'remarks', label: 'Remarks', type: 'text' },
];

const makeBlankRow = () => {
  const now = new Date();
  return {
    // Local-only fields
    _localId: `new-${now.getTime()}-${Math.random().toString(16).slice(2)}`,
    _status: 'new', // 'new' | 'clean' | 'dirty' | 'saving' | 'error'
    _error: '',

    id: null as any,

    // Identification
    testDate: '',
    testMonth: '',
    testYear: now.getFullYear(),

    countDescriptionCode: '',
    countNeId: '',
    countNeIdInput: '',

    lotId: '',
    lotInput: '',

    spkId: '',
    spkInput: '',

    yarnTypeId: '',
    yarnTypeInput: '',

    blendId: '',
    blendInput: '',

    slubCodeId: '',
    slubCodeInput: '',

    supplierId: '',
    supplierInput: '',

    millsUnitId: '',
    millsUnitInput: '',

    processStepId: '',
    processStepInput: '',

    testTypeId: '',
    testTypeInput: '',

    machineNo: '',
    sideId: '',
    sideInput: '',

    // Spinning parameters
    sliverRovingNe: '',
    totalDraft: '',
    twistMultiplier: '',
    tpi: '',
    tpm: '',
    actualTwist: '',
    rotorSpindleSpeed: '',

    // Count variation
    meanNe: '',
    minNe: '',
    maxNe: '',
    cvCountPercent: '',

    // Strength
    meanStrengthCn: '',
    minStrengthCn: '',
    maxStrengthCn: '',
    cvStrengthPercent: '',
    tenacityCnTex: '',
    elongationPercent: '',
    clsp: '',

    // Evenness
    uPercent: '',
    cvB: '',
    cvm: '',
    cvm1m: '',
    cvm3m: '',
    cvm10m: '',

    // IPI ring
    thin50Percent: '',
    thick50Percent: '',
    neps200Percent: '',
    neps280Percent: '',
    ipis: '',

    // IPI OE
    oeIpi: '',
    thin30Percent: '',
    thin40Percent: '',
    thick35Percent: '',
    neps140Percent: '',
    shortIpi: '',

    // Hairiness & spectrogram
    hairiness: '',
    sh: '',
    s1uPlusS2u: '',
    s3u: '',
    dr1_5m5Percent: '',

    // Remarks
    remarks: '',
  };
};

const calculateTotalDraft = (nominal: any, sliver: any) => {
  if (nominal && sliver && sliver !== 0) {
    return (nominal / sliver).toFixed(2);
  }
  return '';
};

const calculateTPI = (nominal: any, tm: any) => {
  if (nominal && tm) {
    return (Math.sqrt(nominal) * tm).toFixed(2);
  }
  return '';
};

const calculateTPM = (tpi: any) => {
  if (tpi) {
    return (tpi * 39.37).toFixed(2);
  }
  return '';
};

const calculateTenacity = (meanNe: any, meanStrength: any) => {
  if (meanNe && meanStrength) {
    return (meanNe * meanStrength * 0.001693).toFixed(2);
  }
  return '';
};

const calculateCLSP = (meanStrength: any, meanNe: any) => {
  if (meanStrength && meanNe) {
    return (((meanStrength / 0.9807) * 1.6934 * meanNe * 156.2) / 1000).toFixed(2);
  }
  return '';
};

const calculateIPIs = (thin50: any, thick50: any, neps200: any) => {
  const result =
    (parseInt(thin50, 10) || 0) + (parseInt(thick50, 10) || 0) + (parseInt(neps200, 10) || 0);
  return result || '';
};

const calculateOEIPI = (thin50: any, thick50: any, neps280: any) => {
  const result =
    (parseInt(thin50, 10) || 0) + (parseInt(thick50, 10) || 0) + (parseInt(neps280, 10) || 0);
  return result || '';
};

const calculateShortIPI = (thin40: any, thick35: any, neps140: any) => {
  const result =
    (parseInt(thin40, 10) || 0) + (parseInt(thick35, 10) || 0) + (parseInt(neps140, 10) || 0);
  return result || '';
};

const FIELD_GROUPS: Array<{ title: string; fields: string[] }> = [
  {
    title: 'Identity & yarn',
    fields: [
      'testDate',
      'countDescriptionCode',
      'countNeIdInput',
      'lotInput',
      'spkInput',
      'yarnTypeInput',
      'blendInput',
      'slubCodeInput',
      'supplierInput',
      'millsUnitInput',
      'processStepInput',
      'testTypeInput',
      'machineNo',
      'sideInput',
    ],
  },
  {
    title: 'Spinning parameters',
    fields: [
      'sliverRovingNe',
      'totalDraft',
      'twistMultiplier',
      'tpi',
      'tpm',
      'actualTwist',
      'rotorSpindleSpeed',
    ],
  },
  { title: 'Count variation', fields: ['meanNe', 'minNe', 'maxNe', 'cvCountPercent'] },
  {
    title: 'Strength',
    fields: [
      'meanStrengthCn',
      'minStrengthCn',
      'maxStrengthCn',
      'cvStrengthPercent',
      'tenacityCnTex',
      'elongationPercent',
      'clsp',
    ],
  },
  { title: 'Evenness / Uster', fields: ['uPercent', 'cvB', 'cvm', 'cvm1m', 'cvm3m', 'cvm10m'] },
  {
    title: 'IPI (Ring)',
    fields: ['thin50Percent', 'thick50Percent', 'neps200Percent', 'neps280Percent', 'ipis'],
  },
  {
    title: 'IPI (OE)',
    fields: [
      'oeIpi',
      'thin30Percent',
      'thin40Percent',
      'thick35Percent',
      'neps140Percent',
      'shortIpi',
    ],
  },
  { title: 'Hairiness & spectrogram', fields: ['hairiness', 'sh', 's1uPlusS2u', 's3u', 'dr1_5m5Percent'] },
  { title: 'Remarks', fields: ['remarks'] },
];

export default function YarnQualityFormPage() {
  const params = useParams() as { id?: string | string[] };
  const router = useRouter();

  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dropdownsLoaded, setDropdownsLoaded] = useState(false);

  const [dropdowns, setDropdowns] = useState({
    countNe: [] as any[],
    lots: [] as any[],
    spks: [] as any[],
    yarnTypes: [] as any[],
    blends: [] as any[],
    suppliers: [] as any[],
    millsUnits: [] as any[],
    processSteps: [] as any[],
    testTypes: [] as any[],
    sides: [] as any[],
    slubCodes: [] as any[],
  });

  const [formRow, setFormRow] = useState<ReturnType<typeof makeBlankRow>>(() => makeBlankRow());

  const loadDropdownsAndTests = async () => {
    try {
      setLoading(true);
      const reqs = [
        { key: 'countNe', url: `${API_ENDPOINTS.production}/counts` },
        { key: 'lots', url: `${API_BASE_URL}/lots` },
        { key: 'spks', url: `${API_BASE_URL}/spks` },
        { key: 'yarnTypes', url: `${API_BASE_URL}/yarn-types` },
        { key: 'blends', url: `${API_ENDPOINTS.unified}/blends` },
        { key: 'suppliers', url: `${API_BASE_URL}/suppliers` },
        { key: 'millsUnits', url: `${API_BASE_URL}/mills-units` },
        { key: 'processSteps', url: `${API_BASE_URL}/process-steps` },
        { key: 'testTypes', url: `${API_BASE_URL}/test-types` },
        { key: 'sides', url: `${API_BASE_URL}/sides` },
        { key: 'slubCodes', url: `${API_ENDPOINTS.production}/slub-codes` },
      ] as const;

      const results = await Promise.allSettled(reqs.map((r) => apiCall(r.url)));
      const nextDropdowns: any = {
        countNe: [],
        lots: [],
        spks: [],
        yarnTypes: [],
        blends: [],
        suppliers: [],
        millsUnits: [],
        processSteps: [],
        testTypes: [],
        sides: [],
        slubCodes: [],
      };

      const errors: string[] = [];
      results.forEach((res, idx) => {
        const { key, url } = reqs[idx];
        if (res.status === 'fulfilled') {
          nextDropdowns[key] = (res.value as any) || [];
        } else {
          errors.push(`${key}: ${res.reason?.message || String(res.reason)} (${url})`);
        }
      });

      setDropdowns(nextDropdowns);
      setDropdownsLoaded(true);

      if (errors.length) {
        setFormRow((prev) => ({
          ...prev,
          _status: 'error' as const,
          _error: `Failed to load some dropdowns. First error: ${errors[0]}`,
        }));
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error loading Quality dropdowns/tests:', err);
      const message = err instanceof Error ? err.message : 'Failed to load dropdown data';
      setFormRow((prev) => ({
        ...prev,
        _status: 'error' as const,
        _error: message,
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDropdownsAndTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadExisting = async () => {
      if (!isEdit) {
        setFormRow(makeBlankRow());
        return;
      }
      try {
        setLoading(true);
        const test = (await apiCall(`${API_BASE_URL}/yarn-tests/${id}`)) as Record<string, unknown>;
        loadTestIntoForm(test);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load record';
        setFormRow((prev) => ({
          ...prev,
          _status: 'error',
          _error: message,
        }));
      } finally {
        setLoading(false);
      }
    };

    if (dropdownsLoaded) {
      loadExisting();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit, dropdownsLoaded]);

  const recalcDerivedFields = (row: any) => {
    const updated = { ...row };

    const getCountNeValue = () => {
      const id = updated.countNeId;
      if (!id) return null;
      const selected = dropdowns.countNe.find((c) => c.id === parseInt(id, 10));
      return selected?.value ? parseLocalizedNumber(selected.value) : null;
    };

    const countNeValue = getCountNeValue();

    if (countNeValue && updated.sliverRovingNe) {
      const sliver = parseLocalizedNumber(updated.sliverRovingNe);
      if (sliver) {
        updated.totalDraft = calculateTotalDraft(countNeValue, sliver);
      }
    }

    if (countNeValue && updated.twistMultiplier) {
      const tm = parseLocalizedNumber(updated.twistMultiplier);
      if (tm) {
        const tpi = calculateTPI(countNeValue, tm);
        updated.tpi = tpi;
        updated.tpm = calculateTPM(parseLocalizedNumber(tpi));
      }
    } else if (updated.tpi) {
      updated.tpm = calculateTPM(parseLocalizedNumber(updated.tpi));
    }

    if (updated.meanNe || updated.meanStrengthCn) {
      const meanNeNum = updated.meanNe ? parseLocalizedNumber(updated.meanNe) : null;
      const meanStrengthNum = updated.meanStrengthCn
        ? parseLocalizedNumber(updated.meanStrengthCn)
        : null;
      if (meanNeNum && meanStrengthNum) {
        updated.tenacityCnTex = calculateTenacity(meanNeNum, meanStrengthNum);
        updated.clsp = calculateCLSP(meanStrengthNum, meanNeNum);
      }
    }

    updated.ipis = calculateIPIs(updated.thin50Percent, updated.thick50Percent, updated.neps200Percent);
    updated.oeIpi = calculateOEIPI(updated.thin50Percent, updated.thick50Percent, updated.neps280Percent);
    updated.shortIpi = calculateShortIPI(updated.thin40Percent, updated.thick35Percent, updated.neps140Percent);

    return updated;
  };

  const buildCountDescription = (row: any, dd: any) => {
    const parts: string[] = [];

    const millsUnit = dd.millsUnits.find((u: any) => u.id === parseInt(row.millsUnitId || '', 10));
    if (millsUnit?.letterCode) parts.push(millsUnit.letterCode);

    const blend = dd.blends.find((b: any) => b.id === parseInt(row.blendId || '', 10));
    if (blend?.letterCode) parts.push(blend.letterCode);

    const yarnType = dd.yarnTypes.find((yt: any) => yt.id === parseInt(row.yarnTypeId || '', 10));
    if (yarnType?.letterCode) parts.push(yarnType.letterCode);

    const lot = dd.lots.find((l: any) => l.id === parseInt(row.lotId || '', 10));
    if (lot?.name) parts.push(lot.name);

    const countNeItem = dd.countNe.find((c: any) => c.id === parseInt(row.countNeId || '', 10));
    if (countNeItem?.value) parts.push(String(countNeItem.value));

    return parts.length >= 4 ? parts.join(' ') : '';
  };

  const handleChange = (name: string, value: string) => {
    setFormRow((prev) => {
      const updated = { ...prev, [name]: value, _error: '' };
      updated._status = prev._status === 'new' ? 'new' : 'dirty';

      if (name === 'countNeIdInput') {
        updated.countNeId = '';
      }

      if (name === 'testDate') {
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) {
          updated.testMonth = date.toLocaleString('en-US', { month: 'long' });
          updated.testYear = date.getFullYear();
        }
      }

      const recalculated = recalcDerivedFields(updated);
      recalculated.countDescriptionCode = buildCountDescription(recalculated, dropdowns);
      return recalculated;
    });
  };

  const validateLookup = async (field: string) => {
    const row = formRow;
    const setError = (msg: string) => setFormRow((prev) => ({ ...prev, _error: msg }));

    if (field === 'lotInput') {
      const value = (row.lotInput || '').trim();
      if (!value) {
        setError('Lot is required');
        setFormRow((prev) => ({ ...prev, lotId: '', blendId: '' }));
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/lots/lookup/by-value/${encodeURIComponent(value)}`);
        if (!res.ok) {
          setError('Lot not found in database');
          setFormRow((prev) => ({ ...prev, lotId: '', blendId: '' }));
          return;
        }
        const lot = await res.json();
        setFormRow((prev) => {
          const updated = {
            ...prev,
            lotId: String(lot.id),
            blendId: lot.blendId ? String(lot.blendId) : prev.blendId,
            _error: '',
          };
          updated.countDescriptionCode = buildCountDescription(updated, dropdowns);
          return updated;
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error validating lot in form:', err);
        setError('Failed to validate lot, please try again');
      }
      return;
    }

    if (field === 'countNeIdInput') {
      const value = (row.countNeIdInput || '').trim();
      if (!value) {
        setFormRow((prev) => ({ ...prev, countNeId: '', countNeIdInput: '' }));
        return;
      }
      const match = dropdowns.countNe.find(
        (c) => String(c.value) === value || String(c.value) === value.replace(',', '.'),
      );
      if (!match) {
        setError('Count NE not found');
        setFormRow((prev) => ({ ...prev, countNeId: '', countNeIdInput: value }));
        return;
      }
      setFormRow((prev) => {
        const updated = {
          ...prev,
          countNeId: String(match.id),
          countNeIdInput: String(match.value),
          _error: '',
        };
        const recalced = recalcDerivedFields(updated);
        recalced.countDescriptionCode = buildCountDescription(recalced, dropdowns);
        return recalced;
      });
      return;
    }

    const map: any = {
      spkInput: { list: dropdowns.spks, idField: 'spkId' },
      yarnTypeInput: { list: dropdowns.yarnTypes, idField: 'yarnTypeId' },
      blendInput: { list: dropdowns.blends, idField: 'blendId' },
      slubCodeInput: { list: dropdowns.slubCodes, idField: 'slubCodeId' },
      supplierInput: { list: dropdowns.suppliers, idField: 'supplierId' },
      millsUnitInput: { list: dropdowns.millsUnits, idField: 'millsUnitId' },
      processStepInput: { list: dropdowns.processSteps, idField: 'processStepId' },
      testTypeInput: { list: dropdowns.testTypes, idField: 'testTypeId' },
      sideInput: { list: dropdowns.sides, idField: 'sideId' },
    };

    const cfg = map[field];
    if (!cfg) return;

    const rowRecord = row as Record<string, unknown>;
    const value = ((rowRecord[field] as string) || '').trim();
    if (!value) {
      setFormRow((prev: ReturnType<typeof makeBlankRow>) => ({ ...prev, [cfg.idField]: '', [field]: '' }));
      return;
    }

    const match = cfg.list.find((item: { id: number; name: string }) => item.name === value);
    if (!match) {
      setError('Value not found in dropdown options');
      return;
    }

    setFormRow((prev: ReturnType<typeof makeBlankRow>) => {
      const updated: ReturnType<typeof makeBlankRow> = {
        ...prev,
        [cfg.idField]: String(match.id),
        [field]: match.name,
        _error: '',
      };
      updated.countDescriptionCode = buildCountDescription(updated, dropdowns);
      return updated;
    });
  };

  const buildSubmitPayload = (row: ReturnType<typeof makeBlankRow>) => {
    const payload = { ...row } as Record<string, unknown>;
    delete payload._localId;
    delete payload._status;
    delete payload._error;

    delete payload.countDescriptionCode;
    delete payload.countNeIdInput;
    delete payload.lotInput;
    delete payload.spkInput;
    delete payload.yarnTypeInput;
    delete payload.blendInput;
    delete payload.slubCodeInput;
    delete payload.supplierInput;
    delete payload.millsUnitInput;
    delete payload.processStepInput;
    delete payload.testTypeInput;
    delete payload.sideInput;

    return payload;
  };

  const handleSave = async () => {
    const row = formRow;

    if (row.countNeIdInput && !row.countNeId) {
      setFormRow((prev) => ({ ...prev, _error: 'Count NE not found in dropdown options' }));
      return;
    }

    setSaving(true);
    setFormRow((prev) => ({ ...prev, _status: 'saving' as const, _error: '' }));

    try {
      const payload = buildSubmitPayload(row);
      const isNew = !row.id;
      const url = isNew ? `${API_BASE_URL}/yarn-tests` : `${API_BASE_URL}/yarn-tests/${row.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        throw new Error(errorBody.error || 'Failed to save');
      }

      await res.json().catch(() => null);
      router.push('/quality');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error saving quality test:', err);
      const message = err instanceof Error ? err.message : 'Failed to save';
      setFormRow((prev) => ({ ...prev, _status: 'error', _error: message }));
    } finally {
      setSaving(false);
    }
  };

  const handleNew = () => {
    router.push('/quality/new');
    setFormRow(makeBlankRow());
  };

  const handleBack = () => {
    router.push('/quality');
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    // eslint-disable-next-line no-alert
    const ok = window.confirm('Delete this yarn test? This action cannot be undone.');
    if (!ok) return;
    try {
      setSaving(true);
      await apiCall(`${API_BASE_URL}/yarn-tests/${id}`, { method: 'DELETE' });
      router.push('/quality');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete';
      setFormRow((prev) => ({ ...prev, _status: 'error', _error: message }));
    } finally {
      setSaving(false);
    }
  };

  const loadTestIntoForm = (test: any) => {
    const row = makeBlankRow();
    row._localId = `existing-${test.id}`;
    row._status = 'clean';
    row.id = test.id;

    row.testDate = toYMD(test.testDate);
    row.testMonth = test.testMonth || '';
    row.testYear = test.testYear || '';

    row.countDescriptionCode = toStr(test.countDescriptionCode || test.countDescription?.code);

    row.countNeId = toStr(test.countNeId || test.countNe?.id);
    row.countNeIdInput = test.countNe ? toStr(test.countNe.value) : '';

    row.lotId = toStr(test.lotId || test.lot?.id);
    row.lotInput = test.lot?.name || '';

    row.spkId = toStr(test.spkId || test.spk?.id);
    row.spkInput = test.spk?.name || '';

    row.yarnTypeId = toStr(test.yarnTypeId || test.yarnType?.id);
    row.yarnTypeInput = test.yarnType?.name || '';

    row.blendId = toStr(test.blendId || test.blend?.id);
    row.blendInput = test.blend?.name || '';

    row.slubCodeId = toStr(test.slubCodeId || test.slubCode?.id);
    row.slubCodeInput = test.slubCode?.name || test.slubCode?.code || '';

    row.supplierId = toStr(test.supplierId || test.supplier?.id);
    row.supplierInput = test.supplier?.name || '';

    row.millsUnitId = toStr(test.millsUnitId || test.millsUnit?.id);
    row.millsUnitInput = test.millsUnit?.name || '';

    row.processStepId = toStr(test.processStepId || test.processStep?.id);
    row.processStepInput = test.processStep?.name || '';

    row.testTypeId = toStr(test.testTypeId || test.testType?.id);
    row.testTypeInput = test.testType?.name || '';

    row.machineNo = toStr(test.machineNo);
    row.sideId = toStr(test.sideId || test.side?.id);
    row.sideInput = test.side?.name || '';

    row.sliverRovingNe = toStr(test.sliverRovingNe);
    row.totalDraft = toStr(test.totalDraft);
    row.twistMultiplier = toStr(test.twistMultiplier);
    row.tpi = toStr(test.tpi);
    row.tpm = toStr(test.tpm);
    row.actualTwist = toStr(test.actualTwist);
    row.rotorSpindleSpeed = toStr(test.rotorSpindleSpeed);

    row.meanNe = toStr(test.meanNe);
    row.minNe = toStr(test.minNe);
    row.maxNe = toStr(test.maxNe);
    row.cvCountPercent = toStr(test.cvCountPercent);

    row.meanStrengthCn = toStr(test.meanStrengthCn);
    row.minStrengthCn = toStr(test.minStrengthCn);
    row.maxStrengthCn = toStr(test.maxStrengthCn);
    row.cvStrengthPercent = toStr(test.cvStrengthPercent);
    row.tenacityCnTex = toStr(test.tenacityCnTex);
    row.elongationPercent = toStr(test.elongationPercent);
    row.clsp = toStr(test.clsp);

    row.uPercent = toStr(test.uPercent);
    row.cvB = toStr(test.cvB);
    row.cvm = toStr(test.cvm);
    row.cvm1m = toStr(test.cvm1m);
    row.cvm3m = toStr(test.cvm3m);
    row.cvm10m = toStr(test.cvm10m);

    row.thin50Percent = toStr(test.thin50Percent);
    row.thick50Percent = toStr(test.thick50Percent);
    row.neps200Percent = toStr(test.neps200Percent);
    row.neps280Percent = toStr(test.neps280Percent);
    row.ipis = toStr(test.ipis);

    row.oeIpi = toStr(test.oeIpi);
    row.thin30Percent = toStr(test.thin30Percent);
    row.thin40Percent = toStr(test.thin40Percent);
    row.thick35Percent = toStr(test.thick35Percent);
    row.neps140Percent = toStr(test.neps140Percent);
    row.shortIpi = toStr(test.shortIpi);

    row.hairiness = toStr(test.hairiness);
    row.sh = toStr(test.sh);
    row.s1uPlusS2u = toStr(test.s1uPlusS2u);
    row.s3u = toStr(test.s3u);
    row.dr1_5m5Percent = toStr(test.dr1_5m5Percent);

    row.remarks = toStr(test.remarks);

    setFormRow(recalcDerivedFields(row));
  };

  const colById = useMemo(() => {
    const m = new Map<string, Column>();
    YARN_COLUMNS.forEach((c) => m.set(c.id, c));
    return m;
  }, []);

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
            <h2>{isEdit ? 'Edit Yarn Test' : 'New Yarn Test'}</h2>
            <p>Keep this screen focused on one test record. The database view is on a separate page.</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button type="button" className="btn btn-secondary" onClick={handleBack} disabled={saving}>
              Back to database
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleNew} disabled={saving}>
              New
            </button>
            {isEdit ? (
              <button type="button" className="btn btn-secondary" onClick={handleDelete} disabled={saving}>
                Delete
              </button>
            ) : null}
            <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : formRow?.id ? 'Save changes' : 'Save'}
            </button>
          </div>
        </div>

        {formRow?._error ? (
          <div className="production-alert production-alert--error">{formRow._error}</div>
        ) : null}

        {loading ? (
          <div className="production-loading">Loading...</div>
        ) : (
          <div className="production-form production-form--standalone">
            {FIELD_GROUPS.map((group) => (
              <div key={group.title} className="production-form-section">
                <h4>{group.title}</h4>
                <div className="production-form-grid">
                  {group.fields.map((fieldId) => {
                    const col = colById.get(fieldId);
                    if (!col) return null;
                    const formRowRecord = formRow as unknown as Record<string, unknown>;
                    const value = (formRowRecord[col.id] as string) ?? '';
                    const isReadOnly = col.type === 'readonly';

                    const dropdownCfg = DROPDOWN_FIELD_CONFIG[col.id];

                    // For dropdown-backed fields, render a <select> using the same
                    // UI style as the production module, while still keeping the
                    // `*Input` field in sync for display/derived values.
                    if (dropdownCfg) {
                      const options = (dropdowns as Record<string, unknown>)[dropdownCfg.sourceKey] as Array<{ id: number; name?: string; code?: string; value?: string | number }> || [];
                      const selectedId = (formRowRecord[dropdownCfg.idField] as string) || '';

                      const getOptionLabel = (item: { value?: string | number; name?: string; code?: string }) => {
                        if (col.id === 'countNeIdInput') {
                          return String(item.value ?? '');
                        }
                        if (col.id === 'slubCodeInput') {
                          return item.name || item.code || '';
                        }
                        return item.name ?? '';
                      };

                      return (
                        <div key={col.id} className="form-group">
                          <label>{col.label}</label>
                          <select
                            name={dropdownCfg.idField}
                            className="form-control"
                            value={selectedId}
                            onChange={(e) => {
                              const newId = e.target.value;
                              const selected = options.find(
                                (opt) => String(opt.id) === String(newId),
                              );
                              setFormRow((prev) => {
                                const updated: ReturnType<typeof makeBlankRow> = {
                                  ...prev,
                                  [dropdownCfg.idField]: newId,
                                  _error: '',
                                };

                                if (selected) {
                                  if (col.id === 'countNeIdInput') {
                                    updated.countNeIdInput =
                                      selected.value !== undefined && selected.value !== null
                                        ? String(selected.value)
                                        : '';
                                  } else {
                                    (updated as Record<string, unknown>)[col.id] = getOptionLabel(selected);
                                  }
                                } else {
                                  (updated as Record<string, unknown>)[col.id] = '';
                                }

                                updated._status = prev._status === 'new' ? 'new' : 'dirty';
                                const recalculated = recalcDerivedFields(updated);
                                recalculated.countDescriptionCode = buildCountDescription(recalculated, dropdowns);
                                return recalculated;
                              });
                            }}
                          >
                            <option value="">Select...</option>
                            {options.map((item) => (
                              <option key={item.id} value={item.id}>
                                {getOptionLabel(item)}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    }

                    return (
                      <div key={col.id} className="form-group">
                        <label>{col.label}</label>
                        <input
                          type={col.type === 'date' ? 'date' : 'text'}
                          name={col.id}
                          className="form-control"
                          value={value}
                          placeholder={col.placeholder}
                          readOnly={isReadOnly}
                          inputMode={col.type === 'number' ? 'decimal' : undefined}
                          onChange={(e) => handleChange(col.id, e.target.value)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

