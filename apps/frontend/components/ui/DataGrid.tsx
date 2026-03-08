'use client';

import React from 'react';
import { Button } from './button';
import { useDataGrid } from '../../hooks/useDataGrid';
import type { DataGridConfig } from '../../lib/types';
import './DataGrid.css';
import './shared.css';

interface DataGridProps {
  config: DataGridConfig;
  title: string;
  description?: string;
  filterFields?: Array<{
    id: string;
    label: string;
    type: 'text' | 'date' | 'select';
    options?: Array<{ value: string; label: string }>;
  }>;
  className?: string;
}

export const DataGrid: React.FC<DataGridProps> = ({
  config,
  title,
  description,
  filterFields = [],
  className = '',
}) => {
  const {
    rows,
    filteredRows,
    visibleRows,
    filters,
    loading,
    savingRowId,
    activeCell,
    groupHeaderCells,
    pagination,
    handlers,
  } = useDataGrid(config);

  return (
    <div className={`data-grid-page ${className}`.trim()}>
      <div className="data-grid-page-header">
        <div className="data-grid-page-title-group">
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        <div className="data-grid-page-actions">
          <button type="button" className="btn btn-secondary" onClick={handlers.addRow}>
            + Add Row
          </button>
        </div>
      </div>

      {filterFields.length > 0 && (
        <div className="data-grid-filter-bar">
          {filterFields.map((field) => (
            <div key={field.id} className="data-grid-filter-group">
              <span className="data-grid-filter-label">{field.label}</span>
              {field.type === 'select' ? (
                <select
                  className="data-grid-filter-input"
                  value={filters[field.id] || ''}
                  onChange={(e) => handlers.handleFilterChange(field.id, e.target.value)}
                >
                  <option value="">All</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  className="data-grid-filter-input"
                  value={filters[field.id] || ''}
                  onChange={(e) => handlers.handleFilterChange(field.id, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="data-grid-card">
        <div className="data-grid-header">
          <h3>{title} Entries</h3>
          <div className="data-grid-meta">
            {loading
              ? 'Loading…'
              : `${rows.length} total rows • ${filteredRows.length} after filters`}
          </div>
        </div>
        <div className="data-grid-container">
          <table className="data-grid">
            <thead>
              {groupHeaderCells.length > 0 && (
                <tr>
                  <th style={{ width: 120 }} />
                  {groupHeaderCells.map((cell, idx) => (
                    <th key={`grp-${idx}`} colSpan={cell.colSpan} className="data-grid-group-header">
                      {cell.label}
                    </th>
                  ))}
                </tr>
              )}
              <tr>
                <th style={{ width: 120 }}>Save</th>
                {config.columns.map((col) => (
                  <th
                    key={col.id}
                    style={{ width: col.width }}
                    className={col.type === 'number' ? 'data-grid-col-numeric' : undefined}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => {
                const rowIndex = rows.findIndex((r) => r._localId === row._localId);
                if (rowIndex === -1) return null;
                return (
                  <tr key={row._localId}>
                    <td className="data-grid-cell">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handlers.saveRow(rowIndex)}
                        disabled={savingRowId === row._localId}
                      >
                        {row._status === 'clean' ? 'Saved' : 'Save'}
                      </button>
                      {row._error && (
                        <div style={{ color: '#dc2626', fontSize: '0.7rem', marginTop: 4 }}>
                          {row._error}
                        </div>
                      )}
                    </td>
                    {config.columns.map((col, colIndex) => {
                      const value = (row[col.id] ?? '') as string;
                      const isActive =
                        activeCell.rowIndex === rowIndex && activeCell.colIndex === colIndex;

                      return (
                        <td key={col.id} className="data-grid-cell">
                          <input
                            data-row={rowIndex}
                            data-col={colIndex}
                            className={`data-grid-input ${col.type === 'number' ? 'number' : ''}`}
                            data-active={isActive ? 'true' : 'false'}
                            type={col.type === 'number' ? 'text' : col.type}
                            inputMode={col.type === 'number' ? 'decimal' : undefined}
                            placeholder={col.placeholder}
                            value={value}
                            readOnly={col.readOnly}
                            onChange={(e) => handlers.handleCellChange(rowIndex, col.id, e.target.value)}
                            onFocus={() => handlers.focusCell(rowIndex, colIndex)}
                            onKeyDown={(e) => handlers.handleKeyDown(e, rowIndex, colIndex)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="data-grid-footer">
          <span className="data-grid-row-count">
            Showing rows {pagination.pageStart + 1}-{Math.min(pagination.pageEnd, filteredRows.length)} of{' '}
            {filteredRows.length} filtered rows
          </span>
          <div className="data-grid-pagination">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={pagination.pageIndex === 0}
              onClick={() => pagination.setPageIndex((p) => Math.max(0, p - 1))}
            >
              Previous
            </button>
            <span style={{ margin: '0 0.5rem' }}>
              Page {pagination.pageIndex + 1} of {pagination.totalPages}
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={pagination.pageIndex >= pagination.totalPages - 1}
              onClick={() => pagination.setPageIndex((p) => Math.min(pagination.totalPages - 1, p + 1))}
            >
              Next
            </button>
          </div>
          <span className="data-grid-hint">
            <span className="data-grid-kb">Arrows</span>, <span className="data-grid-kb">Tab</span>,{' '}
            <span className="data-grid-kb">Shift+Tab</span> to move •{' '}
            <span className="data-grid-kb">Enter</span> on last cell adds a new row
          </span>
        </div>
      </div>
    </div>
  );
};
