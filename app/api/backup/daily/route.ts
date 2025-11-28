/**
 * API Route: Daily Automatic Backup
 * This endpoint can be called by a cron job or Supabase Edge Function
 * to create automatic daily backups for all users
 */

import { NextRequest, NextResponse } from 'next/server';
import { createBackup } from '@/lib/backup';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Mark this route as dynamic to prevent build-time execution
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
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

  try {
    // Optional: Add authentication/authorization check
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.BACKUP_UPDATE_SECRET;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all unique user IDs from income_entries table
    // This ensures we only backup users who have actual data
    const { data: userData, error: usersError } = await supabase
      .from('income_entries')
      .select('user_id')
      .limit(1000);

    if (usersError) {
      return NextResponse.json(
        { success: false, error: usersError.message },
        { status: 500 }
      );
    }

    // Extract unique user IDs
    const uniqueUserIds = userData 
      ? Array.from(new Set(userData.map(entry => entry.user_id)))
      : [];

    if (uniqueUserIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users found to backup',
        successful: 0,
        failed: 0,
      });
    }

    const results = await Promise.allSettled(
      uniqueUserIds.map((userId) => createBackup(userId))
    );

    const successful = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} users: ${successful} successful, ${failed} failed`,
      successful,
      failed,
    });
  } catch (error) {
    // Log error (in production, this should go to error tracking service)
    if (process.env.NODE_ENV === 'development') {
    console.error('Error in daily backup:', error);
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also support POST
export async function POST(request: NextRequest) {
  return GET(request);
}

