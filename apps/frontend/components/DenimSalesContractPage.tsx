'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import './Production.css';
import { API_ENDPOINTS, apiCall } from '../lib/api';

const API_BASE = API_ENDPOINTS.denim;

type SalesContractRow = {
  id: number;
  kp: string;
  tgl: string;
  codename: string | null;
  permintaan: string | null;
  kat_kode: string | null;
  ket_warna: string | null;
  status: string | null;
  acc: string | null;
  proses: string | null;
  te: number | null;
  tb: number | null;
};

const todayYMD = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

const displayValue = (v: any) =>
  v === null || v === undefined || v === '' ? '-' : String(v);

export default function DenimSalesContractPage() {
  const router = useRouter();
  const [rows, setRows] = useState<SalesContractRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [filters, setFilters] = useState({
    kp: '',
    codename: '',
    acc: '',
    dateFrom: '',
    dateTo: '',
  });
  const [pagination, setPagination] = useState({
    page: 1, limit: 50, total: 0, totalPages: 0,
  });

  const queryParams = useMemo(() => {
    const p = new URLSearchParams();
    p.set('page', String(pagination.page));
    p.set('limit', String(pagination.limit));
    if (filters.kp) p.set('kp', filters.kp);
    if (filters.codename) p.set('codename', filters.codename);
    if (filters.acc) p.set('acc', filters.acc);
    if (filters.dateFrom) p.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) p.set('dateTo', filters.dateTo);
    return p.toString();
  }, [filters, pagination.page, pagination.limit]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setFeedback({ type: '', message: '' });
      const data = await apiCall(
        `${API_BASE}/sales-contracts?${queryParams}`
      ) as any;
      setRows(data?.items || []);
      setPagination(prev => ({ ...prev, ...(data?.pagination || {}) }));
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to fetch' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [queryParams]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({ kp: '', codename: '', acc: '', dateFrom: '', dateTo: '' });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatDate = (iso: string) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const accBadge = (acc: string | null) => {
    if (!acc) return <span className="badge badge--neutral">-</span>;
    const isAcc = acc.toUpperCase().includes('ACC') && !acc.toUpperCase().includes('TIDAK');
    return (
      <span className={`badge ${isAcc ? 'badge--success' : 'badge--danger'}`}>
        {acc}
      </span>
    );
  };

  return (
    <div className="production-module-container">
      <div className="production-list-header">
        <h2>Sales Contract — Denim</h2>
        <p>Master order list. Click a row to view the full production pipeline.</p>
      </div>

      <div className="production-module-content">
        {feedback.message && (
          <div className={`production-alert production-alert--${
            feedback.type === 'error' ? 'error' : 'success'}`}>
            {feedback.message}
          </div>
        )}
        {loading && <div className="production-loading">Loading...</div>}

        <div className="production-layout">
          <section className="production-table-panel production-table-panel--full">

            {/* Filters */}
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
                <button type="button" className="btn-clear" onClick={handleClearFilters}>
                  Clear
                </button>
              </div>
              {filtersExpanded && (
                <div className="filters-grid">
                  <div className="filter-group">
                    <label>KP</label>
                    <input type="text" name="kp" value={filters.kp}
                      onChange={handleFilterChange} placeholder="e.g. BSPD" />
                  </div>
                  <div className="filter-group">
                    <label>Code / Konstruksi</label>
                    <input type="text" name="codename" value={filters.codename}
                      onChange={handleFilterChange} placeholder="e.g. DTR 1069" />
                  </div>
                  <div className="filter-group">
                    <label>Status ACC</label>
                    <select name="acc" value={filters.acc} onChange={handleFilterChange}>
                      <option value="">All</option>
                      <option value="ACC">ACC</option>
                      <option value="TIDAK ACC">TIDAK ACC</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Tanggal From</label>
                    <input type="date" name="dateFrom" value={filters.dateFrom}
                      onChange={handleFilterChange} />
                  </div>
                  <div className="filter-group">
                    <label>Tanggal To</label>
                    <input type="date" name="dateTo" value={filters.dateTo}
                      onChange={handleFilterChange} />
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
                    <th>KP</th>
                    <th>CODENAME</th>
                    <th>CUSTOMER</th>
                    <th>KAT</th>
                    <th>WARNA</th>
                    <th>STATUS</th>
                    <th>TE</th>
                    <th>TB</th>
                    <th>ACC</th>
                    <th>PROSES</th>
                    <th>Pipeline</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && !loading && (
                    <tr>
                      <td colSpan={12} style={{ textAlign: 'center' }}>
                        No records found.
                      </td>
                    </tr>
                  )}
                  {rows.map(row => (
                    <tr key={row.id} className="production-table-row"
                      onClick={() => router.push(`/denim/pipeline/${row.kp}`)}>
                      <td>{formatDate(row.tgl)}</td>
                      <td><strong>{row.kp}</strong></td>
                      <td>{displayValue(row.codename)}</td>
                      <td>{displayValue(row.permintaan)}</td>
                      <td>{displayValue(row.kat_kode)}</td>
                      <td>{displayValue(row.ket_warna)}</td>
                      <td>{displayValue(row.status)}</td>
                      <td>{displayValue(row.te)}</td>
                      <td>{displayValue(row.tb)}</td>
                      <td>{accBadge(row.acc)}</td>
                      <td>{displayValue(row.proses)}</td>
                      <td>
                        <button type="button" className="btn-link"
                          onClick={e => { e.stopPropagation();
                            router.push(`/denim/pipeline/${row.kp}`); }}>
                          Lihat →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="production-pagination">
              <button type="button" className="btn-secondary"
                disabled={pagination.page <= 1}
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>
                Previous
              </button>
              <span>Page {pagination.page} of {pagination.totalPages || 1}
                {' '}({pagination.total || rows.length} records)
              </span>
              <button type="button" className="btn-secondary"
                disabled={pagination.totalPages > 0 && pagination.page >= pagination.totalPages}
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>
                Next
              </button>
            </div>

          </section>
        </div>
      </div>
    </div>
  );
}
