import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './YarnTestList.css';
import { API_ENDPOINTS, apiCall } from '../config/api';

const API_BASE_URL = API_ENDPOINTS.quality;

const pad2 = (n) => String(n).padStart(2, '0');
const toYMD = (value) => {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const YarnTestList = () => {
  const navigate = useNavigate();
  
  // State for tests data
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Summary state
  const [summary, setSummary] = useState({ total: 0, byCountDescription: [] });
  
  // Filter state
  const [filters, setFilters] = useState({
    countDescriptionCode: '',
    lotId: '',
    startDate: '',
    endDate: '',
    machineNo: '',
    period: 'range' // 'daily', 'monthly', 'yearly', 'range'
  });
  
  // Dropdown data state
  const [countDescriptions, setCountDescriptions] = useState([]);
  const [lots, setLots] = useState([]);
  
  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [countDescRes, lotsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/count-descriptions`),
          fetch(`${API_BASE_URL}/lots`)
        ]);
        
        const countDescData = await countDescRes.json();
        const lotsData = await lotsRes.json();
        
        setCountDescriptions(countDescData);
        setLots(lotsData);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };
    
    fetchDropdownData();
  }, []);
  
  // Fetch yarn tests
  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString()
        });
        
        // Add filters to params
        if (filters.countDescriptionCode) {
          params.append('countDescriptionCode', filters.countDescriptionCode);
        }
        if (filters.lotId) {
          params.append('lotId', filters.lotId);
        }
        if (filters.machineNo) {
          params.append('machineNo', filters.machineNo);
        }
        
        // Handle date filters based on period
        if (filters.period === 'range') {
          if (filters.startDate) {
            params.append('startDate', filters.startDate);
          }
          if (filters.endDate) {
            params.append('endDate', filters.endDate);
          }
        } else {
          params.append('period', filters.period);
          // For daily/monthly/yearly, we'd need additional inputs
          // For now, we'll use range as default
        }
        
        const response = await apiCall(`${API_BASE_URL}/yarn-tests?${params.toString()}`);
        
        setTests(response.tests || []);
        setTotal(response.pagination?.total || 0);
        setTotalPages(response.pagination?.totalPages || 0);
        setSummary(response.summary || { total: 0, byCountDescription: [] });
      } catch (err) {
        console.error('Error fetching yarn tests:', err);
        setError(err.message || 'Failed to fetch yarn tests');
        setTests([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTests();
  }, [page, limit, filters]);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(1); // Reset to first page when filters change
  };
  
  const handleClearFilters = () => {
    setFilters({
      countDescriptionCode: '',
      lotId: '',
      startDate: '',
      endDate: '',
      machineNo: '',
      period: 'range'
    });
    setPage(1);
  };
  
  const handleEdit = (testId) => {
    navigate(`/?edit=${testId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDuplicate = (testId) => {
    navigate(`/?duplicate=${testId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDelete = async (testId) => {
    if (!window.confirm('Are you sure you want to delete this test entry?')) {
      return;
    }
    
    try {
      await apiCall(`${API_BASE_URL}/yarn-tests/${testId}`, {
        method: 'DELETE'
      });
      
      // Refresh the list
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (filters.countDescriptionCode) {
        params.append('countDescriptionCode', filters.countDescriptionCode);
      }
      if (filters.lotId) {
        params.append('lotId', filters.lotId);
      }
      if (filters.machineNo) {
        params.append('machineNo', filters.machineNo);
      }
      if (filters.startDate) {
        params.append('startDate', filters.startDate);
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate);
      }
      
      const response = await apiCall(`${API_BASE_URL}/yarn-tests?${params.toString()}`);
      setTests(response.tests || []);
      setTotal(response.pagination?.total || 0);
      setTotalPages(response.pagination?.totalPages || 0);
      setSummary(response.summary || { total: 0, byCountDescription: [] });
      
      alert('Test entry deleted successfully!');
    } catch (err) {
      console.error('Error deleting test:', err);
      alert(`Error: ${err.message || 'Failed to delete test entry'}`);
    }
  };
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  return (
    <div className="yarn-test-list-container">
      <div className="list-header">
        <h2>Yarn Test List</h2>
        <p>View and manage yarn quality test entries</p>
      </div>
      
      {/* Summary Section */}
      {summary.byCountDescription && summary.byCountDescription.length > 0 && (
        <div className="aggregate-section">
          <div className="aggregate-header-row">
            <h3>Summary by Count Description</h3>
          </div>
          <div className="aggregate-grid">
            {summary.byCountDescription.map((item) => (
              <div key={item.code} className="summary-chip">
                <span style={{ fontWeight: 600 }}>{item.description || `Code ${item.code}`}:</span>
                <span>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-header-row">
          <h3>Filters</h3>
        </div>
        <div className="filters-grid">
          <div className="filter-group">
            <label htmlFor="countDescriptionCode">Count Description</label>
            <select
              id="countDescriptionCode"
              name="countDescriptionCode"
              value={filters.countDescriptionCode}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              {countDescriptions.map((cd) => (
                <option key={cd.code} value={cd.code}>
                  {cd.code} - {cd.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="lotId">Lot</label>
            <select
              id="lotId"
              name="lotId"
              value={filters.lotId}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              {lots.map((lot) => (
                <option key={lot.id} value={lot.id}>
                  {lot.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="machineNo">Machine No</label>
            <input
              type="number"
              id="machineNo"
              name="machineNo"
              value={filters.machineNo}
              onChange={handleFilterChange}
              placeholder="Machine number"
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="filter-actions">
            <button
              type="button"
              className="btn-clear"
              onClick={handleClearFilters}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="loading-message">Loading yarn tests...</div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}
      
      {/* Tests Table */}
      {!loading && !error && (
        <>
          <div className="table-container">
            <table className="yarn-test-table">
              <thead>
                <tr>
                  <th>Test Date</th>
                  <th>Count Desc.</th>
                  <th>Nominal Count</th>
                  <th>Count NE</th>
                  <th>Lot</th>
                  <th>SPK</th>
                  <th>Yarn Type</th>
                  <th>Machine No</th>
                  <th>Mean Ne</th>
                  <th>CV%</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tests.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="no-data">
                      No test entries found
                    </td>
                  </tr>
                ) : (
                  tests.map((test) => (
                    <tr key={test.id}>
                      <td>{toYMD(test.testDate)}</td>
                      <td>
                        {test.countDescription
                          ? `${test.countDescription.code} - ${test.countDescription.name}`
                          : test.countDescriptionCode || '-'}
                      </td>
                      <td>{test.nominalCount || '-'}</td>
                      <td>{test.countNe ? test.countNe.value : '-'}</td>
                      <td>{test.lot?.name || '-'}</td>
                      <td>{test.spk?.name || '-'}</td>
                      <td>{test.yarnType?.name || '-'}</td>
                      <td>{test.machineNo || '-'}</td>
                      <td>{test.meanNe || '-'}</td>
                      <td>{test.cvCountPercent || '-'}</td>
                      <td className="actions-cell">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(test.id)}
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          className="btn-duplicate"
                          onClick={() => handleDuplicate(test.id)}
                          title="Duplicate"
                        >
                          Duplicate
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(test.id)}
                          title="Delete"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {page} of {totalPages} (Total: {total} entries)
              </span>
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default YarnTestList;
