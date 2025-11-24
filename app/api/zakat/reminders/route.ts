import { NextRequest, NextResponse } from 'next/server';
import { processZakatReminders } from '@/lib/zakat-reminders';

/**
 * API Route to process Zakat reminders
 * This should be called by a cron job daily
 * 
 * Usage:
 * - Manual trigger: GET /api/zakat/reminders
 * - Cron job: Set up to call this endpoint daily
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Add authentication/authorization check for cron jobs
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await processZakatReminders();

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error processing Zakat reminders:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process reminders',
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

