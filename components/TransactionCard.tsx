'use client';

import { useState, useRef, useEffect } from 'react';
import { Transaction } from '@/lib/transactions';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { getTextColor, getMutedTextColor } from '@/lib/utils';
import { formatHijriDate, getHijriMonthName } from '@/lib/hijri-calendar';

interface TransactionCardProps {
  transaction: Transaction;
  onView: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  getCategoryColor: (category: string) => { bg: string; text: string; icon: string };
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
}

export function TransactionCard({
  transaction,
  onView,
  onDelete,
  getCategoryColor,
  formatCurrency,
  formatDate,
}: TransactionCardProps) {
  const { theme } = useTheme();
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const swipeOffsetRef = useRef(0);
  const SWIPE_THRESHOLD = 80;

  const categoryColor = getCategoryColor(transaction.category);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX;
      setIsSwiping(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startX.current === 0) return;
      currentX.current = e.touches[0].clientX;
      const diff = currentX.current - startX.current;
      swipeOffsetRef.current = diff;
      setSwipeOffset(diff);
    };

    const handleTouchEnd = () => {
      const finalOffset = swipeOffsetRef.current;
      if (Math.abs(finalOffset) > SWIPE_THRESHOLD) {
        if (finalOffset > 0) {
          // Swipe right - view details
          onView(transaction);
        } else {
          // Swipe left - delete
          onDelete(transaction);
        }
      }
      setSwipeOffset(0);
      swipeOffsetRef.current = 0;
      setIsSwiping(false);
      startX.current = 0;
      currentX.current = 0;
    };

    card.addEventListener('touchstart', handleTouchStart);
    card.addEventListener('touchmove', handleTouchMove);
    card.addEventListener('touchend', handleTouchEnd);

    return () => {
      card.removeEventListener('touchstart', handleTouchStart);
      card.removeEventListener('touchmove', handleTouchMove);
      card.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onView, onDelete, transaction]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'scale(1.02) translateY(-2px)';
    e.currentTarget.style.filter = 'brightness(1.1)';
    e.currentTarget.style.boxShadow = theme === 'dark'
      ? '0 12px 40px rgba(16, 185, 129, 0.3), 0 0 20px rgba(16, 185, 129, 0.2)'
      : '0 12px 40px rgba(0, 0, 0, 0.15), 0 0 20px rgba(16, 185, 129, 0.1)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'scale(1) translateY(0)';
    e.currentTarget.style.filter = 'brightness(1)';
    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
  };

  return (
    <div className="relative overflow-hidden" style={{ margin: '0.5rem 1rem' }}>
      {/* Swipe Actions Background */}
      <div className="absolute inset-0 flex">
        {/* Left side - View Details (blue) */}
        <div
          className="flex items-center justify-start pl-6"
          style={{
            width: '50%',
            background: 'rgba(6, 182, 212, 0.2)',
            backdropFilter: 'blur(20px)',
            transform: swipeOffset > 0 ? `translateX(${Math.min(swipeOffset, SWIPE_THRESHOLD)}px)` : 'translateX(-100%)',
            transition: isSwiping ? 'none' : 'transform 0.3s ease',
          }}
        >
          <div className="flex items-center gap-2 text-cyan-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="font-semibold">View</span>
          </div>
        </div>

        {/* Right side - Delete (red) */}
        <div
          className="flex items-center justify-end pr-6 ml-auto"
          style={{
            width: '50%',
            background: 'rgba(239, 68, 68, 0.2)',
            backdropFilter: 'blur(20px)',
            transform: swipeOffset < 0 ? `translateX(${Math.max(swipeOffset, -SWIPE_THRESHOLD)}px)` : 'translateX(100%)',
            transition: isSwiping ? 'none' : 'transform 0.3s ease',
          }}
        >
          <div className="flex items-center gap-2 text-red-500">
            <span className="font-semibold">Delete</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div
        ref={cardRef}
        className="relative cursor-pointer rounded-[20px] p-4 transition-all duration-300"
        style={{
          background: theme === 'dark'
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          transform: `translateX(${swipeOffset}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease, box-shadow 0.3s ease, filter 0.3s ease',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => onView(transaction)}
      >
        <div className="flex items-center gap-4">
          {/* Left: Category Icon */}
          <div
            className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-xl"
            style={{
              background: transaction.type === 'income'
                ? 'rgba(16, 185, 129, 0.2)'
                : 'rgba(239, 68, 68, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            {categoryColor.icon}
          </div>

          {/* Center: Category, Date, Notes */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-bold text-base ${getTextColor(theme)}`}>
                {transaction.category}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: transaction.type === 'income'
                    ? 'rgba(16, 185, 129, 0.2)'
                    : 'rgba(239, 68, 68, 0.2)',
                  color: transaction.type === 'income' ? '#10b981' : '#ef4444',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {transaction.type === 'income' ? 'Income' : 'Expense'}
              </span>
            </div>
            <div className="mb-1">
              <p className={`text-sm ${getMutedTextColor(theme)} opacity-60`}>
              {formatDate(transaction.date)}
            </p>
              {transaction.date_hijri && (
                <p className={`text-xs ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} opacity-80`}>
                  {(() => {
                    const [year, month, day] = transaction.date_hijri.split('-').map(Number);
                    return `${day} ${getHijriMonthName(month)} ${year} AH`;
                  })()}
                </p>
              )}
              {transaction.time && (
                <p className={`text-xs ${getMutedTextColor(theme)} opacity-50`}>
                  {transaction.time} {transaction.timezone && `(${transaction.timezone})`}
                </p>
              )}
            </div>
            {transaction.location_city && (
              <p className={`text-xs ${getMutedTextColor(theme)} opacity-50 mb-1 flex items-center gap-1`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {transaction.location_city}{transaction.location_country && `, ${transaction.location_country}`}
              </p>
            )}
            {transaction.notes && (
              <p className={`text-xs ${getMutedTextColor(theme)} opacity-50 truncate`}>
                {transaction.notes}
              </p>
            )}
          </div>

          {/* Right: Amount */}
          <div className="flex-shrink-0 text-right">
            <p
              className="text-xl font-bold font-mono"
              style={{
                color: transaction.type === 'income' ? '#10b981' : '#ef4444',
              }}
            >
              {transaction.type === 'income' ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

