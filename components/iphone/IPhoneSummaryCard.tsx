'use client';

import { useTheme } from '@/lib/contexts/ThemeContext';

interface IPhoneSummaryCardProps {
  greeting: string;
  userName: string;
  date: string;
  islamicDate?: string;
  balance: string;
  balanceLabel?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function IPhoneSummaryCard({
  greeting,
  userName,
  date,
  islamicDate,
  balance,
  balanceLabel = 'Total Savings',
  trend,
}: IPhoneSummaryCardProps) {
  return (
    <div className="iphone-summary-card iphone-animate-slide-up">
      {/* Greeting */}
      <p className="iphone-summary-greeting">
        {greeting}, {userName}
      </p>

      {/* Date */}
      <p className="iphone-summary-date">
        {date}
        {islamicDate && ` • ${islamicDate}`}
      </p>

      {/* Balance Label */}
      <p className="iphone-summary-label">{balanceLabel}</p>

      {/* Balance Amount */}
      <h2 className="iphone-summary-balance">{balance}</h2>

      {/* Trend Indicator */}
      {trend && (
        <div className="iphone-summary-trend">
          {trend.isPositive ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          )}
          <span>{trend.value}</span>
        </div>
      )}
    </div>
  );
}
