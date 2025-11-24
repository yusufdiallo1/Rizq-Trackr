import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';
import { fetchMetalPrices, calculateNisab, getNisabThreshold as getNisabFromAPI, convertNisabToCurrency } from './nisab-api';
import { hijriToGregorian, gregorianToHijri } from './hijri-calendar';

const supabase = createClientComponentClient<Database>();

export interface ZakatableIncome {
  id: string;
  amount: number;
  category: string;
  date: string;
  notes: string | null;
  is_zakatable: boolean;
}

export interface ZakatCalculation {
  currentSavings: number;
  zakatableIncome: number;
  debts: number;
  totalZakatableWealth: number;
  nisabThreshold: number;
  zakatDue: number;
  isAboveNisab: boolean;
  amountToReachNisab: number;
}

export interface ZakatPaymentRecord {
  id: string;
  amount: number;
  paid_date: string;
  paid_date_hijri?: string;
  notes: string | null;
  created_at: string;
}

export interface ZakatYearlyComparison {
  year: number;
  hijriYear: number;
  savings: number;
  nisabThreshold: number;
  zakatPaid: number;
  zakatDue: number;
}

// Get current Nisab threshold from database or API
export async function getNisabThreshold(currency: string = 'USD'): Promise<number> {
  try {
    // First, try to get today's price from database
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('nisab_prices')
      .select('nisab_gold_value, currency')
      .eq('date', today)
      .eq('currency', currency)
      .single();

    if (!error && data) {
      return Number(data.nisab_gold_value);
    }

    // If not in database, fetch from API and store it
    const nisab = await calculateNisab(currency);
    await storeNisabPrice(nisab, currency);
    return nisab.goldBased;
  } catch (error) {
    console.error('Error getting Nisab threshold:', error);
    // Fallback to API
    try {
      const nisab = await getNisabFromAPI(currency);
      return nisab;
    } catch (apiError) {
      console.error('Error fetching from API:', apiError);
      // Final fallback
  return 4000;
    }
  }
}

// Store Nisab price in database
async function storeNisabPrice(nisab: { goldBased: number; silverBased: number; date: string }, currency: string): Promise<void> {
  try {
    const prices = await fetchMetalPrices(currency);
    const { error } = await supabase
      .from('nisab_prices')
      .upsert({
        date: nisab.date,
        gold_price_per_gram: prices.goldPerGram,
        silver_price_per_gram: prices.silverPerGram,
        nisab_gold_value: nisab.goldBased,
        nisab_silver_value: nisab.silverBased,
        currency,
      }, {
        onConflict: 'date,currency'
      });

    if (error) {
      console.error('Error storing Nisab price:', error);
    }
  } catch (error) {
    console.error('Error in storeNisabPrice:', error);
  }
}

// Get all income entries where is_zakatable = true
export async function getZakatableIncome(userId: string): Promise<ZakatableIncome[]> {
  try {
    const { data, error } = await supabase
      .from('income_entries')
      .select('id, amount, category, date, notes, is_zakatable')
      .eq('user_id', userId)
      .eq('is_zakatable', true)
      .order('date', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching zakatable income:', error);
    return [];
  }
}

// Get all income entries (for toggling zakatable status)
export async function getAllIncome(userId: string): Promise<ZakatableIncome[]> {
  try {
    const { data, error } = await supabase
      .from('income_entries')
      .select('id, amount, category, date, notes, is_zakatable')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching income entries:', error);
    return [];
  }
}

// Toggle is_zakatable flag for an income entry
export async function toggleIncomeZakatable(
  incomeId: string,
  userId: string,
  isZakatable: boolean
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('income_entries')
      .update({ is_zakatable: isZakatable })
      .eq('id', incomeId)
      .eq('user_id', userId);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error toggling zakatable status:', error);
    return { success: false, error: 'Failed to update zakatable status' };
  }
}

