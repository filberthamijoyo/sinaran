'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SPRING, fadeSlideVariants, type SpringPreset } from './Spring';

/* ================================================================
   StaggerContainer
   Wraps children that use data-stagger or StaggerChild.
   StaggerChildren: 60ms between each child (disabled if reduced motion).
   DelayChildren: optional initial delay before stagger begins.
   ================================================================ */
interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Delay before the first child animates (seconds) */
  delayChildren?: number;
  /** Gap between each child's animation start (seconds) */
  staggerChildren?: number;
  /** Direction for children to animate in */
  direction?: 'up' | 'down' | 'left' | 'right';
  /** Distance to travel (px) */
  distance?: number;
}

export function StaggerContainer({
  children,
  className,
  delayChildren = 0,
  staggerChildren = 0.06,
  direction = 'up',
  distance = 16,
}: StaggerContainerProps) {
  const shouldReduce = useReducedMotion();
  const variants = fadeSlideVariants(direction, distance);

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={{
        hidden:  {},
        visible: {
          transition: {
            staggerChildren: shouldReduce ? 0 : staggerChildren,
            delayChildren:   shouldReduce ? 0 : delayChildren,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ================================================================
   StaggerChild
   Individual child inside StaggerContainer.
   Reads variant "hidden"/"visible" from parent.
   ================================================================ */
interface StaggerChildProps {
  children: React.ReactNode;
  className?: string;
  /** Override spring preset (default: smooth) */
  preset?: SpringPreset;
}

export function StaggerChild({ children, className, preset = 'smooth' }: StaggerChildProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={{
        hidden:  { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: shouldReduce
            ? { duration: 0.01 }
            : { ...SPRING[preset] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
