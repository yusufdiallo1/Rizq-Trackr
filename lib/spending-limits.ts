/**
 * Spending Limits Management
 * Allows users to set spending limits and receive notifications when exceeded
 */

import { createSupabaseClient } from './supabase';

export interface SpendingLimit {
  id: string;
  user_id: string;
  category: string | null; // null means "all categories" / total spending
  limit_amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  notify_at_percentage: number; // e.g., 80 means notify at 80% of limit
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SpendingLimitInput {
  category: string | null;
  limit_amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  notify_at_percentage: number;
  is_active?: boolean;
}

// Get user's spending limits from localStorage (since we don't have a DB table for this)
export function getSpendingLimits(userId: string): SpendingLimit[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(`spending_limits_${userId}`);
  return stored ? JSON.parse(stored) : [];
}

// Save spending limit
export function saveSpendingLimit(userId: string, input: SpendingLimitInput): SpendingLimit {
  const limits = getSpendingLimits(userId);

  // Check if limit for this category/period already exists
  const existingIndex = limits.findIndex(
    l => l.category === input.category && l.period === input.period
  );

  const now = new Date().toISOString();

  if (existingIndex >= 0) {
    // Update existing limit
    limits[existingIndex] = {
      ...limits[existingIndex],
      limit_amount: input.limit_amount,
      notify_at_percentage: input.notify_at_percentage,
      is_active: input.is_active ?? true,
      updated_at: now,
    };
  } else {
    // Create new limit
    const newLimit: SpendingLimit = {
      id: `limit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      category: input.category,
      limit_amount: input.limit_amount,
      period: input.period,
      notify_at_percentage: input.notify_at_percentage,
      is_active: input.is_active ?? true,
      created_at: now,
      updated_at: now,
    };
    limits.push(newLimit);
  }

  localStorage.setItem(`spending_limits_${userId}`, JSON.stringify(limits));
  return limits[existingIndex >= 0 ? existingIndex : limits.length - 1];
}

// Delete spending limit
export function deleteSpendingLimit(userId: string, limitId: string): boolean {
  const limits = getSpendingLimits(userId);
  const filtered = limits.filter(l => l.id !== limitId);
  localStorage.setItem(`spending_limits_${userId}`, JSON.stringify(filtered));
  return filtered.length < limits.length;
}

// Toggle spending limit active status
export function toggleSpendingLimit(userId: string, limitId: string): SpendingLimit | null {
  const limits = getSpendingLimits(userId);
  const index = limits.findIndex(l => l.id === limitId);

  if (index < 0) return null;

  limits[index].is_active = !limits[index].is_active;
  limits[index].updated_at = new Date().toISOString();

  localStorage.setItem(`spending_limits_${userId}`, JSON.stringify(limits));
  return limits[index];
}

// Get date range for period
function getDateRangeForPeriod(period: 'daily' | 'weekly' | 'monthly' | 'yearly'): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date();
  const end = new Date();

  switch (period) {
    case 'daily':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'weekly':
      const dayOfWeek = now.getDay();
      start.setDate(now.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case 'monthly':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'yearly':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
}

// Check spending against limits and return alerts
export interface SpendingAlert {
  limit: SpendingLimit;
  currentSpending: number;
  percentage: number;
  isExceeded: boolean;
  isApproaching: boolean;
  message: string;
}

export async function checkSpendingLimits(userId: string): Promise<SpendingAlert[]> {
  const limits = getSpendingLimits(userId).filter(l => l.is_active);
  const alerts: SpendingAlert[] = [];

  for (const limit of limits) {
    const { start, end } = getDateRangeForPeriod(limit.period);

    // Query expenses for this period
    const supabase = createSupabaseClient();
    let query = supabase
      .from('expense_entries')
      .select('amount')
      .eq('user_id', userId)
      .gte('date', start.toISOString().split('T')[0])
      .lte('date', end.toISOString().split('T')[0]);

    // Filter by category if specified
    if (limit.category) {
      query = query.eq('category', limit.category);
    }

    const { data: expenses, error } = await query;

    if (error) {
      console.error('Error checking spending limits:', error);
      continue;
    }

    const currentSpending = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
    const percentage = (currentSpending / limit.limit_amount) * 100;
    const isExceeded = percentage >= 100;
    const isApproaching = percentage >= limit.notify_at_percentage && !isExceeded;

    if (isExceeded || isApproaching) {
      const categoryName = limit.category || 'Total';
      const periodName = limit.period.charAt(0).toUpperCase() + limit.period.slice(1);

      let message: string;
      if (isExceeded) {
        message = `You've exceeded your ${periodName.toLowerCase()} ${categoryName} spending limit! Spent $${currentSpending.toFixed(2)} of $${limit.limit_amount.toFixed(2)} (${percentage.toFixed(0)}%)`;
      } else {
        message = `You've reached ${percentage.toFixed(0)}% of your ${periodName.toLowerCase()} ${categoryName} spending limit ($${currentSpending.toFixed(2)} of $${limit.limit_amount.toFixed(2)})`;
      }

      alerts.push({
        limit,
        currentSpending,
        percentage,
        isExceeded,
        isApproaching,
        message,
      });
    }
  }

  return alerts;
}

// Get spending progress for all limits (for display)
export async function getSpendingProgress(userId: string): Promise<Array<{
  limit: SpendingLimit;
  currentSpending: number;
  percentage: number;
  remaining: number;
}>> {
  const limits = getSpendingLimits(userId).filter(l => l.is_active);
  const progress: Array<{
    limit: SpendingLimit;
    currentSpending: number;
    percentage: number;
    remaining: number;
  }> = [];

  for (const limit of limits) {
    const { start, end } = getDateRangeForPeriod(limit.period);

    const supabase = createSupabaseClient();
    let query = supabase
      .from('expense_entries')
      .select('amount')
      .eq('user_id', userId)
      .gte('date', start.toISOString().split('T')[0])
      .lte('date', end.toISOString().split('T')[0]);

    if (limit.category) {
      query = query.eq('category', limit.category);
    }

    const { data: expenses } = await query;

    const currentSpending = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
    const percentage = Math.min((currentSpending / limit.limit_amount) * 100, 100);
    const remaining = Math.max(limit.limit_amount - currentSpending, 0);

    progress.push({
      limit,
      currentSpending,
      percentage,
      remaining,
    });
  }

  return progress;
}
