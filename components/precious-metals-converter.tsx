'use client';

import { useState, useEffect } from 'react';
import {
  convertMetalToValue,
  type MetalType,
  type SupportedCurrency,
  type ConversionResult,
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
  const [metal, setMetal] = useState<MetalType>('gold');
  const [unit, setUnit] = useState<'grams' | 'ounces'>('grams');
  const [amount, setAmount] = useState<string>('3.2');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const currencies: SupportedCurrency[] = ['USD', 'GBP', 'AED', 'SAR', 'EGP'];

  useEffect(() => {
    const convertValues = async () => {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        setResults([]);
        return;
      }

      // Convert to grams if in ounces
      const gramsNum = unit === 'ounces' ? amountNum * GRAMS_PER_OUNCE : amountNum;

      setLoading(true);
      setError(null);

      try {
        const conversions = await Promise.all(
          currencies.map((currency) => convertMetalToValue(metal, gramsNum, currency))
        );
        setResults(conversions);
        if (conversions.length > 0) {
          setLastUpdated(conversions[0].lastUpdated);
        }
      } catch (err) {
        console.error('Error converting metals:', err);
        setError('Failed to fetch current prices. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    // Debounce the conversion
    const timeout = setTimeout(convertValues, 300);
    return () => clearTimeout(timeout);
  }, [metal, amount, unit]);

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
      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)' }}>
        <h3 className={`text-xl font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          <span className="text-2xl">{metal === 'gold' ? '🥇' : '🥈'}</span>
          Precious Metals Converter
        </h3>
        <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>
          Convert gold and silver to multiple currencies with live market prices
        </p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Metal Type Selector */}
        <div className="space-y-2">
          <label className={`text-sm font-medium block ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Metal Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setMetal('gold')}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                metal === 'gold'
                  ? theme === 'dark'
                    ? 'bg-amber-500/20 text-amber-300 border-2 border-amber-500'
                    : 'bg-amber-100 text-amber-700 border-2 border-amber-500'
                  : theme === 'dark'
                    ? 'bg-slate-700/50 text-white/70 border border-slate-600 hover:bg-slate-600/50'
                    : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
              }`}
            >
              Gold (Au)
            </button>
            <button
              onClick={() => setMetal('silver')}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                metal === 'silver'
                  ? theme === 'dark'
                    ? 'bg-slate-400/20 text-slate-300 border-2 border-slate-400'
                    : 'bg-slate-200 text-slate-700 border-2 border-slate-400'
                  : theme === 'dark'
                    ? 'bg-slate-700/50 text-white/70 border border-slate-600 hover:bg-slate-600/50'
                    : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
              }`}
            >
              Silver (Ag)
            </button>
          </div>
        </div>

        {/* Unit Selector */}
        <div className="space-y-2">
          <label className={`text-sm font-medium block ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Unit of Measurement
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setUnit('grams')}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                unit === 'grams'
                  ? theme === 'dark'
                    ? 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500'
                    : 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500'
                  : theme === 'dark'
                    ? 'bg-slate-700/50 text-white/70 border border-slate-600 hover:bg-slate-600/50'
                    : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
              }`}
            >
              Grams (g)
            </button>
            <button
              onClick={() => setUnit('ounces')}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                unit === 'ounces'
                  ? theme === 'dark'
                    ? 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500'
                    : 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500'
                  : theme === 'dark'
                    ? 'bg-slate-700/50 text-white/70 border border-slate-600 hover:bg-slate-600/50'
                    : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
              }`}
            >
              Ounces (oz)
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <label
            htmlFor="amount"
            className={`text-sm font-medium block ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
          >
            Amount in {unit === 'grams' ? 'Grams' : 'Ounces'}
            {metal === 'silver' && unit === 'grams' && (
              <span className={`ml-2 text-xs ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>
                (Nisab: ~595g)
              </span>
            )}
            {metal === 'gold' && unit === 'grams' && (
              <span className={`ml-2 text-xs ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>
                (Nisab: ~85g)
              </span>
            )}
            {metal === 'silver' && unit === 'ounces' && (
              <span className={`ml-2 text-xs ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>
                (Nisab: ~19.1oz)
              </span>
            )}
            {metal === 'gold' && unit === 'ounces' && (
              <span className={`ml-2 text-xs ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>
                (Nisab: ~2.7oz)
              </span>
            )}
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Enter ${unit}`}
            className={`w-full px-4 py-3 rounded-xl text-base font-medium transition-all ${
              theme === 'dark'
                ? 'bg-slate-800/50 text-white border border-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                : 'bg-white text-slate-900 border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
            }`}
            style={{ fontSize: '16px' }} // Prevents zoom on iOS
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        {/* Results */}
        {!loading && !error && results.length > 0 && (
          <div className="space-y-3">
            <div className={`flex items-center justify-between text-sm ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>
              <span>Current Values</span>
              {lastUpdated && (
                <span className="text-xs">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>

            <div className="grid gap-2">
              {results.map((result) => (
                <div
                  key={result.currency}
                  className={`flex items-center justify-between rounded-xl p-4 transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-800/50 border border-slate-700 hover:bg-slate-700/50'
                      : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      {getCurrencySymbol(result.currency)}
                    </span>
                    <div className="flex flex-col">
                      <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        {result.currency}
                      </span>
                      <span className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>
                        {formatCurrencyValue(result.pricePerGram, result.currency)}/g
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {formatCurrencyValue(result.value, result.currency)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Zakat Notice */}
            {(() => {
              const amountNum = parseFloat(amount);
              const gramsNum = unit === 'ounces' ? amountNum * GRAMS_PER_OUNCE : amountNum;
              const nisabThreshold = metal === 'gold' ? 85 : 595;
              return gramsNum >= nisabThreshold;
            })() && (
              <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4">
                <p className={`font-semibold text-sm ${theme === 'dark' ? 'text-green-400' : 'text-green-700'}`}>
                  Zakat Applicable
                </p>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-green-300/80' : 'text-green-600'}`}>
                  Your {metal} holdings have reached the Nisab threshold. Zakat of 2.5% may be due.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div
          className={`rounded-xl p-3 text-xs ${
            theme === 'dark'
              ? 'bg-slate-800/30 text-white/60'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          <p>
            <strong>Note:</strong> Prices update hourly from live market data. You can convert any amount
            of gold or silver in grams or ounces. The Nisab threshold for gold is ~85g (2.7oz) and for silver is ~595g (19.1oz).
          </p>
        </div>
      </div>
    </div>
  );
}
