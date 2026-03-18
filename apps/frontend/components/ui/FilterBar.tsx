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
    <div
      className={`filter-bar ${className}`.trim()}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'flex-end',
      }}
    >
      {filterConfigs.map((config) => {
        if (config.type === 'select') {
          return (
            <div
              key={config.key}
              className="filter-group"
              style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
            >
              {config.label && (
                <label
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: '#9CA3AF' }}
                >
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
          <div
            key={config.key}
            className="filter-group"
            style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
          >
            {config.label && (
              <label
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: '#9CA3AF' }}
              >
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
