import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';

const supabase = createClientComponentClient<Database>();

export type Account = Database['public']['Tables']['accounts']['Row'];
export type AccountInsert = Database['public']['Tables']['accounts']['Insert'];
export type AccountUpdate = Database['public']['Tables']['accounts']['Update'];

// Create a new account
export async function createAccount(
  userId: string,
  data: Omit<AccountInsert, 'user_id' | 'id' | 'created_at' | 'updated_at'>
): Promise<{ data: Account | null; error: string | null }> {
  try {
    const { data: account, error } = await supabase
      .from('accounts')
      .insert({
        user_id: userId,
        name: data.name,
        type: data.type,
        balance: data.balance ?? 0,
        currency: data.currency ?? 'USD',
        bank_name: data.bank_name || null,
        account_number: data.account_number || null,
        notes: data.notes || null,
        is_active: data.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating account:', error);
      return { data: null, error: error.message };
    }

    return { data: account, error: null };
  } catch (err) {
    console.error('Unexpected error creating account:', err);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

// Get all accounts for a user
export async function getAccounts(
  userId: string,
  activeOnly?: boolean
): Promise<{ data: Account[]; error: string | null }> {
  try {
    let query = supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId);

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching accounts:', error);
      return { data: [], error: error.message };
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.error('Unexpected error fetching accounts:', err);
    return { data: [], error: 'An unexpected error occurred' };
  }
}

// Update an existing account
export async function updateAccount(
  id: string,
  userId: string,
  data: Partial<Omit<AccountUpdate, 'user_id' | 'id' | 'created_at' | 'updated_at'>>
): Promise<{ data: Account | null; error: string | null }> {
  try {
    const { data: account, error } = await supabase
      .from('accounts')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating account:', error);
      return { data: null, error: error.message };
    }

    return { data: account, error: null };
  } catch (err) {
    console.error('Unexpected error updating account:', err);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

// Delete an account
export async function deleteAccount(
  id: string,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting account:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Unexpected error deleting account:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

