'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { 
  gregorianToHijri, 
  hijriToGregorian, 
  getHijriMonthName,
  getDaysInHijriMonth,
  isIslamicHoliday,
  formatHijriDate,
  formatGregorianDate,
  DualDate
} from '@/lib/hijri-calendar';
import { getTextColor, getMutedTextColor } from '@/lib/utils';

interface DualDatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: DualDate) => void;
  initialDate?: Date;
  title?: string;
}

export function DualDatePicker({
  isOpen,
  onClose,
  onSelect,
  initialDate = new Date(),
  title = 'Select Date'
}: DualDatePickerProps) {
  const { theme } = useTheme();
  const [selectedGregorian, setSelectedGregorian] = useState(initialDate);
  const [selectedHijri, setSelectedHijri] = useState(gregorianToHijri(initialDate));
  const [viewMonthGregorian, setViewMonthGregorian] = useState(initialDate);
  const [viewMonthHijri, setViewMonthHijri] = useState(gregorianToHijri(initialDate));

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setSelectedGregorian(initialDate);
      setSelectedHijri(gregorianToHijri(initialDate));
      setViewMonthGregorian(initialDate);
      setViewMonthHijri(gregorianToHijri(initialDate));
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialDate]);

  const handleGregorianDateSelect = (date: Date) => {
    setSelectedGregorian(date);
    const hijri = gregorianToHijri(date);
    setSelectedHijri(hijri);
    setViewMonthHijri(hijri);
  };

  const handleHijriDateSelect = (year: number, month: number, day: number) => {
    const gregorian = hijriToGregorian(year, month, day);
    setSelectedHijri({ year, month, day });
    setSelectedGregorian(gregorian);
    setViewMonthGregorian(gregorian);
  };

  const handleConfirm = () => {
    onSelect({
      gregorian: selectedGregorian,
      hijri: selectedHijri,
      hijriString: formatHijriDate(selectedHijri),
      gregorianString: formatGregorianDate(selectedGregorian),
    });
    onClose();
  };

  if (!isOpen) return null;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Generate calendar days
  const gregorianYear = viewMonthGregorian.getFullYear();
  const gregorianMonth = viewMonthGregorian.getMonth();
  const firstDayGregorian = new Date(gregorianYear, gregorianMonth, 1);
  const lastDayGregorian = new Date(gregorianYear, gregorianMonth + 1, 0);
  const daysInMonthGregorian = lastDayGregorian.getDate();
  const startingDayOfWeekGregorian = firstDayGregorian.getDay();

  const hijriDaysInMonth = getDaysInHijriMonth(viewMonthHijri.year, viewMonthHijri.month);
  const firstDayHijri = hijriToGregorian(viewMonthHijri.year, viewMonthHijri.month, 1);
  const startingDayOfWeekHijri = firstDayHijri.getDay();

  const gregorianDays = [];
  const hijriDays = [];

  // Generate Gregorian calendar days
  for (let i = 0; i < startingDayOfWeekGregorian; i++) {
    gregorianDays.push(null);
  }
  for (let day = 1; day <= daysInMonthGregorian; day++) {
    gregorianDays.push(day);
  }

  // Generate Hijri calendar days
  for (let i = 0; i < startingDayOfWeekHijri; i++) {
    hijriDays.push(null);
  }
  for (let day = 1; day <= hijriDaysInMonth; day++) {
    hijriDays.push(day);
  }

  const isSelectedGregorian = (day: number | null) => {
    if (day === null) return false;
    return selectedGregorian.getDate() === day &&
           selectedGregorian.getMonth() === gregorianMonth &&
           selectedGregorian.getFullYear() === gregorianYear;
  };

  const isSelectedHijri = (day: number | null) => {
    if (day === null) return false;
    return selectedHijri.day === day &&
           selectedHijri.month === viewMonthHijri.month &&
           selectedHijri.year === viewMonthHijri.year;
  };

  const navigateGregorianMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(viewMonthGregorian);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setViewMonthGregorian(newDate);
    setViewMonthHijri(gregorianToHijri(newDate));
  };

  const navigateHijriMonth = (direction: 'prev' | 'next') => {
    let newYear = viewMonthHijri.year;
    let newMonth = viewMonthHijri.month;
    
    if (direction === 'prev') {
      newMonth--;
      if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }
    } else {
      newMonth++;
      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      }
    }
    
    const newHijri = { year: newYear, month: newMonth, day: 1 };
    setViewMonthHijri(newHijri);
    setViewMonthGregorian(hijriToGregorian(newYear, newMonth, 1));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          opacity: 0.95,
          backdropFilter: 'blur(8px)',
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed z-50 transition-all duration-300 ${
          isMobile ? 'inset-4' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
        }`}
        style={{
          maxWidth: isMobile ? '100%' : '900px',
          width: '100%',
          maxHeight: isMobile ? 'calc(100vh - 2rem)' : '90vh',
          background: theme === 'dark'
            ? 'rgba(15, 23, 42, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(30px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className={`text-2xl font-bold ${getTextColor(theme)}`}>{title}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-6" style={{ maxHeight: isMobile ? 'calc(100vh - 200px)' : '600px' }}>
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-6`}>
            {/* Gregorian Calendar */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => navigateGregorianMonth('prev')}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className={`text-lg font-bold ${getTextColor(theme)}`}>
                  {viewMonthGregorian.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => navigateGregorianMonth('next')}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className={`text-center text-sm font-semibold ${getMutedTextColor(theme)}`}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {gregorianDays.map((day, index) => (
                  <button
                    key={index}
                    onClick={() => day && handleGregorianDateSelect(new Date(gregorianYear, gregorianMonth, day))}
                    disabled={day === null}
                    className={`aspect-square rounded-lg transition-all ${
                      day === null ? 'opacity-0 cursor-default' : 'hover:scale-110 cursor-pointer'
                    } ${
                      isSelectedGregorian(day)
                        ? 'bg-cyan-500 text-white'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                    style={{
                      backdropFilter: 'blur(10px)',
                      border: isSelectedGregorian(day) ? '2px solid rgba(6, 182, 212, 0.5)' : '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Hijri Calendar */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => navigateHijriMonth('prev')}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className={`text-lg font-bold ${getTextColor(theme)} text-center`}>
                  {getHijriMonthName(viewMonthHijri.month)} {viewMonthHijri.year}
                </h3>
                <button
                  onClick={() => navigateHijriMonth('next')}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className={`text-center text-sm font-semibold ${getMutedTextColor(theme)}`}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {hijriDays.map((day, index) => {
                  const holiday = day ? isIslamicHoliday({ year: viewMonthHijri.year, month: viewMonthHijri.month, day }) : null;
                  return (
                    <button
                      key={index}
                      onClick={() => day && handleHijriDateSelect(viewMonthHijri.year, viewMonthHijri.month, day)}
                      disabled={day === null}
                      className={`aspect-square rounded-lg transition-all relative ${
                        day === null ? 'opacity-0 cursor-default' : 'hover:scale-110 cursor-pointer'
                      } ${
                        isSelectedHijri(day)
                          ? 'bg-amber-500 text-white'
                          : holiday?.isHoliday
                          ? 'bg-amber-500/30 hover:bg-amber-500/40'
                          : 'bg-white/10 hover:bg-white/20'
                      }`}
                      style={{
                        backdropFilter: 'blur(10px)',
                        border: isSelectedHijri(day) 
                          ? '2px solid rgba(245, 158, 11, 0.5)' 
                          : '1px solid rgba(255, 255, 255, 0.2)',
                      }}
                      title={holiday?.isHoliday ? holiday.name : undefined}
                    >
                      {day}
                      {holiday?.isHoliday && (
                        <span className="absolute top-0 right-0 text-xs">⭐</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Selected Date Display */}
          <div 
            className="mt-6 p-4 rounded-xl text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <p className={`text-sm ${getMutedTextColor(theme)} mb-1`}>Selected Date</p>
            <p className={`font-bold ${getTextColor(theme)}`}>
              {formatHijriDate(selectedHijri)} / {formatGregorianDate(selectedGregorian)}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl font-medium transition-all"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: getTextColor(theme),
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-6 py-3 rounded-xl font-medium text-white transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
              boxShadow: '0 4px 16px rgba(6, 182, 212, 0.4)',
            }}
          >
            Select Date
          </button>
        </div>
      </div>
    </>
  );
}

