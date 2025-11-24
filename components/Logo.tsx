'use client';

import { useTheme } from '@/lib/contexts/ThemeContext';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 48, showText = true, className = '' }: LogoProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Circular Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="flex-shrink-0"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gold gradient for metallic effect */}
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          
          {/* Inner background gradient (teal to dark blue) */}
          <linearGradient id="innerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0891b2" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
        </defs>

        {/* Outer gold border */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="url(#goldGradient)"
          stroke="#d97706"
          strokeWidth="2"
        />

        {/* Inner background with gradient */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="url(#innerGradient)"
        />

        {/* Bar Chart */}
        {/* Left bar (dark blue, shortest) */}
        <rect x="30" y="55" width="8" height="15" fill="#1e3a8a" rx="2" />
        
        {/* Middle bar (lighter blue, medium) */}
        <rect x="42" y="50" width="8" height="20" fill="#3b82f6" rx="2" />
        
        {/* Right bar (green, tallest) */}
        <rect x="54" y="40" width="8" height="30" fill="#10b981" rx="2" />

        {/* Upward trend line/arrow (gold) */}
        <path
          d="M 25 70 Q 35 60, 45 50 Q 55 40, 65 30"
          stroke="url(#goldGradient)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        {/* Arrowhead */}
        <path
          d="M 60 32 L 65 30 L 63 35 Z"
          fill="url(#goldGradient)"
        />

        {/* Crescent moon (gold, curving around left side from bottom-left) */}
        <path
          d="M 15 65 Q 20 45, 30 50 Q 25 60, 20 70 Q 15 68, 15 65"
          fill="url(#goldGradient)"
          opacity="0.95"
        />
        {/* Inner cutout for crescent shape */}
        <path
          d="M 18 63 Q 22 50, 28 52 Q 24 58, 20 66 Q 18 65, 18 63"
          fill="url(#innerGradient)"
        />

        {/* Eight-pointed star (gold, lower-right quadrant) */}
        <g transform="translate(72, 72) scale(0.8)">
          <path
            d="M 0 -4 L 1 -1 L 4 0 L 1 1 L 0 4 L -1 1 L -4 0 L -1 -1 Z"
            fill="url(#goldGradient)"
            opacity="0.95"
          />
        </g>
      </svg>

      {/* Text */}
      {showText && (
        <div className="flex flex-col">
          <span
            className="font-bold text-xl leading-tight"
            style={{ color: isDark ? '#3b82f6' : '#1e3a8a' }}
          >
            RIZQ
          </span>
          <span
            className="font-bold text-xl leading-tight"
            style={{ color: '#10b981' }}
          >
            TRACKR
          </span>
        </div>
      )}
    </div>
  );
}

