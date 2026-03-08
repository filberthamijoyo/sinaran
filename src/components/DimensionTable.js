import React, { useState } from 'react';
import './DimensionTable.css';
import { API_ENDPOINTS } from '../config/api';

const API_BASE_URL = API_ENDPOINTS.quality;

const DimensionTable = ({ 
  title, 
  endpoint, 
  primaryKey, 
  fields, 
  codeField = 'code',
  nameField = 'name'
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  // Fetch items
  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      // Always fetch all items (including inactive) for admin panel
      const response = await fetch(`${API_BASE_URL}/${endpoint}?all=true`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(`Error loading ${title}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Start editing
  const startEdit = (item) => {
    setEditingId(item[primaryKey]);
    setFormData({ ...item });
    setError('');
    setSuccess('');
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setFormData({});
    setError('');
    setSuccess('');
  };

  // Create new item
  const handleCreate = async () => {
    try {
      setError('');
      setSuccess('');
      
      // Validate required fields
      if (!formData[codeField] || !formData[nameField]) {
        setError(`${codeField} and ${nameField} are required`);
        return;
      }

      // Ensure isActive is explicitly set (default to false if not present)
      const submitData = {
        ...formData,
        isActive: formData.isActive === true
      };

      const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create');
      }

      setSuccess('Item created successfully');
      setFormData({});
      await fetchItems();
    } catch (err) {
      setError(err.message);
    }
  };

  // Update item
  const handleUpdate = async () => {
    try {
      setError('');
      setSuccess('');

      if (!formData[codeField] || !formData[nameField]) {
        setError(`${codeField} and ${nameField} are required`);
        return;
      }

      // Ensure isActive is explicitly set (default to false if not present)
      const submitData = {
        ...formData,
        isActive: formData.isActive === true
      };

      const id = editingId;
      // For count-descriptions, use code in URL; for others, use id
      const urlId = primaryKey === 'code' ? formData.code : id;
      const response = await fetch(`${API_BASE_URL}/${endpoint}/${urlId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update');
      }

      setSuccess('Item updated successfully');
      setEditingId(null);
      setFormData({});
      await fetchItems();
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete item (soft delete)
  const handleDelete = async (item) => {
    if (!window.confirm('Are you sure you want to deactivate this item?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      // For count-descriptions, use code in URL; for others, use id
      const urlId = primaryKey === 'code' ? item.code : item[primaryKey];
      const response = await fetch(`${API_BASE_URL}/${endpoint}/${urlId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete');
      }

      setSuccess('Item deactivated successfully');
      await fetchItems();
    } catch (err) {
      setError(err.message);
    }
  };

  // Reactivate item
  const handleReactivate = async (item) => {
    try {
      setError('');
      setSuccess('');

      // For count-descriptions, use code in URL; for others, use id
      const urlId = primaryKey === 'code' ? item.code : item[primaryKey];
      const response = await fetch(`${API_BASE_URL}/${endpoint}/${urlId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, isActive: true })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reactivate');
      }

      setSuccess('Item reactivated successfully');
      await fetchItems();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredItems = showInactive 
    ? items 
    : items.filter(item => item.isActive !== false);

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
          <button onClick={fetchItems} className="btn-refresh">Refresh</button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Create/Edit Form */}
      <div className="dimension-form">
        <h3>{editingId ? 'Edit Item' : 'Create New Item'}</h3>
        <div className="form-row">
          {fields.map(field => (
            <div key={field.name} className="form-group">
              <label>{field.label}</label>
              {field.type === 'checkbox' ? (
                <input
                  type="checkbox"
                  name={field.name}
                  checked={formData[field.name] || false}
                  onChange={handleChange}
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  required={field.required}
                />
              )}
            </div>
          ))}
        </div>
        <div className="form-actions">
          {editingId ? (
            <>
              <button onClick={handleUpdate} className="btn-primary">Update</button>
              <button onClick={cancelEdit} className="btn-secondary">Cancel</button>
            </>
          ) : (
            <button onClick={handleCreate} className="btn-primary">Create</button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="table-wrapper">
          <table className="dimension-table">
            <thead>
              <tr>
                {fields.map(field => (
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
                filteredItems.map(item => (
                  <tr 
                    key={item[primaryKey]} 
                    className={!item.isActive ? 'inactive' : ''}
                  >
                    {fields.map(field => (
                      <td key={field.name}>
                        {field.type === 'checkbox' 
                          ? (item[field.name] ? 'Yes' : 'No')
                          : item[field.name]
                        }
                      </td>
                    ))}
                    <td>
                      <span className={`status-badge ${item.isActive ? 'active' : 'inactive'}`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="actions">
                      {item.isActive ? (
                        <>
                          <button 
                            onClick={() => startEdit(item)} 
                            className="btn-edit"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(item)} 
                            className="btn-delete"
                          >
                            Deactivate
                          </button>
                        </>
                      ) : (
                        <button 
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
