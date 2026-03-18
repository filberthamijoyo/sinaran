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
        style={{
          background: '#E0E5EC',
          borderRadius: '16px',
          boxShadow: currentPage === 0
            ? 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)'
            : '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
          color: currentPage === 0 ? '#9CA3AF' : '#6B7280',
          border: 'none',
        }}
      >
        Previous
      </Button>
      <span style={{ margin: '0 0.5rem', color: '#6B7280', fontSize: '14px' }}>
        Page {currentPage + 1} of {totalPages}
      </span>
      <Button
        disabled={currentPage >= totalPages - 1}
        onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
        style={{
          background: '#E0E5EC',
          borderRadius: '16px',
          boxShadow: currentPage >= totalPages - 1
            ? 'inset 6px 6px 10px rgb(163 177 198 / 0.6), inset -6px -6px 10px rgba(255,255,255,0.5)'
            : '9px 9px 16px rgb(163 177 198 / 0.6), -9px -9px 16px rgba(255,255,255,0.5)',
          color: currentPage >= totalPages - 1 ? '#9CA3AF' : '#6B7280',
          border: 'none',
        }}
      >
        Next
      </Button>
    </div>
  );
};
