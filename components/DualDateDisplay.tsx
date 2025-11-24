'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { useLocation } from '@/lib/contexts/LocationContext';
import {
  getCurrentDualDate,
  formatDualDate,
  formatDualDateWithTime,
  getCurrentTimeWithTimezone,
  DualDate,
} from '@/lib/hijri-calendar';
import { DualCalendarPicker } from './DualCalendarPicker';

interface DualDateDisplayProps {
  date?: Date;
  showTime?: boolean;
  showTimezone?: boolean;
  clickable?: boolean;
  onDateChange?: (date: Date, hijriDate: { year: number; month: number; day: number }) => void;
  className?: string;
}

export function DualDateDisplay({
  date,
  showTime = false,
  showTimezone = false,
  clickable = false,
  onDateChange,
  className = '',
}: DualDateDisplayProps) {
  const { theme } = useTheme();
  const { location } = useLocation();
  const timezone = location?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [dualDate, setDualDate] = useState<DualDate>(getCurrentDualDate());
  const [time, setTime] = useState<{ time: string; timezone: string }>(getCurrentTimeWithTimezone(timezone));
  const [showPicker, setShowPicker] = useState(false);

  // Update date when prop changes
  useEffect(() => {
    if (date) {
      const hijri = require('hijri-date');
      const hijriDate = new hijri.default(date);
      setDualDate({
        gregorian: date,
        hijri: {
          year: hijriDate.getFullYear(),
          month: hijriDate.getMonth() + 1,
          day: hijriDate.getDate(),
        },
        hijriString: formatHijriDate({
          year: hijriDate.getFullYear(),
          month: hijriDate.getMonth() + 1,
          day: hijriDate.getDate(),
        }),
        gregorianString: formatGregorianDate(date),
      });
    } else {
      // Auto-update at midnight
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const msUntilMidnight = tomorrow.getTime() - now.getTime();

      const updateDate = () => {
        const currentTimezone = location?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
        setDualDate(getCurrentDualDate());
        setTime(getCurrentTimeWithTimezone(currentTimezone));
      };

      // Update immediately
      updateDate();

      // Set timeout for midnight update
      const timeout = setTimeout(updateDate, msUntilMidnight);

      // Update time every minute if showing time
      let timeInterval: NodeJS.Timeout | null = null;
      if (showTime) {
        timeInterval = setInterval(() => {
          const currentTimezone = location?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
          setTime(getCurrentTimeWithTimezone(currentTimezone));
        }, 60000);
      }

      return () => {
        clearTimeout(timeout);
        if (timeInterval) clearInterval(timeInterval);
      };
    }
  }, [date, showTime]);

  // Update time every minute if showing time
  useEffect(() => {
    if (showTime && !date) {
      const currentTimezone = location?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      const interval = setInterval(() => {
        setTime(getCurrentTimeWithTimezone(currentTimezone));
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [showTime, date, location?.timezone]);

  const handleDateChange = (newDate: Date, hijriDate: { year: number; month: number; day: number }) => {
    const hijri = require('hijri-date');
    const hijriDateObj = new hijri.default(newDate);
    setDualDate({
      gregorian: newDate,
      hijri: hijriDate,
      hijriString: formatHijriDate(hijriDate),
      gregorianString: formatGregorianDate(newDate),
    });
    onDateChange?.(newDate, hijriDate);
    setShowPicker(false);
  };

  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const mutedColor = theme === 'dark' ? 'text-white/60' : 'text-slate-500';

  const displayText = showTime && showTimezone
    ? formatDualDateWithTime(dualDate, time.time, time.timezone)
    : showTime
      ? `${formatDualDate(dualDate)} at ${time.time}`
      : formatDualDate(dualDate);

  const Component = clickable ? 'button' : 'div';

  return (
    <>
      <Component
        onClick={clickable ? () => setShowPicker(true) : undefined}
        className={`${clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
      >
        <div className="flex flex-col items-start">
          <span className={`text-sm ${mutedColor}`}>
            {dualDate.hijriString}
          </span>
          <span className={`text-base font-medium ${textColor}`}>
            {dualDate.gregorianString}
          </span>
          {showTime && (
            <span className={`text-xs ${mutedColor} mt-1`}>
              {time.time} {showTimezone && `(${time.timezone})`}
            </span>
          )}
        </div>
      </Component>

      {showPicker && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <DualCalendarPicker
            value={dualDate.gregorian}
            onChange={handleDateChange}
            onClose={() => setShowPicker(false)}
            label="Select Date"
            showTime={showTime}
          />
        </div>
      )}
    </>
  );
}

// Helper functions (imported from hijri-calendar)
function formatHijriDate(hijri: { year: number; month: number; day: number }): string {
  const monthNames = [
    'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
    'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
    'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
  ];
  return `${hijri.day} ${monthNames[hijri.month - 1]} ${hijri.year}`;
}

function formatGregorianDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

