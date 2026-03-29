'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import './Production.css';
import { API_ENDPOINTS, apiCall } from '../lib/api';
import {
  INDIGO_COLUMNS,
  INDIGO_COLUMN_GROUPS,
  INDIGO_REQUIRED_FIELDS,
  buildIndigoPayload,
  createEmptyIndigoValues,
  mapIndigoRecordToValues,
  type IndigoValues,
} from './indigoConfig';

const API_BASE_URL = API_ENDPOINTS.indigo;

type Feedback = { type: '' | 'error' | 'success'; message: string };

type Section = { label: string; fieldIds: string[] };

const buildSections = (): Section[] => {
  const fieldToGroup = new Map<string, string>();
  INDIGO_COLUMN_GROUPS.forEach((g) => g.children.forEach((id) => fieldToGroup.set(id, g.label)));

  const sections: Section[] = [];
  let current: Section | null = null;
  let currentKey: string | null = null; // null = ungrouped run, string = group label
  let ungroupedRun = 0;

  const startSection = (label: string) => {
    current = { label, fieldIds: [] };
    sections.push(current);
  };

  INDIGO_COLUMNS.forEach((col) => {
    const key = fieldToGroup.get(col.id) ?? null;
    if (key !== currentKey) {
      currentKey = key;
      if (key) {
        startSection(key);
      } else {
        ungroupedRun += 1;
        startSection(ungroupedRun === 1 ? 'GENERAL' : `OTHER (${ungroupedRun})`);
      }
    }
    if (!current) startSection('GENERAL');
    current!.fieldIds.push(col.id);
  });

  return sections;
};

export default function IndigoFormPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId as string | undefined;
  const isEdit = Boolean(id);

  const [values, setValues] = useState<IndigoValues>(createEmptyIndigoValues);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({ type: '', message: '' });

  const sections = useMemo(() => buildSections(), []);
  const requiredFields = useMemo(() => new Set<string>(INDIGO_REQUIRED_FIELDS as unknown as string[]), []);

  useEffect(() => {
    const load = async () => {
      setFeedback({ type: '', message: '' });

      if (!isEdit) {
        setValues(createEmptyIndigoValues());
        return;
      }

      try {
        setLoading(true);
        const record = (await apiCall(`${API_BASE_URL}/records/${id}`)) as IndigoValues;
        setValues(mapIndigoRecordToValues(record || {}));
      } catch (err: unknown) {
        setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to load record' });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    for (const f of INDIGO_REQUIRED_FIELDS) {
      if (!values[f]) {
        setFeedback({ type: 'error', message: `${f} is required.` });
        return;
      }
    }

    try {
      setSaving(true);
      const payload = buildIndigoPayload(values);
      if (isEdit) {
        await apiCall(`${API_BASE_URL}/records/${id}`, { method: 'PUT', body: payload });
      } else {
        await apiCall(`${API_BASE_URL}/records`, { method: 'POST', body: payload });
      }
      router.push('/indigo');
    } catch (err: unknown) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save record' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit || !id) return;
    // eslint-disable-next-line no-alert
    const ok = window.confirm('Delete this indigo record? This action cannot be undone.');
    if (!ok) return;

    try {
      setSaving(true);
      await apiCall(`${API_BASE_URL}/records/${id}`, { method: 'DELETE' });
      router.push('/indigo');
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to delete record' });
    } finally {
      setSaving(false);
    }
  };

  const pageTitle = useMemo(() => (isEdit ? 'Edit indigo row' : 'New indigo row'), [isEdit]);

  const colById = useMemo(() => {
    const m = new Map<string, (typeof INDIGO_COLUMNS)[number]>();
    INDIGO_COLUMNS.forEach((c) => m.set(c.id, c));
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
            <h2>{pageTitle}</h2>
            <p>Enter a single indigo record. The database view is on a separate page.</p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={() => router.push('/indigo')}>
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
            {sections.map((section, index) => (
              <div key={`${section.label}-${index}`} className="production-form-section">
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
                          placeholder={col.placeholder}
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

