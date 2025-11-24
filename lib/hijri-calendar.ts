/**
 * Hijri Calendar Utilities
 * Conversion between Hijri and Gregorian calendars
 */

import HijriDate from 'hijri-date';

export interface DualDate {
  gregorian: Date;
  hijri: {
    year: number;
    month: number;
    day: number;
  };
  hijriString: string;
  gregorianString: string;
}

/**
 * Convert Gregorian date to Hijri
 */
export function gregorianToHijri(date: Date): { year: number; month: number; day: number } {
  const hijri = new HijriDate(date);
  return {
    year: hijri.getFullYear(),
    month: hijri.getMonth() + 1, // HijriDate uses 0-based months
    day: hijri.getDate(),
  };
}

/**
 * Convert Hijri date to Gregorian
 */
export function hijriToGregorian(year: number, month: number, day: number): Date {
  const hijri = new HijriDate(year, month - 1, day); // HijriDate uses 0-based months
  return hijri.toGregorian();
}

/**
 * Get current date in both calendars
 */
export function getCurrentDualDate(): DualDate {
  const now = new Date();
  const hijri = gregorianToHijri(now);

  return {
    gregorian: now,
    hijri,
    hijriString: formatHijriDate(hijri),
    gregorianString: formatGregorianDate(now),
  };
}

/**
 * Format Hijri date as string
 */
export function formatHijriDate(hijri: { year: number; month: number; day: number }): string {
  const monthNames = [
    'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
    'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
    'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
  ];

  return `${hijri.day} ${monthNames[hijri.month - 1]} ${hijri.year}`;
}

/**
 * Format Gregorian date as string
 */
export function formatGregorianDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format dual date display: "15 Ramadan 1446 / March 15, 2025"
 */
export function formatDualDate(dualDate: DualDate): string {
  return `${dualDate.hijriString} / ${dualDate.gregorianString}`;
}

/**
 * Get Hijri month name
 */
export function getHijriMonthName(month: number): string {
  const monthNames = [
    'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
    'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
    'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
  ];
  return monthNames[month - 1] || '';
}

/**
 * Get number of days in Hijri month
 */
export function getDaysInHijriMonth(year: number, month: number): number {
  const hijri = new HijriDate(year, month - 1, 1);
  // Get last day of month by going to next month and subtracting 1 day
  const nextMonth = new HijriDate(year, month, 1);
  const lastDay = new Date(nextMonth.toGregorian());
  lastDay.setDate(lastDay.getDate() - 1);
  const lastHijri = gregorianToHijri(lastDay);
  return lastHijri.day;
}

/**
 * Check if date is an Islamic holiday
 */
export function isIslamicHoliday(hijri: { year: number; month: number; day: number }): { isHoliday: boolean; name?: string } {
  // Ramadan starts
  if (hijri.month === 9 && hijri.day === 1) {
    return { isHoliday: true, name: 'First day of Ramadan' };
  }
  // Eid al-Fitr (1st Shawwal)
  if (hijri.month === 10 && hijri.day === 1) {
    return { isHoliday: true, name: 'Eid al-Fitr' };
  }
  // Eid al-Adha (10th Dhu al-Hijjah)
  if (hijri.month === 12 && hijri.day === 10) {
    return { isHoliday: true, name: 'Eid al-Adha' };
  }
  // Day of Arafah (9th Dhu al-Hijjah)
  if (hijri.month === 12 && hijri.day === 9) {
    return { isHoliday: true, name: 'Day of Arafah' };
  }
  // Ashura (10th Muharram)
  if (hijri.month === 1 && hijri.day === 10) {
    return { isHoliday: true, name: 'Ashura' };
  }
  // Laylat al-Qadr (27th Ramadan - approximate)
  if (hijri.month === 9 && hijri.day === 27) {
    return { isHoliday: true, name: 'Laylat al-Qadr' };
  }

  return { isHoliday: false };
}

/**
 * Get current time with timezone
 */
export function getCurrentTimeWithTimezone(): { time: string; timezone: string } {
  const now = new Date();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const time = now.toTimeString().slice(0, 8); // HH:MM:SS format

  return { time, timezone };
}

/**
 * Format dual date with time component
 */
export function formatDualDateWithTime(dualDate: DualDate, time: string, timezone: string): string {
  return `${formatDualDate(dualDate)} at ${time} (${timezone})`;
}

/**
 * Convert date range between calendars
 */
export function convertDateRange(
  startDate: Date,
  endDate: Date
): { hijriStart: { year: number; month: number; day: number }; hijriEnd: { year: number; month: number; day: number } } {
  return {
    hijriStart: gregorianToHijri(startDate),
    hijriEnd: gregorianToHijri(endDate),
  };
}

/**
 * Get start and end dates for Hijri month
 */
export function getHijriMonthRange(year: number, month: number): { start: Date; end: Date } {
  const startHijri = new HijriDate(year, month - 1, 1);
  const startGregorian = startHijri.toGregorian();

  // Get last day of month
  const daysInMonth = getDaysInHijriMonth(year, month);
  const endHijri = new HijriDate(year, month - 1, daysInMonth);
  const endGregorian = endHijri.toGregorian();

  return {
    start: startGregorian,
    end: endGregorian,
  };
}

/**
 * Enhanced Islamic holiday detection with more holidays
 */
export function getIslamicHoliday(hijri: { year: number; month: number; day: number }): { isHoliday: boolean; name?: string } {
  // Ramadan starts
  if (hijri.month === 9 && hijri.day === 1) {
    return { isHoliday: true, name: 'First day of Ramadan' };
  }
  // Eid al-Fitr (1st Shawwal)
  if (hijri.month === 10 && hijri.day === 1) {
    return { isHoliday: true, name: 'Eid al-Fitr' };
  }
  // Eid al-Adha (10th Dhu al-Hijjah)
  if (hijri.month === 12 && hijri.day === 10) {
    return { isHoliday: true, name: 'Eid al-Adha' };
  }
  // Day of Arafah (9th Dhu al-Hijjah)
  if (hijri.month === 12 && hijri.day === 9) {
    return { isHoliday: true, name: 'Day of Arafah' };
  }
  // Ashura (10th Muharram)
  if (hijri.month === 1 && hijri.day === 10) {
    return { isHoliday: true, name: 'Ashura' };
  }
  // Laylat al-Qadr (27th Ramadan - approximate)
  if (hijri.month === 9 && hijri.day === 27) {
    return { isHoliday: true, name: 'Laylat al-Qadr' };
  }
  // Mawlid al-Nabi (12th Rabi' al-awwal)
  if (hijri.month === 3 && hijri.day === 12) {
    return { isHoliday: true, name: 'Mawlid al-Nabi' };
  }
  // Isra and Mi\'raj (27th Rajab)
  if (hijri.month === 7 && hijri.day === 27) {
    return { isHoliday: true, name: 'Isra and Mi\'raj' };
  }
  // First of Muharram (Islamic New Year)
  if (hijri.month === 1 && hijri.day === 1) {
    return { isHoliday: true, name: 'Islamic New Year' };
  }

  return { isHoliday: false };
}

