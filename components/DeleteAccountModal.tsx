'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { getTextColor, getMutedTextColor } from '@/lib/utils';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteAccountModal({ 
  isOpen, 
  onClose, 
  onConfirm 
}: DeleteAccountModalProps) {
  const { theme } = useTheme();
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const CONFIRM_TEXT = 'DELETE';

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setConfirmText('');
      setError('');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleConfirm = async () => {
    if (confirmText !== CONFIRM_TEXT) {
      setError(`Please type "${CONFIRM_TEXT}" to confirm`);
      return;
    }

    setDeleting(true);
    setError('');
    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640;
  const isTablet = typeof window !== 'undefined' && window.innerWidth > 640 && window.innerWidth <= 1024;

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
          maxWidth: isMobile ? '100%' : isTablet ? '600px' : '600px',
          width: isMobile ? '100%' : 'calc(100% - 2rem)',
          maxHeight: isMobile ? '100vh' : '90vh',
          background: theme === 'dark'
            ? 'rgba(15, 23, 42, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          borderRadius: isMobile ? '0' : '24px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 0)' : '0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-red-500/20">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className={`text-2xl font-bold ${getTextColor(theme)}`}>
              Delete Account
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 mobile-tap-target"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              minWidth: '44px',
              minHeight: '44px',
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-6" style={{ maxHeight: isMobile ? 'calc(100vh - 300px)' : '500px' }}>
          <div className="space-y-6">
            {/* Warning Message */}
            <div 
              className="p-6 rounded-xl"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <p className={`text-lg font-semibold text-red-400 mb-2`}>
                ⚠️ This action cannot be undone
              </p>
              <p className={`text-sm ${getMutedTextColor(theme)}`}>
                Deleting your account will permanently remove all your data including:
              </p>
              <ul className={`text-sm ${getMutedTextColor(theme)} mt-3 space-y-1 list-disc list-inside`}>
                <li>All income and expense records</li>
                <li>Savings goals and progress</li>
                <li>Zakat payment history</li>
                <li>Account settings and preferences</li>
              </ul>
            </div>

            {/* Error Message */}
            {error && (
              <div 
                className="p-4 rounded-xl"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Confirmation Input */}
            <div>
              <label className={`block text-sm font-medium ${getTextColor(theme)} mb-2`}>
                Type <span className="font-mono font-bold">{CONFIRM_TEXT}</span> to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => {
                  setConfirmText(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 rounded-xl transition-all outline-none font-mono"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(15px)',
                  border: confirmText === CONFIRM_TEXT 
                    ? '1px solid rgba(239, 68, 68, 0.5)' 
                    : '1px solid rgba(255, 255, 255, 0.2)',
                  color: theme === 'light' ? '#1e293b' : '#fff',
                }}
                placeholder={CONFIRM_TEXT}
                autoComplete="off"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-red-500/20 flex gap-4">
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
            disabled={deleting || confirmText !== CONFIRM_TEXT}
            className="flex-1 px-6 py-3 rounded-xl font-medium text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              boxShadow: '0 4px 16px rgba(239, 68, 68, 0.4)',
            }}
          >
            {deleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </>
  );
}

