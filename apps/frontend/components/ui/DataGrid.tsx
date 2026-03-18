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
      <div
        className="data-grid-page-header"
        style={{
          background: '#E0E5EC',
          borderRadius: '32px',
          padding: '24px',
          marginBottom: '16px',
          boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
        }}
      >
        <div className="data-grid-page-title-group">
          <h2 style={{ color: '#3D4852', fontSize: '24px', fontWeight: '600', margin: 0 }}>{title}</h2>
          {description && <p style={{ color: '#6B7280', fontSize: '14px', margin: '4px 0 0' }}>{description}</p>}
        </div>
        <div className="data-grid-page-actions">
          <button
            type="button"
            onClick={handlers.addRow}
            style={{
              background: '#E0E5EC',
              borderRadius: '16px',
              boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
              color: '#6B7280',
              border: 'none',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            + Add Row
          </button>
        </div>
      </div>

      {filterFields.length > 0 && (
        <div
          className="data-grid-filter-bar"
          style={{
            background: '#E0E5EC',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '16px',
            boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          {filterFields.map((field) => (
            <div key={field.id} className="data-grid-filter-group">
              <span
                className="data-grid-filter-label"
                style={{ color: '#9CA3AF', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                {field.label}
              </span>
              {field.type === 'select' ? (
                <select
                  className="data-grid-filter-input"
                  value={filters[field.id] || ''}
                  onChange={(e) => handlers.handleFilterChange(field.id, e.target.value)}
                  style={{
                    background: '#E0E5EC',
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                    color: '#3D4852',
                    padding: '8px 12px',
                    fontSize: '14px',
                  }}
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
                  style={{
                    background: '#E0E5EC',
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                    color: '#3D4852',
                    padding: '8px 12px',
                    fontSize: '14px',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div
        className="data-grid-card"
        style={{
          background: '#E0E5EC',
          borderRadius: '32px',
          padding: '24px',
          boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
        }}
      >
        <div
          className="data-grid-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            paddingBottom: '16px',
            borderBottom: '1px solid rgb(163 177 198 / 0.3)',
          }}
        >
          <h3 style={{ color: '#3D4852', fontSize: '18px', fontWeight: '600', margin: 0 }}>{title} Entries</h3>
          <div className="data-grid-meta" style={{ color: '#6B7280', fontSize: '14px' }}>
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
                    <th
                      key={`grp-${idx}`}
                      colSpan={cell.colSpan}
                      className="data-grid-group-header"
                      style={{ background: '#E0E5EC', color: '#9CA3AF', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    >
                      {cell.label}
                    </th>
                  ))}
                </tr>
              )}
              <tr style={{ background: '#E0E5EC' }}>
                <th style={{ width: 120, color: '#9CA3AF', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Save</th>
                {config.columns.map((col) => (
                  <th
                    key={col.id}
                    style={{ width: col.width, color: '#9CA3AF', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}
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
                  <tr
                    key={row._localId}
                    style={{
                      background: '#E0E5EC',
                      borderBottom: '1px solid rgb(163 177 198 / 0.3)',
                    }}
                  >
                    <td className="data-grid-cell">
                      <button
                        type="button"
                        onClick={() => handlers.saveRow(rowIndex)}
                        disabled={savingRowId === row._localId}
                        style={{
                          background: '#E0E5EC',
                          borderRadius: '16px',
                          boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
                          color: '#6C63FF',
                          border: 'none',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer',
                        }}
                      >
                        {row._status === 'clean' ? 'Saved' : 'Save'}
                      </button>
                      {row._error && (
                        <div style={{ color: '#DC2626', fontSize: '0.7rem', marginTop: 4 }}>
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
                            style={{
                              background: '#E0E5EC',
                              border: 'none',
                              borderRadius: '16px',
                              boxShadow: isActive
                                ? 'inset 10px 10px 20px rgb(163 177 198 / 0.7), inset -10px -10px 20px rgba(255,255,255,0.6), 0 0 0 2px #6C63FF'
                                : 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)',
                              color: '#3D4852',
                              padding: '8px 12px',
                              fontSize: '14px',
                              width: '100%',
                            }}
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
        <div
          className="data-grid-footer"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid rgb(163 177 198 / 0.3)',
          }}
        >
          <span className="data-grid-row-count" style={{ color: '#6B7280', fontSize: '12px' }}>
            Showing rows {pagination.pageStart + 1}-{Math.min(pagination.pageEnd, filteredRows.length)} of{' '}
            {filteredRows.length} filtered rows
          </span>
          <div className="data-grid-pagination" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              disabled={pagination.pageIndex === 0}
              onClick={() => pagination.setPageIndex((p) => Math.max(0, p - 1))}
              style={{
                background: '#E0E5EC',
                borderRadius: '16px',
                boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
                color: '#6B7280',
                border: 'none',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Previous
            </button>
            <span style={{ color: '#6B7280', fontSize: '12px' }}>
              Page {pagination.pageIndex + 1} of {pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={pagination.pageIndex >= pagination.totalPages - 1}
              onClick={() => pagination.setPageIndex((p) => Math.min(pagination.totalPages - 1, p + 1))}
              style={{
                background: '#E0E5EC',
                borderRadius: '16px',
                boxShadow: '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
                color: '#6B7280',
                border: 'none',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Next
            </button>
          </div>
          <span className="data-grid-hint" style={{ color: '#9CA3AF', fontSize: '11px' }}>
            <span className="data-grid-kb" style={{ color: '#6B7280' }}>Arrows</span>, <span className="data-grid-kb" style={{ color: '#6B7280' }}>Tab</span>,{' '}
            <span className="data-grid-kb" style={{ color: '#6B7280' }}>Shift+Tab</span> to move •{' '}
            <span className="data-grid-kb" style={{ color: '#6B7280' }}>Enter</span> on last cell adds a new row
          </span>
        </div>
      </div>
    </div>
  );
};
