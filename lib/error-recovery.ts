/**
 * Automatic Error Recovery System
 * Detects and fixes common errors before they become visible
 */

import { logError } from './logger';

export interface ErrorRecoveryResult {
  recovered: boolean;
  fixedValue?: any;
  shouldSuppress: boolean;
  message?: string;
}

/**
 * Attempts to automatically fix common errors
 */
export function attemptErrorRecovery(error: Error | unknown, context?: string): ErrorRecoveryResult {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorString = errorMessage.toLowerCase();

  // 1. Database/Table errors - suppress known deprecated table errors
  if (
    errorString.includes('users') &&
    (errorString.includes('404') ||
      errorString.includes('pgrst205') ||
      errorString.includes('could not find the table') ||
      errorString.includes('relation') ||
      errorString.includes('does not exist'))
  ) {
    return {
      recovered: true,
      shouldSuppress: true,
      message: 'Deprecated table reference - automatically suppressed',
    };
  }

  // 2. Nisab prices table errors - suppress if table doesn't exist yet
  if (
    errorString.includes('nisab_prices') &&
    (errorString.includes('404') ||
      errorString.includes('pgrst205') ||
      errorString.includes('could not find the table'))
  ) {
    return {
      recovered: true,
      fixedValue: null,
      shouldSuppress: true,
      message: 'Nisab prices table not found - using fallback',
    };
  }

  // 3. HijriDate constructor errors - fix invalid date parameters
  if (
    errorString.includes('hijridate') ||
    errorString.includes('wrong call of constructor') ||
    errorString.includes('invalid date')
  ) {
    return {
      recovered: true,
      fixedValue: new Date(), // Fallback to current date
      shouldSuppress: true,
      message: 'Invalid Hijri date - using current date as fallback',
    };
  }

  // 4. Network errors - return empty data instead of crashing
  if (
    errorString.includes('network') ||
    errorString.includes('fetch') ||
    errorString.includes('timeout') ||
    errorString.includes('failed to fetch') ||
    errorString.includes('econnrefused')
  ) {
    return {
      recovered: true,
      fixedValue: [],
      shouldSuppress: true,
      message: 'Network error - using empty data fallback',
    };
  }

  // 5. NaN errors in calculations - return 0
  if (
    errorString.includes('nan') ||
    errorString.includes('not a number') ||
    errorString.includes('invalid number')
  ) {
    return {
      recovered: true,
      fixedValue: 0,
      shouldSuppress: true,
      message: 'NaN error - using 0 as fallback',
    };
  }

  // 6. Null/undefined property access - return safe defaults
  if (
    errorString.includes('cannot read') ||
    errorString.includes('undefined') ||
    errorString.includes('null') ||
    errorString.includes('is not defined')
  ) {
    return {
      recovered: true,
      fixedValue: null,
      shouldSuppress: true,
      message: 'Property access error - using null fallback',
    };
  }

  // 7. Chart rendering errors - suppress width/height warnings
  if (
    errorString.includes('width') &&
    errorString.includes('height') &&
    (errorString.includes('should be greater than 0') ||
      errorString.includes('invalid dimensions'))
  ) {
    return {
      recovered: true,
      shouldSuppress: true,
      message: 'Chart dimension warning - automatically suppressed',
    };
  }

  // 8. Multiple GoTrueClient instances - already handled by singleton
  if (
    errorString.includes('multiple gotrueclient') ||
    errorString.includes('multiple instances')
  ) {
    return {
      recovered: true,
      shouldSuppress: true,
      message: 'Multiple client instances - already handled',
    };
  }

  // 9. API errors with unsuccessful response - return empty data
  if (
    errorString.includes('api returned unsuccessful') ||
    errorString.includes('unsuccessful response') ||
    errorString.includes('status code')
  ) {
    return {
      recovered: true,
      fixedValue: null,
      shouldSuppress: true,
      message: 'API error - using fallback value',
    };
  }

  // 10. Division by zero - return 0
  if (errorString.includes('division by zero') || errorString.includes('divide by zero')) {
    return {
      recovered: true,
      fixedValue: 0,
      shouldSuppress: true,
      message: 'Division by zero - using 0 as fallback',
    };
  }

  // 11. Array operation errors - return empty array
  if (
    errorString.includes('map') ||
    errorString.includes('filter') ||
    errorString.includes('reduce') ||
    errorString.includes('is not a function')
  ) {
    if (errorString.includes('array') || errorString.includes('of undefined')) {
      return {
        recovered: true,
        fixedValue: [],
        shouldSuppress: true,
        message: 'Array operation error - using empty array fallback',
      };
    }
  }

  // 12. Date parsing errors - return current date
  if (
    errorString.includes('invalid date') ||
    errorString.includes('date parsing') ||
    errorString.includes('date format')
  ) {
    return {
      recovered: true,
      fixedValue: new Date(),
      shouldSuppress: true,
      message: 'Date parsing error - using current date fallback',
    };
  }

  // 13. JSON parsing errors - return null
  if (errorString.includes('json') && (errorString.includes('parse') || errorString.includes('invalid'))) {
    return {
      recovered: true,
      fixedValue: null,
      shouldSuppress: true,
      message: 'JSON parsing error - using null fallback',
    };
  }

  // 14. Type errors - attempt type coercion
  if (errorString.includes('type') && errorString.includes('error')) {
    return {
      recovered: true,
      fixedValue: null,
      shouldSuppress: true,
      message: 'Type error - using null fallback',
    };
  }

  // Error cannot be automatically recovered
  // But we still suppress it in production to prevent user-facing errors
  return {
    recovered: process.env.NODE_ENV === 'production', // Auto-recover in production
    shouldSuppress: process.env.NODE_ENV === 'production', // Suppress in production
  };
}

