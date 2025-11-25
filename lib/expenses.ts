import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';
import { checkSpendingLimits } from './spending-limits';
import { createSpendingLimitNotification, hasNotifiedToday, markLimitNotified } from './in-app-notifications';
import { gregorianToHijri } from './hijri-calendar';
import { getCurrentTimeWithTimezone } from './hijri-calendar';

const supabase = createClientComponentClient<Database>();

export type ExpenseEntry = Database['public']['Tables']['expense_entries']['Row'];
export type ExpenseInsert = Database['public']['Tables']['expense_entries']['Insert'];
export type ExpenseUpdate = Database['public']['Tables']['expense_entries']['Update'];

export interface ExpenseFilters {
  month?: number;
  year?: number;
  category?: string;
}

// Create a new expense entry
export async function createExpense(
  userId: string,
  data: Omit<ExpenseInsert, 'user_id' | 'id' | 'created_at'>
): Promise<{ data: ExpenseEntry | null; error: string | null }> {
  try {
    // Convert date to Date object if it's a string
    const dateObj = typeof data.date === 'string' ? new Date(data.date) : data.date;
    
    // Get Hijri date
    const hijriDate = gregorianToHijri(dateObj);
    const dateHijriString = `${hijriDate.year}-${String(hijriDate.month).padStart(2, '0')}-${String(hijriDate.day).padStart(2, '0')}`;
    
    // Get current time and timezone
    const { time, timezone } = getCurrentTimeWithTimezone();

    const { data: expense, error } = await supabase
      .from('expense_entries')
      .insert({
        user_id: userId,
        amount: data.amount,
        category: data.category,
        date: typeof data.date === 'string' ? data.date : (data.date instanceof Date ? data.date.toISOString().split('T')[0] : dateObj.toISOString().split('T')[0]),
        notes: data.notes || null,
        location_latitude: data.location_latitude || null,
        location_longitude: data.location_longitude || null,
        location_address: data.location_address || null,
        location_city: data.location_city || null,
        location_country: data.location_country || null,
        date_hijri: data.date_hijri || dateHijriString,
        time: data.time || time,
        timezone: data.timezone || timezone,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating expense:', error);
      return { data: null, error: error.message };
    }

    // Check spending limits after adding expense
    try {
      const alerts = await checkSpendingLimits(userId);
      for (const alert of alerts) {
        // Only notify once per day for each limit
        if (!hasNotifiedToday(userId, alert.limit.id)) {
          createSpendingLimitNotification(userId, {
            category: alert.limit.category,
            currentSpending: alert.currentSpending,
            limitAmount: alert.limit.limit_amount,
            percentage: alert.percentage,
            isExceeded: alert.isExceeded,
            period: alert.limit.period,
          });
          markLimitNotified(userId, alert.limit.id);
        }
      }
    } catch (notifError) {
      console.error('Error checking spending limits:', notifError);
      // Don't fail the expense creation if notifications fail
    }

    return { data: expense, error: null };
  } catch (err) {
    console.error('Unexpected error creating expense:', err);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

// Get all expense entries for a user with optional filters
export async function getExpenseEntries(
  userId: string,
  filters?: ExpenseFilters
): Promise<{ data: ExpenseEntry[]; error: string | null }> {
  try {
    let query = supabase
      .from('expense_entries')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null) // Soft delete: only get non-deleted entries
      .order('date', { ascending: false });

    // Apply filters if provided
    if (filters?.month !== undefined && filters?.year !== undefined) {
      const startDate = new Date(filters.year, filters.month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(filters.year, filters.month, 0).toISOString().split('T')[0];
      query = query.gte('date', startDate).lte('date', endDate);
    }

    if (filters?.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching expense entries:', error);
      return { data: [], error: error.message };
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.error('Unexpected error fetching expense entries:', err);
    return { data: [], error: 'An unexpected error occurred' };
  }
}

// Update an existing expense entry
export async function updateExpense(
  id: string,
  userId: string,
  data: Partial<Omit<ExpenseInsert, 'user_id' | 'id' | 'created_at'>>
): Promise<{ data: ExpenseEntry | null; error: string | null }> {
  try {
    const { data: expense, error } = await supabase
      .from('expense_entries')
      .update(data)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating expense:', error);
      return { data: null, error: error.message };
    }

    // Check spending limits after updating expense (amount might have increased)
    if (data.amount !== undefined) {
      try {
        const alerts = await checkSpendingLimits(userId);
        for (const alert of alerts) {
          if (!hasNotifiedToday(userId, alert.limit.id)) {
            createSpendingLimitNotification(userId, {
              category: alert.limit.category,
              currentSpending: alert.currentSpending,
              limitAmount: alert.limit.limit_amount,
              percentage: alert.percentage,
              isExceeded: alert.isExceeded,
              period: alert.limit.period,
            });
            markLimitNotified(userId, alert.limit.id);
          }
        }
      } catch (notifError) {
        console.error('Error checking spending limits:', notifError);
      }
    }

    return { data: expense, error: null };
  } catch (err) {
    console.error('Unexpected error updating expense:', err);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

// Soft delete an expense entry (set deleted_at)
export async function deleteExpense(
  id: string,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('expense_entries')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error soft deleting expense:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Unexpected error soft deleting expense:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Restore a soft-deleted expense entry
export async function restoreExpense(
  id: string,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('expense_entries')
      .update({ deleted_at: null })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error restoring expense:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Unexpected error restoring expense:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get expense entries for a specific month
export async function getExpensesByMonth(
  userId: string,
  month: number,
  year: number
): Promise<{ data: ExpenseEntry[]; total: number; error: string | null }> {
  try {
    const { data, error } = await getExpenseEntries(userId, { month, year });

    if (error) {
      return { data: [], total: 0, error };
    }

    const total = data.reduce((sum, entry) => sum + entry.amount, 0);

    return { data, total, error: null };
  } catch (err) {
    console.error('Unexpected error fetching expenses by month:', err);
    return { data: [], total: 0, error: 'An unexpected error occurred' };
  }
}

