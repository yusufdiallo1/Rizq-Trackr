'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { PINKeypad } from './PINKeypad';
import { PINDots } from './PINDots';
import { getTextColor, getMutedTextColor } from '@/lib/utils';

interface ChangePINModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newPIN: string) => Promise<void>;
}

export function ChangePINModal({ 
  isOpen, 
  onClose, 
  onSave 
}: ChangePINModalProps) {
  const { theme } = useTheme();
  const [currentPIN, setCurrentPIN] = useState('');
  const [newPIN, setNewPIN] = useState('');
  const [confirmPIN, setConfirmPIN] = useState('');
  const [step, setStep] = useState<'current' | 'new' | 'confirm'>('current');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      // Reset form when closing
      setCurrentPIN('');
      setNewPIN('');
      setConfirmPIN('');
      setStep('current');
      setError('');
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleNumberClick = (number: string) => {
    setError('');
    if (step === 'current') {
      if (currentPIN.length < 4) {
        setCurrentPIN(prev => prev + number);
      }
    } else if (step === 'new') {
      if (newPIN.length < 4) {
        setNewPIN(prev => prev + number);
      }
    } else if (step === 'confirm') {
      if (confirmPIN.length < 4) {
        setConfirmPIN(prev => prev + number);
      }
    }
  };

  const handleBackspace = () => {
    if (step === 'current') {
      setCurrentPIN(prev => prev.slice(0, -1));
    } else if (step === 'new') {
      setNewPIN(prev => prev.slice(0, -1));
    } else if (step === 'confirm') {
      setConfirmPIN(prev => prev.slice(0, -1));
    }
  };

  useEffect(() => {
    if (step === 'current' && currentPIN.length === 4) {
      // Validate current PIN (you'll need to implement this)
      // For now, just move to next step
      setTimeout(() => {
        setStep('new');
        setCurrentPIN('');
      }, 500);
    } else if (step === 'new' && newPIN.length === 4) {
      setTimeout(() => {
        setStep('confirm');
        setNewPIN('');
      }, 500);
    } else if (step === 'confirm' && confirmPIN.length === 4) {
      if (confirmPIN === newPIN) {
        handleSave();
      } else {
        setError('PINs do not match');
        setConfirmPIN('');
        setStep('new');
      }
    }
  }, [currentPIN, newPIN, confirmPIN, step]);

  const handleSave = async () => {
    if (newPIN !== confirmPIN) {
      setError('PINs do not match');
      return;
    }

    if (newPIN.length !== 4) {
      setError('PIN must be 4 digits');
      return;
    }

    setSaving(true);
    try {
      await onSave(newPIN);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update PIN');
      setStep('current');
      setCurrentPIN('');
      setNewPIN('');
      setConfirmPIN('');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640;
  const isTablet = typeof window !== 'undefined' && window.innerWidth > 640 && window.innerWidth <= 1024;
  const currentValue = step === 'current' ? currentPIN : step === 'new' ? newPIN : confirmPIN;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          opacity: 0.95,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          paddingTop: 'env(safe-area-inset-top, 0)',
          paddingBottom: 'env(safe-area-inset-bottom, 0)',
        }}
        onClick={onClose}
      />

      {/* Modal - Mobile: full screen, Tablet: centered, Desktop: centered */}
      <div
        className={`fixed z-50 transition-all duration-300 ${
          isMobile 
            ? 'inset-0 mobile-modal' 
            : isTablet
            ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 tablet-modal'
            : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
        }`}
        style={{
          maxWidth: isMobile ? '100%' : isTablet ? '500px' : '500px',
          width: isMobile ? '100%' : 'calc(100% - 2rem)',
          maxHeight: isMobile ? '100vh' : '90vh',
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
          <h2 className={`text-2xl font-bold ${getTextColor(theme)}`}>
            {step === 'current' ? 'Enter Current PIN' : step === 'new' ? 'Enter New PIN' : 'Confirm New PIN'}
          </h2>
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
        <div className="px-6 py-8">
          <div className="space-y-8">
            {/* Error Message */}
            {error && (
              <div 
                className="p-4 rounded-xl text-center"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* PIN Dots */}
            <div className="flex justify-center">
              <PINDots length={6} filled={currentValue.length} />
            </div>

            {/* Instructions */}
            <div className="text-center">
              <p className={`text-sm ${getMutedTextColor(theme)}`}>
                {step === 'current' 
                  ? 'Enter your current PIN to continue'
                  : step === 'new'
                  ? 'Enter a new 4-digit PIN'
                  : 'Confirm your new PIN'}
              </p>
            </div>

            {/* PIN Keypad */}
            <div className="flex justify-center">
              <PINKeypad
                onNumberClick={handleNumberClick}
                onBackspace={handleBackspace}
                disabled={saving}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

