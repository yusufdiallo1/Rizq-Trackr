'use client';

import { motion } from 'framer-motion';
import { fadeVariants, scaleInVariants } from '@/lib/animations';
import { PreciousMetalsConverter } from './precious-metals-converter';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { useReducedMotion } from 'framer-motion';

interface PreciousMetalsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PreciousMetalsModal({ isOpen, onClose }: PreciousMetalsModalProps) {
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Modal Overlay - Blur background with slight tint, NO BLACK */}
      <motion.div
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
        style={{
          background: theme === 'dark'
            ? 'rgba(15, 23, 42, 0.5)' // Slight dark tint
            : 'rgba(255, 255, 255, 0.5)', // Slight light tint
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          paddingTop: 'env(safe-area-inset-top, 0)',
          paddingBottom: 'env(safe-area-inset-bottom, 0)',
          paddingLeft: 'env(safe-area-inset-left, 0)',
          paddingRight: 'env(safe-area-inset-right, 0)',
        }}
        variants={prefersReducedMotion ? {} : fadeVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
      >
        {/* Modal Content */}
        <motion.div
          className="w-full max-w-2xl rounded-3xl overflow-hidden mx-4"
          style={{
            maxHeight: '90vh',
            paddingBottom: 'env(safe-area-inset-bottom, 0)',
            zIndex: 100000,
          }}
          variants={prefersReducedMotion ? {} : scaleInVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="precious-metals-modal-title"
        >
          {/* Top Bar */}
          <div 
            className="flex items-center justify-between p-6 border-b"
            style={{
              borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)',
            }}
          >
            <h2
              id="precious-metals-modal-title"
              className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
            >
              Gold Price
            </h2>
            <button
              type="button"
              onClick={onClose}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 mobile-tap-target ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}
              style={{
                backdropFilter: 'blur(10px)',
                background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)',
                border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(15, 23, 42, 0.2)',
                minWidth: '44px',
                minHeight: '44px',
              }}
              aria-label="Close precious metals converter modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 120px)' }}>
            <div className="p-6">
              <PreciousMetalsConverter />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

