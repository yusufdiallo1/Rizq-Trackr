'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { getHijriMonthName, getDaysInHijriMonth, gregorianToHijri, hijriToGregorian, formatHijriDate } from '@/lib/hijri-calendar';

interface HijriDatePickerProps {
  value?: { year: number; month: number; day: number } | null;
  onChange: (date: { year: number; month: number; day: number }) => void;
  onClose?: () => void;
  label?: string;
}

export function HijriDatePicker({ value, onChange, onClose, label = 'Select Hijri Date' }: HijriDatePickerProps) {
  const { theme } = useTheme();
  const currentHijri = gregorianToHijri(new Date());

  const [selectedYear, setSelectedYear] = useState(value?.year || currentHijri.year);
  const [selectedMonth, setSelectedMonth] = useState(value?.month || currentHijri.month);
  const [selectedDay, setSelectedDay] = useState(value?.day || currentHijri.day);

  // Generate year options (current year -5 to +5)
  const years = Array.from({ length: 11 }, (_, i) => currentHijri.year - 5 + i);

  // Get days in selected month
  const daysInMonth = getDaysInHijriMonth(selectedYear, selectedMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Month names
  const months = [
    { value: 1, name: 'Muharram' },
    { value: 2, name: 'Safar' },
    { value: 3, name: "Rabi' al-Awwal" },
    { value: 4, name: "Rabi' al-Thani" },
    { value: 5, name: 'Jumada al-Awwal' },
    { value: 6, name: 'Jumada al-Thani' },
    { value: 7, name: 'Rajab' },
    { value: 8, name: "Sha'ban" },
    { value: 9, name: 'Ramadan' },
    { value: 10, name: 'Shawwal' },
    { value: 11, name: "Dhu al-Qi'dah" },
    { value: 12, name: 'Dhu al-Hijjah' },
  ];

  // Ensure day is valid when month/year changes
  useEffect(() => {
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [selectedMonth, selectedYear, daysInMonth, selectedDay]);

  // Get Gregorian equivalent for preview
  const gregorianDate = hijriToGregorian(selectedYear, selectedMonth, selectedDay);
  const gregorianString = gregorianDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleConfirm = () => {
    onChange({ year: selectedYear, month: selectedMonth, day: selectedDay });
    onClose?.();
  };

  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const mutedColor = theme === 'dark' ? 'text-white/60' : 'text-slate-500';
  const bgColor = theme === 'dark' ? 'bg-slate-800' : 'bg-white';
  const inputBg = theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100';
  const borderColor = theme === 'dark' ? 'border-white/20' : 'border-slate-200';

  return (
    <div className={`rounded-3xl p-6 ${bgColor} border ${borderColor} shadow-2xl max-w-md w-full`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-xl font-bold ${textColor}`}>{label}</h3>
        {onClose && (
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-slate-100'} transition-colors`}
          >
            <svg className={`w-5 h-5 ${textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Hijri Calendar Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
          <span className="text-3xl">🕌</span>
        </div>
      </div>

      {/* Year Selector */}
      <div className="mb-4">
        <label className={`block text-sm font-medium ${mutedColor} mb-2`}>Hijri Year</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className={`w-full px-4 py-3 rounded-xl ${inputBg} ${textColor} border ${borderColor} focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all`}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year} AH
            </option>
          ))}
        </select>
      </div>

      {/* Month Selector */}
      <div className="mb-4">
        <label className={`block text-sm font-medium ${mutedColor} mb-2`}>Hijri Month</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className={`w-full px-4 py-3 rounded-xl ${inputBg} ${textColor} border ${borderColor} focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all`}
        >
          {months.map((month) => (
            <option key={month.value} value={month.value}>
              {month.name}
            </option>
          ))}
        </select>
      </div>

      {/* Day Selector */}
      <div className="mb-6">
        <label className={`block text-sm font-medium ${mutedColor} mb-2`}>Day</label>
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(Number(e.target.value))}
          className={`w-full px-4 py-3 rounded-xl ${inputBg} ${textColor} border ${borderColor} focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all`}
        >
          {days.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
      </div>

      {/* Preview */}
      <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-amber-900/30' : 'bg-amber-50'} border ${theme === 'dark' ? 'border-amber-700/50' : 'border-amber-200'} mb-6`}>
        <p className={`text-sm font-medium ${mutedColor} mb-1`}>Selected Date</p>
        <p className={`text-lg font-bold text-amber-600`}>
          {formatHijriDate({ year: selectedYear, month: selectedMonth, day: selectedDay })}
        </p>
        <p className={`text-sm ${mutedColor} mt-1`}>
          = {gregorianString}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onClose && (
          <button
            onClick={onClose}
            className={`flex-1 px-4 py-3 rounded-xl font-medium ${theme === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} transition-colors`}
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleConfirm}
          className="flex-1 px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg"
        >
          Confirm Date
        </button>
      </div>
    </div>
  );
}
