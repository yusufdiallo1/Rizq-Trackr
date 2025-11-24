'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { useLocation } from '@/lib/contexts/LocationContext';
import {
  getCurrentDualDate,
  formatDualDate,
  getCurrentTimeWithTimezone,
  getIslamicHoliday,
} from '@/lib/hijri-calendar';
import { motion } from 'framer-motion';

interface DashboardClockProps {
  showPrayerTimes?: boolean;
  className?: string;
}

export function DashboardClock({ showPrayerTimes = false, className = '' }: DashboardClockProps) {
  const { theme } = useTheme();
  const { location } = useLocation();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [dualDate, setDualDate] = useState(getCurrentDualDate());
  const [timeInfo, setTimeInfo] = useState(getCurrentTimeWithTimezone());
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null);

  // Update time every second based on user's location timezone
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now);
      setDualDate(getCurrentDualDate());
      
      // Use location timezone if available, otherwise use system timezone
      const timezone = location?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimeInfo(getCurrentTimeWithTimezone(timezone));
    };

    updateTime(); // Initial update
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [location?.timezone]);

  // Update at midnight for date changes
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const timeout = setTimeout(() => {
      setDualDate(getCurrentDualDate());
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, []);

  // Fetch prayer times if enabled
  useEffect(() => {
    if (showPrayerTimes && location?.latitude && location?.longitude) {
      fetchPrayerTimes(location.latitude, location.longitude);
    }
  }, [showPrayerTimes, location]);

  const fetchPrayerTimes = async (lat: number, lng: number) => {
    try {
      const today = new Date();
      const timestamp = Math.floor(today.getTime() / 1000);
      
      // Using Aladhan API (free, no API key required)
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=2`
      );

      if (!response.ok) throw new Error('Failed to fetch prayer times');

      const data = await response.json();
      const timings = data.data.timings;

      // Find next prayer time
      const prayers = [
        { name: 'Fajr', time: timings.Fajr },
        { name: 'Dhuhr', time: timings.Dhuhr },
        { name: 'Asr', time: timings.Asr },
        { name: 'Maghrib', time: timings.Maghrib },
        { name: 'Isha', time: timings.Isha },
      ];

      const now = new Date();
      const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      for (const prayer of prayers) {
        const [hours, minutes] = prayer.time.split(':').map(Number);
        const prayerTime = new Date();
        prayerTime.setHours(hours, minutes, 0, 0);

        if (prayerTime > now) {
          setNextPrayer({ name: prayer.name, time: prayer.time });
          break;
        }
      }

      // If no prayer found for today, set tomorrow's Fajr
      if (!nextPrayer) {
        setNextPrayer({ name: 'Fajr', time: timings.Fajr });
      }
    } catch (error) {
      console.error('Error fetching prayer times:', error);
    }
  };

  const holiday = getIslamicHoliday(dualDate.hijri);
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const mutedColor = theme === 'dark' ? 'text-white/60' : 'text-slate-500';
  const bgColor = theme === 'dark' ? 'bg-slate-800/50' : 'bg-white/50';
  const borderColor = theme === 'dark' ? 'border-white/20' : 'border-slate-200';

  // Format time based on user's location timezone
  const timezone = location?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timeString = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: timezone,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-2xl p-6 border backdrop-blur-lg ${bgColor} ${borderColor} ${className}`}
    >
      {/* Current Time */}
      <div className="text-center mb-4">
        <div className={`text-4xl font-bold ${textColor} mb-2`}>
          {timeString}
        </div>
        <div className={`text-sm ${mutedColor}`}>
          {timeInfo.timezone}
        </div>
      </div>

      {/* Dual Date Display */}
      <div className="space-y-2 mb-4">
        <div className={`text-center ${textColor}`}>
          <div className="text-lg font-semibold mb-1">
            {dualDate.gregorianString}
          </div>
          <div className={`text-base ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>
            {dualDate.hijriString}
          </div>
        </div>
      </div>

      {/* Location */}
      {location && (
        <div className={`text-center text-sm ${mutedColor} mb-4`}>
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>
              {location.city || location.country || 'Unknown location'}
            </span>
          </div>
        </div>
      )}

      {/* Islamic Holiday */}
      {holiday.isHoliday && (
        <div className={`text-center py-2 rounded-lg mb-4 ${theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
          <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-amber-300' : 'text-amber-700'}`}>
            {holiday.name}
          </div>
        </div>
      )}

      {/* Next Prayer Time */}
      {showPrayerTimes && nextPrayer && (
        <div className={`text-center py-2 rounded-lg ${theme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
          <div className={`text-xs ${mutedColor} mb-1`}>Next Prayer</div>
          <div className={`text-sm font-semibold ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-700'}`}>
            {nextPrayer.name}: {nextPrayer.time}
          </div>
        </div>
      )}
    </motion.div>
  );
}

