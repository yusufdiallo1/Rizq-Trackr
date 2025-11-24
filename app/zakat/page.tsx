'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { getCurrentUser, User } from '@/lib/auth';
import { getCardVariants, staggerContainerVariants, counterVariants } from '@/lib/animations';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { ZakatTutorial } from '@/components/ZakatTutorial';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { getTextColor, getMutedTextColor, getCardTextColor } from '@/lib/utils';
import {
  calculateZakatDue,
  getAllIncome,
  toggleIncomeZakatable,
  recordZakatPayment,
  getZakatHistory,
  getTotalZakatPaid,
  getZakatYearlyComparison,
  ZakatCalculation,
  ZakatableIncome,
  ZakatPaymentRecord,
  ZakatYearlyComparison,
} from '@/lib/zakat';
import { formatHijriDate, gregorianToHijri } from '@/lib/hijri-calendar';
import { ZakatDashboard } from '@/components/ZakatDashboard';

export default function ZakatPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculation, setCalculation] = useState<ZakatCalculation | null>(null);
  const [incomeEntries, setIncomeEntries] = useState<ZakatableIncome[]>([]);
  const [zakatHistory, setZakatHistory] = useState<ZakatPaymentRecord[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [yearlyComparison, setYearlyComparison] = useState<ZakatYearlyComparison[]>([]);
  const [debts, setDebts] = useState(0);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showIncomeList, setShowIncomeList] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showEducational, setShowEducational] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set([0, 1, 2, 3]));
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  // Removed artificial loading delay - show page immediately

  // Scroll animation observer
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sectionRefs.current.forEach((ref, index) => {
      if (!ref) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleSections((prev) => new Set([...prev, index]));
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '-50px 0px',
        }
      );

      observer.observe(ref);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [loading]);

  const loadData = async () => {
    setLoading(true);

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      // Let middleware enforce auth; don't bounce user away on slow auth.
      setLoading(false);
      return;
    }

    // Show page immediately - don't wait for data
    setLoading(false);
    setUser(currentUser);

    try {
      const [calc, income, history, total] = await Promise.all([
        calculateZakatDue(currentUser.id, debts),
        getAllIncome(currentUser.id),
        getZakatHistory(currentUser.id),
        getTotalZakatPaid(currentUser.id),
      ]);

      setCalculation(calc);
      setIncomeEntries(income);
      setZakatHistory(history);
      setTotalPaid(total);
    } catch (error) {
      console.error('Error loading zakat data:', error);
      setCalculation({
        currentSavings: 0,
        zakatableIncome: 0,
        debts: 0,
        totalZakatableWealth: 0,
        nisabThreshold: 4000,
        zakatDue: 0,
        isAboveNisab: false,
        amountToReachNisab: 4000,
      });
    }
    setLoading(false);
  };

  const handleToggleZakatable = async (incomeId: string, currentStatus: boolean) => {
    if (!user) return;
    const result = await toggleIncomeZakatable(incomeId, user.id, !currentStatus);
    if (result.success) {
      loadData();
    }
  };

  const handleDebtsChange = async (newDebts: number) => {
    if (!user) return;
    setDebts(newDebts);
    const calc = await calculateZakatDue(user.id, newDebts);
    setCalculation(calc);
  };

  const handleOpenPaymentForm = () => {
    if (calculation) {
      setPaymentAmount(calculation.zakatDue.toFixed(2));
    }
    setShowPaymentForm(true);
  };

  const handleRecordPayment = async () => {
    if (!user || !paymentAmount || !paymentDate) return;
    setSubmitting(true);
    const result = await recordZakatPayment(
      user.id,
      parseFloat(paymentAmount),
      paymentDate,
      paymentNotes
    );
    if (result.success) {
      setPaymentSuccess(true);
      await loadData();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('zakat-payment-recorded'));
      }
      setTimeout(() => {
        setShowPaymentForm(false);
        setPaymentAmount('');
        setPaymentNotes('');
        setPaymentSuccess(false);
      }, 2000);
    }
    setSubmitting(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <PageContainer>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className={`${getTextColor(theme)} font-body`}>Loading Zakat calculator...</p>
            </div>
          </div>
        </PageContainer>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div
        className="min-h-screen"
        style={{
          background: theme === 'dark'
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
            : 'linear-gradient(to bottom, #f8fafc, #e2e8f0, #f1f5f9)',
        }}
      >

      {/* Scrollable Content Area - iPhone Native */}
      <div className="relative z-10 pt-4 px-4 space-y-4 pb-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Main Content */}
            <div className="space-y-4 lg:pr-4">
              {/* Page Header - iPhone Native */}
              <motion.div
                className="iphone-summary-card rounded-[32px] overflow-hidden relative"
                variants={prefersReducedMotion ? {} : getCardVariants(0)}
                initial="hidden"
                animate="visible"
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(6, 182, 212, 0.9), rgba(245, 158, 11, 0.9))',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-secondary opacity-90"></div>

                {/* Mosque silhouette watermark */}
                <div className="absolute bottom-0 left-0 right-0 opacity-10">
                  <svg viewBox="0 0 1200 300" className="w-full h-auto">
                    <path d="M0 200 L100 150 L150 200 L200 180 L250 200 L300 160 L350 200 L400 170 L450 200 L500 150 L550 200 L600 140 L650 200 L700 160 L750 200 L800 170 L850 200 L900 150 L950 200 L1000 180 L1050 200 L1100 160 L1150 200 L1200 170 L1200 300 L0 300 Z" fill="currentColor" className="text-white" />
                    <ellipse cx="600" cy="100" rx="60" ry="80" fill="currentColor" className="text-white" />
                    <path d="M560 60 L600 20 L640 60" fill="currentColor" className="text-white" />
                  </svg>
                </div>

                {/* Islamic geometric pattern */}
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '40px 40px'
                  }}
                ></div>

                {/* Glass layer */}
                <div className="relative backdrop-blur-[30px] bg-white/10 border border-white/30 shadow-2xl">
                  <div className="p-12 text-center">
                    {/* Crescent moon icon with glass container */}
                    <div className="flex items-center justify-center mb-6">
                      <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/30 shadow-xl">
                        <svg className="w-14 h-14 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
                        </svg>
                      </div>
                    </div>

                    {/* Title in gold */}
                    <h1 className="text-5xl font-bold mb-3 text-secondary" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                      Zakat Calculator
                    </h1>
                    <p className="text-xl text-white mb-6 font-medium">Calculate your obligatory charity</p>

                    {/* Tutorial Button - iPhone Native */}
                    <motion.button
                      onClick={() => setShowTutorial(true)}
                      className="iphone-button iphone-button-secondary"
                      style={{
                        minHeight: '44px',
                        padding: '0.75rem 1.5rem',
                      }}
                      whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Learn About Zakat & Nisab
                    </motion.button>

                    {/* Islamic quote */}
                    <p className="text-base italic text-white/80 max-w-3xl mx-auto leading-relaxed">
                      &quot;The example of those who spend their wealth in the way of Allah is like a grain of corn that sprouts seven ears, and in every ear there are a hundred grains.&quot; - Quran 2:261
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Zakat Dashboard - Status, Nisab, Date Picker */}
              {user && (
                <div className="my-6">
                  <ZakatDashboard userId={user.id} currency="USD" />
                </div>
              )}

              {/* Vertical Stepper Line */}
              <div 
                className={`flex justify-center transition-all duration-1000 delay-300 ${
                  visibleSections.has(0) 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-5'
                }`}
              >
                <div className="w-1 h-12 bg-gradient-to-b from-emerald-500/50 to-emerald-500 backdrop-blur-sm rounded-full"></div>
              </div>

              {/* Step 1: Zakatable Wealth Card - iPhone Native */}
              <motion.div 
                ref={(el) => { sectionRefs.current[0] = el; }}
                className="rounded-3xl relative w-full lg:max-w-7xl mx-auto"
                variants={prefersReducedMotion ? {} : getCardVariants(1)}
                initial="hidden"
                animate={visibleSections.has(0) ? "visible" : "hidden"}
                style={{
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  background: theme === 'dark' ? 'rgba(42, 45, 61, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                  border: theme === 'dark' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(148, 163, 184, 0.5)',
                  borderRadius: '24px',
                }}
              >
                {/* Decorative glass line at top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary/50 to-transparent"></div>

                <div className="p-6 tablet:p-8 lg:p-12 pl-6 tablet:pl-8 lg:pl-16 w-full">
                  <h2 className={`text-2xl tablet:text-3xl lg:text-4xl font-bold ${getTextColor(theme)} mb-8 tablet:mb-10 lg:mb-12`}>Calculate Your Zakatable Wealth</h2>

                  <motion.div
                    className="space-y-4 mb-8 lg:mb-10"
                    variants={prefersReducedMotion ? {} : staggerContainerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {/* Current Savings - Glass display box */}
                    <motion.div
                      className="p-5 rounded-2xl backdrop-blur-md bg-gradient-to-br from-emerald-100/80 to-teal-100/80 border border-white/40 shadow-lg"
                      variants={prefersReducedMotion ? {} : getCardVariants(0)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-base font-bold ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-900'}`}>Current Savings</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-800 font-medium">Auto</span>
                        </div>
                        <button className={`${theme === 'dark' ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-700 hover:text-emerald-900'} p-1`} title="Auto-calculated from your income and expenses">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold text-emerald-600 font-mono">
                        {calculation ? formatCurrency(calculation.currentSavings) : <span className="animate-pulse text-emerald-400">$0.00</span>}
                      </p>
                    </motion.div>

                    {/* Zakatable Income - Glass container */}
                    <motion.div
                      className="p-5 rounded-2xl backdrop-blur-md bg-gradient-to-br from-blue-100/80 to-cyan-100/80 border border-white/40 shadow-lg"
                      variants={prefersReducedMotion ? {} : getCardVariants(1)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`text-base font-bold ${theme === 'dark' ? 'text-blue-300' : 'text-blue-900'}`}>Zakatable Income</h3>
                      </div>
                      <p className="text-2xl sm:text-3xl font-bold text-blue-600 font-mono mb-4">
                        {calculation ? formatCurrency(calculation.zakatableIncome) : <span className="animate-pulse text-blue-400">$0.00</span>}
                      </p>
                      {/* Glass green button */}
                      <button
                        onClick={() => setShowIncomeList(!showIncomeList)}
                        className={`w-full px-4 py-2.5 bg-white/60 backdrop-blur-md border border-white/50 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-900'} rounded-xl hover:bg-white/80 transition-all font-semibold shadow-md mobile-tap-target`}
                        style={{
                          minHeight: '44px',
                          WebkitTapHighlightColor: 'transparent',
                          touchAction: 'manipulation',
                        }}
                      >
                        {showIncomeList ? 'Hide' : 'Review'} Entries
                      </button>
                    </motion.div>

                    {/* Debts Input - Glass container */}
                    <motion.div
                      className="p-5 rounded-2xl backdrop-blur-md bg-gradient-to-br from-slate-100/80 to-gray-100/80 border border-white/40 shadow-lg"
                      variants={prefersReducedMotion ? {} : getCardVariants(2)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`text-base font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Debts & Liabilities</h3>
                        <button className={`${theme === 'dark' ? 'text-white/70 hover:text-white' : 'text-slate-600 hover:text-slate-900'} p-1`} title="Deductible debts reduce zakatable wealth">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </div>
                      {/* Calculator icon inside glass input */}
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          <span className="text-slate-600 font-bold text-lg">$</span>
                        </div>
                        <input
                          type="number"
                          value={debts || ''}
                          onChange={(e) => handleDebtsChange(Number(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 backdrop-blur-md border border-white/50 focus:border-slate-400 focus:ring-2 focus:ring-slate-300/20 transition-all outline-none font-mono text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'} mobile-input tablet-input`}
                          style={{
                            minHeight: '48px',
                            fontSize: '16px',
                            WebkitTapHighlightColor: 'transparent',
                            touchAction: 'manipulation',
                          }}
                          inputMode="decimal"
                        />
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Income List Modal */}
                  {showIncomeList && (
                    <div className="mb-6 rounded-2xl backdrop-blur-xl bg-white/80 border border-white/40 shadow-xl overflow-hidden">
                      <div className="p-6">
                        <h4 className={`font-bold ${getTextColor(theme)} text-lg mb-4 flex items-center gap-2`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Income Entries
                        </h4>
                        <div className="max-h-80 overflow-y-auto space-y-2">
                          {incomeEntries.map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between p-4 rounded-xl bg-white/60 backdrop-blur-md border border-white/50 hover:bg-white/80 transition-all">
                              <div className="flex-1 flex items-center gap-4">
                                <span className={`text-sm ${getMutedTextColor(theme)}`}>{formatDate(entry.date)}</span>
                                <span className={`text-sm font-bold ${getTextColor(theme)}`}>{entry.category}</span>
                                <span className="text-sm font-mono font-bold text-emerald-600">{formatCurrency(Number(entry.amount))}</span>
                              </div>
                              {/* Glass toggle switch */}
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={entry.is_zakatable}
                                  onChange={() => handleToggleZakatable(entry.id, entry.is_zakatable)}
                                  className="sr-only peer"
                                />
                                <div className="w-12 h-6 bg-white/60 backdrop-blur-md border border-white/50 rounded-full peer peer-checked:bg-emerald-500 peer-checked:border-emerald-600 transition-all peer-focus:ring-4 peer-focus:ring-emerald-300/50 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-white/50 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6 after:shadow-md"></div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Total Zakatable Wealth - Large glass card with gold border glow */}
                  <motion.div
                    className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl backdrop-blur-xl bg-gradient-to-r from-secondary/10 via-amber-50/80 to-secondary/10 border-2 border-secondary/50 shadow-2xl relative overflow-visible"
                    variants={prefersReducedMotion ? {} : { ...getCardVariants(3), ...counterVariants }}
                    initial="hidden"
                    animate="visible"
                  >
                    {/* Gold glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/20 to-transparent animate-pulse"></div>

                    <div className="relative z-10">
                      <h3 className={`text-lg sm:text-xl font-bold ${getTextColor(theme)} mb-3`}>Total Zakatable Wealth</h3>
                      <motion.p
                        className="text-2xl sm:text-4xl font-bold text-secondary font-mono mb-4"
                        style={{ textShadow: '0 2px 8px rgba(245, 158, 11, 0.3)' }}
                        variants={prefersReducedMotion ? {} : counterVariants}
                      >
                        {calculation ? formatCurrency(calculation.totalZakatableWealth) : <span className="animate-pulse">$0.00</span>}
                      </motion.p>
                      {/* Formula breakdown */}
                      <div className="p-3 sm:px-5 sm:py-3 bg-white/60 backdrop-blur-md rounded-xl border border-white/40">
                        <p className={`text-xs sm:text-sm font-medium ${getMutedTextColor(theme)}`}>
                          (Savings + Income) - Debts = <span className="font-mono font-bold text-secondary">{calculation ? formatCurrency(calculation.totalZakatableWealth) : '$0.00'}</span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Connecting Line */}
              <div 
                className={`flex justify-center transition-all duration-1000 delay-300 ${
                  visibleSections.has(1) 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-5'
                }`}
              >
                <div className="w-1 h-12 bg-gradient-to-b from-emerald-500 to-teal-500 backdrop-blur-sm rounded-full shadow-lg"></div>
              </div>

              {/* Step 2: Nisab Threshold Card - iPhone Native */}
              <motion.div 
                ref={(el) => { sectionRefs.current[1] = el; }}
                className="rounded-3xl relative w-full lg:max-w-7xl mx-auto"
                variants={prefersReducedMotion ? {} : getCardVariants(2)}
                initial="hidden"
                animate={visibleSections.has(1) ? "visible" : "hidden"}
                style={{
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  background: theme === 'dark' ? 'rgba(42, 45, 61, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                  border: theme === 'dark' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(148, 163, 184, 0.5)',
                  borderRadius: '24px',
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary/50 to-transparent"></div>

                <div className="p-4 tablet:p-6 lg:p-8 pl-4 tablet:pl-6 lg:pl-12 w-full">
                  <h2 className={`text-2xl tablet:text-3xl font-bold ${getTextColor(theme)} mb-6 tablet:mb-8`}>Check Nisab Threshold</h2>

                  {/* Glass info box with Islamic geometric border (slimmer, centered) */}
                  <div className="p-8 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-secondary/10 via-amber-50/80 to-secondary/10 border-2 border-secondary/40 shadow-xl mb-6 relative overflow-hidden max-w-xl mx-auto">
                    {/* Decorative Islamic pattern */}
                    <div className="absolute top-0 right-0 w-40 h-40 opacity-10">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" fill="currentColor" className="text-secondary"/>
                      </svg>
                    </div>

                    <div className="relative z-10 flex items-start gap-6">
                      {/* Gold bar icon in glass container */}
                      <div className="w-16 h-16 bg-white/40 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/50 shadow-lg flex-shrink-0">
                        <span className="text-3xl">🕌</span>
                      </div>

                      <div className="flex-1">
                        <div className="mb-4">
                          <p className={`text-2xl font-bold ${getTextColor(theme)} mb-1`}>Current Nisab: <span className="text-secondary">{formatCurrency(calculation?.nisabThreshold || 4000)}</span></p>
                          <p className={`text-sm ${getMutedTextColor(theme)}`}>Based on 85g of gold</p>
                        </div>
                        <p className={`text-sm ${getMutedTextColor(theme)} leading-relaxed`}>
                          Zakat is obligatory if your wealth exceeds Nisab and has been held for one lunar year (Hawl)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status badge - Glass */}
                  <div className="flex justify-center">
                    {calculation?.isAboveNisab ? (
                      <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-100/80 backdrop-blur-md border-2 border-green-500 rounded-full shadow-lg">
                        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-bold text-green-700 text-lg">Above Nisab - Zakat Due</span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-100/80 backdrop-blur-md border-2 border-gray-300 rounded-full shadow-lg mb-4">
                          <span className="font-bold text-gray-700 text-lg">Below Nisab</span>
                        </div>
                        {/* Glass progress indicator */}
                        <div className="max-w-md mx-auto">
                          <div className="flex justify-between items-center mb-2">
                            <span className={`text-sm font-medium ${getTextColor(theme)}`}>Current Wealth</span>
                            <span className={`text-sm font-medium ${getTextColor(theme)}`}>Nisab</span>
                          </div>
                          <div className="h-3 bg-white/60 backdrop-blur-md rounded-full overflow-hidden border border-white/50 shadow-inner">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000"
                              style={{ width: `${Math.min((calculation?.totalZakatableWealth || 0) / (calculation?.nisabThreshold || 4000) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <p className={`text-sm text-center mt-3 ${getTextColor(theme)}`}>
                            <span className="font-mono font-bold text-secondary">{formatCurrency(calculation?.amountToReachNisab || 0)}</span> more needed to reach Nisab
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Connecting Line */}
              <div 
                className={`flex justify-center transition-all duration-1000 delay-300 ${
                  visibleSections.has(2) 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-5'
                }`}
              >
                <div className="w-1 h-12 bg-gradient-to-b from-teal-500 to-emerald-600 backdrop-blur-sm rounded-full shadow-lg"></div>
              </div>

              {/* Step 3: Zakat Calculation Card - iPhone Native */}
              <motion.div 
                ref={(el) => { sectionRefs.current[2] = el; }}
                className="rounded-3xl relative w-full lg:max-w-7xl mx-auto"
                variants={prefersReducedMotion ? {} : getCardVariants(3)}
                initial="hidden"
                animate={visibleSections.has(2) ? "visible" : "hidden"}
                style={{
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  background: theme === 'dark' ? 'rgba(42, 45, 61, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                  border: theme === 'dark' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(148, 163, 184, 0.5)',
                  borderRadius: '24px',
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary/50 to-transparent"></div>

                <div className="p-4 tablet:p-6 lg:p-8 pl-4 tablet:pl-6 lg:pl-12 w-full">
                  <h2 className={`text-2xl tablet:text-3xl font-bold ${getTextColor(theme)} mb-6 tablet:mb-8`}>Your Zakat Obligation</h2>

                  {!calculation ? (
                    <div className="p-12 rounded-2xl backdrop-blur-md bg-gray-100/80 border border-white/50 text-center shadow-lg">
                      <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className={`${getTextColor(theme)} font-medium`}>Calculating...</p>
                    </div>
                  ) : calculation.isAboveNisab ? (
                    <div>
                      {/* Large result display - Glass box with emerald to gold gradient border */}
                      <div className="p-10 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-emerald-50/80 to-teal-50/80 border-4 border-emerald-500 mb-8 text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-secondary/10 animate-pulse"></div>

                        <div className="relative z-10">
                          <p className="text-sm font-bold text-emerald-800 mb-2 uppercase tracking-wide">Zakat Due</p>
                          <p className="text-7xl font-bold text-emerald-600 font-mono mb-4" style={{ textShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
                            {formatCurrency(calculation.zakatDue)}
                          </p>
                          <p className={`text-lg ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-900'} font-medium`}>
                            2.5% of {formatCurrency(calculation.totalZakatableWealth)} zakatable wealth
                          </p>
                        </div>
                      </div>

                      {/* Breakdown table - Glass rows */}
                      <div className="rounded-2xl backdrop-blur-md bg-white/60 border border-white/50 overflow-hidden shadow-lg">
                        <div className="p-6">
                          <h3 className="font-bold text-black text-lg mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Calculation Breakdown
                          </h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-white/40 backdrop-blur-sm border-b border-white/50">
                              <span className="text-black font-medium">Total Zakatable Wealth</span>
                              <span className="font-mono font-bold text-black text-lg">{formatCurrency(calculation.totalZakatableWealth)}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-white/40 backdrop-blur-sm border-b border-white/50">
                              <span className="text-black font-medium">Zakat Rate</span>
                              <span className="font-bold text-black text-lg">2.5%</span>
                            </div>
                            <div className="flex justify-between items-center py-4 px-5 rounded-xl bg-gradient-to-r from-emerald-100/80 to-teal-100/80 backdrop-blur-md border-2 border-emerald-500 shadow-md">
                              <span className="font-bold text-black text-lg">Zakat Due</span>
                              <span className="font-mono font-bold text-black text-2xl">{formatCurrency(calculation.zakatDue)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Glass card with encouraging message */
                    <div className="p-12 rounded-2xl backdrop-blur-md bg-gradient-to-br from-gray-100/80 to-slate-100/80 border-2 border-gray-300 text-center shadow-lg">
                      <div className="w-20 h-20 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 border border-white/50 shadow-md">
                        <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className={`text-2xl font-bold ${getTextColor(theme)} mb-3`}>No Zakat obligation at this time</p>
                      <p className={`${getTextColor(theme)} text-lg max-w-md mx-auto`}>Your wealth is below the Nisab threshold. Continue saving to fulfill this important pillar of Islam.</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Step 4: Record Payment (only if zakat is due) - iPhone Native */}
              {calculation?.isAboveNisab && (
                <>
                  {/* Connecting Line */}
                  <div 
                    className={`flex justify-center transition-all duration-1000 delay-300 ${
                      visibleSections.has(3) 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 translate-y-5'
                    }`}
                  >
                    <div className="w-1 h-12 bg-gradient-to-b from-emerald-600 to-teal-600 backdrop-blur-sm rounded-full shadow-lg"></div>
                  </div>

                  <motion.div 
                    ref={(el) => { sectionRefs.current[3] = el; }}
                    className="rounded-3xl relative w-full lg:max-w-7xl mx-auto"
                    variants={prefersReducedMotion ? {} : getCardVariants(4)}
                    initial="hidden"
                    animate={visibleSections.has(3) ? "visible" : "hidden"}
                    style={{
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      background: theme === 'dark' ? 'rgba(42, 45, 61, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                      border: theme === 'dark' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(148, 163, 184, 0.5)',
                      borderRadius: '24px',
                    }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary/50 to-transparent"></div>
                    <div className="p-4 tablet:p-6 lg:p-8 pl-4 tablet:pl-6 lg:pl-12 w-full">
                      <h2 className={`text-2xl tablet:text-3xl font-bold ${getTextColor(theme)} mb-6 tablet:mb-8`}>Record Payment</h2>

                      {paymentSuccess ? (
                        /* Success state with confetti overlay effect */
                        <div className="p-12 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-green-100/90 to-emerald-100/90 border-3 border-green-500 text-center shadow-2xl relative overflow-hidden">
                          {/* Confetti effect */}
                          <div className="absolute inset-0">
                            {[...Array(20)].map((_, i) => (
                              <div
                                key={i}
                                className="absolute w-2 h-2 bg-secondary rounded-full animate-ping"
                                style={{
                                  left: `${Math.random() * 100}%`,
                                  top: `${Math.random() * 100}%`,
                                  animationDelay: `${Math.random() * 0.5}s`,
                                  animationDuration: `${1 + Math.random()}s`
                                }}
                              ></div>
                            ))}
                          </div>

                          <div className="relative z-10">
                            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce shadow-2xl">
                              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <p className="text-3xl font-bold text-green-700 mb-3">Jazakallah Khair!</p>
                            <p className="text-xl text-green-600 font-medium">Payment recorded successfully</p>
                          </div>
                        </div>
                      ) : !showPaymentForm ? (
                        <div className="text-center">
                          {/* Large glass button with emerald to gold gradient */}
                          <button
                            onClick={handleOpenPaymentForm}
                            className="px-12 py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold text-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center gap-3 shadow-xl"
                          >
                            {/* Hand giving icon */}
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Record Payment
                          </button>
                        </div>
                      ) : (
                        /* Glass form container */
                        <div className="p-8 rounded-2xl backdrop-blur-md bg-white/60 border border-white/50 shadow-xl">
                          <form onSubmit={(e) => { e.preventDefault(); handleRecordPayment(); }} className="space-y-6">
                            {/* Amount - Glass input */}
                            <div>
                              <label className={`block text-sm font-bold ${getTextColor(theme)} mb-2`}>Amount Paid *</label>
                              <div className="relative">
                                <span className={`absolute left-5 top-1/2 -translate-y-1/2 ${getTextColor(theme)} font-bold text-lg`}>$</span>
                                <input
                                  type="number"
                                  value={paymentAmount}
                                  onChange={(e) => setPaymentAmount(e.target.value)}
                                  min="0"
                                  step="0.01"
                                  required
                                  className={`w-full pl-12 pr-4 py-4 rounded-xl bg-white/60 backdrop-blur-md border-2 border-white/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/50 transition-all outline-none font-mono text-xl ${theme === 'dark' ? 'text-white' : 'text-charcoal-dark'} shadow-inner`}
                                />
                              </div>
                            </div>

                            {/* Date picker - Glass calendar */}
                            <div>
                              <label className="block text-sm font-bold text-charcoal-dark mb-2">Payment Date *</label>
                              <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal">
                                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <input
                                  type="date"
                                  value={paymentDate}
                                  onChange={(e) => setPaymentDate(e.target.value)}
                                  required
                                  className={`w-full pl-14 pr-4 py-4 rounded-xl bg-white/60 backdrop-blur-md border-2 border-white/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/50 transition-all outline-none ${theme === 'dark' ? 'text-white' : 'text-charcoal-dark'} shadow-inner`}
                                />
                              </div>
                            </div>

                            {/* Notes */}
                            <div>
                              <label className={`block text-sm font-bold ${getTextColor(theme)} mb-2`}>Notes (Optional)</label>
                              <textarea
                                value={paymentNotes}
                                onChange={(e) => setPaymentNotes(e.target.value)}
                                rows={4}
                                placeholder="E.g., Paid to local masjid, distributed to poor families..."
                                className={`w-full px-4 py-4 rounded-xl bg-white/60 backdrop-blur-md border-2 border-white/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/50 transition-all outline-none resize-none ${theme === 'dark' ? 'text-white' : 'text-charcoal-dark'} shadow-inner`}
                              />
                            </div>

                            <div className="flex gap-4 pt-4">
                              <button
                                type="button"
                                onClick={() => setShowPaymentForm(false)}
                                className={`flex-1 px-6 py-4 bg-white/60 backdrop-blur-md border-2 border-white/50 ${theme === 'dark' ? 'text-white' : 'text-charcoal-dark'} font-bold rounded-xl hover:bg-white/80 transition-all shadow-md`}
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                              >
                                {submitting ? 'Recording...' : 'Record Payment'}
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </>
              )}

              {/* Payment History Table - iPhone Native */}
              <motion.div 
                className="rounded-3xl relative overflow-hidden mt-4 mb-4"
                variants={prefersReducedMotion ? {} : getCardVariants(5)}
                initial="hidden"
                animate="visible"
                style={{
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  background: theme === 'dark' ? 'rgba(42, 45, 61, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                  border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(15, 23, 42, 0.06)',
                  borderRadius: '24px',
                }}
              >
                {/* Mosque icon decorations */}
                <div className="absolute top-6 right-6 opacity-5">
                  <svg className="w-24 h-24 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  </svg>
                </div>

                <div className="p-8">
                  <h2 className={`text-3xl font-bold ${getTextColor(theme)} mb-8`}>Zakat Payment History</h2>

                  {zakatHistory.length > 0 ? (
                    <div>
                      {/* Semi-transparent rows */}
                      <div className="rounded-2xl backdrop-blur-md bg-white/40 border border-white/50 overflow-hidden shadow-lg mb-6">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-white/40 backdrop-blur-sm border-b-2 border-white/50">
                              <th className={`text-left py-4 px-6 text-sm font-bold ${getTextColor(theme)} uppercase tracking-wide`}>Date Paid</th>
                              <th className={`text-right py-4 px-6 text-sm font-bold ${getTextColor(theme)} uppercase tracking-wide`}>Amount</th>
                              <th className={`text-left py-4 px-6 text-sm font-bold ${getTextColor(theme)} uppercase tracking-wide`}>Notes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/30">
                            {zakatHistory.map((payment) => {
                              const hijri = payment.paid_date_hijri 
                                ? gregorianToHijri(new Date(payment.paid_date))
                                : null;
                              return (
                              <tr key={payment.id} className="hover:bg-white/30 transition-colors">
                                  <td className="py-4 px-6">
                                    <div className="flex flex-col">
                                      <span className={`text-sm ${getTextColor(theme)} font-medium`}>{formatDate(payment.paid_date)}</span>
                                      {hijri && (
                                        <span className="text-xs text-amber-600 font-semibold mt-1">
                                          {formatHijriDate(hijri)}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                <td className="py-4 px-6 text-right font-mono font-bold text-emerald-600 text-lg">{formatCurrency(Number(payment.amount))}</td>
                                <td className={`py-4 px-6 text-sm ${getTextColor(theme)}`}>{payment.notes || '-'}</td>
                              </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Total row - Gold gradient background with glass */}
                      <div className="p-8 rounded-2xl backdrop-blur-xl bg-gradient-to-r from-secondary/20 via-amber-100/80 to-secondary/20 border-3 border-secondary/50 text-center shadow-xl relative overflow-hidden mb-6">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/10 to-transparent animate-pulse"></div>

                        <div className="relative z-10">
                          <p className={`text-sm font-bold ${getTextColor(theme)} mb-2 uppercase tracking-wide`}>Total Zakat Paid (All Time)</p>
                          <p className="text-5xl font-bold text-secondary font-mono" style={{ textShadow: '0 4px 12px rgba(245, 158, 11, 0.4)' }}>
                            {formatCurrency(totalPaid)}
                          </p>
                        </div>
                      </div>

                      {/* Yearly Comparison Chart - Commented out until chart library is added */}
                      {yearlyComparison.length > 0 && (
                        <div className="rounded-2xl backdrop-blur-md bg-white/50 border border-white/50 overflow-hidden shadow-lg p-6">
                          <h3 className={`text-xl font-bold ${getTextColor(theme)} mb-6`}>Yearly Comparison: Nisab vs Savings</h3>
                          <div className={`text-center py-8 ${getTextColor(theme)}`}>
                            <p>Chart visualization coming soon</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-16 rounded-2xl backdrop-blur-md bg-white/40 border border-white/50">
                      <div className="w-20 h-20 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 border border-white/50 shadow-md">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className={`${getTextColor(theme)} text-lg font-medium`}>No payments recorded yet</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Educational Sidebar - Glass card (sticky on desktop) */}
            <div className="pl-0 lg:pl-4 mt-4 lg:mt-0" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 120px)' }}>
              <div className="lg:sticky lg:top-24">
                <div 
                  className="rounded-3xl overflow-hidden relative"
                  style={{
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    background: theme === 'dark' ? 'rgba(42, 45, 61, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                    border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(15, 23, 42, 0.06)',
                  }}
                >
                  {/* Islamic pattern background (very subtle) */}
                  <div className="absolute inset-0 opacity-5">
                    <div style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f59e0b' fill-opacity='1'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h18v-2h-18v2h18v-2h-18v2h18v-2h-18v2h18v-2h-18v2h18v-2H20zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2z'/%3E%3C/g%3E%3C/svg%3E")`,
                      backgroundSize: '30px 30px'
                    }}></div>
                  </div>

                  <div className="relative z-10 p-8">
                    {/* Title with gold underline */}
                    <h2 className={`text-2xl font-bold ${getTextColor(theme)} mb-2`}>Understanding Zakat</h2>
                    <div className="w-16 h-1 bg-gradient-to-r from-secondary to-transparent rounded-full mb-4"></div>

                    {/* Tutorial Button */}
                    <button
                      onClick={() => setShowTutorial(true)}
                      className="w-full mb-6 px-4 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105 mobile-tap-target"
                      style={{
                        background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                        boxShadow: '0 4px 16px rgba(6, 182, 212, 0.4)',
                        minHeight: '44px',
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'manipulation',
                      }}
                    >
                      📚 Start 8-Page Tutorial
                    </button>

                    {/* Accordion sections - Glass expandable panels */}
                    <div className="space-y-4">
                      {/* Section 1 */}
                      <div className="rounded-2xl backdrop-blur-md bg-white/50 border border-white/50 overflow-hidden shadow-md">
                        <div className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Icon in glass circle with gold tint */}
                            <div className="w-12 h-12 bg-secondary/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-secondary/30 flex-shrink-0">
                              <span className="text-2xl">📊</span>
                            </div>
                            <div>
                              <h3 className="font-bold text-charcoal-dark mb-2">What is Nisab?</h3>
                              {/* Glass text box */}
                              <p className="text-sm text-charcoal leading-relaxed">
                                The minimum wealth threshold (approximately 85g of gold or 595g of silver). Zakat is only due if your wealth exceeds Nisab for one lunar year.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Gold accent line as divider */}
                      <div className="h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent my-4"></div>

                      {/* Section 2 */}
                      <div className="rounded-2xl backdrop-blur-md bg-white/50 border border-white/50 overflow-hidden shadow-md">
                        <div className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-secondary/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-secondary/30 flex-shrink-0">
                              <span className="text-2xl">💰</span>
                            </div>
                            <div>
                              <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'} mb-2`}>What is Zakatable?</h3>
                              <p className={`text-sm ${theme === 'dark' ? 'text-white/80' : 'text-slate-600'} leading-relaxed`}>
                                Cash, savings, gold, silver, business inventory, stocks, and investment income that has been in your possession for one lunar year.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent my-4"></div>

                      {/* Section 3 */}
                      <div className="rounded-2xl backdrop-blur-md bg-white/50 border border-white/50 overflow-hidden shadow-md">
                        <div className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-secondary/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-secondary/30 flex-shrink-0">
                              <span className="text-2xl">🚫</span>
                            </div>
                            <div>
                              <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'} mb-2`}>What to Exclude?</h3>
                              <p className={`text-sm ${theme === 'dark' ? 'text-white/80' : 'text-slate-600'} leading-relaxed`}>
                                Primary residence, personal vehicle, work tools, household items, and debts owed to you.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent my-4"></div>

                      {/* Section 4 */}
                      <div className="rounded-2xl backdrop-blur-md bg-white/50 border border-white/50 overflow-hidden shadow-md">
                        <div className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-secondary/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-secondary/30 flex-shrink-0">
                              <span className="text-2xl">📅</span>
                            </div>
                            <div>
                              <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'} mb-2`}>When to Pay?</h3>
                              <p className={`text-sm ${theme === 'dark' ? 'text-white/80' : 'text-slate-600'} leading-relaxed`}>
                                Zakat is due annually, typically during Ramadan, once your wealth has exceeded Nisab for one complete lunar year (Hawl).
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Zakat Tutorial */}
        <ZakatTutorial
          isOpen={showTutorial}
          onClose={() => setShowTutorial(false)}
        />
      </div>
    </DashboardLayout>
  );
}
