'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  UserLocation,
  getUserLocation,
  saveUserLocation,
  getUserLocationFromDB,
  requestLocationPermission,
  checkLocationPermission,
} from '@/lib/location';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface LocationContextType {
  location: UserLocation | null;
  isLoading: boolean;
  error: string | null;
  permissionGranted: boolean;
  refreshLocation: () => Promise<void>;
  requestPermission: () => Promise<boolean>;
  saveLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const supabase = createClientComponentClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
      }
    });
  }, []);

  // Check permission status
  useEffect(() => {
    checkLocationPermission().then((permission) => {
      setPermissionGranted(permission.granted);
    });
  }, []);

  // Load location on mount
  const loadLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First try to get saved location from DB
      if (userId) {
        const savedLocation = await getUserLocationFromDB(userId);
        if (savedLocation) {
          setLocation(savedLocation);
          setIsLoading(false);
          return;
        }
      }

      // If no saved location, try to detect current location
      const currentLocation = await getUserLocation();
      if (currentLocation) {
        setLocation(currentLocation);
        // Save to DB if user is logged in
        if (userId) {
          await saveUserLocation(userId, currentLocation);
        }
      } else {
        setError('Unable to detect location');
      }
    } catch (err) {
      console.error('Error loading location:', err);
      setError(err instanceof Error ? err.message : 'Failed to load location');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadLocation();
  }, [loadLocation]);

  const refreshLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const currentLocation = await getUserLocation(true); // Force refresh
      if (currentLocation) {
        setLocation(currentLocation);
        // Save to DB if user is logged in
        if (userId) {
          await saveUserLocation(userId, currentLocation);
        }
      } else {
        setError('Unable to detect location');
      }
    } catch (err) {
      console.error('Error refreshing location:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh location');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const granted = await requestLocationPermission();
    setPermissionGranted(granted);
    if (granted) {
      await refreshLocation();
    }
    return granted;
  }, [refreshLocation]);

  const saveLocation = useCallback(async () => {
    if (!location || !userId) return;

    try {
      await saveUserLocation(userId, location);
    } catch (err) {
      console.error('Error saving location:', err);
      setError(err instanceof Error ? err.message : 'Failed to save location');
    }
  }, [location, userId]);

  return (
    <LocationContext.Provider
      value={{
        location,
        isLoading,
        error,
        permissionGranted,
        refreshLocation,
        requestPermission,
        saveLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

