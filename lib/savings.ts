import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';
import { getTotalIncome, getTotalExpenses } from './database';
import { addNotification } from './in-app-notifications';

function getSupabaseClient() {
  return createClientComponentClient<Database>();
}

export type SavingsGoal = Database['public']['Tables']['savings_goals']['Row'];
export type SavingsGoalInsert = Database['public']['Tables']['savings_goals']['Insert'];
export type SavingsGoalUpdate = Database['public']['Tables']['savings_goals']['Update'];

export interface SavingsHistoryItem {
  month: string;
  savings: number;
  income: number;
  expenses: number;
}

export interface GoalProgress {
  goalId: string;
  goalName: string;
  targetAmount: number;
  currentSavings: number;
  percentage: number;
  remaining: number;
  isReached: boolean;
  icon?: string | null;
  targetDate?: string | null;
}

// Get current savings (total income - total expenses)
export async function getCurrentSavings(userId: string): Promise<number> {
  try {
    const totalIncome = await getTotalIncome(userId);
    const totalExpenses = await getTotalExpenses(userId);
    return totalIncome - totalExpenses;
  } catch (err) {
    console.error('Error calculating current savings:', err);
    return 0;
  }
}

// Get savings history for the last X months - OPTIMIZED: Single query instead of N*2 queries
export async function getSavingsHistory(
  userId: string,
  months: number = 12
): Promise<SavingsHistoryItem[]> {
  const currentDate = new Date();

  // Always generate month labels for the chart
  const generateEmptyHistory = (): SavingsHistoryItem[] => {
    const history: SavingsHistoryItem[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      history.push({
        month: monthName,
        savings: 0,
        income: 0,
        expenses: 0,
      });
    }
    return history;
  };

  try {
    const supabase = getSupabaseClient();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - months, 1);
    const startDateStr = startDate.toISOString().split('T')[0];

    // Fetch all data in 2 queries instead of months*2 queries
    const [incomeResult, expenseResult] = await Promise.all([
      supabase
        .from('income_entries')
        .select('amount, date')
        .eq('user_id', userId)
        .gte('date', startDateStr)
        .order('date', { ascending: true })
        .limit(10000), // Safety limit
      supabase
        .from('expense_entries')
        .select('amount, date')
        .eq('user_id', userId)
        .gte('date', startDateStr)
        .order('date', { ascending: true })
        .limit(10000), // Safety limit
    ]);

    const incomeData = incomeResult.data || [];
    const expenseData = expenseResult.data || [];

    // If no data at all, return empty history with month labels
    if (incomeData.length === 0 && expenseData.length === 0) {
      return generateEmptyHistory();
    }

    // Group by month and calculate cumulative savings
    const history: SavingsHistoryItem[] = [];
    let cumulativeIncome = 0;
    let cumulativeExpenses = 0;

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      // Calculate income and expenses for this month
      const monthIncome = incomeData
        .filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.getFullYear() === year && entryDate.getMonth() === month - 1;
        })
        .reduce((sum, entry) => sum + entry.amount, 0);

      const monthExpenses = expenseData
        .filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.getFullYear() === year && entryDate.getMonth() === month - 1;
        })
        .reduce((sum, entry) => sum + entry.amount, 0);

      cumulativeIncome += monthIncome;
      cumulativeExpenses += monthExpenses;
      const savings = cumulativeIncome - cumulativeExpenses;

      history.push({
        month: monthName,
        savings,
        income: cumulativeIncome,
        expenses: cumulativeExpenses,
      });
    }

    return history;
  } catch (err) {
    console.error('Error fetching savings history:', err);
    return generateEmptyHistory();
  }
}

