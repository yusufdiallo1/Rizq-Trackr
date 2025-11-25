'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { getCurrentUser, User } from '@/lib/auth';
import { getCardVariants, filterBarVariants, getListItemVariants, staggerContainerVariants, chartVariants } from '@/lib/animations';
import {
  getExpenseEntries,
  createExpense,
  updateExpense,
  deleteExpense,
  ExpenseEntry,
  ExpenseFilters,
} from '@/lib/expenses';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import { EditExpenseModal } from '@/components/EditExpenseModal';
import { DeleteConfirmation } from '@/components/DeleteConfirmation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MobileTopNav } from '@/components/layout/MobileTopNav';
import { getIslamicDate } from '@/lib/utils/dateUtils';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { PreciousMetalsModal } from '@/components/PreciousMetalsModal';

// Custom tooltip component for pie chart - shows on hover like image 2
const CustomPieTooltip = ({ active, payload, formatCurrency }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div
        style={{
          background: 'rgba(30, 41, 59, 0.98)',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          zIndex: 9999,
          position: 'relative',
        }}
      >
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px', marginBottom: '4px' }}>
          {data.name}
        </p>
        <p style={{ color: '#ffffff', fontSize: '18px', fontWeight: 'bold' }}>
          {formatCurrency(data.value)}
        </p>
      </div>
    );
  }
  return null;
};

