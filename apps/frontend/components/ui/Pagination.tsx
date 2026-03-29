'use client';

import React from 'react';
import { Button } from './button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  return (
    <div
      className={`pagination ${className}`.trim()}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <Button
        disabled={currentPage === 0}
        onClick={() => onPageChange(Math.max(0, currentPage - 1))}
        className="h-8 px-3 text-xs"
        variant="outline"
      >
        Previous
      </Button>
      <span style={{ margin: '0 0.5rem', color: '#6B7280', fontSize: '14px' }}>
        Page {currentPage + 1} of {totalPages}
      </span>
      <Button
        disabled={currentPage >= totalPages - 1}
        onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
        className="h-8 px-3 text-xs"
        variant="outline"
      >
        Next
      </Button>
    </div>
  );
};
