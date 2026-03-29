'use client';

import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

/* ================================================================
   Premium Shimmer Skeleton
   Uses a high-end sweep animation rather than simple opacity pulse.
   GPU-accelerated via will-change: transform.
   Respects prefers-reduced-motion.
   ================================================================ */

interface SkeletonProps extends React.ComponentProps<'div'> {
  /** Shape variant */
  variant?: 'text' | 'circle' | 'rect' | 'card';
  /** Optional width override */
  width?: string | number;
  /** Optional height override */
  height?: string | number;
}

const VARIANT_DEFAULTS = {
  text:   { height: '1em',   borderRadius: '6px',  width: '100%'  },
  circle: { height: '40px',  borderRadius: '8px',  width: '40px'  },
  rect:   { height: '120px', borderRadius: '12px',  width: '100%'  },
  card:   { height: '200px', borderRadius: '12px',  width: '100%'  },
};

function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const shouldReduce = useReducedMotion();
  const defaults = VARIANT_DEFAULTS[variant];

  return (
    <div
      data-slot="skeleton"
      className={cn('skeleton-shimmer', className)}
      style={{
        width:       width  ?? defaults.width,
        height:      height ?? defaults.height,
        borderRadius: defaults.borderRadius,
        // GPU acceleration — shimmer is a visual transform
        willChange:  'transform',
        // Kill animation for motion-sensitive users
        animation:   shouldReduce ? 'none' : undefined,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
}

/* ================================================================
   Skeleton Group — multiple skeletons in a layout
   Useful for loading card, table row, etc.
   ================================================================ */
function SkeletonGroup({ className, children, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col gap-3', className)} {...props}>
      {children}
    </div>
  );
}

export { Skeleton, SkeletonGroup };
