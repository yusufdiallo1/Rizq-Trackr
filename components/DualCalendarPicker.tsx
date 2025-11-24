'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import {
  gregorianToHijri,
  hijriToGregorian,
  formatHijriDate,
  formatGregorianDate,
  getHijriMonthName,
  getDaysInHijriMonth,
  isIslamicHoliday,
} from '@/lib/hijri-calendar';

interface DualCalendarPickerProps {
  value?: Date;
  onChange: (date: Date, hijriDate: { year: number; month: number; day: number }) => void;
  onClose?: () => void;
  label?: string;
  showTime?: boolean;
}

type CalendarView = 'gregorian' | 'hijri';

export function DualCalendarPicker({
  value,
  onChange,
  onClose,
  label = 'Select Date',
  showTime = false,
}: DualCalendarPickerProps) {
  const { theme } = useTheme();
  const now = new Date();

  const [selectedDate, setSelectedDate] = useState(value || now);
  const [selectedHijri, setSelectedHijri] = useState(gregorianToHijri(value || now));
  const [activeView, setActiveView] = useState<CalendarView>('gregorian');
  const [selectedTime, setSelectedTime] = useState({
    hours: (value || now).getHours(),
    minutes: (value || now).getMinutes(),
  });

  // Gregorian calendar state
  const [gregMonth, setGregMonth] = useState(selectedDate.getMonth());
  const [gregYear, setGregYear] = useState(selectedDate.getFullYear());

  // Hijri calendar state
  const [hijriMonth, setHijriMonth] = useState(selectedHijri.month);
  const [hijriYear, setHijriYear] = useState(selectedHijri.year);

  // Sync Hijri when Gregorian changes
  useEffect(() => {
    const hijri = gregorianToHijri(selectedDate);
    setSelectedHijri(hijri);
  }, [selectedDate]);

  // Gregorian month names
  const gregMonthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Hijri month names
  const hijriMonthNames = [
    'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
    'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah',
  ];

  // Get days in Gregorian month
  const getDaysInGregMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of Gregorian month (0 = Sunday)
  const getFirstDayOfGregMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Handle Gregorian date selection
  const handleGregDateSelect = (day: number) => {
    const newDate = new Date(gregYear, gregMonth, day, selectedTime.hours, selectedTime.minutes);
    setSelectedDate(newDate);
  };

  // Handle Hijri date selection
  const handleHijriDateSelect = (day: number) => {
    const gregDate = hijriToGregorian(hijriYear, hijriMonth, day);
    gregDate.setHours(selectedTime.hours, selectedTime.minutes);
    setSelectedDate(gregDate);
    setSelectedHijri({ year: hijriYear, month: hijriMonth, day });
  };

  // Navigate Gregorian months
  const navigateGregMonth = (delta: number) => {
    let newMonth = gregMonth + delta;
    let newYear = gregYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }

    setGregMonth(newMonth);
    setGregYear(newYear);
  };

  // Navigate Hijri months
  const navigateHijriMonth = (delta: number) => {
    let newMonth = hijriMonth + delta;
    let newYear = hijriYear;

    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }

    setHijriMonth(newMonth);
    setHijriYear(newYear);
  };

  // Handle confirm
  const handleConfirm = () => {
    const finalDate = new Date(selectedDate);
    if (showTime) {
      finalDate.setHours(selectedTime.hours, selectedTime.minutes);
    }
    onChange(finalDate, selectedHijri);
    onClose?.();
  };

  // Set to today
  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setGregMonth(today.getMonth());
    setGregYear(today.getFullYear());
    const hijri = gregorianToHijri(today);
    setHijriMonth(hijri.month);
    setHijriYear(hijri.year);
  };

  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const mutedColor = theme === 'dark' ? 'text-white/60' : 'text-slate-500';
  const bgColor = theme === 'dark' ? 'bg-slate-800' : 'bg-white';
  const cardBg = theme === 'dark' ? 'bg-slate-700' : 'bg-slate-100';
  const borderColor = theme === 'dark' ? 'border-white/20' : 'border-slate-200';
  const hoverBg = theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-slate-200';

  // Render Gregorian calendar grid
  const renderGregCalendar = () => {
    const daysInMonth = getDaysInGregMonth(gregYear, gregMonth);
    const firstDay = getFirstDayOfGregMonth(gregYear, gregMonth);
    const days = [];

    // Empty cells for days before the first
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-10" />);
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate.getDate() === day &&
        selectedDate.getMonth() === gregMonth &&
        selectedDate.getFullYear() === gregYear;
      const isToday = now.getDate() === day &&
        now.getMonth() === gregMonth &&
        now.getFullYear() === gregYear;

      days.push(
        <button
          key={day}
          onClick={() => handleGregDateSelect(day)}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
            ${isSelected
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
              : isToday
                ? `ring-2 ring-emerald-500 ${textColor}`
                : `${textColor} ${hoverBg}`
            }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  // Render Hijri calendar grid
  const renderHijriCalendar = () => {
    const daysInMonth = getDaysInHijriMonth(hijriYear, hijriMonth);
    const firstDayGreg = hijriToGregorian(hijriYear, hijriMonth, 1);
    const firstDay = firstDayGreg.getDay();
    const days = [];

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-10" />);
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedHijri.day === day &&
        selectedHijri.month === hijriMonth &&
        selectedHijri.year === hijriYear;
      const currentHijri = gregorianToHijri(now);
      const isToday = currentHijri.day === day &&
        currentHijri.month === hijriMonth &&
        currentHijri.year === hijriYear;
      const holiday = isIslamicHoliday({ year: hijriYear, month: hijriMonth, day });

      days.push(
        <button
          key={day}
          onClick={() => handleHijriDateSelect(day)}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all relative
            ${isSelected
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg'
              : isToday
                ? `ring-2 ring-amber-500 ${textColor}`
                : holiday.isHoliday
                  ? 'bg-amber-100 text-amber-700'
                  : `${textColor} ${hoverBg}`
            }`}
          title={holiday.name}
        >
          {day}
          {holiday.isHoliday && !isSelected && (
            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-500 rounded-full" />
          )}
        </button>
      );
    }

    return days;
  };

  return (
    <div className={`rounded-3xl p-6 ${bgColor} border ${borderColor} shadow-2xl max-w-md w-full`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-xl font-bold ${textColor}`}>{label}</h3>
        {onClose && (
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${hoverBg} transition-colors`}
          >
            <svg className={`w-5 h-5 ${textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Current Selection Display */}
      <div className={`p-4 rounded-2xl ${cardBg} mb-4`}>
        <div className="text-center">
          <p className={`text-2xl font-bold ${textColor}`}>
            {formatGregorianDate(selectedDate)}
          </p>
          <p className="text-lg text-amber-600 font-medium mt-1">
            {formatHijriDate(selectedHijri)}
          </p>
        </div>
      </div>

      {/* Calendar Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveView('gregorian')}
          className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
            activeView === 'gregorian'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
              : `${cardBg} ${textColor} ${hoverBg}`
          }`}
        >
          Gregorian
        </button>
        <button
          onClick={() => setActiveView('hijri')}
          className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
            activeView === 'hijri'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md'
              : `${cardBg} ${textColor} ${hoverBg}`
          }`}
        >
          Hijri
        </button>
      </div>

      {/* Calendar */}
      <div className={`p-4 rounded-2xl ${cardBg}`}>
        {activeView === 'gregorian' ? (
          <>
            {/* Gregorian Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateGregMonth(-1)}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${hoverBg} transition-colors`}
              >
                <svg className={`w-5 h-5 ${textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h4 className={`text-lg font-bold ${textColor}`}>
                {gregMonthNames[gregMonth]} {gregYear}
              </h4>
              <button
                onClick={() => navigateGregMonth(1)}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${hoverBg} transition-colors`}
              >
                <svg className={`w-5 h-5 ${textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className={`w-10 h-8 flex items-center justify-center text-xs font-medium ${mutedColor}`}>
                  {day}
                </div>
              ))}
            </div>

            {/* Gregorian Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {renderGregCalendar()}
            </div>
          </>
        ) : (
          <>
            {/* Hijri Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateHijriMonth(-1)}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${hoverBg} transition-colors`}
              >
                <svg className={`w-5 h-5 ${textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h4 className={`text-lg font-bold ${textColor}`}>
                {hijriMonthNames[hijriMonth - 1]} {hijriYear} AH
              </h4>
              <button
                onClick={() => navigateHijriMonth(1)}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${hoverBg} transition-colors`}
              >
                <svg className={`w-5 h-5 ${textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className={`w-10 h-8 flex items-center justify-center text-xs font-medium ${mutedColor}`}>
                  {day}
                </div>
              ))}
            </div>

            {/* Hijri Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {renderHijriCalendar()}
            </div>
          </>
        )}
      </div>

      {/* Time Picker (optional) */}
      {showTime && (
        <div className={`p-4 rounded-2xl ${cardBg} mt-4`}>
          <p className={`text-sm font-medium ${mutedColor} mb-2`}>Time</p>
          <div className="flex items-center justify-center gap-2">
            <select
              value={selectedTime.hours}
              onChange={(e) => setSelectedTime({ ...selectedTime, hours: parseInt(e.target.value) })}
              className={`px-3 py-2 rounded-xl ${bgColor} ${textColor} border ${borderColor}`}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
              ))}
            </select>
            <span className={`text-xl font-bold ${textColor}`}>:</span>
            <select
              value={selectedTime.minutes}
              onChange={(e) => setSelectedTime({ ...selectedTime, minutes: parseInt(e.target.value) })}
              className={`px-3 py-2 rounded-xl ${bgColor} ${textColor} border ${borderColor}`}
            >
              {Array.from({ length: 60 }, (_, i) => (
                <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleToday}
          className={`px-4 py-3 rounded-xl font-medium ${cardBg} ${textColor} ${hoverBg} transition-colors`}
        >
          Today
        </button>
        <button
          onClick={handleConfirm}
          className="flex-1 px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
