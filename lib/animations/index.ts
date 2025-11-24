export * from "./constants";
export * from "./variants";

/**
 * Animation utilities and exports
 */

export * from './constants';
export * from './variants';

import { useReducedMotion } from 'framer-motion';

/**
 * Hook to check if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get animation duration based on reduced motion preference
 */
export function getAnimationDuration(
  normalDuration: number,
  reducedDuration: number = 0
): number {
  if (typeof window === 'undefined') return normalDuration;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return prefersReduced ? reducedDuration : normalDuration;
}

/**
 * Animation configuration that respects reduced motion
 */
export function getAnimationConfig() {
  const prefersReduced = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  return {
    prefersReduced,
    duration: prefersReduced ? 0.01 : undefined,
    transition: prefersReduced ? { duration: 0.01 } : undefined,
  };
}

/**
 * Get animation variants that respect reduced motion preference
 */
export function getReducedMotionVariants<T extends Record<string, any>>(
  variants: T,
  prefersReduced: boolean
): T {
  if (prefersReduced) {
    // Return minimal variants - just opacity transitions
    const reduced: any = {};
    for (const key in variants) {
      reduced[key] = {
        opacity: variants[key]?.opacity ?? 1,
        transition: { duration: 0.01 },
      };
    }
    return reduced as T;
  }
  return variants;
}

