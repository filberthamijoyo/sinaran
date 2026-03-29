'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import './Production.css';
import { API_ENDPOINTS, apiCall } from '../lib/api';
import { displayValue, toYMD } from '../lib/utils';

const API_BASE_URL = API_ENDPOINTS.quality;

const todayYMD = () => {
  const d = new Date();
  const pad2 = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const currentYM = () => {
  const d = new Date();
  const pad2 = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
};

const currentYear = () => new Date().getFullYear().toString();

interface YarnTestRecord {
  id: string | number;
  testDate?: string | null;
  lot?: { name?: string | null } | null;
  spk?: { name?: string | null } | null;
  countDescriptionCode?: number | null;
  countDescription?: { code?: number | null };
  machineNo?: number | null;
  meanNe?: number | null;
  meanStrengthCn?: number | null;
  uPercent?: number | null;
  ipis?: number | null;
  oeIpi?: number | null;
  clsp?: number | null;
  tenacityCnTex?: number | null;
  remarks?: string | null;
}

interface YarnTestResponse {
  tests?: YarnTestRecord[];
  pagination?: { page: number; limit: number; total: number; totalPages: number };
  summary?: {
    total?: number;
    byCountDescription?: Array<{ code: number | null; description: string | null; count: number | null }>;
  } | null;
}

const getDefaultFilters = () => ({
  period: 'range',
  day: todayYMD(),
  month: currentYM(),
  year: currentYear(),
  startDate: '',
  endDate: '',
  lotInput: '',
  lotId: '',
  countDescriptionCode: '',
  machineNo: '',
});

export default function YarnQualityListPage() {
  const router = useRouter();
  const [rows, setRows] = useState<YarnTestRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: string; message: string }>({ type: '', message: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  const [filters, setFilters] = useState(getDefaultFilters);
  const [summary, setSummary] = useState<YarnTestResponse['summary']>(null);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(pagination.page));
    params.set('limit', String(pagination.limit));

    if (filters.countDescriptionCode) params.set('countDescriptionCode', filters.countDescriptionCode);
    if (filters.lotId) params.set('lotId', filters.lotId);
    if (filters.machineNo) params.set('machineNo', filters.machineNo);

    if (filters.period) params.set('period', filters.period);
    if (filters.period === 'daily' && filters.day) params.set('day', filters.day);
    if (filters.period === 'monthly' && filters.month) params.set('month', filters.month);
    if (filters.period === 'yearly' && filters.year) params.set('year', filters.year);
    if (filters.period === 'range') {
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);
    }

    return params.toString();
  }, [
    filters.countDescriptionCode,
    filters.day,
    filters.endDate,
    filters.lotId,
    filters.machineNo,
    filters.month,
    filters.period,
    filters.startDate,
    filters.year,
    pagination.limit,
    pagination.page,
  ]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      setFeedback({ type: '', message: '' });
      const data = await apiCall(`${API_BASE_URL}/yarn-tests?${queryParams}`) as YarnTestResponse | null;
      setRows(data && typeof data === 'object' ? (data as YarnTestResponse).tests || [] : []);
      setPagination(data && typeof data === 'object' ? (data as YarnTestResponse).pagination || pagination : pagination);
      setSummary(data && typeof data === 'object' ? (data as YarnTestResponse).summary || null : null);
    } catch {
      setFeedback({ type: 'error', message: 'Failed to fetch tests' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  const validateLotLookup = async () => {
    const value = (filters.lotInput || '').trim();
    if (!value) {
      setFilters((p) => ({ ...p, lotId: '', lotInput: '' }));
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/lots/lookup/by-value/${encodeURIComponent(value)}`);
      if (!res.ok) {
        setFeedback({ type: 'error', message: 'Lot not found in database' });
        setFilters((p) => ({ ...p, lotId: '' }));
        return;
      }
      const lot = await res.json();
      setFilters((p) => ({ ...p, lotId: String(lot.id), lotInput: lot.name || value }));
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to validate lot' });
      setFilters((p) => ({ ...p, lotId: '' }));
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters(getDefaultFilters());
    setPagination((prev) => ({ ...prev, page: 1 }));
    setFeedback({ type: '', message: '' });
  };

  const handleSelectRow = (row: YarnTestRecord) => {
    router.push(`/quality/edit/${row.id}`);
  };

  const handleEditRow = (row: YarnTestRecord) => {
    router.push(`/quality/edit/${row.id}`);
  };

  const handleDelete = async (id: string | number) => {
    // eslint-disable-next-line no-alert
    const ok = window.confirm('Delete this yarn test? This action cannot be undone.');
    if (!ok) return;
    try {
      setLoading(true);
      await apiCall(`${API_BASE_URL}/yarn-tests/${id}`, { method: 'DELETE' });
      setFeedback({ type: 'success', message: 'Deleted successfully.' });
      await fetchTests();
    } catch {
      setFeedback({ type: 'error', message: 'Failed to delete' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="production-module-container">
      <div className="production-list-header">
        <h2>Quality Reports</h2>
        <p>View and manage yarn quality test data.</p>
      </div>

      <div className="production-module-content">
        {feedback.message && (
          <div
            className={`production-alert production-alert--${feedback.type === 'error' ? 'error' : 'success'}`}
          >
            {feedback.message}
          </div>
        )}

        {loading && <div className="production-loading">Loading...</div>}

        <div className="production-layout">
          <section className="production-table-panel production-table-panel--full">
            {/* Filters Section - Collapsible */}
            <div className="filters-section">
              <div className="filters-header-row">
                <button
                  type="button"
                  className="filters-toggle-btn"
                  onClick={() => setFiltersExpanded(!filtersExpanded)}
                >
                  <span>{filtersExpanded ? '▼' : '▶'}</span>
                  <h3>Filters</h3>
                </button>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="button" className="btn-clear" onClick={handleClearFilters}>
                    Clear Filters
                  </button>
                  <button type="button" className="btn-primary" onClick={() => router.push('/quality/new')}>
                    New Yarn Test
                  </button>
                </div>
              </div>

              {filtersExpanded && (
                <div className="filters-grid">
                  <div className="filter-group">
                    <label>Period</label>
                    <select name="period" value={filters.period} onChange={handleFilterChange}>
                      <option value="daily">Daily</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="range">Custom Range</option>
                    </select>
                  </div>

                  {filters.period === 'daily' && (
                    <div className="filter-group">
                      <label>Day</label>
                      <input type="date" name="day" value={filters.day} onChange={handleFilterChange} />
                    </div>
                  )}

                  {filters.period === 'monthly' && (
                    <div className="filter-group">
                      <label>Month</label>
                      <input type="month" name="month" value={filters.month} onChange={handleFilterChange} />
                    </div>
                  )}

                  {filters.period === 'yearly' && (
                    <div className="filter-group">
                      <label>Year</label>
                      <input
                        type="number"
                        name="year"
                        min="2000"
                        max="2100"
                        value={filters.year}
                        onChange={handleFilterChange}
                      />
                    </div>
                  )}

                  {filters.period === 'range' && (
                    <>
                      <div className="filter-group">
                        <label>Start Date</label>
                        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                      </div>
                      <div className="filter-group">
                        <label>End Date</label>
                        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                      </div>
                    </>
                  )}

                  <div className="filter-group">
                    <label>Lot (lookup)</label>
                    <input
                      type="text"
                      name="lotInput"
                      value={filters.lotInput}
                      onChange={handleFilterChange}
                      onBlur={validateLotLookup}
                      placeholder="Type lot value (e.g. 1000.0)"
                    />
                    {filters.lotId ? (
                      <small style={{ color: '#64748b' }}>Resolved lotId: {filters.lotId}</small>
                    ) : null}
                  </div>

                  <div className="filter-group">
                    <label>Count Desc Code</label>
                    <input
                      type="number"
                      name="countDescriptionCode"
                      value={filters.countDescriptionCode}
                      onChange={handleFilterChange}
                      placeholder="e.g. 1234"
                    />
                  </div>

                  <div className="filter-group">
                    <label>Machine No</label>
                    <input
                      type="number"
                      name="machineNo"
                      value={filters.machineNo}
                      onChange={handleFilterChange}
                      placeholder="e.g. 12"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Main Table */}
            <div className="production-table-header">
              <div>
                <h3 className="section-heading">Yarn Tests</h3>
                <p className="production-table-subtitle">
                  Showing {rows.length} of {pagination.total} records. Click a row to edit.
                </p>
              </div>
            </div>

            <div className="production-table-wrapper">
              <table className="production-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Lot</th>
                    <th>SPK</th>
                    <th>Count Desc</th>
                    <th>Machine</th>
                    <th>Mean Ne</th>
                    <th>Mean Strength (CN)</th>
                    <th>U%</th>
                    <th>Std IPIs</th>
                    <th>OE IPIs</th>
                    <th>CLSP</th>
                    <th>Tenacity</th>
                    <th>Remarks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="production-empty">
                        {loading ? 'Loading...' : 'No records found. Use "New Yarn Test" to add data.'}
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.id} onClick={() => handleSelectRow(row)}>
                        <td>{displayValue(toYMD(row.testDate))}</td>
                        <td>{displayValue(row.lot?.name)}</td>
                        <td>{displayValue(row.spk?.name)}</td>
                        <td>{displayValue(row.countDescriptionCode || row.countDescription?.code)}</td>
                        <td>{displayValue(row.machineNo)}</td>
                        <td>{displayValue(row.meanNe)}</td>
                        <td>{displayValue(row.meanStrengthCn)}</td>
                        <td>{displayValue(row.uPercent)}</td>
                        <td>{displayValue(row.ipis)}</td>
                        <td>{displayValue(row.oeIpi)}</td>
                        <td>{displayValue(row.clsp)}</td>
                        <td>{displayValue(row.tenacityCnTex)}</td>
                        <td>{displayValue(row.remarks)}</td>
                        <td className="production-actions-cell" onClick={(e) => e.stopPropagation()}>
                          <div className="production-row-actions">
                            <button
                              type="button"
                              className="production-action-btn production-action-btn--edit"
                              onClick={() => handleEditRow(row)}
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              className="production-action-btn production-action-btn--delete"
                              onClick={() => handleDelete(row.id)}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="production-pagination">
                <button
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </button>
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </button>
              </div>
            )}

            {/* Summary Section (same pattern as Production) */}
            {summary && (
              <div className="production-table-header" style={{ marginTop: '24px' }}>
                <button
                  type="button"
                  className="filters-toggle-btn"
                  onClick={() => setSummaryExpanded(!summaryExpanded)}
                >
                  <span>{summaryExpanded ? '▼' : '▶'}</span>
                  <div style={{ textAlign: 'left' }}>
                    <h3 className="section-heading" style={{ margin: 0 }}>
                      Summary
                    </h3>
                    <p className="production-table-subtitle" style={{ margin: '0.1rem 0 0' }}>
                      Total tests: {summary.total ?? '-'}
                    </p>
                  </div>
                </button>
              </div>
            )}

            {summary && summaryExpanded && (
              <div className="production-table-wrapper">
                <table className="production-table">
                  <thead>
                    <tr>
                      <th>Count Desc Code</th>
                      <th>Description</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(summary.byCountDescription || []).length === 0 ? (
                      <tr>
                        <td colSpan={3} className="production-empty">
                          No summary data.
                        </td>
                      </tr>
                    ) : (
                      (summary.byCountDescription || []).slice(0, 30).map((r) => (
                        <tr key={`${r.code}-${r.description}`}>
                          <td>{displayValue(r.code)}</td>
                          <td>{displayValue(r.description)}</td>
                          <td>{displayValue(r.count)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

