'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { ToggleSwitch } from './ToggleSwitch';
import { getTextColor } from '@/lib/utils';

interface NotificationPreferences {
  emailNotifications: boolean;
  zakatReminders: boolean;
  monthlySummary: boolean;
  transactionAlerts: boolean;
}

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: NotificationPreferences) => Promise<void>;
  initialPreferences?: NotificationPreferences;
}

export function NotificationPreferencesModal({ 
  isOpen, 
  onClose, 
  onSave,
  initialPreferences
}: NotificationPreferencesModalProps) {
  const { theme } = useTheme();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    zakatReminders: true,
    monthlySummary: false,
    transactionAlerts: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && initialPreferences) {
      setPreferences(initialPreferences);
    }
  }, [isOpen, initialPreferences]);

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

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(preferences);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

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
          maxWidth: isMobile ? '100%' : '600px',
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
          <h2 className={`text-2xl font-bold ${getTextColor(theme)}`}>
            Notification Preferences
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
        <div className="overflow-y-auto px-6 py-6" style={{ maxHeight: isMobile ? 'calc(100vh - 200px)' : '500px' }}>
          <div className="space-y-4">
            <div 
              className="p-4 rounded-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <ToggleSwitch
                enabled={preferences.emailNotifications}
                onToggle={(enabled) => setPreferences(prev => ({ ...prev, emailNotifications: enabled }))}
                label="Email Notifications"
                description="Receive updates via email"
              />
            </div>

            <div 
              className="p-4 rounded-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <ToggleSwitch
                enabled={preferences.zakatReminders}
                onToggle={(enabled) => setPreferences(prev => ({ ...prev, zakatReminders: enabled }))}
                label="Zakat Reminders"
                description="Get reminders for Zakat payments"
              />
            </div>

            <div 
              className="p-4 rounded-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <ToggleSwitch
                enabled={preferences.monthlySummary}
                onToggle={(enabled) => setPreferences(prev => ({ ...prev, monthlySummary: enabled }))}
                label="Monthly Summary Emails"
                description="Monthly financial reports"
              />
            </div>

            <div 
              className="p-4 rounded-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <ToggleSwitch
                enabled={preferences.transactionAlerts}
                onToggle={(enabled) => setPreferences(prev => ({ ...prev, transactionAlerts: enabled }))}
                label="Transaction Alerts"
                description="Instant alerts for new transactions"
              />
            </div>
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
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-6 py-3 rounded-xl font-medium text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
              boxShadow: '0 4px 16px rgba(6, 182, 212, 0.4)',
            }}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </>
  );
}

