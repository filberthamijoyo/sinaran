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
  codeField?: string;
  nameField?: string;
  apiBase?: keyof typeof API_ENDPOINTS | 'quality' | 'production' | 'unified';
};

const DimensionTable = ({
  title,
  endpoint,
  primaryKey,
  fields,
  codeField = 'code',
  nameField = 'name',
  apiBase = 'quality', // 'quality', 'production', or 'unified'
}: Props) => {
  const API_BASE_URL = (API_ENDPOINTS as any)[apiBase] || API_ENDPOINTS.quality;
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<any>(null);
  const [formData, setFormData, , restorePersistedForm] = usePersistedState<any>(
    `dimension_admin_${endpoint}_form`,
    () => ({}),
    !editingId,
  );
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_BASE_URL}/${endpoint}?all=true`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setItems(data);
    } catch (err: any) {
      setError(`Error loading ${title}: ${err.message}`);
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
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const startEdit = (item: any) => {
    setEditingId(item[primaryKey]);
    setFormData({ ...item });
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

      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create');
      }

      setSuccess('Item created successfully');
      setFormData({});
      await fetchItems();
    } catch (err: any) {
      setError(err.message);
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
      const urlId = primaryKey === 'code' ? formData.code : id;
      const response = await fetch(`${API_BASE_URL}/${endpoint}/${urlId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update');
      }

      setSuccess('Item updated successfully');
      setEditingId(null);
      setFormData({});
      await fetchItems();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (item: any) => {
    if (!window.confirm('Are you sure you want to deactivate this item?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      const urlId = primaryKey === 'code' ? item.code : item[primaryKey];
      const response = await fetch(`${API_BASE_URL}/${endpoint}/${urlId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete');
      }

      setSuccess('Item deactivated successfully');
      await fetchItems();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReactivate = async (item: any) => {
    try {
      setError('');
      setSuccess('');

      const urlId = primaryKey === 'code' ? item.code : item[primaryKey];
      const response = await fetch(`${API_BASE_URL}/${endpoint}/${urlId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, isActive: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reactivate');
      }

      setSuccess('Item reactivated successfully');
      await fetchItems();
    } catch (err: any) {
      setError(err.message);
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
                  checked={formData[field.name] || false}
                  onChange={handleChange as any}
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  value={formData[field.name] ?? ''}
                  onChange={handleChange as any}
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
                    key={item[primaryKey]}
                    className={!item.isActive ? 'inactive' : ''}
                  >
                    {fields.map((field) => (
                      <td key={field.name}>
                        {field.type === 'checkbox'
                          ? item[field.name]
                            ? 'Yes'
                            : 'No'
                          : item[field.name] !== null && item[field.name] !== undefined
                            ? typeof item[field.name] === 'object' &&
                              item[field.name].toString
                              ? item[field.name].toString()
                              : item[field.name]
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

export default DimensionTable;
