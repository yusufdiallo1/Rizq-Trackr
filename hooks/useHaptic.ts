'use client';

/**
 * Haptic feedback hook for iOS-native feel
 * Provides light tap, medium impact, and success/error patterns
 */
export function useHaptic() {
  const vibrate = (pattern: number | number[]) => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const lightTap = () => {
    vibrate(10); // 10ms light tap
  };

  const mediumImpact = () => {
    vibrate(20); // 20ms medium impact
  };

  const success = () => {
    vibrate([10, 50, 10]); // Success pattern: tap, pause, tap
  };

  const error = () => {
    vibrate([20, 50, 20, 50, 20]); // Error pattern: three taps with pauses
  };

  return {
    lightTap,
    mediumImpact,
    success,
    error,
    vibrate,
  };
}

