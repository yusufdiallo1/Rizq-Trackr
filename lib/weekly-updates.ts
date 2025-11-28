/**
 * Weekly Update Notifications System
 * Generates and schedules weekly update notifications for users
 */

import { addNotification, InAppNotification } from './in-app-notifications';

export interface WeeklyUpdateContent {
  weekNumber: number;
  title: string;
  message: string;
  tip: string;
}

// Get weekly update content based on week number
export function getWeeklyUpdateContent(weekNumber: number): WeeklyUpdateContent {
  const tips = [
    "Remember: Small consistent savings add up over time. Every dollar counts!",
    "Review your expenses this week - you might find opportunities to save more.",
    "Consider setting up automatic transfers to your savings goals.",
    "Track your spending patterns - awareness is the first step to better financial health.",
    "Celebrate your progress, no matter how small. You're building good habits!",
    "Review your financial goals regularly and adjust as needed.",
    "Consider the Islamic principle of moderation in spending - balance is key.",
    "Remember to calculate and pay your Zakat if you're eligible.",
    "Track both your income and expenses to get a complete financial picture.",
    "Set aside time each week to review your finances - consistency is powerful.",
    "Consider investing in halal investments to grow your wealth.",
    "Remember: Financial planning is a journey, not a destination. Keep going!"
  ];

  const tip = tips[(weekNumber - 1) % tips.length];

  return {
    weekNumber,
    title: `Weekly Update - Week ${weekNumber}`,
    message: `Here's your weekly financial summary. ${tip}`,
    tip
  };
}

// Generate a weekly update notification
export function generateWeeklyUpdateNotification(
  userId: string,
  weekNumber: number,
  scheduledDate: Date,
  financialData?: {
    income?: number;
    expenses?: number;
    savings?: number;
  }
): InAppNotification {
  const content = getWeeklyUpdateContent(weekNumber);
  
  let message = content.message;
  if (financialData) {
    const parts: string[] = [];
    if (financialData.income !== undefined) {
      parts.push(`$${financialData.income.toFixed(2)} income`);
    }
    if (financialData.expenses !== undefined) {
      parts.push(`$${financialData.expenses.toFixed(2)} expenses`);
    }
    if (financialData.savings !== undefined) {
      parts.push(`$${financialData.savings.toFixed(2)} saved`);
    }
    if (parts.length > 0) {
      message = `This week: ${parts.join(', ')}. ${content.tip}`;
    }
  }

  return addNotification(userId, {
    type: 'system',
    title: content.title,
    message,
    severity: 'info',
    actionLabel: 'View Dashboard',
    actionUrl: '/dashboard',
    data: {
      weekNumber,
      scheduledDate: scheduledDate.toISOString(),
      financialData
    }
  });
}

// Schedule weekly updates for the next N weeks
export function scheduleWeeklyUpdates(
  userId: string,
  startDate: Date = new Date(),
  weeks: number = 12
): void {
  if (typeof window === 'undefined') return;

  // Check if already initialized
  const initKey = `weekly_updates_initialized_${userId}`;
  const alreadyInitialized = localStorage.getItem(initKey);
  if (alreadyInitialized === 'true') {
    return; // Already scheduled
  }

  // Calculate next Monday (or use today if it's Monday)
  const today = new Date(startDate);
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  let daysUntilMonday = 0;
  
  if (dayOfWeek === 0) {
    // If today is Sunday, next Monday is tomorrow (1 day)
    daysUntilMonday = 1;
  } else if (dayOfWeek === 1) {
    // If today is Monday, use today
    daysUntilMonday = 0;
  } else {
    // Otherwise, calculate days until next Monday
    daysUntilMonday = 8 - dayOfWeek;
  }
  
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  nextMonday.setHours(9, 0, 0, 0); // 9 AM

  // Generate notifications for the next 12 weeks
  for (let i = 0; i < weeks; i++) {
    const weekDate = new Date(nextMonday);
    weekDate.setDate(nextMonday.getDate() + (i * 7));
    const weekNumber = i + 1;

    // Store scheduled notification with timestamp
    const scheduledKey = `weekly_update_${userId}_${weekDate.getTime()}`;
    const notificationData = {
      weekNumber,
      scheduledDate: weekDate.toISOString(),
      userId
    };
    localStorage.setItem(scheduledKey, JSON.stringify(notificationData));
  }

  // Mark as initialized
  localStorage.setItem(initKey, 'true');
}

// Check and show scheduled weekly updates
export function checkScheduledWeeklyUpdates(userId: string): void {
  if (typeof window === 'undefined') return;

  const now = Date.now();
  const keys = Object.keys(localStorage);
  const weeklyUpdateKeys = keys.filter(key => 
    key.startsWith(`weekly_update_${userId}_`)
  );

  for (const key of weeklyUpdateKeys) {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      const scheduledTime = new Date(data.scheduledDate).getTime();

      // If the scheduled time has passed, show the notification
      if (scheduledTime <= now) {
        const weekNumber = data.weekNumber || 1;
        
        // Generate and show the notification
        generateWeeklyUpdateNotification(
          userId,
          weekNumber,
          new Date(scheduledTime)
        );

        // Remove the scheduled notification key
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error processing scheduled weekly update:', error);
      // Remove invalid key
      localStorage.removeItem(key);
    }
  }
}

