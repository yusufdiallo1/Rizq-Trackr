/**
 * Zakat Reminder System
 * Sends reminders 30 days before Zakat date
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';
import { getUserZakatDate, calculateZakatEligibility } from './zakat';
import { hijriToGregorian, gregorianToHijri } from './hijri-calendar';

const supabase = createClientComponentClient<Database>();

export interface ZakatReminder {
  userId: string;
  zakatDateHijri: { year: number; month: number; day: number };
  zakatDateGregorian: Date;
  daysUntil: number;
  shouldSendReminder: boolean;
  eligibility: {
    isObligatory: boolean;
    zakatAmountDue: number;
    annualSavings: number;
    nisabThreshold: number;
  };
}

/**
 * Check if reminder should be sent (30 days before Zakat date)
 */
export async function checkZakatReminders(): Promise<ZakatReminder[]> {
  try {
    // Get all users with Zakat dates set
    const { data: users, error } = await supabase
      .from('users')
      .select('id, zakat_date_hijri, currency')
      .not('zakat_date_hijri', 'is', null);

    if (error) throw error;
    if (!users || users.length === 0) return [];

    const reminders: ZakatReminder[] = [];
    const now = new Date();

    for (const user of users) {
      if (!user.zakat_date_hijri) continue;

      // Parse Zakat date
      const [year, month, day] = user.zakat_date_hijri.split('-').map(Number);
      const zakatDateHijri = { year, month, day };
      const zakatDateGregorian = hijriToGregorian(year, month, day);

      // Calculate next Zakat date
      const currentHijri = gregorianToHijri(now);
      let nextZakatDate: Date;

      if (currentHijri.year < year ||
          (currentHijri.year === year &&
           (currentHijri.month < month ||
            (currentHijri.month === month && currentHijri.day < day)))) {
        // Zakat date hasn't passed this year
        nextZakatDate = zakatDateGregorian;
      } else {
        // Zakat date has passed, next one is next year
        const nextHijri = { year: year + 1, month, day };
        nextZakatDate = hijriToGregorian(nextHijri.year, nextHijri.month, nextHijri.day);
      }

      // Calculate days until Zakat date
      const diffTime = nextZakatDate.getTime() - now.getTime();
      const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Check if reminder should be sent (30 days before)
      const shouldSendReminder = daysUntil <= 30 && daysUntil > 0;

      if (shouldSendReminder) {
        // Get eligibility info
        const eligibility = await calculateZakatEligibility(user.id, user.currency || 'USD');

        reminders.push({
          userId: user.id,
          zakatDateHijri,
          zakatDateGregorian: nextZakatDate,
          daysUntil,
          shouldSendReminder: true,
          eligibility: {
            isObligatory: eligibility.isObligatory,
            zakatAmountDue: eligibility.zakatAmountDue,
            annualSavings: eligibility.annualSavings,
            nisabThreshold: eligibility.nisabThreshold,
          },
        });
      }
    }

    return reminders;
  } catch (error) {
    console.error('Error checking Zakat reminders:', error);
    return [];
  }
}

/**
 * Send reminder notification to user
 * This integrates with your existing notification system
 */
export async function sendZakatReminder(reminder: ZakatReminder): Promise<{ success: boolean; error?: string }> {
  try {
    // Get user's notification preferences
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, zakat_reminders_enabled')
      .eq('id', reminder.userId)
      .single();

    if (userError) throw userError;

    // Check if user has reminders enabled (you'll need to add this column to users table)
    // For now, assume enabled if not set
    const remindersEnabled = user?.zakat_reminders_enabled !== false;

    if (!remindersEnabled) {
      return { success: false, error: 'User has reminders disabled' };
    }

    // Create notification record (you'll need a notifications table)
    // For now, we'll just log it
    console.log('Zakat Reminder:', {
      userId: reminder.userId,
      daysUntil: reminder.daysUntil,
      zakatAmountDue: reminder.eligibility.zakatAmountDue,
      isObligatory: reminder.eligibility.isObligatory,
    });

    // TODO: Integrate with your notification system
    // - Send email notification
    // - Send push notification (if mobile app)
    // - Store notification in database

    return { success: true };
  } catch (error: any) {
    console.error('Error sending Zakat reminder:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Process all pending reminders
 * Call this from a scheduled task or API route
 */
export async function processZakatReminders(): Promise<{ sent: number; errors: number }> {
  const reminders = await checkZakatReminders();
  let sent = 0;
  let errors = 0;

  for (const reminder of reminders) {
    const result = await sendZakatReminder(reminder);
    if (result.success) {
      sent++;
    } else {
      errors++;
    }
  }

  return { sent, errors };
}

