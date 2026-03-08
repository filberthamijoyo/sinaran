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
    <div className={`pagination ${className}`.trim()}>
      <Button
        variant="secondary"
        disabled={currentPage === 0}
        onClick={() => onPageChange(Math.max(0, currentPage - 1))}
      >
        Previous
      </Button>
      <span style={{ margin: '0 0.5rem' }}>
        Page {currentPage + 1} of {totalPages}
      </span>
      <Button
        variant="secondary"
        disabled={currentPage >= totalPages - 1}
        onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
      >
        Next
      </Button>
    </div>
  );
};
