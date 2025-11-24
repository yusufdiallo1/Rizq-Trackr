import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';

const supabase = createClientComponentClient<Database>();

export type Budget = Database['public']['Tables']['budgets']['Row'];
export type BudgetInsert = Database['public']['Tables']['budgets']['Insert'];
export type BudgetUpdate = Database['public']['Tables']['budgets']['Update'];

// Create a new budget
export async function createBudget(
  userId: string,
  data: Omit<BudgetInsert, 'user_id' | 'id' | 'created_at' | 'updated_at'>
): Promise<{ data: Budget | null; error: string | null }> {
  try {
    const { data: budget, error } = await supabase
      .from('budgets')
      .insert({
        user_id: userId,
        name: data.name,
        category: data.category,
        amount: data.amount,
        period: data.period,
        start_date: data.start_date,
        end_date: data.end_date || null,
        notes: data.notes || null,
        is_active: data.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating budget:', error);
      return { data: null, error: error.message };
    }

    return { data: budget, error: null };
  } catch (err) {
    console.error('Unexpected error creating budget:', err);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

// Get all budgets for a user
export async function getBudgets(
  userId: string,
  activeOnly?: boolean
): Promise<{ data: Budget[]; error: string | null }> {
  try {
    let query = supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId);

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching budgets:', error);
      return { data: [], error: error.message };
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.error('Unexpected error fetching budgets:', err);
    return { data: [], error: 'An unexpected error occurred' };
  }
}

// Update an existing budget
export async function updateBudget(
  id: string,
  userId: string,
  data: Partial<Omit<BudgetUpdate, 'user_id' | 'id' | 'created_at' | 'updated_at'>>
): Promise<{ data: Budget | null; error: string | null }> {
  try {
    const { data: budget, error } = await supabase
      .from('budgets')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating budget:', error);
      return { data: null, error: error.message };
    }

    return { data: budget, error: null };
  } catch (err) {
    console.error('Unexpected error updating budget:', err);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

// Delete a budget
export async function deleteBudget(
  id: string,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting budget:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Unexpected error deleting budget:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

