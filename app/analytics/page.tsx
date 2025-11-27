'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getCurrentUser, User } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import LoadingScreen from '@/components/LoadingScreen';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { getTextColor, getMutedTextColor, getCardTextColor } from '@/lib/utils';
import {
  ComposedChart,
  BarChart,
  Bar,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  AreaChart,
  Area,
} from 'recharts';

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  zakat: number;
}

interface CategoryData {
  name: string;
  value: number;
  percentage: number;
}

interface QuickStats {
  monthlyIncome: number;
  incomeTrend: number;
  monthlyExpense: number;
  expenseTrend: number;
  savingsRate: number;
  healthScore: number;
}

const EXPENSE_COLORS = ['#dc2626', '#ea580c', '#2563eb', '#7c3aed', '#db2777', '#0891b2', '#059669'];
const INCOME_COLORS = ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6'];

export default function AnalyticsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('6M');
  const [quickStats, setQuickStats] = useState<QuickStats>({
    monthlyIncome: 0,
    incomeTrend: 0,
    monthlyExpense: 0,
    expenseTrend: 0,
    savingsRate: 0,
    healthScore: 0
  });
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [incomeByCategory, setIncomeByCategory] = useState<CategoryData[]>([]);
  const [expensesByCategory, setExpensesByCategory] = useState<CategoryData[]>([]);

  useEffect(() => {
    checkUser();
  }, []);

  // Hard cap loading screen to max ~3 seconds so UI never feels stuck
  useEffect(() => {
    if (!loading) return;
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [loading]);

  const checkUser = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      // Avoid redirect loop: middleware already protects this route.
      setLoading(false);
      return;
    }
    setUser(currentUser);
    setLoading(false);
    loadAnalyticsData(currentUser);
  };

  const loadAnalyticsData = async (currentUser: User) => {
    // Get date range
    const now = new Date();
    const monthsBack = dateRange === '6M' ? 6 : dateRange === '1Y' ? 12 : dateRange === '2Y' ? 24 : 60;
    const startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);

    // Fetch income, expenses, and zakat in parallel for faster load
    const [
      { data: incomeData },
      { data: expensesData },
      { data: zakatData },
    ] = await Promise.all([
      supabase
        .from('income_entries')
        .select('*')
        .eq('user_id', currentUser.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true }),
      supabase
        .from('expense_entries')
        .select('*')
        .eq('user_id', currentUser.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true }),
      supabase
        .from('zakat_payments')
        .select('*')
        .eq('user_id', currentUser.id)
        .gte('created_at', startDate.toISOString()),
    ]);

    // Process monthly data
    const monthlyMap = new Map<string, MonthlyData>();
    const months = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      months.push(monthKey);
      monthlyMap.set(monthKey, {
        month: monthKey,
        income: 0,
        expenses: 0,
        savings: 0,
        zakat: 0
      });
    }

    // Aggregate income by month
    incomeData?.forEach(income => {
      const date = new Date(income.created_at);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (monthlyMap.has(monthKey)) {
        const data = monthlyMap.get(monthKey)!;
        data.income += income.amount;
      }
    });

    // Aggregate expenses by month
    expensesData?.forEach(expense => {
      const date = new Date(expense.created_at);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (monthlyMap.has(monthKey)) {
        const data = monthlyMap.get(monthKey)!;
        data.expenses += expense.amount;
      }
    });

    // Aggregate zakat by month
    zakatData?.forEach(zakat => {
      const date = new Date(zakat.created_at);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (monthlyMap.has(monthKey)) {
        const data = monthlyMap.get(monthKey)!;
        data.zakat += zakat.amount;
      }
    });

    // Calculate savings
    monthlyMap.forEach(data => {
      data.savings = data.income - data.expenses;
    });

    const monthlyDataArray = Array.from(monthlyMap.values());
    setMonthlyData(monthlyDataArray);

    // Calculate quick stats
    const currentMonth = monthlyDataArray[monthlyDataArray.length - 1];
    const previousMonth = monthlyDataArray[monthlyDataArray.length - 2];

    const incomeTrend = previousMonth && previousMonth.income > 0
      ? ((currentMonth.income - previousMonth.income) / previousMonth.income) * 100
      : 0;

    const expenseTrend = previousMonth && previousMonth.expenses > 0
      ? ((currentMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100
      : 0;

    const savingsRate = currentMonth.income > 0
      ? (currentMonth.savings / currentMonth.income) * 100
      : 0;

    // Calculate financial health score
    const avgIncome = monthlyDataArray.reduce((sum, m) => sum + m.income, 0) / monthlyDataArray.length;
    const avgExpenses = monthlyDataArray.reduce((sum, m) => sum + m.expenses, 0) / monthlyDataArray.length;
    const avgSavingsRate = avgIncome > 0 ? ((avgIncome - avgExpenses) / avgIncome) * 100 : 0;
    const healthScore = Math.min(100, Math.max(0, avgSavingsRate * 2));

    setQuickStats({
      monthlyIncome: currentMonth.income,
      incomeTrend,
      monthlyExpense: currentMonth.expenses,
      expenseTrend,
      savingsRate,
      healthScore
    });

    // Process income by category
    const incomeCategoryMap = new Map<string, number>();
    incomeData?.forEach(income => {
      const category = income.category || 'Other';
      incomeCategoryMap.set(category, (incomeCategoryMap.get(category) || 0) + income.amount);
    });

    const totalIncome = Array.from(incomeCategoryMap.values()).reduce((sum, val) => sum + val, 0);
    const incomeCategoryData = Array.from(incomeCategoryMap.entries()).map(([name, value]) => ({
      name,
      value,
      percentage: totalIncome > 0 ? (value / totalIncome) * 100 : 0
    }));
    setIncomeByCategory(incomeCategoryData);

    // Process expenses by category
    const expenseCategoryMap = new Map<string, number>();
    expensesData?.forEach(expense => {
      const category = expense.category || 'Other';
      expenseCategoryMap.set(category, (expenseCategoryMap.get(category) || 0) + expense.amount);
    });

    const totalExpenses = Array.from(expenseCategoryMap.values()).reduce((sum, val) => sum + val, 0);
    const expenseCategoryData = Array.from(expenseCategoryMap.entries()).map(([name, value]) => ({
      name,
      value,
      percentage: totalExpenses > 0 ? (value / totalExpenses) * 100 : 0
    }));
    setExpensesByCategory(expenseCategoryData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  // Shared tooltip for category pie charts (income & expenses) – matches dashboard style
  const renderCategoryTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const dataPoint = payload[0];
    const name = dataPoint?.payload?.name ?? '';
    const value = typeof dataPoint?.value === 'number' ? dataPoint.value : 0;

    return (
      <div
        className="rounded-xl px-3 py-2 shadow-xl"
        style={{
          zIndex: 50,
          pointerEvents: 'none',
          backdropFilter: 'blur(10px)',
          backgroundColor:
            theme === 'dark'
              ? 'rgba(15, 23, 42, 0.98)'
              : 'rgba(255, 255, 255, 0.98)',
          border:
            theme === 'dark'
              ? '1px solid rgba(148, 163, 184, 0.6)'
              : '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.35)',
          color:
            theme === 'dark'
              ? '#f9fafb'
              : '#0f172a',
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
          {name}
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
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <DashboardLayout user={user}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8 rounded-[32px] overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-secondary opacity-90"></div>
          <div className="relative backdrop-blur-[30px] bg-white/10 border border-white/30 shadow-2xl">
            <div className="p-12">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Financial Reports & Analytics</h1>
                  <p className="text-white/80">Comprehensive insights into your financial health</p>
                </div>
                <div className="flex items-center gap-4">
                  {/* Date Range Selector */}
                  <select
                    value={dateRange}
                    onChange={(e) => {
                      setDateRange(e.target.value);
                      if (user) loadAnalyticsData(user);
                    }}
                    className="px-6 py-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-medium hover:bg-white/30 transition-all cursor-pointer"
                  >
                    <option value="6M" className={getCardTextColor(theme, true)}>Last 6 Months</option>
                    <option value="1Y" className={getCardTextColor(theme, true)}>Last Year</option>
                    <option value="2Y" className={getCardTextColor(theme, true)}>Last 2 Years</option>
                    <option value="All" className={getCardTextColor(theme, true)}>All Time</option>
                  </select>

                  {/* Export Button */}
                  <button className="px-6 py-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-medium hover:bg-white/30 transition-all flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Report (PDF)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Monthly Income Trend */}
          <div 
            className="rounded-3xl backdrop-blur-xl border shadow-xl p-6 relative overflow-hidden"
            style={{
              backdropFilter: 'blur(30px)',
              background: theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.85)',
              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(31, 41, 55, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-500/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-emerald-500/30">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                quickStats.incomeTrend >= 0 ? 'bg-emerald-100' : 'bg-red-100'
              }`}>
                <svg className={`w-4 h-4 ${quickStats.incomeTrend >= 0 ? 'text-emerald-600' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 20 20" style={{ transform: quickStats.incomeTrend < 0 ? 'scaleY(-1)' : 'none' }}>
                  <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className={`text-sm font-bold ${quickStats.incomeTrend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {Math.abs(quickStats.incomeTrend).toFixed(1)}%
                </span>
              </div>
            </div>
            <p className={`text-3xl font-bold ${getCardTextColor(theme, theme === 'light')} mb-2`}>{formatCurrency(quickStats.monthlyIncome)}</p>
            <p className={`text-sm ${getMutedTextColor(theme)}`}>Monthly Income</p>
            <p className={`text-xs ${getMutedTextColor(theme)} opacity-60 mt-1`}>vs previous month</p>
          </div>

          {/* Monthly Expense Trend */}
          <div 
            className="rounded-3xl backdrop-blur-xl border shadow-xl p-6 relative overflow-hidden"
            style={{
              backdropFilter: 'blur(30px)',
              background: theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.85)',
              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(31, 41, 55, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-red-500/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-red-500/30">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                quickStats.expenseTrend <= 0 ? 'bg-emerald-100' : 'bg-red-100'
              }`}>
                <svg className={`w-4 h-4 ${quickStats.expenseTrend <= 0 ? 'text-emerald-600' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 20 20" style={{ transform: quickStats.expenseTrend > 0 ? 'scaleY(-1)' : 'none' }}>
                  <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className={`text-sm font-bold ${quickStats.expenseTrend <= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {Math.abs(quickStats.expenseTrend).toFixed(1)}%
                </span>
              </div>
            </div>
            <p className={`text-3xl font-bold ${getCardTextColor(theme, theme === 'light')} mb-2`}>{formatCurrency(quickStats.monthlyExpense)}</p>
            <p className={`text-sm ${getMutedTextColor(theme)}`}>Monthly Expenses</p>
            <p className={`text-xs ${getMutedTextColor(theme)} opacity-60 mt-1`}>vs previous month</p>
          </div>

          {/* Savings Rate */}
          <div 
            className="rounded-3xl backdrop-blur-xl border shadow-xl p-6 relative overflow-hidden"
            style={{
              backdropFilter: 'blur(30px)',
              background: theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.85)',
              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(31, 41, 55, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            }}>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="rgba(16, 185, 129, 0.2)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#10b981"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(quickStats.savingsRate / 100) * 251.2} 251.2`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-emerald-600">{quickStats.savingsRate.toFixed(0)}%</span>
                </div>
              </div>
            </div>
            <p className={`text-lg font-bold ${getCardTextColor(theme, theme === 'light')} text-center mb-1`}>Savings Rate</p>
            <p className={`text-xs ${getMutedTextColor(theme)} opacity-60 text-center`}>Income saved this month</p>
          </div>

          {/* Financial Health Score */}
          <div 
            className="rounded-3xl backdrop-blur-xl border shadow-xl p-6 relative overflow-hidden"
            style={{
              backdropFilter: 'blur(30px)',
              background: theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.85)',
              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(31, 41, 55, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            }}>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="rgba(0, 0, 0, 0.1)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke={getHealthScoreColor(quickStats.healthScore)}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(quickStats.healthScore / 100) * 251.2} 251.2`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold" style={{ color: getHealthScoreColor(quickStats.healthScore) }}>
                    {quickStats.healthScore.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
            <p className={`text-lg font-bold ${getCardTextColor(theme, theme === 'light')} text-center mb-1`}>Health Score</p>
            <p className={`text-xs ${getMutedTextColor(theme)} opacity-60 text-center`}>Financial wellness rating</p>
          </div>
        </div>

        {/* Income vs Expenses Over Time */}
        <div className="rounded-3xl backdrop-blur-xl bg-white/75 border border-white/30 shadow-xl p-4 tablet:p-6 lg:p-8 mb-6 tablet:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 tablet:mb-6 gap-4">
            <h2 className={`text-xl tablet:text-2xl font-bold ${getTextColor(theme)}`}>Income vs Expenses Over Time</h2>
            <div className="flex items-center gap-2 flex-wrap">
              {['6M', '1Y', '2Y', 'All'].map((period) => (
                <button
                  key={period}
                  onClick={() => {
                    setDateRange(period);
                    if (user) loadAnalyticsData(user);
                  }}
                  className={`px-3 tablet:px-4 py-2 rounded-xl text-sm tablet:text-base font-medium transition-all mobile-tap-target ${
                    dateRange === period
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : `bg-white/50 backdrop-blur-md border border-white/30 ${getCardTextColor(theme, true)} hover:bg-white/70`
                  }`}
                  style={{
                    minHeight: '44px',
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

          <div className="w-full overflow-x-auto -mx-4 tablet:mx-0 px-4 tablet:px-0">
            <div style={{ minWidth: '100%', width: '100%' }}>
              <ResponsiveContainer width="100%" height={250} className="tablet:h-[350px] lg:h-[400px]">
                <ComposedChart data={monthlyData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} />
                  <XAxis 
                    dataKey="month" 
                    stroke={theme === 'dark' ? 'rgba(255,255,255,0.5)' : '#64748b'} 
                    tick={{ fontSize: 10 }}
                    className="tablet:text-sm"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    stroke={theme === 'dark' ? 'rgba(255,255,255,0.5)' : '#64748b'} 
                    tick={{ fontSize: 10 }}
                    className="tablet:text-sm"
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '16px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                      padding: '12px',
                      color: theme === 'dark' ? '#ffffff' : '#000000',
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                    labelStyle={{ color: theme === 'dark' ? '#ffffff' : '#000000' }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                    iconSize={12}
                  />
                  <Bar
                    dataKey="income"
                    fill="url(#incomeGradient)"
                    name="Income"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive
                    animationDuration={800}
                    animationBegin={100}
                  />
                  <Bar
                    dataKey="expenses"
                    fill="url(#expenseGradient)"
                    name="Expenses"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive
                    animationDuration={800}
                    animationBegin={150}
                  />
                  <Line
                    type="monotone"
                    dataKey="savings"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    name="Net Savings"
                    dot={{ fill: '#f59e0b', r: 4 }}
                    isAnimationActive
                    animationDuration={1000}
                    animationBegin={200}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Income by Category */}
          <div 
            className="rounded-3xl backdrop-blur-xl border shadow-xl p-8 relative overflow-hidden"
            style={{
              backdropFilter: 'blur(30px)',
              background: theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.85)',
              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(31, 41, 55, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            }}>
            <h2 className={`text-2xl font-bold ${getTextColor(theme)} mb-6`}>Income by Category</h2>
            {incomeByCategory.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                    <Pie
                      data={incomeByCategory as any}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      isAnimationActive
                      animationDuration={800}
                      animationBegin={200}
                    >
                      {incomeByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={INCOME_COLORS[index % INCOME_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={renderCategoryTooltip}
                      wrapperStyle={{
                        zIndex: 50,
                        pointerEvents: 'none',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-6 space-y-2">
                  {incomeByCategory.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between p-3 rounded-xl bg-white/50 backdrop-blur-md">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: INCOME_COLORS[index % INCOME_COLORS.length] }}
                        ></div>
                        <span className="text-sm font-medium text-charcoal-dark">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-charcoal-dark">{formatCurrency(category.value)}</p>
                        <p className="text-xs text-charcoal/60">{category.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-charcoal/60 py-12">No income data available</p>
            )}
          </div>

          {/* Expenses by Category */}
          <div 
            className="rounded-3xl backdrop-blur-xl border shadow-xl p-8 relative overflow-hidden"
            style={{
              backdropFilter: 'blur(30px)',
              background: theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.85)',
              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(31, 41, 55, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            }}>
            <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-charcoal-dark'}`}>Expenses by Category</h2>
            {expensesByCategory.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expensesByCategory as any}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      isAnimationActive
                      animationDuration={800}
                      animationBegin={200}
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={renderCategoryTooltip}
                      wrapperStyle={{
                        zIndex: 50,
                        pointerEvents: 'none',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-6 space-y-2">
                  {expensesByCategory.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between p-3 rounded-xl bg-white/50 backdrop-blur-md">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: EXPENSE_COLORS[index % EXPENSE_COLORS.length] }}
                        ></div>
                        <span className="text-sm font-medium text-charcoal-dark">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-charcoal-dark">{formatCurrency(category.value)}</p>
                        <p className="text-xs text-charcoal/60">{category.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-charcoal/60 py-12">No expense data available</p>
            )}
          </div>
        </div>

        {/* Monthly Comparison Table */}
        <div className="rounded-3xl backdrop-blur-xl bg-white/75 border border-white/30 shadow-xl p-8 mb-8">
          <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-charcoal-dark'}`}>Month-by-Month Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/30">
                  <th className={`px-6 py-4 text-left text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-charcoal-dark'}`}>Month</th>
                  <th className={`px-6 py-4 text-right text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-charcoal-dark'}`}>Income</th>
                  <th className={`px-6 py-4 text-right text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-charcoal-dark'}`}>Expenses</th>
                  <th className={`px-6 py-4 text-right text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-charcoal-dark'}`}>Savings</th>
                  <th className={`px-6 py-4 text-right text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-charcoal-dark'}`}>Zakat</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((month, index) => (
                  <tr
                    key={month.month}
                    className="border-b border-white/20 hover:bg-white/50 transition-colors"
                  >
                    <td className={`px-6 py-4 text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-charcoal-dark'}`}>{month.month}</td>
                    <td className="px-6 py-4 text-sm text-right text-emerald-600 font-bold">{formatCurrency(month.income)}</td>
                    <td className="px-6 py-4 text-sm text-right text-red-600 font-bold">{formatCurrency(month.expenses)}</td>
                    <td className={`px-6 py-4 text-sm text-right font-bold ${month.savings >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(month.savings)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-secondary font-bold">{formatCurrency(month.zakat)}</td>
                  </tr>
                ))}
                <tr className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-secondary/10 backdrop-blur-md">
                  <td className={`px-6 py-4 text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-charcoal-dark'}`}>Total</td>
                  <td className="px-6 py-4 text-sm text-right text-emerald-600 font-bold">
                    {formatCurrency(monthlyData.reduce((sum, m) => sum + m.income, 0))}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-red-600 font-bold">
                    {formatCurrency(monthlyData.reduce((sum, m) => sum + m.expenses, 0))}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-emerald-600 font-bold">
                    {formatCurrency(monthlyData.reduce((sum, m) => sum + m.savings, 0))}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-secondary font-bold">
                    {formatCurrency(monthlyData.reduce((sum, m) => sum + m.zakat, 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Trends & Insights and Export Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trends & Insights Card */}
          <div 
            className="rounded-3xl backdrop-blur-xl border shadow-xl p-8 relative overflow-hidden"
            style={{
              backdropFilter: 'blur(30px)',
              background: theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.85)',
              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(31, 41, 55, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            }}>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">✨</span>
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-charcoal-dark'}`}>AI Insights</h2>
            </div>
            <div className="space-y-4">
              {quickStats.savingsRate > 20 && (
                <div className="p-4 rounded-2xl bg-emerald-50/80 backdrop-blur-md border border-emerald-200/50 flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-emerald-900">Excellent savings rate!</p>
                    <p className="text-xs text-emerald-700 mt-1">You&apos;re saving {quickStats.savingsRate.toFixed(0)}% of your income. Keep it up!</p>
                  </div>
                </div>
              )}

              {quickStats.expenseTrend > 10 && (
                <div className="p-4 rounded-2xl bg-yellow-50/80 backdrop-blur-md border border-yellow-200/50 flex items-start gap-3">
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-900">Expenses increased</p>
                    <p className="text-xs text-yellow-700 mt-1">Your spending increased {quickStats.expenseTrend.toFixed(1)}% this month. Consider reviewing your budget.</p>
                  </div>
                </div>
              )}

              {quickStats.healthScore >= 80 && (
                <div className="p-4 rounded-2xl bg-emerald-50/80 backdrop-blur-md border border-emerald-200/50 flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-emerald-900">Outstanding financial health!</p>
                    <p className="text-xs text-emerald-700 mt-1">Your health score of {quickStats.healthScore.toFixed(0)} indicates excellent money management.</p>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-blue-50/80 backdrop-blur-md border border-blue-200/50 flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">Track your progress</p>
                  <p className="text-xs text-blue-700 mt-1">Continue monitoring your finances to maintain healthy spending habits.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Export Options Card */}
          <div 
            className="rounded-3xl backdrop-blur-xl border shadow-xl p-8 relative overflow-hidden"
            style={{
              backdropFilter: 'blur(30px)',
              background: theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.85)',
              border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(31, 41, 55, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            }}>
            <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-charcoal-dark'}`}>Export Reports</h2>
            <div className="space-y-4">
              <button className="w-full px-6 py-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/80 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-charcoal-dark'}`}>Download PDF Report</p>
                    <p className="text-xs text-charcoal/60">Comprehensive financial analysis</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-charcoal group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button className="w-full px-6 py-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/80 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-charcoal-dark'}`}>Download Excel File</p>
                    <p className="text-xs text-charcoal/60">Raw data for custom analysis</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-charcoal group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button className="w-full px-6 py-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/80 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-charcoal-dark'}`}>Email Report</p>
                    <p className="text-xs text-charcoal/60">Send report to your inbox</p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-charcoal group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <div className="pt-4 border-t border-white/30">
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-charcoal'}`}>Export Date Range</label>
                <select className={`w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-md border border-white/30 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none ${theme === 'dark' ? 'text-slate-900' : 'text-charcoal-dark'}`}>
                  <option>Last 6 Months</option>
                  <option>Last Year</option>
                  <option>Last 2 Years</option>
                  <option>All Time</option>
                  <option>Custom Range</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
