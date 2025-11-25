import { useState, useEffect } from 'react';
import { SavingsGoal } from '@/lib/savings';

interface EditSavingsGoalModalProps {
  isOpen: boolean;
  goal: SavingsGoal | null;
  onClose: () => void;
  onUpdate: (id: string, data: { goalName: string; targetAmount: number; icon?: string; targetDate?: string }) => void;
  onDelete: (goal: SavingsGoal) => void;
}

const GOAL_ICONS = ['🏠', '🚗', '✈️', '💍', '📚', '🏥', '🕌', '💰', '🎓', '🎁', '💻', '🏖️'];

export function EditSavingsGoalModal({
  isOpen,
  goal,
  onClose,
  onUpdate,
  onDelete,
}: EditSavingsGoalModalProps) {
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(GOAL_ICONS[0]);
  const [targetDate, setTargetDate] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (goal) {
      setGoalName(goal.goal_name);
      setTargetAmount(goal.target_amount.toString());
      // Use saved icon if available, otherwise default to first icon
      setSelectedIcon(goal.icon || GOAL_ICONS[0]);
      setTargetDate(goal.target_date || '');
    }
  }, [goal]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!goalName.trim()) {
      newErrors.goalName = 'Goal name is required';
    } else if (goalName.length > 100) {
      newErrors.goalName = 'Goal name cannot exceed 100 characters';
    }

    if (!targetAmount || parseFloat(targetAmount) < 1) {
      newErrors.targetAmount = 'Target amount must be at least $1';
    }

    if (targetDate && new Date(targetDate) < new Date()) {
      newErrors.targetDate = 'Target date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !goal) {
      return;
    }

    onUpdate(goal.id, {
      goalName: goalName.trim(),
      targetAmount: parseFloat(targetAmount),
      icon: selectedIcon,
      targetDate: targetDate || undefined,
    });
  };

  const handleCancel = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen || !goal) return null;

  const isFormValid = goalName.trim() && targetAmount && parseFloat(targetAmount) >= 1;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      onClick={handleCancel}
      style={{
        background: 'transparent',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        paddingTop: 'env(safe-area-inset-top, 0)',
        paddingBottom: 'env(safe-area-inset-bottom, 0)',
        paddingLeft: 'env(safe-area-inset-left, 0)',
        paddingRight: 'env(safe-area-inset-right, 0)',
        zIndex: 99999,
      }}
    >
      <div
        className="w-full max-w-lg rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto mx-4"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)',
          paddingBottom: 'env(safe-area-inset-bottom, 0)',
          zIndex: 100000,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Handle */}
        <div className="lg:hidden flex justify-center pt-4 pb-2">
          <div className="w-12 h-1.5 rounded-full bg-white/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-heading font-bold text-white">Edit Goal</h2>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 tablet:p-8 space-y-5 mobile-form mobile-modal-content">
          {/* Goal Name */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">
              Goal Name *
            </label>
            <input
              type="text"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              maxLength={100}
              placeholder="Emergency Fund, New Car, Hajj..."
              className="w-full px-4 py-3 rounded-2xl transition-all text-white placeholder:text-white/50 mobile-input tablet-input"
              style={{
                backdropFilter: 'blur(15px)',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                minHeight: '48px',
                fontSize: '16px',
              }}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-white/50">{goalName.length}/100 characters</p>
              {errors.goalName && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.goalName}
                </p>
              )}
            </div>
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">
              Target Amount *
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 font-semibold text-lg">
                $
              </div>
              <input
                type="number"
                step="0.01"
                min="1"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="5000"
                className="w-full pl-12 pr-4 py-3 text-lg font-mono rounded-2xl transition-all text-white placeholder:text-white/50 mobile-input tablet-input"
                style={{
                  backdropFilter: 'blur(15px)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  minHeight: '48px',
                  fontSize: '16px',
                }}
                inputMode="decimal"
              />
            </div>
            {errors.targetAmount && (
              <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.targetAmount}
              </p>
            )}
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">
              Goal Icon (Optional)
            </label>
            <div 
              className="grid grid-cols-6 gap-2 p-3 rounded-2xl"
              style={{
                backdropFilter: 'blur(15px)',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              {GOAL_ICONS.map((icon, idx) => (
                <button
                  key={`${icon}-${idx}`}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedIcon(icon);
                  }}
                  className={`w-12 h-12 text-2xl rounded-xl transition-all flex items-center justify-center ${
                    selectedIcon === icon
                      ? 'bg-cyan-400/30 scale-110 shadow-lg border-2 border-cyan-400/50'
                      : 'bg-white/10 hover:bg-white/15 hover:scale-105 border border-white/20'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">
              Target Date (Optional)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 rounded-2xl transition-all text-white"
              style={{
                backdropFilter: 'blur(15px)',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            />
            {errors.targetDate && (
              <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.targetDate}
              </p>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-6 py-3 rounded-2xl font-medium text-white transition-all active:scale-95"
              style={{
                backdropFilter: 'blur(15px)',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className={`flex-1 px-6 py-3 rounded-2xl font-medium text-white transition-all active:scale-95 ${
                isFormValid
                  ? 'shadow-xl hover:shadow-2xl'
                  : 'opacity-50 cursor-not-allowed'
              }`}
              style={{
                background: isFormValid 
                  ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                  : 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              Update Goal
            </button>
            <button
              type="button"
              onClick={() => {
                if (goal) {
                  onClose();
                  onDelete(goal);
                }
              }}
              className="px-4 py-3 rounded-2xl font-medium text-red-400 transition-all active:scale-95"
              style={{
                backdropFilter: 'blur(15px)',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
