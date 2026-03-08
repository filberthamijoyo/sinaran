'use client';

import React from 'react';
import { Button } from './button';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
}) => {
  return (
    <div className="page-header">
      <div className="page-header-title-group">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
};
