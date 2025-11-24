import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';

const supabase = createClientComponentClient<Database>();

export type Customer = Database['public']['Tables']['customers']['Row'];
export type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
export type CustomerUpdate = Database['public']['Tables']['customers']['Update'];

// Create a new customer
export async function createCustomer(
  userId: string,
  data: Omit<CustomerInsert, 'user_id' | 'id' | 'created_at' | 'updated_at'>
): Promise<{ data: Customer | null; error: string | null }> {
  try {
    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        user_id: userId,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        company: data.company || null,
        address: data.address || null,
        notes: data.notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating customer:', error);
      return { data: null, error: error.message };
    }

    return { data: customer, error: null };
  } catch (err) {
    console.error('Unexpected error creating customer:', err);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

// Get all customers for a user
export async function getCustomers(
  userId: string
): Promise<{ data: Customer[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customers:', error);
      return { data: [], error: error.message };
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.error('Unexpected error fetching customers:', err);
    return { data: [], error: 'An unexpected error occurred' };
  }
}

// Update an existing customer
export async function updateCustomer(
  id: string,
  userId: string,
  data: Partial<Omit<CustomerUpdate, 'user_id' | 'id' | 'created_at' | 'updated_at'>>
): Promise<{ data: Customer | null; error: string | null }> {
  try {
    const { data: customer, error } = await supabase
      .from('customers')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating customer:', error);
      return { data: null, error: error.message };
    }

    return { data: customer, error: null };
  } catch (err) {
    console.error('Unexpected error updating customer:', err);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

// Delete a customer
export async function deleteCustomer(
  id: string,
  userId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting customer:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Unexpected error deleting customer:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

