/**
 * API Route: Daily Nisab Price Update
 * This endpoint can be called by a cron job or Supabase Edge Function
 * to update Nisab prices daily
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateTodayNisabPrices } from '@/lib/nisab-prices-service';

// Mark this route as dynamic to prevent build-time execution
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Optional: Add authentication/authorization check here
    // For example, check for a secret token in headers
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.NISAB_UPDATE_SECRET;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const currency = request.nextUrl.searchParams.get('currency') || 'USD';
    const result = await updateTodayNisabPrices(currency);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.data
          ? `Prices updated for ${result.data.date}`
          : 'Prices already up to date',
        data: result.data,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in daily Nisab update:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also support POST for cron jobs that prefer POST
export async function POST(request: NextRequest) {
  return GET(request);
}

