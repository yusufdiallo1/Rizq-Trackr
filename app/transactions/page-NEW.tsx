'use client';

import { useEffect, useState } from 'react';
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
import { ViewTransactionModal } from '@/components/ViewTransactionModal';
import { DeleteConfirmation } from '@/components/DeleteConfirmation';
import { Navbar } from '@/components/layout/Navbar';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/layout/Card';
import { IslamicPattern } from '@/components/layout/IslamicPattern';

const ITEMS_PER_PAGE = 50;

export default function TransactionsPage() {
  const router = useRouter();
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
  const [activeFilters, setActiveFilters] = useState<TransactionFilters>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    const cats = await getAllCategories(currentUser.id);
    setCategories(cats);

    await loadTransactions(currentUser.id, {});
    setLoading(false);
  };

  const loadTransactions = async (userId: string, filters: TransactionFilters) => {
    const { data } = await getAllTransactions(userId, filters);
    setTransactions(data);

    const summaryData = await getTransactionSummary(userId, filters);
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
      alert('Expense editing coming soon!');
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
      }
    } else {
      alert('Expense deletion coming soon!');
      setShowDeleteModal(false);
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

  // Pagination
  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTransactions = transactions.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  };

  if (loading) {
    return (
      <>
        <IslamicPattern />
        <Navbar user={user} />
        <PageContainer>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-charcoal font-body">Loading transactions...</p>
            </div>
          </div>
        </PageContainer>
      </>
    );
  }

  return (
    <>
      <IslamicPattern />
      <Navbar user={user} />

      <div className="pt-20">
        <PageContainer maxWidth="2xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-heading font-bold text-charcoal-dark mb-2">Transaction History</h1>
              <p className="text-charcoal opacity-70">All your income and expenses in one place</p>
            </div>
            <button
              onClick={handleExportCSV}
              disabled={transactions.length === 0}
              className={`px-6 py-3 border-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                transactions.length > 0
                  ? 'border-primary text-primary hover:bg-primary hover:text-white'
                  : 'border-gray-300 text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
          </div>

          {/* Summary Cards */}
          {transactions.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-green-50 to-white border border-green-200">
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-600">Total Income</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalIncome)}</p>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-white border border-red-200">
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-600">Total Expenses</p>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalExpenses)}</p>
                </div>
              </Card>

              <Card className={`bg-gradient-to-br ${summary.net >= 0 ? 'from-emerald-50 to-white border-emerald-200' : 'from-red-50 to-white border-red-200'} border`}>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 ${summary.net >= 0 ? 'bg-emerald-100' : 'bg-red-100'} rounded-lg flex items-center justify-center`}>
                      <svg className={`w-5 h-5 ${summary.net >= 0 ? 'text-emerald-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-600">Net Balance</p>
                  </div>
                  <p className={`text-2xl font-bold ${summary.net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatCurrency(summary.net)}
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* Search & Filters */}
          <Card className="mb-6">
            <h3 className="text-lg font-semibold text-charcoal-dark mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Search & Filters
            </h3>

            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal opacity-40">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by category, notes, or amount..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Filter Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as 'all' | 'income' | 'expense')}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                >
                  <option value="all">All Transactions</option>
                  <option value="income">Income Only</option>
                  <option value="expense">Expense Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">From Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-1.5">To Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleApplyFilters}
                className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg font-medium shadow-islamic hover:shadow-card-hover transition-all"
              >
                Apply Filters
              </button>
              {Object.keys(activeFilters).length > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-2.5 border-2 border-gray-300 text-charcoal rounded-lg font-medium hover:bg-gray-50 transition-all"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Active Filter Chips */}
            {Object.keys(activeFilters).length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {activeFilters.type && activeFilters.type !== 'all' && (
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                    activeFilters.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    Type: {activeFilters.type === 'income' ? 'Income' : 'Expense'}
                    <button onClick={() => removeFilter('type')} className="hover:opacity-70">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
                {activeFilters.category && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary bg-opacity-10 text-primary rounded-full text-sm font-medium">
                    Category: {activeFilters.category}
                    <button onClick={() => removeFilter('category')} className="hover:opacity-70">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
                {(activeFilters.startDate || activeFilters.endDate) && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    Date: {activeFilters.startDate || 'Start'} - {activeFilters.endDate || 'End'}
                    <button onClick={() => removeFilter('dates')} className="hover:opacity-70">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
                {activeFilters.searchTerm && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    Search: &quot;{activeFilters.searchTerm}&quot;
                    <button onClick={() => removeFilter('search')} className="hover:opacity-70">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Transaction Table or Empty State */}
          {transactions.length === 0 ? (
            <Card className="text-center py-16">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-heading font-bold text-charcoal-dark mb-2">No transactions found</h3>
              <p className="text-charcoal opacity-70 mb-6 max-w-md mx-auto">
                {Object.keys(activeFilters).length > 0
                  ? 'Try adjusting your filters to see more results'
                  : 'Start adding income and expenses to see your transaction history'}
              </p>
              {Object.keys(activeFilters).length === 0 && (
                <button
                  onClick={() => router.push('/income')}
                  className="px-8 py-3 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg shadow-islamic hover:shadow-card-hover transition-all font-medium"
                >
                  Add Your First Transaction
                </button>
              )}
            </Card>
          ) : (
            <>
              {/* Table */}
              <Card className="overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-cream to-cream-light border-b-2 border-primary border-opacity-10">
                        <th className="px-6 py-4 text-left text-xs font-bold text-charcoal uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Date
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-charcoal uppercase tracking-wider">Type</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-charcoal uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-charcoal uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-charcoal uppercase tracking-wider">Notes</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-charcoal uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedTransactions.map((transaction, index) => {
                        const categoryColor = getCategoryColor(transaction.category);
                        return (
                          <tr
                            key={`${transaction.type}-${transaction.id}`}
                            className={`hover:bg-slate-50 transition-all group ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50 bg-opacity-30'
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-charcoal opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm text-charcoal font-medium">{formatDate(transaction.date)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full ${
                                transaction.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {transaction.type === 'income' ? (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                  </svg>
                                )}
                                {transaction.type === 'income' ? 'Income' : 'Expense'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold ${categoryColor.bg} ${categoryColor.text} rounded-full`}>
                                <span>{categoryColor.icon}</span>
                                {transaction.category}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className={`text-lg font-bold font-mono ${
                                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-charcoal max-w-xs truncate">
                              {transaction.notes ? (
                                <span className="italic opacity-70">{transaction.notes}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <button
                                onClick={() => handleViewTransaction(transaction)}
                                className="p-2 text-primary hover:bg-primary hover:bg-opacity-10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                title="View Details"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Pagination */}
              {totalPages > 1 && (
                <Card className="bg-slate-50">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-600">
                      Showing {startIndex + 1}-{Math.min(endIndex, transactions.length)} of {transactions.length} transactions
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 border rounded-lg font-medium transition-all ${
                          currentPage === 1
                            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 text-charcoal hover:bg-white'
                        }`}
                      >
                        Previous
                      </button>

                      {renderPageNumbers().map((page, index) => (
                        page === '...' ? (
                          <span key={`ellipsis-${index}`} className="px-2 text-slate-400">...</span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page as number)}
                            className={`w-10 h-10 rounded-lg font-medium transition-all ${
                              currentPage === page
                                ? 'bg-primary text-white shadow-islamic'
                                : 'text-charcoal hover:bg-white'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      ))}

                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 border rounded-lg font-medium transition-all ${
                          currentPage === totalPages
                            ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 text-charcoal hover:bg-white'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}

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
        </PageContainer>
      </div>
    </>
  );
}