// Calculate total savings (income - expenses - zakat paid)
export async function calculateCurrentSavings(userId: string): Promise<number> {
  try {
    // Fetch all data in parallel for speed
    const [incomeResult, expenseResult, zakatResult] = await Promise.all([
      supabase.from('income_entries').select('amount').eq('user_id', userId),
      supabase.from('expense_entries').select('amount').eq('user_id', userId),
      supabase.from('zakat_payments').select('amount').eq('user_id', userId),
    ]);

    if (incomeResult.error) throw incomeResult.error;
    if (expenseResult.error) throw expenseResult.error;
    if (zakatResult.error) throw zakatResult.error;

    const totalIncome = incomeResult.data?.reduce((sum, entry) => sum + Number(entry.amount), 0) || 0;
    const totalExpenses = expenseResult.data?.reduce((sum, entry) => sum + Number(entry.amount), 0) || 0;
    const totalZakatPaid = zakatResult.data?.reduce((sum, entry) => sum + Number(entry.amount), 0) || 0;

    return totalIncome - totalExpenses - totalZakatPaid;
  } catch (error) {
    console.error('Error calculating current savings:', error);
    return 0;
  }
}

// Calculate zakat due
export async function calculateZakatDue(
  userId: string,
  debts: number = 0,
  currency: string = 'USD'
): Promise<ZakatCalculation> {
  try {
    // Fetch savings and zakatable income in parallel
    const [currentSavings, zakatableIncomeEntries, nisabThreshold] = await Promise.all([
      calculateCurrentSavings(userId),
      getZakatableIncome(userId),
      getNisabThreshold(currency),
    ]);

    const zakatableIncome = zakatableIncomeEntries.reduce(
      (sum, entry) => sum + Number(entry.amount),
      0
    );

    // Calculate total zakatable wealth
    const totalZakatableWealth = currentSavings + zakatableIncome - debts;

    // Check if above nisab
    const isAboveNisab = totalZakatableWealth >= nisabThreshold;

    // Calculate zakat due (2.5% if above nisab)
    const zakatDue = isAboveNisab ? totalZakatableWealth * 0.025 : 0;

    // Calculate amount needed to reach nisab
    const amountToReachNisab = isAboveNisab ? 0 : nisabThreshold - totalZakatableWealth;

    return {
      currentSavings,
      zakatableIncome,
      debts,
      totalZakatableWealth,
      nisabThreshold,
      zakatDue,
      isAboveNisab,
      amountToReachNisab,
    };
  } catch (error) {
    console.error('Error calculating zakat:', error);
    const nisabThreshold = await getNisabThreshold(currency).catch(() => 4000);
    return {
      currentSavings: 0,
      zakatableIncome: 0,
      debts: 0,
      totalZakatableWealth: 0,
      nisabThreshold,
      zakatDue: 0,
      isAboveNisab: false,
      amountToReachNisab: nisabThreshold,
    };
  }
}

// Record a zakat payment
export async function recordZakatPayment(
  userId: string,
  amount: number,
  paidDate: string,
  notes: string = ''
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('zakat_payments')
      .insert({
        user_id: userId,
        amount,
        paid_date: paidDate,
        notes: notes || null,
      });

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Error recording zakat payment:', error);
    return { success: false, error: 'Failed to record zakat payment' };
  }
}

// Get zakat payment history with Hijri dates
export async function getZakatHistory(userId: string): Promise<ZakatPaymentRecord[]> {
  try {
    const { data, error } = await supabase
      .from('zakat_payments')
      .select('*')
      .eq('user_id', userId)
      .order('paid_date', { ascending: false });

    if (error) throw error;

    // Add Hijri dates to each payment
    const historyWithHijri = (data || []).map(payment => {
      const gregorianDate = new Date(payment.paid_date);
      const hijri = gregorianToHijri(gregorianDate);
      return {
        ...payment,
        paid_date_hijri: `${hijri.year}-${String(hijri.month).padStart(2, '0')}-${String(hijri.day).padStart(2, '0')}`,
      };
    });

    return historyWithHijri;
  } catch (error) {
    console.error('Error fetching zakat history:', error);
    return [];
  }
}

