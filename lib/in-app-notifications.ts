/**
 * In-App Notification System
 * Manages notifications displayed within the app
 */

export interface InAppNotification {
  id: string;
  user_id: string;
  type: 'spending_limit' | 'budget' | 'zakat' | 'goal' | 'transaction' | 'system';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  actionUrl?: string;
  data?: Record<string, unknown>;
}

// Get all notifications for a user
export function getNotifications(userId: string): InAppNotification[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(`notifications_${userId}`);
  return stored ? JSON.parse(stored) : [];
}

// Add a new notification
export function addNotification(
  userId: string,
  notification: Omit<InAppNotification, 'id' | 'user_id' | 'timestamp' | 'read'>
): InAppNotification {
  const notifications = getNotifications(userId);

  const newNotification: InAppNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    user_id: userId,
    timestamp: new Date().toISOString(),
    read: false,
    ...notification,
  };

  // Add to beginning (newest first)
  notifications.unshift(newNotification);

  // Keep only last 100 notifications
  const trimmed = notifications.slice(0, 100);

  localStorage.setItem(`notifications_${userId}`, JSON.stringify(trimmed));

  // Dispatch event for real-time updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('new-notification', { detail: newNotification }));
  }

  return newNotification;
}

// Mark notification as read
export function markAsRead(userId: string, notificationId: string): boolean {
  const notifications = getNotifications(userId);
  const index = notifications.findIndex(n => n.id === notificationId);

  if (index < 0) return false;

  notifications[index].read = true;
  localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications));

  return true;
}

// Mark all as read
export function markAllAsRead(userId: string): void {
  const notifications = getNotifications(userId);
  notifications.forEach(n => (n.read = true));
  localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications));
}

// Delete notification
export function deleteNotification(userId: string, notificationId: string): boolean {
  const notifications = getNotifications(userId);
  const filtered = notifications.filter(n => n.id !== notificationId);

  if (filtered.length === notifications.length) return false;

  localStorage.setItem(`notifications_${userId}`, JSON.stringify(filtered));
  return true;
}

// Clear all notifications
export function clearAllNotifications(userId: string): void {
  localStorage.setItem(`notifications_${userId}`, JSON.stringify([]));
}

// Get unread count
export function getUnreadCount(userId: string): number {
  const notifications = getNotifications(userId);
  return notifications.filter(n => !n.read).length;
}

// Create spending limit notification
export function createSpendingLimitNotification(
  userId: string,
  options: {
    category: string | null;
    currentSpending: number;
    limitAmount: number;
    percentage: number;
    isExceeded: boolean;
    period: string;
  }
): InAppNotification {
  const categoryName = options.category || 'Total Spending';
  const periodName = options.period.charAt(0).toUpperCase() + options.period.slice(1);

  const title = options.isExceeded
    ? `${categoryName} Limit Exceeded!`
    : `${categoryName} Limit Warning`;

  const message = options.isExceeded
    ? `You've exceeded your ${periodName.toLowerCase()} ${categoryName.toLowerCase()} limit. Spent $${options.currentSpending.toFixed(2)} of $${options.limitAmount.toFixed(2)} (${options.percentage.toFixed(0)}%).`
    : `You've reached ${options.percentage.toFixed(0)}% of your ${periodName.toLowerCase()} ${categoryName.toLowerCase()} limit. $${options.currentSpending.toFixed(2)} of $${options.limitAmount.toFixed(2)} spent.`;

  return addNotification(userId, {
    type: 'spending_limit',
    title,
    message,
    severity: options.isExceeded ? 'error' : 'warning',
    actionLabel: 'View Expenses',
    actionUrl: '/expenses',
    data: {
      category: options.category,
      currentSpending: options.currentSpending,
      limitAmount: options.limitAmount,
      percentage: options.percentage,
      period: options.period,
    },
  });
}

// Check if we've already notified about this limit today
export function hasNotifiedToday(userId: string, limitId: string): boolean {
  const key = `limit_notified_${userId}_${limitId}`;
  const lastNotified = localStorage.getItem(key);

  if (!lastNotified) return false;

  const lastDate = new Date(lastNotified);
  const today = new Date();

  return (
    lastDate.getDate() === today.getDate() &&
    lastDate.getMonth() === today.getMonth() &&
    lastDate.getFullYear() === today.getFullYear()
  );
}

// Mark limit as notified today
export function markLimitNotified(userId: string, limitId: string): void {
  const key = `limit_notified_${userId}_${limitId}`;
  localStorage.setItem(key, new Date().toISOString());
}
