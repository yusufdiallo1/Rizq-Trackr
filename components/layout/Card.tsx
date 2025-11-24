'use client';

import { ReactNode } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  elevated?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, elevated = false, onClick }: CardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // iOS-style card with glass morphism
  const baseClasses = 'rounded-2xl transition-all duration-300';
  const paddingClass = 'p-4 md:p-6';
  const shadowClass = elevated 
    ? 'shadow-2xl' 
    : 'shadow-lg';
  const hoverClass = hover 
    ? 'hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer' 
    : '';
  
  // Glass morphism styling
  const glassStyle = {
    background: isDark 
      ? 'rgba(42, 45, 61, 0.8)' 
      : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: isDark
      ? '1px solid rgba(255, 255, 255, 0.1)'
      : '1px solid rgba(0, 0, 0, 0.05)',
  };

  return (
    <div
      className={`${baseClasses} ${paddingClass} ${shadowClass} ${hoverClass} ${className}`}
      style={glassStyle}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {children}
    </div>
  );
}
