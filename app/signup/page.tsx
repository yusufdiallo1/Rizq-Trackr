'use client';

import { useState, FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp, validateEmail, checkPasswordStrength } from '@/lib/auth';
import { AuthLayout } from '@/components/layout';
import { countryCities, countryNames } from '@/lib/utils/countries';
import { BackToHomeButton } from '@/components/BackToHomeButton';

// Glass Input Component - moved outside to prevent re-creation on each render
const GlassInput = ({ 
  id, 
  type, 
  value, 
  onChange, 
  placeholder, 
  icon, 
  required = false, 
  showToggle = false, 
  isNameField = false, 
  autoComplete,
  onTogglePassword,
  showPassword 
}: any) => (
  <div className="relative">
    {/* Icon in Glass Circle */}
    <div
      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm z-10"
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      {icon}
    </div>
    <input
      id={id}
      type={type || 'text'}
      value={value}
      onChange={onChange}
      required={required}
      autoComplete={autoComplete}
      className={`w-full pl-14 ${showToggle ? 'pr-14' : 'pr-4'} py-4 rounded-2xl backdrop-blur-[10px] border transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-50 ${isNameField ? 'text-sm' : ''} text-white placeholder:text-white/50 glass-input`}
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: '#ffffff',
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.6)';
        e.currentTarget.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.3)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      placeholder={placeholder}
    />
    {showToggle && (
      <button
        type="button"
        onClick={onTogglePassword}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {showPassword ? (
          <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    )}
  </div>
);

export default function SignUpPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordStrength = password ? checkPasswordStrength(password) : null;

  const handleTogglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'strong': return '#10b981';
      default: return '#d1d5db';
    }
  };

  const getStrengthText = (strength: string) => {
    switch (strength) {
      case 'weak': return 'Weak';
      case 'medium': return 'Medium';
      case 'strong': return 'Strong';
      default: return '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(email, password, {
        firstName,
        lastName,
      });

      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      // After account creation (email confirmation disabled), redirect to PIN setup immediately
      // Users are auto-confirmed, so they can proceed to PIN setup right away
      router.push('/login/setup-pin');
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <div
          className="w-full rounded-[32px] p-12 lg:p-12 max-w-[450px] mx-auto backdrop-blur-[40px] animate-fade-in-instant text-center"
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm glass-circle"
            style={{
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)',
            }}
          >
            <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-heading font-bold text-white mb-4">Account Created!</h1>
          <p className="text-white/80 mb-2">Your account has been successfully created.</p>
          <p className="text-sm text-white/60 flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Setting up your account...
          </p>
        </div>
      </AuthLayout>
    );
  }


  return (
    <AuthLayout>
      <BackToHomeButton />
      {/* Glass Morphism Card */}
      <div
        className="w-full rounded-[32px] p-12 lg:p-12 max-w-[450px] mx-auto backdrop-blur-[40px] animate-fade-in-instant max-h-[90vh] overflow-y-auto"
        style={{
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div className="text-center mb-8">
          {/* Logo/Icon */}
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
          <h1 className="text-3xl font-heading font-bold text-white mb-2">Create Account</h1>
          <p className="text-white/80 text-sm">Join thousands tracking their finances</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error Message */}
          {error && (
            <div
              className="p-3 rounded-full text-red-400 text-sm flex items-center gap-2 animate-slide-down backdrop-blur-sm glass-input"
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

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <GlassInput
                  id="firstName"
                  value={firstName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
              placeholder="First Name"
                  required
              isNameField={true}
              icon={
                <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
              }
            />
            <GlassInput
                  id="lastName"
                  value={lastName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
              placeholder="Last Name"
                  required
              isNameField={true}
              icon={
                <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />
          </div>

          {/* Email */}
          <GlassInput
                id="email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="Enter your email"
                required
            icon={
              <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
            }
          />

          {/* Password */}
          <div>
            <GlassInput
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder="Create password (min 8 chars)"
              required
              showToggle
              autoComplete="new-password"
              showPassword={showPassword}
              onTogglePassword={handleTogglePassword}
              icon={
                <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />
            
            {/* Password Strength Meter - Dots */}
            {passwordStrength && (
              <div className="mt-3 space-y-2">
                <div className="flex gap-2 items-center">
                  {[1, 2, 3].map((dot) => {
                    const isActive = 
                      (dot === 1) || 
                      (dot === 2 && (passwordStrength === 'medium' || passwordStrength === 'strong')) ||
                      (dot === 3 && passwordStrength === 'strong');
                    // Use gold/green colors for active dots, subtle gold/green tint for inactive
                    const inactiveColor = passwordStrength === 'strong' 
                      ? 'rgba(16, 185, 129, 0.15)' // Subtle green tint
                      : passwordStrength === 'medium'
                      ? 'rgba(245, 158, 11, 0.15)' // Subtle gold tint
                      : 'rgba(239, 68, 68, 0.15)'; // Subtle red tint for weak
                    return (
                      <div
                        key={dot}
                        className="w-2 h-2 rounded-full transition-all duration-300"
                        style={{
                          background: isActive ? getStrengthColor(passwordStrength) : inactiveColor,
                          border: isActive ? 'none' : `1px solid ${inactiveColor}`,
                        }}
                      />
                    );
                  })}
                </div>
                <p
                  className="text-xs font-medium capitalize"
                  style={{ color: getStrengthColor(passwordStrength) }}
                >
                  {getStrengthText(passwordStrength)} password
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <GlassInput
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
                required
                autoComplete="new-password"
            showPassword={showPassword}
            onTogglePassword={handleTogglePassword}
            icon={
              <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
            }
          />
            {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-red-400 flex items-center gap-1 animate-slide-down">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Passwords do not match
              </p>
            )}

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 backdrop-blur-[20px] relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(6, 182, 212, 0.9))',
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
                <span>Creating Account...</span>
              </>
            ) : (
              'Create Account'
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div
              className="absolute inset-0 flex items-center"
              style={{
                borderTop: '1px solid rgba(0, 0, 0, 0.1)',
              }}
            >
              <div className="w-full" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-sm text-white/60 backdrop-blur-sm rounded-full" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                or
              </span>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-sm text-white/80">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-bold text-emerald-400 hover:text-emerald-300 transition-all hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
