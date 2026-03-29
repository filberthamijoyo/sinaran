'use client';

import { type Variants, type Transition } from 'framer-motion';

/* ================================================================
   SPRING PRESETS — Physics-based motion constants
   Used across all Framer Motion transitions in the design system
   ================================================================ */
export const SPRING = {
  /** Bouncy: fast, springy — button press feedback, toggles */
  bouncy:   { type: 'spring' as const, stiffness: 400, damping: 18 },
  /** Snappy: responsive — UI state changes, badges, tooltips */
  snappy:    { type: 'spring' as const, stiffness: 500, damping: 30 },
  /** Smooth: gentle — card entrances, layout shifts */
  smooth:    { type: 'spring' as const, stiffness: 300, damping: 40 },
  /** Precision: tight — sidebar indicator, layout morphing */
  precision: { type: 'spring' as const, stiffness: 600, damping: 28 },
  /** Layout: shared layout animations — Framer layoutId transitions */
  layout:    { type: 'spring' as const, stiffness: 380, damping: 30 },
} as const;

export type SpringPreset = keyof typeof SPRING;

/* ================================================================
   TRANSITION HELPERS
   ================================================================ */

/** Combine a spring preset with optional delay */
export function withSpring(
  preset: SpringPreset,
  delay = 0,
  reduceMotion = false,
): Transition {
  const spring = { ...SPRING[preset] };
  if (reduceMotion) return { duration: 0.01 };
  return { ...spring, delay };
}

/** Fade + translate entrance/exit */
export function fadeSlideVariants(
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  distance = 16,
): Variants {
  const offsets = {
    up:    { x: 0,       y: distance  },
    down:  { x: 0,       y: -distance },
    left:  { x: distance, y: 0        },
    right: { x: -distance, y: 0       },
  };
  return {
    hidden:  { opacity: 0, ...offsets[direction] },
    visible: { opacity: 1, x: 0, y: 0 },
  };
}
