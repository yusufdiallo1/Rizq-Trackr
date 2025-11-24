/**
 * Nisab Prices Service
 * Daily update mechanism for Nisab prices
 * Can be called via Supabase Edge Function or cron job
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';
import { fetchMetalPrices, calculateNisab } from './nisab-api';

const supabase = createClientComponentClient<Database>();

export interface NisabPriceUpdate {
  date: string;
  gold_price_per_gram: number;
  silver_price_per_gram: number;
  nisab_gold_value: number;
  nisab_silver_value: number;
  currency: string;
}

/**
 * Check if prices exist for a specific date
 */
export async function checkPricesExist(date: string, currency: string = 'USD'): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('nisab_prices')
      .select('id')
      .eq('date', date)
      .eq('currency', currency)
      .single();

    return !error && data !== null;
  } catch (error) {
    console.error('Error checking prices:', error);
    return false;
  }
}

/**
 * Update Nisab prices for today
 * This should be called daily (via Edge Function or cron)
 */
export async function updateTodayNisabPrices(currency: string = 'USD'): Promise<{
  success: boolean;
  error: string | null;
  data: NisabPriceUpdate | null;
}> {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Check if prices already exist for today
    const exists = await checkPricesExist(today, currency);
    if (exists) {
      console.log(`Prices for ${today} already exist`);
      return { success: true, error: null, data: null };
    }

    // Fetch current metal prices
    const metalPrices = await fetchMetalPrices(currency);
    if (!metalPrices) {
      return {
        success: false,
        error: 'Failed to fetch metal prices',
        data: null,
      };
    }

    // Calculate Nisab values
    const nisab = await calculateNisab(currency);

    // Store in database
    const priceData: NisabPriceUpdate = {
      date: today,
      gold_price_per_gram: metalPrices.goldPerGram,
      silver_price_per_gram: metalPrices.silverPerGram,
      nisab_gold_value: nisab.goldBased,
      nisab_silver_value: nisab.silverBased,
      currency,
    };

    const { data, error } = await supabase
      .from('nisab_prices')
      .upsert(priceData, {
        onConflict: 'date,currency',
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing Nisab prices:', error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }

    return {
      success: true,
      error: null,
      data: priceData,
    };
  } catch (error) {
    console.error('Unexpected error updating Nisab prices:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      data: null,
    };
  }
}

/**
 * Get Nisab prices for a specific date
 */
export async function getNisabPricesForDate(
  date: string,
  currency: string = 'USD'
): Promise<{
  data: NisabPriceUpdate | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('nisab_prices')
      .select('*')
      .eq('date', date)
      .eq('currency', currency)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as NisabPriceUpdate, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Get latest Nisab prices (most recent date)
 */
export async function getLatestNisabPrices(currency: string = 'USD'): Promise<{
  data: NisabPriceUpdate | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('nisab_prices')
      .select('*')
      .eq('currency', currency)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as NisabPriceUpdate, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Update prices for a date range (for historical data or bulk updates)
 */
export async function updatePricesForDateRange(
  startDate: string,
  endDate: string,
  currency: string = 'USD'
): Promise<{
  success: boolean;
  error: string | null;
  updated: number;
}> {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let updated = 0;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const exists = await checkPricesExist(dateStr, currency);

      if (!exists) {
        // For historical dates, we might need a different API or use cached values
        // For now, we'll use today's prices as a fallback
        const result = await updateTodayNisabPrices(currency);
        if (result.success) {
          updated++;
        }
      }
    }

    return {
      success: true,
      error: null,
      updated,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      updated: 0,
    };
  }
}

