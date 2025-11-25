import { Variants } from "framer-motion";
import {
  ANIMATION_DURATION,
  ANIMATION_EASING,
  ANIMATION_DURATION_MS,
  EASING,
  STAGGER,
} from "./constants";

// Simple duration/easing-based variants (seconds)

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.base,
      ease: ANIMATION_EASING.easeOut,
    },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.base,
      ease: ANIMATION_EASING.easeOut,
    },
  },
};

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION.slow,
      ease: ANIMATION_EASING.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: ANIMATION_DURATION.pageOut,
      ease: ANIMATION_EASING.easeOut,
    },
  },
};

export const slideInFromTop: Variants = {
  hidden: { opacity: 0, y: -40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.base,
      ease: ANIMATION_EASING.easeOut,
    },
  },
};

export const slideInFromBottom: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION.base,
      ease: ANIMATION_EASING.easeOut,
    },
  },
};

export const slideInFromLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_DURATION.base,
      ease: ANIMATION_EASING.easeOut,
    },
  },
};

export const slideInFromRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_DURATION.base,
      ease: ANIMATION_EASING.easeOut,
    },
  },
};

export const staggerContainer = (stagger = 0.15): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
    },
  },
});

// Millisecond-based variants using ANIMATION_DURATION_MS and EASING

export const fadeVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION_MS.FAST / 1000,
      ease: EASING.EASE_OUT,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: ANIMATION_DURATION_MS.QUICK / 1000,
      ease: EASING.EASE_OUT,
    },
  },
};

export const slideDownVariants: Variants = {
  hidden: {
    y: -100,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION_MS.FAST / 1000,
      ease: EASING.EASE_OUT,
    },
  },
};

/**
 * Navbar entrance – explicit alias for clarity in components
 * Spec: slide down from top (300ms, ease-out)
 */
export const navbarVariants: Variants = {
  hidden: {
    y: -40,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION_MS.FAST / 1000, // 300ms
      ease: EASING.EASE_OUT,
    },
  },
};

export const slideUpVariants: Variants = {
  hidden: {
    y: "100%",
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION_MS.STANDARD / 1000,
      ease: EASING.EASE_OUT,
    },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: {
      duration: ANIMATION_DURATION_MS.FAST / 1000,
      ease: EASING.EASE_OUT,
    },
  },
};

/**
 * Bottom sheet / mobile drawer
 * Spec: slide up from bottom (400ms, ease-out)
 */
export const bottomSheetVariants: Variants = {
  hidden: {
    y: "100%",
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: EASING.EASE_OUT,
    },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: EASING.EASE_OUT,
    },
  },
};

export const slideInLeftVariants: Variants = {
  hidden: {
    x: "-100%",
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION_MS.FAST / 1000,
      ease: EASING.EASE_OUT,
    },
  },
  exit: {
    x: "-100%",
    opacity: 0,
    transition: {
      duration: ANIMATION_DURATION_MS.FAST / 1000,
      ease: EASING.EASE_OUT,
    },
  },
};

/**
 * Sidebar – slide in from left (300ms, ease-out)
 */
export const sidebarVariants: Variants = {
  hidden: {
    x: "-100%",
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION_MS.FAST / 1000, // 300ms
      ease: EASING.EASE_OUT,
    },
  },
  exit: {
    x: "-100%",
    opacity: 0,
    transition: {
      duration: ANIMATION_DURATION_MS.FAST / 1000,
      ease: EASING.EASE_OUT,
    },
  },
};

export const scaleInVariants: Variants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION_MS.FAST / 1000,
      ease: EASING.SMOOTH,
    },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    transition: {
      duration: ANIMATION_DURATION_MS.QUICK / 1000,
      ease: EASING.EASE_OUT,
    },
  },
};

/**
 * Modal overlay + content
 * Spec:
 * - Backdrop: fade in 200ms
 * - Modal: scale from 0.8 → 1 + fade (300ms)
 */
