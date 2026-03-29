'use client';

import { motion, useReducedMotion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { SPRING, type SpringPreset } from './Spring';

/* ================================================================
   NumberTicker
   Animates a numeric value from 0 to target when scrolled into view.
   Supports formatted numbers with separators.
   ================================================================ */
interface NumberTickerProps {
  value: number;
  className?: string;
  /** Duration in seconds */
  duration?: number;
  /** Spring preset */
  preset?: SpringPreset;
  /** Format as thousands separator */
  formatted?: boolean;
}

export function NumberTicker({
  value,
  className,
  duration = 1.2,
  preset = 'smooth',
  formatted = true,
}: NumberTickerProps) {
  const shouldReduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      >
        {shouldReduce
          ? (formatted ? value.toLocaleString('en-US') : value)
          : (
            <motion.span>
              {Array.from({ length: Math.ceil(duration * 30) }, (_, i) => {
                const progress = Math.min(i / (Math.ceil(duration * 30) - 1), 1);
                const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
                const current = Math.round(eased * value);
                return (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={
                      shouldReduce
                        ? { opacity: 1, y: 0 }
                        : { opacity: 1, y: 0 }
                    }
                    transition={{ delay: i * (duration / Math.ceil(duration * 30)) }}
                    style={{ display: 'inline-block' }}
                  >
                    {formatted ? current.toLocaleString('en-US') : current}
                  </motion.span>
                );
              })}
            </motion.span>
          )}
      </motion.span>
    </motion.span>
  );
}

/* ================================================================
   AnimatePresence wrapper for use with page transitions.
   Mount this in a parent component, pass children as render prop.
   ================================================================ */
interface AnimatedGroupProps {
  children: React.ReactNode;
  mode?: 'wait' | 'sync' | 'popLayout';
  className?: string;
}

export function AnimatedGroup({ children, mode = 'wait', className }: AnimatedGroupProps) {
  return (
    <motion.div className={className}>
      {children}
    </motion.div>
  );
}
