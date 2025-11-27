/**
 * Backup Service
 * Creates backups of user financial data
 * Supports both automatic daily backups and user-initiated backups
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';
import { ExpenseEntry } from './expenses';
import { IncomeEntry } from './income';
import { ZakatPaymentRecord } from './zakat';

function getSupabaseClient() {
  return createClientComponentClient<Database>();
}

export interface BackupData {
  userId: string;
  timestamp: string;
  income: IncomeEntry[];
  expenses: ExpenseEntry[];
  zakatPayments: ZakatPaymentRecord[];
  savingsGoals: any[];
  settings: any;
}

export interface BackupMetadata {
  id: string;
  userId: string;
  createdAt: string;
  size: number;
  recordCount: number;
}

/**
 * Create a backup of all user data
 */
export async function createBackup(userId: string): Promise<{
  success: boolean;
  error: string | null;
  backupId: string | null;
}> {
  try {
    const supabase = getSupabaseClient();
    // Fetch all user data
    const [incomeResult, expenseResult, zakatResult, savingsResult] = await Promise.all([
      supabase
        .from('income_entries')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null),
      supabase
        .from('expense_entries')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null),
      supabase
        .from('zakat_payments')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null),
      supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId),
    ]);

    if (incomeResult.error || expenseResult.error || zakatResult.error || savingsResult.error) {
      return {
        success: false,
        error: 'Failed to fetch data for backup',
        backupId: null,
      };
    }

    // Get user settings (if stored in a settings table)
    const settingsResult = await supabase
      .from('users')
      .select('currency, timezone, location_city, location_country')
      .eq('id', userId)
      .single();

    const backupData: BackupData = {
      userId,
      timestamp: new Date().toISOString(),
      income: (incomeResult.data || []) as IncomeEntry[],
      expenses: (expenseResult.data || []) as ExpenseEntry[],
      zakatPayments: (zakatResult.data || []) as ZakatPaymentRecord[],
      savingsGoals: savingsResult.data || [],
      settings: settingsResult.data || {},
    };

    // Convert to JSON string
    const backupJson = JSON.stringify(backupData, null, 2);
    const backupBlob = new Blob([backupJson], { type: 'application/json' });
    const backupSize = backupBlob.size;

    // Generate backup ID
    const backupId = `backup_${userId}_${Date.now()}`;

    // Upload to Supabase Storage
    const fileName = `${userId}/backups/${backupId}.json`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('backups')
      .upload(fileName, backupBlob, {
        contentType: 'application/json',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading backup:', uploadError);
      return {
        success: false,
        error: uploadError.message,
        backupId: null,
      };
    }

    // Store backup metadata in database (optional - you might want a backups table)
    // For now, we'll just return success

    return {
      success: true,
      error: null,
      backupId,
    };
  } catch (error) {
    console.error('Unexpected error creating backup:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      backupId: null,
    };
  }
}

/**
 * Restore data from a backup
 */
export async function restoreBackup(
  userId: string,
  backupId: string
): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const supabase = getSupabaseClient();
    // Download backup from storage
    const fileName = `${userId}/backups/${backupId}.json`;
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('backups')
      .download(fileName);

    if (downloadError) {
      return {
        success: false,
        error: downloadError.message,
      };
    }

    // Parse backup data
    const backupText = await downloadData.text();
    const backupData: BackupData = JSON.parse(backupText);

    // Verify backup belongs to user
    if (backupData.userId !== userId) {
      return {
        success: false,
        error: 'Backup does not belong to this user',
      };
    }

    // Restore data (this is a destructive operation - consider adding confirmation)
    // For safety, we'll create new entries rather than overwriting
    // You might want to implement a more sophisticated restore strategy

    // Restore income entries
    if (backupData.income.length > 0) {
      const { error: incomeError } = await supabase
        .from('income_entries')
        .upsert(
          backupData.income.map((entry) => ({
            ...entry,
            user_id: userId,
            id: undefined, // Let database generate new IDs
            created_at: undefined,
          })),
          { onConflict: 'id' }
        );

      if (incomeError) {
        console.error('Error restoring income:', incomeError);
      }
    }

    // Restore expense entries
    if (backupData.expenses.length > 0) {
      const { error: expenseError } = await supabase
        .from('expense_entries')
        .upsert(
          backupData.expenses.map((entry) => ({
            ...entry,
            user_id: userId,
            id: undefined,
            created_at: undefined,
          })),
          { onConflict: 'id' }
        );

      if (expenseError) {
        console.error('Error restoring expenses:', expenseError);
      }
    }

    // Restore zakat payments
    if (backupData.zakatPayments.length > 0) {
      const { error: zakatError } = await supabase
        .from('zakat_payments')
        .upsert(
          backupData.zakatPayments.map((entry) => ({
            ...entry,
            user_id: userId,
            id: undefined,
            created_at: undefined,
          })),
          { onConflict: 'id' }
        );

      if (zakatError) {
        console.error('Error restoring zakat payments:', zakatError);
      }
    }

    // Restore savings goals
    if (backupData.savingsGoals.length > 0) {
      const { error: savingsError } = await supabase
        .from('savings_goals')
        .upsert(
          backupData.savingsGoals.map((entry) => ({
            ...entry,
            user_id: userId,
            id: undefined,
            created_at: undefined,
          })),
          { onConflict: 'id' }
        );

      if (savingsError) {
        console.error('Error restoring savings goals:', savingsError);
      }
    }

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Unexpected error restoring backup:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * List all backups for a user
 */
export async function listBackups(userId: string): Promise<{
  data: BackupMetadata[];
  error: string | null;
}> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.storage
      .from('backups')
      .list(`${userId}/backups/`, {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      return { data: [], error: error.message };
    }

    const backups: BackupMetadata[] = (data || [])
      .filter((file) => file.name.endsWith('.json'))
      .map((file) => ({
        id: file.name.replace('.json', ''),
        userId,
        createdAt: file.created_at || file.updated_at || '',
        size: file.metadata?.size || 0,
        recordCount: 0, // Would need to read file to get count
      }));

    return { data: backups, error: null };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Delete a backup
 */
export async function deleteBackup(
  userId: string,
  backupId: string
): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const supabase = getSupabaseClient();
    const fileName = `${userId}/backups/${backupId}.json`;
    const { error } = await supabase.storage.from('backups').remove([fileName]);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Trigger manual backup (user-initiated)
 */
export async function triggerManualBackup(userId: string): Promise<{
  success: boolean;
  error: string | null;
  backupId: string | null;
}> {
  return createBackup(userId);
}

