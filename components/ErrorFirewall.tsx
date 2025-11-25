'use client';

import { useEffect, useState, ReactNode } from 'react';

interface ErrorFirewallProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

/**
 * Error Firewall Component
 * Catches and handles errors at the component level
 * Prevents errors from crashing the entire app
 */
export function ErrorFirewall({ children, fallback, onError }: ErrorFirewallProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      
      // Suppress known errors (handled by ErrorHandler)
      if (
        error.message?.includes('users') &&
        (error.message.includes('404') || 
         error.message.includes('PGRST205') ||
         error.message.includes('Could not find the table'))
      ) {
        event.preventDefault();
        return;
      }

      setError(error);
      setHasError(true);
      
      if (onError) {
        onError(error, { type: 'unhandledRejection', reason: event.reason });
      }

      // Prevent default error handling
      event.preventDefault();
    };

    // Handle JavaScript errors
    const handleError = (event: ErrorEvent) => {
      const error = event.error instanceof Error 
        ? event.error 
        : new Error(event.message || 'Unknown error');

      // Suppress known errors (handled by ErrorHandler)
      if (
        error.message?.includes('users') &&
        (error.message.includes('404') || 
         error.message.includes('PGRST205') ||
         error.message.includes('Could not find the table'))
      ) {
        event.preventDefault();
        return;
      }

      setError(error);
      setHasError(true);
      
      if (onError) {
        onError(error, { type: 'error', filename: event.filename, lineno: event.lineno });
      }

      // Prevent default error handling
      event.preventDefault();
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [onError]);

  const resetError = () => {
    setHasError(false);
    setError(null);
  };

  if (hasError) {
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

  return <>{children}</>;
}

