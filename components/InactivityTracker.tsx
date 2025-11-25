'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth';
import { useTheme } from '@/lib/contexts/ThemeContext';

const INACTIVITY_TIMEOUT = 2 * 60 * 1000; // 2 minutes in milliseconds
const COUNTDOWN_DURATION = 1 * 60 * 1000; // 1 minute in milliseconds

export function InactivityTracker() {
  const router = useRouter();
  const { theme } = useTheme();
  const [showCountdown, setShowCountdown] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const resetActivity = useCallback(() => {
    setLastActivity(Date.now());
    setShowCountdown(false);
    setSecondsLeft(60);
  }, []);

  const handleStillHere = useCallback(() => {
    resetActivity();
  }, [resetActivity]);

  const handleLogout = useCallback(async () => {
    setShowCountdown(false);
    await signOut();
    router.push('/login');
  }, [router]);

  // Track user activity
  useEffect(() => {
    const events = ['mousedown', 'click', 'keypress', 'scroll', 'touchstart', 'mousemove'];

    events.forEach(event => {
      window.addEventListener(event, resetActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetActivity);
      });
    };
  }, [resetActivity]);

  // Check for inactivity
  useEffect(() => {
    const checkInactivity = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;

      // If 2 minutes of inactivity, show countdown
      if (timeSinceLastActivity >= INACTIVITY_TIMEOUT && !showCountdown) {
        setShowCountdown(true);
        setSecondsLeft(60);
      }

      // If in countdown mode, update seconds
      if (showCountdown) {
        const timeInCountdown = now - (lastActivity + INACTIVITY_TIMEOUT);
        const remaining = Math.max(0, Math.ceil((COUNTDOWN_DURATION - timeInCountdown) / 1000));
        setSecondsLeft(remaining);

        // If countdown reached 0, logout
        if (remaining === 0) {
          handleLogout();
        }
      }
    }, 1000); // Check every second

    return () => clearInterval(checkInactivity);
  }, [lastActivity, showCountdown, handleLogout]);

  if (!showCountdown) return null;

  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4"
      style={{
        background: theme === 'dark'
          ? 'rgba(15, 23, 42, 0.8)'
          : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div
        className="rounded-3xl p-8 max-w-md w-full text-center"
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          background: theme === 'dark'
            ? 'rgba(30, 41, 59, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          border: theme === 'dark'
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(15, 23, 42, 0.1)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Icon */}
        <div className="mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(234, 179, 8, 0.2))',
              border: '2px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            <span className="text-4xl">⏰</span>
          </div>
        </div>

        {/* Title */}
        <h2
          className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
        >
          Still Here?
        </h2>

        {/* Message */}
        <p
          className={`text-lg mb-6 ${theme === 'dark' ? 'text-white/80' : 'text-slate-700'}`}
        >
          You've been inactive for a while. You'll be logged out in:
        </p>

        {/* Countdown */}
        <div
          className="text-6xl font-bold mb-8"
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #eab308)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {secondsLeft}s
        </div>

        {/* Check Button */}
        <button
          onClick={handleStillHere}
          className="w-full py-4 rounded-2xl font-semibold text-white text-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
          }}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Yes, I'm Still Here
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`w-full py-3 mt-3 rounded-2xl font-medium text-sm transition-all hover:scale-105 active:scale-95 ${
            theme === 'dark'
              ? 'text-white/60 hover:text-white/80'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          Log Out Now
        </button>
      </div>
    </div>
  );
}
