'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { uploadFile } from '@/lib/storage';
import { extractReceiptData, autoCategorizeExpense, ReceiptData } from '@/lib/receipt-scanner';
import { getCurrentUser } from '@/lib/auth';
import { scaleInVariants, fadeVariants, slideUpVariants } from '@/lib/animations';
import { DualCalendarPicker } from './DualCalendarPicker';
import { useLocation } from '@/lib/contexts/LocationContext';
import { gregorianToHijri, getCurrentTimeWithTimezone } from '@/lib/hijri-calendar';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    amount: number;
    category: string;
    date: string;
    notes: string;
    receiptImageUrl?: string;
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

export function AddExpenseModal({ isOpen, onClose, onSave }: AddExpenseModalProps) {
  const { location } = useLocation();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date());
  const [hijriDate, setHijriDate] = useState(gregorianToHijri(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [saving, setSaving] = useState(false);

  // Receipt upload states
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptImageUrl, setReceiptImageUrl] = useState<string | null>(null);
  const [scanningReceipt, setScanningReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [merchantName, setMerchantName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'Housing',
    'Food',
    'Transport',
    'Healthcare',
    'Education',
    'Charity',
    'Entertainment',
    'Bills',
    'Other',
  ];

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

  const handleFileSelect = async (file: File) => {
    setReceiptImage(file);
    setReceiptData(null);
    setErrors({});

    // Preview
    const reader = new FileReader();
    reader.onload = e => setReceiptPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Scan
    setScanningReceipt(true);
    try {
      const { data: extractedData, error } = await extractReceiptData(file);
      if (error) {
        console.error('Error scanning receipt:', error);
        setErrors(prev => ({ ...prev, receipt: error }));
        return;
      }
      if (extractedData) {
        setReceiptData(extractedData);

        // Auto-fill all fields from extracted data
        // 1. Amount (price spent) - try amount first, then total, ensure it's a valid number
        let extractedAmount: number | null = null;
        if (extractedData.amount !== null && extractedData.amount !== undefined) {
          extractedAmount = typeof extractedData.amount === 'number' ? extractedData.amount : parseFloat(String(extractedData.amount));
        } else if (extractedData.total !== null && extractedData.total !== undefined) {
          extractedAmount = typeof extractedData.total === 'number' ? extractedData.total : parseFloat(String(extractedData.total));
        }
        
        if (extractedAmount !== null && !isNaN(extractedAmount) && extractedAmount > 0) {
          const formattedAmount = extractedAmount.toFixed(2);
          setAmount(formattedAmount);
          console.log('Amount extracted and set:', formattedAmount);
        } else {
          console.warn('No valid amount extracted:', { amount: extractedData.amount, total: extractedData.total });
        }

        // 2. Date (exact date from receipt)
        if (extractedData.date) {
          const receiptDate = new Date(extractedData.date);
          setDate(receiptDate);
          setHijriDate(gregorianToHijri(receiptDate));
        }

        // 3. Merchant name
        if (extractedData.merchant) {
          setMerchantName(extractedData.merchant);
        }

        // 4. Category (auto-categorized)
        if (extractedData.suggestedCategory) {
          setCategory(extractedData.suggestedCategory);
        } else {
          const suggestedCategory = autoCategorizeExpense(
            extractedData.merchant,
            extractedData.items
          );
          setCategory(suggestedCategory);
        }

        // 5. Notes (merchant + items summary)
        if (extractedData.suggestedNotes) {
          setNotes(extractedData.suggestedNotes);
        } else if (extractedData.merchant) {
          const notesParts: string[] = [`At ${extractedData.merchant}`];
          if (extractedData.items.length > 0) {
            notesParts.push(extractedData.items.slice(0, 3).join(', '));
          }
          setNotes(notesParts.join(' - '));
        }
      }
    } catch (err) {
      console.error('Error processing receipt:', err);
      setErrors(prev => ({ ...prev, receipt: 'Failed to process receipt. Please try again or enter manually.' }));
    } finally {
      setScanningReceipt(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleCameraClick = () => cameraInputRef.current?.click();
  const handleUploadClick = () => fileInputRef.current?.click();

  const removeReceipt = () => {
    setReceiptImage(null);
    setReceiptPreview(null);
    setReceiptImageUrl(null);
    setReceiptData(null);
    setMerchantName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      let uploadedReceiptUrl: string | null = null;

      // Try to upload receipt if provided, but don't block expense saving if it fails
      if (receiptImage) {
        const user = await getCurrentUser();
        if (user) {
          try {
            const { url, error: uploadError } = await uploadFile(
              receiptImage,
              user.id,
              'receipts'
            );
            if (uploadError) {
              console.warn('Error uploading receipt:', uploadError);
              // Show warning but don't block - expense will be saved without receipt
              setErrors(prev => ({ 
                ...prev, 
                receipt: 'Receipt upload failed, but expense will still be saved' 
              }));
              // Continue saving expense without receipt URL
            } else {
              uploadedReceiptUrl = url;
              setReceiptImageUrl(url);
            }
          } catch (uploadErr) {
            console.warn('Exception during receipt upload:', uploadErr);
            // Continue saving expense without receipt URL
          }
        }
      }

      // Get time and timezone
      // Get time and timezone based on user's location
      const timezone = location?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      const { time, timezone: resolvedTimezone } = getCurrentTimeWithTimezone(timezone);
      const dateHijriString = `${hijriDate.year}-${String(hijriDate.month).padStart(2, '0')}-${String(hijriDate.day).padStart(2, '0')}`;

      // Always save the expense, even if receipt upload failed
      onSave({
        amount: parseFloat(amount),
        category,
        date: date.toISOString().split('T')[0],
        notes,
        receiptImageUrl: uploadedReceiptUrl || undefined,
        location_latitude: location?.latitude || null,
        location_longitude: location?.longitude || null,
        location_address: location?.formattedAddress || null,
        location_city: location?.city || null,
        location_country: location?.country || null,
        date_hijri: dateHijriString,
        time,
        timezone,
      });

      // Reset
      setAmount('');
      setCategory('');
      const now = new Date();
      setDate(now);
      setHijriDate(gregorianToHijri(now));
      setNotes('');
      setErrors({});
      setReceiptImage(null);
      setReceiptPreview(null);
      setReceiptImageUrl(null);
      setReceiptData(null);
      setMerchantName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    } catch (err) {
      console.error('Error saving expense:', err);
      setErrors(prev => ({ ...prev, general: 'Failed to save expense' }));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setAmount('');
    setCategory('');
    const now = new Date();
    setDate(now);
    setHijriDate(gregorianToHijri(now));
    setNotes('');
    setErrors({});
    setReceiptImage(null);
    setReceiptPreview(null);
    setReceiptImageUrl(null);
    setReceiptData(null);
    setMerchantName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    onClose();
  };

  const isFormValid = amount && parseFloat(amount) > 0 && category && date;

  const handleDateChange = (newDate: Date, hijri: { year: number; month: number; day: number }) => {
    setDate(newDate);
    setHijriDate(hijri);
    setShowDatePicker(false);
  };

  const getCategoryIcon = (cat: string) => {
    const icons: { [key: string]: string } = {
      Housing: '🏠',
      Food: '🍽️',
      Transport: '🚗',
      Healthcare: '⚕️',
      Education: '📚',
      Charity: '🤲',
      Entertainment: '🎬',
      Bills: '📄',
      Other: '✨',
    };
    return icons[cat] || '✨';
  };

  if (!isOpen) return null;

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
          onClick={e => e.stopPropagation()}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white">Add Expense</h2>
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
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto mobile-modal-content" style={{ maxHeight: 'calc(90vh - 120px)' }}>
            <form onSubmit={handleSubmit} className="p-6 tablet:p-8 space-y-6 mobile-form">
              {/* Receipt section */}
              <div className="space-y-3">
                <label className="block text-white/70 text-sm mb-2">Receipt (Optional)</label>

                {/* Hidden inputs */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={cameraInputRef}
                  onChange={handleFileInputChange}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />

                {!receiptPreview ? (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleCameraClick}
                      className="flex-1 lg:flex-none lg:w-auto px-6 lg:px-4 py-12 lg:py-4 rounded-2xl font-medium text-white flex flex-col lg:flex-row items-center justify-center gap-3 transition-all active:scale-95"
                      style={{
                        backdropFilter: 'blur(15px)',
                        background: 'rgba(59, 130, 246, 0.3)',
                        border: '1px solid rgba(59, 130, 246, 0.4)',
                        boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
                      }}
                    >
                      <svg
                        className="w-8 h-8 lg:w-5 lg:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="text-base lg:text-sm">Take Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleUploadClick}
                      className="flex-1 lg:flex-none lg:w-auto px-6 lg:px-4 py-12 lg:py-4 rounded-2xl font-medium text-white flex flex-col lg:flex-row items-center justify-center gap-3 transition-all active:scale-95"
                      style={{
                        backdropFilter: 'blur(15px)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      <svg
                        className="w-8 h-8 lg:w-5 lg:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <span className="text-base lg:text-sm">Upload Image</span>
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div
                      className="relative rounded-2xl overflow-hidden"
                      style={{
                        backdropFilter: 'blur(15px)',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      {scanningReceipt && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                          <div className="text-center">
                            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-white text-sm">Scanning receipt...</p>
                          </div>
                        </div>
                      )}
                      <img
                        src={receiptPreview}
                        alt="Receipt preview"
                        className="w-full h-auto max-h-64 object-contain"
                      />
                      <button
                        type="button"
                        onClick={removeReceipt}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center bg-red-500/80 hover:bg-red-500 transition-all"
                      >
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {receiptData && (
                      <div
                        className="mt-3 p-4 rounded-xl space-y-2"
                        style={{
                          backdropFilter: 'blur(10px)',
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-emerald-400 text-sm font-semibold flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            AI Extracted Data
                          </p>
                          {receiptData.confidence > 0 && (
                            <span className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded-full">
                              {receiptData.confidence}% confidence
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {receiptData.amount && (
                            <div className="bg-white/10 rounded-lg p-2">
                              <p className="text-white/60 text-xs">Amount</p>
                              <p className="text-white font-bold">${receiptData.amount.toFixed(2)}</p>
                            </div>
                          )}
                          {receiptData.date && (
                            <div className="bg-white/10 rounded-lg p-2">
                              <p className="text-white/60 text-xs">Date</p>
                              <p className="text-white font-medium">{new Date(receiptData.date).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>

                        {receiptData.merchant && (
                          <div className="bg-white/10 rounded-lg p-2">
                            <p className="text-white/60 text-xs">Merchant</p>
                            <p className="text-white font-medium">{receiptData.merchant}</p>
                          </div>
                        )}

                        {receiptData.suggestedCategory && (
                          <div className="bg-white/10 rounded-lg p-2">
                            <p className="text-white/60 text-xs">Suggested Category</p>
                            <p className="text-white font-medium flex items-center gap-2">
                              <span>{getCategoryIcon(receiptData.suggestedCategory)}</span>
                              {receiptData.suggestedCategory}
                            </p>
                          </div>
                        )}

                        {receiptData.items.length > 0 && (
                          <div className="bg-white/10 rounded-lg p-2">
                            <p className="text-white/60 text-xs mb-1">Items Found</p>
                            <p className="text-white/80 text-xs">
                              {receiptData.items.slice(0, 3).join(' • ')}
                              {receiptData.items.length > 3 && ` (+${receiptData.items.length - 3} more)`}
                            </p>
                          </div>
                        )}

                        <p className="text-emerald-400/70 text-xs italic">
                          Form fields have been auto-filled. You can edit them below.
                        </p>
                      </div>
                    )}

                    {errors.receipt && (
                      <div
                        className="mt-3 p-3 rounded-xl"
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                        }}
                      >
                        <p className="text-red-400 text-sm flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          {errors.receipt}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Amount */}
              <div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 font-semibold text-2xl">
                    -$
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    inputMode="decimal"
                    className="input-animated w-full pl-12 pr-4 py-4 text-3xl font-bold font-mono text-white text-center mobile-input tablet-input"
                    style={{
                      backdropFilter: 'blur(15px)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '16px',
                      minHeight: '48px',
                      fontSize: '1.75rem',
                    }}
                    placeholder="0.00"
                  />
                </div>
                {errors.amount && (
                  <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.amount}
                  </p>
                )}
              </div>

              {/* Category selector */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Category</label>
                <button
                  type="button"
                  onClick={() => setShowCategorySheet(true)}
                  className="w-full px-4 py-4 rounded-2xl flex items-center justify-between text-white transition-all"
                  style={{
                    backdropFilter: 'blur(15px)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    {category && <span className="text-2xl">{getCategoryIcon(category)}</span>}
                    <span>{category || 'Select Category'}</span>
                  </div>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {errors.category && (
                  <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.category}
                  </p>
                )}
              </div>

              {/* Date */}
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
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-white/40 pointer-events-none">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
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
                  <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.date}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-white/70 text-sm mb-2">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="input-animated w-full px-4 py-4 text-white rounded-2xl resize-none transition-all"
                  style={{
                    backdropFilter: 'blur(15px)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                  placeholder="Add details..."
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-white/50 text-xs">{notes.length}/500 characters</p>
                  {errors.notes && (
                    <p className="text-red-400 text-xs flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Save button */}
              <button
                type="submit"
                disabled={!isFormValid || saving}
                className="btn-animated w-full py-4 rounded-2xl font-bold text-white text-lg transition-all active:scale-98"
                style={{
                  background: isFormValid
                    ? 'linear-gradient(135deg, #ef4444, #f97316)'
                    : 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: isFormValid ? '0 4px 20px rgba(239, 68, 68, 0.4)' : 'none',
                }}
              >
                {saving ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Save Expense'
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </motion.div>

      {/* Category Bottom Sheet */}
      {showCategorySheet && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end lg:items-center justify-center"
          style={{
            background: theme === 'dark'
              ? 'rgba(15, 23, 42, 0.5)'
              : 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(12px)',
          }}
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={() => setShowCategorySheet(false)}
        >
          <motion.div
            className="w-full lg:max-w-md rounded-t-3xl lg:rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)',
              maxHeight: '70vh',
            }}
            variants={slideUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-4 pb-2 lg:hidden">
              <div className="w-12 h-1.5 rounded-full bg-white/30" />
            </div>

            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">Select Category</h3>
            </div>

            <div
              className="p-6 overflow-y-auto"
              style={{ maxHeight: 'calc(70vh - 80px)' }}
            >
              <div className="grid grid-cols-2 gap-4">
                {categories.map(cat => (
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
                      background:
                        category === cat
                          ? 'rgba(239, 68, 68, 0.3)'
                          : 'rgba(255, 255, 255, 0.1)',
                      border:
                        category === cat
                          ? '2px solid #ef4444'
                          : '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    <span className="text-3xl">{getCategoryIcon(cat)}</span>
                    <span className="text-white font-medium text-sm">{cat}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
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


