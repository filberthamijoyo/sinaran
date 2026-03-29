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
      <div className="data-grid-page-header rounded-xl p-6 mb-4 bg-[#F7F8FA] border border-[#E5E7EB]">
        <div className="data-grid-page-title-group">
          <h2 className="text-2xl font-semibold text-[#0F1117]">{title}</h2>
          {description && <p className="text-sm text-[#6B7280] mt-1">{description}</p>}
        </div>
        <div className="data-grid-page-actions">
          <button
            type="button"
            onClick={handlers.addRow}
            className="px-4 py-2 text-sm font-medium bg-[#1D4ED8] text-white rounded-lg border-none cursor-pointer"
          >
            + Add Row
          </button>
        </div>
      </div>

      {filterFields.length > 0 && (
        <div className="data-grid-filter-bar rounded-xl p-4 mb-4 bg-[#F7F8FA] border border-[#E5E7EB]">
          <div className="flex flex-wrap gap-4">
            {filterFields.map((field) => (
              <div key={field.id} className="data-grid-filter-group">
                <span className="text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF] mb-1 block">
                  {field.label}
                </span>
                {field.type === 'select' ? (
                  <select
                    className="data-grid-filter-input h-9 px-3 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#0F1117]"
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
                    className="data-grid-filter-input h-9 px-3 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#0F1117]"
                    value={filters[field.id] || ''}
                    onChange={(e) => handlers.handleFilterChange(field.id, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="data-grid-card rounded-xl p-6 bg-[#F7F8FA] border border-[#E5E7EB]">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#E5E7EB]">
          <h3 className="text-lg font-semibold text-[#0F1117]">{title} Entries</h3>
          <div className="data-grid-meta text-sm text-[#6B7280]">
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
                      className="data-grid-group-header text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF] bg-[#F7F8FA]"
                    >
                      {cell.label}
                    </th>
                  ))}
                </tr>
              )}
              <tr className="bg-[#F7F8FA]">
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
                    className="border-b border-[#E5E7EB] bg-[#F7F8FA]"
                  >
                    <td className="data-grid-cell">
                      <button
                        type="button"
                        onClick={() => handlers.saveRow(rowIndex)}
                        disabled={savingRowId === row._localId}
                        className="px-3 py-1.5 text-xs font-medium bg-[#1D4ED8] text-white rounded-lg border-none cursor-pointer"
                      >
                        {row._status === 'clean' ? 'Saved' : 'Save'}
                      </button>
                      {row._error && (
                        <div className="text-red-600 text-[0.7rem] mt-1">
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
                            className={`data-grid-input bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#0F1117] w-full focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/20 ${col.type === 'number' ? 'number text-right' : ''}`}
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
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#E5E7EB]">
          <span className="data-grid-row-count text-xs text-[#6B7280]">
            Showing rows {pagination.pageStart + 1}-{Math.min(pagination.pageEnd, filteredRows.length)} of{' '}
            {filteredRows.length} filtered rows
          </span>
          <div className="data-grid-pagination flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.pageIndex === 0}
              onClick={() => pagination.setPageIndex((p) => Math.max(0, p - 1))}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-[#E5E7EB] text-[#374151] rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-xs text-[#6B7280]">
              Page {pagination.pageIndex + 1} of {pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={pagination.pageIndex >= pagination.totalPages - 1}
              onClick={() => pagination.setPageIndex((p) => Math.min(pagination.totalPages - 1, p + 1))}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-[#E5E7EB] text-[#374151] rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <span className="data-grid-hint text-[11px] text-[#9CA3AF]">
            <span className="data-grid-kb text-[#6B7280]">Arrows</span>, <span className="data-grid-kb text-[#6B7280]">Tab</span>,{' '}
            <span className="data-grid-kb text-[#6B7280]">Shift+Tab</span> to move •{' '}
            <span className="data-grid-kb text-[#6B7280]">Enter</span> on last cell adds a new row
          </span>
        </div>
      </div>
    </div>
  );
};
