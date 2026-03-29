'use client';

import React from 'react';
import { ScaleIn } from './motion';
import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';

/* ================================================================
   EMPTY STATE — Simple empty state with Lucide icon.
   Uses ScaleIn entrance animation.
   ================================================================ */

interface EmptyStateProps {
  /** Short headline */
  title: string;
  /** Muted description */
  description?: string;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Optional action slot — renders a button or link below the description */
  action?: React.ReactNode;
  /** Additional className on the outer container */
  className?: string;
}

/* ================================================================
   Main EmptyState Component
   ================================================================ */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <ScaleIn preset="smooth" className={cn('flex flex-col items-center text-center px-6 py-12', className)}>
      {/* Icon */}
      <div
        className="mb-6 text-[#9CA3AF]"
      >
        {icon ?? <Inbox className="w-16 h-16" />}
      </div>

      {/* Title */}
      <h3
        className="text-xl font-semibold leading-tight mb-2"
        style={{ color: '#0F1117' }}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className="text-sm max-w-sm leading-relaxed mb-6"
          style={{ color: '#6B7280' }}
        >
          {description}
        </p>
      )}

      {/* CTA slot */}
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </ScaleIn>
  );
}

/* ================================================================
   Pre-configured Empty State variants for common scenarios
   ================================================================ */

/** No data yet — shown on fresh pages with no records */
export function EmptyNoRecords({ action }: { action?: React.ReactNode }) {
  return (
    <EmptyState
      title="No records yet"
      description="There are no entries at this stage yet. Records will appear here once they're created."
      action={action}
    />
  );
}

/** No results after filtering/searching */
export function EmptyNoResults({ onClear }: { onClear?: () => void }) {
  return (
    <EmptyState
      title="No results found"
      description="Your search or filter didn't match any records. Try adjusting your criteria."
      action={
        onClear ? (
          <button
            onClick={onClear}
            className="md-btn md-btn-outline text-sm"
          >
            Clear filters
          </button>
        ) : undefined
      }
    />
  );
}

/** Server error state */
export function EmptyError({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      title="Something went wrong"
      description="We couldn't load this data. Please check your connection and try again."
      action={
        onRetry ? (
          <button
            onClick={onRetry}
            className="md-btn md-btn-primary text-sm"
          >
            Try again
          </button>
        ) : undefined
      }
    />
  );
}

/** Loading complete — nothing to show */
export function EmptyNothing({ label }: { label?: string }) {
  return (
    <EmptyState
      title={label ?? "Nothing here yet"}
      description="There are no items to display at the moment."
    />
  );
}
