'use client';

import { useEffect, useState, useCallback } from 'react';
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
  GoalProgress,
  SavingsGoal,
} from '@/lib/savings';
import { DashboardLayout } from '@/components/layout';
import { IslamicPattern } from '@/components/layout/IslamicPattern';
import { AddSavingsGoalModal } from '@/components/AddSavingsGoalModal';
import { EditSavingsGoalModal } from '@/components/EditSavingsGoalModal';
import { DeleteConfirmation } from '@/components/DeleteConfirmation';
import LoadingScreen from '@/components/LoadingScreen';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { getTextColor, getMutedTextColor, getCardTextColor } from '@/lib/utils';
import { motion, useReducedMotion } from 'framer-motion';
import { getCardVariants, staggerContainerVariants, getListItemVariants } from '@/lib/animations';
import { PreciousMetalsModal } from '@/components/PreciousMetalsModal';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

const GOAL_ICONS = ['🏠', '🚗', '✈️', '💍', '📚', '🏥', '🕌', '💰', '🎓', '🎁', '💻', '🏖️'];

export default function SavingsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [monthOverMonth, setMonthOverMonth] = useState({ change: 0, percentage: 0 });
  const [savingsHistory, setSavingsHistory] = useState<any[]>([]);
  const [goalsWithProgress, setGoalsWithProgress] = useState<GoalProgress[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'6M' | '1Y' | 'All'>('1Y');
  const [showPreciousMetalsModal, setShowPreciousMetalsModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    let isMounted = true;
    setLoading(true);

    const currentUser = await getCurrentUser();
    if (!currentUser || !isMounted) {
      // Avoid redirect loop when auth lookup is slow; middleware already protects page.
      if (isMounted) {
        setLoading(false);
      }
      return () => { isMounted = false; };
    }
    if (isMounted) {
      setUser(currentUser);
    }

    // Load data in parallel
    try {
      const [savings, history, goalsResult, momChange] = await Promise.all([
        getCurrentSavings(currentUser.id).catch(() => 0),
        getSavingsHistory(currentUser.id, 12).catch(() => []),
        getSavingsGoalsWithProgress(currentUser.id).catch(() => ({ data: [], error: null })),
        getMonthOverMonthChange(currentUser.id).catch(() => ({ change: 0, percentage: 0 })),
      ]);

      if (isMounted) {
        setCurrentSavings(savings);
        setSavingsHistory(history);
        setGoalsWithProgress(goalsResult.data || []);
        setMonthOverMonth(momChange);
      }
    } catch (error) {
      // Silent error - will show empty state
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddGoal = async (data: { goalName: string; targetAmount: number; icon?: string; targetDate?: string; notes?: string }) => {
    if (!user) return;
    setLoading(true); // Add loading state
    try {
      const { error } = await createSavingsGoal(user.id, data.goalName, data.targetAmount, data.icon, data.targetDate, data.notes);
      if (!error) {
        setShowAddModal(false);
        showToast('Savings goal created successfully!', 'success');
        const { data: goals } = await getSavingsGoalsWithProgress(user.id);
        setGoalsWithProgress(goals || []);
      } else {
        showToast(`Failed to create goal: ${error}`, 'error');
      }
    } catch (err: any) {
      // Silent error - user will see toast notification
      showToast('An unexpected error occurred while creating the goal', 'error');
    }
  };

  const handleUpdateGoal = async (id: string, data: { goalName: string; targetAmount: number; icon?: string; targetDate?: string }) => {
    if (!user) return;
    try {
    const { error } = await updateSavingsGoal(id, user.id, {
      goal_name: data.goalName,
      target_amount: data.targetAmount,
        icon: data.icon || null,
        target_date: data.targetDate || null,
    });
      if (error) {
        // Silent error - user will see toast notification
        showToast(`Failed to update goal: ${error}`, 'error');
        return;
      }
      // Close modal first
      setShowEditModal(false);
      setSelectedGoal(null);
      showToast('Savings goal updated successfully!', 'success');
      // Reload goals data
      const { data: goals } = await getSavingsGoalsWithProgress(user.id);
      setGoalsWithProgress(goals || []);
    } catch (err) {
      // Silent error - user will see toast notification
      showToast('An unexpected error occurred while updating the goal', 'error');
    }
  };

  const handleDeleteGoal = async () => {
    if (!user || !selectedGoal) return;
    try {
      const { error } = await deleteSavingsGoal(selectedGoal.id, user.id);
      if (!error) {
        setShowDeleteModal(false);
        setSelectedGoal(null);
        showToast('Savings goal deleted successfully!', 'success');
        const { data: goals } = await getSavingsGoalsWithProgress(user.id);
        setGoalsWithProgress(goals || []);
      } else {
        showToast(`Failed to delete goal: ${error}`, 'error');
      }
    } catch (err: any) {
      // Silent error - user will see toast notification
      showToast('An unexpected error occurred while deleting the goal', 'error');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getGoalIcon = (index: number) => {
    return GOAL_ICONS[index % GOAL_ICONS.length];
  };

  const getProgressStatus = (percentage: number) => {
    if (percentage >= 100) return { text: 'Goal Reached! 🎉', color: 'text-green-700', bg: 'bg-green-100/80', border: 'border-green-300' };
    if (percentage >= 80) return { text: 'Almost there!', color: 'text-orange-700', bg: 'bg-orange-100/80', border: 'border-orange-300' };
    if (percentage < 20) return { text: 'Just getting started', color: 'text-blue-700', bg: 'bg-blue-100/80', border: 'border-blue-300' };
    return null;
  };

  if (loading) {
    return <LoadingScreen />;
  }

  // Filter savings history based on selected period
  const getFilteredHistory = () => {
    if (selectedPeriod === 'All') return savingsHistory;
    if (selectedPeriod === '1Y') return savingsHistory.slice(-12);
    return savingsHistory.slice(-6); // 6M
  };

  return (
    <DashboardLayout user={user}>
      {/* Scrollable Content Area - iPhone Native */}
      <div className="relative z-10 pt-4 px-4 space-y-4 pb-6">
          {/* Hero Section - iPhone Native */}
          <motion.div
            className="iphone-summary-card rounded-[28px] overflow-hidden relative mb-4"
            variants={prefersReducedMotion ? {} : getCardVariants(0)}
            initial="hidden"
            animate="visible"
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.9), rgba(16, 185, 129, 0.9))',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            {/* Background gradient - Gold to Emerald */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-emerald-400"></div>

            {/* Decorative coin pattern background removed to reduce visual noise */}

            {/* Glass layer */}
            <div 
              className="relative border shadow-2xl p-8 lg:p-12"
              style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.35), rgba(16, 185, 129, 0.4))',
                border: '1px solid rgba(255, 255, 255, 0.30)',
                borderRadius: '28px',
              }}
            >
              <div className="text-center">
                {/* Treasure chest icon with glass effect - Gold */}
                <div className="flex items-center justify-center mb-6">
                  <div 
                    className="w-16 h-16 lg:w-20 lg:h-20 bg-white/40 rounded-full flex items-center justify-center border border-white/40 shadow-xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.35)',
                    }}
                  >
                    <span className="text-5xl lg:text-6xl">💰</span>
                  </div>
                </div>

                <p className="text-white/70 text-xs uppercase tracking-wider mb-3 font-medium">
                  Current Savings
                </p>

                <p className="text-5xl lg:text-7xl font-bold font-mono mb-6 text-white" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                  {formatCurrency(currentSavings)}
                </p>

                {/* Trend indicator - Glass pill with sparkle icons */}
                <div 
                  className="inline-flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-3 rounded-full border shadow-lg relative bg-white/25"
                  style={{
                    border: '1px solid rgba(255, 255, 255, 0.35)',
                  }}
                >
                  {/* Sparkle icons */}
                  <span className="text-white/30 text-xs absolute -left-2 -top-1">✨</span>
                  <span className="text-white/30 text-xs absolute -right-2 -top-1">✨</span>
                  {monthOverMonth.change >= 0 ? (
                    <>
                      <svg className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="font-bold text-emerald-400 text-sm lg:text-lg">+{formatCurrency(monthOverMonth.change)}</span>
                      <span className="text-white/70 text-sm lg:text-lg">this month</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 lg:w-6 lg:h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="font-bold text-red-400 text-sm lg:text-lg">{formatCurrency(monthOverMonth.change)}</span>
                      <span className="text-white/70 text-sm lg:text-lg">this month</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Precious Metals Converter Button */}
          <motion.div
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

          {/* Savings Growth Chart - iPhone Native */}
          <motion.div
            className="rounded-3xl overflow-hidden mb-4"
            style={{
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              background: theme === 'dark' ? 'rgba(42, 45, 61, 0.8)' : 'rgba(255, 255, 255, 0.9)',
              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(15, 23, 42, 0.06)',
              borderRadius: '24px',
            }}
            variants={prefersReducedMotion ? {} : getCardVariants(2)}
            initial="hidden"
            animate="visible"
          >
            <div className="p-4 lg:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h3 className={`text-xl lg:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Savings Growth</h3>
                {/* Period Selector - Glass Tab Pills */}
                <div className="flex gap-2">
                  {(['6M', '1Y', 'All'] as const).map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all mobile-tap-target ${
                        selectedPeriod === period
                          ? theme === 'dark'
                            ? 'text-cyan-300 bg-cyan-900/30 border border-cyan-500/50 shadow-lg'
                            : 'text-cyan-700 bg-cyan-100 border border-cyan-300 shadow-lg'
                          : theme === 'dark'
                            ? 'text-white/70 bg-slate-700/50 border border-slate-600 hover:bg-slate-600/50'
                            : 'text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200'
                      }`}
                      style={{
                        minHeight: '36px',
                        minWidth: '44px',
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'manipulation',
                      }}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {getFilteredHistory().length > 0 ? (
                <div className="h-[200px] tablet:h-[300px] lg:h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getFilteredHistory()}>
                    <defs>
                      <linearGradient id="savingsGlassGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.4)'}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      stroke={theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(15, 23, 42, 0.7)'}
                      tick={{ fontSize: 12, fill: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 23, 42, 0.8)' }}
                      axisLine={{ stroke: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(148, 163, 184, 0.6)' }}
                    />
                    <YAxis
                      stroke={theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(15, 23, 42, 0.7)'}
                      tick={{ fontSize: 12, fill: theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 23, 42, 0.8)' }}
                      axisLine={{ stroke: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(148, 163, 184, 0.6)' }}
                      tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        background: '#0f172a',
                        border: '1px solid rgba(148, 163, 184, 0.6)',
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.4)',
                        padding: '12px',
                        color: 'white',
                      }}
                      labelStyle={{ color: '#e5e7eb', fontWeight: 600 }}
                      itemStyle={{ color: '#10b981' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="savings"
                      stroke="#10b981"
                      strokeWidth={3}
                      fill="url(#savingsGlassGradient)"
                      dot={{
                        fill: '#10b981',
                        r: 4,
                        strokeWidth: 2,
                        stroke: '#fff'
                      }}
                      activeDot={{
                        r: 6,
                        fill: '#10b981',
                        stroke: '#fff',
                        strokeWidth: 2
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-40 flex flex-col items-center justify-center text-center">
                  <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-white/70' : 'text-slate-500'}`}>No savings history yet.</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-white/60' : 'text-slate-400'}`}>
                    Add income and savings transactions to see your growth chart here.
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Savings Goals Section - iPhone Native */}
          <motion.div
            variants={prefersReducedMotion ? {} : getCardVariants(3)}
            initial="hidden"
            animate="visible"
          >
            <div className="iphone-section-header mb-4">
              <h2 className={`iphone-section-title ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Savings Goals</h2>
              <motion.button
                onClick={() => setShowAddModal(true)}
                className="iphone-button iphone-button-primary"
                style={{
                  minHeight: '44px',
                  padding: '0.75rem 1.5rem',
                }}
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Add Goal</span>
              </motion.button>
            </div>

            {goalsWithProgress.length === 0 ? (
              /* Empty State - iPhone Native */
              <div 
                className="iphone-empty-state text-center py-16 lg:py-20 rounded-3xl relative overflow-hidden"
                style={{
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  background: theme === 'dark' ? 'rgba(42, 45, 61, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                  border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(15, 23, 42, 0.06)',
                  borderRadius: '24px',
                }}
              >
                <div 
                  className="w-24 h-24 lg:w-32 lg:h-32 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-8 border border-white/40 shadow-xl"
                  style={{ opacity: 0.2 }}
                >
                  <span className="text-6xl lg:text-7xl">🎯</span>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3">Set your first goal</h3>
                <p className="text-white/70 text-base lg:text-lg mb-8 max-w-md mx-auto">
                  Goals help you stay motivated and track your progress toward financial milestones.
                </p>
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
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Goal
                </motion.button>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 tablet:grid-cols-2 gap-4 lg:gap-6"
                variants={prefersReducedMotion ? {} : staggerContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {goalsWithProgress.map((goal, index) => {
                  const status = getProgressStatus(goal.percentage);
                  return (
                    <motion.div
                      key={goal.goalId}
                      variants={prefersReducedMotion ? {} : getListItemVariants(index)}
                      className="rounded-3xl border relative overflow-hidden group"
                      style={{
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        background: theme === 'dark' ? 'rgba(42, 45, 61, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                        border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(15, 23, 42, 0.06)',
                        borderRadius: '24px',
                      }}
                    >
                      {/* Edit/Delete Buttons - Glass Effect */}
                      <div className="absolute top-3 right-3 lg:top-4 lg:right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                          onClick={() => {
                            setSelectedGoal({
                              id: goal.goalId,
                              user_id: user?.id || '',
                              goal_name: goal.goalName,
                              target_amount: goal.targetAmount,
                              icon: goal.icon || null,
                              target_date: goal.targetDate || null,
                              created_at: '',
                            });
                            setShowEditModal(true);
                          }}
                          className="p-2 lg:p-3 backdrop-blur-md rounded-xl shadow-lg hover:bg-yellow-400/30 transition-all border border-yellow-400/50"
                          style={{
                            backdropFilter: 'blur(15px)',
                            background: 'rgba(234, 179, 8, 0.3)',
                          }}
                          title="Edit"
                        >
                          <svg className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedGoal({
                              id: goal.goalId,
                              user_id: user?.id || '',
                              goal_name: goal.goalName,
                              target_amount: goal.targetAmount,
                              icon: goal.icon || null,
                              target_date: goal.targetDate || null,
                              created_at: '',
                            });
                            setShowDeleteModal(true);
                          }}
                          className="p-2 lg:p-3 backdrop-blur-md rounded-xl shadow-lg hover:bg-red-500/30 transition-all border border-red-500/50"
                          style={{
                            backdropFilter: 'blur(15px)',
                            background: 'rgba(239, 68, 68, 0.3)',
                          }}
                          title="Delete"
                        >
                          <svg className="w-4 h-4 lg:w-5 lg:h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      <div className="p-5 lg:p-8">
                        {/* Goal Icon - Glass Circle */}
                        <div className="text-center mb-4">
                          <div 
                            className="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 border border-white/40 shadow-lg"
                            style={{
                              backdropFilter: 'blur(15px)',
                            }}
                          >
                            <span className="text-3xl lg:text-4xl">{goal.icon || getGoalIcon(index)}</span>
                          </div>
                        </div>

                        {/* Goal Name */}
                        <h4 className="text-xl lg:text-2xl font-bold text-white mb-3 text-center">{goal.goalName}</h4>
                        <p className="text-white/80 text-sm mb-6 text-center">
                          Target: <span className="font-mono font-bold text-base text-white">{formatCurrency(goal.targetAmount)}</span>
                        </p>

                        {/* Progress Bar - Glass Effect */}
                        <div className="mb-4">
                          <div 
                            className="w-full h-3 lg:h-4 rounded-full overflow-hidden relative border shadow-inner"
                            style={{
                              background: 'rgba(255, 255, 255, 0.2)',
                              backdropFilter: 'blur(15px)',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              borderRadius: '12px',
                            }}
                          >
                            <div
                              className="h-full rounded-full transition-all duration-1000 ease-out relative"
                              style={{
                                width: `${Math.min(goal.percentage, 100)}%`,
                                background: 'linear-gradient(90deg, #10b981, #14b8a6, #06b6d4)',
                                '--progress-width': `${Math.min(goal.percentage, 100)}%`,
                                animation: 'progressFill 1s ease-out',
                                boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.3)',
                              } as React.CSSProperties}
                            >
                              {/* Inner glow */}
                              <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"></div>
                            </div>
                            {/* Percentage text centered on bar */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs lg:text-sm font-bold text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                                {goal.percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-2 lg:mt-3">
                            <span className="text-xs lg:text-sm font-mono text-white/80">
                              {formatCurrency(goal.currentSavings)}
                            </span>
                            <span className="text-xs lg:text-sm font-mono text-white/60">
                              {formatCurrency(goal.targetAmount)}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge - Glass Effect */}
                        {status && (
                          <div 
                            className="mb-4 px-3 lg:px-4 py-2 lg:py-3 rounded-xl border backdrop-blur-md text-center shadow-md"
                            style={{
                              backdropFilter: 'blur(15px)',
                              background: status.bg.includes('green') 
                                ? 'rgba(16, 185, 129, 0.2)' 
                                : status.bg.includes('orange')
                                ? 'rgba(251, 146, 60, 0.2)'
                                : 'rgba(59, 130, 246, 0.2)',
                              border: status.bg.includes('green')
                                ? '1px solid rgba(16, 185, 129, 0.4)'
                                : status.bg.includes('orange')
                                ? '1px solid rgba(251, 146, 60, 0.4)'
                                : '1px solid rgba(59, 130, 246, 0.4)',
                            }}
                          >
                            <span className="text-xs lg:text-sm font-bold text-white">{status.text}</span>
                          </div>
                        )}

                        {/* Remaining */}
                        {!goal.isReached && (
                          <p className="text-sm lg:text-base text-white/60 text-center font-medium">
                            <span className="font-mono font-bold text-base lg:text-lg text-white">{formatCurrency(goal.remaining)}</span> to go
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </motion.div>

          {/* Modals */}
          <AddSavingsGoalModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSave={handleAddGoal}
          />
          <EditSavingsGoalModal
            isOpen={showEditModal}
            goal={selectedGoal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedGoal(null);
            }}
            onUpdate={handleUpdateGoal}
            onDelete={(goal) => {
              setSelectedGoal({
                id: goal.id,
                user_id: goal.user_id,
                goal_name: goal.goal_name,
                target_amount: goal.target_amount,
                icon: goal.icon || null,
                target_date: goal.target_date || null,
                created_at: goal.created_at,
              });
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
          <PreciousMetalsModal
            isOpen={showPreciousMetalsModal}
            onClose={() => setShowPreciousMetalsModal(false)}
          />

          {/* Toast Notification */}
          {toast && (
            <div
              className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[99999] px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl animate-slide-up"
              style={{
                background: toast.type === 'success' 
                  ? 'rgba(16, 185, 129, 0.95)' 
                  : 'rgba(239, 68, 68, 0.95)',
                border: `1px solid ${toast.type === 'success' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
                minWidth: '280px',
                maxWidth: '90vw',
              }}
            >
              <div className="flex items-center gap-3">
                {toast.type === 'success' ? (
                  <svg className="w-6 h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <p className="text-white font-medium text-sm flex-1">{toast.message}</p>
              </div>
            </div>
          )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes progressFill {
          from { width: 0%; }
          to { width: var(--progress-width); }
        }
        `
      }} />
    </DashboardLayout>
  );
}
