'use client';

import { useTheme } from '@/lib/contexts/ThemeContext';

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
  height?: string;
  width?: string;
}

export function SkeletonLoader({ className = '', count = 1, height = '1rem', width = '100%' }: SkeletonLoaderProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse rounded ${className}`}
          style={{
            height,
            width,
            background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            backgroundColor: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(226, 232, 240, 0.8)',
          }}
          role="status"
          aria-label="Loading"
        />
      ))}
    </>
  );
}

export function CardSkeleton() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className="rounded-3xl p-6 animate-pulse"
      style={{
        background: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.95)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
      }}
      role="status"
      aria-label="Loading card"
    >
      <SkeletonLoader height="1.5rem" width="60%" className="mb-4" />
      <SkeletonLoader height="2.5rem" width="80%" className="mb-2" />
      <SkeletonLoader height="1rem" width="40%" />
    </div>
  );
}

export function ChartSkeleton() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className="rounded-3xl p-6 animate-pulse flex items-center justify-center mobile-chart-height tablet:h-[280px] lg:h-[280px]"
      style={{
        background: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.95)',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
      }}
      role="status"
      aria-label="Loading chart"
    >
      <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

