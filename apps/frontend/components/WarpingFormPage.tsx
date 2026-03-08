'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import './Production.css';
import { API_ENDPOINTS, apiCall } from '../lib/api';

const API_BASE_URL = API_ENDPOINTS.warping;

type WarpingFormRow = {
  id: number | null;
  tgl: string;
  start: string;
  stop: string;
  kp: string;
  kode: string;
  benang: string;
  lot: string;
  sp: string;
  pt: string;
  te: string;
  rpm: string;
  mtrPerMin: string;
  // Putusan 1–15
  [key: string]: any;
};

const pad2 = (n: number) => String(n).padStart(2, '0');
const toYMD = (value: any) => {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const makeBlankRow = (): WarpingFormRow => {
  const now = new Date();
  const blank: WarpingFormRow = {
    id: null,
    tgl: toYMD(now),
    start: '',
    stop: '',
    kp: '',
    kode: '',
    benang: '',
    lot: '',
    sp: '',
    pt: '',
    te: '',
    rpm: '',
    mtrPerMin: '',
  };

  for (let i = 1; i <= 15; i += 1) {
    blank[`putusan${i}`] = '';
    blank[`noBeam${i}`] = '';
  }

  blank.totalPutusan = '';
  blank.totalBeam = '';
  blank.oneCn = '';
  blank.jam = '';
  blank.totalWaktu = '';
  blank.effWarping = '';
  blank.noMc = '';
  blank.elongasi = '';
  blank.strength = '';
  blank.cvPercent = '';
  blank.tensionBadan = '';
  blank.tensionPinggir = '';
  blank.lebarCreel = '';
  blank.t01 = '';

  return blank;
};

const mapRecordToForm = (record: any): WarpingFormRow => {
  if (!record) return makeBlankRow();
  const row = makeBlankRow();
  row.id = record.id ?? null;

  row.tgl = toYMD(record.tgl);
  row.start = record.start ?? '';
  row.stop = record.stop ?? '';
  row.kp = record.kp ?? '';
  row.kode = record.kode ?? '';
  row.benang = record.benang ?? '';
  row.lot = record.lot ?? '';
  row.sp = record.sp ?? '';
  row.pt = record.pt?.toString() ?? '';
  row.te = record.te?.toString() ?? '';
  row.rpm = record.rpm?.toString() ?? '';
  row.mtrPerMin = record.mtrPerMin?.toString() ?? '';

  for (let i = 1; i <= 15; i += 1) {
    row[`putusan${i}`] = record[`putusan${i}`]?.toString() ?? '';
    row[`noBeam${i}`] = record[`noBeam${i}`]?.toString() ?? '';
  }

  row.totalPutusan = record.totalPutusan?.toString() ?? '';
  row.totalBeam = record.totalBeam?.toString() ?? '';
  row.oneCn = record.oneCn?.toString() ?? '';
  row.jam = record.jam?.toString() ?? '';
  row.totalWaktu = record.totalWaktu?.toString() ?? '';
  row.effWarping = record.effWarping?.toString() ?? '';
  row.noMc = record.noMc?.toString() ?? '';
  row.elongasi = record.elongasi?.toString() ?? '';
  row.strength = record.strength?.toString() ?? '';
  row.cvPercent = record.cvPercent?.toString() ?? '';
  row.tensionBadan = record.tensionBadan?.toString() ?? '';
  row.tensionPinggir = record.tensionPinggir?.toString() ?? '';
  row.lebarCreel = record.lebarCreel?.toString() ?? '';
  row.t01 = record.t01?.toString() ?? '';

  return row;
};

const mapFormToPayload = (form: WarpingFormRow) => {
  const payload: any = {};

  if (form.tgl) payload.tgl = form.tgl;
  if (form.start) payload.start = form.start;
  if (form.stop) payload.stop = form.stop;
  if (form.kp) payload.kp = form.kp;
  if (form.kode) payload.kode = form.kode;
  if (form.benang) payload.benang = form.benang;
  if (form.lot) payload.lot = form.lot;
  if (form.sp) payload.sp = form.sp;

  payload.pt = form.pt ? Number(form.pt) : null;
  payload.te = form.te ? Number(form.te) : null;
  payload.rpm = form.rpm ? Number(form.rpm) : null;
  payload.mtrPerMin = form.mtrPerMin ? Number(form.mtrPerMin) : null;

  for (let i = 1; i <= 15; i += 1) {
    const putusanVal = form[`putusan${i}`];
    const beamVal = form[`noBeam${i}`];
    payload[`putusan${i}`] = putusanVal !== '' ? Number(putusanVal) : null;
    payload[`noBeam${i}`] = beamVal || null;
  }

  payload.totalPutusan = form.totalPutusan ? Number(form.totalPutusan) : null;
  payload.totalBeam = form.totalBeam ? Number(form.totalBeam) : null;
  payload.oneCn = form.oneCn ? Number(form.oneCn) : null;
  payload.jam = form.jam ? Number(form.jam) : null;
  payload.totalWaktu = form.totalWaktu ? Number(form.totalWaktu) : null;
  payload.effWarping = form.effWarping ? Number(form.effWarping) : null;
  payload.noMc = form.noMc || null;
  payload.elongasi = form.elongasi ? Number(form.elongasi) : null;
  payload.strength = form.strength ? Number(form.strength) : null;
  payload.cvPercent = form.cvPercent ? Number(form.cvPercent) : null;
  payload.tensionBadan = form.tensionBadan ? Number(form.tensionBadan) : null;
  payload.tensionPinggir = form.tensionPinggir ? Number(form.tensionPinggir) : null;
  payload.lebarCreel = form.lebarCreel ? Number(form.lebarCreel) : null;
  payload.t01 = form.t01 ? Number(form.t01) : null;

  return payload;
};

const WARPING_FORM_FIELDS: { id: keyof WarpingFormRow | string; label: string; type?: string }[] = [
  { id: 'tgl', label: 'TGL', type: 'date' },
  { id: 'start', label: 'START' },
  { id: 'stop', label: 'STOP' },
  { id: 'kp', label: 'KP' },
  { id: 'kode', label: 'KODE' },
  { id: 'benang', label: 'BENANG' },
  { id: 'lot', label: 'LOT' },
  { id: 'sp', label: 'SP' },
  { id: 'pt', label: 'PT' },
  { id: 'te', label: 'TE' },
  { id: 'rpm', label: 'RPM' },
  { id: 'mtrPerMin', label: 'MTR/MIN' },
];

export default function WarpingFormPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = useMemo(() => {
    const raw = (params?.id as string | string[] | undefined) || undefined;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [params]);

  const isEditMode = !!idParam;

  const [row, setRow] = useState<WarpingFormRow>(makeBlankRow);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: string; message: string }>({ type: '', message: '' });

  // In future we may have dropdowns (machines, yarn, lot, etc.) – keep API pattern ready.
  const [dropdownErrors, setDropdownErrors] = useState<string>('');

  const loadRecord = async () => {
    if (!isEditMode || !idParam) return;
    try {
      setLoading(true);
      setFeedback({ type: '', message: '' });
      const record = (await apiCall(`${API_BASE_URL}/records/${idParam}`)) as any;
      setRow(mapRecordToForm(record));
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to load warping record',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDropdowns = async () => {
    // Placeholder for future dropdowns; pattern matches quality/production (Promise.allSettled)
    try {
      setDropdownErrors('');
      const results = await Promise.allSettled<any>([
        // Example: apiCall(`${API_ENDPOINTS.unified}/machines`),
      ]);

      const errors: string[] = [];
      results.forEach((res) => {
        if (res.status === 'rejected') {
          errors.push(res.reason?.message || 'Failed to load some dropdown data');
        }
      });

      if (errors.length > 0) {
        setDropdownErrors(errors[0]);
      }
    } catch (err: any) {
      setDropdownErrors(err?.message || 'Failed to load some dropdown data');
    }
  };

  useEffect(() => {
    loadDropdowns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadRecord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idParam]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRow((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setFeedback({ type: '', message: '' });
      const payload = mapFormToPayload(row);

      if (isEditMode && idParam) {
        await apiCall(`${API_BASE_URL}/records/${idParam}`, {
          method: 'PUT',
          body: payload,
        });
        setFeedback({ type: 'success', message: 'Warping record updated successfully.' });
      } else {
        await apiCall(`${API_BASE_URL}/records`, {
          method: 'POST',
          body: payload,
        });
        setFeedback({ type: 'success', message: 'Warping record created successfully.' });
      }

      router.push('/warping');
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to save warping record',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="production-module-container">
      <div className="production-list-header">
        <h2>{isEditMode ? 'Edit Warping Record' : 'New Warping Record'}</h2>
        <p>Enter warping production data.</p>
      </div>

      <div className="production-module-content">
        {(feedback.message || dropdownErrors) && (
          <div
            className={`production-alert production-alert--${
              feedback.type === 'error' || dropdownErrors ? 'error' : 'success'
            }`}
          >
            {dropdownErrors || feedback.message}
          </div>
        )}

        {loading && <div className="production-loading">Loading...</div>}

        <form className="production-form" onSubmit={handleSubmit}>
          <section className="production-form-section">
            <h3>General</h3>
            <div className="production-form-grid">
              {WARPING_FORM_FIELDS.map((field) => (
                <div key={String(field.id)} className="form-group">
                  <label htmlFor={String(field.id)}>{field.label}</label>
                  <input
                    className="form-control"
                    id={String(field.id)}
                    name={String(field.id)}
                    type={field.type || 'text'}
                    value={row[field.id] ?? ''}
                    onChange={handleChange}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="production-form-section">
            <h3>Putusan & Beam Data</h3>
            <div className="production-form-grid production-form-grid--wide">
              {Array.from({ length: 15 }).map((_, idx) => {
                const num = idx + 1;
                const putusanKey = `putusan${num}`;
                return (
                  <div key={`putusan-${num}`} className="form-group">
                    <label htmlFor={putusanKey}>{`PUTUSAN ${num}`}</label>
                    <input
                      className="form-control"
                      id={putusanKey}
                      name={putusanKey}
                      type="number"
                      value={row[putusanKey] ?? ''}
                      onChange={handleChange}
                    />
                  </div>
                );
              })}
              {Array.from({ length: 15 }).map((_, idx) => {
                const num = idx + 1;
                const beamKey = `noBeam${num}`;
                return (
                  <div key={`beam-${num}`} className="form-group">
                    <label htmlFor={beamKey}>{`No beam ${num}`}</label>
                    <input
                      className="form-control"
                      id={beamKey}
                      name={beamKey}
                      type="text"
                      value={row[beamKey] ?? ''}
                      onChange={handleChange}
                    />
                  </div>
                );
              })}
            </div>
          </section>

          <section className="production-form-section">
            <h3>Totals & Quality</h3>
            <div className="production-form-grid">
              <div className="form-group">
                <label htmlFor="totalPutusan">TOTAL PUTUSAN</label>
                <input
                  className="form-control"
                  id="totalPutusan"
                  name="totalPutusan"
                  type="number"
                  value={row.totalPutusan ?? ''}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="totalBeam">Total Beam</label>
                <input
                  className="form-control"
                  id="totalBeam"
                  name="totalBeam"
                  type="number"
                  value={row.totalBeam ?? ''}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="oneCn">1 CN</label>
                <input
                  className="form-control"
                  id="oneCn"
                  name="oneCn"
                  type="number"
                  value={row.oneCn ?? ''}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="jam">Jam</label>
                <input
                  className="form-control"
                  id="jam"
                  name="jam"
                  type="number"
                  value={row.jam ?? ''}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="totalWaktu">Total Waktu</label>
                <input
                  className="form-control"
                  id="totalWaktu"
                  name="totalWaktu"
                  type="number"
                  value={row.totalWaktu ?? ''}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="effWarping">EFF WARPING</label>
                <input
                  className="form-control"
                  id="effWarping"
                  name="effWarping"
                  type="number"
                  value={row.effWarping ?? ''}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="noMc">NO MC</label>
                <input
                  className="form-control"
                  id="noMc"
                  name="noMc"
                  type="text"
                  value={row.noMc ?? ''}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="elongasi">ELONGASI</label>
                <input
                  className="form-control"
                  id="elongasi"
                  name="elongasi"
                  type="number"
                  value={row.elongasi ?? ''}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="strength">STRENGTH</label>
                <input
                  className="form-control"
                  id="strength"
                  name="strength"
                  type="number"
                  value={row.strength ?? ''}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="cvPercent">CV%</label>
                <input
                  className="form-control"
                  id="cvPercent"
                  name="cvPercent"
                  type="number"
                  value={row.cvPercent ?? ''}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="tensionBadan">TENSION BADAN</label>
                <input
                  className="form-control"
                  id="tensionBadan"
                  name="tensionBadan"
                  type="number"
                  value={row.tensionBadan ?? ''}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="tensionPinggir">TENSION PINGGIR</label>
                <input
                  className="form-control"
                  id="tensionPinggir"
                  name="tensionPinggir"
                  type="number"
                  value={row.tensionPinggir ?? ''}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lebarCreel">LEBAR CREEL</label>
                <input
                  className="form-control"
                  id="lebarCreel"
                  name="lebarCreel"
                  type="number"
                  value={row.lebarCreel ?? ''}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="t01">T01</label>
                <input
                  className="form-control"
                  id="t01"
                  name="t01"
                  type="number"
                  value={row.t01 ?? ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          <div className="production-form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => router.push('/warping')}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {isEditMode ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

