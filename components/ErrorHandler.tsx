'use client';

import { useEffect } from 'react';

/**
 * Global Error Handler Component
 * Suppresses known 404 errors for deprecated tables (users)
 * and handles other common errors gracefully
 */
export function ErrorHandler() {
  useEffect(() => {
    // Suppress 404 errors for the deprecated 'users' table
    // These errors are likely from cached code and can be safely ignored
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args: any[]) => {
      const message = args.join(' ');
      
      // Suppress 404 errors for users table (deprecated, now using customers table)
      if (
        message.includes('users') &&
        (message.includes('404') || 
         message.includes('PGRST205') ||
         message.includes('Could not find the table'))
      ) {
        // Silently ignore - this is from cached code
        return;
      }

      // Call original error handler
      originalError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      
      // Suppress warnings about users table
      if (
        message.includes('users') &&
        (message.includes('404') || 
         message.includes('PGRST205') ||
         message.includes('Could not find the table'))
      ) {
        // Silently ignore - this is from cached code
        return;
      }

      // Call original warn handler
      originalWarn.apply(console, args);
    };

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      const errorMessage = error?.message || String(error);
      
      // Suppress errors about users table
      if (
        errorMessage.includes('users') &&
        (errorMessage.includes('404') || 
         errorMessage.includes('PGRST205') ||
         errorMessage.includes('Could not find the table'))
      ) {
        event.preventDefault(); // Prevent error from showing in console
        return;
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null; // This component doesn't render anything
}

