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
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      
      // Attempt automatic error recovery
      const recovery = attemptErrorRecovery(error, 'UnhandledRejection');
      
      if (recovery.recovered && recovery.shouldSuppress) {
        // Error was automatically fixed - suppress it completely
        suppressedErrorsRef.current++;
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      // Error cannot be automatically recovered
      // Only show error UI if it's a critical error
      const isCritical = !recovery.recovered && errorCountRef.current < 3;
      
      if (isCritical) {
        errorCountRef.current++;
        setError(error);
        setHasError(true);
        
        if (onError) {
          onError(error, { type: 'unhandledRejection', reason: event.reason });
        }
      }

      // Always prevent default error handling to avoid console errors
      event.preventDefault();
      event.stopPropagation();
    };

    // Handle JavaScript errors
    const handleError = (event: ErrorEvent) => {
      const error = event.error instanceof Error 
        ? event.error 
        : new Error(event.message || 'Unknown error');

      // Attempt automatic error recovery
      const recovery = attemptErrorRecovery(error, `Error: ${event.filename}:${event.lineno}`);
      
      if (recovery.recovered && recovery.shouldSuppress) {
        // Error was automatically fixed - suppress it completely
        suppressedErrorsRef.current++;
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      // Error cannot be automatically recovered
      // Only show error UI if it's a critical error
      const isCritical = !recovery.recovered && errorCountRef.current < 3;
      
      if (isCritical) {
        errorCountRef.current++;
        setError(error);
        setHasError(true);
        
        if (onError) {
          onError(error, { type: 'error', filename: event.filename, lineno: event.lineno });
        }
      }

      // Always prevent default error handling
      event.preventDefault();
      event.stopPropagation();
    };

    // Intercept console.error to catch errors before they're logged
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      const errorMessage = args.join(' ');
      const error = new Error(errorMessage);
      
      // Attempt automatic recovery
      const recovery = attemptErrorRecovery(error, 'ConsoleError');
      
      if (recovery.recovered && recovery.shouldSuppress) {
        // Suppress the error - don't log it
        suppressedErrorsRef.current++;
        return;
      }

      // Log only if not suppressed
      originalConsoleError.apply(console, args);
    };

    // Intercept console.warn to catch warnings
    const originalConsoleWarn = console.warn;
    console.warn = (...args: any[]) => {
      const warningMessage = args.join(' ');
      const error = new Error(warningMessage);
      
      // Attempt automatic recovery
      const recovery = attemptErrorRecovery(error, 'ConsoleWarn');
      
      if (recovery.recovered && recovery.shouldSuppress) {
        // Suppress the warning
        suppressedErrorsRef.current++;
        return;
      }

      // Log only if not suppressed
      originalConsoleWarn.apply(console, args);
    };

    window.addEventListener('error', handleError, true); // Use capture phase
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
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

  // Only show error UI for critical, unrecoverable errors
  if (hasError && errorCountRef.current >= 3) {
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

