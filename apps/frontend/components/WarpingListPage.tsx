'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import './Production.css';
import { API_ENDPOINTS, apiCall } from '../lib/api';

const API_BASE_URL = API_ENDPOINTS.warping;

type WarpingRow = {
  id: number | null;
  tgl: string;
  start: string;
  stop: string;
  kp: string;
  kode: string;
  benang: string;
  lot: string;
  sp: string;
  pt: number | string;
  te: number | string;
  rpm: number | string;
  mtrPerMin: number | string;
  totalPutusan: number | string;
  totalBeam: number | string;
  effWarping: number | string;
  [key: string]: any;
};

const todayYMD = () => {
  const d = new Date();
  const pad2 = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const displayValue = (value: any) => {
  if (value === null || value === undefined || value === '') return '-';
  return value;
};

const getDefaultFilters = () => ({
  dateFrom: todayYMD(),
  dateTo: todayYMD(),
  kode: '',
  kp: '',
  lot: '',
});

export default function WarpingListPage() {
  const router = useRouter();
  const [rows, setRows] = useState<WarpingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: string; message: string }>({ type: '', message: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [filters, setFilters] = useState(getDefaultFilters);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(pagination.page));
    params.set('limit', String(pagination.limit));

    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    if (filters.kode) params.set('kode', filters.kode);
    if (filters.kp) params.set('kp', filters.kp);
    if (filters.lot) params.set('lot', filters.lot);

    return params.toString();
  }, [filters.dateFrom, filters.dateTo, filters.kode, filters.kp, filters.lot, pagination.limit, pagination.page]);

  const fetchWarping = async () => {
    try {
      setLoading(true);
      setFeedback({ type: '', message: '' });
      // Backend not implemented yet – keep shape ready for `${API_BASE_URL}/records?${queryParams}`
      const data = (await apiCall(`${API_BASE_URL}/records?${queryParams}`)) as any;
      setRows((data?.items || []) as WarpingRow[]);
      setPagination((prev) => ({
        ...prev,
        ...(data?.pagination || {}),
      }));
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Failed to fetch warping records',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarping();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters(getDefaultFilters());
    setPagination((prev) => ({ ...prev, page: 1 }));
    setFeedback({ type: '', message: '' });
  };

  const handleSelectRow = (row: WarpingRow) => {
    if (!row.id) return;
    router.push(`/warping/edit/${row.id}`);
  };

  const handleEditRow = (row: WarpingRow) => {
    if (!row.id) return;
    router.push(`/warping/edit/${row.id}`);
  };

  const handleDelete = async (id: number | null) => {
    if (!id) return;
    // eslint-disable-next-line no-alert
    const ok = window.confirm('Delete this warping record? This action cannot be undone.');
    if (!ok) return;
    try {
      setLoading(true);
      await apiCall(`${API_BASE_URL}/records/${id}`, { method: 'DELETE' });
      setFeedback({ type: 'success', message: 'Deleted successfully.' });
      await fetchWarping();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to delete record' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="production-module-container">
      <div className="production-list-header">
        <h2>Warping Records</h2>
        <p>View and manage warping division production data.</p>
      </div>

      <div className="production-module-content">
        {feedback.message && (
          <div
            className={`production-alert production-alert--${
              feedback.type === 'error' ? 'error' : 'success'
            }`}
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
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => router.push('/warping/new')}
                  >
                    New Warping Record
                  </button>
                </div>
              </div>

              {filtersExpanded && (
                <div className="filters-grid">
                  <div className="filter-group">
                    <label>Date From</label>
                    <input
                      type="date"
                      name="dateFrom"
                      value={filters.dateFrom}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div className="filter-group">
                    <label>Date To</label>
                    <input
                      type="date"
                      name="dateTo"
                      value={filters.dateTo}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div className="filter-group">
                    <label>Kode</label>
                    <input
                      type="text"
                      name="kode"
                      value={filters.kode}
                      onChange={handleFilterChange}
                      placeholder="Kode"
                    />
                  </div>
                  <div className="filter-group">
                    <label>KP</label>
                    <input
                      type="text"
                      name="kp"
                      value={filters.kp}
                      onChange={handleFilterChange}
                      placeholder="KP"
                    />
                  </div>
                  <div className="filter-group">
                    <label>Lot</label>
                    <input
                      type="text"
                      name="lot"
                      value={filters.lot}
                      onChange={handleFilterChange}
                      placeholder="Lot"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="production-table-wrapper">
              <table className="production-table">
                <thead>
                  <tr>
                    <th>TGL</th>
                    <th>START</th>
                    <th>STOP</th>
                    <th>KP</th>
                    <th>KODE</th>
                    <th>BENANG</th>
                    <th>LOT</th>
                    <th>SP</th>
                    <th>PT</th>
                    <th>TE</th>
                    <th>RPM</th>
                    <th>MTR/MIN</th>
                    <th>TOTAL PUTUSAN</th>
                    <th>TOTAL BEAM</th>
                    <th>EFF WARPING</th>
                    <th style={{ width: 120 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && !loading && (
                    <tr>
                      <td colSpan={16} style={{ textAlign: 'center' }}>
                        No records found.
                      </td>
                    </tr>
                  )}
                  {rows.map((row) => (
                    <tr
                      key={row.id ?? row.tgl + row.kode + row.kp}
                      className="production-table-row"
                      onClick={() => handleSelectRow(row)}
                    >
                      <td>{displayValue(row.tgl)}</td>
                      <td>{displayValue(row.start)}</td>
                      <td>{displayValue(row.stop)}</td>
                      <td>{displayValue(row.kp)}</td>
                      <td>{displayValue(row.kode)}</td>
                      <td>{displayValue(row.benang)}</td>
                      <td>{displayValue(row.lot)}</td>
                      <td>{displayValue(row.sp)}</td>
                      <td>{displayValue(row.pt)}</td>
                      <td>{displayValue(row.te)}</td>
                      <td>{displayValue(row.rpm)}</td>
                      <td>{displayValue(row.mtrPerMin)}</td>
                      <td>{displayValue(row.totalPutusan)}</td>
                      <td>{displayValue(row.totalBeam)}</td>
                      <td>{displayValue(row.effWarping)}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="btn-link"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditRow(row);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-link btn-link--danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(row.id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Simple pagination controls */}
            <div className="production-pagination">
              <button
                type="button"
                className="btn-secondary"
                disabled={pagination.page <= 1}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
                }
              >
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.totalPages || 1}
              </span>
              <button
                type="button"
                className="btn-secondary"
                disabled={pagination.totalPages > 0 && pagination.page >= pagination.totalPages}
                onClick={() =>
                  setPagination((prev) => ({
                    ...prev,
                    page:
                      pagination.totalPages > 0
                        ? Math.min(pagination.totalPages, prev.page + 1)
                        : prev.page + 1,
                  }))
                }
              >
                Next
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

