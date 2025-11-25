'use client';

import { useState, useEffect } from 'react';
import {
  convertMetalToValue,
  type MetalType,
  type SupportedCurrency,
  getCurrencySymbol,
  formatCurrencyValue,
} from '@/lib/precious-metals';
import { useTheme } from '@/lib/contexts/ThemeContext';

interface PreciousMetalsConverterProps {
  className?: string;
}

const GRAMS_PER_OUNCE = 31.1034768;

export function PreciousMetalsConverter({ className }: PreciousMetalsConverterProps) {
  const { theme } = useTheme();
  const [currency, setCurrency] = useState<SupportedCurrency>('USD');
  const [unit, setUnit] = useState<'grams' | 'ounces'>('grams');
  const [metal, setMetal] = useState<MetalType>('gold');
  const [amount, setAmount] = useState<string>('');
  const [pricePerUnit, setPricePerUnit] = useState<number | null>(null);
  const [totalValue, setTotalValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch price when currency, unit, or metal changes
  useEffect(() => {
    const fetchPrice = async () => {
      setLoading(true);
      setError(null);

      try {
        // Convert 1 unit to get the price
        const gramsToConvert = unit === 'ounces' ? GRAMS_PER_OUNCE : 1;
        const result = await convertMetalToValue(metal, gramsToConvert, currency);
        setPricePerUnit(result.value);
      } catch (err) {
        console.error('Error fetching price:', err);
        setError('Failed to fetch current price. Please try again.');
        setPricePerUnit(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
  }, [currency, unit, metal]);

  // Calculate total value when amount changes
  useEffect(() => {
    const amountNum = parseFloat(amount);
    if (!isNaN(amountNum) && amountNum > 0 && pricePerUnit !== null) {
      setTotalValue(amountNum * pricePerUnit);
    } else {
      setTotalValue(null);
    }
  }, [amount, pricePerUnit]);

  return (
    <div
      className={`rounded-3xl overflow-hidden ${className || ''}`}
      style={{
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: theme === 'dark' ? 'rgba(42, 45, 61, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(15, 23, 42, 0.1)',
      }}
    >
      <div className="p-6 space-y-6">
        {/* Currency Dropdown */}
        <div className="space-y-2">
          <label className={`text-sm font-semibold block ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Currency
          </label>
          <div className="relative">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
              className={`w-full px-4 py-3 rounded-xl appearance-none cursor-pointer text-base font-medium ${
                theme === 'dark'
                  ? 'bg-slate-800/50 text-white border border-slate-600'
                  : 'bg-white text-slate-900 border border-slate-300'
              }`}
              style={{ fontSize: '16px' }}
            >
              {['USD', 'GBP', 'AED', 'SAR', 'EGP'].map((curr) => (
                <option key={curr} value={curr}>
                  {curr} ({getCurrencySymbol(curr as SupportedCurrency)})
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Unit Dropdown */}
        <div className="space-y-2">
          <label className={`text-sm font-semibold block ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Unit
          </label>
          <div className="relative">
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as 'grams' | 'ounces')}
              className={`w-full px-4 py-3 rounded-xl appearance-none cursor-pointer text-base font-medium ${
                theme === 'dark'
                  ? 'bg-slate-800/50 text-white border border-slate-600'
                  : 'bg-white text-slate-900 border border-slate-300'
              }`}
              style={{ fontSize: '16px' }}
            >
              <option value="grams">Grams (g)</option>
              <option value="ounces">Ounces (oz)</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Gold or Silver - Radio Buttons */}
        <div className="space-y-2">
          <label className={`text-sm font-semibold block ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Metal Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMetal('gold')}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                metal === 'gold'
                  ? theme === 'dark'
                    ? 'bg-amber-500/20 text-amber-300 border-2 border-amber-500'
                    : 'bg-amber-100 text-amber-700 border-2 border-amber-500'
                  : theme === 'dark'
                    ? 'bg-slate-800/50 text-white/70 border border-slate-600 hover:bg-slate-700/50'
                    : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
              }`}
            >
              🥇 Gold
            </button>
            <button
              onClick={() => setMetal('silver')}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                metal === 'silver'
                  ? theme === 'dark'
                    ? 'bg-slate-400/20 text-slate-300 border-2 border-slate-400'
                    : 'bg-slate-200 text-slate-700 border-2 border-slate-400'
                  : theme === 'dark'
                    ? 'bg-slate-800/50 text-white/70 border border-slate-600 hover:bg-slate-700/50'
                    : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
              }`}
            >
              🥈 Silver
            </button>
          </div>
        </div>

        {/* Price Display */}
        <div
          className="rounded-xl p-4"
          style={{
            background: theme === 'dark'
              ? 'rgba(16, 185, 129, 0.1)'
              : 'rgba(16, 185, 129, 0.05)',
            border: theme === 'dark'
              ? '1px solid rgba(16, 185, 129, 0.3)'
              : '1px solid rgba(16, 185, 129, 0.2)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
              Current Price per {unit === 'grams' ? 'Gram' : 'Ounce'}:
            </span>
            <div className="text-right">
              {loading ? (
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              ) : error ? (
                <span className="text-red-500 text-sm">Error</span>
              ) : pricePerUnit !== null ? (
                <span className={`text-xl font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {getCurrencySymbol(currency)}{pricePerUnit.toFixed(2)}
                </span>
              ) : (
                <span className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>--</span>
              )}
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <label className={`text-sm font-semibold block ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Amount
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Enter amount in ${unit}`}
            className={`w-full px-4 py-3 rounded-xl text-base font-medium transition-all ${
              theme === 'dark'
                ? 'bg-slate-800/50 text-white border border-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                : 'bg-white text-slate-900 border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
            }`}
            style={{ fontSize: '16px' }}
          />
        </div>

        {/* Total Value Display */}
        {totalValue !== null && (
          <div
            className="rounded-xl p-6"
            style={{
              background: theme === 'dark'
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))'
                : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))',
              border: theme === 'dark'
                ? '1px solid rgba(16, 185, 129, 0.4)'
                : '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            <div className="text-center">
              <div className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
                Total Value
              </div>
              <div className={`text-4xl font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {getCurrencySymbol(currency)}{totalValue.toFixed(2)}
              </div>
              <div className={`text-xs mt-2 ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>
                {amount} {unit} of {metal}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-500">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