// Inner component that uses searchParams
function ExpensesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const [user, setUser] = useState<User | null>(null);
  const [expenseEntries, setExpenseEntries] = useState<ExpenseEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseEntry | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [filterMonth, setFilterMonth] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeFilters, setActiveFilters] = useState<ExpenseFilters>({});
  const [error, setError] = useState<string | null>(null);
  const [swipeIndex, setSwipeIndex] = useState<number | null>(null);
  const [swipeStartX, setSwipeStartX] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [timePeriod, setTimePeriod] = useState<'Day' | 'Week' | 'Month' | 'Year' | 'All Time'>('Month');
  const [showPreciousMetalsModal, setShowPreciousMetalsModal] = useState(false);

  const categories = ['Housing', 'Food', 'Transport', 'Healthcare', 'Education', 'Charity', 'Entertainment', 'Bills', 'Other'];

  useEffect(() => {
    loadData();
  }, []);

  // Removed artificial loading delay - show page immediately

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

  const loadData = async () => {
    setLoading(true);

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      // Let middleware handle real auth; avoid redirect loops on slow auth.
      setLoading(false);
      return;
    }
    setUser(currentUser);

    // Show page immediately - don't wait for data
    setLoading(false);
    await loadExpenseEntries(currentUser.id, {});
    setLoading(false);
  };

  const loadExpenseEntries = async (userId: string, filters: ExpenseFilters) => {
    try {
      const { data, error } = await getExpenseEntries(userId, filters);
      if (!error) {
      let filteredData = data;
      
      // Apply time period filter
      const now = new Date();
      if (timePeriod === 'Day') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        filteredData = data.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= today;
        });
      } else if (timePeriod === 'Week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredData = data.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= weekAgo;
        });
      } else if (timePeriod === 'Month') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        filteredData = data.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= monthStart;
        });
      } else if (timePeriod === 'Year') {
        const yearStart = new Date(now.getFullYear(), 0, 1);
        filteredData = data.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= yearStart;
        });
      }
      // 'All Time' shows all data, no filtering needed
      
      setExpenseEntries(filteredData);
      } else {
        console.error('Error loading expenses:', error);
        setExpenseEntries([]);
      }
    } catch (err: any) {
      console.error('Unexpected error loading expenses:', err);
      setExpenseEntries([]);
    }
  };

  useEffect(() => {
    if (user) {
      const filters: ExpenseFilters = {};
      if (filterMonth) {
        const [year, month] = filterMonth.split('-');
        filters.month = parseInt(month);
        filters.year = parseInt(year);
      }
      if (filterCategory !== 'all') {
        filters.category = filterCategory;
      }
      setActiveFilters(filters);
      loadExpenseEntries(user.id, filters);
    }
  }, [timePeriod, user, filterMonth, filterCategory]);

  const handleAddExpense = async (data: {
    amount: number;
    category: string;
    date: string;
    notes: string;
    receiptImageUrl?: string;
  }) => {
    if (!user) return;
    setError(null);
    const { data: expense, error } = await createExpense(user.id, {
      ...data,
      category: data.category as any,
    });
    if (error) {
      setError(error);
      console.error('Error adding expense:', error);
    } else {
      // Create attachment record if receipt image URL is provided
      if (data.receiptImageUrl && expense) {
        const { createAttachment } = await import('@/lib/storage');
        const fileName = data.receiptImageUrl.split('/').pop() || 'receipt.jpg';
        await createAttachment(
          user.id,
          'expense',
          expense.id,
          data.receiptImageUrl,
          fileName
        );
      }

      setShowAddModal(false);
      setError(null);
      await loadExpenseEntries(user.id, activeFilters);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('expense-added'));
      }
    }
  };

  const handleEditExpense = async (
    id: string,
    data: {
      amount: number;
      category: string;
      date: string;
      notes: string;
    }
  ) => {
    if (!user) return;
    const { error } = await updateExpense(id, user.id, {
      ...data,
      category: data.category as any,
    });
    if (!error) {
      setShowEditModal(false);
      setSelectedExpense(null);
      await loadExpenseEntries(user.id, activeFilters);
    }
  };

  const handleDeleteExpense = async () => {
    if (!user || !selectedExpense) return;
    try {
      const { error } = await deleteExpense(selectedExpense.id, user.id);
      if (!error) {
        setShowDeleteModal(false);
        setSelectedExpense(null);
        await loadExpenseEntries(user.id, activeFilters);
      } else {
        console.error('Error deleting expense:', error);
      }
    } catch (err: any) {
      console.error('Unexpected error deleting expense:', err);
    }
  };

  const handleApplyFilters = () => {
    if (!user) return;
    const filters: ExpenseFilters = {};
    if (filterMonth) {
      const [year, month] = filterMonth.split('-');
      filters.month = parseInt(month);
      filters.year = parseInt(year);
    }
    if (filterCategory !== 'all') {
      filters.category = filterCategory;
    }
    setActiveFilters(filters);
    loadExpenseEntries(user.id, filters);
  };

  const handleClearFilters = () => {
    if (!user) return;
    setFilterMonth('');
    setFilterCategory('all');
    setActiveFilters({});
    loadExpenseEntries(user.id, {});
  };

  const removeFilter = (type: 'month' | 'category') => {
    if (type === 'month') {
      const newFilters = { ...activeFilters };
      delete newFilters.month;
      delete newFilters.year;
      setActiveFilters(newFilters);
      setFilterMonth('');
      loadExpenseEntries(user!.id, newFilters);
    } else {
      const newFilters = { ...activeFilters };
      delete newFilters.category;
      setActiveFilters(newFilters);
      setFilterCategory('all');
      loadExpenseEntries(user!.id, newFilters);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const gregorian = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    const hijri = getIslamicDate(date);
    return { gregorian, hijri };
  };

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
    return expenseEntries.reduce((sum, entry) => sum + entry.amount, 0);
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
      'Housing': '🏠',
      'Food': '🍽️',
      'Transport': '🚗',
      'Healthcare': '⚕️',
      'Education': '📚',
      'Charity': '🤲',
      'Entertainment': '🎬',
      'Bills': '📄',
      'Other': '✨'
    };
    return icons[category] || '✨';
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Housing': 'rgba(37, 99, 235, 0.2)', // Blue #2563eb
      'Food': 'rgba(234, 88, 12, 0.2)', // Orange #ea580c
      'Transport': 'rgba(16, 185, 129, 0.2)', // Green #10b981
      'Healthcare': 'rgba(220, 38, 38, 0.2)', // Red #dc2626
      'Education': 'rgba(124, 58, 237, 0.2)', // Purple #7c3aed
      'Charity': 'rgba(6, 182, 212, 0.2)', // Cyan #06b6d4
      'Entertainment': 'rgba(219, 39, 119, 0.2)', // Pink #db2777
      'Bills': 'rgba(107, 114, 128, 0.2)', // Gray #6b7280
      'Other': 'rgba(239, 68, 68, 0.2)' // Red #ef4444
    };
    return colors[category] || 'rgba(16, 185, 129, 0.2)';
  };

  const getCategoryColorSolid = (category: string) => {
    const colors: { [key: string]: string } = {
      'Housing': '#2563eb', // Blue
      'Food': '#ea580c', // Orange
      'Transport': '#10b981', // Green
      'Healthcare': '#dc2626', // Red
      'Education': '#7c3aed', // Purple
      'Charity': '#06b6d4', // Cyan
      'Entertainment': '#db2777', // Pink
      'Bills': '#6b7280', // Gray
      'Other': '#ef4444' // Red (different shade from Healthcare)
    };
    return colors[category] || '#10b981';
  };

  const getTopCategory = () => {
    if (expenseEntries.length === 0) return null;
    const categoryTotals: { [key: string]: number } = {};
    expenseEntries.forEach((entry) => {
      categoryTotals[entry.category] = (categoryTotals[entry.category] || 0) + entry.amount;
    });
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    return topCategory ? { category: topCategory[0], amount: topCategory[1] } : null;
  };

  const getCategoryBreakdown = () => {
    const categoryTotals: { [key: string]: number } = {};
    expenseEntries.forEach((entry) => {
      categoryTotals[entry.category] = (categoryTotals[entry.category] || 0) + entry.amount;
    });
    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value,
      color: getCategoryColorSolid(name),
    }));
  };

  const getCategorySummaryCards = () => {
    const categoryTotals: { [key: string]: number } = {};
    const categoryCounts: { [key: string]: number } = {};
    expenseEntries.forEach((entry) => {
      categoryTotals[entry.category] = (categoryTotals[entry.category] || 0) + entry.amount;
      categoryCounts[entry.category] = (categoryCounts[entry.category] || 0) + 1;
    });
    return Object.entries(categoryTotals).map(([category, total]) => ({
      category,
      total,
      count: categoryCounts[category],
    })).sort((a, b) => b.total - a.total);
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

  if (loading) {
    return (
      <DashboardLayout user={user}>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-body">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const currentMonth = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  const entriesThisMonth = expenseEntries.filter((entry) => {
    const entryDate = new Date(entry.date);
    const now = new Date();
    return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
  }).length;

  const topCategory = getTopCategory();
  
  // Calculate current month total
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthTotal = expenseEntries
    .filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= currentMonthStart && entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, entry) => sum + entry.amount, 0);
  
  // Calculate previous month total
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const previousMonthTotal = expenseEntries
    .filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= previousMonthStart && entryDate <= previousMonthEnd;
    })
    .reduce((sum, entry) => sum + entry.amount, 0);
  
  // Calculate trend percentage
  const trendPercentage = previousMonthTotal > 0
    ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100
    : currentMonthTotal > 0 ? 100 : 0;

  // Calculate dynamic chart dimensions based on number of categories
  const categoryBreakdown = getCategoryBreakdown();
  const categoryCount = categoryBreakdown.length;
  const chartHeight = Math.max(280, Math.min(320 + (categoryCount * 10), 400));
  const chartOuterRadius = Math.min(120 + (categoryCount * 5), 160);
  const chartInnerRadius = Math.min(60 + (categoryCount * 2.5), 80);
  const chartPaddingAngle = Math.max(3, Math.min(categoryCount * 0.5, 8));

  return (
    <DashboardLayout user={user}>
      {/* Theme-aware Gradient Background */}
        <div 
          className="min-h-screen lg:pb-8"
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(135deg, #1a1d2e 0%, #1e2139 100%)'
              : 'linear-gradient(to bottom, #f8fafc, #e2e8f0, #f1f5f9)',
          }}
        >
        {/* Mobile Top Nav */}
        <div className="lg:hidden">
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
              background: 'linear-gradient(135deg, #fecaca, #fed7aa)',
              border: '1px solid #fecaca',
            }}
          >
            <div className="relative z-10 flex flex-col justify-between items-start gap-4">
              <div>
                <h1 className="iphone-summary-greeting">Expense Tracking</h1>
                <p className="iphone-summary-date">Monitor your spending</p>
              </div>
              <motion.button
                onClick={() => setShowAddModal(true)}
                className="iphone-button iphone-button-primary"
                style={{
                  minHeight: '48px',
                  padding: '0.75rem 1.5rem',
                  background: '#f97373',
                  border: '1px solid #b91c1c',
                }}
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Expense
              </motion.button>
            </div>
          </motion.div>

          {/* Summary Card */}
          <div
            className="card-hover mx-4 mt-4 lg:mx-0 lg:mt-6 rounded-3xl p-5 lg:p-6"
            style={{
              backdropFilter: 'blur(20px)',
              background: theme === 'dark' ? 'rgba(42, 45, 61, 0.95)' : '#ffffff',
              border: theme === 'dark' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '20px',
              boxShadow: theme === 'dark' ? '0 4px 20px rgba(239, 68, 68, 0.2)' : '0 4px 20px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <p className={`text-xs uppercase tracking-wider mb-1 ${theme === 'dark' ? 'text-white/70' : 'text-slate-500'}`}>Total Expenses</p>
                <p className={`text-4xl lg:text-5xl font-bold font-mono ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} style={{ fontSize: '2.5rem' }}>
                  -{formatCurrency(calculateTotal())}
                </p>
                <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-white/80' : 'text-slate-600'}`}>{entriesThisMonth} entries this month</p>
                {topCategory && (
                  <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-white/80' : 'text-slate-600'}`}>Top category: {topCategory.category} ({formatCurrency(topCategory.amount)})</p>
                )}
              </div>
              <div
                className="px-4 py-2 rounded-full flex items-center gap-2"
                style={{
                  background: trendPercentage >= 0 ? '#fee2e2' : '#dcfce7',
                  border: trendPercentage >= 0 ? '1px solid #fecaca' : '1px solid #bbf7d0',
                }}
              >
                <svg 
                  className={`w-4 h-4 ${trendPercentage >= 0 ? 'text-red-400' : 'text-emerald-400'}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={trendPercentage >= 0 ? "M13 17h8m0 0V9m0 8l-8-8-4 4-6 6" : "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"} />
                </svg>
                <span className={`${trendPercentage >= 0 ? 'text-red-400' : 'text-emerald-400'} text-sm font-medium`}>
                  {trendPercentage >= 0 ? '+' : ''}{trendPercentage}% vs last month
                </span>
              </div>
            </div>
          </div>

          {/* Precious Metals Converter Button */}
          <motion.div
            className="mx-4 mt-4 lg:mx-0 lg:mt-6"
            variants={prefersReducedMotion ? {} : getCardVariants(1)}
            initial="hidden"
            animate="visible"
          >
            <motion.button
              onClick={() => setShowPreciousMetalsModal(true)}
              className="w-full rounded-2xl px-6 py-4 font-semibold text-base transition-all duration-300 relative overflow-hidden"
              style={{
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                background: theme === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(15, 23, 42, 0.1)',
                boxShadow: theme === 'dark' 
                  ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                color: theme === 'dark' ? 'white' : '#1e293b',
              }}
              whileHover={prefersReducedMotion ? {} : { 
                translateY: -4,
                scale: 1.02,
                boxShadow: theme === 'dark'
                  ? '0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                  : '0 12px 40px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
              }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <motion.span
                  animate={{ 
                    y: [0, -2, 0],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  🥇
                </motion.span>
                Precious Metals Converter
              </span>
              {/* Ripple effect on click */}
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: 'radial-gradient(circle, rgba(245, 158, 11, 0.3) 0%, transparent 70%)',
                }}
                initial={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: 2, opacity: [0, 0.5, 0] }}
                transition={{ duration: 0.6 }}
              />
            </motion.button>
          </motion.div>

          {/* Time Period Tabs */}
          <div className="mx-4 mt-4 lg:mx-0 lg:mt-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {(['Day', 'Week', 'Month', 'Year', 'All Time'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimePeriod(period)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    timePeriod === period
                      ? 'text-white'
                      : 'text-slate-800 hover:text-slate-900'
                  }`}
                  style={{
                    background: timePeriod === period ? '#f97373' : '#f9fafb',
                    border: timePeriod === period
                      ? '1px solid #b91c1c'
                      : '1px solid rgba(148, 163, 184, 0.5)',
                  }}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          {/* Category Breakdown Chart */}
          {expenseEntries.length > 0 && (
            <motion.div
              className={`mx-4 mt-4 lg:mx-0 lg:mt-6 rounded-3xl p-4 lg:p-6 border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}
              variants={prefersReducedMotion ? {} : { ...chartVariants, ...getCardVariants(1) }}
              initial="hidden"
              animate="visible"
            >
              {/* Header with Icon and Title */}
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="rounded-full p-2 flex items-center justify-center"
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '2px solid rgba(16, 185, 129, 0.5)',
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#10b981' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Spending by Category</h3>
                  <p className={`text-xs ${theme === 'dark' ? 'text-white/80' : 'text-slate-600'}`}>Distribution breakdown</p>
                </div>
              </div>

              <ResponsiveContainer 
                width="100%" 
                height={chartHeight}
              >
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    outerRadius={chartOuterRadius}
                    innerRadius={chartInnerRadius}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={chartPaddingAngle}
                    minAngle={2}
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={<CustomPieTooltip formatCurrency={formatCurrency} />}
                    wrapperStyle={{ zIndex: 9999, pointerEvents: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                {categoryBreakdown.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                      {entry.name}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Category Summary Cards */}
          {expenseEntries.length > 0 && (
            <motion.div
              className="mx-4 mt-4 lg:mx-0 lg:mt-6"
              variants={prefersReducedMotion ? {} : staggerContainerVariants}
              initial="hidden"
              animate="visible"
            >
              <h3 className={`font-bold text-lg mb-4 px-0 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Summary by Category</h3>
              <div className="grid grid-cols-1 tablet:grid-cols-2 lg:grid-cols-3 gap-3 tablet:gap-4">
                {getCategorySummaryCards().map((summary) => (
                  <div
                    key={summary.category}
                    className={`rounded-2xl p-4 border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          background: getCategoryColor(summary.category),
                          border: `1px solid ${getCategoryColor(summary.category).replace('0.2', '0.3')}`,
                        }}
                      >
                        <span className="text-xl">{getCategoryIcon(summary.category)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{summary.category}</p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-white/80' : 'text-slate-600'}`}>{summary.count} {summary.count === 1 ? 'expense' : 'expenses'}</p>
                      </div>
                    </div>
                    <p className="text-red-600 font-bold text-lg font-mono">{formatCurrency(summary.total)}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Filter Section */}
          <motion.div
            className={`mx-4 mt-4 lg:mx-0 lg:mt-6 rounded-3xl p-4 lg:p-6 border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}
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
              <div>
                <label className={`block text-sm mb-2 ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>Category</label>
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
                  <span>{filterCategory === 'all' ? 'All Categories' : filterCategory}</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="hidden"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters Pills */}
            {getActiveFiltersList().length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {getActiveFiltersList().map((filter, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 rounded-full flex items-center gap-2 flex-shrink-0 bg-rose-100 border border-rose-300"
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

          {/* Expense List */}
          <div className="mt-6">
            <div className="iphone-section-header mb-4">
              <h2 className={`iphone-section-title ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Recent Expenses</h2>
            </div>

            {/* Expense Entry Cards - iPhone Native */}
          {expenseEntries.length === 0 ? (
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
                <h3 className={`font-bold text-2xl mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>No expenses yet</h3>
                <p className={`mb-6 max-w-md mx-auto ${theme === 'dark' ? 'text-white/80' : 'text-slate-600'}`}>Add your first expense entry</p>
              <button
                onClick={() => setShowAddModal(true)}
                  className="px-8 py-3 rounded-2xl font-bold text-white inline-flex items-center gap-2 transition-all active:scale-95 bg-rose-400 border border-rose-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                  Add Expense
              </button>
            </div>
          ) : (
              <motion.div
                className="iphone-transactions-list"
                variants={prefersReducedMotion ? {} : staggerContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {expenseEntries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    variants={prefersReducedMotion ? {} : getListItemVariants(index)}
                    className="iphone-transaction-item relative"
                    style={{
                      background: theme === 'dark' ? 'rgba(42, 45, 61, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                      border: theme === 'dark' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(239, 68, 68, 0.2)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                    }}
                    onTouchStart={(e) => handleTouchStart(e, index)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <div className="iphone-transaction-icon iphone-transaction-icon-expense">
                      <span className="text-xl">{getCategoryIcon(entry.category)}</span>
                    </div>
                    <div className="iphone-transaction-details">
                      <div className={`iphone-transaction-category ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                        {entry.category}
                      </div>
                      <div className="iphone-transaction-date">
                        {formatDate(entry.date).gregorian} • {formatDate(entry.date).hijri}
                      </div>
                      {entry.notes && (
                        <p className={`text-xs italic truncate mt-1 ${theme === 'dark' ? 'text-white/70' : 'text-slate-500'}`}>
                          {entry.notes}
                        </p>
                      )}
                    </div>
                    <div className="iphone-transaction-amount iphone-transaction-amount-expense">
                      -{formatCurrency(entry.amount)}
                    </div>
                    {/* Swipe Actions */}
                    {swipeIndex === index && swipeOffset < -60 && (
                      <div className="absolute right-0 top-0 bottom-0 flex items-center gap-2 pr-4">
                        <button
                          onClick={() => {
                            setSelectedExpense(entry);
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
                            setSelectedExpense(entry);
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
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddExpenseModal
            isOpen={showAddModal}
            onClose={() => {
              setShowAddModal(false);
              setError(null);
            }}
            onSave={handleAddExpense}
          />
          <EditExpenseModal
            isOpen={showEditModal}
            expense={selectedExpense}
            onClose={() => {
              setShowEditModal(false);
              setSelectedExpense(null);
            }}
            onUpdate={handleEditExpense}
        onDelete={(expense) => {
          setSelectedExpense(expense);
          setShowEditModal(false);
          setShowDeleteModal(true);
        }}
          />
          <DeleteConfirmation
            isOpen={showDeleteModal}
            itemName="Expense"
            onConfirm={handleDeleteExpense}
            onCancel={() => {
              setShowDeleteModal(false);
              setSelectedExpense(null);
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
export default function ExpensesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-red-400 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ExpensesPageContent />
    </Suspense>
  );
}
