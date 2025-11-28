'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { LiquidGlassUpdateNotification } from './LiquidGlassUpdateNotification';

export function LiquidGlassProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [liquidGlassEnabled, setLiquidGlassEnabled] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Check if liquid glass is enabled
    const enabled = localStorage.getItem('liquid-glass-enabled') === 'true';
    setLiquidGlassEnabled(enabled);

    // Apply liquid glass class to body
    if (enabled) {
      document.documentElement.classList.add('liquid-glass-enabled');
      document.body.classList.add('liquid-glass-enabled');
    } else {
      document.documentElement.classList.remove('liquid-glass-enabled');
      document.body.classList.remove('liquid-glass-enabled');
    }
  }, []);

  const handleUpdate = () => {
    setLiquidGlassEnabled(true);
    setShowNotification(false);
    document.documentElement.classList.add('liquid-glass-enabled');
    document.body.classList.add('liquid-glass-enabled');
  };

  const handleDismiss = () => {
    setShowNotification(false);
  };

  // Apply liquid glass styles when enabled
  useEffect(() => {
    if (liquidGlassEnabled) {
      // Add liquid glass styles to all cards, buttons, inputs, etc.
      const style = document.createElement('style');
      style.id = 'liquid-glass-styles';
      style.textContent = `
        .liquid-glass-enabled .iphone-summary-card,
        .liquid-glass-enabled .iphone-transaction-item,
        .liquid-glass-enabled [class*="card"],
        .liquid-glass-enabled [class*="Card"] {
          backdrop-filter: blur(40px) !important;
          -webkit-backdrop-filter: blur(40px) !important;
          background: ${theme === 'dark' 
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(51, 65, 85, 0.85) 100%)' 
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)'} !important;
          border: ${theme === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.15)' 
            : '1px solid rgba(255, 255, 255, 0.3)'} !important;
          box-shadow: ${theme === 'dark'
            ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
            : '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.5) inset'} !important;
        }

        .liquid-glass-enabled button,
        .liquid-glass-enabled .iphone-button {
          backdrop-filter: blur(30px) !important;
          -webkit-backdrop-filter: blur(30px) !important;
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.2) inset !important;
        }

        .liquid-glass-enabled input,
        .liquid-glass-enabled textarea,
        .liquid-glass-enabled select {
          backdrop-filter: blur(30px) !important;
          -webkit-backdrop-filter: blur(30px) !important;
          background: ${theme === 'dark'
            ? 'rgba(30, 41, 59, 0.7)'
            : 'rgba(255, 255, 255, 0.7)'} !important;
          border: ${theme === 'dark'
            ? '1px solid rgba(255, 255, 255, 0.2)'
            : '1px solid rgba(255, 255, 255, 0.4)'} !important;
          box-shadow: ${theme === 'dark'
            ? '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
            : '0 4px 20px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.5) inset'} !important;
        }

        .liquid-glass-enabled nav,
        .liquid-glass-enabled [class*="navbar"],
        .liquid-glass-enabled [class*="Navbar"] {
          backdrop-filter: blur(50px) !important;
          -webkit-backdrop-filter: blur(50px) !important;
          background: ${theme === 'dark'
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.8) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.8) 100%)'} !important;
          border-bottom: ${theme === 'dark'
            ? '1px solid rgba(255, 255, 255, 0.15)'
            : '1px solid rgba(255, 255, 255, 0.3)'} !important;
        }
      `;
      document.head.appendChild(style);

      return () => {
        const existingStyle = document.getElementById('liquid-glass-styles');
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    } else {
      const existingStyle = document.getElementById('liquid-glass-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    }
  }, [liquidGlassEnabled, theme]);

  return (
    <>
      {children}
      {!liquidGlassEnabled && (
        <LiquidGlassUpdateNotification
          onUpdate={handleUpdate}
          onDismiss={handleDismiss}
        />
      )}
    </>
  );
}