// Get yearly comparison data (Nisab vs savings over years)
export async function getZakatYearlyComparison(userId: string, currency: string = 'USD'): Promise<ZakatYearlyComparison[]> {
  try {
    // Get payment history grouped by year
    const history = await getZakatHistory(userId);
    
    // Get all unique years from payments
    const years = new Set<number>();
    history.forEach(payment => {
      const year = new Date(payment.paid_date).getFullYear();
      years.add(year);
    });

    // Get current year and past 5 years
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      years.add(currentYear - i);
    }

    const comparison: ZakatYearlyComparison[] = [];

    for (const year of Array.from(years).sort()) {
      // Get payments for this year
      const yearPayments = history.filter(p => {
        const paymentYear = new Date(p.paid_date).getFullYear();
        return paymentYear === year;
      });

      const zakatPaid = yearPayments.reduce((sum, p) => sum + Number(p.amount), 0);

      // Calculate savings for this year (simplified - would need proper date range)
      const yearStart = new Date(year, 0, 1);
      const yearEnd = new Date(year, 11, 31);
      
      const [incomeResult, expenseResult] = await Promise.all([
        supabase
          .from('income_entries')
          .select('amount')
          .eq('user_id', userId)
          .gte('date', yearStart.toISOString().split('T')[0])
          .lte('date', yearEnd.toISOString().split('T')[0]),
        supabase
          .from('expense_entries')
          .select('amount')
          .eq('user_id', userId)
          .gte('date', yearStart.toISOString().split('T')[0])
          .lte('date', yearEnd.toISOString().split('T')[0]),
      ]);

      const totalIncome = incomeResult.data?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      const totalExpenses = expenseResult.data?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      const savings = totalIncome - totalExpenses;

      // Get average Nisab for the year (simplified - use current year's Nisab)
      const nisabThreshold = await getNisabThreshold(currency).catch(() => 4000);
      
      // Calculate Zakat due (2.5% if above Nisab)
      const zakatDue = savings >= nisabThreshold ? savings * 0.025 : 0;

      // Get Hijri year
      const hijri = gregorianToHijri(yearStart);

      comparison.push({
        year,
        hijriYear: hijri.year,
        savings,
        nisabThreshold,
        zakatPaid,
        zakatDue,
      });
    }

    return comparison.sort((a, b) => b.year - a.year);
  } catch (error) {
    console.error('Error getting yearly comparison:', error);
    return [];
  }
}

// Calculate total zakat paid
export async function getTotalZakatPaid(userId: string): Promise<number> {
  try {
    const history = await getZakatHistory(userId);
    return history.reduce((sum, payment) => sum + Number(payment.amount), 0);
  } catch (error) {
    console.error('Error calculating total zakat paid:', error);
    return 0;
  }
}

// Calculate savings over past Hijri year
export async function calculateSavingsOverHijriYear(
  userId: string,
  zakatDateHijri?: { year: number; month: number; day: number }
): Promise<number> {
  try {
    // If no Zakat date provided, use current date minus 1 Hijri year
    let startHijri: { year: number; month: number; day: number };
    let endHijri: { year: number; month: number; day: number };

    if (zakatDateHijri) {
      // Calculate from Zakat date minus 1 year to Zakat date
      endHijri = zakatDateHijri;
      startHijri = {
        year: zakatDateHijri.year - 1,
        month: zakatDateHijri.month,
        day: zakatDateHijri.day,
      };
    } else {
      // Use current date
      const now = new Date();
      endHijri = gregorianToHijri(now);
      startHijri = {
        year: endHijri.year - 1,
        month: endHijri.month,
        day: endHijri.day,
      };
    }

    // Convert Hijri dates to Gregorian for querying
    const startGregorian = hijriToGregorian(startHijri.year, startHijri.month, startHijri.day);
    const endGregorian = hijriToGregorian(endHijri.year, endHijri.month, endHijri.day);

    // Fetch income and expenses within the date range
    const [incomeResult, expenseResult] = await Promise.all([
      supabase
        .from('income_entries')
        .select('amount')
        .eq('user_id', userId)
        .gte('date', startGregorian.toISOString().split('T')[0])
        .lte('date', endGregorian.toISOString().split('T')[0]),
      supabase
        .from('expense_entries')
        .select('amount')
        .eq('user_id', userId)
        .gte('date', startGregorian.toISOString().split('T')[0])
        .lte('date', endGregorian.toISOString().split('T')[0]),
    ]);

    if (incomeResult.error) throw incomeResult.error;
    if (expenseResult.error) throw expenseResult.error;

    const totalIncome = incomeResult.data?.reduce((sum, entry) => sum + Number(entry.amount), 0) || 0;
    const totalExpenses = expenseResult.data?.reduce((sum, entry) => sum + Number(entry.amount), 0) || 0;

    return totalIncome - totalExpenses;
  } catch (error) {
    console.error('Error calculating savings over Hijri year:', error);
    return 0;
  }
}

