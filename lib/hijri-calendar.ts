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

