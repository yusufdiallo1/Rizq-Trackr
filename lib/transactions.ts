import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';

function getSupabaseClient() {
  return createClientComponentClient<Database>();
}

export interface Transaction {
  id: string;
  date: string;
  date_hijri?: string | null;
  time?: string | null;
  timezone?: string | null;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  notes: string | null;
  is_zakatable?: boolean;
  created_at: string;
  location_latitude?: number | null;
  location_longitude?: number | null;
  location_address?: string | null;
  location_city?: string | null;
  location_country?: string | null;
}

export interface TransactionFilters {
  type?: 'all' | 'income' | 'expense';
  category?: string;
  startDate?: string;
  endDate?: string;
  startDateHijri?: string;
  endDateHijri?: string;
  searchTerm?: string;
  location?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  net: number;
  transactionCount: number;
}

// Get all transactions (income + expenses) merged and sorted
export async function getAllTransactions(
  userId: string,
  filters?: TransactionFilters,
  limit?: number
): Promise<{ data: Transaction[]; error: string | null }> {
  try {
    const supabase = getSupabaseClient();
    // Fetch income entries - only select needed fields
    let incomeQuery = supabase
      .from('income_entries')
      .select('id, date, date_hijri, time, timezone, category, amount, notes, is_zakatable, created_at, location_latitude, location_longitude, location_address, location_city, location_country')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('date', { ascending: false });

    // Fetch expense entries - only select needed fields
    let expenseQuery = supabase
      .from('expense_entries')
      .select('id, date, date_hijri, time, timezone, category, amount, notes, created_at, location_latitude, location_longitude, location_address, location_city, location_country')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('date', { ascending: false });

    // Apply date filters (Gregorian)
    if (filters?.startDate) {
      incomeQuery = incomeQuery.gte('date', filters.startDate);
      expenseQuery = expenseQuery.gte('date', filters.startDate);
    }

    if (filters?.endDate) {
      incomeQuery = incomeQuery.lte('date', filters.endDate);
      expenseQuery = expenseQuery.lte('date', filters.endDate);
    }

    // Apply Hijri date filters
    if (filters?.startDateHijri) {
      incomeQuery = incomeQuery.gte('date_hijri', filters.startDateHijri);
      expenseQuery = expenseQuery.gte('date_hijri', filters.startDateHijri);
    }

    if (filters?.endDateHijri) {
      incomeQuery = incomeQuery.lte('date_hijri', filters.endDateHijri);
      expenseQuery = expenseQuery.lte('date_hijri', filters.endDateHijri);
    }

    // Apply category filter
    if (filters?.category && filters.category !== 'all') {
      incomeQuery = incomeQuery.eq('category', filters.category);
      expenseQuery = expenseQuery.eq('category', filters.category);
    }

    // Apply location filter
    if (filters?.location) {
      incomeQuery = incomeQuery.or(`location_city.ilike.%${filters.location}%,location_country.ilike.%${filters.location}%`);
      expenseQuery = expenseQuery.or(`location_city.ilike.%${filters.location}%,location_country.ilike.%${filters.location}%`);
    }

    // Apply amount filters
    if (filters?.minAmount !== undefined) {
      incomeQuery = incomeQuery.gte('amount', filters.minAmount);
      expenseQuery = expenseQuery.gte('amount', filters.minAmount);
    }

    if (filters?.maxAmount !== undefined) {
      incomeQuery = incomeQuery.lte('amount', filters.maxAmount);
      expenseQuery = expenseQuery.lte('amount', filters.maxAmount);
    }

    // Apply limit if specified (for initial load performance)
    if (limit) {
      incomeQuery = incomeQuery.limit(limit);
      expenseQuery = expenseQuery.limit(limit);
    }

    // Fetch data in parallel
    const [incomeResult, expenseResult] = await Promise.all([
      incomeQuery,
      expenseQuery,
    ]);

    if (incomeResult.error) {
      console.error('Error fetching income:', incomeResult.error);
      return { data: [], error: incomeResult.error.message };
    }

    if (expenseResult.error) {
      console.error('Error fetching expenses:', expenseResult.error);
      return { data: [], error: expenseResult.error.message };
    }

    // Convert to Transaction type
    const incomeTransactions: Transaction[] = (incomeResult.data || []).map((entry) => ({
      id: entry.id,
      date: entry.date,
      date_hijri: entry.date_hijri || null,
      time: entry.time || null,
      timezone: entry.timezone || null,
      type: 'income' as const,
      category: entry.category,
      amount: entry.amount,
      notes: entry.notes,
      is_zakatable: entry.is_zakatable,
      location_latitude: entry.location_latitude || null,
      location_longitude: entry.location_longitude || null,
      location_address: entry.location_address || null,
      location_city: entry.location_city || null,
      location_country: entry.location_country || null,
      created_at: entry.created_at,
    }));

    const expenseTransactions: Transaction[] = (expenseResult.data || []).map((entry) => ({
      id: entry.id,
      date: entry.date,
      date_hijri: entry.date_hijri || null,
      time: entry.time || null,
      timezone: entry.timezone || null,
      type: 'expense' as const,
      category: entry.category,
      amount: entry.amount,
      notes: entry.notes,
      location_latitude: entry.location_latitude || null,
      location_longitude: entry.location_longitude || null,
      location_address: entry.location_address || null,
      location_city: entry.location_city || null,
      location_country: entry.location_country || null,
      created_at: entry.created_at,
    }));

    // Merge and filter by type
    let allTransactions: Transaction[] = [];

    if (!filters?.type || filters.type === 'all') {
      allTransactions = [...incomeTransactions, ...expenseTransactions];
    } else if (filters.type === 'income') {
      allTransactions = incomeTransactions;
    } else if (filters.type === 'expense') {
      allTransactions = expenseTransactions;
    }

    // Apply search filter (searches in notes, category, location, amount, and dates)
    if (filters?.searchTerm && filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      allTransactions = allTransactions.filter((t) => {
        return (
          t.category.toLowerCase().includes(searchLower) ||
          t.notes?.toLowerCase().includes(searchLower) ||
          t.amount.toString().includes(searchLower) ||
          t.location_city?.toLowerCase().includes(searchLower) ||
          t.location_country?.toLowerCase().includes(searchLower) ||
          t.location_address?.toLowerCase().includes(searchLower) ||
          t.date.includes(filters.searchTerm || '') ||
          t.date_hijri?.includes(filters.searchTerm || '')
        );
      });
    }

    // Sort by date (newest first) - only if not already sorted by DB
    if (!limit) {
    allTransactions.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
    }

    return { data: allTransactions, error: null };
  } catch (err) {
    console.error('Unexpected error fetching transactions:', err);
    return { data: [], error: 'An unexpected error occurred' };
  }
}

