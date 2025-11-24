'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { useHaptic } from '@/hooks/useHaptic';
import { motion, AnimatePresence } from 'framer-motion';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: string;
  showHandle?: boolean;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = '90vh',
  showHandle = true,
}: BottomSheetProps) {
  const { theme } = useTheme();
  const { lightTap } = useHaptic();
  const isDark = theme === 'dark';
  const sheetRef = useRef<HTMLDivElement>(null);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Handle swipe to dismiss
  useEffect(() => {
    if (!isOpen) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (sheetRef.current && e.touches[0].clientY < sheetRef.current.offsetTop + 50) {
        setStartY(e.touches[0].clientY);
        setIsDragging(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const current = e.touches[0].clientY;
      const diff = current - startY;
      if (diff > 0) {
        setCurrentY(diff);
      }
    };

    const handleTouchEnd = () => {
      if (currentY > 100) {
        lightTap();
        onClose();
      }
      setIsDragging(false);
      setCurrentY(0);
      setStartY(0);
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, isDragging, startY, currentY, onClose, lightTap]);

  // Prevent body scroll when open
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

  // Keyboard handling
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const sheetVariants = {
    hidden: {
      y: '100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    visible: {
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="iphone-bottom-sheet-overlay open"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Bottom Sheet */}
          <motion.div
            ref={sheetRef}
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className={`iphone-bottom-sheet ${isOpen ? 'open' : ''}`}
            style={{
              transform: isDragging ? `translateY(${currentY}px)` : undefined,
              maxHeight,
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'bottom-sheet-title' : undefined}
          >
            {showHandle && <div className="iphone-bottom-sheet-handle" />}

            {title && (
              <div className="iphone-bottom-sheet-header">
                <h2 id="bottom-sheet-title" className="iphone-bottom-sheet-title">
                  {title}
                </h2>
                <button
                  onClick={() => {
                    lightTap();
                    onClose();
                  }}
                  className="iphone-bottom-sheet-close"
                  aria-label="Close"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            )}

            <div className="iphone-bottom-sheet-content">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

