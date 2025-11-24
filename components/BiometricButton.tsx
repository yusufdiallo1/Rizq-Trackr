'use client';

import { useState } from 'react';

interface BiometricButtonProps {
  onAuthenticate: () => Promise<void>;
  disabled?: boolean;
  variant?: 'button' | 'icon';
}

export function BiometricButton({ 
  onAuthenticate, 
  disabled = false,
  variant = 'button',
}: BiometricButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = async () => {
    if (disabled || isAnimating) return;

    setIsAnimating(true);
    try {
      await onAuthenticate();
    } finally {
      setTimeout(() => setIsAnimating(false), 2000);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isAnimating}
        className="relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed glass-circle"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Face ID Icon */}
        <svg 
          className={`w-8 h-8 text-white transition-all ${isAnimating ? 'animate-face-id-pulse' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
          />
        </svg>

        {/* Animated Rings */}
        {isAnimating && (
          <>
            <div 
              className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-face-id-rings"
              style={{
                animationDelay: '0s',
              }}
            />
            <div 
              className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-face-id-rings"
              style={{
                animationDelay: '0.5s',
              }}
            />
            <div 
              className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-face-id-rings"
              style={{
                animationDelay: '1s',
              }}
            />
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isAnimating}
      className="relative w-full py-4 rounded-2xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 glass-button"
      style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9) 0%, rgba(6, 182, 212, 0.9) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isAnimating) {
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(16, 185, 129, 0.4)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(16, 185, 129, 0.3)';
      }}
    >
      {isAnimating ? (
        <>
          <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          <span>Authenticating...</span>
        </>
      ) : (
        <>
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
            />
          </svg>
          <span>Enable Face ID</span>
        </>
      )}
    </button>
  );
}

