'use client';

import { useEffect } from 'react';
import { attemptErrorRecovery } from '@/lib/error-recovery';
import { logError } from '@/lib/logger';

/**
 * Global Error Handler Component
 * First line of defense - intercepts errors before they reach ErrorFirewall
 * Uses automatic error recovery to fix errors silently
 */
export function ErrorHandler() {
  useEffect(() => {
    // Intercept console.error with automatic recovery
    const originalError = console.error;
    console.error = (...args: any[]) => {
      const message = args.join(' ');
      const error = new Error(message);
      
      // Attempt automatic error recovery
      const recovery = attemptErrorRecovery(error, 'ConsoleError');
      
      if (recovery.recovered && recovery.shouldSuppress) {
        // Error was automatically fixed - suppress it completely
        logError(recovery.message, 'ErrorHandler');
        return; // Don't log the error
      }

      // Only log errors that couldn't be automatically recovered
      if (!recovery.shouldSuppress) {
        originalError.apply(console, args);
      }
    };

    // Intercept console.warn with automatic recovery
    const originalWarn = console.warn;
    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      const error = new Error(message);
      
      // Attempt automatic error recovery
      const recovery = attemptErrorRecovery(error, 'ConsoleWarn');
      
      if (recovery.recovered && recovery.shouldSuppress) {
        // Warning was automatically handled - suppress it
        return; // Don't log the warning
      }

      // Only log warnings that couldn't be automatically recovered
      if (!recovery.shouldSuppress) {
        originalWarn.apply(console, args);
      }
    };

    // Handle unhandled promise rejections with automatic recovery
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      
      // Attempt automatic error recovery
      const recovery = attemptErrorRecovery(error, 'UnhandledRejection');
      
      if (recovery.recovered && recovery.shouldSuppress) {
        // Error was automatically fixed - suppress it completely
        event.preventDefault();
        event.stopPropagation();
        logError(recovery.message, 'ErrorHandler');
        return;
      }

      // For non-recoverable errors, let ErrorFirewall handle them
      // But still prevent default console logging
      if (recovery.shouldSuppress) {
        event.preventDefault();
      }
    };

    // Handle JavaScript errors with automatic recovery
    const handleError = (event: ErrorEvent) => {
      const error = event.error instanceof Error 
        ? event.error 
        : new Error(event.message || 'Unknown error');
      
      // Attempt automatic error recovery
      const recovery = attemptErrorRecovery(error, `Error: ${event.filename}:${event.lineno}`);
      
      if (recovery.recovered && recovery.shouldSuppress) {
        // Error was automatically fixed - suppress it completely
        event.preventDefault();
        event.stopPropagation();
        logError(recovery.message, 'ErrorHandler');
        return;
      }

      // For non-recoverable errors, let ErrorFirewall handle them
      if (recovery.shouldSuppress) {
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError, true); // Use capture phase
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null; // This component doesn't render anything
}

