/**
 * API Route: Daily Automatic Backup
 * This endpoint can be called by a cron job or Supabase Edge Function
 * to create automatic daily backups for all users
 */

import { NextRequest, NextResponse } from 'next/server';
import { createBackup } from '@/lib/backup';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';

// Mark this route as dynamic to prevent build-time execution
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  // Create Supabase client inside the function to avoid build-time execution
  const supabase = createClientComponentClient<Database>();

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

    // Get all users from auth.users via customers table
    // Note: This is a simplified approach - you may want to query auth.users directly
    const { data: customers, error: usersError } = await supabase
      .from('customers')
      .select('user_id')
      .limit(100); // Process in batches
    
    const users = customers?.map(c => ({ id: c.user_id })) || [];

    if (usersError) {
      return NextResponse.json(
        { success: false, error: usersError.message },
        { status: 500 }
      );
    }

    const results = await Promise.allSettled(
      (users || []).map((user) => createBackup(user.id))
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
    console.error('Error in daily backup:', error);
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