// Get user's Zakat date from database
export async function getUserZakatDate(userId: string): Promise<{ year: number; month: number; day: number } | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('zakat_date_hijri')
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!data?.zakat_date_hijri) return null;

    // Parse the date string (format: YYYY-MM-DD)
    const [year, month, day] = data.zakat_date_hijri.split('-').map(Number);
    return { year, month, day };
  } catch (error) {
    console.error('Error fetching user Zakat date:', error);
    return null;
  }
}

export interface ZakatEligibilityResult {
  isObligatory: boolean;
  annualSavings: number;
  nisabThreshold: number;
  zakatAmountDue: number;
  hasMaintainedNisab: boolean;
  daysUntilZakatDate: number | null;
  nextZakatDateHijri: { year: number; month: number; day: number } | null;
  nextZakatDateGregorian: Date | null;
}

// Calculate Zakat eligibility based on Hijri year
export async function calculateZakatEligibility(
  userId: string,
  currency: string = 'USD'
): Promise<ZakatEligibilityResult> {
  try {
    // Get user's Zakat date
    const zakatDateHijri = await getUserZakatDate(userId);
    
    // Calculate annual savings over past Hijri year
    const annualSavings = await calculateSavingsOverHijriYear(userId, zakatDateHijri || undefined);
    
    // Get current Nisab threshold
    const nisabThreshold = await getNisabThreshold(currency);
    
    // Check if savings maintained above Nisab for full year
    // For now, we check if current savings >= Nisab
    // In a full implementation, we'd check month-by-month
    const hasMaintainedNisab = annualSavings >= nisabThreshold;
    
    // Calculate Zakat amount (2.5% if obligatory)
    const zakatAmountDue = hasMaintainedNisab ? annualSavings * 0.025 : 0;
    
    // Calculate next Zakat date
    let nextZakatDateHijri: { year: number; month: number; day: number } | null = null;
    let nextZakatDateGregorian: Date | null = null;
    let daysUntilZakatDate: number | null = null;
    
    if (zakatDateHijri) {
      const now = new Date();
      const currentHijri = gregorianToHijri(now);
      
      // Calculate next Zakat date
      if (currentHijri.year < zakatDateHijri.year || 
          (currentHijri.year === zakatDateHijri.year && 
           (currentHijri.month < zakatDateHijri.month || 
            (currentHijri.month === zakatDateHijri.month && currentHijri.day < zakatDateHijri.day)))) {
        // Zakat date hasn't passed this year
        nextZakatDateHijri = zakatDateHijri;
      } else {
        // Zakat date has passed, next one is next year
        nextZakatDateHijri = {
          year: zakatDateHijri.year + 1,
          month: zakatDateHijri.month,
          day: zakatDateHijri.day,
        };
      }
      
      nextZakatDateGregorian = hijriToGregorian(
        nextZakatDateHijri.year,
        nextZakatDateHijri.month,
        nextZakatDateHijri.day
      );
      
      // Calculate days until Zakat date
      const diffTime = nextZakatDateGregorian.getTime() - now.getTime();
      daysUntilZakatDate = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    return {
      isObligatory: hasMaintainedNisab,
      annualSavings,
      nisabThreshold,
      zakatAmountDue,
      hasMaintainedNisab,
      daysUntilZakatDate,
      nextZakatDateHijri,
      nextZakatDateGregorian,
    };
  } catch (error) {
    console.error('Error calculating Zakat eligibility:', error);
    return {
      isObligatory: false,
      annualSavings: 0,
      nisabThreshold: 4000,
      zakatAmountDue: 0,
      hasMaintainedNisab: false,
      daysUntilZakatDate: null,
      nextZakatDateHijri: null,
      nextZakatDateGregorian: null,
    };
  }
}

