'use client';

import React from 'react';

interface CollapsibleFiltersProps {
  title?: string;
  expanded: boolean;
  onToggle: () => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const CollapsibleFilters: React.FC<CollapsibleFiltersProps> = ({
  title = 'Filters',
  expanded,
  onToggle,
  actions,
  children,
}) => {
  return (
    <div className="filters-section">
      <div className="filters-header-row">
        <button type="button" className="filters-toggle-btn" onClick={onToggle}>
          <span>{expanded ? '▼' : '▶'}</span>
          <h3>{title}</h3>
        </button>
        {actions && <div style={{ display: 'flex', gap: 12 }}>{actions}</div>}
      </div>

      {expanded && <div className="filters-grid">{children}</div>}
    </div>
  );
};

