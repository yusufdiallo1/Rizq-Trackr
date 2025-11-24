'use client';

import { useTheme } from '@/lib/contexts/ThemeContext';

type MetricType = 'income' | 'expense' | 'balance' | 'zakat';

interface IPhoneMetricCardProps {
  type: MetricType;
  label: string;
  amount: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
}

const defaultIcons: Record<MetricType, React.ReactNode> = {
  income: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  expense: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  ),
  balance: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  zakat: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
};

export function IPhoneMetricCard({
  type,
  label,
  amount,
  trend,
  icon,
}: IPhoneMetricCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={`iphone-metric-card ${
        isDark ? 'iphone-metric-card-dark' : 'iphone-metric-card-light'
      }`}
    >
      {/* Header */}
      <div className="iphone-metric-header">
        <div className={`iphone-metric-icon iphone-metric-icon-${type}`}>
          {icon || defaultIcons[type]}
        </div>
        <span className="iphone-metric-label">{label}</span>
      </div>

      {/* Footer */}
      <div className="iphone-metric-footer">
        <span className={`iphone-metric-amount ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {amount}
        </span>
        {trend && (
          <div
            className={`iphone-metric-trend ${
              trend.isPositive ? 'iphone-metric-trend-up' : 'iphone-metric-trend-down'
            }`}
          >
            {trend.isPositive ? (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  );
}
