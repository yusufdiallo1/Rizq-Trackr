// User preferences storage for Precious Metals Converter
// Supports both localStorage (fast) and Supabase (sync across devices)

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SupportedCurrency } from './precious-metals';

export interface PreciousMetalsPreferences {
  currency: SupportedCurrency;
  notificationsEnabled: boolean;
  alertThreshold: number; // Percentage change threshold (default: 2.0)
  lastNotified?: Date;
}

const PREFERENCES_KEY = 'precious_metals_preferences';
const DEFAULT_PREFERENCES: PreciousMetalsPreferences = {
  currency: 'USD',
  notificationsEnabled: false,
  alertThreshold: 2.0,
};

/**
 * Load preferences from localStorage (fast path)
 */
export function loadPreferencesFromLocalStorage(): PreciousMetalsPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;

  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.lastNotified) {
        parsed.lastNotified = new Date(parsed.lastNotified);
      }
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch (error) {
    console.error('Error loading preferences from localStorage:', error);
  }

  return DEFAULT_PREFERENCES;
}

/**
 * Save preferences to localStorage
 */
export function savePreferencesToLocalStorage(
  preferences: PreciousMetalsPreferences
): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving preferences to localStorage:', error);
  }
}

/**
 * Load preferences from Supabase
 */
export async function loadPreferencesFromSupabase(
  userId: string
): Promise<PreciousMetalsPreferences | null> {
  try {
    const supabase = createClientComponentClient();
    const { data, error } = await supabase
      .from('user_preferences')
      .select('precious_metals_currency, precious_metals_notifications_enabled, precious_metals_alert_threshold, precious_metals_last_notified')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No preferences found, return null to use defaults
        return null;
      }
      console.error('Error loading preferences from Supabase:', error);
      return null;
    }

    if (!data) return null;

    return {
      currency: (data.precious_metals_currency as SupportedCurrency) || 'USD',
      notificationsEnabled: data.precious_metals_notifications_enabled || false,
      alertThreshold: data.precious_metals_alert_threshold || 2.0,
      lastNotified: data.precious_metals_last_notified
        ? new Date(data.precious_metals_last_notified)
        : undefined,
    };
  } catch (error) {
    console.error('Error loading preferences from Supabase:', error);
    return null;
  }
}

/**
 * Save preferences to Supabase
 */
export async function savePreferencesToSupabase(
  userId: string,
  preferences: PreciousMetalsPreferences
): Promise<boolean> {
  try {
    const supabase = createClientComponentClient();
    const { error } = await supabase
      .from('user_preferences')
      .upsert(
        {
          user_id: userId,
          precious_metals_currency: preferences.currency,
          precious_metals_notifications_enabled: preferences.notificationsEnabled,
          precious_metals_alert_threshold: preferences.alertThreshold,
          precious_metals_last_notified: preferences.lastNotified?.toISOString() || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      );

    if (error) {
      console.error('Error saving preferences to Supabase:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving preferences to Supabase:', error);
    return false;
  }
}

/**
 * Load preferences (localStorage first, then sync with Supabase in background)
 */
export async function loadPreferences(
  userId?: string
): Promise<PreciousMetalsPreferences> {
  // Fast path: load from localStorage immediately
  const localPrefs = loadPreferencesFromLocalStorage();

  // Sync with Supabase in background if user is logged in
  if (userId) {
    loadPreferencesFromSupabase(userId)
      .then((supabasePrefs) => {
        if (supabasePrefs) {
          // Supabase is source of truth, update localStorage
          savePreferencesToLocalStorage(supabasePrefs);
        } else {
          // No Supabase prefs, save local to Supabase
          savePreferencesToSupabase(userId, localPrefs).catch(console.error);
        }
      })
      .catch(console.error);
  }

  return localPrefs;
}

/**
 * Save preferences (both localStorage and Supabase)
 */
export async function savePreferences(
  preferences: PreciousMetalsPreferences,
  userId?: string
): Promise<boolean> {
  // Save to localStorage immediately (fast)
  savePreferencesToLocalStorage(preferences);

  // Save to Supabase in background if user is logged in
  if (userId) {
    const success = await savePreferencesToSupabase(userId, preferences);
    return success;
  }

  return true;
}

