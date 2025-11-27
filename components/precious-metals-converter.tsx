'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  fetchMetalPrices,
  convertMetalToValue,
  calculateNisabValues,
  type MetalType,
  type SupportedCurrency,
  type MetalPrice,
  getCurrencySymbol,
  formatCurrencyValue,
  NISAB_GOLD_GRAMS,
  NISAB_SILVER_GRAMS,
} from '@/lib/precious-metals';
import {
  loadPreferences,
  savePreferences,
  type PreciousMetalsPreferences,
} from '@/lib/precious-metals-preferences';
import {
  requestNotificationPermission,
  notifyPriceChange,
  notifyNisabThresholdMet,
} from '@/lib/precious-metals-notifications';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { getCurrentUser, User } from '@/lib/auth';
import { logError } from '@/lib/logger';
import {
  shimmerVariants,
  rippleVariants,
  pulseVariants,
  slideUpVariants,
  bounceInVariants,
} from '@/lib/animations/variants';

interface PreciousMetalsConverterProps {
  className?: string;
}

const GRAMS_PER_OUNCE = 31.1034768;

// Glass morphism modal variants
const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    filter: 'blur(10px)',
  },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    filter: 'blur(5px)',
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function PreciousMetalsConverter({ className }: PreciousMetalsConverterProps) {
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const [user, setUser] = useState<User | null>(null);
  const [currency, setCurrency] = useState<SupportedCurrency>('USD');
  const [unit, setUnit] = useState<'grams' | 'ounces'>('grams');
  const [metal, setMetal] = useState<MetalType>('gold');
  const [amount, setAmount] = useState<string>('');
  const [pricePerUnit, setPricePerUnit] = useState<number | null>(null);
  const [priceData, setPriceData] = useState<MetalPrice | null>(null);
  const [totalValue, setTotalValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<PreciousMetalsPreferences | null>(null);
  const [showNisabInfo, setShowNisabInfo] = useState(false);
  const [nisabValues, setNisabValues] = useState<{ gold: number; silver: number } | null>(null);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [ripplePosition, setRipplePosition] = useState<{ x: number; y: number } | null>(null);
  const [nisabMet, setNisabMet] = useState(false);
  const [priceChangeIndicator, setPriceChangeIndicator] = useState<{ direction: 'up' | 'down' | 'neutral' | null; percentage: number }>({ direction: null, percentage: 0 });
  const currencyButtonRef = useRef<HTMLButtonElement>(null);
  const unitButtonRef = useRef<HTMLButtonElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);
  const unitDropdownRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';

  // Glass morphism base styles
  const glassMorphismBase = {
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    background: isDark 
      ? 'rgba(30, 41, 59, 0.7)' 
      : 'rgba(255, 255, 255, 0.7)',
    border: isDark 
      ? '1px solid rgba(255, 255, 255, 0.1)' 
      : '1px solid rgba(15, 23, 42, 0.1)',
    boxShadow: isDark
      ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
  };

  // Load user and preferences on mount
  useEffect(() => {
    const init = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      const prefs = await loadPreferences(currentUser?.id);
      setPreferences(prefs);
      setCurrency(prefs.currency);
    };
    init();
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if (preferences?.notificationsEnabled) {
      requestNotificationPermission();
    }
  }, [preferences?.notificationsEnabled]);

  // Fetch prices and Nisab values
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const prices = await fetchMetalPrices();
        const metalPrice = prices[metal][currency];
        setPriceData(metalPrice);

        // Convert 1 unit to get the price
        const gramsToConvert = unit === 'ounces' ? GRAMS_PER_OUNCE : 1;
        const result = await convertMetalToValue(metal, gramsToConvert, currency);
        setPricePerUnit(result.value);

        // Calculate Nisab values
        const nisab = await calculateNisabValues(currency);
        setNisabValues({ gold: nisab.gold, silver: nisab.silver });

        // Update price change indicator
        if (metalPrice.priceChange) {
          setPriceChangeIndicator({
            direction: metalPrice.priceChange.direction,
            percentage: metalPrice.priceChange.percentage,
          });
        }

        // Check for price change notifications
        if (preferences?.notificationsEnabled && metalPrice.priceChange) {
          notifyPriceChange(metal, currency, metalPrice.priceChange, preferences);
        }
      } catch (err) {
        logError(err, 'Error fetching precious metals data');
        setError('Failed to fetch current price. Please try again.');
        setPricePerUnit(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currency, unit, metal, preferences?.notificationsEnabled]);

  // Calculate total value and check Nisab
  useEffect(() => {
    const amountNum = parseFloat(amount);
    if (!isNaN(amountNum) && amountNum > 0 && pricePerUnit !== null) {
      const value = amountNum * pricePerUnit;
      setTotalValue(value);

      // Check if Nisab threshold is met
      if (nisabValues) {
        const nisabThreshold = metal === 'gold' ? nisabValues.gold : nisabValues.silver;
        const amountInGrams = unit === 'ounces' ? amountNum * GRAMS_PER_OUNCE : amountNum;
        const nisabGrams = metal === 'gold' ? NISAB_GOLD_GRAMS : NISAB_SILVER_GRAMS;
        const meetsNisab = amountInGrams >= nisabGrams;

        if (meetsNisab && !nisabMet) {
          setNisabMet(true);
          if (preferences?.notificationsEnabled && user) {
            notifyNisabThresholdMet(metal, currency, value, nisabThreshold, preferences);
          }
        } else if (!meetsNisab) {
          setNisabMet(false);
        }
      }
    } else {
      setTotalValue(null);
      setNisabMet(false);
    }
  }, [amount, pricePerUnit, unit, metal, nisabValues, preferences, user, currency, nisabMet]);

  // Save preferences when currency changes
  useEffect(() => {
    if (preferences && user) {
      const updatedPrefs = { ...preferences, currency };
      setPreferences(updatedPrefs);
      savePreferences(updatedPrefs, user.id).catch((err) => {
        logError(err, 'Failed to save precious metals preferences');
      });
    }
  }, [currency]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target as Node)) {
        setShowCurrencyDropdown(false);
      }
      if (unitDropdownRef.current && !unitDropdownRef.current.contains(event.target as Node)) {
        setShowUnitDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle currency change
  const handleCurrencyChange = useCallback((newCurrency: SupportedCurrency) => {
    setCurrency(newCurrency);
    setShowCurrencyDropdown(false);
  }, []);

  // Handle unit change
  const handleUnitChange = useCallback((newUnit: 'grams' | 'ounces') => {
    setUnit(newUnit);
    setShowUnitDropdown(false);
  }, []);

  // Handle metal toggle
  const handleMetalToggle = useCallback((newMetal: MetalType) => {
    setMetal(newMetal);
  }, []);

  // Handle ripple effect
  const handleRipple = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipplePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setTimeout(() => setRipplePosition(null), 600);
  }, []);

  // Toggle notifications
  const handleToggleNotifications = useCallback(async () => {
    if (!preferences) return;

    const hasPermission = await requestNotificationPermission();
    if (!hasPermission && preferences.notificationsEnabled) {
      alert('Please enable notifications in your browser settings');
      return;
    }

    const updatedPrefs = {
      ...preferences,
      notificationsEnabled: !preferences.notificationsEnabled,
    };
    setPreferences(updatedPrefs);
    if (user) {
      await savePreferences(updatedPrefs, user.id);
    }
  }, [preferences, user]);

  // Increment/decrement amount
  const handleIncrement = useCallback(() => {
    const current = parseFloat(amount) || 0;
    setAmount((current + (unit === 'grams' ? 1 : 0.1)).toFixed(unit === 'grams' ? 0 : 1));
  }, [amount, unit]);

  const handleDecrement = useCallback(() => {
    const current = parseFloat(amount) || 0;
    if (current > 0) {
      setAmount(Math.max(0, current - (unit === 'grams' ? 1 : 0.1)).toFixed(unit === 'grams' ? 0 : 1));
    }
  }, [amount, unit]);

  const currencies: SupportedCurrency[] = ['USD', 'GBP', 'AED', 'SAR', 'EGP'];
  const units: Array<{ value: 'grams' | 'ounces'; label: string }> = [
    { value: 'grams', label: 'Grams (g)' },
    { value: 'ounces', label: 'Ounces (oz)' },
  ];

  // Calculate amount in grams for Nisab comparison
  const amountInGrams = amount
    ? parseFloat(amount) * (unit === 'ounces' ? GRAMS_PER_OUNCE : 1)
    : 0;
  const nisabGrams = metal === 'gold' ? NISAB_GOLD_GRAMS : NISAB_SILVER_GRAMS;
  const nisabValue = nisabValues ? (metal === 'gold' ? nisabValues.gold : nisabValues.silver) : null;

  return (
    <motion.div
      className={`rounded-3xl overflow-hidden ${className || ''}`}
      style={glassMorphismBase}
      variants={prefersReducedMotion ? {} : modalVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="p-6 space-y-6">
        {/* Currency Dropdown Button - Glass Morphism with Hover Glow */}
        <div className="space-y-2">
          <motion.label
            className={`text-sm font-semibold block ${isDark ? 'text-white' : 'text-slate-900'}`}
            variants={prefersReducedMotion ? {} : slideUpVariants}
            initial="hidden"
            animate="visible"
          >
            Currency
          </motion.label>
          <div className="relative" ref={currencyDropdownRef}>
            <motion.button
              ref={currencyButtonRef}
              onClick={(e) => {
                handleRipple(e);
                setShowCurrencyDropdown(!showCurrencyDropdown);
              }}
              whileHover={prefersReducedMotion ? {} : { 
                scale: 1.02,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(15, 23, 42, 0.15)',
                boxShadow: isDark
                  ? '0 0 20px rgba(16, 185, 129, 0.3)'
                  : '0 0 20px rgba(16, 185, 129, 0.2)',
              }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              className={`w-full px-4 py-3 rounded-xl text-base font-medium text-left flex items-center justify-between transition-all duration-300 ${
                isDark
                  ? 'bg-slate-800/50 text-white border border-slate-600'
                  : 'bg-white/80 text-slate-900 border border-slate-300'
              }`}
              style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              <span className="flex items-center gap-2">
                <span>{currency}</span>
                <span className="text-sm opacity-70">({getCurrencySymbol(currency)})</span>
              </span>
              <motion.svg
                className={`w-5 h-5 ${isDark ? 'text-white' : 'text-slate-900'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ rotate: showCurrencyDropdown ? 180 : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </motion.button>

            {/* Ripple Effect */}
            {ripplePosition && showCurrencyDropdown && (
              <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: ripplePosition.x,
                  top: ripplePosition.y,
                  width: 20,
                  height: 20,
                  background: isDark ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.3)',
                  transform: 'translate(-50%, -50%)',
                }}
                variants={prefersReducedMotion ? {} : rippleVariants}
                initial="hidden"
                animate="visible"
              />
            )}

            {/* Dropdown Menu - Glass Morphism with Slide Down */}
            <AnimatePresence>
              {showCurrencyDropdown && (
                <motion.div
                  ref={currencyDropdownRef}
                  initial={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="absolute z-50 w-full mt-2 rounded-xl overflow-hidden"
                  style={{
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    background: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(15, 23, 42, 0.15)',
                    boxShadow: isDark
                      ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                      : '0 8px 32px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  {currencies.map((curr, index) => (
                    <motion.button
                      key={curr}
                      onClick={() => handleCurrencyChange(curr)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      className={`w-full px-4 py-3 text-left flex items-center justify-between transition-all ${
                        currency === curr
                          ? isDark
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-emerald-100 text-emerald-700'
                          : isDark
                            ? 'text-white hover:bg-slate-700/50'
                            : 'text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{curr}</span>
                        <span className="text-sm opacity-70">({getCurrencySymbol(curr)})</span>
                      </span>
                      {currency === curr && (
                        <motion.svg
                          className="w-5 h-5 text-emerald-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          variants={prefersReducedMotion ? {} : bounceInVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </motion.svg>
                      )}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Metal Type Toggle - Gold/Silver with Shimmer and Glow */}
        <div className="space-y-2">
          <motion.label
            className={`text-sm font-semibold block ${isDark ? 'text-white' : 'text-slate-900'}`}
            variants={prefersReducedMotion ? {} : slideUpVariants}
            initial="hidden"
            animate="visible"
          >
            Metal Type
          </motion.label>
          <div className="grid grid-cols-2 gap-3">
            {/* Gold Button */}
            <motion.button
              onClick={() => handleMetalToggle('gold')}
              whileHover={prefersReducedMotion ? {} : { 
                translateY: -2,
                scale: 1.02,
              }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-400 relative overflow-hidden ${
                metal === 'gold'
                  ? isDark
                    ? 'bg-amber-500/20 text-amber-300 border-2 border-amber-500'
                    : 'bg-amber-100 text-amber-700 border-2 border-amber-500'
                  : isDark
                    ? 'bg-slate-800/50 text-white/70 border border-slate-600 hover:bg-slate-700/50'
                    : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
              }`}
              style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              {metal === 'gold' && (
                <>
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.4), transparent)',
                      backgroundSize: '200% 100%',
                    }}
                    variants={prefersReducedMotion ? {} : shimmerVariants}
                    initial="hidden"
                    animate="visible"
                  />
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      boxShadow: '0 0 20px rgba(245, 158, 11, 0.5)',
                    }}
                    variants={prefersReducedMotion ? {} : pulseVariants}
                    initial="hidden"
                    animate="visible"
                  />
                </>
              )}
              <span className="relative z-10 flex items-center gap-2">
                <span>🥇</span>
                <span>Gold</span>
              </span>
            </motion.button>

            {/* Silver Button */}
            <motion.button
              onClick={() => handleMetalToggle('silver')}
              whileHover={prefersReducedMotion ? {} : { 
                translateY: -2,
                scale: 1.02,
              }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-400 relative overflow-hidden ${
                metal === 'silver'
                  ? isDark
                    ? 'bg-slate-400/20 text-slate-300 border-2 border-slate-400'
                    : 'bg-slate-200 text-slate-700 border-2 border-slate-400'
                  : isDark
                    ? 'bg-slate-800/50 text-white/70 border border-slate-600 hover:bg-slate-700/50'
                    : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
              }`}
              style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              {metal === 'silver' && (
                <>
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.4), transparent)',
                      backgroundSize: '200% 100%',
                    }}
                    variants={prefersReducedMotion ? {} : shimmerVariants}
                    initial="hidden"
                    animate="visible"
                  />
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      boxShadow: '0 0 20px rgba(148, 163, 184, 0.5)',
                    }}
                    variants={prefersReducedMotion ? {} : pulseVariants}
                    initial="hidden"
                    animate="visible"
                  />
                </>
              )}
              <span className="relative z-10 flex items-center gap-2">
                <span>🥈</span>
                <span>Silver</span>
              </span>
            </motion.button>
          </div>
        </div>

        {/* Unit Dropdown - Glass Morphism */}
        <div className="space-y-2">
          <motion.label
            className={`text-sm font-semibold block ${isDark ? 'text-white' : 'text-slate-900'}`}
            variants={prefersReducedMotion ? {} : slideUpVariants}
            initial="hidden"
            animate="visible"
          >
            Unit of Measurement
          </motion.label>
          <div className="relative" ref={unitDropdownRef}>
            <motion.button
              ref={unitButtonRef}
              onClick={(e) => {
                handleRipple(e);
                setShowUnitDropdown(!showUnitDropdown);
              }}
              whileHover={prefersReducedMotion ? {} : { 
                scale: 1.02,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(15, 23, 42, 0.15)',
                boxShadow: isDark
                  ? '0 0 20px rgba(16, 185, 129, 0.3)'
                  : '0 0 20px rgba(16, 185, 129, 0.2)',
              }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              className={`w-full px-4 py-3 rounded-xl text-base font-medium text-left flex items-center justify-between transition-all duration-300 ${
                isDark
                  ? 'bg-slate-800/50 text-white border border-slate-600'
                  : 'bg-white/80 text-slate-900 border border-slate-300'
              }`}
              style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              <span>{units.find((u) => u.value === unit)?.label}</span>
              <motion.svg
                className={`w-5 h-5 ${isDark ? 'text-white' : 'text-slate-900'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ rotate: showUnitDropdown ? 180 : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showUnitDropdown && (
                <motion.div
                  ref={unitDropdownRef}
                  initial={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="absolute z-50 w-full mt-2 rounded-xl overflow-hidden"
                  style={{
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    background: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(15, 23, 42, 0.15)',
                    boxShadow: isDark
                      ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                      : '0 8px 32px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  {units.map((u, index) => (
                    <motion.button
                      key={u.value}
                      onClick={() => handleUnitChange(u.value)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      className={`w-full px-4 py-3 text-left flex items-center justify-between transition-all ${
                        unit === u.value
                          ? isDark
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-emerald-100 text-emerald-700'
                          : isDark
                            ? 'text-white hover:bg-slate-700/50'
                            : 'text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <span>{u.label}</span>
                      {unit === u.value && (
                        <motion.svg
                          className="w-5 h-5 text-emerald-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          variants={prefersReducedMotion ? {} : bounceInVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </motion.svg>
                      )}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Price Display Card - Glass Morphism with Trend Indicator */}
        <motion.div
          className="rounded-xl p-4"
          style={{
            ...glassMorphismBase,
            background: isDark
              ? 'rgba(16, 185, 129, 0.15)'
              : 'rgba(16, 185, 129, 0.1)',
            border: isDark
              ? '1px solid rgba(16, 185, 129, 0.3)'
              : '1px solid rgba(16, 185, 129, 0.2)',
          }}
          variants={prefersReducedMotion ? {} : slideUpVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
              Current Price per {unit === 'grams' ? 'Gram' : 'Ounce'}:
            </span>
            {priceChangeIndicator.direction && (
              <motion.div
                className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                  priceChangeIndicator.direction === 'up'
                    ? 'text-emerald-500 bg-emerald-500/10'
                    : 'text-red-500 bg-red-500/10'
                }`}
                variants={prefersReducedMotion ? {} : bounceInVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.span
                  animate={{ 
                    y: priceChangeIndicator.direction === 'up' ? [-2, 0, -2] : [2, 0, 2],
                  }}
                  transition={{ 
                    duration: 1,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  {priceChangeIndicator.direction === 'up' ? '↑' : '↓'}
                </motion.span>
                <span>{Math.abs(priceChangeIndicator.percentage).toFixed(2)}%</span>
              </motion.div>
            )}
          </div>
          <div className="flex items-center justify-between">
              {loading ? (
              <motion.div
                className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              ) : error ? (
                <span className="text-red-500 text-sm">Error</span>
              ) : pricePerUnit !== null ? (
              <motion.span
                className={`text-xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
                key={pricePerUnit}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
              >
                  {getCurrencySymbol(currency)}{pricePerUnit.toFixed(2)}
              </motion.span>
            ) : (
              <span className={`text-sm ${isDark ? 'text-white/60' : 'text-slate-500'}`}>--</span>
            )}
            {priceData?.lastUpdated && (
              <span className={`text-xs ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
                Updated: {new Date(priceData.lastUpdated).toLocaleTimeString()}
                </span>
              )}
          </div>
        </motion.div>

        {/* Amount Input with Increment/Decrement - Glass Morphism */}
        <div className="space-y-2">
          <motion.label
            className={`text-sm font-semibold block ${isDark ? 'text-white' : 'text-slate-900'}`}
            variants={prefersReducedMotion ? {} : slideUpVariants}
            initial="hidden"
            animate="visible"
          >
            Amount in {unit === 'grams' ? 'Grams' : 'Ounces'}
            {unit === 'grams' && (
              <span className="text-xs font-normal ml-1 opacity-70">
                (Nisab: ~{metal === 'gold' ? NISAB_GOLD_GRAMS : NISAB_SILVER_GRAMS}g)
              </span>
            )}
          </motion.label>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={handleDecrement}
              whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
              className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold transition-all ${
                isDark
                  ? 'bg-slate-700/50 text-white border border-slate-600 hover:bg-slate-600'
                  : 'bg-slate-100 text-slate-900 border border-slate-300 hover:bg-slate-200'
              }`}
              style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              −
            </motion.button>
            <motion.input
              ref={amountInputRef}
            type="number"
              step={unit === 'grams' ? '1' : '0.1'}
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Enter amount in ${unit}`}
              className={`flex-1 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                isDark
                ? 'bg-slate-800/50 text-white border border-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                  : 'bg-white/80 text-slate-900 border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
              }`}
              style={{
                fontSize: '16px',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
              whileFocus={prefersReducedMotion ? {} : { 
                scale: 1.01,
                boxShadow: isDark
                  ? '0 0 20px rgba(16, 185, 129, 0.3)'
                  : '0 0 20px rgba(16, 185, 129, 0.2)',
              }}
            />
            <motion.button
              onClick={handleIncrement}
              whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
              className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold transition-all ${
                isDark
                  ? 'bg-slate-700/50 text-white border border-slate-600 hover:bg-slate-600'
                  : 'bg-slate-100 text-slate-900 border border-slate-300 hover:bg-slate-200'
              }`}
              style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              +
            </motion.button>
          </div>
        </div>

        {/* Nisab Calculator Section - Glass Morphism with Info Button */}
        {nisabValue && (
          <motion.div
            className="rounded-xl p-4"
            style={{
              ...glassMorphismBase,
              background: isDark
                ? 'rgba(245, 158, 11, 0.15)'
                : 'rgba(245, 158, 11, 0.1)',
              border: isDark
                ? '1px solid rgba(245, 158, 11, 0.3)'
                : '1px solid rgba(245, 158, 11, 0.2)',
            }}
            variants={prefersReducedMotion ? {} : slideUpVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Nisab Threshold ({metal === 'gold' ? 'Gold' : 'Silver'})
              </span>
              <motion.button
                onClick={() => setShowNisabInfo(!showNisabInfo)}
                whileHover={prefersReducedMotion ? {} : { 
                  rotate: 360,
                  scale: 1.1,
                }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  isDark ? 'text-white/70 hover:text-white bg-white/10' : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                }`}
                style={{
                  transition: 'transform 0.6s ease',
                }}
              >
                ℹ️
              </motion.button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
                  Nisab Value:
                </span>
                <span className={`text-lg font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                  {formatCurrencyValue(nisabValue, currency)}
                </span>
              </div>
              {amountInGrams > 0 && (
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
                    Your Amount:
                  </span>
                  <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {formatCurrencyValue(totalValue || 0, currency)}
                  </span>
                </div>
              )}
              {nisabMet && (
                <motion.div
                  className="mt-2 p-2 rounded-lg text-center"
                  style={{
                    background: isDark
                      ? 'rgba(16, 185, 129, 0.2)'
                      : 'rgba(16, 185, 129, 0.1)',
                  }}
                  variants={prefersReducedMotion ? {} : pulseVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <span className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    ✓ Nisab threshold met!
                  </span>
                </motion.div>
              )}
            </div>
            <AnimatePresence>
              {showNisabInfo && (
                <motion.div
                  className="mt-3 p-3 rounded-lg text-xs"
                  style={{
                    background: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                  }}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className={isDark ? 'text-white/70' : 'text-slate-600'}>
                    Nisab is the minimum amount of wealth that makes Zakat obligatory. For gold, it's
                    approximately 87.48 grams (3 ounces), and for silver, it's approximately 612.36
                    grams (21.5 ounces).
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Total Value Display - Glass Morphism with Gradient */}
        {totalValue !== null && (
          <motion.div
            className="rounded-xl p-6"
            style={{
              ...glassMorphismBase,
              background: isDark
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))'
                : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))',
              border: isDark
                ? '1px solid rgba(16, 185, 129, 0.4)'
                : '1px solid rgba(16, 185, 129, 0.3)',
            }}
            variants={prefersReducedMotion ? {} : slideUpVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="text-center">
              <div className={`text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
                Total Value
              </div>
              <motion.div
                className={`text-4xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
                key={totalValue}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
              >
                {formatCurrencyValue(totalValue, currency)}
              </motion.div>
              <div className={`text-xs mt-2 ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                {amount} {unit} of {metal}
              </div>
            </div>
          </motion.div>
        )}

        {/* Notification Toggle Switch - Glass Morphism */}
        <div className="flex items-center justify-between p-3 rounded-xl" style={glassMorphismBase}>
          <div>
            <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Price Notifications
            </div>
            <div className={`text-xs ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
              Get alerts for price changes (2%+)
            </div>
          </div>
          <motion.button
            onClick={handleToggleNotifications}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              preferences?.notificationsEnabled
                ? 'bg-emerald-500'
                : isDark
                  ? 'bg-slate-600'
                  : 'bg-slate-300'
            }`}
            whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
            style={{
              boxShadow: preferences?.notificationsEnabled
                ? '0 0 20px rgba(16, 185, 129, 0.4)'
                : 'none',
            }}
          >
            <motion.div
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
              animate={{
                x: preferences?.notificationsEnabled ? 26 : 2,
              }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30,
              }}
            />
          </motion.button>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-500"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
