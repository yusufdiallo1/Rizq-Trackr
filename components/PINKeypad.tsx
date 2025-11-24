'use client';

import { useEffect } from 'react';

interface PINKeypadProps {
  onNumberClick: (number: string) => void;
  onBackspace: () => void;
  onBiometricClick?: () => void;
  disabled?: boolean;
  showBiometric?: boolean;
}

export function PINKeypad({ 
  onNumberClick, 
  onBackspace, 
  onBiometricClick,
  disabled = false,
  showBiometric = false,
}: PINKeypadProps) {
  // Handle keyboard input
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        onNumberClick(e.key);
      } else if (e.key === 'Backspace') {
        onBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, onNumberClick, onBackspace]);

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  const NumberButton = ({ value }: { value: string }) => (
    <button
      type="button"
      onClick={() => !disabled && onNumberClick(value)}
      disabled={disabled}
      className="w-[68px] h-[68px] tablet:w-[82px] tablet:h-[82px] rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed glass-button mobile-tap-target"
      style={{
        background: disabled 
          ? 'rgba(255, 255, 255, 0.05)' 
          : 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: '#ffffff',
        fontSize: '2rem',
        fontWeight: 'bold',
        minWidth: '68px',
        minHeight: '68px',
      }}
      data-tablet-font-size="2.5rem"
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
          e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.3)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {value}
    </button>
  );

  const SpecialButton = ({ 
    children, 
    onClick, 
    className = '',
  }: { 
    children: React.ReactNode; 
    onClick: () => void;
    className?: string;
  }) => (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!disabled && onClick) {
          onClick();
        }
      }}
      disabled={disabled}
      className={`w-[68px] h-[68px] tablet:w-[82px] tablet:h-[82px] rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed glass-button mobile-tap-target ${className}`}
      style={{
        background: disabled 
          ? 'rgba(255, 255, 255, 0.05)' 
          : 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: '#ffffff',
        pointerEvents: disabled ? 'none' : 'auto',
        cursor: disabled ? 'not-allowed' : 'pointer',
        minWidth: '68px',
        minHeight: '68px',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
          e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.3)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col items-center justify-center gap-3 mt-12 max-w-md mx-auto tablet:max-w-lg">
      {/* Top row: 1, 2, 3 */}
      <div className="flex gap-3">
        {numbers.slice(0, 3).map((num) => (
          <NumberButton key={num} value={num} />
        ))}
      </div>

      {/* Middle row: 4, 5, 6 */}
      <div className="flex gap-3">
        {numbers.slice(3, 6).map((num) => (
          <NumberButton key={num} value={num} />
        ))}
      </div>

      {/* Bottom row: 7, 8, 9 */}
      <div className="flex gap-3">
        {numbers.slice(6, 9).map((num) => (
          <NumberButton key={num} value={num} />
        ))}
      </div>

      {/* Bottom row: Biometric/Face ID, 0, Backspace */}
      <div className="flex gap-3">
        {/* Face ID Button - Always visible on left of 0 */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (onBiometricClick && showBiometric && !disabled) {
              onBiometricClick();
            }
          }}
          disabled={disabled || !showBiometric}
          className={`w-[68px] h-[68px] tablet:w-[82px] tablet:h-[82px] rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed glass-button mobile-tap-target ${!showBiometric ? 'opacity-50' : ''}`}
          style={{
            background: (disabled || !showBiometric)
              ? 'rgba(255, 255, 255, 0.05)' 
              : 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            pointerEvents: 'auto',
            cursor: (disabled || !showBiometric) ? 'not-allowed' : 'pointer',
            minWidth: '68px',
            minHeight: '68px',
          }}
          onMouseEnter={(e) => {
            if (!disabled && showBiometric) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled && showBiometric) {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          <svg 
            className="w-8 h-8" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Square frame with four L-shaped brackets at corners pointing inward */}
            {/* Top-left L-bracket - horizontal then vertical */}
            <path d="M6 6h5M6 6v5"/>
            {/* Top-right L-bracket - horizontal then vertical */}
            <path d="M18 6h-5M18 6v5"/>
            {/* Bottom-left L-bracket - horizontal then vertical */}
            <path d="M6 18h5M6 18v-5"/>
            {/* Bottom-right L-bracket - horizontal then vertical */}
            <path d="M18 18h-5M18 18v-5"/>
            
            {/* Face inside the square - two small dots for eyes and upward-curving line for mouth */}
            <circle cx="9.5" cy="9.5" r="0.6" fill="currentColor"/>
            <circle cx="14.5" cy="9.5" r="0.6" fill="currentColor"/>
            <path d="M9.5 13.5c0 0.3 0.6 0.6 2.5 0.6s2.5-0.3 2.5-0.6" strokeLinecap="round" strokeWidth={1.8}/>
          </svg>
        </button>

        {/* Zero Button */}
        <NumberButton value="0" />

        {/* Backspace Button */}
        <SpecialButton onClick={onBackspace}>
          <svg 
            className="w-8 h-8" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" 
            />
          </svg>
        </SpecialButton>
      </div>
    </div>
  );
}

