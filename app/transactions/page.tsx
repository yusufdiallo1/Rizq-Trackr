'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, User } from '@/lib/auth';
import {
  getAllTransactions,
  getTransactionSummary,
  getAllCategories,
  exportTransactionsToCSV,
  downloadCSV,
  Transaction,
  TransactionFilters,
  TransactionSummary,
} from '@/lib/transactions';
import { deleteIncome } from '@/lib/income';
import { deleteExpense, updateExpense } from '@/lib/expenses';
import { ViewTransactionModal } from '@/components/ViewTransactionModal';
import { DeleteConfirmation } from '@/components/DeleteConfirmation';
import { TransactionCard } from '@/components/TransactionCard';
import { FilterBottomSheet } from '@/components/FilterBottomSheet';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { getTextColor, getMutedTextColor } from '@/lib/utils';

const ITEMS_PER_PAGE = 50;

export default function TransactionsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    net: 0,
    transactionCount: 0,
  });
  const [categories, setCategories] = useState<string[]>([]);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [activeFilters, setActiveFilters] = useState<TransactionFilters>({});
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Pull-to-refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      // Let middleware own auth redirects; don't bounce user back to dashboard.
      setLoading(false);
      return;
    }
    setUser(currentUser);

    // Load all data in parallel for maximum speed
    const [cats, transactionsResult] = await Promise.all([
      getAllCategories(currentUser.id),
      getAllTransactions(currentUser.id, {}, 50), // Limit to 50 initial transactions
    ]);
    
    setCategories(cats);
    setTransactions(transactionsResult.data);
    
    // Load summary in parallel (it will fetch its own data, but we can optimize this)
    const summaryData = await getTransactionSummary(currentUser.id, {});
    setSummary(summaryData);

    setLoading(false);
  };

  const loadTransactions = async (userId: string, filters: TransactionFilters) => {
    // Load transactions and summary in parallel
    const [transactionsResult, summaryData] = await Promise.all([
      getAllTransactions(userId, filters), // No limit when filtering
      getTransactionSummary(userId, filters),
    ]);
    
    setTransactions(transactionsResult.data);
    setSummary(summaryData);
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    if (!user) return;

    const filters: TransactionFilters = {
      type: typeFilter,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      searchTerm: searchTerm || undefined,
    };

    setActiveFilters(filters);
    loadTransactions(user.id, filters);
  };

  const handleClearFilters = () => {
    if (!user) return;

    setSearchTerm('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
    setActiveFilters({});
    loadTransactions(user.id, {});
  };

  const removeFilter = (filterType: string) => {
    if (!user) return;

    const newFilters = { ...activeFilters };
    if (filterType === 'type') {
      setTypeFilter('all');
      delete newFilters.type;
    } else if (filterType === 'category') {
      setCategoryFilter('all');
      delete newFilters.category;
    } else if (filterType === 'dates') {
      setStartDate('');
      setEndDate('');
      delete newFilters.startDate;
      delete newFilters.endDate;
    } else if (filterType === 'search') {
      setSearchTerm('');
      delete newFilters.searchTerm;
    }

    setActiveFilters(newFilters);
    loadTransactions(user.id, newFilters);
  };

  const handleExportCSV = () => {
    const csvContent = exportTransactionsToCSV(transactions);
    const filename = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csvContent, filename);
    showToast('Transactions exported successfully!', 'success');
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowViewModal(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setShowViewModal(false);
    if (transaction.type === 'income') {
      router.push(`/income?edit=${transaction.id}`);
    } else {
      router.push(`/expenses?edit=${transaction.id}`);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!user || !selectedTransaction) return;

    if (selectedTransaction.type === 'income') {
      const { error } = await deleteIncome(selectedTransaction.id, user.id);
      if (!error) {
        setShowDeleteModal(false);
        setSelectedTransaction(null);
        await loadTransactions(user.id, activeFilters);
        showToast('Transaction deleted successfully', 'success');
      } else {
        showToast('Failed to delete transaction', 'error');
      }
    } else {
      const { error } = await deleteExpense(selectedTransaction.id, user.id);
      if (!error) {
        setShowDeleteModal(false);
        setSelectedTransaction(null);
        await loadTransactions(user.id, activeFilters);
        showToast('Transaction deleted successfully', 'success');
      } else {
        showToast('Failed to delete transaction', 'error');
      }
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

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: { bg: string; text: string; icon: string } } = {
      'Salary': { bg: 'bg-blue-100', text: 'text-blue-700', icon: '💼' },
      'Business': { bg: 'bg-purple-100', text: 'text-purple-700', icon: '🏢' },
      'Freelance': { bg: 'bg-teal-100', text: 'text-teal-700', icon: '💻' },
      'Gifts': { bg: 'bg-pink-100', text: 'text-pink-700', icon: '🎁' },
      'Investments': { bg: 'bg-orange-100', text: 'text-orange-700', icon: '📈' },
      'Food': { bg: 'bg-red-100', text: 'text-red-700', icon: '🍔' },
      'Transport': { bg: 'bg-blue-100', text: 'text-blue-700', icon: '🚗' },
      'Shopping': { bg: 'bg-pink-100', text: 'text-pink-700', icon: '🛍️' },
      'Entertainment': { bg: 'bg-purple-100', text: 'text-purple-700', icon: '🎬' },
      'Bills': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '📄' },
      'Other': { bg: 'bg-gray-100', text: 'text-gray-700', icon: '💰' }
    };
    return colors[category] || colors['Other'];
  };

  // Pull-to-refresh handlers
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling.current || touchStartY.current === 0) return;
    const currentY = e.touches[0].clientY;
    const distance = currentY - touchStartY.current;
    
    if (distance > 0 && window.scrollY === 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance, 100));
    }
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > 60) {
      setIsRefreshing(true);
      await loadData();
      setIsRefreshing(false);
    }
    setPullDistance(0);
    touchStartY.current = 0;
    isPulling.current = false;
  }, [pullDistance]);

  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Load more transactions
  const handleLoadMore = async () => {
    if (isLoadingMore || currentPage * ITEMS_PER_PAGE >= transactions.length) return;

    setIsLoadingMore(true);
    setCurrentPage(prev => prev + 1);
    setIsLoadingMore(false);
  };

  // Pagination
  const displayedTransactions = transactions.slice(0, currentPage * ITEMS_PER_PAGE);
  const hasMore = transactions.length > currentPage * ITEMS_PER_PAGE;

  const activeFilterCount = [
    typeFilter !== 'all',
    categoryFilter !== 'all',
    startDate,
    endDate,
    minAmount,
    maxAmount,
  ].filter(Boolean).length;

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <PageContainer>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className={`${getTextColor(theme)} font-body`}>Loading transactions...</p>
            </div>
          </div>
        </PageContainer>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 animate-slide-in-right">
          <div
            className="px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl"
            style={{
              background: toast.type === 'success'
                ? 'rgba(16, 185, 129, 0.1)'
                : 'rgba(239, 68, 68, 0.1)',
              borderColor: toast.type === 'success'
                ? 'rgba(16, 185, 129, 0.3)'
                : 'rgba(239, 68, 68, 0.3)',
            }}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' ? (
                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <p className={`font-medium ${toast.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                {toast.message}
              </p>
            </div>
          </div>
        </div>
      )}

      <PageContainer maxWidth="2xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className={`text-4xl font-heading font-bold ${getTextColor(theme)} mb-2`}>
              Transactions
            </h1>
          </div>

          {/* Summary Cards Row */}
          {transactions.length > 0 && (
            <div className="flex gap-4 mb-6 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
              {/* Total Income Card */}
              <div
                className="card-hover flex-shrink-0 w-full sm:w-auto sm:flex-1 rounded-[20px] p-5 cursor-pointer"
                style={{
                  backdropFilter: 'blur(20px)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  minWidth: '200px',
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: 'rgba(16, 185, 129, 0.3)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                  </div>
                  <p className={`text-sm font-medium ${getTextColor(theme)} opacity-70`}>Income</p>
                </div>
                <p className="text-3xl font-bold text-green-500 font-mono">
                  {formatCurrency(summary.totalIncome)}
                </p>
              </div>

              {/* Total Expenses Card */}
              <div
                className="card-hover flex-shrink-0 w-full sm:w-auto tablet:w-auto sm:flex-1 rounded-[20px] p-5 cursor-pointer mobile-tap-target"
                style={{
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  minWidth: '200px',
                  touchAction: 'manipulation',
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: 'rgba(239, 68, 68, 0.3)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                  </div>
                  <p className={`text-sm font-medium ${getTextColor(theme)} opacity-70`}>Expenses</p>
                </div>
                <p className="text-3xl font-bold text-red-500 font-mono">
                  {formatCurrency(summary.totalExpenses)}
                </p>
              </div>

              {/* Net Card */}
              <div
                className="flex-shrink-0 w-full sm:w-auto tablet:w-auto sm:flex-1 rounded-[20px] p-5 transition-all duration-500 cursor-pointer mobile-tap-target"
                style={{
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  background: summary.net >= 0
                    ? 'rgba(245, 158, 11, 0.15)'
                    : 'rgba(107, 114, 128, 0.15)',
                  border: `1px solid ${summary.net >= 0 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(107, 114, 128, 0.3)'}`,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  minWidth: '200px',
                  touchAction: 'manipulation',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05) translateY(-4px)';
                  e.currentTarget.style.boxShadow = summary.net >= 0
                    ? '0 12px 40px rgba(245, 158, 11, 0.4)'
                    : '0 12px 40px rgba(107, 114, 128, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: summary.net >= 0
                        ? 'rgba(245, 158, 11, 0.3)'
                        : 'rgba(107, 114, 128, 0.3)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <svg className={`w-5 h-5 ${summary.net >= 0 ? 'text-amber-500' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                  </div>
                  <p className={`text-sm font-medium ${getTextColor(theme)} opacity-70`}>Net</p>
                </div>
                <p className={`text-3xl font-bold font-mono ${summary.net >= 0 ? 'text-amber-500' : 'text-gray-500'}`}>
                  {formatCurrency(summary.net)}
                </p>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-4 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              className="w-full pl-12 pr-4 py-3 rounded-[20px] transition-all outline-none mobile-input tablet-input"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: getTextColor(theme),
                minHeight: '48px',
                fontSize: '16px',
                WebkitTapHighlightColor: 'transparent',
              }}
            />
          </div>

          {/* Filter Button */}
          <div className="mb-4">
            <button
              onClick={() => setShowFilterSheet(true)}
              className="px-4 py-2.5 rounded-[20px] font-medium transition-all flex items-center gap-2 mobile-tap-target"
            style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: getTextColor(theme),
                minHeight: '44px',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
                  style={{
                    background: 'rgba(6, 182, 212, 0.8)',
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
            </div>

          {/* Active Filters Display */}
            {Object.keys(activeFilters).length > 0 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
                {activeFilters.type && activeFilters.type !== 'all' && (
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap"
                  style={{
                    background: activeFilters.type === 'income'
                      ? 'rgba(16, 185, 129, 0.2)'
                      : 'rgba(239, 68, 68, 0.2)',
                    color: activeFilters.type === 'income' ? '#10b981' : '#ef4444',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  {activeFilters.type === 'income' ? 'Income' : 'Expense'}
                    <button onClick={() => removeFilter('type')} className="hover:opacity-70">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
                {activeFilters.category && (
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap"
                  style={{
                    background: 'rgba(6, 182, 212, 0.2)',
                    color: '#06b6d4',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  {activeFilters.category}
                    <button onClick={() => removeFilter('category')} className="hover:opacity-70">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
                {(activeFilters.startDate || activeFilters.endDate) && (
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap"
                  style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    color: '#3b82f6',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  {activeFilters.startDate || 'Start'} - {activeFilters.endDate || 'End'}
                    <button onClick={() => removeFilter('dates')} className="hover:opacity-70">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
                  </div>
                )}

          {/* Pull-to-Refresh Indicator */}
          {isRefreshing && (
            <div className="flex justify-center py-4">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

          {/* Transaction List */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold ${getTextColor(theme)}`}>
                All Transactions
              </h2>
              <p className={`text-sm ${getMutedTextColor(theme)} opacity-70`}>
                {transactions.length} transactions
              </p>
          </div>

          {transactions.length === 0 ? (
              <div
                className="text-center py-16 rounded-[20px]"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                }}>
                  <svg className="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
                <h3 className={`text-2xl font-bold ${getTextColor(theme)} mb-2`}>
                  No transactions yet
                </h3>
                <p className={`${getMutedTextColor(theme)} opacity-70 mb-6`}>
                  Add your first transaction
                </p>
                <div className="flex gap-3 justify-center">
                <button
                  onClick={() => router.push('/income')}
                    className="px-6 py-3 rounded-xl font-medium text-white transition-all hover:scale-105 mobile-tap-target"
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
                      minHeight: '44px',
                      WebkitTapHighlightColor: 'transparent',
                      touchAction: 'manipulation',
                    }}
                >
                    Add Income
                </button>
                              <button
                    onClick={() => router.push('/expenses')}
                    className="px-6 py-3 rounded-xl font-medium text-white transition-all hover:scale-105 mobile-tap-target"
                    style={{
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      boxShadow: '0 4px 16px rgba(239, 68, 68, 0.4)',
                      minHeight: '44px',
                      WebkitTapHighlightColor: 'transparent',
                      touchAction: 'manipulation',
                    }}
                  >
                    Add Expense
                              </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {displayedTransactions.map((transaction) => (
                  <div key={`${transaction.type}-${transaction.id}`} className="card-hover">
                  <TransactionCard
                    key={`${transaction.type}-${transaction.id}`}
                    transaction={transaction}
                    onView={handleViewTransaction}
                    onDelete={(t) => {
                      setSelectedTransaction(t);
                      setShowDeleteModal(true);
                    }}
                    getCategoryColor={getCategoryColor}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                  />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center mb-6">
                          <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-8 py-3 rounded-xl font-medium transition-all mobile-tap-target"
                style={{
                  background: 'rgba(6, 182, 212, 0.1)',
                  backdropFilter: 'blur(15px)',
                  WebkitBackdropFilter: 'blur(15px)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  color: '#06b6d4',
                  minHeight: '44px',
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                }}
              >
                {isLoadingMore ? 'Loading...' : `Load More (Showing ${displayedTransactions.length} of ${transactions.length})`}
                          </button>
            </div>
          )}

          {/* Export Button */}
          {transactions.length > 0 && (
            <div className="text-center mb-6">
                      <button
                onClick={handleExportCSV}
                className="px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 mx-auto mobile-tap-target"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: getTextColor(theme),
                  minHeight: '44px',
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
                      </button>
                    </div>
          )}
        </PageContainer>

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        isOpen={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        typeFilter={typeFilter}
        categoryFilter={categoryFilter}
        startDate={startDate}
        endDate={endDate}
        minAmount={minAmount}
        maxAmount={maxAmount}
        categories={categories}
        onTypeChange={setTypeFilter}
        onCategoryChange={setCategoryFilter}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onMinAmountChange={setMinAmount}
        onMaxAmountChange={setMaxAmount}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

      {/* Modals */}
      <ViewTransactionModal
        isOpen={showViewModal}
        transaction={selectedTransaction}
        onClose={() => {
          setShowViewModal(false);
          setSelectedTransaction(null);
        }}
        onEdit={handleEditTransaction}
        onDelete={(transaction) => {
          setShowViewModal(false);
          setSelectedTransaction(transaction);
          setShowDeleteModal(true);
        }}
      />

      <DeleteConfirmation
        isOpen={showDeleteModal}
        itemName="Transaction"
        onConfirm={handleDeleteTransaction}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedTransaction(null);
        }}
      />
    </DashboardLayout>
  );
}
