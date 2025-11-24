'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { resetPassword, validateEmail } from '@/lib/auth';
import { AuthLayout } from '@/components/layout';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(email);

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout>
        {/* Glass Morphism Card - Success State */}
        <div
          className="w-full rounded-[32px] p-12 lg:p-12 max-w-[450px] mx-auto backdrop-blur-[40px] animate-fade-in-instant"
          style={{
            background: 'rgba(255, 255, 255, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          }}
        >
          <div className="text-center mb-8">
            {/* Checkmark Icon in Glass Circle */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm relative"
              style={{
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)',
              }}
            >
              <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-heading font-bold text-slate-800 mb-2">Check Your Email!</h1>
            <p className="text-slate-600 text-sm mb-6">We&apos;ve sent a password reset link to:</p>
            
            {/* Success Card */}
            <div
              className="p-4 rounded-2xl backdrop-blur-sm mb-6 text-left"
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <p className="font-mono font-semibold text-emerald-700 text-sm">{email}</p>
              <p className="text-xs text-slate-600 mt-2 opacity-80">
                Please check your email and follow the instructions to reset your password.
              </p>
            </div>
          </div>

          {/* Back to Sign In Link */}
          <Link
            href="/login"
            className="block w-full text-center py-4 rounded-2xl font-semibold text-white transition-all backdrop-blur-[20px] relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.9), rgba(217, 119, 6, 0.9))',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(245, 158, 11, 0.4)';
              e.currentTarget.style.filter = 'brightness(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(245, 158, 11, 0.3)';
              e.currentTarget.style.filter = 'brightness(1)';
            }}
          >
            Back to Sign In
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      {/* Glass Morphism Card */}
      <div
        className="w-full rounded-[32px] p-12 lg:p-12 max-w-[450px] mx-auto backdrop-blur-[40px] animate-fade-in-instant"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div className="text-center mb-8">
          {/* Logo/Icon */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm relative"
            style={{
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
            }}
          >
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-heading font-bold text-slate-800 mb-2">Reset Password</h1>
          <p className="text-slate-600 text-sm">Enter your email to receive reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error Message */}
          {error && (
            <div
              className="p-3 rounded-full text-red-700 text-sm flex items-center gap-2 animate-slide-down backdrop-blur-sm"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Email Input */}
          <div>
            <div className="relative">
              {/* Icon in Glass Circle */}
              <div
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm z-10"
                style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                }}
              >
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-14 pr-4 py-4 rounded-2xl backdrop-blur-[10px] border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50 text-slate-800 placeholder:text-slate-500"
                style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#1e293b',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.6)';
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Send Reset Link Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 backdrop-blur-[20px] relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(20, 184, 166, 0.9))',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(16, 185, 129, 0.4)';
                e.currentTarget.style.filter = 'brightness(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(16, 185, 129, 0.3)';
              e.currentTarget.style.filter = 'brightness(1)';
            }}
            onClick={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(0.98)';
                setTimeout(() => {
                  e.currentTarget.style.transform = 'scale(1)';
                }, 100);
              }
            }}
          >
            {loading ? (
              <>
                <div
                  className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"
                />
                <span>Sending...</span>
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>

          {/* Back to Sign In Link */}
          <div className="text-center">
            <Link
              href="/login"
              className="text-sm font-medium transition-all hover:underline inline-flex items-center gap-1"
              style={{ color: '#f59e0b' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
