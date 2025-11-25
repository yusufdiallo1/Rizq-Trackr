/**
 * Production-Safe Logger
 * Only logs errors in development mode
 * Silent in production to prevent console errors
 */

const isDev = process.env.NODE_ENV === 'development';

export const logError = (error: any, context?: string) => {
  if (isDev) {
    const message = context ? `${context}: ${error}` : error;
    console.error(message);
  }
  // In production: silently handle
  // Could integrate with error tracking service (Sentry, etc.) here
};

export const logWarn = (message: string, context?: string) => {
  if (isDev) {
    const fullMessage = context ? `${context}: ${message}` : message;
    console.warn(fullMessage);
  }
  // Silent in production
};

export const logInfo = (message: string, context?: string) => {
  if (isDev) {
    const fullMessage = context ? `${context}: ${message}` : message;
    console.log(fullMessage);
  }
  // Silent in production
};