// Get transaction summary - optimized with database aggregations
export async function getTransactionSummary(
  userId: string,
  filters?: TransactionFilters
): Promise<TransactionSummary> {
  try {
    const supabase = getSupabaseClient();
    // Use database aggregations instead of fetching all data
    let incomeQuery = supabase
      .from('income_entries')
      .select('amount', { count: 'exact' })
      .eq('user_id', userId);

    let expenseQuery = supabase
      .from('expense_entries')
      .select('amount', { count: 'exact' })
      .eq('user_id', userId);

    // Apply date filters
    if (filters?.startDate) {
      incomeQuery = incomeQuery.gte('date', filters.startDate);
      expenseQuery = expenseQuery.gte('date', filters.startDate);
    }

    if (filters?.endDate) {
      incomeQuery = incomeQuery.lte('date', filters.endDate);
      expenseQuery = expenseQuery.lte('date', filters.endDate);
    }

    // Apply category filter
    if (filters?.category && filters.category !== 'all') {
      incomeQuery = incomeQuery.eq('category', filters.category);
      expenseQuery = expenseQuery.eq('category', filters.category);
    }

    // Apply type filter
    if (filters?.type === 'income') {
      expenseQuery = expenseQuery.limit(0); // Don't fetch expenses
    } else if (filters?.type === 'expense') {
      incomeQuery = incomeQuery.limit(0); // Don't fetch income
    }

    // Fetch aggregated data in parallel
    const [incomeResult, expenseResult] = await Promise.all([
      incomeQuery,
      expenseQuery,
    ]);

    if (incomeResult.error) throw incomeResult.error;
    if (expenseResult.error) throw expenseResult.error;

    const totalIncome = incomeResult.data?.reduce((sum, entry) => sum + Number(entry.amount), 0) || 0;
    const totalExpenses = expenseResult.data?.reduce((sum, entry) => sum + Number(entry.amount), 0) || 0;
    const net = totalIncome - totalExpenses;
    const transactionCount = (incomeResult.count || 0) + (expenseResult.count || 0);

    return {
      totalIncome,
      totalExpenses,
      net,
      transactionCount,
    };
  } catch (err) {
    console.error('Error calculating transaction summary:', err);
    return {
      totalIncome: 0,
      totalExpenses: 0,
      net: 0,
      transactionCount: 0,
    };
  }
}

// Get all unique categories (income + expense)
export async function getAllCategories(userId: string): Promise<string[]> {
  try {
    const supabase = getSupabaseClient();
    const [incomeResult, expenseResult] = await Promise.all([
      supabase
        .from('income_entries')
        .select('category')
        .eq('user_id', userId),
      supabase
        .from('expense_entries')
        .select('category')
        .eq('user_id', userId),
    ]);

    const incomeCategories = incomeResult.data?.map((e) => e.category) || [];
    const expenseCategories = expenseResult.data?.map((e) => e.category) || [];

    // Get unique categories
    const allCategories = [...new Set([...incomeCategories, ...expenseCategories])];

    return allCategories.sort();
  } catch (err) {
    console.error('Error fetching categories:', err);
    return [];
  }
}

// Export transactions to CSV
export function exportTransactionsToCSV(transactions: Transaction[]): string {
  const headers = ['Date', 'Type', 'Category', 'Amount', 'Notes'];
  const rows = transactions.map((t) => [
    t.date,
    t.type.charAt(0).toUpperCase() + t.type.slice(1),
    t.category,
    t.amount.toFixed(2),
    t.notes || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => {
        // Escape quotes and wrap in quotes if contains comma
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    ),
  ].join('\n');

  return csvContent;
}

// Download CSV file
export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
