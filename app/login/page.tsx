'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, signIn } from '@/lib/auth';
import { isPasswordLocked, getPasswordLockoutRemainingSeconds, recordFailedPasswordAttempt, clearPasswordAttempts } from '@/lib/auth-lockout';
import { AuthLayout } from '@/components/layout';
import { BackToHomeButton } from '@/components/BackToHomeButton';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 1024);

    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          // Already logged in, redirect to dashboard
          router.push('/dashboard');
        }
      } catch (error) {
        // Not logged in, stay on login page
      }
    };

    checkUser();
  }, [router]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email');
      return;
    }

    // Check if password is locked
    if (isPasswordLocked()) {
      const remaining = getPasswordLockoutRemainingSeconds();
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      setError(`Account locked due to multiple failed login attempts. Please try again in ${minutes}:${seconds.toString().padStart(2, '0')}.`);
      return;
    }

    // On mobile/tablet, go to password page
    if (isMobile) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('loginEmail', email);
      }
      router.push('/login/password');
    }
  };

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Check if password is locked
    if (isPasswordLocked()) {
      const remaining = getPasswordLockoutRemainingSeconds();
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      setError(`Account locked due to multiple failed login attempts. Please try again in ${minutes}:${seconds.toString().padStart(2, '0')}.`);
      setLoading(false);
      return;
    }

    try {
      const result = await signIn(email, password);
      if (result.error) {
        // Record failed attempt
        const lockoutResult = recordFailedPasswordAttempt(email);

        if (lockoutResult.locked) {
          const minutes = Math.floor((lockoutResult.remainingSeconds || 0) / 60);
          const seconds = (lockoutResult.remainingSeconds || 0) % 60;
          setError(`Too many failed attempts. Account locked for ${minutes}:${seconds.toString().padStart(2, '0')}.`);
        } else {
          setError(`${result.error}. ${lockoutResult.attemptsRemaining} attempt${lockoutResult.attemptsRemaining !== 1 ? 's' : ''} remaining.`);
        }
        setLoading(false);
        return;
      }

      // Successful login - clear password attempts and go to dashboard
      clearPasswordAttempts();
      router.push('/dashboard');
      // NO router.refresh() - no auto-refresh!
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <AuthLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      </AuthLayout>
    );
  }

  // Mobile/Tablet: Show email-only form
  if (isMobile) {
    return (
      <AuthLayout>
        <BackToHomeButton />
        <div
          className="w-full rounded-[32px] p-8 md:p-12 backdrop-blur-[40px] animate-fade-in-instant"
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
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
              }}
            >
              <span className="text-3xl text-emerald-400">🕌</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-white/80 text-sm">Enter your email to continue</p>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-5">
            {error && (
              <div
                className="p-3 rounded-2xl text-red-400 text-sm flex items-center gap-2 animate-slide-down glass-input"
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

            <div className="relative">
              <div
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full items-center justify-center backdrop-blur-sm z-10 glass-circle hidden md:flex"
              >
                <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-4 md:pl-14 pr-4 py-4 rounded-2xl glass-input text-white placeholder:text-white/50"
                placeholder="Email Address"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-4 rounded-2xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 glass-button"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(6, 182, 212, 0.9))',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
              }}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                'Continue'
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-white/80">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </AuthLayout>
    );
  }

  // Desktop: Show full email/password form
  return (
    <AuthLayout>
      <BackToHomeButton />
      <div
        className="w-full rounded-[32px] p-8 md:p-12 backdrop-blur-[40px] animate-fade-in-instant"
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
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
            }}
          >
            <span className="text-3xl text-emerald-400">🕌</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-white/80 text-sm">Sign in to continue</p>
        </div>

        <form onSubmit={handleEmailPasswordSubmit} className="space-y-5">
          {error && (
            <div
              className="p-3 rounded-2xl text-red-400 text-sm flex items-center gap-2 animate-slide-down glass-input"
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

          <div className="relative">
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full items-center justify-center backdrop-blur-sm z-10 glass-circle hidden md:flex"
            >
              <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-4 md:pl-14 pr-4 py-4 rounded-2xl glass-input text-white placeholder:text-white/50"
              placeholder="Email Address"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            />
          </div>

          <div className="relative">
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full items-center justify-center backdrop-blur-sm z-10 glass-circle hidden md:flex"
            >
              <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-4 md:pl-14 pr-12 py-4 rounded-2xl glass-input text-white placeholder:text-white/50"
              placeholder="Password"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              {showPassword ? (
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-white/80 hover:text-white transition-colors underline"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 glass-button"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(6, 182, 212, 0.9))',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
            }}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-white/80">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