// Create a new savings goal
export async function createSavingsGoal(
  userId: string,
  goalName: string,
  targetAmount: number,
  icon?: string,
  targetDate?: string,
  notes?: string
): Promise<{ data: SavingsGoal | null; error: string | null }> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('savings_goals')
      .insert({
        user_id: userId,
        goal_name: goalName,
        target_amount: targetAmount,
        icon: icon || null,
        target_date: targetDate || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating savings goal:', error);
      return { data: null, error: error.message };
    }

    // Add notification for savings goal creation
    try {
      addNotification(userId, {
        type: 'goal',
        title: `Savings Goal Created: ${goalName}`,
        message: `Target: $${targetAmount.toFixed(2)}${targetDate ? ` by ${targetDate}` : ''}`,
        severity: 'success',
        actionLabel: 'View Goal',
        actionUrl: '/savings'
      });
    } catch (notifError) {
      console.error('Error creating savings goal notification:', notifError);
      // Don't fail the goal creation if notifications fail
    }

    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error creating savings goal:', err);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

// Generate AI note for a savings goal based on the goal name
export function generateGoalNote(goalName: string): string {
  const lowerName = goalName.toLowerCase();

  const noteTemplates: { [key: string]: string } = {
    'hajj': 'Save enough money to embark on this sacred journey to Mecca - one of the five pillars of Islam.',
    'umrah': 'Save for the blessed journey of Umrah - a spiritual pilgrimage that can be performed any time of year.',
    'car': 'Working towards reliable transportation for yourself and your family.',
    'house': 'Building towards the dream of homeownership - a place to call your own.',
    'home': 'Building towards the dream of homeownership - a place to call your own.',
    'emergency': 'Building a safety net for unexpected expenses - aim for 3-6 months of living costs.',
    'wedding': 'Saving for one of life\'s most beautiful celebrations - may it be blessed!',
    'education': 'Investing in knowledge and personal growth - the best investment you can make.',
    'college': 'Preparing for higher education expenses - an investment in your future.',
    'vacation': 'Planning a well-deserved break to recharge and create lasting memories.',
    'travel': 'Saving for adventures and experiences that broaden your horizons.',
    'business': 'Building capital to start or grow your entrepreneurial dreams.',
    'retirement': 'Securing your future with consistent savings for your golden years.',
    'baby': 'Preparing for the blessing of a new family member.',
    'medical': 'Setting aside funds for healthcare needs and peace of mind.',
    'laptop': 'Saving for a productivity tool that will serve you well.',
    'computer': 'Saving for technology that will help you work and create.',
    'phone': 'Upgrading your daily essential communication device.',
    'furniture': 'Making your living space more comfortable and functional.',
    'gift': 'Preparing to bring joy to someone special in your life.',
  };

  // Check for matching keywords
  for (const [keyword, note] of Object.entries(noteTemplates)) {
    if (lowerName.includes(keyword)) {
      return note;
    }
  }

  // Default note based on amount context
  return `Working towards your "${goalName}" goal - every contribution brings you closer to success!`;
}

// Get all savings goals for a user
export async function getSavingsGoals(
  userId: string
): Promise<{ data: SavingsGoal[]; error: string | null }> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching savings goals:', error);
      return { data: [], error: error.message };
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.error('Unexpected error fetching savings goals:', err);
    return { data: [], error: 'An unexpected error occurred' };
  }
}

// Update a savings goal
export async function updateSavingsGoal(
  id: string,
  userId: string,
  data: Partial<Omit<SavingsGoalInsert, 'user_id' | 'id' | 'created_at'>>
): Promise<{ data: SavingsGoal | null; error: string | null }> {
  try {
    const supabase = getSupabaseClient();
    const { data: goal, error } = await supabase
      .from('savings_goals')
      .update(data)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating savings goal:', error);
      return { data: null, error: error.message };
    }

    // Add notification for savings goal update (if current_amount was updated)
    if (data.current_amount !== undefined && goal) {
      try {
        addNotification(userId, {
          type: 'goal',
          title: `Savings Updated: ${goal.name}`,
          message: `Updated to $${goal.current_amount.toFixed(2)} of $${goal.target_amount.toFixed(2)}`,
          severity: 'success',
          actionLabel: 'View Goal',
          actionUrl: '/savings'
        });
      } catch (notifError) {
        console.error('Error creating savings update notification:', notifError);
        // Don't fail the update if notifications fail
      }
    }

    return { data: goal, error: null };
  } catch (err) {
    console.error('Unexpected error updating savings goal:', err);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

// Delete a savings goal
export async function deleteSavingsGoal(
  id: string,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting savings goal:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Unexpected error deleting savings goal:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Calculate goal progress
export function calculateGoalProgress(
  currentSavings: number,
  targetAmount: number
): { percentage: number; remaining: number; isReached: boolean } {
  const percentage = Math.min((currentSavings / targetAmount) * 100, 100);
  const remaining = Math.max(targetAmount - currentSavings, 0);
  const isReached = currentSavings >= targetAmount;

  return {
    percentage,
    remaining,
    isReached,
  };
}

// Get all goals with progress
export async function getSavingsGoalsWithProgress(
  userId: string
): Promise<{ data: GoalProgress[]; error: string | null }> {
  try {
    const currentSavings = await getCurrentSavings(userId);
    const { data: goals, error } = await getSavingsGoals(userId);

    if (error) {
      return { data: [], error };
    }

    const goalsWithProgress: GoalProgress[] = goals.map((goal) => {
      const progress = calculateGoalProgress(currentSavings, goal.target_amount);
      return {
        goalId: goal.id,
        goalName: goal.goal_name,
        targetAmount: goal.target_amount,
        currentSavings,
        percentage: progress.percentage,
        remaining: progress.remaining,
        isReached: progress.isReached,
        icon: goal.icon || null,
        targetDate: goal.target_date || null,
      };
    });

    return { data: goalsWithProgress, error: null };
  } catch (err) {
    console.error('Unexpected error fetching goals with progress:', err);
    return { data: [], error: 'An unexpected error occurred' };
  }
}

// Get month-over-month savings change
export async function getMonthOverMonthChange(
  userId: string
): Promise<{ change: number; percentage: number }> {
  try {
    const history = await getSavingsHistory(userId, 2);

    if (history.length < 2) {
      return { change: 0, percentage: 0 };
    }

    const currentMonth = history[1].savings;
    const lastMonth = history[0].savings;
    const change = currentMonth - lastMonth;
    const percentage = lastMonth !== 0 ? (change / Math.abs(lastMonth)) * 100 : 0;

    return { change, percentage };
  } catch (err) {
    console.error('Error calculating month-over-month change:', err);
    return { change: 0, percentage: 0 };
  }
}
