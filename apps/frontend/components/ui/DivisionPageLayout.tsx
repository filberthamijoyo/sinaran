'use client';

import React from 'react';
import PageHeader from '../layout/PageHeader';
import { FilterBar, FilterConfig } from './FilterBar';
import { Button } from './button';

interface DivisionPageLayoutProps {
  title: string;
  description?: string;
  filters: Record<string, string>;
  filterConfigs: FilterConfig[];
  onFilterChange: (key: string, value: string) => void;
  onAddRow?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const DivisionPageLayout: React.FC<DivisionPageLayoutProps> = ({
  title,
  description = 'Excel-style grid optimised for keyboard-only input. Use arrow keys, Tab, and Enter to move between cells.',
  filters,
  filterConfigs,
  onFilterChange,
  onAddRow,
  children,
  className = '',
}) => {
  return (
    <div className={`division-page ${className}`.trim()}>
      <PageHeader
        title={title}
        subtitle={description}
        actions={
          onAddRow ? (
            <Button variant="secondary" onClick={onAddRow}>
              + Add Row
            </Button>
          ) : undefined
        }
      />
      {filterConfigs.length > 0 && (
        <FilterBar
          filters={filters}
          filterConfigs={filterConfigs}
          onChange={onFilterChange}
        />
      )}
      {children}
    </div>
  );
};
