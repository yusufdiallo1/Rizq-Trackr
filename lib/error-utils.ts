/**
 * Error Utilities
 * Centralized error handling and validation functions
 */

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

/**
 * Safely execute an async function with error handling
 */
export async function safeExecute<T>(
  fn: () => Promise<T>,
  fallback?: T,
  onError?: (error: Error) => void
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error('Safe execute error:', err);
    
    if (onError) {
      onError(err);
    }
    
    return fallback;
  }
}

/**
 * Validate user input and throw formatted errors
 */
export function validateInput(value: any, fieldName: string, rules: {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}): void {
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    throw new Error(`${fieldName} is required`);
  }

  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      throw new Error(`${fieldName} must be at least ${rules.minLength} characters`);
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
      throw new Error(`${fieldName} must be no more than ${rules.maxLength} characters`);
    }
    
    if (rules.pattern && !rules.pattern.test(value)) {
      throw new Error(`${fieldName} format is invalid`);
    }
  }

  if (rules.custom) {
    const result = rules.custom(value);
    if (result !== true) {
      throw new Error(typeof result === 'string' ? result : `${fieldName} is invalid`);
    }
  }
}

/**
 * Format error message for user display
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.message.includes('timeout') ||
      error.message.includes('ECONNREFUSED')
    );
  }
  return false;
}

/**
 * Check if error is a Supabase/PostgreSQL error
 */
export function isDatabaseError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('PGRST') ||
      error.message.includes('PostgreSQL') ||
      error.message.includes('relation') ||
      error.message.includes('table') ||
      error.message.includes('column')
    );
  }
  return false;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

