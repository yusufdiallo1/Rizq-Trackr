'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, User } from '@/lib/auth';
import {
  getCurrentSavings,
  getSavingsHistory,
  getSavingsGoalsWithProgress,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  getMonthOverMonthChange,
  SavingsHistoryItem,
  GoalProgress,
  SavingsGoal,
} from '@/lib/savings';
import { SavingsGoalForm } from '@/components/SavingsGoalForm';
import { EditSavingsGoalModal } from '@/components/EditSavingsGoalModal';
import { DeleteConfirmation } from '@/components/DeleteConfirmation';

export default function SavingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [monthOverMonth, setMonthOverMonth] = useState({ change: 0, percentage: 0 });
  const [savingsHistory, setSavingsHistory] = useState<SavingsHistoryItem[]>([]);
  const [goalsWithProgress, setGoalsWithProgress] = useState<GoalProgress[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

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

    // Load all data in parallel
    const [savings, history, goals, momChange] = await Promise.all([
      getCurrentSavings(currentUser.id),
      getSavingsHistory(currentUser.id, 12),
      getSavingsGoalsWithProgress(currentUser.id),
      getMonthOverMonthChange(currentUser.id),
    ]);

    setCurrentSavings(savings);
    setSavingsHistory(history);
    setGoalsWithProgress(goals.data);
    setMonthOverMonth(momChange);
    setLoading(false);
  };

  const handleAddGoal = async (goalName: string, targetAmount: number) => {
    if (!user) return;

    const { error } = await createSavingsGoal(user.id, goalName, targetAmount);
    if (!error) {
      // Reload goals
      const { data } = await getSavingsGoalsWithProgress(user.id);
      setGoalsWithProgress(data);
    }
  };

  const handleUpdateGoal = async (id: string, data: { goalName: string; targetAmount: number; icon?: string; targetDate?: string }) => {
    if (!user) return;

    const { error } = await updateSavingsGoal(id, user.id, {
      goal_name: data.goalName,
      target_amount: data.targetAmount,
    });

    if (!error) {
      setShowEditModal(false);
      setSelectedGoal(null);
      // Reload goals
      const { data } = await getSavingsGoalsWithProgress(user.id);
      setGoalsWithProgress(data);
    }
  };

  const handleDeleteGoal = async () => {
    if (!user || !selectedGoal) return;

    const { error } = await deleteSavingsGoal(selectedGoal.id, user.id);
    if (!error) {
      setShowDeleteModal(false);
      setSelectedGoal(null);
      // Reload goals
      const { data } = await getSavingsGoalsWithProgress(user.id);
      setGoalsWithProgress(data);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getMonthOverMonthDisplay = () => {
    if (monthOverMonth.change === 0) {
      return 'No change vs last month';
    }

    const sign = monthOverMonth.change > 0 ? '+' : '';
    return `${sign}${formatCurrency(monthOverMonth.change)} vs last month`;
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
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>Savings Tracker</h1>
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
            onClick={() => router.push('/income')}
            style={{
              padding: '10px 20px',
              border: '1px solid #0070f3',
              borderRadius: '4px',
              backgroundColor: 'white',
              color: '#0070f3',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Income
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
        </div>
      </div>

      {/* Current Savings Card */}
      <div style={{
        padding: '30px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        marginBottom: '30px',
      }}>
        <h2 style={{ fontSize: '18px', color: '#666', marginBottom: '10px' }}>
          Current Savings
        </h2>
        <p style={{
          fontSize: '48px',
          fontWeight: 'bold',
          color: currentSavings >= 0 ? '#0a0' : '#c00',
          marginBottom: '10px',
        }}>
          {formatCurrency(currentSavings)}
        </p>
        <p style={{
          fontSize: '16px',
          color: monthOverMonth.change >= 0 ? '#0a0' : '#c00',
        }}>
          {getMonthOverMonthDisplay()}
        </p>
      </div>

      {/* Savings Growth Table */}
      <div style={{
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #ddd',
        marginBottom: '30px',
      }}>
        <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '500' }}>
          Savings Growth (Last 12 Months)
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
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
                  Month
                </th>
                <th style={{
                  padding: '12px',
                  textAlign: 'right',
                  fontWeight: '600',
                  fontSize: '14px',
                  borderBottom: '2px solid #ddd',
                }}>
                  Cumulative Income
                </th>
                <th style={{
                  padding: '12px',
                  textAlign: 'right',
                  fontWeight: '600',
                  fontSize: '14px',
                  borderBottom: '2px solid #ddd',
                }}>
                  Cumulative Expenses
                </th>
                <th style={{
                  padding: '12px',
                  textAlign: 'right',
                  fontWeight: '600',
                  fontSize: '14px',
                  borderBottom: '2px solid #ddd',
                }}>
                  Savings
                </th>
              </tr>
            </thead>
            <tbody>
              {savingsHistory.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    {item.month}
                  </td>
                  <td style={{
                    padding: '12px',
                    fontSize: '14px',
                    textAlign: 'right',
                    color: '#0a0',
                  }}>
                    {formatCurrency(item.income)}
                  </td>
                  <td style={{
                    padding: '12px',
                    fontSize: '14px',
                    textAlign: 'right',
                    color: '#c00',
                  }}>
                    {formatCurrency(item.expenses)}
                  </td>
                  <td style={{
                    padding: '12px',
                    fontSize: '14px',
                    textAlign: 'right',
                    fontWeight: '500',
                    color: item.savings >= 0 ? '#0a0' : '#c00',
                  }}>
                    {formatCurrency(item.savings)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Savings Goal Form */}
      <SavingsGoalForm onSave={handleAddGoal} />

      {/* Savings Goals Section */}
      <div style={{
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #ddd',
      }}>
        <h3 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: '500' }}>
          Savings Goals
        </h3>

        {goalsWithProgress.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
            No savings goals yet. Add your first one above!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {goalsWithProgress.map((goal) => (
              <div
                key={goal.goalId}
                style={{
                  padding: '20px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#f9f9f9',
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '15px',
                }}>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '5px' }}>
                      {goal.goalName}
                    </h4>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                      Target: {formatCurrency(goal.targetAmount)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button
                      onClick={() => {
                        setSelectedGoal({
                          id: goal.goalId,
                          user_id: user?.id || '',
                          goal_name: goal.goalName,
                          target_amount: goal.targetAmount,
                          icon: null,
                          target_date: null,
                          created_at: '',
                        });
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
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedGoal({
                          id: goal.goalId,
                          user_id: user?.id || '',
                          goal_name: goal.goalName,
                          target_amount: goal.targetAmount,
                          icon: null,
                          target_date: null,
                          created_at: '',
                        });
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
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{
                    width: '100%',
                    height: '24px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '12px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${Math.min(goal.percentage, 100)}%`,
                      height: '100%',
                      backgroundColor: goal.isReached ? '#0a0' : '#0070f3',
                      transition: 'width 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}>
                      {goal.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Progress Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {goal.isReached ? (
                    <p style={{
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#0a0',
                    }}>
                      ✅ Goal Reached!
                    </p>
                  ) : (
                    <p style={{ fontSize: '14px', color: '#666' }}>
                      {formatCurrency(goal.remaining)} remaining
                    </p>
                  )}
                  <p style={{ fontSize: '14px', color: '#666' }}>
                    Current: {formatCurrency(goal.currentSavings)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <EditSavingsGoalModal
        isOpen={showEditModal}
        goal={selectedGoal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedGoal(null);
        }}
        onUpdate={handleUpdateGoal}
        onDelete={(goal) => {
          setSelectedGoal(goal);
          setShowEditModal(false);
          setShowDeleteModal(true);
        }}
      />

      <DeleteConfirmation
        isOpen={showDeleteModal}
        itemName="Savings Goal"
        onConfirm={handleDeleteGoal}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedGoal(null);
        }}
      />
    </div>
  );
}
