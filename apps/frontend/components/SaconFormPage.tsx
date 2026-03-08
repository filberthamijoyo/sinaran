'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import './Production.css';
import { API_ENDPOINTS, apiCall } from '../lib/api';
import { toYMD, toStr } from '../lib/utils';
import { SACON_COLUMNS } from './SaconColumns';

const API_BASE_URL = API_ENDPOINTS.sacon;

type Feedback = { type: '' | 'error' | 'success'; message: string };

const createEmptyForm = () => {
  const form: any = {
    id: '',
  };

  SACON_COLUMNS.forEach((col) => {
    form[col.id] = '';
  });

  return form;
};

const mapRecordToForm = (record: any) => {
  if (!record) return createEmptyForm();

  const form = createEmptyForm();
  form.id = record.id?.toString() || '';

  SACON_COLUMNS.forEach((col) => {
    if (col.id === 'tgl') {
      form.tgl = toYMD(record.tgl);
    } else {
      form[col.id] = toStr(record[col.id]);
    }
  });

  return form;
};

const mapFormToPayload = (form: any) => {
  const payload: any = {};
  SACON_COLUMNS.forEach((col) => {
    payload[col.id] = form[col.id] ?? '';
  });
  return payload;
};

export default function SaconFormPage() {
  const params = useParams() as any;
  const router = useRouter();

  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const isEdit = Boolean(id);

  const [form, setForm] = useState<any>(createEmptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({ type: '', message: '' });

  useEffect(() => {
    const loadExisting = async () => {
      if (!isEdit) {
        setForm(createEmptyForm());
        return;
      }

      try {
        setLoading(true);
        const record = (await apiCall(`${API_BASE_URL}/records/${id}`)) as any;
        setForm(mapRecordToForm(record));
      } catch (err: any) {
        setFeedback({
          type: 'error',
          message: err?.message || 'Failed to load Sacon record',
        });
      } finally {
        setLoading(false);
      }
    };

    loadExisting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  const pageTitle = useMemo(
    () => (isEdit ? 'Edit Sacon Record' : 'New Sacon Record'),
    [isEdit],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (!form.tgl) {
      setFeedback({ type: 'error', message: 'Date (TGL) is required.' });
      return;
    }

    try {
      setSaving(true);
      const payload = mapFormToPayload(form);
      const isNew = !isEdit;
      const url = isNew ? `${API_BASE_URL}/records` : `${API_BASE_URL}/records/${id}`;
      const method = isNew ? 'POST' : 'PUT';

      await apiCall(url, { method, body: payload });
      router.push('/sacon');
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to save Sacon record',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit || !id) return;
    // eslint-disable-next-line no-alert
    const ok = window.confirm('Delete this Sacon record? This action cannot be undone.');
    if (!ok) return;

    try {
      setSaving(true);
      await apiCall(`${API_BASE_URL}/records/${id}`, { method: 'DELETE' });
      router.push('/sacon');
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to delete Sacon record',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.push('/sacon');
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
            <p>Keep this screen focused on one Sacon record. The database view is on a separate page.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={handleBack} disabled={saving}>
              Back to database
            </button>
            {isEdit && (
              <button
                type="button"
                className="btn btn-secondary production-delete-btn"
                onClick={handleDelete}
                disabled={saving}
              >
                Delete
              </button>
            )}
            <button
              type="submit"
              form="sacon-form"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Save'}
            </button>
          </div>
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
          <form
            id="sacon-form"
            className="production-form production-form--standalone"
            onSubmit={handleSave}
          >
            <div className="production-form-section">
              <h4>Core details</h4>
              <div className="production-form-grid">
                <div className="form-group">
                  <label>
                    TGL <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    name="tgl"
                    className="form-control"
                    value={form.tgl}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Permintaan</label>
                  <input
                    type="text"
                    name="permintaan"
                    className="form-control"
                    value={form.permintaan}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>CODENAME</label>
                  <input
                    type="text"
                    name="codename"
                    className="form-control"
                    value={form.codename}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>KP</label>
                  <input
                    type="text"
                    name="kp"
                    className="form-control"
                    value={form.kp}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Kons Kode</label>
                  <input
                    type="text"
                    name="konsKode"
                    className="form-control"
                    value={form.konsKode}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>KODE</label>
                  <input
                    type="text"
                    name="kode"
                    className="form-control"
                    value={form.kode}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Kat Kode</label>
                  <input
                    type="text"
                    name="katKode"
                    className="form-control"
                    value={form.katKode}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Ket CT /WS</label>
                  <input
                    type="text"
                    name="ketCtWs"
                    className="form-control"
                    value={form.ketCtWs}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Ket Warna</label>
                  <input
                    type="text"
                    name="ketWarna"
                    className="form-control"
                    value={form.ketWarna}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <input
                    type="text"
                    name="status"
                    className="form-control"
                    value={form.status}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="production-form-section">
              <h4>Technical &amp; construction</h4>
              <div className="production-form-grid">
                <div className="form-group">
                  <label>TE</label>
                  <input
                    type="text"
                    name="te"
                    className="form-control"
                    value={form.te}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>SISIR</label>
                  <input
                    type="text"
                    name="sisir"
                    className="form-control"
                    value={form.sisir}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>P (Kons)</label>
                  <input
                    type="text"
                    name="pKons"
                    className="form-control"
                    value={form.pKons}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Ne K Lusi</label>
                  <input
                    type="text"
                    name="neKLusi"
                    className="form-control"
                    value={form.neKLusi}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Ne Lusi</label>
                  <input
                    type="text"
                    name="neLusi"
                    className="form-control"
                    value={form.neLusi}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Sp Lusi</label>
                  <input
                    type="text"
                    name="spLusi"
                    className="form-control"
                    value={form.spLusi}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Lot Lusi</label>
                  <input
                    type="text"
                    name="lotLusi"
                    className="form-control"
                    value={form.lotLusi}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Ne K Pakan</label>
                  <input
                    type="text"
                    name="neKPakan"
                    className="form-control"
                    value={form.neKPakan}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Ne Pakan</label>
                  <input
                    type="text"
                    name="nePakan"
                    className="form-control"
                    value={form.nePakan}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Sp Pakan</label>
                  <input
                    type="text"
                    name="spPakan"
                    className="form-control"
                    value={form.spPakan}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>J</label>
                  <input
                    type="text"
                    name="j"
                    className="form-control"
                    value={form.j}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>J/C</label>
                  <input
                    type="text"
                    name="jPerC"
                    className="form-control"
                    value={form.jPerC}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>B/C</label>
                  <input
                    type="text"
                    name="bPerC"
                    className="form-control"
                    value={form.bPerC}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>TB</label>
                  <input
                    type="text"
                    name="tb"
                    className="form-control"
                    value={form.tb}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>TB REAL</label>
                  <input
                    type="text"
                    name="tbReal"
                    className="form-control"
                    value={form.tbReal}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>BALE LUSI</label>
                  <input
                    type="text"
                    name="baleLusi"
                    className="form-control"
                    value={form.baleLusi}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>TOTAL PAKAN</label>
                  <input
                    type="text"
                    name="totalPakan"
                    className="form-control"
                    value={form.totalPakan}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>BALE PAKAN</label>
                  <input
                    type="text"
                    name="balePakan"
                    className="form-control"
                    value={form.balePakan}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="production-form-section">
              <h4>Workflow &amp; decision</h4>
              <div className="production-form-grid">
                <div className="form-group">
                  <label>TS</label>
                  <input
                    type="text"
                    name="ts"
                    className="form-control"
                    value={form.ts}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>SACON</label>
                  <input
                    type="text"
                    name="sacon"
                    className="form-control"
                    value={form.sacon}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>ACC / TIDAK ACC</label>
                  <input
                    type="text"
                    name="accStatus"
                    className="form-control"
                    value={form.accStatus}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>PROSES</label>
                  <input
                    type="text"
                    name="proses"
                    className="form-control"
                    value={form.proses}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Foto Sacon</label>
                  <input
                    type="text"
                    name="fotoSacon"
                    className="form-control"
                    value={form.fotoSacon}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Remarks</label>
                  <textarea
                    name="remarks"
                    className="form-control"
                    value={form.remarks}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

