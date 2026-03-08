'use client';

import React from 'react';

interface FormGroupProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  label,
  required = false,
  error,
  helperText,
  children,
  className = '',
}) => {
  return (
    <div className={`form-group ${className}`.trim()}>
      {label && (
        <label>
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      {children}
      {error && <span className="form-error">{error}</span>}
      {helperText && !error && <span className="form-helper-text">{helperText}</span>}
    </div>
  );
};
