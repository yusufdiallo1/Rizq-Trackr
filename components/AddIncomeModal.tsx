'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { scaleInVariants, fadeVariants } from '@/lib/animations';
import { IncomeImageUpload } from './IncomeImageUpload';
import { IncomeDocumentData, toHijriDate } from '@/lib/income-scanner';
import { DualCalendarPicker } from './DualCalendarPicker';
import { useLocation } from '@/lib/contexts/LocationContext';
import { gregorianToHijri, getCurrentTimeWithTimezone } from '@/lib/hijri-calendar';

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    amount: number;
    category: string;
    date: string;
    notes: string;
    is_zakatable: boolean;
    payer_name?: string;
    payment_method?: string;
    document_number?: string;
    location_latitude?: number | null;
    location_longitude?: number | null;
    location_address?: string | null;
    location_city?: string | null;
    location_country?: string | null;
    date_hijri?: string | null;
    time?: string | null;
    timezone?: string | null;
  }) => void;
}

export function AddIncomeModal({ isOpen, onClose, onSave }: AddIncomeModalProps) {
  const { location } = useLocation();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date());
  const [hijriDate, setHijriDate] = useState(gregorianToHijri(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [isZakatable, setIsZakatable] = useState(true);
  const [payerName, setPayerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scanConfidence, setScanConfidence] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Handle scanned data
  const handleScannedData = (data: IncomeDocumentData) => {
    if (data.amount) setAmount(data.amount.toString());
    if (data.date) {
      const scannedDate = new Date(data.date);
      setDate(scannedDate);
      setHijriDate(gregorianToHijri(scannedDate));
    }
    if (data.suggestedCategory) setCategory(data.suggestedCategory);
    if (data.payerName) setPayerName(data.payerName);
    if (data.paymentMethod) setPaymentMethod(data.paymentMethod);
    if (data.documentNumber) setDocumentNumber(data.documentNumber);
    if (data.suggestedNotes) setNotes(data.suggestedNotes);
    setScanConfidence(data.confidence);
    setShowScanner(false);
  };

  const handleDateChange = (newDate: Date, hijri: { year: number; month: number; day: number }) => {
    setDate(newDate);
    setHijriDate(hijri);
    setShowDatePicker(false);
  };

  const categories = ['Salary', 'Business', 'Freelance', 'Gifts', 'Investments', 'Other'];

  // Focus management and keyboard navigation
  useEffect(() => {
    if (isOpen) {
      // Focus first input when modal opens
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);

      // Trap focus within modal
      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab' || showCategorySheet) return;

        const modal = modalRef.current;
        if (!modal) return;

        const focusableElements = modal.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      // Close on Escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !showCategorySheet) {
          handleCancel();
        }
      };

      document.addEventListener('keydown', handleTabKey);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleTabKey);
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, showCategorySheet]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!category) {
      newErrors.category = 'Please select a category';
    }

    if (!date) {
      newErrors.date = 'Date is required';
    } else if (date > new Date()) {
      newErrors.date = 'Date cannot be in the future';
    }

    if (notes.length > 500) {
      newErrors.notes = 'Notes cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    // Get time and timezone based on user's location
    const timezone = location?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const { time, timezone: resolvedTimezone } = getCurrentTimeWithTimezone(timezone);
    const dateHijriString = `${hijriDate.year}-${String(hijriDate.month).padStart(2, '0')}-${String(hijriDate.day).padStart(2, '0')}`;

    onSave({
      amount: parseFloat(amount),
      category,
      date: date.toISOString().split('T')[0],
      notes,
      is_zakatable: isZakatable,
      payer_name: payerName || undefined,
      payment_method: paymentMethod || undefined,
      document_number: documentNumber || undefined,
      location_latitude: location?.latitude || null,
      location_longitude: location?.longitude || null,
      location_address: location?.formattedAddress || null,
      location_city: location?.city || null,
      location_country: location?.country || null,
      date_hijri: dateHijriString,
      time,
      timezone,
    });

    // Reset form
    setAmount('');
    setCategory('');
    const now = new Date();
    setDate(now);
    setHijriDate(gregorianToHijri(now));
    setNotes('');
    setIsZakatable(true);
    setPayerName('');
    setPaymentMethod('');
    setDocumentNumber('');
    setScanConfidence(null);
    setErrors({});
    setSaving(false);
  };

  const handleCancel = () => {
    setAmount('');
    setCategory('');
    const now = new Date();
    setDate(now);
    setHijriDate(gregorianToHijri(now));
    setNotes('');
    setIsZakatable(true);
    setPayerName('');
    setPaymentMethod('');
    setDocumentNumber('');
    setScanConfidence(null);
    setShowScanner(false);
    setErrors({});
    onClose();
  };

  const isFormValid = amount && parseFloat(amount) > 0 && category && date;

  const getCategoryIcon = (cat: string) => {
    const icons: { [key: string]: string } = {
      'Salary': '💼',
      'Business': '🏢',
      'Freelance': '💻',
      'Gifts': '🎁',
      'Investments': '📈',
      'Other': '💰'
    };
    return icons[cat] || '💰';
  };

  const getCategoryColor = (cat: string) => {
    const colors: { [key: string]: string } = {
      'Salary': 'rgba(59, 130, 246, 0.2)',
      'Business': 'rgba(168, 85, 247, 0.2)',
      'Freelance': 'rgba(20, 184, 166, 0.2)',
      'Gifts': 'rgba(236, 72, 153, 0.2)',
      'Investments': 'rgba(249, 115, 22, 0.2)',
      'Other': 'rgba(156, 163, 175, 0.2)'
    };
    return colors[cat] || colors['Other'];
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Modal Overlay - Blur background with slight tint, NO BLACK */}
      <motion.div
        className="fixed inset-0 z-[99999] flex items-center justify-center"
        style={{
          background: theme === 'dark'
            ? 'rgba(15, 23, 42, 0.5)'
            : 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          paddingTop: 'env(safe-area-inset-top, 0)',
          paddingBottom: 'env(safe-area-inset-bottom, 0)',
          paddingLeft: 'env(safe-area-inset-left, 0)',
          paddingRight: 'env(safe-area-inset-right, 0)',
        }}
        variants={fadeVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={handleCancel}
      >
        {/* Modal Content */}
        <motion.div
          ref={modalRef}
          className="w-full max-w-lg rounded-3xl overflow-hidden mx-4"
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)',
            maxHeight: '90vh',
            paddingBottom: 'env(safe-area-inset-bottom, 0)',
            zIndex: 100000,
          }}
          variants={scaleInVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 id="modal-title" className="text-2xl font-bold text-white">Add Income</h2>
          <button
            type="button"
            onClick={handleCancel}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 mobile-tap-target"
              style={{
                backdropFilter: 'blur(10px)',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                minWidth: '44px',
                minHeight: '44px',
              }}
            aria-label="Close add income modal"
          >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

          {/* Scrollable Form Content */}
          <div className="overflow-y-auto mobile-modal-content" style={{ maxHeight: 'calc(90vh - 120px)' }}>
            <form onSubmit={handleSubmit} className="p-6 tablet:p-8 space-y-6 mobile-form">
              {/* Scan Document Button */}
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-98 mobile-tap-target"
                style={{
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(16, 185, 129, 0.2))',
                  backdropFilter: 'blur(15px)',
                  border: '2px dashed rgba(6, 182, 212, 0.5)',
                }}
              >
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-white font-medium">Scan Invoice or Check</span>
              </button>

              {/* Confidence Indicator (when form was auto-filled) */}
              {scanConfidence !== null && (
                <div className="p-3 rounded-xl flex items-center gap-3" style={{
                  background: scanConfidence >= 70
                    ? 'rgba(16, 185, 129, 0.15)'
                    : scanConfidence >= 40
                      ? 'rgba(245, 158, 11, 0.15)'
                      : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${scanConfidence >= 70
                    ? 'rgba(16, 185, 129, 0.3)'
                    : scanConfidence >= 40
                      ? 'rgba(245, 158, 11, 0.3)'
                      : 'rgba(239, 68, 68, 0.3)'}`,
                }}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    scanConfidence >= 70 ? 'bg-emerald-500/20' : scanConfidence >= 40 ? 'bg-amber-500/20' : 'bg-red-500/20'
                  }`}>
                    {scanConfidence >= 70 ? (
                      <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      scanConfidence >= 70 ? 'text-emerald-400' : scanConfidence >= 40 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {scanConfidence >= 70 ? 'Document scanned successfully' : scanConfidence >= 40 ? 'Partial data extracted' : 'Low confidence scan'}
                    </p>
                    <p className="text-white/60 text-xs">Confidence: {scanConfidence}% - Please verify details</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setScanConfidence(null)}
                    className="text-white/40 hover:text-white/70"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Amount Input */}
          <div className="tablet-form-row">
            <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 font-semibold text-2xl">
                $
              </div>
              <input
                ref={firstInputRef}
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                    className="input-animated w-full pl-12 pr-4 py-4 text-3xl font-bold font-mono text-white text-center mobile-input tablet-input"
                    style={{
                      backdropFilter: 'blur(15px)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '16px',
                      minHeight: '48px',
                      fontSize: '16px',
                    }}
                placeholder="0.00"
                aria-label="Income amount"
                aria-required="true"
                aria-invalid={!!errors.amount}
                aria-describedby={errors.amount ? 'amount-error' : undefined}
                inputMode="decimal"
                autoFocus
              />
            </div>
            {errors.amount && (
                  <p id="amount-error" className="text-red-400 text-xs mt-2 flex items-center gap-1" role="alert" aria-live="polite">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.amount}
              </p>
            )}
          </div>

              {/* Category Selector */}
          <div>
                <label className="block text-white/70 text-sm mb-2">Category</label>
                <button
                  type="button"
                  onClick={() => setShowCategorySheet(true)}
                  className="w-full px-4 py-4 rounded-2xl flex items-center justify-between text-white transition-all mobile-tap-target mobile-input tablet-input"
                  style={{
                    backdropFilter: 'blur(15px)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    minHeight: '48px',
                    fontSize: '16px',
                  }}
                  aria-label="Select category"
                  aria-required="true"
                  aria-haspopup="listbox"
                  aria-invalid={!!errors.category}
                  aria-describedby={errors.category ? 'category-error' : undefined}
              >
                  <div className="flex items-center gap-3">
                    {category && (
                      <span className="text-2xl">{getCategoryIcon(category)}</span>
                    )}
                    <span>{category || 'Select Category'}</span>
                  </div>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                </button>
            {errors.category && (
                  <p id="category-error" className="text-red-400 text-xs mt-2 flex items-center gap-1" role="alert" aria-live="polite">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.category}
              </p>
            )}
          </div>

              {/* Date Picker */}
          <div>
                <label className="block text-white/70 text-sm mb-2">Date</label>
                <button
                  type="button"
                  onClick={() => setShowDatePicker(true)}
                  className="input-animated w-full pl-12 pr-4 py-4 text-white rounded-2xl transition-all mobile-input tablet-input text-left flex items-center justify-between"
                    style={{
                      backdropFilter: 'blur(15px)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      minHeight: '48px',
                      fontSize: '16px',
                    }}
                    aria-label="Income date"
                    aria-required="true"
                    aria-invalid={!!errors.date}
                    aria-describedby={errors.date ? 'date-error' : undefined}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-white/40 pointer-events-none">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-medium">
                        {date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                      <span className="text-white/60 text-xs">
                        {hijriDate.day} {['Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani', 'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban', 'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'][hijriDate.month - 1]} {hijriDate.year} AH
                      </span>
                    </div>
            </div>
                  <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
            {errors.date && (
                  <p id="date-error" className="text-red-400 text-xs mt-2 flex items-center gap-1" role="alert" aria-live="polite">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.date}
              </p>
            )}
          </div>

              {/* Payer Name (Optional - from scan) */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Payer Name (Optional)</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    className="input-animated w-full pl-12 pr-4 py-4 text-white rounded-2xl transition-all placeholder:text-white/50 mobile-input tablet-input"
                    style={{
                      backdropFilter: 'blur(15px)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      minHeight: '48px',
                      fontSize: '16px',
                    }}
                    placeholder="Company or person name"
                    aria-label="Payer name (optional)"
                    onFocus={(e) => {
                      e.target.style.border = '2px solid #06b6d4';
                    }}
                    onBlur={(e) => {
                      e.target.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                    }}
                  />
                </div>
              </div>

              {/* Payment Method & Document Number Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Payment Method */}
                <div>
                  <label className="block text-white/70 text-sm mb-2">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="input-animated w-full px-4 py-4 text-white rounded-2xl transition-all mobile-input tablet-input appearance-none"
                    style={{
                      backdropFilter: 'blur(15px)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      minHeight: '48px',
                      fontSize: '16px',
                    }}
                    aria-label="Payment method"
                  >
                    <option value="" className="bg-slate-800">Select...</option>
                    <option value="check" className="bg-slate-800">Check</option>
                    <option value="cash" className="bg-slate-800">Cash</option>
                    <option value="bank_transfer" className="bg-slate-800">Bank Transfer</option>
                    <option value="wire" className="bg-slate-800">Wire</option>
                    <option value="other" className="bg-slate-800">Other</option>
                  </select>
                </div>

                {/* Document Number */}
                <div>
                  <label className="block text-white/70 text-sm mb-2">Doc/Check #</label>
                  <input
                    type="text"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    className="input-animated w-full px-4 py-4 text-white rounded-2xl transition-all placeholder:text-white/50 mobile-input tablet-input"
                    style={{
                      backdropFilter: 'blur(15px)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      minHeight: '48px',
                      fontSize: '16px',
                    }}
                    placeholder="INV-001"
                    aria-label="Document or check number"
                    onFocus={(e) => {
                      e.target.style.border = '2px solid #06b6d4';
                    }}
                    onBlur={(e) => {
                      e.target.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                    }}
                  />
                </div>
              </div>

          {/* Notes */}
          <div>
                <label className="block text-white/70 text-sm mb-2">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={3}
                  className="input-animated w-full px-4 py-4 text-white rounded-2xl resize-none transition-all placeholder:text-white/50 mobile-input tablet-input"
                  style={{
                    backdropFilter: 'blur(15px)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    minHeight: '48px',
                    fontSize: '16px',
                  }}
                  placeholder="Add details..."
                  aria-label="Income notes (optional)"
                  aria-invalid={!!errors.notes}
                  aria-describedby={errors.notes ? 'notes-error' : 'notes-helper'}
                  onFocus={(e) => {
                    e.target.style.border = '2px solid #06b6d4';
                  }}
                  onBlur={(e) => {
                    e.target.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                  }}
            />
                <div className="flex justify-between items-center mt-2">
                  <p id="notes-helper" className="text-white/50 text-xs">{notes.length}/500 characters</p>
              {errors.notes && (
                    <p id="notes-error" className="text-red-400 text-xs flex items-center gap-1" role="alert" aria-live="polite">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.notes}
                </p>
              )}
            </div>
          </div>

          {/* Zakatable Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl" style={{
                backdropFilter: 'blur(10px)',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}>
            <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                    backdropFilter: 'blur(10px)',
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                  }}>
                <span className="text-xl">📿</span>
              </div>
              <div>
                    <p className="text-white font-medium">Mark as Zakatable</p>
                    <p className="text-white/60 text-xs">Subject to Zakat calculation</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsZakatable(!isZakatable)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors mobile-tap-target ${
                    isZakatable ? 'bg-emerald-500' : 'bg-white/20'
              }`}
                  style={{
                    boxShadow: isZakatable ? '0 0 20px rgba(16, 185, 129, 0.5)' : 'none',
                    minWidth: '44px',
                    minHeight: '44px',
                  }}
              aria-label="Mark as Zakatable"
              aria-pressed={isZakatable}
              role="switch"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  isZakatable ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

              {/* Save Button */}
            <button
              type="submit"
              disabled={!isFormValid || saving}
              className="btn-animated w-full py-4 rounded-2xl font-bold text-white text-lg transition-all active:scale-98"
                style={{
                  background: isFormValid
                    ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                    : 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: isFormValid ? '0 4px 20px rgba(16, 185, 129, 0.4)' : 'none',
                }}
              >
                {saving ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Save Income'
                )}
            </button>
            </form>
          </div>
        </motion.div>
      </motion.div>

      {/* Category Bottom Sheet */}
      {showCategorySheet && (
        <div
          className="fixed inset-0 z-50 flex items-end lg:items-center justify-center"
          style={{
            background: theme === 'dark'
              ? 'rgba(15, 23, 42, 0.5)'
              : 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(12px)',
          }}
          onClick={() => setShowCategorySheet(false)}
        >
          <div
            className="w-full lg:max-w-md rounded-t-3xl lg:rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)',
              maxHeight: '70vh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-4 pb-2 lg:hidden">
              <div className="w-12 h-1.5 rounded-full bg-white/30" />
            </div>

            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">Select Category</h3>
            </div>

            {/* Category Grid */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 80px)' }}>
              <div className="grid grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setCategory(cat);
                      setShowCategorySheet(false);
                    }}
                    className="p-4 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95"
                    style={{
                      backdropFilter: 'blur(15px)',
                      background: category === cat
                        ? 'rgba(6, 182, 212, 0.3)'
                        : 'rgba(255, 255, 255, 0.1)',
                      border: category === cat
                        ? '2px solid #06b6d4'
                        : '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <span className="text-3xl">{getCategoryIcon(cat)}</span>
                    <span className="text-white font-medium text-sm">{cat}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Income Scanner Modal */}
      {showScanner && (
        <IncomeImageUpload
          onDataExtracted={handleScannedData}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Dual Calendar Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <DualCalendarPicker
            value={date}
            onChange={handleDateChange}
            onClose={() => setShowDatePicker(false)}
            label="Select Date"
            showTime={false}
          />
        </div>
      )}
    </>
  );
}
