import type { Variants, Transition } from "framer-motion";

/** Whimsical easing curve — reused from HandWrittenTitle */
export const WHIMSICAL_EASE = [0.43, 0.13, 0.23, 0.96] as const;

/** Spring config for playful bounces */
export const WHIMSICAL_SPRING = {
  type: "spring" as const,
  stiffness: 260,
  damping: 20,
};

/** Shared transition using whimsical cubic-bezier */
export const whimsicalTransition: Transition = {
  duration: 0.5,
  ease: [0.43, 0.13, 0.23, 0.96],
};

/** Fade + slide up — page entry, card entry */
export const fadeSlideUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: whimsicalTransition,
  },
};

/** Stagger container — wraps children that use fadeSlideUp */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

/** Scale-in for FAB items */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.4 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: WHIMSICAL_SPRING,
  },
  exit: {
    opacity: 0,
    scale: 0.4,
    transition: { duration: 0.2 },
  },
};

/** Fade overlay backdrop */
export const fadeOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};
