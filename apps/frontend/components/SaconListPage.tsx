'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import './Production.css';
import { API_ENDPOINTS, apiCall } from '../lib/api';
import { displayValue, toYMD } from '../lib/utils';
import { SACON_COLUMNS } from './SaconColumns';

const API_BASE_URL = API_ENDPOINTS.sacon;

type Feedback = { type: '' | 'error' | 'success'; message: string };

interface SaconRecord {
  id: string | number;
  tgl?: string | null;
  permintaan?: string | null;
  codename?: string | null;
  kp?: string | null;
  konsKode?: string | null;
  kode?: string | null;
  katKode?: string | null;
  ketCtWs?: string | null;
  ketWarna?: string | null;
  status?: string | null;
  te?: number | null;
  sisir?: number | null;
  pKons?: number | null;
  neKLusi?: number | null;
  neLusi?: number | null;
  spLusi?: number | null;
  lotLusi?: number | null;
  neKPakan?: number | null;
  nePakan?: number | null;
  spPakan?: number | null;
  j?: number | null;
  jPerC?: number | null;
  bPerC?: number | null;
  tb?: number | null;
  tbReal?: number | null;
  baleLusi?: number | null;
  totalPakan?: number | null;
  balePakan?: number | null;
  ts?: number | null;
  sacon?: number | null;
  accStatus?: string | null;
  proses?: string | null;
  fotoSacon?: string | null;
  remarks?: string | null;
}

const getDefaultFilters = () => ({
  dateFrom: '',
  dateTo: '',
});

interface SaconResponse {
  records?: SaconRecord[];
  data?: SaconRecord[];
  items?: SaconRecord[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function SaconListPage() {
  const router = useRouter();

  const [rows, setRows] = useState<SaconRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({ type: '', message: '' });
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [filters, setFilters] = useState(getDefaultFilters);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set('page', String(pagination.page));
    params.set('limit', String(pagination.limit));

    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);

    return params.toString();
  }, [filters.dateFrom, filters.dateTo, pagination.limit, pagination.page]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setFeedback({ type: '', message: '' });

      const data = await apiCall(`${API_BASE_URL}/records?${queryParams}`) as SaconResponse | null;
      const records =
        data && typeof data === 'object' && !Array.isArray(data)
          ? (data as SaconResponse).records ||
            (data as SaconResponse).data ||
            (data as SaconResponse).items ||
            []
          : Array.isArray(data) ? data : [];

