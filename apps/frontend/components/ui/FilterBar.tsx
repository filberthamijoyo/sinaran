'use client';

import React from 'react';
import { Input } from './input';
import { Select } from './select';

export type FilterConfig = {
  type: 'date' | 'text' | 'select' | 'number';
  key: string;
  label: string;
  placeholder?: string;
  options?: Array<{ value: string | number; label: string }>;
};

interface FilterBarProps {
  filters: Record<string, any>;
  filterConfigs: FilterConfig[];
  onChange: (key: string, value: any) => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  filterConfigs,
  onChange,
  className = '',
}) => {
  return (
    <div className={`filter-bar ${className}`.trim()}>
      {filterConfigs.map((config) => {
        if (config.type === 'select') {
          return (
            <div key={config.key} className="filter-group">
              {config.label && (
                <label className="text-xs font-medium text-zinc-600 mb-1 block">
                  {config.label}
                </label>
              )}
              <Select
                options={config.options || []}
                value={filters[config.key] || ''}
                onChange={(value) => onChange(config.key, value)}
                placeholder={config.placeholder}
              />
            </div>
          );
        }

        return (
          <div key={config.key} className="filter-group">
            {config.label && (
              <label className="text-xs font-medium text-zinc-600 mb-1 block">
                {config.label}
              </label>
            )}
            <Input
              type={config.type}
              placeholder={config.placeholder}
              value={filters[config.key] || ''}
              onChange={(e) => onChange(config.key, e.target.value)}
            />
          </div>
        );
      })}
    </div>
  );
};