export const modalOverlayVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION_MS.QUICK / 1000, // 200ms
      ease: EASING.EASE_OUT,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: ANIMATION_DURATION_MS.QUICK / 1000,
      ease: EASING.EASE_OUT,
    },
  },
};

export const modalContentVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION_MS.FAST / 1000, // ~300ms
      ease: EASING.SMOOTH,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: ANIMATION_DURATION_MS.QUICK / 1000,
      ease: EASING.EASE_OUT,
    },
  },
};

export const fadeInScaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION_MS.STANDARD / 1000,
      ease: EASING.SMOOTH,
    },
  },
};

export const slideInBottomVariants: Variants = {
  hidden: {
    y: 20,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION_MS.FAST / 1000,
      ease: EASING.EASE_OUT,
    },
  },
};

/**
 * List / table rows
 * Spec: fade in + slide right (staggered)
 */
export const listRowVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_DURATION_MS.QUICK / 1000,
      ease: EASING.EASE_OUT,
    },
  },
  exit: {
    opacity: 0,
    x: -40,
    transition: {
      duration: ANIMATION_DURATION_MS.QUICK / 1000,
      ease: EASING.EASE_OUT,
    },
  },
};

export const staggerContainerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: STAGGER.NORMAL,
      delayChildren: 0,
    },
  },
};

export const staggerTightVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: STAGGER.TIGHT,
      delayChildren: 0,
    },
  },
};

export const staggerLooseVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: STAGGER.LOOSE,
      delayChildren: 0,
    },
  },
};

export const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      // Slightly longer for smoother entrance
      duration: ANIMATION_DURATION_MS.STANDARD / 1000,
      ease: EASING.EASE_OUT,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: ANIMATION_DURATION_MS.QUICK / 1000,
      ease: EASING.EASE_OUT,
    },
  },
};

export const listItemVariants: Variants = {
  hidden: {
    x: -20,
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION_MS.QUICK / 1000,
      ease: EASING.EASE_OUT,
    },
  },
  exit: {
    x: -100,
    opacity: 0,
    transition: {
      duration: ANIMATION_DURATION_MS.QUICK / 1000,
      ease: EASING.EASE_OUT,
    },
  },
};

export const scaleFromCenterVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION_MS.FAST / 1000,
      ease: EASING.SPRING,
    },
  },
};

export const toastVariants: Variants = {
  hidden: {
    x: "100%",
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION_MS.FAST / 1000,
      ease: EASING.EASE_OUT,
    },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: {
      duration: ANIMATION_DURATION_MS.FAST / 1000,
      ease: EASING.EASE_OUT,
    },
  },
};

export const buttonVariants: Variants = {
  hover: {
    scale: 1.05,
    filter: "brightness(1.1)",
    transition: {
      duration: ANIMATION_DURATION_MS.QUICK / 1000,
      ease: EASING.EASE_OUT,
    },
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: EASING.EASE_OUT,
    },
  },
};

/**
 * Success icon pulse (e.g., after actions)
 */
export const successIconVariants: Variants = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  animate: {
    scale: [0, 1.1, 1],
    opacity: [0, 1, 1],
    transition: {
      duration: ANIMATION_DURATION_MS.FAST / 1000,
      ease: EASING.SPRING,
    },
  },
};

export const cardVariants: Variants = {
  hover: {
    y: -4,
    filter: "brightness(1.05)",
    transition: {
      duration: ANIMATION_DURATION_MS.QUICK / 1000,
      ease: EASING.EASE_OUT,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: EASING.EASE_OUT,
    },
  },
};

export const inputFocusVariants: Variants = {
  unfocused: {
    scale: 1,
  },
  focused: {
    scale: 1.02,
    transition: {
      duration: ANIMATION_DURATION_MS.QUICK / 1000,
      ease: EASING.EASE_OUT,
    },
  },
};