      setRows(records);
      setPagination((prev) => {
        if (data && typeof data === 'object' && 'pagination' in data) return (data as SaconResponse).pagination!;
        return {
          ...prev,
          total: records.length,
          totalPages: records.length > 0 ? 1 : 0,
        };
      });
    } catch {
      setFeedback({
        type: 'error',
        message: 'Failed to fetch Sacon records',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
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

  const handleSelectRow = (row: SaconRecord) => {
    if (!row?.id) return;
    router.push(`/sacon/edit/${row.id}`);
  };

  const handleEditRow = (row: SaconRecord) => {
    if (!row?.id) return;
    router.push(`/sacon/edit/${row.id}`);
  };

  const handleDelete = async (id: string | number) => {
    if (!id) return;
    // eslint-disable-next-line no-alert
    const ok = window.confirm('Delete this Sacon record? This action cannot be undone.');
    if (!ok) return;

    try {
      setLoading(true);
      await apiCall(`${API_BASE_URL}/records/${id}`, { method: 'DELETE' });
      setFeedback({ type: 'success', message: 'Deleted successfully.' });
      await fetchRecords();
    } catch {
      setFeedback({
        type: 'error',
        message: 'Failed to delete record',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="production-module-container">
      <div className="production-list-header">
        <h2>Sacon Records</h2>
        <p>View and manage Sacon division records.</p>
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
                    onClick={() => router.push('/sacon/new')}
                  >
                    New Sacon Record
                  </button>
                </div>
              </div>

              {filtersExpanded && (
                <div className="filters-grid">
                  <div className="filter-group">
                    <label>Date from</label>
                    <input
                      type="date"
                      name="dateFrom"
                      value={filters.dateFrom}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div className="filter-group">
                    <label>Date to</label>
                    <input
                      type="date"
                      name="dateTo"
                      value={filters.dateTo}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="production-table-header">
              <div>
                <h3 className="section-heading">Sacon Records</h3>
                <p className="production-table-subtitle">
                  Showing {rows.length} of {pagination.total || rows.length} records. Click a row to
                  edit.
                </p>
              </div>
            </div>

            <div className="production-table-wrapper">
              <table className="production-table">
                <thead>
                  <tr>
                    {/* We deliberately spell out a stable column order rather than relying on object keys */}
                    <th>TGL</th>
                    <th>Permintaan</th>
                    <th>CODENAME</th>
                    <th>KP</th>
                    <th>Kons Kode</th>
                    <th>KODE</th>
                    <th>Kat Kode</th>
                    <th>Ket CT /WS</th>
                    <th>Ket Warna</th>
                    <th>Status</th>
                    <th>TE</th>
                    <th>SISIR</th>
                    <th>P (Kons)</th>
                    <th>Ne K Lusi</th>
                    <th>Ne Lusi</th>
                    <th>Sp Lusi</th>
                    <th>Lot Lusi</th>
                    <th>Ne K Pakan</th>
                    <th>Ne Pakan</th>
                    <th>Sp Pakan</th>
                    <th>J</th>
                    <th>J/C</th>
                    <th>B/C</th>
                    <th>TB</th>
                    <th>TB REAL</th>
                    <th>BALE LUSI</th>
                    <th>TOTAL PAKAN</th>
                    <th>BALE PAKAN</th>
                    <th>TS</th>
                    <th>SACON</th>
                    <th>ACC / TIDAK ACC</th>
                    <th>PROSES</th>
                    <th>Foto Sacon</th>
                    <th>Remarks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={36} className="production-empty">
                        {loading
                          ? 'Loading...'
                          : 'No records found. Use "New Sacon Record" to add data.'}
                      </td>
                    </tr>
                  ) : (
                    rows.map((row: SaconRecord) => (
                      <tr key={row.id} onClick={() => handleSelectRow(row)}>
                        <td>{displayValue(toYMD(row.tgl))}</td>
                        <td>{displayValue(row.permintaan)}</td>
                        <td>{displayValue(row.codename)}</td>
                        <td>{displayValue(row.kp)}</td>
                        <td>{displayValue(row.konsKode)}</td>
                        <td>{displayValue(row.kode)}</td>
                        <td>{displayValue(row.katKode)}</td>
                        <td>{displayValue(row.ketCtWs)}</td>
                        <td>{displayValue(row.ketWarna)}</td>
                        <td>{displayValue(row.status)}</td>
                        <td>{displayValue(row.te)}</td>
                        <td>{displayValue(row.sisir)}</td>
                        <td>{displayValue(row.pKons)}</td>
                        <td>{displayValue(row.neKLusi)}</td>
                        <td>{displayValue(row.neLusi)}</td>
                        <td>{displayValue(row.spLusi)}</td>
                        <td>{displayValue(row.lotLusi)}</td>
                        <td>{displayValue(row.neKPakan)}</td>
                        <td>{displayValue(row.nePakan)}</td>
                        <td>{displayValue(row.spPakan)}</td>
                        <td>{displayValue(row.j)}</td>
                        <td>{displayValue(row.jPerC)}</td>
                        <td>{displayValue(row.bPerC)}</td>
                        <td>{displayValue(row.tb)}</td>
                        <td>{displayValue(row.tbReal)}</td>
                        <td>{displayValue(row.baleLusi)}</td>
                        <td>{displayValue(row.totalPakan)}</td>
                        <td>{displayValue(row.balePakan)}</td>
                        <td>{displayValue(row.ts)}</td>
                        <td>{displayValue(row.sacon)}</td>
                        <td>{displayValue(row.accStatus)}</td>
                        <td>{displayValue(row.proses)}</td>
                        <td>{displayValue(row.fotoSacon)}</td>
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
                  onClick={() =>
                    setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))
                  }
                  disabled={pagination.page === 1}
                >
                  Previous
                </button>
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() =>
                    setPagination((p) => ({
                      ...p,
                      page: Math.min(p.totalPages, p.page + 1),
                    }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

