import { NextRequest, NextResponse } from 'next/server';
import { calculateNisab, fetchMetalPrices } from '@/lib/nisab-api';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Mark this route as dynamic to prevent build-time execution
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Supported currencies
const CURRENCIES = ['USD', 'EUR', 'GBP', 'AED', 'SAR', 'EGP', 'PKR', 'INR', 'MYR', 'IDR'];

/**
 * API Route to update Nisab prices daily
 * This should be called by a cron job or scheduled task at midnight
 * 
 * Usage:
 * - Manual trigger: GET /api/nisab/update
 * - Cron job: Set up to call this endpoint daily at midnight
 */
export async function GET(request: NextRequest) {
  try {
    // Create Supabase client inside the function to avoid build-time execution
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseKey);

    // Optional: Add authentication/authorization check for cron jobs
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const today = new Date().toISOString().split('T')[0];
    const results: { [key: string]: { success: boolean; error?: string } } = {};

    // Update Nisab prices for all supported currencies
    for (const currency of CURRENCIES) {
      try {
        // Fetch current metal prices
        const prices = await fetchMetalPrices(currency);
        
        // Calculate Nisab values
        const nisab = await calculateNisab(currency);

        // Store in database
        // Use proper typing from Database schema
        type NisabPriceInsert = Database['public']['Tables']['nisab_prices']['Insert'];
        
        const nisabData: NisabPriceInsert = {
            date: today,
            gold_price_per_gram: prices.goldPerGram,
            silver_price_per_gram: prices.silverPerGram,
            nisab_gold_value: nisab.goldBased,
            nisab_silver_value: nisab.silverBased,
            currency,
        };
        
        // Use type-safe query with proper typing
        const { error } = await supabase
          .from('nisab_prices')
          .upsert(nisabData, {
            onConflict: 'date,currency'
          });

        if (error) {
          results[currency] = { success: false, error: error.message };
        } else {
          results[currency] = { success: true };
        }
      } catch (error: any) {
        results[currency] = { 
          success: false, 
          error: error.message || 'Unknown error' 
        };
      }
    }

    const successCount = Object.values(results).filter(r => r.success).length;
    const totalCount = CURRENCIES.length;

    return NextResponse.json({
      success: successCount === totalCount,
      date: today,
      updated: successCount,
      total: totalCount,
      results,
    });
  } catch (error: any) {
    console.error('Error updating Nisab prices:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update Nisab prices',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

// Also support POST for cron services that use POST
export async function POST(request: NextRequest) {
  return GET(request);
}

