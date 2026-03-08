'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import './Production.css';
import { API_ENDPOINTS, apiCall } from '../lib/api';
import { toStr, toYMD } from '../lib/utils';
import { Pagination } from './ui/Pagination';
import { CollapsibleFilters } from './ui/CollapsibleFilters';
import { INDIGO_COLUMNS } from './indigoConfig';

const API_BASE_URL = API_ENDPOINTS.indigo;
const PAGE_SIZE = 20;

type Feedback = { type: '' | 'error' | 'success'; message: string };

export default function IndigoListPage() {
  const router = useRouter();

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({ type: '', message: '' });
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    countDescriptionCode: '',
  });

  const [countDescriptions, setCountDescriptions] = useState<Array<{ code: string; name: string }>>([]);

  const [pageIndex, setPageIndex] = useState(0);

  // Dropdown load (graceful failure)
  useEffect(() => {
    const loadDropdowns = async () => {
      const settled = await Promise.allSettled([
        apiCall(`${API_ENDPOINTS.unified}/count-descriptions`) as Promise<Array<{ code: string; name: string }>>,
      ]);

      const firstError = settled.find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined;
      if (firstError) {
        const message = (firstError.reason as any)?.message || String(firstError.reason || 'Unknown error');
        setFeedback({ type: 'error', message: `Some dropdowns failed to load: ${message}` });
      }

      const countDescRes = settled[0];
      setCountDescriptions(countDescRes.status === 'fulfilled' ? countDescRes.value || [] : []);
    };

    loadDropdowns();
  }, []);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams({ limit: '200', page: '1' });
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    if (filters.countDescriptionCode) params.set('countDescriptionCode', filters.countDescriptionCode);
    return params.toString();
  }, [filters.countDescriptionCode, filters.dateFrom, filters.dateTo]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setFeedback((p) => (p.type === 'error' ? p : { type: '', message: '' }));
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
    setFilters((p) => ({ ...p, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ dateFrom: '', dateTo: '', countDescriptionCode: '' });
    setFeedback({ type: '', message: '' });
  };

  const handleSelectRow = (row: any) => {
    if (!row?.id) return;
    router.push(`/indigo/edit/${row.id}`);
  };

  const handleDelete = async (row: any) => {
    const id = row?.id;
    if (!id) return;
    // eslint-disable-next-line no-alert
    const ok = window.confirm('Delete this indigo record? This action cannot be undone.');
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
        <h2>Indigo Reports</h2>
        <p>View and manage Indigo rapid-entry records.</p>
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
                  <button type="button" className="btn-primary" onClick={() => router.push('/indigo/new')}>
                    New Indigo Entry
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
                <label>Filter by NE</label>
                <select
                  name="countDescriptionCode"
                  value={filters.countDescriptionCode}
                  onChange={handleFilterChange}
                >
                  <option value="">All NE</option>
                  {countDescriptions.map((cd) => (
                    <option key={cd.code} value={cd.code}>
                      {cd.name}
                    </option>
                  ))}
                </select>
              </div>
            </CollapsibleFilters>

            <div className="production-table-header">
              <div>
                <h3 className="section-heading">Indigo Records</h3>
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
                    {INDIGO_COLUMNS.map((col) => (
                      <th key={col.id}>{col.label}</th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.length === 0 ? (
                    <tr>
                      <td colSpan={INDIGO_COLUMNS.length + 1} className="production-empty">
                        {loading ? 'Loading...' : 'No records found. Use "New Indigo Entry" to add data.'}
                      </td>
                    </tr>
                  ) : (
                    visibleRows.map((row, idx) => (
                      <tr key={row.id ?? `${row.tanggal ?? 'row'}-${idx}`} onClick={() => handleSelectRow(row)}>
                        {INDIGO_COLUMNS.map((col) => {
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