/**
 * Page transition variants for consistent page animations
 */
export const getPageVariants = (direction: 'forward' | 'back' = 'forward'): Variants => ({
  initial: {
    opacity: 0,
    y: direction === 'forward' ? 20 : -20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION_MS.STANDARD / 1000,
      ease: EASING.SMOOTH,
    },
  },
  exit: {
    opacity: 0,
    y: direction === 'forward' ? -20 : 20,
    scale: 0.98,
    transition: {
      duration: ANIMATION_DURATION_MS.QUICK / 1000,
      ease: EASING.EASE_OUT,
    },
  },
});

/**
 * Card variants for metric cards, list items, etc.
 */
export const getCardVariants = (index: number = 0): Variants => {
  // Ensure safe defaults to prevent undefined errors
  const duration = (ANIMATION_DURATION_MS?.FAST || 300) / 1000;
  const delay = index * (STAGGER?.NORMAL || 0.075);
  const ease = EASING?.EASE_OUT || [0.0, 0, 0.2, 1];
  
  return {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
        duration,
        ease,
        delay,
    },
  },
  };
};

/**
 * Chart animation variants
 */
export const chartVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION_MS.STANDARD / 1000,
      ease: EASING.SMOOTH,
      delay: 0.2,
    },
  },
};

/**
 * Counter animation variants (for numbers counting up)
 */
export const counterVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: ANIMATION_DURATION_MS.FAST / 1000,
      ease: EASING.SPRING,
    },
  },
};

/**
 * List item variants with stagger support
 */
export const getListItemVariants = (index: number = 0): Variants => ({
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: ANIMATION_DURATION_MS.QUICK / 1000,
      ease: EASING.EASE_OUT,
      delay: index * STAGGER.TIGHT,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: ANIMATION_DURATION_MS.QUICK / 1000,
      ease: EASING.EASE_OUT,
    },
  },
});

/**
 * Filter bar variants
 */
export const filterBarVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION_DURATION_MS.FAST / 1000,
      ease: EASING.EASE_OUT,
    },
  },
};

/**
 * iOS Spring Animation Variants
 * Uses cubic-bezier(0.34, 1.56, 0.64, 1) for iOS-native spring feel
 */
export const springTapVariants: Variants = {
  tap: {
    scale: 0.95,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 17,
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 17,
    },
  },
};

export const springSlideUpVariants: Variants = {
  hidden: {
    y: '100%',
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
};

export const springSlideDownVariants: Variants = {
  hidden: {
    y: '-100%',
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    y: '-100%',
    opacity: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
};

export const springFadeVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
};

export const springScaleVariants: Variants = {
  hidden: {
    scale: 0.9,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    scale: 0.9,
    opacity: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
};

/**
 * Shimmer animation variants for button hover effects
 */
export const shimmerVariants: Variants = {
  hidden: {
    backgroundPosition: '200% 0',
  },
  visible: {
    backgroundPosition: '-200% 0',
    transition: {
      duration: 1.5,
      ease: 'linear',
      repeat: Infinity,
    },
  },
};

/**
 * Ripple animation variants for click effects
 */
export const rippleVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 0.6,
  },
  visible: {
    scale: 4,
    opacity: 0,
    transition: {
      duration: 0.6,
      ease: EASING.EASE_OUT,
    },
  },
};

/**
 * Pulse animation variants for glowing borders
 */
export const pulseVariants: Variants = {
  hidden: {
    opacity: 0.5,
    scale: 1,
  },
  visible: {
    opacity: [0.5, 1, 0.5],
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
};

/**
 * Slide up variants for placeholder/label animations
 */
export const slideUpVariants: Variants = {
  hidden: {
    y: 10,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATION.base,
      ease: ANIMATION_EASING.easeOut,
    },
  },
};

/**
 * Bounce in variants for checkmark/icon animations
 */
export const bounceInVariants: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 15,
      duration: 0.4,
    },
  },
};

