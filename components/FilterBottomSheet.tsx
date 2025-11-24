'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { getTextColor, getMutedTextColor } from '@/lib/utils';

interface FilterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  typeFilter: 'all' | 'income' | 'expense';
  categoryFilter: string;
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  categories: string[];
  onTypeChange: (type: 'all' | 'income' | 'expense') => void;
  onCategoryChange: (category: string) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onMinAmountChange: (amount: string) => void;
  onMaxAmountChange: (amount: string) => void;
  onApply: () => void;
  onClear: () => void;
}

export function FilterBottomSheet({
  isOpen,
  onClose,
  typeFilter,
  categoryFilter,
  startDate,
  endDate,
  minAmount,
  maxAmount,
  categories,
  onTypeChange,
  onCategoryChange,
  onStartDateChange,
  onEndDateChange,
  onMinAmountChange,
  onMaxAmountChange,
  onApply,
  onClear,
}: FilterBottomSheetProps) {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const activeFilterCount = [
    typeFilter !== 'all',
    categoryFilter !== 'all',
    startDate,
    endDate,
    minAmount,
    maxAmount,
  ].filter(Boolean).length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300 animate-fade-in-instant"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`fixed z-50 transition-transform duration-300 animate-slide-up ${
          isMobile ? 'bottom-0 left-0 right-0' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
        }`}
        style={{
          maxHeight: isMobile ? '85vh' : '90vh',
          width: isMobile ? '100%' : '600px',
          maxWidth: '100%',
          background: theme === 'dark'
            ? 'rgba(15, 23, 42, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(30px)',
          borderTopLeftRadius: isMobile ? '24px' : '24px',
          borderTopRightRadius: isMobile ? '24px' : '24px',
          borderBottomLeftRadius: isMobile ? '0' : '24px',
          borderBottomRightRadius: isMobile ? '0' : '24px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Handle (Mobile) */}
        {isMobile && (
          <div className="flex justify-center pt-3 pb-2">
            <div
              className="w-12 h-1 rounded-full"
              style={{
                background: 'rgba(255, 255, 255, 0.3)',
              }}
            />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className={`text-xl font-bold ${getTextColor(theme)}`}>
            Filter Transactions
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: isMobile ? 'calc(85vh - 200px)' : 'calc(90vh - 200px)' }}>
          {/* Type Filter */}
          <div className="mb-6">
            <label className={`block text-sm font-semibold ${getTextColor(theme)} mb-3`}>
              Type
            </label>
            <div className="flex gap-2">
              {(['all', 'income', 'expense'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => onTypeChange(type)}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                  style={{
                    background: typeFilter === type
                      ? 'rgba(6, 182, 212, 0.3)'
                      : 'rgba(255, 255, 255, 0.1)',
                    color: typeFilter === type ? '#06b6d4' : getTextColor(theme),
                    border: `1px solid ${typeFilter === type ? 'rgba(6, 182, 212, 0.5)' : 'rgba(255, 255, 255, 0.2)'}`,
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  {type === 'all' ? 'All' : type === 'income' ? 'Income' : 'Expense'}
                </button>
              ))}
            </div>
          </div>

          {/* Categories Filter */}
          <div className="mb-6">
            <label className={`block text-sm font-semibold ${getTextColor(theme)} mb-3`}>
              Categories
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
              <button
                onClick={() => onCategoryChange('all')}
                className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0"
                style={{
                  background: categoryFilter === 'all'
                    ? 'rgba(6, 182, 212, 0.3)'
                    : 'rgba(255, 255, 255, 0.1)',
                  color: categoryFilter === 'all' ? '#06b6d4' : getTextColor(theme),
                  border: `1px solid ${categoryFilter === 'all' ? 'rgba(6, 182, 212, 0.5)' : 'rgba(255, 255, 255, 0.2)'}`,
                  backdropFilter: 'blur(10px)',
                }}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(cat)}
                  className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0"
                  style={{
                    background: categoryFilter === cat
                      ? 'rgba(6, 182, 212, 0.3)'
                      : 'rgba(255, 255, 255, 0.1)',
                    color: categoryFilter === cat ? '#06b6d4' : getTextColor(theme),
                    border: `1px solid ${categoryFilter === cat ? 'rgba(6, 182, 212, 0.5)' : 'rgba(255, 255, 255, 0.2)'}`,
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="mb-6">
            <label className={`block text-sm font-semibold ${getTextColor(theme)} mb-3`}>
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onStartDateChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: getTextColor(theme),
                  }}
                />
                <p className={`text-xs mt-1 ${getMutedTextColor(theme)} opacity-70`}>From</p>
              </div>
              <div>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => onEndDateChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: getTextColor(theme),
                  }}
                />
                <p className={`text-xs mt-1 ${getMutedTextColor(theme)} opacity-70`}>To</p>
              </div>
            </div>
          </div>

          {/* Amount Range */}
          <div className="mb-6">
            <label className={`block text-sm font-semibold ${getTextColor(theme)} mb-3`}>
              Amount Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium">$</span>
                  <input
                    type="number"
                    value={minAmount}
                    onChange={(e) => onMinAmountChange(e.target.value)}
                    placeholder="Min"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl text-sm transition-all outline-none"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(15px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: getTextColor(theme),
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium">$</span>
                  <input
                    type="number"
                    value={maxAmount}
                    onChange={(e) => onMaxAmountChange(e.target.value)}
                    placeholder="Max"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl text-sm transition-all outline-none"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(15px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: getTextColor(theme),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="px-6 py-4 border-t border-white/10 flex gap-3">
          <button
            onClick={onClear}
            className="flex-1 px-6 py-3 rounded-xl font-medium transition-all"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: getTextColor(theme),
            }}
          >
            Clear All
          </button>
          <button
            onClick={() => {
              onApply();
              onClose();
            }}
            className="flex-1 px-6 py-3 rounded-xl font-medium text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
              boxShadow: '0 4px 16px rgba(6, 182, 212, 0.4)',
            }}
          >
            Apply Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
        </div>
      </div>
    </>
  );
}

