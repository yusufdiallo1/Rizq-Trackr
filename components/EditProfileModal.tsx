'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { getTextColor, getMutedTextColor } from '@/lib/utils';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { fullName: string; phoneNumber: string }) => void;
  initialData?: {
    fullName: string;
    phoneNumber: string;
    email: string;
  };
}

export function EditProfileModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}: EditProfileModalProps) {
  const { theme } = useTheme();
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(initialData?.phoneNumber || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && initialData) {
      setFullName(initialData.fullName || '');
      setPhoneNumber(initialData.phoneNumber || '');
    }
  }, [isOpen, initialData]);

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
      await onSave({ fullName, phoneNumber });
      onClose();
    } finally {
      setSaving(false);
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className={`text-2xl font-bold ${getTextColor(theme)}`}>
            Edit Profile
          </h2>
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
        <div className="overflow-y-auto px-6 py-6" style={{ maxHeight: isMobile ? 'calc(100vh - 200px)' : '500px' }}>
          <div className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white relative"
                style={{
                  background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                }}
              >
                {fullName.charAt(0).toUpperCase() || 'U'}
                <button
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
              <p className={`text-sm ${getMutedTextColor(theme)}`}>Tap to change photo</p>
            </div>

            {/* Full Name */}
            <div>
              <label className={`block text-sm font-medium ${getTextColor(theme)} mb-2`}>
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl transition-all outline-none"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: theme === 'light' ? '#1e293b' : '#fff',
                }}
                placeholder="Enter your full name"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className={`block text-sm font-medium ${getTextColor(theme)} mb-2`}>
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-xl transition-all outline-none"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: theme === 'light' ? '#1e293b' : '#fff',
                }}
                placeholder="Optional"
              />
            </div>

            {/* Email (read-only) */}
            {initialData?.email && (
              <div>
                <label className={`block text-sm font-medium ${getTextColor(theme)} mb-2`}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={initialData.email}
                  disabled
                  className="w-full px-4 py-3 rounded-xl opacity-60 cursor-not-allowed"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: theme === 'light' ? '#1e293b' : '#fff',
                  }}
                />
              </div>
            )}
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
            disabled={saving || !fullName.trim()}
            className="flex-1 px-6 py-3 rounded-xl font-medium text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
              boxShadow: '0 4px 16px rgba(6, 182, 212, 0.4)',
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </>
  );
}

