'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { getCurrentUser, User } from '@/lib/auth';
import { getCardVariants, filterBarVariants, getListItemVariants, staggerContainerVariants } from '@/lib/animations';
import { toHijriDate } from '@/lib/income-scanner';
import {
  getIncomeEntries,
  createIncome,
  updateIncome,
  deleteIncome,
  IncomeEntry,
  IncomeFilters,
} from '@/lib/income';
import { getExpenseEntries, ExpenseEntry } from '@/lib/expenses';
import { AddIncomeModal } from '@/components/AddIncomeModal';
import { EditIncomeModal } from '@/components/EditIncomeModal';
import { DeleteConfirmation } from '@/components/DeleteConfirmation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MobileTopNav } from '@/components/layout/MobileTopNav';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { PreciousMetalsModal } from '@/components/PreciousMetalsModal';

// Inner component that uses searchParams
function IncomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const [user, setUser] = useState<User | null>(null);
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);
  const [expenseEntries, setExpenseEntries] = useState<ExpenseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreciousMetalsModal, setShowPreciousMetalsModal] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<IncomeEntry | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [filterMonth, setFilterMonth] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeFilters, setActiveFilters] = useState<IncomeFilters>({});
  const [error, setError] = useState<string | null>(null);
  const [swipeIndex, setSwipeIndex] = useState<number | null>(null);
  const [swipeStartX, setSwipeStartX] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [activePeriod, setActivePeriod] = useState<'day' | 'week' | 'month' | 'year' | 'all'>('month');

  const categories = ['Salary', 'Business', 'Freelance', 'Gifts', 'Investments', 'Other'];
  const periods = [
    { key: 'day' as const, label: 'Day' },
    { key: 'week' as const, label: 'Week' },
    { key: 'month' as const, label: 'Month' },
    { key: 'year' as const, label: 'Year' },
    { key: 'all' as const, label: 'All' },
  ];

  const loadData = async () => {
    setLoading(true);

    try {
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        // Don't bounce the user away if auth check is slow; middleware already protects routes.
        // If middleware didn't redirect, user is likely authenticated but check was slow
        setLoading(false);
        return;
      }
      
      setUser(currentUser);

      // Show page immediately - don't wait for data
      setLoading(false);

      // Load data in background (non-blocking)
      loadIncomeEntries(currentUser.id, {});
      loadExpenseEntries(currentUser.id);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const initData = async () => {
      if (!mounted) return;
      await loadData();
    };

    initData();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setShowAddModal(true);
      // Remove query param from URL without causing a refresh
      // Use replaceState to avoid triggering a navigation
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('action');
        window.history.replaceState({}, '', url.pathname + url.search);
      }
    }
  }, [searchParams]);

  const loadExpenseEntries = async (userId: string) => {
    const { data, error } = await getExpenseEntries(userId, {});
    if (!error && data) {
      setExpenseEntries(data);
    }
  };

  const loadIncomeEntries = async (userId: string, filters: IncomeFilters) => {
    const { data, error } = await getIncomeEntries(userId, filters);
    if (!error) {
      setIncomeEntries(data);
    }
  };

  const handleAddIncome = async (data: {
    amount: number;
    category: string;
    date: string;
    notes: string;
    is_zakatable: boolean;
  }) => {
    if (!user) return;
    setError(null);
    const { data: income, error } = await createIncome(user.id, {
      ...data,
      category: data.category as any,
    });
    if (error) {
      setError(error);
      console.error('Error adding income:', error);
    } else {
      setShowAddModal(false);
      setError(null);
      await loadIncomeEntries(user.id, activeFilters);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('income-added'));
      }
    }
  };

  const handleEditIncome = async (
    id: string,
    data: {
      amount: number;
      category: string;
      date: string;
      notes: string;
      is_zakatable: boolean;
    }
  ) => {
    if (!user) return;
    const { error } = await updateIncome(id, user.id, {
      ...data,
      category: data.category as any,
    });
    if (!error) {
      setShowEditModal(false);
      setSelectedIncome(null);
      await loadIncomeEntries(user.id, activeFilters);
    }
  };

  const handleDeleteIncome = async () => {
    if (!user || !selectedIncome) return;
    const { error } = await deleteIncome(selectedIncome.id, user.id);
    if (!error) {
      setShowDeleteModal(false);
      setSelectedIncome(null);
      await loadIncomeEntries(user.id, activeFilters);
    }
  };

  const handleApplyFilters = () => {
    if (!user) return;
    const filters: IncomeFilters = {};
    if (filterMonth) {
      const [year, month] = filterMonth.split('-');
      filters.month = parseInt(month);
      filters.year = parseInt(year);
    }
    if (filterCategory !== 'all') {
      filters.category = filterCategory;
    }
    setActiveFilters(filters);
    loadIncomeEntries(user.id, filters);
  };

  const handleClearFilters = () => {
    if (!user) return;
    setFilterMonth('');
    setFilterCategory('all');
    setActiveFilters({});
    loadIncomeEntries(user.id, {});
  };

  const removeFilter = (type: 'month' | 'category') => {
    if (type === 'month') {
      const newFilters = { ...activeFilters };
      delete newFilters.month;
      delete newFilters.year;
      setActiveFilters(newFilters);
      setFilterMonth('');
      loadIncomeEntries(user!.id, newFilters);
    } else {
      const newFilters = { ...activeFilters };
      delete newFilters.category;
      setActiveFilters(newFilters);
      setFilterCategory('all');
      loadIncomeEntries(user!.id, newFilters);
    }
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
      month: 'short',
      day: 'numeric',
    });
  };

  const formatHijriDate = (dateString: string) => {
    return toHijriDate(dateString);
  };

  // Filter entries by selected period
  const getFilteredEntriesByPeriod = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return incomeEntries.filter(entry => {
      const entryDate = new Date(entry.date);

      switch (activePeriod) {
        case 'day':
          return entryDate >= today && entryDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return entryDate >= weekAgo;
        case 'month':
          return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
        case 'year':
          return entryDate.getFullYear() === now.getFullYear();
        case 'all':
        default:
          return true;
      }
    });
  };

  const filteredEntries = getFilteredEntriesByPeriod();
  const periodTotal = filteredEntries.reduce((sum, entry) => sum + entry.amount, 0);

  // Filter expenses by same period for comparison
  const getFilteredExpensesByPeriod = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return expenseEntries.filter(entry => {
      const entryDate = new Date(entry.date);

      switch (activePeriod) {
        case 'day':
          return entryDate >= today && entryDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return entryDate >= weekAgo;
        case 'month':
          return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
        case 'year':
          return entryDate.getFullYear() === now.getFullYear();
        case 'all':
        default:
          return true;
      }
    });
  };

  const filteredExpenses = getFilteredExpensesByPeriod();
  const expensesTotal = filteredExpenses.reduce((sum, entry) => sum + entry.amount, 0);
  const netSavings = periodTotal - expensesTotal;
  const savingsPercentage = periodTotal > 0 ? Math.round((netSavings / periodTotal) * 100) : 0;

  const getMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      options.push({ value, label });
    }
    return options;
  };

  const calculateTotal = () => {
    return incomeEntries.reduce((sum, entry) => sum + entry.amount, 0);
  };

  const getActiveFiltersList = () => {
    const filters = [];
    if (activeFilters.month && activeFilters.year) {
      const date = new Date(activeFilters.year, activeFilters.month - 1);
      filters.push({ type: 'month' as const, label: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) });
    }
    if (activeFilters.category) {
      filters.push({ type: 'category' as const, label: activeFilters.category });
    }
    return filters;
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Salary': '💼',
      'Business': '🏢',
      'Freelance': '💻',
      'Gifts': '🎁',
      'Investments': '📈',
      'Other': '💰'
    };
    return icons[category] || '💰';
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Salary': 'rgba(59, 130, 246, 0.2)',
      'Business': 'rgba(168, 85, 247, 0.2)',
      'Freelance': 'rgba(20, 184, 166, 0.2)',
      'Gifts': 'rgba(236, 72, 153, 0.2)',
      'Investments': 'rgba(249, 115, 22, 0.2)',
      'Other': 'rgba(156, 163, 175, 0.2)'
    };
    return colors[category] || colors['Other'];
  };

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    setSwipeStartX(e.touches[0].clientX);
    setSwipeIndex(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (swipeIndex === null) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - swipeStartX;
    if (diff < 0) {
      setSwipeOffset(Math.max(diff, -120));
    }
  };

  const handleTouchEnd = () => {
    if (swipeOffset < -60) {
      // Swipe confirmed
    } else {
      setSwipeOffset(0);
    }
    setSwipeStartX(0);
  };

  const resetSwipe = () => {
    setSwipeIndex(null);
    setSwipeOffset(0);
  };

  const currentMonth = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  const entriesThisMonth = incomeEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    const now = new Date();
    return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
  }).length;

  return (
    <DashboardLayout user={user}>
      {/* Theme-aware Gradient Background */}
      <div 
        className="min-h-screen lg:pb-8 relative overflow-hidden"
        style={{
          background: theme === 'dark'
            ? 'linear-gradient(135deg, #1a1d2e 0%, #1e2139 100%)'
            : 'linear-gradient(to bottom, #f8fafc, #e2e8f0, #f1f5f9)',
        }}
      >
        {/* Floating Bubbles - Apple App Store 2.0 Style */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Large emerald bubble - top right */}
          <div
            className="floating-bubble-slow absolute w-80 h-80 md:w-96 md:h-96 rounded-full opacity-15"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(16, 185, 129, 0.5), transparent 70%)',
              top: '-8%',
              right: '-10%',
              filter: 'blur(50px)',
            }}
          />
          {/* Medium cyan bubble - left center */}
          <div
            className="floating-bubble-medium absolute w-56 h-56 md:w-72 md:h-72 rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle at 40% 40%, rgba(6, 182, 212, 0.5), transparent 70%)',
              top: '30%',
              left: '-8%',
              filter: 'blur(40px)',
            }}
          />
          {/* Small gold bubble - bottom right */}
          <div
            className="floating-bubble-fast absolute w-40 h-40 md:w-56 md:h-56 rounded-full opacity-25"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.4), transparent 70%)',
              bottom: '15%',
              right: '5%',
              filter: 'blur(35px)',
            }}
          />
          {/* Extra small purple bubble - bottom left */}
          <div
            className="floating-bubble-slow absolute w-32 h-32 md:w-40 md:h-40 rounded-full opacity-15"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.5), transparent 70%)',
              bottom: '35%',
              left: '15%',
              filter: 'blur(30px)',
            }}
          />
        </div>

        {/* Mobile Top Nav */}
        <div className="lg:hidden relative z-10">
          <MobileTopNav onMenuClick={() => setMobileMenuOpen(true)} />
        </div>

        {/* Scrollable Content Area - iPhone Native */}
        <div className="relative z-10 pt-4 px-4 space-y-4 pb-6">
          {/* Page Header Card - iPhone Native */}
          <motion.div
            className="iphone-summary-card"
            variants={prefersReducedMotion ? {} : getCardVariants(0)}
            initial="hidden"
            animate="visible"
            style={{
              background: 'linear-gradient(135deg, #34d399, #06b6d4)',
              border: '1px solid #a7f3d0',
            }}
          >
            <div className="relative z-10 flex flex-col justify-between items-start gap-4">
            <div>
                <h1 className="iphone-summary-greeting">Income Tracking</h1>
                <p className="iphone-summary-date">Track your earnings</p>
            </div>
            <motion.button
              onClick={() => setShowAddModal(true)}
                className="iphone-button iphone-button-primary"
              style={{
                  minHeight: '48px',
                  padding: '0.75rem 1.5rem',
              }}
              whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
                Add Income
            </motion.button>
            </div>
          </motion.div>

          {/* Period Tabs - iPhone Native */}
          <motion.div
            className="rounded-2xl p-1.5"
            style={{
              background: theme === 'dark' ? 'rgba(42, 45, 61, 0.8)' : 'rgba(241, 245, 249, 0.9)',
              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(15, 23, 42, 0.06)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
            variants={prefersReducedMotion ? {} : getCardVariants(1)}
            initial="hidden"
            animate="visible"
          >
            <div className="flex gap-1">
              {periods.map((period) => (
                <button
                  key={period.key}
                  onClick={() => setActivePeriod(period.key)}
                  className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all ${
                    activePeriod === period.key
                      ? 'text-white'
                      : theme === 'dark' ? 'text-white/60 hover:text-white/80' : 'text-slate-600 hover:text-slate-800'
                  }`}
                  style={{
                    background: activePeriod === period.key
                      ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                      : 'transparent',
                    boxShadow: activePeriod === period.key
                      ? '0 4px 12px rgba(16, 185, 129, 0.3)'
                      : 'none',
                  }}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Summary Card - iPhone Native */}
          <motion.div
            className="rounded-3xl p-5 lg:p-6"
            style={{
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              background: theme === 'dark' ? 'rgba(42, 45, 61, 0.8)' : 'rgba(255, 255, 255, 0.9)',
              border: theme === 'dark' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(15, 23, 42, 0.06)',
              borderRadius: '20px',
              boxShadow: theme === 'dark' ? '0 4px 20px rgba(16, 185, 129, 0.2)' : '0 4px 20px rgba(0, 0, 0, 0.1)',
            }}
            variants={prefersReducedMotion ? {} : getCardVariants(2)}
            initial="hidden"
            animate="visible"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className={`text-xs uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-white/70' : 'text-slate-500'}`}>
                  {activePeriod === 'day' ? "Today's Income" : activePeriod === 'week' ? 'This Week' : activePeriod === 'month' ? 'This Month' : activePeriod === 'year' ? 'This Year' : 'Total Income'}
                </p>
                <p className={`text-4xl lg:text-5xl font-bold font-mono ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`} style={{ fontSize: '2.5rem' }}>
                  {formatCurrency(periodTotal)}
                </p>
                <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-white/80' : 'text-slate-600'}`}>{filteredEntries.length} entries</p>
              </div>
              <div
                  className="px-4 py-2 rounded-full flex items-center gap-2"
                  style={{
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                  }}
              >
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="text-emerald-700 text-sm font-medium">+12% vs last month</span>
              </div>
            </div>
          </motion.div>

          {/* Precious Metals Converter Button */}
          <motion.div
            variants={prefersReducedMotion ? {} : getCardVariants(3)}
            initial="hidden"
            animate="visible"
          >
            <button
              onClick={() => setShowPreciousMetalsModal(true)}
              className="w-full rounded-3xl p-5 lg:p-6 transition-all active:scale-98"
              style={{
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                background: theme === 'dark' ? 'rgba(42, 45, 61, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(15, 23, 42, 0.06)',
                borderRadius: '20px',
                boxShadow: theme === 'dark' ? '0 4px 20px rgba(245, 158, 11, 0.2)' : '0 4px 20px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(234, 179, 8, 0.2))',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                    }}
                  >
                    🥇
                  </div>
                  <div className="text-left">
                    <h3 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                      Precious Metals Converter
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>
                      Convert gold & silver to multiple currencies
                    </p>
                  </div>
                </div>
                <svg 
                  className={`w-6 h-6 ${theme === 'dark' ? 'text-white/60' : 'text-slate-400'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </motion.div>

          {/* Income vs Expenses Comparison Card - iPhone Native */}
          <motion.div
            className="rounded-3xl p-5 lg:p-6"
            style={{
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              background: theme === 'dark' ? 'rgba(42, 45, 61, 0.8)' : 'rgba(255, 255, 255, 0.9)',
              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(15, 23, 42, 0.06)',
              borderRadius: '20px',
            }}
            variants={prefersReducedMotion ? {} : getCardVariants(4)}
            initial="hidden"
            animate="visible"
          >
            <h3 className={`text-sm font-medium mb-4 ${theme === 'dark' ? 'text-white/70' : 'text-slate-500'}`}>
              Income vs Expenses ({periods.find(p => p.key === activePeriod)?.label})
            </h3>

            {/* Comparison Bar Chart */}
            <div className="space-y-4 mb-6">
              {/* Income Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`}>Income</span>
                  <span className={`text-sm font-bold font-mono ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {formatCurrency(periodTotal)}
                  </span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{
                  background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.06)',
                }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${periodTotal > 0 ? Math.min((periodTotal / Math.max(periodTotal, expensesTotal)) * 100, 100) : 0}%`,
                      background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                    }}
                  />
                </div>
              </div>

              {/* Expenses Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`}>Expenses</span>
                  <span className={`text-sm font-bold font-mono ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                    {formatCurrency(expensesTotal)}
                  </span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{
                  background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.06)',
                }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${expensesTotal > 0 ? Math.min((expensesTotal / Math.max(periodTotal, expensesTotal)) * 100, 100) : 0}%`,
                      background: 'linear-gradient(90deg, #ef4444, #f97316)',
                    }}
                  />
              </div>
            </div>
          </div>

            {/* Net Savings */}
            <div
              className="p-4 rounded-2xl flex items-center justify-between"
              style={{
                background: netSavings >= 0
                  ? theme === 'dark' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)'
                  : theme === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${netSavings >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: netSavings >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  }}
                >
                  {netSavings >= 0 ? (
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-700'}`}>
                    Net Savings
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>
                    {savingsPercentage >= 0 ? `${savingsPercentage}% of income saved` : 'Spending exceeds income'}
                  </p>
                </div>
              </div>
              <p className={`text-xl font-bold font-mono ${
                netSavings >= 0
                  ? theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                  : theme === 'dark' ? 'text-red-400' : 'text-red-600'
              }`}>
                {netSavings >= 0 ? '+' : ''}{formatCurrency(netSavings)}
              </p>
            </div>
          </motion.div>

          {/* Filter Section - iPhone Native */}
          <motion.div
            className="rounded-3xl p-4 lg:p-6"
            style={{
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              background: theme === 'dark' ? 'rgba(42, 45, 61, 0.8)' : 'rgba(255, 255, 255, 0.9)',
              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(15, 23, 42, 0.06)',
              borderRadius: '20px',
            }}
            variants={prefersReducedMotion ? {} : filterBarVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4 tablet:gap-6 mb-4">
              {/* Month Selector */}
              <div>
                <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>Month</label>
                <button
                  onClick={handleApplyFilters}
                  className={`w-full px-4 py-3 rounded-2xl flex items-center justify-between mobile-tap-target mobile-input tablet-input ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}
                  style={{
                    background: theme === 'dark' ? '#334155' : '#f9fafb',
                    border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(15, 23, 42, 0.08)',
                    minHeight: '48px',
                    fontSize: '16px',
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
                  }}
                >
                  <span>{filterMonth ? getMonthOptions().find(o => o.value === filterMonth)?.label || currentMonth : currentMonth}</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="hidden"
                >
                  <option value="">All Months</option>
                  {getMonthOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Selector */}
              <div className="relative">
                <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>Category</label>
                <div className="relative">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className={`w-full px-4 py-3 rounded-2xl appearance-none cursor-pointer ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}
                    style={{
                      background: theme === 'dark' ? '#334155' : '#f9fafb',
                      border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(15, 23, 42, 0.08)',
                    }}
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Filters Pills */}
            {getActiveFiltersList().length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {getActiveFiltersList().map((filter, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 rounded-full flex items-center gap-2 flex-shrink-0 bg-cyan-100 border border-cyan-300"
                  >
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>{filter.label}</span>
                    <button
                      onClick={() => removeFilter(filter.type)}
                      className={theme === 'dark' ? 'text-white/80 hover:text-white transition-colors' : 'text-slate-600 hover:text-slate-800 transition-colors'}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleClearFilters}
                  className={`px-4 py-2 rounded-full text-sm font-medium flex-shrink-0 ${theme === 'dark' ? 'text-white/80 bg-white/10 border-white/20' : 'text-slate-700 bg-slate-100 border-slate-200'}`}
                >
                  Clear All
                </button>
              </div>
            )}
          </motion.div>

          {/* Income List - iPhone Native */}
          <motion.div
            variants={prefersReducedMotion ? {} : getCardVariants(3)}
            initial="hidden"
            animate="visible"
          >
            <div className="iphone-section-header mb-4">
              <h2 className={`iphone-section-title ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {activePeriod === 'all' ? 'All Income' : `Income (${periods.find(p => p.key === activePeriod)?.label})`}
              </h2>
              <span className={`text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>
                {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
              </span>
            </div>

            {/* Income Entry Cards - iPhone Native */}
          {filteredEntries.length === 0 ? (
            <div
              className="iphone-empty-state rounded-3xl p-16 text-center"
              style={{
                background: theme === 'dark' ? 'rgba(42, 45, 61, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(15, 23, 42, 0.06)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
                <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 opacity-20">
                  <svg className={`w-12 h-12 ${theme === 'dark' ? 'text-white' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
                <h3 className={`font-bold text-2xl mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>No income yet</h3>
                <p className={`mb-6 max-w-md mx-auto ${theme === 'dark' ? 'text-white/80' : 'text-slate-600'}`}>Add your first income entry</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-8 py-3 rounded-2xl font-bold text-white inline-flex items-center gap-2 transition-all active:scale-95 bg-emerald-400 border border-emerald-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                  Add Income
              </button>
            </div>
          ) : (
              <motion.div
                className="iphone-transactions-list"
                variants={prefersReducedMotion ? {} : staggerContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredEntries.map((entry, index) => (
            <motion.div
                    key={entry.id}
                    variants={prefersReducedMotion ? {} : getListItemVariants(index)}
                    className="iphone-transaction-item relative"
                    style={{
                      background: theme === 'dark' ? 'rgba(42, 45, 61, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                      border: theme === 'dark' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(16, 185, 129, 0.2)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                    }}
                    onTouchStart={(e) => handleTouchStart(e, index)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <div className="iphone-transaction-icon iphone-transaction-icon-income">
                          <span className="text-xl">{getCategoryIcon(entry.category)}</span>
                        </div>
                    <div className="iphone-transaction-details">
                      <div className={`iphone-transaction-category ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        {entry.category}
                      </div>
                      <div className="iphone-transaction-date">
                        {formatDate(entry.date)} • {formatHijriDate(entry.date)}
                      </div>
                          {entry.notes && (
                        <p className={`text-xs italic truncate mt-1 ${theme === 'dark' ? 'text-white/70' : 'text-slate-500'}`}>
                          {entry.notes}
                        </p>
                          )}
                            </div>
                    <div className="iphone-transaction-amount iphone-transaction-amount-income">
                            +{formatCurrency(entry.amount)}
                          {entry.is_zakatable && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 border border-emerald-300 text-emerald-700">
                              Zakatable
                        </span>
                            )}
                    </div>
                    {/* Swipe Actions */}
                    {swipeIndex === index && swipeOffset < -60 && (
                      <div className="absolute right-0 top-0 bottom-0 flex items-center gap-2 pr-4">
                              <button
                                onClick={() => {
                                  setSelectedIncome(entry);
                                  setShowEditModal(true);
                            resetSwipe();
                                }}
                          className="iphone-button iphone-button-secondary"
                                style={{
                            minWidth: '44px',
                            minHeight: '44px',
                            background: 'rgba(234, 179, 8, 0.3)',
                            border: '1px solid rgba(234, 179, 8, 0.4)',
                                }}
                              >
                          <svg className="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedIncome(entry);
                                  setShowDeleteModal(true);
                            resetSwipe();
                                }}
                          className="iphone-button iphone-button-danger"
                                style={{
                            minWidth: '44px',
                            minHeight: '44px',
                            background: 'rgba(239, 68, 68, 0.3)',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                                }}
                              >
                          <svg className="w-6 h-6 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                    )}
                </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
            </div>

            </div>

          {/* Modals */}
          <AddIncomeModal
            isOpen={showAddModal}
            onClose={() => {
              setShowAddModal(false);
              setError(null);
            }}
            onSave={handleAddIncome}
          />
          <EditIncomeModal
            isOpen={showEditModal}
            income={selectedIncome}
            onClose={() => {
              setShowEditModal(false);
              setSelectedIncome(null);
            }}
            onUpdate={handleEditIncome}
        onDelete={(income) => {
          setSelectedIncome(income);
          setShowEditModal(false);
          setShowDeleteModal(true);
        }}
          />
          <DeleteConfirmation
            isOpen={showDeleteModal}
            itemName="Income"
            onConfirm={handleDeleteIncome}
            onCancel={() => {
              setShowDeleteModal(false);
              setSelectedIncome(null);
            }}
          />
          <PreciousMetalsModal
            isOpen={showPreciousMetalsModal}
            onClose={() => setShowPreciousMetalsModal(false)}
          />
    </DashboardLayout>
  );
}

// Wrapper component with Suspense boundary
export default function IncomePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <IncomePageContent />
    </Suspense>
  );
}
