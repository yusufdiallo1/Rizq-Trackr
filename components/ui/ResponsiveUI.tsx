'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/contexts/ThemeContext';
import Link from 'next/link';

// ============================================
// FINANCE TRACKER RESPONSIVE UI COMPONENTS
// Matching desktop design across all devices
// ============================================

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'income' | 'expense' | 'gold' | 'teal';
  hover?: boolean;
  onClick?: () => void;
  padding?: 'sm' | 'md' | 'lg';
}

/**
 * Glass Card Component
 * Dark glass background with subtle borders - matches desktop design
 */
export function GlassCard({
  children,
  className = '',
  variant = 'default',
  hover = true,
  onClick,
  padding = 'md',
}: GlassCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const variantStyles = {
    default: {
      background: isDark ? 'rgba(42, 45, 61, 0.9)' : 'rgba(255, 255, 255, 0.95)',
      border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
    },
    income: {
      background: isDark
        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)'
        : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.02) 100%)',
      border: '1px solid rgba(16, 185, 129, 0.3)',
    },
    expense: {
      background: isDark
        ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)'
        : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.02) 100%)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
    },
    gold: {
      background: isDark
        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)'
        : 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.02) 100%)',
      border: '1px solid rgba(245, 158, 11, 0.3)',
    },
    teal: {
      background: isDark
        ? 'linear-gradient(135deg, rgba(8, 145, 178, 0.15) 0%, rgba(8, 145, 178, 0.05) 100%)'
        : 'linear-gradient(135deg, rgba(8, 145, 178, 0.1) 0%, rgba(8, 145, 178, 0.02) 100%)',
      border: '1px solid rgba(8, 145, 178, 0.3)',
    },
  };

  const paddingStyles = {
    sm: 'p-3 tablet:p-4',
    md: 'p-4 tablet:p-5 lg:p-6',
    lg: 'p-5 tablet:p-6 lg:p-8',
  };

  const style = variantStyles[variant];

  return (
    <div
      className={`
        rounded-mobile-card tablet:rounded-tablet-card lg:rounded-glass
        ${paddingStyles[padding]}
        backdrop-blur-xl
        transition-all duration-300
        ${hover ? 'hover:translate-y-[-2px] hover:shadow-glass-hover cursor-pointer' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        background: style.background,
        border: style.border,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  trend?: number;
  icon: ReactNode;
  variant: 'income' | 'expense' | 'balance' | 'zakat';
  href?: string;
  onClick?: () => void;
}

/**
 * Metric Card Component
 * Used for dashboard metrics - income, expenses, balance, zakat
 */
export function MetricCard({
  label,
  value,
  trend,
  icon,
  variant,
  href,
  onClick,
}: MetricCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const variantColors = {
    income: { accent: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
    expense: { accent: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' },
    balance: { accent: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },
    zakat: { accent: '#0891b2', glow: 'rgba(8, 145, 178, 0.4)' },
  };

  const colors = variantColors[variant];

  const content = (
    <motion.div
      className="relative rounded-mobile-card tablet:rounded-tablet-card lg:rounded-glass p-4 tablet:p-5 lg:p-6 backdrop-blur-xl transition-all duration-300 overflow-hidden group"
      style={{
        background: isDark ? 'rgba(42, 45, 61, 0.9)' : 'rgba(255, 255, 255, 0.95)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
      }}
      whileHover={{
        y: -4,
        boxShadow: `0 20px 50px ${colors.glow}`,
        borderColor: `${colors.accent}50`,
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Accent line at top */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: colors.accent }}
      />

      {/* Header with icon and trend */}
      <div className="flex items-center justify-between mb-3 tablet:mb-4">
        <div
          className="w-10 h-10 tablet:w-12 tablet:h-12 rounded-full flex items-center justify-center"
          style={{ background: `${colors.accent}20` }}
        >
          {icon}
        </div>
        {trend !== undefined && (
          <div
            className="text-xs font-medium px-2 py-1 rounded-full"
            style={{
              background: trend >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              color: trend >= 0 ? '#10b981' : '#ef4444',
            }}
          >
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>

      {/* Label */}
      <p
        className={`text-xs tablet:text-sm font-medium uppercase tracking-wide mb-1 tablet:mb-2 ${
          isDark ? 'text-white/70' : 'text-gray-600'
        }`}
      >
        {label}
      </p>

      {/* Value */}
      <p
        className="text-xl tablet:text-2xl lg:text-3xl font-bold font-mono"
        style={{ color: colors.accent }}
      >
        {value}
      </p>
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return onClick ? <div onClick={onClick}>{content}</div> : content;
}

interface QuickActionProps {
  label: string;
  description?: string;
  icon: ReactNode;
  variant: 'income' | 'expense' | 'zakat';
  href?: string;
  onClick?: () => void;
}

/**
 * Quick Action Button
 * Used for dashboard quick actions
 */
export function QuickAction({
  label,
  description,
  icon,
  variant,
  href,
  onClick,
}: QuickActionProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const variantStyles = {
    income: {
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      bgHover: 'rgba(16, 185, 129, 0.25)',
      bg: 'rgba(16, 185, 129, 0.15)',
      border: 'rgba(16, 185, 129, 0.3)',
      iconBg: 'rgba(16, 185, 129, 0.3)',
    },
    expense: {
      gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      bgHover: 'rgba(239, 68, 68, 0.25)',
      bg: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.3)',
      iconBg: 'rgba(239, 68, 68, 0.3)',
    },
    zakat: {
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      bgHover: 'rgba(245, 158, 11, 0.25)',
      bg: 'rgba(245, 158, 11, 0.15)',
      border: 'rgba(245, 158, 11, 0.3)',
      iconBg: 'rgba(245, 158, 11, 0.3)',
    },
  };

  const styles = variantStyles[variant];

  const content = (
    <motion.div
      className="group flex items-center gap-3 p-3 tablet:p-4 rounded-xl tablet:rounded-2xl transition-all duration-300 backdrop-blur-sm min-h-[48px] tablet:min-h-[56px]"
      style={{
        background: styles.bg,
        border: `1px solid ${styles.border}`,
      }}
      whileHover={{
        background: styles.bgHover,
        y: -2,
      }}
      whileTap={{ scale: 0.95 }}
    >
      <div
        className="w-10 h-10 tablet:w-12 tablet:h-12 rounded-lg tablet:rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:-translate-y-0.5"
        style={{ background: styles.iconBg }}
      >
        {icon}
      </div>
      <div>
        <p className={`font-medium text-sm tablet:text-base ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {label}
        </p>
        {description && (
          <p className={`text-xs tablet:text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
            {description}
          </p>
        )}
      </div>
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return onClick ? <button onClick={onClick} className="w-full text-left">{content}</button> : content;
}

interface SectionHeaderProps {
  title: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

/**
 * Section Header
 * Used for page sections with optional action link
 */
export function SectionHeader({ title, action }: SectionHeaderProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex items-center justify-between mb-4 tablet:mb-5 lg:mb-6">
      <h2
        className={`text-lg tablet:text-xl lg:text-2xl font-semibold ${
          isDark ? 'text-white' : 'text-gray-800'
        }`}
      >
        {title}
      </h2>
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="text-sm tablet:text-base font-medium text-income hover:text-income-dark flex items-center gap-1 transition-transform hover:-translate-y-0.5"
          >
            {action.label}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="text-sm tablet:text-base font-medium text-income hover:text-income-dark flex items-center gap-1 transition-transform hover:-translate-y-0.5"
          >
            {action.label}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )
      )}
    </div>
  );
}

interface ListItemCardProps {
  icon: ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  amount: string;
  amountType: 'income' | 'expense' | 'neutral';
  badge?: string;
  onClick?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

/**
 * List Item Card
 * Used for transaction/income/expense lists
 */
export function ListItemCard({
  icon,
  iconBg,
  title,
  subtitle,
  amount,
  amountType,
  badge,
  onClick,
}: ListItemCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const amountColors = {
    income: 'text-income',
    expense: 'text-expense',
    neutral: isDark ? 'text-white' : 'text-gray-800',
  };

  return (
    <motion.div
      className="flex items-center gap-3 tablet:gap-4 p-3 tablet:p-4 rounded-xl tablet:rounded-2xl backdrop-blur-sm transition-all duration-200 cursor-pointer"
      style={{
        background: isDark ? 'rgba(42, 45, 61, 0.7)' : 'rgba(255, 255, 255, 0.9)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
      }}
      whileHover={{
        background: isDark ? 'rgba(42, 45, 61, 0.9)' : 'rgba(255, 255, 255, 1)',
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {/* Icon */}
      <div
        className="w-11 h-11 tablet:w-12 tablet:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg }}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {title}
          </p>
          {badge && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#10b981',
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <p className={`text-xs tablet:text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
          {subtitle}
        </p>
      </div>

      {/* Amount */}
      <p className={`font-bold font-mono text-base tablet:text-lg ${amountColors[amountType]}`}>
        {amountType === 'income' ? '+' : amountType === 'expense' ? '-' : ''}
        {amount}
      </p>
    </motion.div>
  );
}

interface ResponsiveGridProps {
  children: ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Responsive Grid
 * Handles column layout across breakpoints
 */
export function ResponsiveGrid({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 4 },
  gap = 'md',
  className = '',
}: ResponsiveGridProps) {
  const gapStyles = {
    sm: 'gap-2 tablet:gap-3 lg:gap-4',
    md: 'gap-3 tablet:gap-4 lg:gap-6',
    lg: 'gap-4 tablet:gap-6 lg:gap-8',
  };

  const gridColsClass = `grid-cols-${columns.mobile || 1} tablet:grid-cols-${columns.tablet || 2} lg:grid-cols-${columns.desktop || 4}`;

  return (
    <div className={`grid ${gapStyles[gap]} ${className}`} style={{
      gridTemplateColumns: `repeat(${columns.mobile || 1}, minmax(0, 1fr))`,
    }}>
      <style jsx>{`
        @media (min-width: 641px) and (max-width: 1024px) {
          div {
            grid-template-columns: repeat(${columns.tablet || 2}, minmax(0, 1fr));
          }
        }
        @media (min-width: 1025px) {
          div {
            grid-template-columns: repeat(${columns.desktop || 4}, minmax(0, 1fr));
          }
        }
      `}</style>
      {children}
    </div>
  );
}

interface PageWrapperProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

/**
 * Page Wrapper
 * Consistent page layout with responsive padding
 */
export function PageWrapper({ children, title, subtitle }: PageWrapperProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="w-full px-4 tablet:px-6 lg:px-8 py-4 tablet:py-6 lg:py-8 pb-24 lg:pb-8">
      {(title || subtitle) && (
        <div className="mb-4 tablet:mb-6 lg:mb-8">
          {title && (
            <h1
              className={`text-2xl tablet:text-3xl lg:text-4xl font-bold ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}
            >
              {title}
            </h1>
          )}
          {subtitle && (
            <p className={`mt-1 tablet:mt-2 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Empty State
 * Shown when there's no data
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col items-center justify-center py-12 tablet:py-16 lg:py-20 text-center">
      <div className={`mb-4 opacity-50 ${isDark ? 'text-white' : 'text-gray-400'}`}>
        {icon}
      </div>
      <h3
        className={`text-lg tablet:text-xl font-semibold mb-2 ${
          isDark ? 'text-white' : 'text-gray-800'
        }`}
      >
        {title}
      </h3>
      <p className={`mb-6 max-w-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
        {description}
      </p>
      {action && (
        <motion.button
          className="px-6 py-3 rounded-xl font-medium text-white"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
          }}
          whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(16, 185, 129, 0.5)' }}
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
        >
          {action.label}
        </motion.button>
      )}
    </div>
  );
}

// Export all components
export default {
  GlassCard,
  MetricCard,
  QuickAction,
  SectionHeader,
  ListItemCard,
  ResponsiveGrid,
  PageWrapper,
  EmptyState,
};
