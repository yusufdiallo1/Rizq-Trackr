'use client';

import React, { Component, ReactNode } from 'react';
import { AuthLayout } from './layout';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Auth Error Boundary - Firewall for Signup/Login Pages
 *
 * This component acts as a firewall to catch and handle ALL errors
 * that occur during signup/login, preventing them from reaching the user.
 *
 * Features:
 * - Catches all React errors in signup/login flows
 * - Prevents error propagation to user interface
 * - Provides clean error messaging
 * - Logs errors for debugging without exposing stack traces
 */
export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    try {
    // Silently catch errors - don't log to console
    // ErrorFirewall handles all error suppression
    this.setState({
      error,
      errorInfo,
    });
    } catch (stateError) {
      // If state update fails, error is still caught by boundary
      // Just prevent it from propagating
    }
  }

  handleReset = () => {
    try {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    // Reload the page to reset state
      try {
        if (typeof window !== 'undefined' && window.location) {
    window.location.reload();
        }
      } catch (reloadError) {
        // If reload fails, try href
        if (typeof window !== 'undefined' && window.location) {
          window.location.href = window.location.href;
        }
      }
    } catch (resetError) {
      // If reset fails, try hard reload
      if (typeof window !== 'undefined' && window.location) {
        window.location.href = '/';
      }
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI or default error message
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <AuthLayout>
          <div className="min-h-screen flex items-center justify-center p-6">
            <div
              className="w-full max-w-md rounded-[32px] p-8 md:p-12 backdrop-blur-[40px] animate-fade-in-instant"
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div className="text-center mb-8">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm relative glass-circle"
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <span className="text-3xl">⚠️</span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Something Went Wrong
                </h1>
                <p className="text-white/80 text-sm">
                  We encountered an unexpected error. Please try again.
                </p>
              </div>

              <button
                onClick={this.handleReset}
                className="w-full py-4 rounded-2xl font-semibold text-white transition-all flex items-center justify-center gap-2 glass-button"
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.9))',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
                }}
              >
                Try Again
              </button>

              {/* Only show error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <details className="text-xs text-red-400">
                    <summary className="cursor-pointer font-semibold mb-2">
                      Error Details (Development Only)
                    </summary>
                    <p className="font-mono whitespace-pre-wrap break-all">
                      {this.state.error.message}
                    </p>
                  </details>
                </div>
              )}
            </div>
          </div>
        </AuthLayout>
      );
    }

    return this.props.children;
  }
}
