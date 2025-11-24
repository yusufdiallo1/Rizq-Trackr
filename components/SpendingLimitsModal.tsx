'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SpendingLimit,
  getSpendingLimits,
  saveSpendingLimit,
  deleteSpendingLimit,
  toggleSpendingLimit,
  getSpendingProgress,
} from '@/lib/spending-limits';

interface SpendingLimitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const categories = [
  { value: null, label: 'All Categories (Total)' },
  { value: 'Housing', label: 'Housing' },
  { value: 'Food', label: 'Food' },
  { value: 'Transport', label: 'Transport' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Education', label: 'Education' },
  { value: 'Charity', label: 'Charity' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Bills', label: 'Bills' },
  { value: 'Other', label: 'Other' },
];

const periods = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export function SpendingLimitsModal({ isOpen, onClose, userId }: SpendingLimitsModalProps) {
  const [limits, setLimits] = useState<SpendingLimit[]>([]);
  const [progress, setProgress] = useState<Array<{
    limit: SpendingLimit;
    currentSpending: number;
    percentage: number;
    remaining: number;
  }>>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [category, setCategory] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [notifyAt, setNotifyAt] = useState('80');

  useEffect(() => {
    if (isOpen && userId) {
      loadLimits();
    }
  }, [isOpen, userId]);

  const loadLimits = async () => {
    setLoading(true);
    const storedLimits = getSpendingLimits(userId);
    setLimits(storedLimits);

    const progressData = await getSpendingProgress(userId);
    setProgress(progressData);
    setLoading(false);
  };

  const handleSave = () => {
    if (!amount || parseFloat(amount) <= 0) return;

    saveSpendingLimit(userId, {
      category,
      limit_amount: parseFloat(amount),
      period,
      notify_at_percentage: parseInt(notifyAt),
      is_active: true,
    });

    // Reset form
    setCategory(null);
    setAmount('');
    setPeriod('monthly');
    setNotifyAt('80');
    setShowAddForm(false);

    loadLimits();
  };

  const handleDelete = (limitId: string) => {
    deleteSpendingLimit(userId, limitId);
    loadLimits();
  };

  const handleToggle = (limitId: string) => {
    toggleSpendingLimit(userId, limitId);
    loadLimits();
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return '#ef4444'; // red
    if (percentage >= 80) return '#f59e0b'; // amber
    return '#10b981'; // emerald
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end lg:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl lg:rounded-3xl bg-slate-900 border border-slate-700"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold text-white">Spending Limits</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Description */}
            <p className="text-slate-400 text-sm">
              Set spending limits and get notified when you&apos;re approaching or exceeding them.
            </p>

            {/* Current Limits */}
            {limits.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Your Limits</h3>
                {progress.map(({ limit, currentSpending, percentage, remaining }) => (
                  <div
                    key={limit.id}
                    className="bg-slate-800 rounded-2xl p-4 border border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-white">
                          {limit.category || 'All Categories'}
                        </p>
                        <p className="text-sm text-slate-400">
                          {limit.period.charAt(0).toUpperCase() + limit.period.slice(1)} limit
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggle(limit.id)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            limit.is_active ? 'bg-emerald-500' : 'bg-slate-600'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white transition-transform ${
                              limit.is_active ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => handleDelete(limit.id)}
                          className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/20"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">
                          ${currentSpending.toFixed(2)} spent
                        </span>
                        <span className="text-slate-400">
                          ${limit.limit_amount.toFixed(2)} limit
                        </span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: getProgressColor(percentage),
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span
                        className={`font-medium ${
                          percentage >= 100
                            ? 'text-red-400'
                            : percentage >= 80
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {percentage.toFixed(0)}% used
                      </span>
                      <span className="text-slate-400">
                        ${remaining.toFixed(2)} remaining
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-2">
                      Notify at {limit.notify_at_percentage}% of limit
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Limit Form */}
            {showAddForm ? (
              <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 space-y-4">
                <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">New Limit</h3>

                {/* Category */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Category</label>
                  <select
                    value={category || ''}
                    onChange={(e) => setCategory(e.target.value || null)}
                    className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 border border-slate-600 focus:border-emerald-500 focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.label} value={cat.value || ''}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Limit Amount ($)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="500.00"
                    className="w-full bg-slate-700 text-white rounded-xl px-4 py-3 border border-slate-600 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Period */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Period</label>
                  <div className="grid grid-cols-4 gap-2">
                    {periods.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => setPeriod(p.value as typeof period)}
                        className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                          period === p.value
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notify At */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Notify at {notifyAt}% of limit
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    value={notifyAt}
                    onChange={(e) => setNotifyAt(e.target.value)}
                    className="w-full accent-emerald-500"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-3 rounded-xl bg-slate-700 text-slate-300 font-medium hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!amount || parseFloat(amount) <= 0}
                    className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Limit
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-600 text-slate-400 hover:border-emerald-500 hover:text-emerald-500 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Spending Limit
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
