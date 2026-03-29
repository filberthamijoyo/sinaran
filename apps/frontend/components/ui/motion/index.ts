// Re-export all motion primitives
export { SPRING, withSpring, fadeSlideVariants } from './Spring';
export type { SpringPreset } from './Spring';
export type { Transition } from 'framer-motion';

export { StaggerContainer, StaggerChild } from './StaggerContainer';

export { InViewFade, FadeIn, ScaleIn, SlideIn } from './FadeIn';

export { NumberTicker, AnimatedGroup } from './NumberTicker';

// Re-export hooks for consumers
export { useReducedMotion, useInView } from 'framer-motion';
