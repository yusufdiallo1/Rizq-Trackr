import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';

const supabase = createClientComponentClient<Database>();

export interface DashboardData {
  currentMonthIncome: number;
  currentMonthExpenses: number;
  currentSavings: number;
  zakatOwed: number;
}

export interface IncomeEntry {
  id: string;
  amount: number;
  category: string;
  date: string;
  notes: string | null;
  is_zakatable: boolean;
  created_at: string;
}

export interface ExpenseEntry {
  id: string;
  amount: number;
  category: string;
  date: string;
  notes: string | null;
  created_at: string;
}

export interface ZakatPayment {
  id: string;
  amount: number;
  paid_date: string;
  notes: string | null;
  created_at: string;
}

// Get dashboard summary data with timeout protection
export async function getDashboardData(userId: string): Promise<DashboardData> {
  // Default response for timeout/errors
  const defaultData: DashboardData = {
    currentMonthIncome: 0,
    currentMonthExpenses: 0,
    currentSavings: 0,
    zakatOwed: 0,
  };

  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    // Fetch critical data in parallel with 3-second timeout
    const dataPromise = Promise.all([
      supabase
        .from('income_entries')
        .select('amount')
        .eq('user_id', userId)
        .gte('date', firstDayOfMonth)
        .lte('date', lastDayOfMonth)
        .limit(100), // Reasonable limit for performance
      supabase
        .from('expense_entries')
        .select('amount')
        .eq('user_id', userId)
        .gte('date', firstDayOfMonth)
        .lte('date', lastDayOfMonth)
        .limit(100), // Reasonable limit for performance
    ]);

    const timeoutPromise = new Promise<any>((resolve) =>
      setTimeout(() => resolve([
        { data: [], error: null },
        { data: [], error: null }
      ]), 3000)
    );

    const [
      { data: incomeData, error: incomeError },
      { data: expenseData, error: expenseError },
    ] = await Promise.race([dataPromise, timeoutPromise]).catch(() => [
      { data: [], error: null },
      { data: [], error: null }
    ]);

    // Only calculate current month data for speed
    const currentMonthIncome = incomeData?.reduce((sum: number, entry: any) => sum + Number(entry.amount), 0) || 0;
    const currentMonthExpenses = expenseData?.reduce((sum: number, entry: any) => sum + Number(entry.amount), 0) || 0;
    
    // Use simplified calculation - can be updated later in background
    // For faster load, we calculate savings from current month only
    // Full calculation can happen in background
    const currentSavings = currentMonthIncome - currentMonthExpenses;
    const nisabThreshold = 4000;
    const zakatOwed = currentSavings >= nisabThreshold ? currentSavings * 0.025 : 0;

    return {
      currentMonthIncome,
      currentMonthExpenses,
      currentSavings,
      zakatOwed,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      currentMonthIncome: 0,
      currentMonthExpenses: 0,
      currentSavings: 0,
      zakatOwed: 0,
    };
  }
}

// Get all income entries for a user - with limit for performance
export async function getIncomeEntries(userId: string, limit?: number): Promise<IncomeEntry[]> {
  try {
    let query = supabase
      .from('income_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    } else {
      query = query.limit(10000); // Default safety limit
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching income entries:', error);
    return [];
  }
}

// Get all expense entries for a user - with limit for performance
export async function getExpenseEntries(userId: string, limit?: number): Promise<ExpenseEntry[]> {
  try {
    let query = supabase
      .from('expense_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (limit) {
      query = query.limit(limit);
    } else {
      query = query.limit(10000); // Default safety limit
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching expense entries:', error);
    return [];
  }
}

// Get all zakat payments for a user
export async function getZakatPayments(userId: string): Promise<ZakatPayment[]> {
  try {
    const { data, error } = await supabase
      .from('zakat_payments')
      .select('*')
      .eq('user_id', userId)
      .order('paid_date', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching zakat payments:', error);
    return [];
  }
}

// Get last 6 months income and expenses for chart - OPTIMIZED: Single query instead of 12
export async function getLast6MonthsData(userId: string) {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const firstDay = sixMonthsAgo.toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      
    // Fetch all data in 2 queries instead of 12 - with limits for performance
    const [incomeResult, expenseResult] = await Promise.all([
      supabase
        .from('income_entries')
        .select('amount, date')
        .eq('user_id', userId)
        .gte('date', firstDay)
        .lte('date', lastDay)
        .order('date', { ascending: false })
        .limit(5000), // Safety limit
      supabase
        .from('expense_entries')
        .select('amount, date')
        .eq('user_id', userId)
        .gte('date', firstDay)
        .lte('date', lastDay)
        .order('date', { ascending: false })
        .limit(5000), // Safety limit
    ]);
      
    const incomeData = incomeResult.data || [];
    const expenseData = expenseResult.data || [];
    
    // Group by month
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      const month = date.getMonth();
      
      const income = incomeData
        .filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.getFullYear() === year && entryDate.getMonth() === month;
        })
        .reduce((sum, entry) => sum + Number(entry.amount), 0);
      
      const expenses = expenseData
        .filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.getFullYear() === year && entryDate.getMonth() === month;
        })
        .reduce((sum, entry) => sum + Number(entry.amount), 0);
      
      months.push({
        month: monthName,
        income,
        expenses,
      });
    }
    
    return months;
  } catch (error) {
    console.error('Error fetching last 6 months data:', error);
    return [];
  }
}

