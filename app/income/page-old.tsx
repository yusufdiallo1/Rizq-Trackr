'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, User } from '@/lib/auth';
import {
  getIncomeEntries,
  createIncome,
  updateIncome,
  deleteIncome,
  IncomeEntry,
  IncomeFilters,
} from '@/lib/income';
import { AddIncomeModal } from '@/components/AddIncomeModal';
import { EditIncomeModal } from '@/components/EditIncomeModal';
import { DeleteConfirmation } from '@/components/DeleteConfirmation';

export default function IncomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<IncomeEntry | null>(null);

  // Filter state
  const [filterMonth, setFilterMonth] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeFilters, setActiveFilters] = useState<IncomeFilters>({});

  const categories = ['Salary', 'Business', 'Freelance', 'Gifts', 'Investments', 'Other'];

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
    await loadIncomeEntries(currentUser.id, {});
    setLoading(false);
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

    const { error } = await createIncome(user.id, {
      ...data,
      category: data.category as any, // Type assertion to match database enum
    });
    if (!error) {
      setShowAddModal(false);
      await loadIncomeEntries(user.id, activeFilters);
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
      category: data.category as any, // Type assertion to match database enum
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

  const getActiveFiltersDisplay = () => {
    const parts = [];

    if (activeFilters.month && activeFilters.year) {
      const date = new Date(activeFilters.year, activeFilters.month - 1);
      parts.push(date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }));
    }

    if (activeFilters.category) {
      parts.push(activeFilters.category);
    }

    return parts.length > 0 ? `Showing: ${parts.join(', ')}` : '';
  };

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '50px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>Income Tracking</h1>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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
            onClick={() => router.push('/savings')}
            style={{
              padding: '10px 20px',
              border: '1px solid #0a0',
              borderRadius: '4px',
              backgroundColor: 'white',
              color: '#0a0',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Savings
          </button>
          <button
            onClick={() => router.push('/transactions')}
            style={{
              padding: '10px 20px',
              border: '1px solid #8b5cf6',
              borderRadius: '4px',
              backgroundColor: 'white',
              color: '#8b5cf6',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Transactions
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#0070f3',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Add Income
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div style={{
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        marginBottom: '20px',
      }}>
        <h3 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: '500' }}>Filters</h3>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
              Month
            </label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              style={{
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                minWidth: '200px',
              }}
            >
              <option value="">All Months</option>
              {getMonthOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                minWidth: '200px',
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

          <button
            onClick={handleApplyFilters}
            style={{
              padding: '8px 16px',
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

          {Object.keys(activeFilters).length > 0 && (
            <button
              onClick={handleClearFilters}
              style={{
                padding: '8px 16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {getActiveFiltersDisplay() && (
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            {getActiveFiltersDisplay()}
          </p>
        )}
      </div>

      {/* Income Entries Table */}
      {incomeEntries.length === 0 ? (
        <div style={{
          padding: '60px',
          textAlign: 'center',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
        }}>
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '10px' }}>
            No income entries yet. Add your first one!
          </p>
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
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
                {incomeEntries.map((entry) => (
                  <tr key={entry.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px', fontSize: '14px' }}>
                      {formatDate(entry.date)}
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>
                      {entry.category}
                    </td>
                    <td style={{
                      padding: '12px',
                      fontSize: '14px',
                      textAlign: 'right',
                      fontWeight: '500',
                      color: '#0a0',
                    }}>
                      {formatCurrency(entry.amount)}
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
                      {entry.notes || '-'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          setSelectedIncome(entry);
                          setShowEditModal(true);
                        }}
                        style={{
                          padding: '5px 12px',
                          border: '1px solid #0070f3',
                          borderRadius: '4px',
                          backgroundColor: 'white',
                          color: '#0070f3',
                          cursor: 'pointer',
                          fontSize: '12px',
                          marginRight: '5px',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedIncome(entry);
                          setShowDeleteModal(true);
                        }}
                        style={{
                          padding: '5px 12px',
                          border: '1px solid #c00',
                          borderRadius: '4px',
                          backgroundColor: 'white',
                          color: '#c00',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div style={{
            padding: '20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            marginTop: '20px',
            textAlign: 'right',
          }}>
            <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
              Total: {formatCurrency(calculateTotal())}
            </p>
          </div>
        </>
      )}

      {/* Modals */}
      <AddIncomeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
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
    </div>
  );
}
