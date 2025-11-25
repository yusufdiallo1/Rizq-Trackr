// Notification system for Precious Metals Converter
// Supports both browser notifications and in-app notifications

import { PreciousMetalsPreferences } from './precious-metals-preferences';
import { MetalPrice, MetalType, SupportedCurrency } from './precious-metals';

export interface PriceNotification {
  type: 'price_change' | 'nisab_threshold' | 'daily_update';
  metal: MetalType;
  currency: SupportedCurrency;
  message: string;
  timestamp: Date;
}

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Check if browser notifications are supported and enabled
 */
export function canSendBrowserNotifications(): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  return Notification.permission === 'granted';
}

/**
 * Send browser notification
 */
export function sendBrowserNotification(
  title: string,
  options: NotificationOptions = {}
): void {
  if (!canSendBrowserNotifications()) {
    return;
  }

  try {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });
  } catch (error) {
    console.error('Error sending browser notification:', error);
  }
}

/**
 * Check if price change exceeds threshold
 */
export function shouldNotifyPriceChange(
  priceChange: MetalPrice['priceChange'],
  threshold: number
): boolean {
  if (!priceChange) return false;
  return priceChange.percentage >= threshold;
}

/**
 * Send price change notification
 */
export function notifyPriceChange(
  metal: MetalType,
  currency: SupportedCurrency,
  priceChange: MetalPrice['priceChange'],
  preferences: PreciousMetalsPreferences
): void {
  if (!priceChange || !shouldNotifyPriceChange(priceChange, preferences.alertThreshold)) {
    return;
  }

  if (!preferences.notificationsEnabled) {
    return;
  }

  const direction = priceChange.direction === 'up' ? '↑' : '↓';
  const metalName = metal === 'gold' ? 'Gold' : 'Silver';
  const message = `${metalName} price ${priceChange.direction === 'up' ? 'increased' : 'decreased'} by ${priceChange.percentage.toFixed(2)}%`;

  // Browser notification
  if (canSendBrowserNotifications()) {
    sendBrowserNotification(`Precious Metals Alert: ${metalName}`, {
      body: message,
      tag: `price-change-${metal}-${currency}`,
    });
  }

  // In-app notification would be handled by the component
  // This is just a utility function
}

/**
 * Send Nisab threshold met notification
 */
export function notifyNisabThresholdMet(
  metal: MetalType,
  currency: SupportedCurrency,
  amount: number,
  nisabValue: number,
  preferences: PreciousMetalsPreferences
): void {
  if (!preferences.notificationsEnabled) {
    return;
  }

  const metalName = metal === 'gold' ? 'Gold' : 'Silver';
  const message = `Your ${metalName} holdings (${amount.toFixed(2)}) have reached the Nisab threshold (${nisabValue.toFixed(2)})`;

  // Browser notification
  if (canSendBrowserNotifications()) {
    sendBrowserNotification(`Nisab Threshold Reached: ${metalName}`, {
      body: message,
      tag: `nisab-${metal}-${currency}`,
    });
  }
}

/**
 * Send daily price update notification
 */
export function notifyDailyPriceUpdate(
  metal: MetalType,
  currency: SupportedCurrency,
  price: number,
  priceChange: MetalPrice['priceChange'],
  preferences: PreciousMetalsPreferences
): void {
  if (!preferences.notificationsEnabled) {
    return;
  }

  // Only send daily notification if not notified in last 24 hours
  const lastNotified = preferences.lastNotified;
  if (lastNotified) {
    const hoursSinceLastNotification =
      (Date.now() - lastNotified.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastNotification < 24) {
      return;
    }
  }

  const metalName = metal === 'gold' ? 'Gold' : 'Silver';
  const changeText = priceChange
    ? ` (${priceChange.direction === 'up' ? '+' : '-'}${priceChange.percentage.toFixed(2)}%)`
    : '';
  const message = `Daily ${metalName} price: ${price.toFixed(2)}${changeText}`;

  // Browser notification
  if (canSendBrowserNotifications()) {
    sendBrowserNotification(`Daily ${metalName} Price Update`, {
      body: message,
      tag: `daily-${metal}-${currency}`,
    });
  }
}

