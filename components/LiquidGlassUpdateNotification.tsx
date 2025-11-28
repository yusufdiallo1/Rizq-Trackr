'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/contexts/ThemeContext';

interface LiquidGlassUpdateNotificationProps {
  onUpdate: () => void;
  onDismiss: () => void;
}

const LIQUID_GLASS_VERSION = '1.0.0';
const STORAGE_KEY = 'liquid-glass-update-dismissed';
const DELAY_KEY = 'liquid-glass-update-delay-time';

export function LiquidGlassUpdateNotification({ onUpdate, onDismiss }: LiquidGlassUpdateNotificationProps) {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if liquid glass is already enabled
    const enabled = localStorage.getItem('liquid-glass-enabled') === 'true';
    if (enabled) {
      setIsDismissed(true);
      return;
    }

    // Check if user has permanently dismissed this update
    const dismissed = localStorage.getItem(`${STORAGE_KEY}-${LIQUID_GLASS_VERSION}`);
    if (dismissed === 'permanent') {
      setIsDismissed(true);
      return;
    }

    // Check if there's a scheduled delay time
    const delayTime = localStorage.getItem(DELAY_KEY);
    if (delayTime) {
      const delayTimestamp = parseInt(delayTime, 10);
      const now = Date.now();
      
      if (now < delayTimestamp) {
        // Still waiting for the delay period
        const remainingTime = delayTimestamp - now;
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, remainingTime);
        return () => clearTimeout(timer);
      } else {
        // Delay period has passed, show notification
        localStorage.removeItem(DELAY_KEY);
        setIsVisible(true);
        return;
      }
    }

    // No delay set, show immediately
    setIsVisible(true);
  }, []);

  const handleUpdate = () => {
    localStorage.setItem('liquid-glass-enabled', 'true');
    localStorage.setItem(`${STORAGE_KEY}-${LIQUID_GLASS_VERSION}`, 'permanent');
    localStorage.removeItem(DELAY_KEY);
    setIsVisible(false);
    onUpdate();
    // Reload to apply theme
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const handleMaybeLater = () => {
    // Schedule notification for 3 hours later
    const threeHoursLater = Date.now() + (3 * 60 * 60 * 1000);
    localStorage.setItem(DELAY_KEY, threeHoursLater.toString());
    setIsVisible(false);
    setIsDismissed(true);
    onDismiss();
  };

  if (isDismissed || !isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[99998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            style={{
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          />
          
          {/* Notification Card */}
          <motion.div
            className="fixed inset-x-4 top-4 z-[99999] mx-auto max-w-md"
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              background: theme === 'dark'
                ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.8) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
              border: theme === 'dark'
                ? '1px solid rgba(255, 255, 255, 0.2)'
                : '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '24px',
              boxShadow: theme === 'dark'
                ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                : '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
              padding: '24px',
              paddingTop: 'calc(24px + env(safe-area-inset-top, 0px))',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Icon */}
            <div className="flex items-start gap-4 mb-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
                }}
              >
                <svg
                  className="w-7 h-7 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className={`text-xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  New Update Available!
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>
                  Liquid Glass Theme
                </p>
              </div>
              
              <button
                type="button"
                onClick={handleDismiss}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
                style={{
                  background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)',
                }}
              >
                <svg
                  className={`w-5 h-5 ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}
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

            {/* Description */}
            <p className={`text-sm mb-6 leading-relaxed ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}>
              Experience the stunning new <strong>Liquid Glass</strong> theme inspired by macOS 26, iPadOS 26, and iOS 26. 
              Enjoy beautiful frosted glass effects, vibrant colors, and enhanced depth throughout the app.
            </p>

            {/* Features List */}
            <div className="space-y-2 mb-6">
              {[
                'Frosted glass blur effects',
                'Vibrant gradient backgrounds',
                'Enhanced depth and shadows',
                'Smooth animations',
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-blue-400 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className={`text-xs ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleMaybeLater}
                className="flex-1 px-4 py-3 rounded-xl font-medium transition-all active:scale-95"
                style={{
                  background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                  border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)',
                  color: theme === 'dark' ? 'white' : 'slate-900',
                }}
              >
                Maybe Later
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-white transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
                }}
              >
                Update
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

