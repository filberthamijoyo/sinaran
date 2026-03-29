'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SPRING, fadeSlideVariants, type SpringPreset } from './Spring';

/* ================================================================
   InViewFade
   Fades + slides into view once when scrolled into viewport.
   Uses IntersectionObserver via Framer Motion's whileInView.
   ================================================================ */
interface InViewFadeProps {
  children: React.ReactNode;
  className?: string;
  /** Direction to slide in from */
  direction?: 'up' | 'down' | 'left' | 'right';
  /** Distance to travel (px) */
  distance?: number;
  /** Delay before animation starts (seconds) */
  delay?: number;
  /** Spring preset */
  preset?: SpringPreset;
  /** Viewport margin (CSS margin) */
  margin?: string;
}

export function InViewFade({
  children,
  className,
  direction = 'up',
  distance = 20,
  delay = 0,
  preset = 'smooth',
  margin = '-30px',
}: InViewFadeProps) {
  const shouldReduce = useReducedMotion();
  const variants = fadeSlideVariants(direction, distance);

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin }}
      variants={variants}
      transition={
        shouldReduce
          ? { duration: 0.01 }
          : { ...SPRING[preset], delay }
      }
    >
      {children}
    </motion.div>
  );
}

/* ================================================================
   ScaleIn
   Scales from 0.94 to 1 with spring overshoot on mount.
   Great for modals, cards, toast notifications.
   ================================================================ */
interface ScaleInProps {
  children: React.ReactNode;
  className?: string;
  /** Initial scale (default 0.94) */
  from?: number;
  /** Spring preset */
  preset?: SpringPreset;
  /** Delay before animation starts */
  delay?: number;
}

export function ScaleIn({
  children,
  className,
  from = 0.94,
  preset = 'smooth',
  delay = 0,
}: ScaleInProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: from }}
      animate={{ opacity: 1, scale: 1 }}
      transition={
        shouldReduce
          ? { duration: 0.01 }
          : { ...SPRING[preset], delay }
      }
    >
      {children}
    </motion.div>
  );
}

/* ================================================================
   FadeIn
   Simple opacity fade. No translate.
   ================================================================ */
interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
}

export function FadeIn({ children, className, duration = 0.3, delay = 0 }: FadeInProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={
        shouldReduce
          ? { duration: 0.01 }
          : { duration, delay, ease: [0.16, 1, 0.3, 1] }
      }
    >
      {children}
    </motion.div>
  );
}

/* ================================================================
   SlideIn
   Slides in from left or right. For drawers, panels, sidebars.
   ================================================================ */
interface SlideInProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'left' | 'right';
  /** Distance to travel (px) */
  distance?: number;
  preset?: SpringPreset;
}

export function SlideIn({
  children,
  className,
  direction = 'right',
  distance = 24,
  preset = 'precision',
}: SlideInProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: direction === 'right' ? distance : -distance }}
      animate={{ opacity: 1, x: 0 }}
      transition={shouldReduce ? { duration: 0.01 } : SPRING[preset]}
    >
      {children}
    </motion.div>
  );
}
