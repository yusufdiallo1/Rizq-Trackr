/**
 * Cache Utilities
 * Helper functions to clear browser cache and handle stale data
 */

/**
 * Clear all caches and reload the page
 * Use this if you're experiencing issues with stale data or 404 errors
 */
export function clearAllCachesAndReload(): void {
  if (typeof window === 'undefined') return;

  try {
    // Clear localStorage (except auth tokens)
    const authTokens = {
      finance_tracker_pin_hash: localStorage.getItem('finance_tracker_pin_hash'),
      finance_tracker_user_id: localStorage.getItem('finance_tracker_user_id'),
      finance_tracker_biometric_enabled: localStorage.getItem('finance_tracker_biometric_enabled'),
      finance_tracker_credential_id: localStorage.getItem('finance_tracker_credential_id'),
    };

    localStorage.clear();

    // Restore auth tokens
    Object.entries(authTokens).forEach(([key, value]) => {
      if (value) localStorage.setItem(key, value);
    });

    // Clear sessionStorage
    sessionStorage.clear();

    // Clear service worker cache if available
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }

    // Unregister service workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
        });
      });
    }

    // Hard reload the page
    window.location.reload();
  } catch (error) {
    console.error('Error clearing cache:', error);
    // Fallback: just reload
    window.location.reload();
  }
}

/**
 * Check if we're in a development environment
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Log cache-related warnings in development
 */
export function logCacheWarning(message: string): void {
  if (isDevelopment()) {
    console.warn(`[Cache Warning] ${message}`);
  }
}

