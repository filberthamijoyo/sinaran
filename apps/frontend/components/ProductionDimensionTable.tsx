'use client';

import React, { useState } from 'react';
import './DimensionTable.css';
import { API_ENDPOINTS } from '../lib/api';
import { usePersistedState } from '../hooks/usePersistedState';

type FieldConfig = {
  name: string;
  label: string;
  required?: boolean;
  type?: 'text' | 'number' | 'checkbox';
  placeholder?: string;
};

type Props = {
  title: string;
  endpoint: string;
  primaryKey: string;
  fields: FieldConfig[];
  apiBase?: keyof typeof API_ENDPOINTS | 'production' | 'unified';
};

const ProductionDimensionTable = <
  TItem extends Record<string, unknown>,
  TFormData extends Record<string, unknown> = Record<string, unknown>,
>({
  title,
  endpoint,
  primaryKey,
  fields,
  apiBase = 'production',
}: Props) => {
  const apiBaseUrl = apiBase === 'production'
    ? API_ENDPOINTS.production
    : apiBase === 'unified'
      ? API_ENDPOINTS.unified
      : API_ENDPOINTS.production;
  const [items, setItems] = useState<TItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [formData, setFormData, , restorePersistedForm] = usePersistedState<TFormData>(
    `production_dimension_${endpoint}_form`,
    () => ({} as TFormData),
    !editingId,
  );
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${apiBaseUrl}/${endpoint}?all=true`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json() as TItem[];
      setItems(data);
    } catch (err: unknown) {
      setError(`Error loading ${title}: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev: TFormData) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'number'
            ? value === ''
              ? ''
              : parseFloat(value)
            : value,
    } as unknown as TFormData));
  };

  const startEdit = (item: TItem) => {
    setEditingId(item[primaryKey] as string | number | null);
    const editData = { ...item } as unknown as TFormData;
    if ((item as Record<string, unknown>).value !== undefined && (item as Record<string, unknown>).value !== null) {
      (editData as Record<string, unknown>).value = String((item as Record<string, unknown>).value);
    }
    setFormData(editData);
    setError('');
    setSuccess('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    restorePersistedForm();
    setError('');
    setSuccess('');
  };

  const validateRequired = () => {
    const requiredFields = fields.filter((f) => f.required);
    for (const field of requiredFields) {
      if (
        formData[field.name] === undefined ||
        formData[field.name] === null ||
        formData[field.name] === ''
      ) {
        setError(`${field.label} is required`);
        return false;
      }
    }
    return true;
  };

  const handleCreate = async () => {
    try {
      setError('');
      setSuccess('');

      if (!validateRequired()) return;

      const submitData = {
        ...formData,
        isActive: formData.isActive === true,
      };

      const response = await fetch(`${apiBaseUrl}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to create');
      }

      setSuccess('Item created successfully');
      setFormData({} as TFormData);
      await fetchItems();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleUpdate = async () => {
    try {
      setError('');
      setSuccess('');

      if (!validateRequired()) return;

      const submitData = {
        ...formData,
        isActive: formData.isActive === true,
      };

      const id = editingId;
      const response = await fetch(`${apiBaseUrl}/${endpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to update');
      }

      setSuccess('Item updated successfully');
      setEditingId(null);
      setFormData({} as TFormData);
      await fetchItems();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDelete = async (item: TItem) => {
    if (!window.confirm('Are you sure you want to deactivate this item?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      const urlId = item[primaryKey];
      const response = await fetch(`${apiBaseUrl}/${endpoint}/${urlId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to delete');
      }

      setSuccess('Item deactivated successfully');
      await fetchItems();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleReactivate = async (item: TItem) => {
    try {
      setError('');
      setSuccess('');

      const urlId = item[primaryKey];
      const response = await fetch(`${apiBaseUrl}/${endpoint}/${urlId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, isActive: true }),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || 'Failed to reactivate');
      }

      setSuccess('Item reactivated successfully');
      await fetchItems();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const filteredItems = showInactive
    ? items
    : items.filter((item) => item.isActive !== false);

  return (
    <div className="dimension-table-container">
      <div className="dimension-table-header">
        <h2>{title}</h2>
        <div className="dimension-table-controls">
          <label>
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            Show inactive
          </label>
          <button type="button" onClick={fetchItems} className="btn-refresh">
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="dimension-form">
        <h3>{editingId ? 'Edit Item' : 'Create New Item'}</h3>
        <div className="form-row">
          {fields.map((field) => (
            <div key={field.name} className="form-group">
              <label>
                {field.label}
                {field.required && <span className="required">*</span>}
              </label>
              {field.type === 'checkbox' ? (
                <input
                  type="checkbox"
                  name={field.name}
                  checked={Boolean(formData[field.name])}
                  onChange={handleChange}
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  value={String(formData[field.name] ?? '')}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required={field.required}
                  step={field.type === 'number' ? 'any' : undefined}
                />
              )}
            </div>
          ))}
        </div>
        <div className="form-actions">
          {editingId ? (
            <>
              <button type="button" onClick={handleUpdate} className="btn-primary">
                Update
              </button>
              <button type="button" onClick={cancelEdit} className="btn-secondary">
                Cancel
              </button>
            </>
          ) : (
            <button type="button" onClick={handleCreate} className="btn-primary">
              Create
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="table-wrapper">
          <table className="dimension-table">
            <thead>
              <tr>
                {fields.map((field) => (
                  <th key={field.name}>{field.label}</th>
                ))}
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={fields.length + 2} className="empty-state">
                    No items found
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={String(item[primaryKey])}
                    className={!(item as Record<string, unknown>).isActive ? '' : ''}
                  >
                    {fields.map((field) => (
                      <td key={field.name}>
                        {field.type === 'checkbox'
                          ? (item as Record<string, unknown>)[field.name]
                            ? 'Yes'
                            : 'No'
                          : (item as Record<string, unknown>)[field.name] !== null && (item as Record<string, unknown>)[field.name] !== undefined
                            ? typeof (item as Record<string, unknown>)[field.name] === 'object' &&
                              typeof (item as Record<string, unknown>)[field.name]?.toString === 'function'
                              ? String((item as Record<string, unknown>)[field.name])
                              : String((item as Record<string, unknown>)[field.name])
                            : '-'}
                      </td>
                    ))}
                    <td>
                      <span
                        className={`status-badge ${
                          item.isActive ? 'active' : 'inactive'
                        }`}
                      >
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="actions">
                      {item.isActive ? (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="btn-edit"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            className="btn-delete"
                          >
                            Deactivate
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleReactivate(item)}
                          className="btn-reactivate"
                        >
                          Reactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductionDimensionTable;

