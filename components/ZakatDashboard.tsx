'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { HijriDatePicker } from './HijriDatePicker';
import { ZakatComparisonChart } from './ZakatComparisonChart';
import {
  calculateZakatEligibility,
  getUserZakatDate,
  setUserZakatDate,
  ZakatEligibilityResult,
  ZakatYearlyComparison,
  getZakatYearlyComparison,
} from '@/lib/zakat';
import { getDualNisabThresholds, NISAB_GOLD_GRAMS, NISAB_SILVER_GRAMS } from '@/lib/nisab-api';
import { formatHijriDate, gregorianToHijri, hijriToGregorian } from '@/lib/hijri-calendar';

interface ZakatDashboardProps {
  userId: string;
  currency?: string;
}

interface DualNisab {
  goldBased: number;
  silverBased: number;
  goldPricePerGram: number;
  silverPricePerGram: number;
  date: string;
}

export function ZakatDashboard({ userId, currency = 'USD' }: ZakatDashboardProps) {
  const { theme } = useTheme();
  const [eligibility, setEligibility] = useState<ZakatEligibilityResult | null>(null);
  const [dualNisab, setDualNisab] = useState<DualNisab | null>(null);
  const [zakatDate, setZakatDate] = useState<{ year: number; month: number; day: number } | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [yearlyData, setYearlyData] = useState<ZakatYearlyComparison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [userId, currency]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [eligibilityData, nisabData, userZakatDate, comparison] = await Promise.all([
        calculateZakatEligibility(userId, currency),
        getDualNisabThresholds(currency),
        getUserZakatDate(userId),
        getZakatYearlyComparison(userId, currency),
      ]);

      setEligibility(eligibilityData);
      setDualNisab(nisabData);
      setZakatDate(userZakatDate);
      setYearlyData(comparison);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
    setLoading(false);
  };

  const handleDateChange = async (date: { year: number; month: number; day: number }) => {
    const result = await setUserZakatDate(userId, date);
    if (result.success) {
      setZakatDate(date);
      setShowDatePicker(false);
      // Reload eligibility with new date
      const newEligibility = await calculateZakatEligibility(userId, currency);
      setEligibility(newEligibility);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const mutedColor = theme === 'dark' ? 'text-white/60' : 'text-slate-500';
  const cardBg = theme === 'dark'
    ? 'bg-slate-800/80 border-white/10'
    : 'bg-white/90 border-slate-200';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl p-6 sm:p-8 ${cardBg} border backdrop-blur-xl shadow-xl overflow-hidden relative`}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative z-10">
          {/* Status Badge */}
          <div className="flex justify-center mb-6">
            {eligibility?.isObligatory ? (
              <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full shadow-lg">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-bold text-xl">ZAKAT OBLIGATORY</span>
              </div>
            ) : (
              <div className="text-center">
                <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-slate-400 to-slate-500 text-white rounded-full shadow-lg mb-3">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold text-xl">NOT OBLIGATORY</span>
                </div>
                <p className={`text-sm ${mutedColor}`}>
                  You are eligible to <span className="text-emerald-500 font-semibold">receive Zakat</span>
                </p>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Annual Savings */}
            <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
              <p className={`text-xs font-medium ${mutedColor} mb-1`}>Your Annual Savings</p>
              <p className={`text-xl sm:text-2xl font-bold ${textColor}`}>
                {formatCurrency(eligibility?.annualSavings || 0)}
              </p>
            </div>

            {/* Nisab Threshold */}
            <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
              <p className={`text-xs font-medium ${mutedColor} mb-1`}>Current Nisab</p>
              <p className={`text-xl sm:text-2xl font-bold text-amber-500`}>
                {formatCurrency(eligibility?.nisabThreshold || 0)}
              </p>
            </div>

            {/* Zakat Amount Due */}
            <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
              <p className={`text-xs font-medium ${mutedColor} mb-1`}>Zakat Amount Due</p>
              <p className={`text-xl sm:text-2xl font-bold text-emerald-500`}>
                {formatCurrency(eligibility?.zakatAmountDue || 0)}
              </p>
            </div>

            {/* Days Until Zakat */}
            <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
              <p className={`text-xs font-medium ${mutedColor} mb-1`}>Days Until Zakat Date</p>
              <p className={`text-xl sm:text-2xl font-bold text-blue-500`}>
                {eligibility?.daysUntilZakatDate !== null ? eligibility.daysUntilZakatDate : '--'}
              </p>
            </div>
          </div>

          {/* Zakat Date Section */}
          <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-amber-900/20' : 'bg-amber-50'} border ${theme === 'dark' ? 'border-amber-700/30' : 'border-amber-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${mutedColor} mb-1`}>Next Zakat Date</p>
                {eligibility?.nextZakatDateHijri ? (
                  <div>
                    <p className={`text-lg font-bold text-amber-600`}>
                      {formatHijriDate(eligibility.nextZakatDateHijri)}
                    </p>
                    <p className={`text-sm ${mutedColor}`}>
                      = {eligibility.nextZakatDateGregorian?.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                ) : (
                  <p className={`text-sm ${mutedColor}`}>Not set - click to configure</p>
                )}
              </div>
              <button
                onClick={() => setShowDatePicker(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium hover:from-amber-600 hover:to-amber-700 transition-all shadow-md"
              >
                {zakatDate ? 'Change Date' : 'Set Date'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dual Nisab Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`rounded-3xl p-6 ${cardBg} border backdrop-blur-xl shadow-xl`}
      >
        <h3 className={`text-lg font-bold ${textColor} mb-4 flex items-center gap-2`}>
          <span>Current Nisab Thresholds</span>
          <span className={`text-xs px-2 py-1 rounded-full ${theme === 'dark' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
            Updates Daily
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Gold-based Nisab */}
          <div className={`p-5 rounded-2xl ${theme === 'dark' ? 'bg-gradient-to-br from-amber-900/40 to-amber-800/20' : 'bg-gradient-to-br from-amber-50 to-amber-100'} border ${theme === 'dark' ? 'border-amber-700/30' : 'border-amber-200'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                <span className="text-2xl">🪙</span>
              </div>
              <div>
                <p className={`text-sm font-medium ${mutedColor}`}>Gold-Based</p>
                <p className="text-xs text-amber-600">{NISAB_GOLD_GRAMS}g of gold</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-amber-600">
              {formatCurrency(dualNisab?.goldBased || 0)}
            </p>
            <p className={`text-xs ${mutedColor} mt-2`}>
              @ {formatCurrency(dualNisab?.goldPricePerGram || 0)}/gram
            </p>
          </div>

          {/* Silver-based Nisab */}
          <div className={`p-5 rounded-2xl ${theme === 'dark' ? 'bg-gradient-to-br from-slate-700/40 to-slate-600/20' : 'bg-gradient-to-br from-slate-50 to-slate-100'} border ${theme === 'dark' ? 'border-slate-600/30' : 'border-slate-200'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center shadow-lg">
                <span className="text-2xl">🥈</span>
              </div>
              <div>
                <p className={`text-sm font-medium ${mutedColor}`}>Silver-Based</p>
                <p className="text-xs text-slate-500">{NISAB_SILVER_GRAMS}g of silver</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-500">
              {formatCurrency(dualNisab?.silverBased || 0)}
            </p>
            <p className={`text-xs ${mutedColor} mt-2`}>
              @ {formatCurrency(dualNisab?.silverPricePerGram || 0)}/gram
            </p>
          </div>
        </div>

        <p className={`text-xs ${mutedColor} mt-4 text-center`}>
          Last updated: {dualNisab?.date || 'Today'} • Most scholars recommend using gold-based Nisab
        </p>
      </motion.div>

      {/* Yearly Comparison Chart */}
      {yearlyData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`rounded-3xl p-6 ${cardBg} border backdrop-blur-xl shadow-xl`}
        >
          <h3 className={`text-lg font-bold ${textColor} mb-4 flex items-center gap-2`}>
            <span>Yearly Comparison</span>
            <span className={`text-xs px-2 py-1 rounded-full ${theme === 'dark' ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
              Nisab vs Your Savings
            </span>
          </h3>
          <ZakatComparisonChart data={yearlyData} currency={currency} />
          <p className={`text-xs ${mutedColor} mt-4 text-center`}>
            Compare your annual savings against the Nisab threshold over the years
          </p>
        </motion.div>
      )}

      {/* Educational Section - Who Can Receive Zakat */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`rounded-3xl p-6 ${cardBg} border backdrop-blur-xl shadow-xl`}
      >
        <h3 className={`text-lg font-bold ${textColor} mb-4`}>Who Can Receive Zakat?</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: '🤲', title: 'The Poor (Fuqara)', desc: 'Those without sufficient means' },
            { icon: '😔', title: 'The Needy (Masakin)', desc: 'Those who cannot meet basic needs' },
            { icon: '📋', title: 'Zakat Collectors', desc: 'Those appointed to collect Zakat' },
            { icon: '💚', title: 'New Muslims', desc: 'Those new to Islam (Muallaf)' },
            { icon: '⛓️', title: 'Slaves & Captives', desc: 'For freeing those in bondage' },
            { icon: '💰', title: 'Those in Debt', desc: 'Unable to pay their debts' },
            { icon: '🛤️', title: 'In Allah\'s Cause', desc: 'For spreading Islam' },
            { icon: '🧳', title: 'Travelers', desc: 'Stranded travelers in need' },
          ].map((category, i) => (
            <div key={i} className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
              <span className="text-2xl mb-2 block">{category.icon}</span>
              <p className={`text-sm font-medium ${textColor}`}>{category.title}</p>
              <p className={`text-xs ${mutedColor}`}>{category.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <HijriDatePicker
            value={zakatDate}
            onChange={handleDateChange}
            onClose={() => setShowDatePicker(false)}
            label="Set Your Zakat Date"
          />
        </div>
      )}
    </div>
  );
}
