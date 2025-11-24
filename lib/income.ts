import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';

const supabase = createClientComponentClient<Database>();

export type IncomeEntry = Database['public']['Tables']['income_entries']['Row'];
export type IncomeInsert = Database['public']['Tables']['income_entries']['Insert'];
export type IncomeUpdate = Database['public']['Tables']['income_entries']['Update'];

export interface IncomeFilters {
  month?: number;
  year?: number;
  category?: string;
}

// Create a new income entry
export async function createIncome(
  userId: string,
  data: Omit<IncomeInsert, 'user_id' | 'id' | 'created_at'>
): Promise<{ data: IncomeEntry | null; error: string | null }> {
  try {
    const { data: income, error } = await supabase
      .from('income_entries')
      .insert({
        user_id: userId,
        amount: data.amount,
        category: data.category,
        date: data.date,
        notes: data.notes || null,
        is_zakatable: data.is_zakatable ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating income:', error);
      return { data: null, error: error.message };
    }

    return { data: income, error: null };
  } catch (err) {
    console.error('Unexpected error creating income:', err);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

// Get all income entries for a user with optional filters
export async function getIncomeEntries(
  userId: string,
  filters?: IncomeFilters
): Promise<{ data: IncomeEntry[]; error: string | null }> {
  try {
    let query = supabase
      .from('income_entries')
      .select('*')
      .eq('user_id', userId)
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
      console.error('Error fetching income entries:', error);
      return { data: [], error: error.message };
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.error('Unexpected error fetching income entries:', err);
    return { data: [], error: 'An unexpected error occurred' };
  }
}

// Update an existing income entry
export async function updateIncome(
  id: string,
  userId: string,
  data: Partial<Omit<IncomeInsert, 'user_id' | 'id' | 'created_at'>>
): Promise<{ data: IncomeEntry | null; error: string | null }> {
  try {
    const { data: income, error } = await supabase
      .from('income_entries')
      .update(data)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating income:', error);
      return { data: null, error: error.message };
    }

    return { data: income, error: null };
  } catch (err) {
    console.error('Unexpected error updating income:', err);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

// Delete an income entry
export async function deleteIncome(
  id: string,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('income_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting income:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Unexpected error deleting income:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get income entries for a specific month
export async function getIncomeByMonth(
  userId: string,
  month: number,
  year: number
): Promise<{ data: IncomeEntry[]; total: number; error: string | null }> {
  try {
    const { data, error } = await getIncomeEntries(userId, { month, year });

    if (error) {
      return { data: [], total: 0, error };
    }

    const total = data.reduce((sum, entry) => sum + entry.amount, 0);

    return { data, total, error: null };
  } catch (err) {
    console.error('Unexpected error fetching income by month:', err);
    return { data: [], total: 0, error: 'An unexpected error occurred' };
  }
}