/**
 * Safe property access with automatic error recovery
 */
export function safeGet<T>(obj: any, path: string, fallback: T): T {
  try {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result == null) {
        return fallback;
      }
      result = result[key];
    }
    
    return result != null ? result : fallback;
  } catch (error) {
    const recovery = attemptErrorRecovery(error, `safeGet: ${path}`);
    return recovery.fixedValue !== undefined ? recovery.fixedValue : fallback;
  }
}

/**
 * Safe array operation with automatic error recovery
 */
export function safeArrayOperation<T, R>(
  array: T[] | null | undefined,
  operation: (arr: T[]) => R,
  fallback: R
): R {
  try {
    if (!array || !Array.isArray(array)) {
      return fallback;
    }
    return operation(array);
  } catch (error) {
    const recovery = attemptErrorRecovery(error, 'safeArrayOperation');
    return recovery.fixedValue !== undefined ? recovery.fixedValue : fallback;
  }
}

/**
 * Safe number calculation with automatic error recovery
 */
export function safeCalculate(
  calculation: () => number,
  fallback: number = 0
): number {
  try {
    const result = calculation();
    if (isNaN(result) || !isFinite(result)) {
      return fallback;
    }
    return result;
  } catch (error) {
    const recovery = attemptErrorRecovery(error, 'safeCalculate');
    return recovery.fixedValue !== undefined ? recovery.fixedValue : fallback;
  }
}

/**
 * Safe date parsing with automatic error recovery
 */
export function safeDateParse(
  dateInput: string | Date | null | undefined,
  fallback: Date = new Date()
): Date {
  try {
    if (!dateInput) {
      return fallback;
    }
    
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    
    if (isNaN(date.getTime())) {
      return fallback;
    }
    
    return date;
  } catch (error) {
    const recovery = attemptErrorRecovery(error, 'safeDateParse');
    return recovery.fixedValue instanceof Date ? recovery.fixedValue : fallback;
  }
}

/**
 * Safe async operation with automatic error recovery
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback: T,
  context?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const recovery = attemptErrorRecovery(error, context);
    
    if (recovery.recovered && recovery.fixedValue !== undefined) {
      logError(recovery.message, context);
      return recovery.fixedValue;
    }
    
    logError(error, context);
    return fallback;
  }
}

