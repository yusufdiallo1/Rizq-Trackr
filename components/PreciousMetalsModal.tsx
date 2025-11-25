'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { fadeVariants } from '@/lib/animations';
import { PreciousMetalsConverter } from './precious-metals-converter';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { useReducedMotion } from 'framer-motion';

interface PreciousMetalsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Modal enter/exit animations
const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    filter: 'blur(10px)',
  },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    filter: 'blur(5px)',
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function PreciousMetalsModal({ isOpen, onClose }: PreciousMetalsModalProps) {
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const isDark = theme === 'dark';

  return (
    <AnimatePresence>
      {isOpen && (
    <>
      {/* Modal Overlay - Blur background with slight tint, NO BLACK */}
      <motion.div
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
        style={{
              background: 'transparent', // No black overlay
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
                background: isDark ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(15, 23, 42, 0.1)',
                boxShadow: isDark ? '0 20px 60px rgba(0, 0, 0, 0.5)' : '0 20px 60px rgba(0, 0, 0, 0.2)',
          }}
              variants={prefersReducedMotion ? {} : modalVariants}
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
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)',
            }}
          >
            <h2
              id="precious-metals-modal-title"
                  className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              Precious Metals Converter
            </h2>
                <motion.button
              type="button"
              onClick={onClose}
                  className={`w-11 h-11 rounded-full flex items-center justify-center mobile-tap-target relative ${
                    isDark ? 'text-white' : 'text-slate-900'
              }`}
              style={{
                backdropFilter: 'blur(10px)',
                    background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(15, 23, 42, 0.2)',
                minWidth: '44px',
                minHeight: '44px',
              }}
                  whileHover={prefersReducedMotion ? {} : { rotate: 90, scale: 1.1 }}
                  whileTap={prefersReducedMotion ? {} : { rotate: 180, scale: 0.95 }}
              aria-label="Close precious metals converter modal"
            >
                  {/* Background circle on hover */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                  <svg
                    className="w-6 h-6 relative z-10"
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
                </motion.button>
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
      )}
    </AnimatePresence>
  );
}