// Get expense breakdown by category
export async function getExpenseBreakdown(userId: string) {
  try {
    const { data, error } = await supabase
      .from('expense_entries')
      .select('amount, category')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(10000); // Safety limit
    
    if (error) throw error;
    
    const breakdown: { [key: string]: number } = {};
    data?.forEach((entry) => {
      const category = entry.category;
      breakdown[category] = (breakdown[category] || 0) + Number(entry.amount);
    });
    
    // Filter out categories with 0 or no amounts to ensure pie chart renders
    return Object.entries(breakdown)
      .filter(([, amount]) => amount > 0)
      .map(([category, amount]) => ({
        category,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount);
  } catch (error) {
    console.error('Error fetching expense breakdown:', error);
    return [];
  }
}

// Get recent transactions (last 5 income + expenses + zakat payments combined)
export async function getRecentTransactions(userId: string, limit: number = 5) {
  try {
    const [incomeData, expenseData, zakatData] = await Promise.all([
      supabase
        .from('income_entries')
        .select('id, amount, category, date, notes')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(limit),
      supabase
        .from('expense_entries')
        .select('id, amount, category, date, notes')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(limit),
      supabase
        .from('zakat_payments')
        .select('id, amount, paid_date, notes')
        .eq('user_id', userId)
        .order('paid_date', { ascending: false })
        .limit(limit),
    ]);
    
    const transactions: Array<{
      id: string;
      type: 'income' | 'expense' | 'zakat';
      amount: number;
      category: string;
      date: string;
      notes: string | null;
    }> = [];
    
    incomeData.data?.forEach((entry) => {
      transactions.push({
        id: entry.id,
        type: 'income',
        amount: Number(entry.amount),
        category: entry.category,
        date: entry.date,
        notes: entry.notes,
      });
    });
    
    expenseData.data?.forEach((entry) => {
      transactions.push({
        id: entry.id,
        type: 'expense',
        amount: Number(entry.amount),
        category: entry.category,
        date: entry.date,
        notes: entry.notes,
      });
    });

    zakatData.data?.forEach((entry) => {
      transactions.push({
        id: entry.id,
        type: 'zakat',
        amount: Number(entry.amount),
        category: 'Zakat Payment',
        date: entry.paid_date,
        notes: entry.notes,
      });
    });
    
    // Sort by date and take most recent
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    return [];
  }
}

// Get previous month data for comparison
export async function getPreviousMonthData(userId: string) {
  try {
    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const firstDay = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0).toISOString().split('T')[0];

    const [incomeData, expenseData] = await Promise.all([
      supabase
        .from('income_entries')
        .select('amount')
        .eq('user_id', userId)
        .gte('date', firstDay)
        .lte('date', lastDay),
      supabase
        .from('expense_entries')
        .select('amount')
        .eq('user_id', userId)
        .gte('date', firstDay)
        .lte('date', lastDay),
    ]);

    const income = incomeData.data?.reduce((sum, entry) => sum + Number(entry.amount), 0) || 0;
    const expenses = expenseData.data?.reduce((sum, entry) => sum + Number(entry.amount), 0) || 0;

    return { income, expenses };
  } catch (error) {
    console.error('Error fetching previous month data:', error);
    return { income: 0, expenses: 0 };
  }
}

// Get total income for a user
export async function getTotalIncome(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('income_entries')
      .select('amount')
      .eq('user_id', userId);

    if (error) throw error;

    return data?.reduce((sum, entry) => sum + Number(entry.amount), 0) || 0;
  } catch (error) {
    console.error('Error fetching total income:', error);
    return 0;
  }
}

// Get total expenses for a user
export async function getTotalExpenses(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('expense_entries')
      .select('amount')
      .eq('user_id', userId);

    if (error) throw error;

    return data?.reduce((sum, entry) => sum + Number(entry.amount), 0) || 0;
  } catch (error) {
    console.error('Error fetching total expenses:', error);
    return 0;
  }
}
