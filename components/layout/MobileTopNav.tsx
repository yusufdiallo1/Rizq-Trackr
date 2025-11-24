'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { useMemo, useState, useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth';

interface MobileTopNavProps {
  onMenuClick: () => void;
  notificationCount?: number;
  isAuthenticated?: boolean;
  hideHamburger?: boolean;
}

export function MobileTopNav({ onMenuClick, notificationCount = 3, isAuthenticated: propIsAuthenticated, hideHamburger = false }: MobileTopNavProps) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(propIsAuthenticated ?? true);
  const [isScrolled, setIsScrolled] = useState(false);

  const isDark = theme === 'dark';

  // Detect scroll for glass effect enhancement
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check authentication status
  useEffect(() => {
    if (propIsAuthenticated !== undefined) {
      setIsAuthenticated(propIsAuthenticated);
      return;
    }
    
    let isMounted = true;
    
    const checkAuth = async () => {
      if (!isMounted) return;
      const user = await getCurrentUser();
      if (isMounted) {
        setIsAuthenticated(!!user);
      }
    };
    
    checkAuth();
    const interval = setInterval(checkAuth, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [propIsAuthenticated]);

  const handleMenuClick = () => {
    // Haptic feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(5);
    }
    onMenuClick?.();
  };

  // Page title based on route
  const pageTitle = useMemo(() => {
    const titles: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/income': 'Income',
      '/expenses': 'Expenses',
      '/savings': 'Savings',
      '/zakat': 'Zakat',
      '/transactions': 'Transactions',
      '/analytics': 'Analytics',
      '/settings': 'Settings',
      '/profile': 'Profile',
      '/notifications': 'Notifications',
      '/privacy': 'Privacy',
      '/terms': 'Terms',
      '/contact': 'Contact',
      '/help': 'Help',
    };
    return titles[pathname] || 'Rizq Trackr';
  }, [pathname]);

  return (
    <header
      className={`iphone-navbar iphone-navbar-glass lg:hidden ${isScrolled ? 'shadow-md' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        paddingTop: `max(env(safe-area-inset-top, 0px), 0px)`,
        height: `calc(44px + max(env(safe-area-inset-top, 0px), 0px))`,
        minHeight: '44px',
      }}
    >
      <div 
        className="flex items-center justify-between w-full"
        style={{
          height: '44px',
          paddingLeft: 'max(1rem, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(1rem, env(safe-area-inset-right, 0px))',
        }}
      >
        {!isAuthenticated ? (
          <>
            {/* Unauthenticated: Login button */}
            <Link
              href="/login"
              className={`iphone-navbar-icon px-3 text-sm font-medium ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
              style={{ width: 'auto', minWidth: '44px' }}
            >
              Login
            </Link>

            {/* Center: App Logo & Name */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className={`iphone-navbar-title ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Rizq Trackr
              </span>
            </div>

            {/* Right: Sign Up */}
              <Link
                href="/signup"
              className="iphone-navbar-icon px-3 py-2 rounded-full text-sm font-semibold text-white"
                style={{
                width: 'auto',
                minWidth: '44px',
                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                }}
              >
                Sign Up
              </Link>
          </>
        ) : (
          <>
            {/* Left: Settings Icon (or Hamburger if not hidden) */}
            {hideHamburger ? (
              <Link
                href="/settings"
                className="iphone-navbar-icon"
                aria-label="Settings"
                style={{
                  minWidth: '44px',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isDark ? '#ffffff' : '#1f2937',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </Link>
            ) : (
              <button
                onClick={handleMenuClick}
                className="iphone-navbar-icon"
                aria-label="Open menu"
                style={{
                  minWidth: '44px',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: 0,
                  margin: 0,
                  cursor: 'pointer',
                  color: isDark ? '#ffffff' : '#1f2937',
                  opacity: 1,
                  visibility: 'visible',
                }}
              >
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={isDark ? '#ffffff' : '#1f2937'}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    display: 'block',
                    pointerEvents: 'none',
                    opacity: 1,
                    visibility: 'visible',
                  }}
                >
                  <line x1="3" y1="6" x2="21" y2="6" stroke={isDark ? '#ffffff' : '#1f2937'} strokeWidth="3" />
                  <line x1="3" y1="12" x2="21" y2="12" stroke={isDark ? '#ffffff' : '#1f2937'} strokeWidth="3" />
                  <line x1="3" y1="18" x2="21" y2="18" stroke={isDark ? '#ffffff' : '#1f2937'} strokeWidth="3" />
                </svg>
              </button>
            )}

            {/* Center: Page Title with App Icon */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-sm">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className={`iphone-navbar-title ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {pageTitle}
              </span>
            </div>

            {/* Right: Notification Bell */}
            <Link
              href="/notifications"
              className="iphone-navbar-icon relative"
              aria-label="Notifications"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isDark ? '#ffffff' : '#1f2937'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {notificationCount > 0 && (
                <span className="iphone-notification-badge">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
