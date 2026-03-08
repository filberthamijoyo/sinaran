'use client';

import React from 'react';

type AlertVariant = 'error' | 'success' | 'warning' | 'info';

interface AlertProps {
  variant?: AlertVariant;
  message: string;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  message,
  className = '',
}) => {
  const baseClasses = 'alert';
  const variantClasses = {
    error: 'alert-error',
    success: 'alert-success',
    warning: 'alert-warning',
    info: 'alert-info',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`.trim()}>
      {message}
    </div>
  );
};
