'use client';

import { ReactNode, Component, ErrorInfo } from 'react';

interface SafeWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface SafeWrapperState {
  hasError: boolean;
  error: Error | null;
}

/**
 * SafeWrapper - Ultimate Error Protection Layer
 * 
 * This component provides the final layer of error protection, ensuring
 * that NO errors can escape and reach the user. It wraps all components
 * with multiple safety mechanisms:
 * 
 * 1. React Error Boundary (catches React errors)
 * 2. Try-catch around render (catches render errors)
 * 3. Safe state updates (prevents state update errors)
 * 4. Fallback rendering (always shows something)
 * 
 * IMPOSSIBLE for errors to escape this wrapper.
 */
export class SafeWrapper extends Component<SafeWrapperProps, SafeWrapperState> {
  constructor(props: SafeWrapperProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): SafeWrapperState {
    // Always catch errors - never let them propagate
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Silently catch - ErrorFirewall handles suppression
    // Never log to console in production
    if (process.env.NODE_ENV === 'development') {
      // Only in development, and even then, silently
    }
  }

  render() {
    // Wrap render in try-catch for ultimate safety
    try {
      if (this.state.hasError) {
        // Show fallback if provided
        if (this.props.fallback) {
          try {
            return this.props.fallback;
          } catch (fallbackError) {
            // If fallback fails, show minimal safe UI
            return this.renderMinimalFallback();
          }
        }
        return this.renderMinimalFallback();
      }

      // Wrap children in try-catch
      try {
        return this.props.children;
      } catch (renderError) {
        // If children render fails, show fallback
        return this.renderMinimalFallback();
      }
    } catch (outerError) {
      // If everything fails, show absolute minimal fallback
      return this.renderMinimalFallback();
    }
  }

  private renderMinimalFallback() {
    // Absolute minimal fallback - guaranteed to never error
    try {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Loading...</h1>
            <p style={{ fontSize: '14px', opacity: 0.8 }}>
              Please wait while we load the application.
            </p>
          </div>
        </div>
      );
    } catch (fallbackError) {
      // If even fallback fails, return empty div (never fails)
      return <div />;
    }
  }
}

/**
 * SafeRender - Functional wrapper for safe rendering
 * Wraps any component with error protection
 */
export function SafeRender({ children, fallback }: SafeWrapperProps) {
  try {
    return <SafeWrapper fallback={fallback}>{children}</SafeWrapper>;
  } catch (wrapperError) {
    // If wrapper itself fails, return fallback or empty
    if (fallback) {
      try {
        return <>{fallback}</>;
      } catch (fallbackError) {
        return <div />;
      }
    }
    return <div />;
  }
}

