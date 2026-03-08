'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import './Production.css';
import { API_ENDPOINTS, apiCall } from '../lib/api';
import { toStr, toYMD } from '../lib/utils';
import { WEAVING_BASE_COLUMNS, WEAVING_TRIPUTRA_COLUMNS } from './WeavingDivisionPage';

const API_BASE_URL = API_ENDPOINTS.weaving;

type Feedback = { type: '' | 'error' | 'success'; message: string };

type WeavingValues = Record<string, string>;

const REQUIRED_FIELDS = ['tanggal'] as const;

const ALL_COLUMNS = [...WEAVING_BASE_COLUMNS, ...WEAVING_TRIPUTRA_COLUMNS];

const createEmptyValues = (): WeavingValues => {
  const now = new Date();
  const base: WeavingValues = {};
  ALL_COLUMNS.forEach((col) => {
    if (col.id === 'tanggal') {
      base[col.id] = toYMD(now);
    } else {
      base[col.id] = '';
    }
  });
  return base;
};

const mapRecordToValues = (record: Record<string, unknown>): WeavingValues => {
  const values = createEmptyValues();
  ALL_COLUMNS.forEach((col) => {
    if (col.id === 'tanggal') {
      values.tanggal = toYMD(record.tanggal as any);
    } else {
      values[col.id] = toStr(record[col.id]);
    }
  });
  return values;
};

const buildPayload = (values: WeavingValues): Record<string, unknown> => {
  const payload: Record<string, unknown> = {};
  ALL_COLUMNS.forEach((col) => {
    payload[col.id] = values[col.id] ?? '';
  });
  return payload;
};

const SECTIONS: Array<{ label: string; fieldIds: string[] }> = [
  {
    label: 'Weaving production',
    fieldIds: WEAVING_BASE_COLUMNS.map((c) => c.id),
  },
  {
    label: 'Triputra raw metrics (optional)',
    fieldIds: WEAVING_TRIPUTRA_COLUMNS.map((c) => c.id),
  },
];

export default function WeavingFormPage() {
  const params = useParams() as any;
  const router = useRouter();

  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const isEdit = Boolean(id);

  const [values, setValues] = useState<WeavingValues>(createEmptyValues);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({ type: '', message: '' });

  const requiredFields = useMemo(
    () => new Set<string>(REQUIRED_FIELDS as unknown as string[]),
    [],
  );

  const colById = useMemo(() => {
    const m = new Map<string, (typeof ALL_COLUMNS)[number]>();
    ALL_COLUMNS.forEach((c) => m.set(c.id, c));
    return m;
  }, []);

  useEffect(() => {
    const load = async () => {
      setFeedback({ type: '', message: '' });

      if (!isEdit) {
        setValues(createEmptyValues());
        return;
      }

      try {
        setLoading(true);
        const record = (await apiCall(`${API_BASE_URL}/records/${id}`)) as any;
        setValues(mapRecordToValues(record || {}));
      } catch (err: any) {
        setFeedback({ type: 'error', message: err?.message || 'Failed to load record' });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    for (const f of REQUIRED_FIELDS) {
      if (!values[f]) {
        setFeedback({ type: 'error', message: `${f} is required.` });
        return;
      }
    }

    try {
      setSaving(true);
      const payload = buildPayload(values);
      if (isEdit) {
        await apiCall(`${API_BASE_URL}/records/${id}`, { method: 'PUT', body: payload });
      } else {
        await apiCall(`${API_BASE_URL}/records`, { method: 'POST', body: payload });
      }
      router.push('/weaving');
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to save record' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit || !id) return;
    // eslint-disable-next-line no-alert
    const ok = window.confirm('Delete this weaving record? This action cannot be undone.');
    if (!ok) return;

    try {
      setSaving(true);
      await apiCall(`${API_BASE_URL}/records/${id}`, { method: 'DELETE' });
      router.push('/weaving');
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to delete record' });
    } finally {
      setSaving(false);
    }
  };

  const pageTitle = useMemo(() => (isEdit ? 'Edit weaving row' : 'New weaving row'), [isEdit]);

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
            <p>Enter a single weaving record. The database view is on a separate page.</p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={() => router.push('/weaving')}>
            Back to database
          </button>
        </div>

        {feedback.message && (
          <div className={`production-alert production-alert--${feedback.type === 'error' ? 'error' : 'success'}`}>
            {feedback.message}
          </div>
        )}

        {loading ? (
          <div className="production-loading">Loading...</div>
        ) : (
          <form className="production-form production-form--standalone" onSubmit={handleSubmit}>
            {SECTIONS.map((section) => (
              <div key={section.label} className="production-form-section">
                <h4>{section.label}</h4>
                <div className="production-form-grid">
                  {section.fieldIds.map((fieldId) => {
                    const col = colById.get(fieldId);
                    if (!col) return null;
                    const isRequired = requiredFields.has(fieldId);
                    const value = values[fieldId] ?? '';
                    const inputType = col.type === 'date' ? 'date' : 'text';
                    const inputMode = col.type === 'number' ? 'decimal' : undefined;
                    return (
                      <div key={fieldId} className="form-group">
                        <label>
                          {col.label} {isRequired ? <span className="required">*</span> : null}
                        </label>
                        <input
                          type={inputType}
                          name={fieldId}
                          className="form-control"
                          value={value}
                          onChange={handleChange}
                          placeholder={(col as any).placeholder || ''}
                          inputMode={inputMode}
                          required={isRequired}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

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
}

