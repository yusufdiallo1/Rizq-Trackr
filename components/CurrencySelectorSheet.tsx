'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { getTextColor, getMutedTextColor } from '@/lib/utils';

interface CurrencySelectorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (currency: string) => void;
  currentCurrency?: string;
}

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: '£', flag: '🇪🇬' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
];

export function CurrencySelectorSheet({ 
  isOpen, 
  onClose, 
  onSelect,
  currentCurrency = 'USD'
}: CurrencySelectorSheetProps) {
  const { theme } = useTheme();
  const [selectedCurrency, setSelectedCurrency] = useState(currentCurrency);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setSelectedCurrency(currentCurrency);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, currentCurrency]);

  const handleSelect = (currency: string) => {
    setSelectedCurrency(currency);
    onSelect(currency);
    onClose();
  };

  if (!isOpen) return null;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 transition-opacity duration-300"
        style={{
          background: 'transparent',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
        onClick={onClose}
      />

      {/* Bottom Sheet / Popover */}
      <div
        className={`fixed z-50 w-full max-h-[90vh] rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
          ${isMobile ? 'bottom-0 left-0 right-0' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-md rounded-3xl'}
        `}
        style={{
          background: theme === 'dark'
            ? 'rgba(15, 23, 42, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle for mobile */}
        {isMobile && (
          <div className="flex justify-center py-3">
            <div className="w-16 h-1.5 bg-white/30 rounded-full" />
          </div>
        )}

        <div className="p-6 overflow-y-auto" style={{ maxHeight: isMobile ? 'calc(90vh - 60px)' : '80vh' }}>
          <h2 className={`text-2xl font-bold ${getTextColor(theme)} mb-6`}>
            Select Currency
          </h2>

          <div className="space-y-2">
            {CURRENCIES.map((currency) => (
              <button
                key={currency.code}
                onClick={() => handleSelect(currency.code)}
                className={`w-full p-4 rounded-xl transition-all duration-200 text-left ${
                  selectedCurrency === currency.code
                    ? 'bg-cyan-500/20 border-2 border-cyan-500/50'
                    : 'bg-white/10 border border-white/20 hover:bg-white/20'
                }`}
                style={{
                  backdropFilter: 'blur(15px)',
                }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{currency.flag}</span>
                  <div className="flex-1">
                    <p className={`font-semibold ${getTextColor(theme)}`}>
                      {currency.name}
                    </p>
                    <p className={`text-sm ${getMutedTextColor(theme)}`}>
                      {currency.code} {currency.symbol}
                    </p>
                  </div>
                  {selectedCurrency === currency.code && (
                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

