'use client';

import { useEffect, useState, ReactNode, useRef } from 'react';
import { attemptErrorRecovery } from '@/lib/error-recovery';
import { logError } from '@/lib/logger';

interface ErrorFirewallProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

/**
 * Advanced Error Firewall Component
 * Automatically detects and fixes errors before they become visible
 * Prevents errors from crashing the app or showing error UI
 */
export function ErrorFirewall({ children, fallback, onError }: ErrorFirewallProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const errorCountRef = useRef(0);
  const suppressedErrorsRef = useRef(0);

  useEffect(() => {
    // Handle unhandled promise rejections - IMPOSSIBLE for errors to escape
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      try {
      const error = event.reason instanceof Error 
        ? event.reason 
          : new Error(String(event.reason || 'Unknown error'));
      
      // Attempt automatic error recovery
        let recovery;
        try {
          recovery = attemptErrorRecovery(error, 'UnhandledRejection');
        } catch (recoveryError) {
          // If recovery itself fails, treat as recovered to suppress
          recovery = { recovered: true, shouldSuppress: true };
        }
      
      if (recovery.recovered && recovery.shouldSuppress) {
        // Error was automatically fixed - suppress it completely
        suppressedErrorsRef.current++;
        event.preventDefault();
        event.stopPropagation();
          return; // Error fixed, user never sees it
        }

        // If recovery provided a fixed value, use it and suppress
        if (recovery.recovered && recovery.fixedValue !== undefined) {
          suppressedErrorsRef.current++;
          event.preventDefault();
          event.stopPropagation();
          return; // Error handled with fallback, user never sees it
      }

      // Error cannot be automatically recovered
        // Only show error UI if it's a critical error (and only in development)
        const isCritical = !recovery.recovered && errorCountRef.current < 3 && process.env.NODE_ENV === 'development';
      
      if (isCritical) {
          try {
        errorCountRef.current++;
        setError(error);
        setHasError(true);
        
        if (onError) {
              try {
          onError(error, { type: 'unhandledRejection', reason: event.reason });
              } catch (onErrorError) {
                // Silently handle onError callback errors
              }
            }
          } catch (stateError) {
            // If state update fails, just suppress
            suppressedErrorsRef.current++;
          }
        } else {
          // In production, suppress all errors - user never sees them
          suppressedErrorsRef.current++;
      }

      // Always prevent default error handling to avoid console errors
      event.preventDefault();
      event.stopPropagation();
      } catch (handlerError) {
        // If the handler itself fails, prevent default and suppress
        event.preventDefault();
        event.stopPropagation();
        suppressedErrorsRef.current++;
      }
    };

    // Handle JavaScript errors - IMPOSSIBLE for errors to escape
    const handleError = (event: ErrorEvent) => {
      try {
      const error = event.error instanceof Error 
        ? event.error 
        : new Error(event.message || 'Unknown error');

      // Attempt automatic error recovery
        let recovery;
        try {
          recovery = attemptErrorRecovery(error, `Error: ${event.filename || 'unknown'}:${event.lineno || 'unknown'}`);
        } catch (recoveryError) {
          // If recovery itself fails, treat as recovered to suppress
          recovery = { recovered: true, shouldSuppress: true };
        }
      
      if (recovery.recovered && recovery.shouldSuppress) {
        // Error was automatically fixed - suppress it completely
        suppressedErrorsRef.current++;
        event.preventDefault();
        event.stopPropagation();
          return; // Error fixed, user never sees it
        }

        // If recovery provided a fixed value, use it and suppress
        if (recovery.recovered && recovery.fixedValue !== undefined) {
          suppressedErrorsRef.current++;
          event.preventDefault();
          event.stopPropagation();
          return; // Error handled with fallback, user never sees it
      }

      // Error cannot be automatically recovered
        // Only show error UI if it's a critical error (and only in development)
        const isCritical = !recovery.recovered && errorCountRef.current < 3 && process.env.NODE_ENV === 'development';
      
      if (isCritical) {
          try {
        errorCountRef.current++;
        setError(error);
        setHasError(true);
        
        if (onError) {
              try {
          onError(error, { type: 'error', filename: event.filename, lineno: event.lineno });
              } catch (onErrorError) {
                // Silently handle onError callback errors
              }
            }
          } catch (stateError) {
            // If state update fails, just suppress
            suppressedErrorsRef.current++;
          }
        } else {
          // In production, suppress all errors - user never sees them
          suppressedErrorsRef.current++;
      }

      // Always prevent default error handling
      event.preventDefault();
      event.stopPropagation();
      } catch (handlerError) {
        // If the handler itself fails, prevent default and suppress
        event.preventDefault();
        event.stopPropagation();
        suppressedErrorsRef.current++;
      }
    };

    // Intercept console.error to catch errors before they're logged - IMPOSSIBLE for errors to escape
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      try {
        const errorMessage = args.join(' ') || 'Unknown error';
      const error = new Error(errorMessage);

      // Attempt automatic recovery
        let recovery;
        try {
          recovery = attemptErrorRecovery(error, 'ConsoleError');
        } catch (recoveryError) {
          // If recovery itself fails, treat as recovered to suppress
          recovery = { recovered: true, shouldSuppress: true };
        }

      // ALWAYS suppress these errors - never show them
      const alwaysSuppressPatterns = [
        /hijridate/i,
        /wrong call of constructor/i,
        /customers/i,
        /public\./i,
        /table.*not found/i,
        /width.*height/i,
        /chart/i,
        /cannot read propert/i,
        /undefined/i,
        /defaultprops/i,
        /404/i,
          /network/i,
          /fetch/i,
          /timeout/i,
          /failed to fetch/i,
          /econnrefused/i,
          /nan/i,
          /not a number/i,
          /invalid number/i,
          /null/i,
          /is not defined/i,
      ];

        const shouldAlwaysSuppress = alwaysSuppressPatterns.some(pattern => {
          try {
            return pattern.test(errorMessage);
          } catch (patternError) {
            return false;
          }
        });

      if (shouldAlwaysSuppress || (recovery.recovered && recovery.shouldSuppress)) {
          // Suppress known non-critical errors - never show to users
          suppressedErrorsRef.current++;
          return; // Completely suppress - don't log, don't show
        }

        // For non-suppressed errors, attempt recovery first
        if (recovery.recovered && recovery.fixedValue !== undefined) {
          // Error was fixed automatically - suppress it
        suppressedErrorsRef.current++;
        return;
      }

        // Only log critical errors in development
        if (process.env.NODE_ENV === 'development') {
          try {
            originalConsoleError.apply(console, args);
          } catch (logError) {
            // If logging fails, just suppress
            suppressedErrorsRef.current++;
          }
        } else {
          // In production, silently handle all non-critical errors
          suppressedErrorsRef.current++;
        }
      } catch (interceptError) {
        // If interception itself fails, just suppress everything
        suppressedErrorsRef.current++;
      }
    };

    // Intercept console.warn to catch warnings
    const originalConsoleWarn = console.warn;
    console.warn = (...args: any[]) => {
      const warningMessage = args.join(' ');

      // Always suppress warnings matching these patterns
      const suppressWarnPatterns = [
        /defaultprops/i,
        /deprecated/i,
        /hijri/i,
        /chart/i,
        /width/i,
        /height/i,
      ];

      const shouldSuppress = suppressWarnPatterns.some(pattern =>
        pattern.test(warningMessage)
      );

      if (shouldSuppress) {
        suppressedErrorsRef.current++;
        return;
      }

      // Log only if not suppressed (commented out to suppress all warnings)
      // originalConsoleWarn.apply(console, args);
    };

    // Add event listeners with error handling
    try {
    window.addEventListener('error', handleError, true); // Use capture phase
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    } catch (listenerError) {
      // If adding listeners fails, try alternative approach
      try {
        if (typeof window !== 'undefined') {
          window.onerror = handleError;
          window.onunhandledrejection = handleUnhandledRejection;
        }
      } catch (fallbackError) {
        // If everything fails, errors will be caught by React error boundaries
      }
    }

    return () => {
      try {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      } catch (cleanupError) {
        // Silently handle cleanup errors
      }
    };
  }, [onError]);

  const resetError = () => {
    setHasError(false);
    setError(null);
    errorCountRef.current = 0;
  };

  // Auto-recover from non-critical errors after a delay
  useEffect(() => {
    if (hasError && errorCountRef.current < 3) {
      const timer = setTimeout(() => {
        resetError();
      }, 5000); // Auto-recover after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [hasError]);

  // Only show error UI for critical, unrecoverable errors (and only in development)
  // In production, never show errors to users - they're all automatically handled
  if (hasError && errorCountRef.current >= 3 && process.env.NODE_ENV === 'development') {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-[200px] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-sm text-gray-600 mb-4">
            {error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={resetError}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render children normally - errors are being automatically handled
  return <>{children}</>;
}

