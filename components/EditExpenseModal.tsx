'use client';

import { useState, useEffect } from 'react';
import { ExpenseEntry } from '@/lib/expenses';

interface EditExpenseModalProps {
  isOpen: boolean;
  expense: ExpenseEntry | null;
  onClose: () => void;
  onUpdate: (id: string, data: {
    amount: number;
    category: string;
    date: string;
    notes: string;
  }) => void;
  onDelete?: (expense: ExpenseEntry) => void;
}

export function EditExpenseModal({ isOpen, expense, onClose, onUpdate, onDelete }: EditExpenseModalProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [saving, setSaving] = useState(false);

  const categories = ['Housing', 'Food', 'Transport', 'Healthcare', 'Education', 'Charity', 'Entertainment', 'Bills', 'Other'];

  useEffect(() => {
    if (expense) {
      setAmount(expense.amount.toString());
      setCategory(expense.category);
      setDate(expense.date);
      setNotes(expense.notes || '');
    }
  }, [expense]);

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
    } else if (new Date(date) > new Date()) {
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

    if (!validateForm() || !expense) {
      return;
    }

    setSaving(true);
    onUpdate(expense.id, {
      amount: parseFloat(amount),
      category,
      date,
      notes,
    });
    setSaving(false);
  };

  const handleCancel = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen || !expense) return null;

  const isFormValid = amount && parseFloat(amount) > 0 && category && date;

  const getCategoryIcon = (cat: string) => {
    const icons: { [key: string]: string } = {
      'Housing': '🏠',
      'Food': '🍽️',
      'Transport': '🚗',
      'Healthcare': '⚕️',
      'Education': '📚',
      'Charity': '🤲',
      'Entertainment': '🎬',
      'Bills': '📄',
      'Other': '✨'
    };
    return icons[cat] || '✨';
  };

  return (
    <>
      {/* Modal Overlay */}
      <div
        className="fixed inset-0 z-50 flex items-end tablet:items-center lg:items-center justify-center animate-fade-in-instant"
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          paddingTop: 'env(safe-area-inset-top, 0)',
          paddingBottom: 'env(safe-area-inset-bottom, 0)',
        }}
        onClick={handleCancel}
      >
        {/* Modal Content */}
        <div
          className="w-full tablet:max-w-lg lg:max-w-lg tablet:rounded-3xl lg:rounded-3xl overflow-hidden animate-scale-in mobile-bottom-sheet tablet-modal"
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)',
            maxHeight: '90vh',
            borderTopLeftRadius: '1.25rem',
            borderTopRightRadius: '1.25rem',
            paddingBottom: 'env(safe-area-inset-bottom, 0)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white">Edit Expense</h2>
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
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

          {/* Scrollable Form Content */}
          <div className="overflow-y-auto mobile-modal-content" style={{ maxHeight: 'calc(90vh - 120px)' }}>
            <form onSubmit={handleSubmit} className="p-6 tablet:p-8 space-y-6 mobile-form">
              {/* Amount Input */}
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
                onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-3xl font-bold font-mono text-white text-center"
                style={{
                      backdropFilter: 'blur(15px)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '16px',
                }}
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
                  <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
                  className="w-full px-4 py-4 rounded-2xl flex items-center justify-between text-white transition-all"
                style={{
                    backdropFilter: 'blur(15px)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
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
                  <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.category}
              </p>
            )}
          </div>

              {/* Date Picker */}
          <div>
                <label className="block text-white/70 text-sm mb-2">Date</label>
            <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-white rounded-2xl transition-all"
                style={{
                      backdropFilter: 'blur(15px)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
                onFocus={(e) => {
                      e.target.style.border = '2px solid #ef4444';
                }}
                onBlur={(e) => {
                      e.target.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                }}
              />
            </div>
            {errors.date && (
                  <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
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
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={3}
                  className="w-full px-4 py-4 text-white rounded-2xl resize-none transition-all placeholder:text-white/50"
              style={{
                    backdropFilter: 'blur(15px)',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
                  placeholder="Add details..."
              onFocus={(e) => {
                    e.target.style.border = '2px solid #ef4444';
              }}
              onBlur={(e) => {
                    e.target.style.border = '1px solid rgba(255, 255, 255, 0.2)';
              }}
            />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-white/50 text-xs">{notes.length}/500 characters</p>
              {errors.notes && (
                    <p className="text-red-400 text-xs flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.notes}
                </p>
              )}
            </div>
          </div>

              {/* Update Button */}
            <button
                type="submit"
                disabled={!isFormValid || saving}
                className="w-full py-4 rounded-2xl font-bold text-white text-lg transition-all active:scale-98"
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
                    <span>Updating...</span>
                  </div>
                ) : (
                  'Update Expense'
                )}
            </button>

              {/* Delete Button */}
              {onDelete && expense && (
            <button
                  type="button"
                  onClick={() => {
                    onDelete(expense);
                    onClose();
                  }}
                  className="w-full py-3 rounded-2xl font-bold text-white text-base transition-all active:scale-98"
              style={{
                    backdropFilter: 'blur(20px)',
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
              }}
            >
                  Delete Expense
            </button>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Category Bottom Sheet */}
      {showCategorySheet && (
        <div
          className="fixed inset-0 z-50 flex items-end lg:items-center justify-center"
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)',
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
                        ? 'rgba(239, 68, 68, 0.3)'
                        : 'rgba(255, 255, 255, 0.1)',
                      border: category === cat
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
      </div>
    </div>
      )}
    </>
  );
}
