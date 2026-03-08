'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import './Production.css';
import { API_ENDPOINTS, apiCall } from '../lib/api';
import { toStr, toYMD } from '../lib/utils';
import { Pagination } from './ui/Pagination';
import { CollapsibleFilters } from './ui/CollapsibleFilters';
import { WEAVING_BASE_COLUMNS, WEAVING_TRIPUTRA_COLUMNS } from './WeavingDivisionPage';

const API_BASE_URL = API_ENDPOINTS.weaving;
const PAGE_SIZE = 20;

type Feedback = { type: '' | 'error' | 'success'; message: string };

const ALL_COLUMNS = [...WEAVING_BASE_COLUMNS, ...WEAVING_TRIPUTRA_COLUMNS];

export default function WeavingListPage() {
  const router = useRouter();

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({ type: '', message: '' });
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [showTriputraRaw, setShowTriputraRaw] = useState(false);

  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
  });

  const columns = useMemo(
    () => (showTriputraRaw ? ALL_COLUMNS : WEAVING_BASE_COLUMNS),
    [showTriputraRaw],
  );

  const queryParams = useMemo(() => {
    const params = new URLSearchParams({ limit: '200', page: '1' });
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    return params.toString();
  }, [filters.dateFrom, filters.dateTo]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setFeedback((prev) => (prev.type === 'error' ? prev : { type: '', message: '' }));
      const res = (await apiCall(`${API_BASE_URL}/records?${queryParams}`)) as any;
      const records = Array.isArray(res) ? res : (res?.records as any[]) || [];
      setRows(records);
      setPageIndex(0);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to load records' });
      setRows([]);
      setPageIndex(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams]);

  const visibleRows = useMemo(() => {
    const start = pageIndex * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [pageIndex, rows]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ dateFrom: '', dateTo: '' });
    setFeedback({ type: '', message: '' });
  };

  const handleSelectRow = (row: any) => {
    if (!row?.id) return;
    router.push(`/weaving/edit/${row.id}`);
  };

  const handleDelete = async (row: any) => {
    const id = row?.id;
    if (!id) return;
    // eslint-disable-next-line no-alert
    const ok = window.confirm('Delete this weaving record? This action cannot be undone.');
    if (!ok) return;

    try {
      setLoading(true);
      await apiCall(`${API_BASE_URL}/records/${id}`, { method: 'DELETE' });
      setFeedback({ type: 'success', message: 'Deleted successfully.' });
      await fetchRecords();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Failed to delete record' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="production-module-container">
      <div className="production-list-header">
        <h2>Weaving Reports</h2>
        <p>View and manage weaving rapid-entry records.</p>
      </div>

      <div className="production-module-content">
        {feedback.message && (
          <div className={`production-alert production-alert--${feedback.type === 'error' ? 'error' : 'success'}`}>
            {feedback.message}
          </div>
        )}

        {loading && <div className="production-loading">Loading...</div>}

        <div className="production-layout">
          <section className="production-table-panel production-table-panel--full">
            <CollapsibleFilters
              expanded={filtersExpanded}
              onToggle={() => setFiltersExpanded(!filtersExpanded)}
              actions={
                <>
                  <button type="button" className="btn-clear" onClick={handleClearFilters}>
                    Clear Filters
                  </button>
                  <button type="button" className="btn-primary" onClick={() => router.push('/weaving/new')}>
                    New Weaving Entry
                  </button>
                </>
              }
            >
              <div className="filter-group">
                <label>Date from</label>
                <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} />
              </div>
              <div className="filter-group">
                <label>Date to</label>
                <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} />
              </div>
              <div className="filter-group">
                <label>Show raw Triputra %</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={showTriputraRaw}
                    onChange={(e) => setShowTriputraRaw(e.target.checked)}
                  />
                  <span>Include Triputra raw percentage columns</span>
                </div>
              </div>
            </CollapsibleFilters>

            <div className="production-table-header">
              <div>
                <h3 className="section-heading">Weaving Records</h3>
                <p className="production-table-subtitle">
                  Showing {visibleRows.length} of {rows.length} records (client page {pageIndex + 1}/{totalPages}). Click
                  a row to edit.
                </p>
              </div>
            </div>

            <div className="production-table-wrapper">
              <table className="production-table">
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col.id}>{col.label}</th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + 1} className="production-empty">
                        {loading ? 'Loading...' : 'No records found. Use "New Weaving Entry" to add data.'}
                      </td>
                    </tr>
                  ) : (
                    visibleRows.map((row, idx) => (
                      <tr key={row.id ?? `${row.tanggal ?? 'row'}-${idx}`} onClick={() => handleSelectRow(row)}>
                        {columns.map((col) => {
                          const raw = col.id === 'tanggal' ? toYMD(row?.tanggal) : toStr(row?.[col.id]);
                          const value = raw === '' ? '-' : raw;
                          return <td key={`${row.id || 'row'}-${col.id}`}>{value}</td>;
                        })}
                        <td className="production-actions-cell" onClick={(e) => e.stopPropagation()}>
                          <div className="production-row-actions">
                            <button
                              type="button"
                              className="production-action-btn production-action-btn--edit"
                              onClick={() => handleSelectRow(row)}
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              className="production-action-btn production-action-btn--delete"
                              onClick={() => handleDelete(row)}
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

            {totalPages > 1 && (
              <Pagination
                currentPage={pageIndex}
                totalPages={totalPages}
                onPageChange={setPageIndex}
                className="production-pagination"
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

