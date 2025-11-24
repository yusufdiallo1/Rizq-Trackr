'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  UserLocation,
  LocationPermissionState,
  getUserLocation,
  checkLocationPermission,
  formatLocation,
  formatLocationShort,
} from '@/lib/location';

interface UseLocationReturn {
  location: UserLocation | null;
  loading: boolean;
  error: string | null;
  permission: LocationPermissionState;
  refresh: () => Promise<void>;
  requestPermission: () => Promise<void>;
  formattedLocation: string;
  formattedLocationShort: string;
}

export function useLocation(autoFetch = true): UseLocationReturn {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<LocationPermissionState>({
    granted: false,
    denied: false,
    prompt: true,
  });

  const fetchLocation = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const loc = await getUserLocation(forceRefresh);
      if (loc) {
        setLocation(loc);
      } else {
        setError('Could not determine location');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get location');
    } finally {
      setLoading(false);
    }
  }, []);

  const checkPermissionState = useCallback(async () => {
    const state = await checkLocationPermission();
    setPermission(state);
    return state;
  }, []);

  const requestPermission = useCallback(async () => {
    // Requesting location will trigger the permission prompt
    await fetchLocation(true);
    await checkPermissionState();
  }, [fetchLocation, checkPermissionState]);

  const refresh = useCallback(async () => {
    await fetchLocation(true);
  }, [fetchLocation]);

  useEffect(() => {
    checkPermissionState();

    if (autoFetch) {
      fetchLocation();
    }
  }, [autoFetch, fetchLocation, checkPermissionState]);

  return {
    location,
    loading,
    error,
    permission,
    refresh,
    requestPermission,
    formattedLocation: formatLocation(location),
    formattedLocationShort: formatLocationShort(location),
  };
}
