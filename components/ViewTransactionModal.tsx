'use client';

import { useEffect } from 'react';
import { Transaction } from '@/lib/transactions';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { getTextColor, getMutedTextColor } from '@/lib/utils';

interface ViewTransactionModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export function ViewTransactionModal({
  isOpen,
  transaction,
  onClose,
  onEdit,
  onDelete,
}: ViewTransactionModalProps) {
  const { theme } = useTheme();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !transaction) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640;
  const isTablet = typeof window !== 'undefined' && window.innerWidth > 640 && window.innerWidth <= 1024;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          opacity: 0.9,
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
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 mobile-tap-target"
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

        {/* Header */}
        <div className="text-center pt-8 pb-6 px-6">
          <h2 className={`text-2xl font-bold ${getTextColor(theme)} mb-2`}>
            Transaction Details
          </h2>
        </div>

        {/* Large Amount Display */}
        <div className="text-center px-6 mb-6">
          <p
            className="text-6xl font-bold font-mono mb-2"
            style={{
              color: transaction.type === 'income' ? '#10b981' : '#ef4444',
              textShadow: `0 4px 20px ${transaction.type === 'income' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            }}
          >
            {transaction.type === 'income' ? '+' : '-'}
            {formatCurrency(transaction.amount)}
          </p>
          <span
            className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold"
            style={{
              background: transaction.type === 'income'
                ? 'rgba(16, 185, 129, 0.2)'
                : 'rgba(239, 68, 68, 0.2)',
              color: transaction.type === 'income' ? '#10b981' : '#ef4444',
              backdropFilter: 'blur(10px)',
            }}
          >
            {transaction.type === 'income' ? 'Income' : 'Expense'}
          </span>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 pb-6" style={{ maxHeight: isMobile ? 'calc(100vh - 400px)' : '400px' }}>
          {/* Info Cards */}
          <div className="space-y-4">
            {/* Category Card */}
            <div
              className="p-4 rounded-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{
                    background: 'rgba(6, 182, 212, 0.2)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  📁
                </div>
                <div>
                  <p className={`text-xs ${getMutedTextColor(theme)} opacity-70 mb-1`}>Category</p>
                  <p className={`font-bold ${getTextColor(theme)}`}>{transaction.category}</p>
                </div>
              </div>
          </div>

            {/* Date Card */}
            <div
              className="p-4 rounded-2xl"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(6, 182, 212, 0.2)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-xs ${getMutedTextColor(theme)} opacity-70 mb-1`}>Date</p>
                  <p className={`font-bold ${getTextColor(theme)}`}>{formatDate(transaction.date)}</p>
          </div>
          </div>
            </div>

            {/* Notes Card */}
          {transaction.notes && (
              <div
                className="p-4 rounded-2xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <p className={`text-xs ${getMutedTextColor(theme)} opacity-70 mb-2`}>Notes</p>
                <p className={`${getTextColor(theme)} whitespace-pre-wrap`}>{transaction.notes}</p>
            </div>
          )}

            {/* Zakatable Status */}
          {transaction.type === 'income' && transaction.is_zakatable !== undefined && (
              <div
                className="p-4 rounded-2xl"
                style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: 'rgba(245, 158, 11, 0.2)',
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <span className="text-2xl">🕌</span>
                  </div>
                  <div>
                    <p className={`text-xs ${getMutedTextColor(theme)} opacity-70 mb-1`}>Zakat Status</p>
                    <p className={`font-bold ${getTextColor(theme)}`}>
                      {transaction.is_zakatable ? 'Zakatable' : 'Not Zakatable'}
                    </p>
                  </div>
                </div>
            </div>
          )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 pt-4 space-y-3 border-t border-white/10">
          <button
            onClick={() => onEdit(transaction)}
            className="w-full px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)',
            }}
          >
            Edit Transaction
          </button>
          <button
            onClick={() => {
              onDelete(transaction);
              onClose();
            }}
            className="w-full px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
            }}
          >
            Delete Transaction
          </button>
        </div>
      </div>
    </>
  );
}
