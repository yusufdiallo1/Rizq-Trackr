export const ANIMATION_DURATION = {
  fast: 0.2,
  base: 0.3,
  slow: 0.5,
  pageOut: 0.2,
  pageIn: 0.3,
} as const;

export const ANIMATION_EASING = {
  easeOut: [0.16, 1, 0.3, 1] as [number, number, number, number],
  easeInOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
} as const;

/**
 * Animation timing constants
 * All durations are in milliseconds
 */
export const ANIMATION_DURATION_MS = {
  // Quick actions
  QUICK: 200,
  FAST: 300,
  
  // Standard transitions
  STANDARD: 500,
  SLOW: 800,
  
  // Extended animations
  EXTENDED: 1000,
  VERY_SLOW: 1500,
} as const;

/**
 * Animation easing functions
 */
export const EASING = {
  // Quick actions
  EASE_OUT: [0.0, 0, 0.2, 1],
  EASE_IN_OUT: [0.4, 0, 0.2, 1],
  
  // Smooth transitions
  SMOOTH: [0.25, 0.46, 0.45, 0.94],
  
  // Spring-like
  SPRING: [0.68, -0.55, 0.265, 1.55],
  
  // Bounce
  BOUNCE: [0.68, -0.6, 0.32, 1.6],
} as const;

/**
 * Stagger delays (in seconds)
 */
export const STAGGER = {
  TIGHT: 0.05,
  NORMAL: 0.075,
  LOOSE: 0.1,
  WIDE: 0.15,
} as const;

/**
 * Animation delays (in milliseconds)
 */
export const DELAY = {
  NONE: 0,
  SHORT: 100,
  MEDIUM: 200,
  LONG: 300,
  EXTRA_LONG: 400,
} as const;

