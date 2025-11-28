'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/contexts/ThemeContext';

interface LiquidGlassUpdatePromptProps {
  onUpdate: () => void;
  onDismiss: () => void;
}

export function LiquidGlassUpdatePrompt({ onUpdate, onDismiss }: LiquidGlassUpdatePromptProps) {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show prompt after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4"
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
        >
          <motion.div
            className="w-full max-w-md rounded-3xl overflow-hidden"
            style={{
              background: theme === 'dark'
                ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 40px rgba(59, 130, 246, 0.2)',
            }}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Liquid Glass Header */}
            <div
              className="relative p-6 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="relative z-10">
                <motion.div
                  className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  }}
                  animate={{
                    boxShadow: [
                      '0 8px 32px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                      '0 12px 40px rgba(147, 51, 234, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                      '0 8px 32px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <span className="text-4xl">✨</span>
                </motion.div>
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  New Update Available!
                </h2>
                <p className={`text-sm ${theme === 'dark' ? 'text-white/70' : 'text-slate-600'}`}>
                  Liquid Glass Theme
                </p>
              </div>
              {/* Animated background glow */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
                  animation: 'pulse 3s ease-in-out infinite',
                }}
              />
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  Experience macOS 26, iPadOS 26 & iOS 26 Style
                </h3>
                <ul className={`space-y-2 text-sm ${theme === 'dark' ? 'text-white/80' : 'text-slate-600'}`}>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>Liquid glass morphism design</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">•</span>
                    <span>Enhanced depth and transparency</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    <span>Smooth animations and transitions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-pink-400">•</span>
                    <span>Modern Apple-inspired aesthetics</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  onClick={onDismiss}
                  className="flex-1 px-4 py-3 rounded-2xl font-semibold transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: theme === 'dark' ? 'white' : '#1e293b',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Later
                </motion.button>
                <motion.button
                  onClick={onUpdate}
                  className="flex-1 px-4 py-3 rounded-2xl font-semibold text-white transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                  }}
                  whileHover={{ scale: 1.02, boxShadow: '0 6px 30px rgba(59, 130, 246, 0.6)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  Update Now
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

