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

    // Load categories and initial data
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

    // Reset to page 1 when filters change
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
    // Redirect to appropriate edit page
    if (transaction.type === 'income') {
      router.push(`/income?edit=${transaction.id}`);
    } else {
      // For now, just close since we don't have expense page yet
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
      // For now, just close since we don't have expense deletion yet
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

  // Pagination calculations
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

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '50px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>Transaction History</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '10px 20px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Dashboard
          </button>
          <button
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: transactions.length > 0 ? '#0070f3' : '#ccc',
              color: 'white',
              cursor: transactions.length > 0 ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '30px',
      }}>
        <div style={{
          padding: '20px',
          backgroundColor: '#e6f7ed',
          borderRadius: '8px',
        }}>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
            Total Income
          </p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#0a0' }}>
            {formatCurrency(summary.totalIncome)}
          </p>
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: '#fee',
          borderRadius: '8px',
        }}>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
            Total Expenses
          </p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#c00' }}>
            {formatCurrency(summary.totalExpenses)}
          </p>
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: summary.net >= 0 ? '#e6f7ed' : '#fee',
          borderRadius: '8px',
        }}>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
            Net
          </p>
          <p style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: summary.net >= 0 ? '#0a0' : '#c00',
          }}>
            {formatCurrency(summary.net)}
          </p>
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
        }}>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
            Transactions
          </p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
            {summary.transactionCount}
          </p>
        </div>
      </div>

      {/* Search & Filters Section */}
      <div style={{
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        marginBottom: '20px',
      }}>
        <h3 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: '500' }}>
          Search & Filters
        </h3>

        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Search by category, notes, or amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '15px',
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'income' | 'expense')}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              <option value="all">All</option>
              <option value="income">Income Only</option>
              <option value="expense">Expense Only</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleApplyFilters}
            style={{
              padding: '8px 20px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#0070f3',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Apply Filters
          </button>
          <button
            onClick={handleClearFilters}
            style={{
              padding: '8px 20px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      {transactions.length === 0 ? (
        <div style={{
          padding: '60px',
          textAlign: 'center',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
        }}>
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>
            No transactions yet
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => router.push('/income')}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#0070f3',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Add Income
            </button>
            <button
              style={{
                padding: '10px 20px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#f5f5f5',
                color: '#999',
                cursor: 'not-allowed',
                fontSize: '14px',
              }}
              disabled
            >
              Add Expense (Coming Soon)
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '14px',
                    borderBottom: '2px solid #ddd',
                  }}>
                    Date
                  </th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '14px',
                    borderBottom: '2px solid #ddd',
                  }}>
                    Type
                  </th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '14px',
                    borderBottom: '2px solid #ddd',
                  }}>
                    Category
                  </th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'right',
                    fontWeight: '600',
                    fontSize: '14px',
                    borderBottom: '2px solid #ddd',
                  }}>
                    Amount
                  </th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: '14px',
                    borderBottom: '2px solid #ddd',
                  }}>
                    Notes
                  </th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'center',
                    fontWeight: '600',
                    fontSize: '14px',
                    borderBottom: '2px solid #ddd',
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map((transaction) => (
                  <tr
                    key={`${transaction.type}-${transaction.id}`}
                    style={{ borderBottom: '1px solid #eee', cursor: 'pointer' }}
                    onClick={() => handleViewTransaction(transaction)}
                  >
                    <td style={{ padding: '12px', fontSize: '14px' }}>
                      {formatDate(transaction.date)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: transaction.type === 'income' ? '#e6f7ed' : '#fee',
                        color: transaction.type === 'income' ? '#0a0' : '#c00',
                      }}>
                        {transaction.type === 'income' ? 'Income' : 'Expense'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>
                      {transaction.category}
                    </td>
                    <td style={{
                      padding: '12px',
                      fontSize: '14px',
                      textAlign: 'right',
                      fontWeight: '500',
                      color: transaction.type === 'income' ? '#0a0' : '#c00',
                    }}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td style={{
                      padding: '12px',
                      fontSize: '14px',
                      color: '#666',
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {transaction.notes || '-'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewTransaction(transaction);
                        }}
                        style={{
                          padding: '5px 12px',
                          border: '1px solid #0070f3',
                          borderRadius: '4px',
                          backgroundColor: 'white',
                          color: '#0070f3',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
            }}>
              <p style={{ fontSize: '14px', color: '#666' }}>
                Showing {startIndex + 1}-{Math.min(endIndex, transactions.length)} of {transactions.length} transactions
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: currentPage === 1 ? '#f5f5f5' : 'white',
                    color: currentPage === 1 ? '#999' : '#333',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Previous
                </button>
                <span style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  color: '#666',
                }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: currentPage === totalPages ? '#f5f5f5' : 'white',
                    color: currentPage === totalPages ? '#999' : '#333',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Next
                </button>
              </div>
            </div>
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
    </div>
  );
}
