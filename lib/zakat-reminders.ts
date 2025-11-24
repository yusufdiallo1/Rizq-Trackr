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
    // Check if we already sent a reminder today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingReminder } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', reminder.userId)
      .eq('type', 'zakat_reminder')
      .gte('created_at', today)
      .single();

    if (existingReminder) {
      return { success: false, error: 'Reminder already sent today' };
    }

    // Format the notification message
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(amount);
    };

    const title = reminder.daysUntil === 30
      ? 'Zakat Reminder: 30 Days Until Due'
      : reminder.daysUntil <= 7
        ? `Urgent: Zakat Due in ${reminder.daysUntil} Days!`
        : `Zakat Reminder: ${reminder.daysUntil} Days Until Due`;

    const message = reminder.eligibility.isObligatory
      ? `Your Zakat of ${formatCurrency(reminder.eligibility.zakatAmountDue)} is due soon. Your savings of ${formatCurrency(reminder.eligibility.annualSavings)} exceed the Nisab threshold of ${formatCurrency(reminder.eligibility.nisabThreshold)}.`
      : `Your Zakat date is approaching. Your current savings of ${formatCurrency(reminder.eligibility.annualSavings)} are below the Nisab threshold of ${formatCurrency(reminder.eligibility.nisabThreshold)}, so Zakat is not obligatory.`;

    // Store notification in database
    const { error: insertError } = await supabase
      .from('notifications')
      .insert({
        user_id: reminder.userId,
        type: 'zakat_reminder',
        title,
        message,
        category: 'zakat',
        is_read: false,
        metadata: {
          daysUntil: reminder.daysUntil,
          zakatAmountDue: reminder.eligibility.zakatAmountDue,
          isObligatory: reminder.eligibility.isObligatory,
          zakatDateHijri: reminder.zakatDateHijri,
        },
      });

    if (insertError) {
      console.error('Error inserting notification:', insertError);
      // Don't throw - the table might not exist yet
    }

    console.log('Zakat Reminder Sent:', {
      userId: reminder.userId,
      title,
      daysUntil: reminder.daysUntil,
      zakatAmountDue: reminder.eligibility.zakatAmountDue,
      isObligatory: reminder.eligibility.isObligatory,
    });

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

