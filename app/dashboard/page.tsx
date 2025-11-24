'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, User } from '@/lib/auth';
import { 
  getDashboardData, 
  DashboardData,
  getLast6MonthsData,
  getExpenseBreakdown,
  getRecentTransactions,
  getPreviousMonthData,
} from '@/lib/database';
import { calculateZakatEligibility, ZakatEligibilityResult } from '@/lib/zakat';
import { formatHijriDate } from '@/lib/hijri-calendar';
import { DashboardLayout } from '@/components/layout';
import { PageContainer } from '@/components/layout';
import { Card } from '@/components/layout';
import LoadingScreen from '@/components/LoadingScreen';
import { formatDate, getTimeBasedGreeting, getIslamicDate } from '@/lib/utils/dateUtils';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { getTextColor, getMutedTextColor, getCardTextColor } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { getCardVariants, chartVariants, staggerContainerVariants, getListItemVariants } from '@/lib/animations';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const COLORS = {
  income: '#2563eb', // Professional blue
  expense: '#dc2626', // Professional red
  savings: '#059669', // Professional green
  zakat: '#7c3aed', // Professional purple
};

const EXPENSE_COLORS = [
  '#10b981', // Green
  '#14b8a6', // Teal
  '#f59e0b', // Gold
  '#10b981', // Green (repeat)
  '#14b8a6', // Teal (repeat)
  '#f59e0b', // Gold (repeat)
  '#10b981', // Green (repeat)
  '#14b8a6', // Teal (repeat)
];

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const [user, setUser] = useState<User | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [previousMonth, setPreviousMonth] = useState({ income: 0, expenses: 0 });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [zakatEligibility, setZakatEligibility] = useState<ZakatEligibilityResult | null>(null);

  const loadData = useCallback(async () => {
    try {
      // Always wait for Supabase to return the current user.
      // The previous implementation used Promise.race with a short timeout,
      // which could incorrectly treat a valid session as "unauthenticated"
      // on slow networks and bounce users back to /login in a loop.
      const currentUser = await getCurrentUser();

      if (!currentUser) {
        router.push('/login');
        return;
      }

      setUser(currentUser);

      // Set default data immediately for instant display
      setDashboardData({
        currentMonthIncome: 0,
        currentMonthExpenses: 0,
        currentSavings: 0,
        zakatOwed: 0
      });

      // Show page immediately - don't wait for data
      setLoading(false);

      // Load ALL data in parallel for maximum speed - no waterfall loading
      Promise.all([
        getDashboardData(currentUser.id).catch(() => ({
            currentMonthIncome: 0,
            currentMonthExpenses: 0,
            currentSavings: 0,
            zakatOwed: 0
        })),
        getRecentTransactions(currentUser.id, 5).catch(() => []),
        getLast6MonthsData(currentUser.id).catch(() => []),
        getExpenseBreakdown(currentUser.id).catch(() => []),
        getPreviousMonthData(currentUser.id).catch(() => ({ income: 0, expenses: 0 })),
        calculateZakatEligibility(currentUser.id, 'USD').catch(() => null),
      ]).then(([dashboard, transactions, monthly, breakdown, prevMonth, zakat]: any) => {
        setDashboardData(dashboard);
        setRecentTransactions(transactions || []);
        setMonthlyData(monthly || []);
        setExpenseBreakdown(breakdown || []);
        setPreviousMonth(prevMonth || { income: 0, expenses: 0 });
        if (zakat) setZakatEligibility(zakat);
      }).catch(() => {
        // Silently fail - data will update when it's ready
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();

    // Update date daily
    const updateDate = () => {
      setCurrentDate(new Date());
    };
    
    // Update immediately
    updateDate();
    
    // Update every minute to catch day changes
    const dateInterval = setInterval(updateDate, 60000);

    // Listen for data update events to refresh dashboard
    const handleDataUpdate = () => {
      loadData();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('zakat-payment-recorded', handleDataUpdate);
      window.addEventListener('income-added', handleDataUpdate);
      window.addEventListener('expense-added', handleDataUpdate);
      return () => {
        clearInterval(dateInterval);
        window.removeEventListener('zakat-payment-recorded', handleDataUpdate);
        window.removeEventListener('income-added', handleDataUpdate);
        window.removeEventListener('expense-added', handleDataUpdate);
      };
    }
  }, [loadData]);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }, []);

  const calculatePercentageChange = useCallback((current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }, []);

  const incomeChange = useMemo(() => calculatePercentageChange(
    dashboardData?.currentMonthIncome || 0,
    previousMonth.income
  ), [dashboardData?.currentMonthIncome, previousMonth.income, calculatePercentageChange]);

  const expenseChange = useMemo(() => calculatePercentageChange(
    dashboardData?.currentMonthExpenses || 0,
    previousMonth.expenses
  ), [dashboardData?.currentMonthExpenses, previousMonth.expenses, calculatePercentageChange]);

  const savingsChange = useMemo(() => {
    if (!dashboardData) return 0;
    // Calculate change from previous month savings (income - expenses)
    const currentSavings = dashboardData.currentSavings;
    const previousSavings = (previousMonth.income - previousMonth.expenses);
    return currentSavings - previousSavings;
  }, [dashboardData, previousMonth]);

  const userName = useMemo(() => user?.email?.split('@')[0] || 'User', [user?.email]);
  const isDark = theme === 'dark';

  // Label renderer for pie chart - using useMemo to avoid parsing issues
  const renderPieChartLabel = useMemo(() => {
    const PieChartLabel = (props: any) => {
      const { cx, cy, midAngle, innerRadius, outerRadius, percent, payload } = props;
      if (percent < 0.05) return null;
      
      const RADIAN = Math.PI / 180;
      const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);
      const isDark = theme === 'dark';
      const cardColor = isDark ? '#ffffff' : '#000000';
      const textColor = isDark ? '#000000' : '#ffffff';
      const amountText = formatCurrency(payload.amount);
      
      return React.createElement('g', null,
        React.createElement('rect', {
          x: x - 75,
          y: y - 25,
          width: 150,
          height: 50,
          rx: 12,
          fill: cardColor,
          opacity: 0.95
        }),
        React.createElement('text', {
          x: x,
          y: y - 8,
          fill: textColor,
          textAnchor: x > cx ? 'start' : 'end',
          dominantBaseline: 'central',
          fontSize: 14,
          fontWeight: 'bold'
        }, payload.category),
        React.createElement('text', {
          x: x,
          y: y + 12,
          fill: textColor,
          textAnchor: x > cx ? 'start' : 'end',
          dominantBaseline: 'central',
          fontSize: 16,
          fontWeight: 'bold'
        }, amountText)
      );
    };
    PieChartLabel.displayName = 'PieChartLabel';
    return PieChartLabel;
  }, [theme, formatCurrency]);

  // Custom tooltip for expense breakdown pie chart
  const renderExpenseTooltip = React.useCallback(
    ({ active, payload }: any) => {
      if (!active || !payload || !payload.length) return null;
      const dataPoint = payload[0];
      const category = dataPoint?.payload?.category ?? '';
      const value = typeof dataPoint?.value === 'number' ? dataPoint.value : 0;

      return (
        <div
          className="rounded-xl px-3 py-2 shadow-xl"
          style={{
            zIndex: 20,
            pointerEvents: 'none',
            backdropFilter: 'blur(10px)',
            backgroundColor:
              theme === 'light'
                ? 'rgba(255, 255, 255, 0.98)'
                : 'rgba(15, 23, 42, 0.98)',
            border:
              theme === 'light'
                ? '1px solid rgba(0, 0, 0, 0.1)'
                : '1px solid rgba(148, 163, 184, 0.6)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.35)',
            color: theme === 'light' ? '#0f172a' : '#f9fafb',
            minWidth: '160px',
          }}
        >
          <div
            style={{
              fontSize: 12,
              opacity: 0.8,
              marginBottom: 2,
            }}
          >
            {category}
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {formatCurrency(value)}
          </div>
        </div>
      );
    },
    [theme, formatCurrency]
  );

  return (
    <DashboardLayout user={user}>
      {/* Glass Morphism Background - Desktop Only */}
      <div className="hidden lg:block fixed inset-0 -z-10 pointer-events-none" style={{ willChange: 'auto' }}>
        <div 
          className="absolute inset-0"
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
              : 'linear-gradient(to bottom, #f8fafc, #e2e8f0, #f1f5f9)',
          }}
        />
        <div 
          className="absolute inset-0"
          style={{
            background: theme === 'dark'
              ? 'rgba(0, 0, 0, 0.2)'
              : 'rgba(255, 255, 255, 0.3)',
          }}
        />
      </div>

      {/* Mobile Dashboard (0-640px) */}
      <div className="md:hidden min-h-screen relative overflow-hidden" style={{
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, #1a1d2e 0%, #1e2139 100%)'
          : 'linear-gradient(to bottom, #f8fafc, #e2e8f0)',
      }}>
        {/* Floating Bubbles - Apple App Store 2.0 Style */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Large emerald bubble */}
            <div
            className="floating-bubble-slow absolute w-72 h-72 rounded-full opacity-20"
              style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(16, 185, 129, 0.4), transparent 70%)',
              top: '-5%',
              right: '-15%',
              filter: 'blur(40px)',
            }}
          />
          {/* Medium cyan bubble */}
          <div
            className="floating-bubble-medium absolute w-48 h-48 rounded-full opacity-25"
            style={{
              background: 'radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.5), transparent 70%)',
              top: '35%',
              left: '-10%',
              filter: 'blur(30px)',
            }}
          />
          {/* Small gold bubble */}
          <div
            className="floating-bubble-fast absolute w-32 h-32 rounded-full opacity-30"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.4), transparent 70%)',
              bottom: '20%',
              right: '5%',
              filter: 'blur(25px)',
            }}
          />
          {/* Extra small purple bubble */}
          <div
            className="floating-bubble-slow absolute w-24 h-24 rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.5), transparent 70%)',
              bottom: '40%',
              left: '10%',
              filter: 'blur(20px)',
              }}
          />
        </div>

        <div className="relative z-10 pt-4 px-4 space-y-4 pb-6">
          {/* Account Summary Card - iPhone Native Gradient */}
          <motion.div
            variants={prefersReducedMotion ? {} : getCardVariants(0)}
            initial="hidden"
            animate="visible"
            className="iphone-summary-card"
          >
            <div className="relative z-10">
              <div className="iphone-summary-greeting">
                {t('dashboard.welcome')}, {userName}
            </div>
              <div className="iphone-summary-date">
                {formatDate(currentDate)} • {getIslamicDate(currentDate)}
            </div>
              <div className="iphone-summary-balance">
                {formatCurrency(dashboardData?.currentSavings || 0)}
              </div>
              <div className="iphone-summary-label">Savings</div>
              {savingsChange !== 0 && (
                <div className="iphone-summary-trend">
                  {savingsChange >= 0 ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {savingsChange >= 0 ? '+' : ''}{formatCurrency(Math.abs(savingsChange))} this month
                </div>
              )}
            </div>
          </motion.div>

          {/* Metric Cards - Horizontal Scrollable Carousel (iPhone Native) */}
          <motion.div
            variants={prefersReducedMotion ? {} : getCardVariants(1)}
            initial="hidden"
            animate="visible"
            className="iphone-metrics-carousel"
          >
            {/* Monthly Income Card */}
            <div className={`iphone-metric-card ${isDark ? 'iphone-metric-card-dark' : 'iphone-metric-card-light'}`}>
              <div className="iphone-metric-header">
                <div className={`iphone-metric-icon iphone-metric-icon-income`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
                </div>
                <div className="iphone-metric-label">{t('dashboard.monthlyIncome')}</div>
              </div>
              <div className="iphone-metric-footer">
                <div className={`iphone-metric-amount ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(dashboardData?.currentMonthIncome || 0)}
                </div>
                {incomeChange !== 0 && (
                  <div className={`iphone-metric-trend ${incomeChange >= 0 ? 'iphone-metric-trend-up' : 'iphone-metric-trend-down'}`}>
                    {incomeChange >= 0 ? '↑' : '↓'} {Math.abs(incomeChange)}%
                  </div>
                )}
              </div>
          </div>

            {/* Monthly Expenses Card */}
            <div className={`iphone-metric-card ${isDark ? 'iphone-metric-card-dark' : 'iphone-metric-card-light'}`}>
              <div className="iphone-metric-header">
                <div className={`iphone-metric-icon iphone-metric-icon-expense`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 17h8m0 0V9m0 8l-8-8-4 4-6 6" />
                  </svg>
                </div>
                <div className="iphone-metric-label">{t('dashboard.monthlyExpenses')}</div>
              </div>
              <div className="iphone-metric-footer">
                <div className={`iphone-metric-amount ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(dashboardData?.currentMonthExpenses || 0)}
                </div>
                {expenseChange !== 0 && (
                  <div className={`iphone-metric-trend ${expenseChange >= 0 ? 'iphone-metric-trend-down' : 'iphone-metric-trend-up'}`}>
                    {expenseChange >= 0 ? '↑' : '↓'} {Math.abs(expenseChange)}%
                  </div>
                )}
              </div>
            </div>

            {/* Account Balance Card */}
            <div className={`iphone-metric-card ${isDark ? 'iphone-metric-card-dark' : 'iphone-metric-card-light'}`}>
              <div className="iphone-metric-header">
                <div className={`iphone-metric-icon iphone-metric-icon-balance`}>
                  <span className="text-xl">💰</span>
                </div>
                <div className="iphone-metric-label">Account Balance</div>
              </div>
              <div className="iphone-metric-footer">
                <div className={`iphone-metric-amount ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(dashboardData?.currentSavings || 0)}
                </div>
              </div>
            </div>

            {/* Zakat Status Card */}
            <div className={`iphone-metric-card ${isDark ? 'iphone-metric-card-dark' : 'iphone-metric-card-light'}`}>
              <div className="iphone-metric-header">
                <div className={`iphone-metric-icon iphone-metric-icon-zakat`}>
                  <span className="text-xl">🕌</span>
                </div>
                <div className="iphone-metric-label">Zakat Status</div>
              </div>
              <div className="iphone-metric-footer">
                <div className={`iphone-metric-amount ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {dashboardData && dashboardData.currentSavings >= 4000
                    ? formatCurrency(dashboardData.zakatOwed)
                    : '$0.00'}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions - 3-Button Grid (iPhone Native) */}
          <motion.div
            variants={prefersReducedMotion ? {} : getCardVariants(2)}
            initial="hidden"
            animate="visible"
            className="iphone-quick-actions"
          >
            <Link
              href="/income?action=add"
              className={`iphone-action-button ${isDark ? 'iphone-action-button-dark' : 'iphone-action-button-light'}`}
            >
              <div className="iphone-action-icon iphone-action-icon-income">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
              </div>
              <span className={`iphone-action-label ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Add Income
              </span>
            </Link>
            <Link
              href="/expenses?action=add"
              className={`iphone-action-button ${isDark ? 'iphone-action-button-dark' : 'iphone-action-button-light'}`}
            >
              <div className="iphone-action-icon iphone-action-icon-expense">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              </div>
              <span className={`iphone-action-label ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Add Expense
              </span>
            </Link>
            <Link
              href="/zakat"
              className={`iphone-action-button ${isDark ? 'iphone-action-button-dark' : 'iphone-action-button-light'}`}
            >
              <div className="iphone-action-icon iphone-action-icon-zakat">
                <span className="text-2xl">🕌</span>
          </div>
              <span className={`iphone-action-label ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Calculate Zakat
              </span>
            </Link>
          </motion.div>

          {/* Recent Transactions - iPhone Native Style */}
          <motion.div
            variants={prefersReducedMotion ? {} : getCardVariants(3)}
            initial="hidden"
            animate="visible"
          >
            <div className="iphone-section-header">
              <h2 className={`iphone-section-title ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t('dashboard.recentTransactions')}
            </h2>
              <Link href="/transactions" className="iphone-section-link">
                {t('common.viewAll')}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            {recentTransactions.length > 0 ? (
              <div className="iphone-transactions-list">
                {recentTransactions.map((transaction, index) => (
                  <Link
                    key={transaction.id}
                    href={`/transactions?id=${transaction.id}`}
                    className={`iphone-transaction-item ${isDark ? 'iphone-transaction-item-dark' : 'iphone-transaction-item-light'}`}
                  >
                    <div className={`iphone-transaction-icon ${transaction.type === 'income' ? 'iphone-transaction-icon-income' : 'iphone-transaction-icon-expense'}`}>
                      {transaction.type === 'income' ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M13 17h8m0 0V9m0 8l-8-8-4 4-6 6" />
                        </svg>
                      )}
            </div>
                    <div className="iphone-transaction-details">
                      <div className={`iphone-transaction-category ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {transaction.category || transaction.description || 'Transaction'}
              </div>
                      <div className="iphone-transaction-date">
                        {transaction.date ? new Date(transaction.date).toLocaleDateString() : ''}
                      </div>
                    </div>
                    <div className={`iphone-transaction-amount ${transaction.type === 'income' ? 'iphone-transaction-amount-income' : 'iphone-transaction-amount-expense'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount || 0))}
                    </div>
                    <svg className="iphone-transaction-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 5l7 7-7 7" />
                  </svg>
                  </Link>
                ))}
                </div>
            ) : (
              <div className="iphone-empty-state">
                <div className="iphone-empty-icon">📊</div>
                <div className={`iphone-empty-title ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  No recent transactions
                </div>
                <div className="iphone-empty-description">
                  Start tracking your finances by adding income or expenses
                </div>
              </div>
            )}
          </motion.div>
            </div>
          </div>

      {/* Tablet Dashboard (641px-1024px) */}
      <div className="hidden md:block lg:hidden min-h-screen relative overflow-hidden" style={{
        background: theme === 'dark'
          ? 'linear-gradient(135deg, #1a1d2e 0%, #1e2139 100%)'
          : 'linear-gradient(to bottom, #f8fafc, #e2e8f0)',
      }}>
        {/* Floating Bubbles - Apple App Store 2.0 Style for Tablet */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Large emerald bubble - top right */}
            <div
            className="floating-bubble-slow absolute w-96 h-96 rounded-full opacity-15"
              style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(16, 185, 129, 0.5), transparent 70%)',
              top: '-10%',
              right: '-5%',
              filter: 'blur(60px)',
            }}
          />
          {/* Large cyan bubble - left */}
          <div
            className="floating-bubble-medium absolute w-72 h-72 rounded-full opacity-20"
              style={{
              background: 'radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.4), transparent 70%)',
              top: '25%',
              left: '-8%',
              filter: 'blur(50px)',
              }}
                      />
          {/* Gold bubble - bottom right */}
                      <div
            className="floating-bubble-fast absolute w-56 h-56 rounded-full opacity-25"
                        style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.4), transparent 70%)',
              bottom: '15%',
              right: '10%',
              filter: 'blur(40px)',
            }}
          />
          {/* Purple bubble - bottom left */}
          <div
            className="floating-bubble-slow absolute w-40 h-40 rounded-full opacity-15"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.5), transparent 70%)',
              bottom: '30%',
              left: '15%',
              filter: 'blur(35px)',
                        }}
                      />
          </div>

        <PageContainer maxWidth="2xl">
          <div className="relative z-10 pt-8 pb-6 px-4">
            {/* Welcome Section */}
                <div
              className="rounded-3xl p-8 mb-8 relative overflow-hidden"
                  style={{
                backdropFilter: 'blur(20px)',
                background: theme === 'dark' 
                  ? 'rgba(42, 45, 61, 0.95)'
                  : 'rgba(255, 255, 255, 0.95)',
                border: theme === 'dark' 
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                  }}
                >
              <div className="absolute right-8 top-8 opacity-15">
                <span className="text-9xl">🕌</span>
                  </div>
              <div className="relative z-10">
                <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {t('dashboard.welcome')}, {userName}
              </h1>
                <div className={`flex items-center gap-4 ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>
                  <span className="text-sm font-medium">{formatDate(currentDate)}</span>
                  <span>•</span>
                  <span className="text-sm font-medium">{getIslamicDate(currentDate)}</span>
                </div>
              </div>
            </div>

            {/* Metric Cards - 2x2 Grid on Tablet */}
            <motion.div
              className="grid grid-cols-2 gap-6 mb-8"
              variants={prefersReducedMotion ? {} : staggerContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Monthly Income Card */}
              <motion.div variants={prefersReducedMotion ? {} : getCardVariants(0)}>
                <div
                  className="rounded-3xl p-6"
                  style={{
                    backdropFilter: 'blur(20px)',
                    background: theme === 'dark'
                      ? 'rgba(42, 45, 61, 0.95)'
                      : 'rgba(255, 255, 255, 0.95)',
                    border: theme === 'dark'
                      ? '1px solid rgba(16, 185, 129, 0.3)'
                      : '1px solid rgba(16, 185, 129, 0.2)',
                    boxShadow: '0 4px 20px rgba(16, 185, 129, 0.2)',
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
                      <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                    {incomeChange !== 0 && (
                      <div className="flex items-center gap-1">
                        {incomeChange >= 0 ? (
                          <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className={`text-sm font-medium ${incomeChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {Math.abs(incomeChange)}%
                </span>
            </div>
                    )}
          </div>
                  <p className={`text-xs font-medium ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'} uppercase tracking-wide mb-2`}>
                    {t('dashboard.monthlyIncome')}
                  </p>
                  <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {formatCurrency(dashboardData?.currentMonthIncome || 0)}
                  </p>
                </div>
              </motion.div>

              {/* Monthly Expenses Card */}
              <motion.div variants={prefersReducedMotion ? {} : getCardVariants(1)}>
          <div
                  className="rounded-3xl p-6"
            style={{
              backdropFilter: 'blur(20px)',
              background: theme === 'dark'
                      ? 'rgba(42, 45, 61, 0.95)'
                      : 'rgba(255, 255, 255, 0.95)',
              border: theme === 'dark'
                      ? '1px solid rgba(239, 68, 68, 0.3)'
                      : '1px solid rgba(239, 68, 68, 0.2)',
                    boxShadow: '0 4px 20px rgba(239, 68, 68, 0.2)',
            }}
          >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(239, 68, 68, 0.2)' }}>
                      <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6 6" />
                      </svg>
                    </div>
                    {expenseChange !== 0 && (
                      <div className="flex items-center gap-1">
                        {expenseChange >= 0 ? (
                          <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className={`text-sm font-medium ${expenseChange >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {Math.abs(expenseChange)}%
                </span>
              </div>
                    )}
                  </div>
                  <p className={`text-xs font-medium ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'} uppercase tracking-wide mb-2`}>
                    {t('dashboard.monthlyExpenses')}
                  </p>
                  <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {formatCurrency(dashboardData?.currentMonthExpenses || 0)}
                  </p>
                </div>
              </motion.div>

              {/* Account Balance Card */}
              <motion.div variants={prefersReducedMotion ? {} : getCardVariants(2)}>
              <div
                  className="rounded-3xl p-6"
                style={{
                    backdropFilter: 'blur(20px)',
                    background: theme === 'dark' 
                      ? 'rgba(42, 45, 61, 0.95)'
                      : 'rgba(255, 255, 255, 0.95)',
                    border: theme === 'dark'
                      ? '1px solid rgba(245, 158, 11, 0.3)'
                      : '1px solid rgba(245, 158, 11, 0.2)',
                    boxShadow: '0 4px 20px rgba(245, 158, 11, 0.2)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(245, 158, 11, 0.2)' }}>
                      <span className="text-2xl">💰</span>
              </div>
            </div>
                  <p className={`text-xs font-medium ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'} uppercase tracking-wide mb-2`}>
                    Account Balance
                  </p>
                  <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {formatCurrency(dashboardData?.currentSavings || 0)}
                  </p>
                  </div>
              </motion.div>

              {/* Zakat Status Card */}
              <motion.div variants={prefersReducedMotion ? {} : getCardVariants(3)}>
                <div
                  className="rounded-3xl p-6"
                  style={{
                    backdropFilter: 'blur(20px)',
                    background: theme === 'dark' 
                      ? 'rgba(42, 45, 61, 0.95)'
                      : 'rgba(255, 255, 255, 0.95)',
                    border: theme === 'dark'
                      ? '1px solid rgba(8, 145, 178, 0.3)'
                      : '1px solid rgba(8, 145, 178, 0.2)',
                    boxShadow: '0 4px 20px rgba(8, 145, 178, 0.2)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(8, 145, 178, 0.2)' }}>
                      <span className="text-2xl">🕌</span>
              </div>
            </div>
                  <p className={`text-xs font-medium ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'} uppercase tracking-wide mb-2`}>
                    Zakat Status
                  </p>
                  <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {dashboardData && dashboardData.currentSavings >= 4000
                      ? formatCurrency(dashboardData.zakatOwed)
                      : '$0.00'}
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>
                    {dashboardData && dashboardData.currentSavings >= 4000 ? 'Zakat Due' : 'Below Nisab'}
                  </p>
            </div>
              </motion.div>
            </motion.div>

            {/* Quick Actions - Horizontal on Tablet */}
            <motion.div
              variants={prefersReducedMotion ? {} : getCardVariants(4)}
              initial="hidden"
              animate="visible"
              className="mb-8"
            >
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'} mb-4`}>
                {t('dashboard.quickActions')}
              </h2>
              <div className="grid grid-cols-3 gap-4">
            <Link
                  href="/income?action=add"
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl transition-all active:scale-95 mobile-tap-target"
              style={{
                backdropFilter: 'blur(20px)',
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                    minHeight: '56px',
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
              }}
            >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/30 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
                  </div>
                  <div className="text-center">
                    <p className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      {t('dashboard.addIncome')}
              </p>
                  </div>
            </Link>
            <Link
                  href="/expenses?action=add"
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl transition-all active:scale-95 mobile-tap-target"
              style={{
                backdropFilter: 'blur(20px)',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                    minHeight: '56px',
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
              }}
            >
                  <div className="w-12 h-12 rounded-full bg-red-500/30 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
                  </div>
                  <div className="text-center">
                    <p className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      {t('dashboard.addExpense')}
              </p>
                  </div>
            </Link>
            <Link
              href="/zakat"
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl transition-all active:scale-95 mobile-tap-target"
              style={{
                backdropFilter: 'blur(20px)',
                    background: 'rgba(245, 158, 11, 0.2)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    minHeight: '56px',
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
              }}
            >
                  <div className="w-12 h-12 rounded-full bg-amber-500/30 flex items-center justify-center">
                    <span className="text-2xl">🕌</span>
                  </div>
                  <div className="text-center">
                    <p className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      {t('dashboard.calculateZakat')}
              </p>
                  </div>
            </Link>
          </div>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
              variants={prefersReducedMotion ? {} : getCardVariants(5)}
              initial="hidden"
              animate="visible"
              className="rounded-3xl p-6"
              style={{
                backdropFilter: 'blur(20px)',
                background: theme === 'dark' 
                  ? 'rgba(42, 45, 61, 0.95)'
                  : 'rgba(255, 255, 255, 0.95)',
                border: theme === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {t('dashboard.recentTransactions')}
                </h2>
                <Link
                  href="/transactions"
                  className={`text-sm font-medium ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}
                >
                  {t('common.viewAll')}
                </Link>
        </div>
              {recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 rounded-xl"
                      style={{
                        background: theme === 'dark' 
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(0, 0, 0, 0.03)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{
                            background: transaction.type === 'income' 
                              ? 'rgba(16, 185, 129, 0.2)'
                              : 'rgba(239, 68, 68, 0.2)',
                          }}
                        >
                          {transaction.type === 'income' ? (
                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6 6" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            {transaction.category || transaction.description || 'Transaction'}
                          </p>
                          <p className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>
                            {transaction.date ? new Date(transaction.date).toLocaleDateString() : ''}
                          </p>
                        </div>
                      </div>
                      <p className={`text-sm font-bold ${transaction.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount || 0))}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>
                    No recent transactions
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </PageContainer>
      </div>

      {/* Desktop Dashboard (1025px+) */}
      <div className="hidden lg:block min-h-screen relative overflow-hidden" style={{
        background: theme === 'dark'
          ? 'linear-gradient(135deg, #1a1d2e 0%, #1e2139 100%)'
          : 'linear-gradient(to bottom, #f8fafc, #e2e8f0)',
      }}>
        {/* Floating Bubbles - Apple App Store 2.0 Style for Desktop */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Extra large emerald bubble - top right */}
          <div
            className="floating-bubble-slow absolute rounded-full opacity-10"
            style={{
              width: '500px',
              height: '500px',
              background: 'radial-gradient(circle at 30% 30%, rgba(16, 185, 129, 0.6), transparent 70%)',
              top: '-10%',
              right: '5%',
              filter: 'blur(80px)',
            }}
          />
          {/* Large cyan bubble - left */}
          <div
            className="floating-bubble-medium absolute rounded-full opacity-12"
            style={{
              width: '400px',
              height: '400px',
              background: 'radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.5), transparent 70%)',
              top: '20%',
              left: '-5%',
              filter: 'blur(70px)',
            }}
          />
          {/* Large gold bubble - bottom right */}
          <div
            className="floating-bubble-fast absolute rounded-full opacity-15"
            style={{
              width: '350px',
              height: '350px',
              background: 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.4), transparent 70%)',
              bottom: '10%',
              right: '15%',
              filter: 'blur(60px)',
            }}
          />
          {/* Medium purple bubble - bottom left */}
          <div
            className="floating-bubble-slow absolute rounded-full opacity-10"
            style={{
              width: '280px',
              height: '280px',
              background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.5), transparent 70%)',
              bottom: '25%',
              left: '10%',
              filter: 'blur(50px)',
            }}
          />
          {/* Small rose bubble - center top */}
          <div
            className="floating-bubble-medium absolute rounded-full opacity-8"
            style={{
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle at 50% 50%, rgba(244, 63, 94, 0.4), transparent 70%)',
              top: '35%',
              left: '45%',
              filter: 'blur(45px)',
            }}
          />
        </div>

        <PageContainer maxWidth="2xl">
          {/* Welcome Section - Glass Card */}
          <div className="relative z-10 pt-8 pb-6">
            <div
              className="rounded-3xl p-8 mb-8 relative overflow-hidden"
              style={{
                background: theme === 'dark' ? 'rgba(42, 45, 61, 0.95)' : '#ffffff',
                border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
                boxShadow: '0 8px 32px rgba(15, 23, 42, 0.25)',
              }}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-amber-500/5 pointer-events-none"></div>
              
              {/* Mosque Watermark */}
              <div className="absolute right-8 top-8 opacity-15">
                <span className="text-9xl">🕌</span>
              </div>

              <div className="relative z-10">
                <h1 className={`text-3xl font-bold ${getCardTextColor(theme, theme === 'light')} mb-2`}>
                  {t('dashboard.welcome')}, {userName}
                </h1>
                <div className={`flex items-center gap-4 ${getMutedTextColor(theme)}`}>
                  <span className="text-sm font-medium">{formatDate(currentDate)}</span>
                  <span>•</span>
                  <span className="text-sm font-medium">{getIslamicDate(currentDate)}</span>
              </div>
              </div>
            </div>
      </div>

          {/* Account Summary Section */}
          <div className="pt-8 pb-6 lg:pt-0">
            <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-charcoal-dark'} mb-4 uppercase tracking-wide`}>{t('dashboard.accountSummary')}</h2>
            <motion.div
              className="grid grid-cols-1 tablet:grid-cols-2 lg:grid-cols-4 gap-4 tablet:gap-6 mb-8 mobile-section-spacing"
              variants={prefersReducedMotion ? {} : staggerContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Total Income Card */}
              <motion.div
                variants={prefersReducedMotion ? {} : getCardVariants(0)}
              >
              <div
                className="rounded-3xl p-6 transition-all duration-500 hover:translate-y-[-16px] hover:shadow-2xl hover:shadow-emerald-500/50 animate-slide-up animate-delay-100 bg-white lg:bg-transparent cursor-pointer group card-hover"
                style={{
                  backdropFilter: 'blur(20px)',
                  background: theme === 'dark' ? 'rgba(42, 45, 61, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  border: theme === 'dark' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(0, 0, 0, 0.1)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                }}
              >
                  <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm"
                    style={{ background: 'rgba(16, 185, 129, 0.2)' }}
                  >
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  <div
                    className="text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm"
                    style={{
                      background: incomeChange >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(248, 113, 113, 0.3)',
                      color: incomeChange >= 0 ? '#059669' : '#dc2626',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    {incomeChange >= 0 ? '↑' : '↓'} {incomeChange >= 0 ? '+' : ''}{incomeChange}%
                  </div>
                </div>
                <p className={`text-xs font-medium ${theme === 'dark' ? 'text-white/70' : 'text-slate-700'} uppercase tracking-wide mb-2`}>{t('dashboard.monthlyIncome')}</p>
                <p className={`text-2xl font-semibold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'} mb-1`}>
                    {formatCurrency(dashboardData?.currentMonthIncome || 0)}
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>{t('dashboard.vsPreviousMonth')}</p>
                </div>
              </motion.div>

              {/* Total Expenses Card */}
              <motion.div
                variants={prefersReducedMotion ? {} : getCardVariants(1)}
              >
              <div
                className="rounded-3xl p-6 transition-all duration-500 hover:scale-110 hover:translate-y-[-16px] hover:shadow-2xl hover:shadow-red-500/50 animate-slide-up animate-delay-200 bg-white lg:bg-transparent cursor-pointer group card-hover"
                style={{
                  backdropFilter: 'blur(20px)',
                  background: theme === 'dark' ? 'rgba(42, 45, 61, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  border: theme === 'dark' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(0, 0, 0, 0.1)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                }}
              >
                  <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm"
                    style={{ background: 'rgba(239, 68, 68, 0.2)' }}
                  >
                      <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6 6" />
                      </svg>
                    </div>
                  <div
                    className="text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm"
                    style={{
                      background: expenseChange >= 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)',
                      color: expenseChange >= 0 ? '#dc2626' : '#059669',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    {expenseChange >= 0 ? '↑' : '↓'} {expenseChange >= 0 ? '+' : ''}{expenseChange}%
                  </div>
                </div>
                <p className={`text-xs font-medium ${theme === 'dark' ? 'text-white/70' : 'text-slate-700'} uppercase tracking-wide mb-2`}>{t('dashboard.monthlyExpenses')}</p>
                <p className={`text-2xl font-semibold ${theme === 'dark' ? 'text-red-400' : 'text-red-600'} mb-1`}>
                    {formatCurrency(dashboardData?.currentMonthExpenses || 0)}
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>{t('dashboard.vsPreviousMonth')}</p>
                </div>
              </motion.div>

              {/* Current Savings Card */}
              <motion.div
                variants={prefersReducedMotion ? {} : getCardVariants(2)}
              >
              <div
                className="rounded-3xl p-6 transition-all duration-500 hover:scale-110 hover:translate-y-[-16px] hover:shadow-2xl hover:shadow-amber-500/50 animate-slide-up animate-delay-300 bg-white lg:bg-transparent cursor-pointer group card-hover"
                style={{
                  backdropFilter: 'blur(20px)',
                  background: theme === 'dark' ? 'rgba(42, 45, 61, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  border: theme === 'dark' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(0, 0, 0, 0.1)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                }}
              >
                  <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm"
                    style={{ background: 'rgba(245, 158, 11, 0.2)' }}
                  >
                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                <p className={`text-xs font-medium ${theme === 'dark' ? 'text-white/70' : 'text-slate-700'} uppercase tracking-wide mb-2`}>{t('dashboard.accountBalance')}</p>
                <p className={`text-2xl font-semibold ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'} mb-1`}>
                    {formatCurrency(dashboardData?.currentSavings || 0)}
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>{t('dashboard.totalSavings')}</p>
                </div>
              </motion.div>

              {/* Zakat Status Card */}
              <motion.div
                variants={prefersReducedMotion ? {} : getCardVariants(3)}
              >
              <Link
                href="/zakat"
                className="rounded-3xl p-6 transition-all duration-500 hover:scale-110 hover:translate-y-[-16px] hover:shadow-2xl hover:shadow-amber-500/50 animate-slide-up animate-delay-400 bg-white lg:bg-transparent cursor-pointer group card-hover block"
                style={{
                  backdropFilter: 'blur(20px)',
                  background: theme === 'dark' ? 'rgba(42, 45, 61, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  border: theme === 'dark' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(245, 158, 11, 0.4)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                }}
              >
                  <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm"
                    style={{ background: 'rgba(245, 158, 11, 0.2)' }}
                  >
                    <span className="text-2xl">🕌</span>
                    </div>
                  {zakatEligibility?.isObligatory ? (
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm"
                      style={{
                        background: 'rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                      }}
                      >
                      Obligatory
                    </span>
                    ) : (
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm"
                      style={{
                        background: 'rgba(148, 163, 184, 0.3)',
                        color: '#64748b',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                      }}
                    >
                      Not Obligatory
                      </span>
                    )}
                  </div>
                <p className={`text-xs font-medium ${theme === 'dark' ? 'text-white/70' : 'text-slate-700'} uppercase tracking-wide mb-2`}>Zakat Status</p>
                <p className={`text-2xl font-semibold mb-1 ${zakatEligibility?.isObligatory ? (theme === 'dark' ? 'text-amber-400' : 'text-amber-600') : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}`}>
                  {zakatEligibility ? formatCurrency(zakatEligibility.zakatAmountDue) : '$0.00'}
                  </p>
                <p className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>
                  {zakatEligibility?.isObligatory ? 'Amount Due' : 'Below Nisab'}
                </p>
              </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Financial Analysis Section */}
          <div className="mb-8">
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-charcoal-dark'} mb-4 uppercase tracking-wide`}>{t('dashboard.financialAnalysis')}</h2>
            <motion.div
              className="grid grid-cols-1 tablet:grid-cols-2 gap-6 tablet:gap-8 mb-8"
              variants={prefersReducedMotion ? {} : staggerContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Revenue Trend Area Chart */}
              <motion.div
                variants={prefersReducedMotion ? {} : { ...chartVariants, ...getCardVariants(0) }}
              >
                <div
                  className="rounded-3xl p-6 transition-all duration-300 hover:translate-y-[-4px] animate-scale-in animate-delay-200 bg-white lg:bg-transparent chart-card card-hover"
                  style={{
                    backdropFilter: 'blur(20px)',
                    background: theme === 'dark' ? 'rgba(42, 45, 61, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: theme === 'dark' 
                          ? 'rgba(139, 92, 246, 0.2)' 
                          : 'rgba(139, 92, 246, 0.1)',
                      }}
                    >
                      <svg 
                        className={`w-6 h-6 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-base font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Monthly Income vs Expenses
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Last 6 months performance
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.monthlyIncome')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t('dashboard.monthlyExpenses')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-[280px] lg:h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="incomeAreaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="expenseAreaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#e2e8f0' : '#475569'} vertical={false} />
                      <XAxis 
                        dataKey="month" 
                        stroke={theme === 'light' ? '#64748b' : '#94a3b8'} 
                        tick={{ fontSize: 12, fill: theme === 'light' ? '#475569' : '#cbd5e1', fontWeight: 500 }}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke={theme === 'light' ? '#64748b' : '#94a3b8'} 
                        tick={{ fontSize: 12, fill: theme === 'light' ? '#475569' : '#cbd5e1', fontWeight: 500 }}
                        axisLine={false}
                        tickFormatter={(value) => `$${value / 1000}k`}
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ 
                          backdropFilter: 'blur(10px)',
                          backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.98)' : 'rgba(30, 41, 59, 0.98)', 
                          border: theme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(255, 255, 255, 0.1)', 
                          borderRadius: '12px',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                          color: theme === 'light' ? '#1e293b' : '#f1f5f9'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="income" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        fill="url(#incomeAreaGradient)" 
                        name="Income"
                        isAnimationActive
                        animationDuration={800}
                        animationBegin={150}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="expenses" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        fill="url(#expenseAreaGradient)" 
                        name="Expenses"
                        isAnimationActive
                        animationDuration={800}
                        animationBegin={250}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>

              {/* Expense Breakdown Pie Chart */}
              <motion.div
                variants={prefersReducedMotion ? {} : { ...chartVariants, ...getCardVariants(1) }}
              >
              <div
                className="rounded-3xl p-6 transition-all duration-300 hover:translate-y-[-4px] animate-scale-in animate-delay-300 bg-white lg:bg-transparent chart-card card-hover relative"
                style={{
                  backdropFilter: 'blur(20px)',
                  background: theme === 'dark' ? 'rgba(42, 45, 61, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                  zIndex: 1,
                }}
              >
                {/* Header with Icon and Title */}
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="rounded-full p-2 flex items-center justify-center"
                    style={{
                      background: theme === 'dark' 
                        ? 'rgba(16, 185, 129, 0.2)' 
                        : 'rgba(16, 185, 129, 0.1)',
                      border: `2px solid ${theme === 'dark' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(16, 185, 129, 0.3)'}`,
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#10b981' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t('dashboard.spendingByCategory')}</h3>
                    <p className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>Distribution breakdown</p>
                  </div>
                </div>

                  {expenseBreakdown.length > 0 ? (
                    <>
                    <div className="relative h-[200px] lg:h-[220px] flex items-center justify-center" style={{ zIndex: 1 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart style={{ position: 'relative', zIndex: 1 }}>
                          <Pie
                            data={expenseBreakdown}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={false}
                            outerRadius={70}
                            innerRadius={35}
                            fill="#8884d8"
                            dataKey="amount"
                            paddingAngle={3}
                            isAnimationActive
                            animationDuration={800}
                            animationBegin={200}
                          >
                            {expenseBreakdown.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} stroke="transparent" />
                            ))}
                          </Pie>
                          <Tooltip
                            content={renderExpenseTooltip}
                            wrapperStyle={{
                              zIndex: 50,
                              pointerEvents: 'none',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Legend */}
                    <div className="flex flex-wrap justify-center gap-4 mt-6">
                      {expenseBreakdown.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: EXPENSE_COLORS[index % EXPENSE_COLORS.length] }}
                          />
                          <span className={`text-sm ${theme === 'dark' ? 'text-white/80' : 'text-gray-700'}`}>
                            {entry.category}
                          </span>
                        </div>
                      ))}
                    </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[200px] tablet:h-[280px] lg:h-[280px] text-slate-400">
                      <svg className="w-16 h-16 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p className={`text-sm ${getMutedTextColor(theme)}`}>{t('dashboard.noExpenseData')}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Quick Actions Section */}
          <div className="mb-8">
            <div
              className="rounded-3xl p-6"
              style={{
                backdropFilter: 'blur(20px)',
                background: theme === 'dark' ? 'rgba(42, 45, 61, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
              }}
            >
              <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-charcoal-dark'} mb-4 uppercase tracking-wide`}>{t('dashboard.quickActions')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/income?action=add"
                  className="group p-4 rounded-xl transition-all duration-300 hover:translate-y-[-4px] flex items-center gap-3 backdrop-blur-sm"
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid rgba(5, 150, 105, 0.3)',
                  }}
              >
                  <div className="w-10 h-10 bg-emerald-600/30 rounded-lg flex items-center justify-center group-hover:translate-y-[-2px] transition-transform duration-300 backdrop-blur-sm">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-charcoal-dark'}`}>{t('dashboard.addIncome')}</p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>{t('dashboard.recordNewIncome')}</p>
                </div>
              </Link>
              <Link
                href="/expenses?action=add"
                  className="group p-4 rounded-xl transition-all duration-300 hover:translate-y-[-4px] flex items-center gap-3 backdrop-blur-sm"
                  style={{
                    background: 'rgba(248, 113, 113, 0.2)',
                    border: '1px solid rgba(220, 38, 38, 0.3)',
                  }}
              >
                  <div className="w-10 h-10 bg-red-600/30 rounded-lg flex items-center justify-center group-hover:translate-y-[-2px] transition-transform duration-300 backdrop-blur-sm">
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-charcoal-dark'}`}>{t('dashboard.addExpense')}</p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>{t('dashboard.recordNewExpense')}</p>
                </div>
              </Link>
              <Link
                href="/zakat"
                  className="group p-4 rounded-xl transition-all duration-300 hover:translate-y-[-4px] flex items-center gap-3 backdrop-blur-sm"
                  style={{
                    background: 'rgba(245, 158, 11, 0.2)',
                    border: '1px solid rgba(217, 119, 6, 0.3)',
                  }}
              >
                  <div className="w-10 h-10 bg-amber-600/30 rounded-lg flex items-center justify-center group-hover:translate-y-[-2px] transition-transform duration-300 backdrop-blur-sm">
                    <span className="text-xl">🕌</span>
                </div>
                <div>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-charcoal-dark'}`}>{t('dashboard.calculateZakat')}</p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>{t('dashboard.zakatCalculator')}</p>
                </div>
              </Link>
              </div>
            </div>
          </div>

        {/* Recent Transactions */}
          <div
            className="rounded-3xl p-6 mb-8 transition-all duration-300 hover:translate-y-[-4px] animate-scale-in animate-delay-400 bg-white lg:bg-transparent card-hover"
            style={{
              backdropFilter: 'blur(20px)',
              background: theme === 'dark' ? 'rgba(42, 45, 61, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            }}
          >
          <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t('dashboard.recentTransactions')}</h2>
            <Link
              href="/transactions"
              className={`text-sm font-medium ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`}
            >
              {t('common.viewAll')}
              <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          {recentTransactions.length > 0 ? (
            <motion.div
              className="space-y-3"
              variants={prefersReducedMotion ? {} : staggerContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {recentTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  variants={prefersReducedMotion ? {} : getListItemVariants(index)}
                >
                <div
                  className="flex items-center justify-between p-4 rounded-xl hover:translate-y-[-2px] transition-all duration-300 cursor-pointer backdrop-blur-sm"
                  style={{
                    background: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                    border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm"
                      style={{
                        background: transaction.type === 'income'
                          ? 'rgba(16, 185, 129, 0.3)'
                        : transaction.type === 'zakat'
                          ? 'rgba(139, 92, 246, 0.3)'
                          : 'rgba(248, 113, 113, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                      }}
                    >
                      {transaction.type === 'income' ? (
                        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      ) : transaction.type === 'zakat' ? (
                        <span className="text-xl">🕌</span>
                      ) : (
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6 6" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-charcoal-dark'}`}>{transaction.category}</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>
                        {new Date(transaction.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-bold font-mono ${
                      transaction.type === 'income' 
                        ? (theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600')
                        : transaction.type === 'zakat'
                        ? (theme === 'dark' ? 'text-purple-400' : 'text-purple-600')
                        : (theme === 'dark' ? 'text-red-400' : 'text-red-600')
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                    <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className={`text-center py-12 ${getMutedTextColor(theme)}`}>
              <p>{t('dashboard.noTransactions')}</p>
            </div>
          )}
          </div>
        </PageContainer>
      </div>
    </DashboardLayout>
  );
}
