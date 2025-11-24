import { useState } from 'react';

interface SavingsGoalFormProps {
  onSave: (goalName: string, targetAmount: number) => void;
}

export function SavingsGoalForm({ onSave }: SavingsGoalFormProps) {
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSave(goalName.trim(), parseFloat(targetAmount));

    // Reset form
    setGoalName('');
    setTargetAmount('');
    setErrors({});
  };

  const isFormValid = goalName.trim() && targetAmount && parseFloat(targetAmount) >= 1;

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      marginBottom: '30px',
    }}>
      <h3 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: '500' }}>
        Add Savings Goal
      </h3>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
              Goal Name *
            </label>
            <input
              type="text"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              maxLength={100}
              placeholder="e.g., Emergency Fund"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
            {errors.goalName && (
              <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                {errors.goalName}
              </p>
            )}
            <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              {goalName.length}/100 characters
            </p>
          </div>

          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
              Target Amount *
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="e.g., 5000"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
            {errors.targetAmount && (
              <p style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
                {errors.targetAmount}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              type="submit"
              disabled={!isFormValid}
              style={{
                padding: '9px 20px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: isFormValid ? '#0070f3' : '#ccc',
                color: 'white',
                cursor: isFormValid ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Save Goal
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
