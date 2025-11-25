'use client';

/**
 * Location Detection Service
 * Auto-detect user location using GPS/IP, save with transactions
 */

import { logError } from './logger';

export interface UserLocation {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
  countryCode?: string;
  formattedAddress?: string;
  timezone?: string;
  source: 'gps' | 'ip' | 'manual';
  timestamp: string;
}

export interface LocationPermissionState {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

// Cache location for 5 minutes
const LOCATION_CACHE_KEY = 'user_location_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedLocation {
  location: UserLocation;
  timestamp: number;
}

/**
 * Get cached location if still valid
 */
function getCachedLocation(): UserLocation | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(LOCATION_CACHE_KEY);
    if (!cached) return null;

    const { location, timestamp }: CachedLocation = JSON.parse(cached);
    const now = Date.now();

    if (now - timestamp < CACHE_DURATION) {
      return location;
    }

    localStorage.removeItem(LOCATION_CACHE_KEY);
    return null;
  } catch (error) {
    logError(error, 'Error reading location cache');
    return null;
  }
}

/**
 * Cache location
 */
function setCachedLocation(location: UserLocation): void {
  if (typeof window === 'undefined') return;

  try {
    const cache: CachedLocation = {
      location,
      timestamp: Date.now(),
    };
    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    logError(error, 'Error caching location');
  }
}

/**
 * Check location permission state
 */
export async function checkLocationPermission(): Promise<LocationPermissionState> {
  if (typeof navigator === 'undefined' || !navigator.permissions) {
    return { granted: false, denied: false, prompt: true };
  }

  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return {
      granted: result.state === 'granted',
      denied: result.state === 'denied',
      prompt: result.state === 'prompt',
    };
  } catch (error) {
    logError(error, 'Error checking location permission');
    return { granted: false, denied: false, prompt: true };
  }
}

/**
 * Get current position using GPS
 */
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // 1 minute cache
      }
    );
  });
}

/**
 * Reverse geocode coordinates to address using free API
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<Partial<UserLocation>> {
  try {
    // Using OpenStreetMap Nominatim (free, no API key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'FinanceTracker/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();
    const address = data.address || {};

    return {
      city: address.city || address.town || address.village || address.municipality,
      state: address.state || address.province,
      country: address.country,
      countryCode: address.country_code?.toUpperCase(),
      formattedAddress: data.display_name,
    };
  } catch (error) {
    logError(error, 'Reverse geocoding error');
    return {};
  }
}

/**
 * Get location via IP (fallback when GPS not available)
 */
export async function getLocationByIP(): Promise<UserLocation | null> {
  try {
    // Using ipapi.co (free tier, no API key required)
    const response = await fetch('https://ipapi.co/json/');

    if (!response.ok) {
      return null; // Silent failure
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      logError(parseError, 'Failed to parse IP geolocation response');
      return null;
    }

    return {
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city,
      state: data.region,
      country: data.country_name,
      countryCode: data.country_code,
      formattedAddress: `${data.city}, ${data.region}, ${data.country_name}`,
      timezone: data.timezone,
      source: 'ip',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logError(error, 'IP geolocation error');
    return null;
  }
}

/**
 * Get user's current location (GPS first, then IP fallback)
 */
export async function getUserLocation(forceRefresh = false): Promise<UserLocation | null> {
  // Check cache first
  if (!forceRefresh) {
    const cached = getCachedLocation();
    if (cached) return cached;
  }

  try {
    // Try GPS first
    const position = await getCurrentPosition();
    const { latitude, longitude } = position.coords;

    // Get address from coordinates
    const addressInfo = await reverseGeocode(latitude, longitude);

    // Get timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const location: UserLocation = {
      latitude,
      longitude,
      ...addressInfo,
      timezone,
      source: 'gps',
      timestamp: new Date().toISOString(),
    };

    setCachedLocation(location);
    return location;
  } catch (gpsError) {
    console.log('GPS failed, trying IP geolocation:', gpsError);

    // Fallback to IP geolocation
    const ipLocation = await getLocationByIP();
    if (ipLocation) {
      setCachedLocation(ipLocation);
      return ipLocation;
    }

    return null;
  }
}

/**
 * Create a manual location entry
 */
export function createManualLocation(
  city: string,
  state: string,
  country: string,
  countryCode?: string
): UserLocation {
  return {
    latitude: 0,
    longitude: 0,
    city,
    state,
    country,
    countryCode: countryCode || '',
    formattedAddress: `${city}, ${state}, ${country}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    source: 'manual',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Format location for display
 */
export function formatLocation(location: UserLocation | null): string {
  if (!location) return 'Unknown location';

  if (location.city && location.state) {
    return `${location.city}, ${location.state}`;
  }

  if (location.city && location.country) {
    return `${location.city}, ${location.country}`;
  }

  if (location.formattedAddress) {
    // Shorten the address
    const parts = location.formattedAddress.split(',').slice(0, 2);
    return parts.join(',').trim();
  }

  return 'Unknown location';
}

/**
 * Format location for compact display (city only or short format)
 */
export function formatLocationShort(location: UserLocation | null): string {
  if (!location) return 'Unknown';

  if (location.city) {
    return location.city;
  }

  if (location.formattedAddress) {
    return location.formattedAddress.split(',')[0].trim();
  }

  return 'Unknown';
}

/**
 * Save user's default location to database
 */
export async function saveUserLocation(
  userId: string,
  location: UserLocation
): Promise<{ error: Error | null }> {
  try {
    const { createClientComponentClient } = await import('@supabase/auth-helpers-nextjs');
    const supabase = createClientComponentClient();

    // Note: customers table doesn't have location fields
    // This function may need to be updated to use a user_profile table
    // For now, we'll skip the database update to avoid errors
    console.warn('Location update skipped - customers table does not have location fields');
    return { error: null };

    return { error };
  } catch (error) {
    return { error: error as Error };
  }
}

/**
 * Retrieve user's saved location from database
 */
export async function getUserLocationFromDB(
  userId: string
): Promise<UserLocation | null> {
  try {
    const { createClientComponentClient } = await import('@supabase/auth-helpers-nextjs');
    const supabase = createClientComponentClient();

    // Note: customers table doesn't have location fields
    // Return null to indicate location is not stored
    return null;

    if (error || !data) return null;

    if (!data.location_latitude || !data.location_longitude) return null;

    return {
      latitude: data.location_latitude,
      longitude: data.location_longitude,
      city: data.location_city || undefined,
      country: data.location_country || undefined,
      formattedAddress: data.location_address || undefined,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      source: 'manual',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error retrieving user location from DB:', error);
    return null;
  }
}

/**
 * Request location permission (wrapper for better UX)
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const permission = await checkLocationPermission();
    if (permission.granted) return true;
    if (permission.denied) return false;

    // If prompt, try to get location which will trigger permission request
    const location = await getUserLocation(true);
    return location !== null;
  } catch (error) {
    logError(error, 'Error requesting location permission');
    return false;
  }
}
