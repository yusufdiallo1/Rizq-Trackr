'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { signOut, getCurrentUser } from '@/lib/auth';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { useLanguage, Language } from '@/lib/contexts/LanguageContext';
import { Logo } from '@/components/Logo';

// Help Dropdown Component
function HelpDropdown({ onClose }: { onClose: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const helpItems = [
    { href: '/help', label: 'Help & Support', icon: '❓' },
    { href: '/contact', label: 'Contact Us', icon: '📧' },
    { href: '/faq', label: 'FAQ', icon: '💬' },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-4 py-3 mb-3 rounded-2xl transition-all duration-300 group mobile-tap-target active:scale-95 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50"
        style={{
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          minHeight: '44px',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
        }}
      >
        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-all">
          <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="flex-1 font-medium text-amber-400 group-hover:text-amber-300 transition-colors text-left">
          Help
        </span>
        <svg
          className={`w-5 h-5 text-amber-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mb-3 space-y-2 pl-4">
          {helpItems.map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
                router.push(item.href);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group mobile-tap-target active:scale-95 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20"
              style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                minHeight: '44px',
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation',
              }}
            >
              <span className="text-base">{item.icon}</span>
              <span className="flex-1 font-medium text-white/80 group-hover:text-white transition-colors text-left text-sm">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface MobileHamburgerNavProps {
  user?: {
    email: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MobileHamburgerNav({ user, isOpen, onClose }: MobileHamburgerNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check authentication status - if user logs out, close menu and redirect
  useEffect(() => {
    if (!isOpen) return;
    
    let isMounted = true;
    
    const checkAuth = async () => {
      if (!isMounted) return;
      
      const currentUser = await getCurrentUser();
      const authenticated = !!currentUser;
      
      if (!isMounted) return;
      setIsAuthenticated(authenticated);
      
      // If user is not authenticated, just close menu
      // Don't redirect - middleware handles authentication
      if (!authenticated && isOpen) {
        onClose();
        // Don't redirect - let middleware handle it
      }
    };
    
    checkAuth();
    // Check periodically when menu is open to catch logout from other devices
    const interval = setInterval(() => {
      if (isMounted && isOpen) {
        checkAuth();
      }
    }, 3000); // Check every 3 seconds
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isOpen, user, onClose, router]);

  useEffect(() => {
    // Prevent body scroll when sidebar is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    onClose();
    // Clear session storage and auth-related data, but preserve PIN
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      // Clear auth-related localStorage items but preserve PIN
      const pinHash = localStorage.getItem('finance_tracker_pin_hash');
      const userId = localStorage.getItem('finance_tracker_user_id');
      const biometricEnabled = localStorage.getItem('finance_tracker_biometric_enabled');
      const credentialId = localStorage.getItem('finance_tracker_credential_id');
      
      localStorage.clear();
      
      // Restore PIN and biometric data if they exist
      if (pinHash) localStorage.setItem('finance_tracker_pin_hash', pinHash);
      if (userId) localStorage.setItem('finance_tracker_user_id', userId);
      if (biometricEnabled) localStorage.setItem('finance_tracker_biometric_enabled', biometricEnabled);
      if (credentialId) localStorage.setItem('finance_tracker_credential_id', credentialId);
      
      window.location.href = '/login';
    }
    // Sign out in background (non-blocking)
    signOut().catch((error) => {
      console.error('Logout error:', error);
    });
    onClose();
    router.push('/login');
    router.refresh();
  };

  // Menu items for authenticated users - All navigation items
  const authenticatedMenuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/income', label: 'Income', icon: '💰' },
    { href: '/expenses', label: 'Expenses', icon: '💸' },
    { href: '/savings', label: 'Savings', icon: '🎯' },
    { href: '/zakat', label: 'Zakat Calculator', icon: '🕌' },
    { href: '/transactions', label: 'Transactions', icon: '📊' },
    { href: '/analytics', label: 'Analytics', icon: '📈' },
    { href: '/notifications', label: 'Notifications', icon: '🔔' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
    { href: '/profile', label: 'Profile', icon: '👤' },
  ];

  // Menu items for non-authenticated users
  const unauthenticatedMenuItems = [
    { href: '/login', label: 'Login', icon: '🔐' },
    { href: '/signup', label: 'Sign Up', icon: '📝' },
    { href: '/help', label: 'Help & Support', icon: '❓' },
  ];

  const menuItems = isAuthenticated ? authenticatedMenuItems : unauthenticatedMenuItems;

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  // Don't render if not mounted
  if (!mounted) {
    return null;
  }

  // If not authenticated but menu is open, allow it to show login/signup/help
  // If authenticated and menu is open, show authenticated menu

  const textColor = 'text-white';
  const textColorLight = 'text-white/80';
  const textColorMuted = 'text-white/60';
  // Dark navy sidebar matching the design system
  const sidebarBg = 'linear-gradient(180deg, rgba(26, 29, 46, 0.99) 0%, rgba(30, 33, 57, 0.99) 50%, rgba(37, 41, 66, 0.99) 100%)';
  const borderColor = 'rgba(255, 255, 255, 0.1)';
  const dividerColor = 'border-white/10';

  return (
    <>
      {/* Backdrop Overlay - Dark overlay on content, Tap overlay to close */}
      <div
        className={`fixed inset-0 z-[9998] transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          background: 'transparent',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
        onClick={onClose}
        style={{
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* Sidebar - Width: 85% of screen (max 320px), Slide in from left (300ms) */}
      <div
        className={`fixed top-0 left-0 h-full w-[85%] max-w-[320px] z-[10000] transition-transform duration-300 ease-out lg:hidden glass-sidebar ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: sidebarBg,
          borderRight: `1px solid ${borderColor}`,
          boxShadow: '0 0 40px rgba(16, 185, 129, 0.2), 0 0 80px rgba(6, 182, 212, 0.15)',
          top: 0,
          minHeight: '100vh',
          paddingTop: `max(env(safe-area-inset-top, 0px), 0px)`,
          paddingBottom: `max(env(safe-area-inset-bottom, 0px), 0px)`,
        }}
      >
        <div 
          className="flex flex-col h-full" 
          style={{ 
            maxHeight: '100vh', 
            overflow: 'hidden',
            paddingTop: `max(calc(env(safe-area-inset-top, 0px) + 1rem), 1rem)`,
          }}
        >
          {/* Header: matches navbar content (logo + theme toggle + user chip + close) */}
          <div 
            className={`p-6 border-b ${dividerColor} flex-shrink-0`}
            style={{
              paddingTop: 0,
            }}
          >
            {/* Top row: logo and controls */}
            <div className="flex items-center justify-between mb-4">
              <Link href="/dashboard" className="flex items-center">
                <Logo size={36} showText={true} />
              </Link>
              <div className="flex items-center gap-2">
                {/* Close button (X) in header - 44x44px tap target - Icon only */}
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center justify-center text-white/80 hover:text-white transition-all active:scale-95 touch-manipulation mobile-tap-target"
                  style={{
                    width: '44px',
                    height: '44px',
                    minWidth: '44px',
                    minHeight: '44px',
                    background: 'transparent',
                    border: 'none',
                    WebkitTapHighlightColor: 'transparent',
                    padding: 0,
                  }}
                  aria-label="Close menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {/* Quick theme toggle - Icon only */}
                <button
                  type="button"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="flex items-center justify-center text-white/80 hover:text-white transition-all active:scale-95 touch-manipulation mobile-tap-target"
                  style={{
                    width: '44px',
                    height: '44px',
                    minWidth: '44px',
                    minHeight: '44px',
                    background: 'transparent',
                    border: 'none',
                    WebkitTapHighlightColor: 'transparent',
                    padding: 0,
                  }}
                  aria-label="Toggle theme"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* User Profile block */}
            {user ? (
              <div className="flex flex-col items-center">
                {/* Avatar with gradient and glow */}
                <div className="relative mb-3">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl relative overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 50%, #10b981 100%)',
                      boxShadow: '0 0 30px rgba(6, 182, 212, 0.5), 0 0 60px rgba(16, 185, 129, 0.3), 0 0 100px rgba(8, 145, 178, 0.2)',
                      border: '4px solid rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    <div className="absolute inset-0 border-2 border-white/40 rounded-full"></div>
                    <span className="relative z-10">{user.email.charAt(0).toUpperCase()}</span>
                  </div>
                </div>

                {/* User Info */}
                <div className="text-center">
                  <h3 className={`${textColor} font-bold text-lg mb-1`}>
                    {user.email.split('@')[0]}
                  </h3>
                  <p className={`${textColorLight} text-sm mb-2`}>{user.email}</p>
                  <Link
                    href="/profile"
                    onClick={onClose}
                    className="text-cyan-400 text-xs hover:text-cyan-300 transition-colors"
                  >
                    View Profile →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-white/10 mx-auto mb-3 animate-pulse"></div>
                <div className="h-4 bg-white/10 rounded mb-2 animate-pulse"></div>
              </div>
            )}
          </div>

          {/* Menu Items - Show different items based on auth status */}
          {isAuthenticated ? (
            <nav className="flex-1 px-3 py-4 overflow-y-auto overscroll-contain min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
              {authenticatedMenuItems.map((item) => (
              <button
                key={item.href}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                  const targetUrl = item.href;
                  console.log('Hamburger menu button clicked! Navigating to:', targetUrl);
                  if (typeof window !== 'undefined') {
                    window.location.href = targetUrl;
                  } else {
                    router.push(targetUrl);
                  }
                }}
                className={`flex items-center gap-3 px-4 py-3 mb-3 rounded-2xl transition-all duration-300 group mobile-tap-target active:scale-95 ${
                  isActive(item.href)
                    ? 'bg-white/10 border border-emerald-500/50 shadow-lg shadow-emerald-500/30'
                    : 'hover:bg-white/5 border border-transparent hover:border-white/10'
                }`}
                style={{
                  backdropFilter: isActive(item.href) ? 'blur(20px)' : 'blur(10px)',
                  WebkitBackdropFilter: isActive(item.href) ? 'blur(20px)' : 'blur(10px)',
                  boxShadow: isActive(item.href) 
                    ? '0 4px 20px rgba(16, 185, 129, 0.3), 0 0 30px rgba(16, 185, 129, 0.15)' 
                    : 'none',
                  cursor: 'pointer',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  minHeight: '44px',
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                }}
              >
                {/* Icon in glass circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all glass-circle ${
                    isActive(item.href)
                      ? 'bg-emerald-500/20 shadow-lg shadow-emerald-500/30'
                      : 'bg-white/10 group-hover:bg-white/15'
                  }`}
                  style={{ 
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                  }}
                >
                  <span className="text-lg">{item.icon}</span>
                </div>

                {/* Text */}
                <span
                  className={`flex-1 font-medium transition-colors ${
                    isActive(item.href) ? 'text-white' : `${textColorLight} group-hover:text-white`
                  }`}
                >
                  {item.label}
                </span>

                {/* Chevron */}
                <svg
                  className={`w-5 h-5 transition-all ${
                    isActive(item.href) ? 'text-emerald-400 opacity-100' : `${textColorMuted} opacity-0 group-hover:opacity-100`
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </nav>
          ) : (
            <nav className="flex-1 px-3 py-4 overflow-y-auto overscroll-contain min-h-0" style={{ WebkitOverflowScrolling: 'touch' }}>
              {/* Login Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                  router.push('/login');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 mb-3 rounded-2xl transition-all duration-300 group mobile-tap-target active:scale-95 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50"
                style={{
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  minHeight: '44px',
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                }}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-all">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </div>
                <span className="flex-1 font-medium text-emerald-400 group-hover:text-emerald-300 transition-colors text-left">
                  Login
                </span>
              </button>

              {/* Signup Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                  router.push('/signup');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 mb-3 rounded-2xl transition-all duration-300 group mobile-tap-target active:scale-95 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-500/50"
                style={{
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  minHeight: '44px',
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                }}
              >
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-all">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <span className="flex-1 font-medium text-cyan-400 group-hover:text-cyan-300 transition-colors text-left">
                  Sign Up
                </span>
              </button>

              {/* Help Dropdown */}
              <HelpDropdown onClose={onClose} />
            </nav>
          )}

          {/* Language Selector - Only show when authenticated - Fixed position at bottom */}
          {isAuthenticated && (
            <div className={`px-3 py-4 border-t ${dividerColor} flex-shrink-0`}>
            <div>
              <p className={`text-xs ${textColorMuted} font-medium mb-3 px-4`}>Language</p>
              <div className="flex gap-2">
                {[
                  { code: 'en' as Language, label: 'EN', flag: '🇬🇧' },
                  { code: 'ar' as Language, label: 'AR', flag: '🇸🇦' },
                  { code: 'es' as Language, label: 'ES', flag: '🇪🇸' },
                  { code: 'fr' as Language, label: 'FR', flag: '🇫🇷' },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`flex-1 flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl transition-all duration-300 glass-button ${
                      language === lang.code
                        ? 'bg-cyan-500/20 border border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                        : 'border border-transparent hover:border-white/20'
                    }`}
                    style={{
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                    }}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className={`text-xs font-medium ${language === lang.code ? 'text-white' : 'text-white/60'}`}>{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          )}

          {/* Logout Button - Only show when authenticated */}
          {isAuthenticated && (
            <div className={`p-3 border-t ${dividerColor}`}>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 hover:border-red-500/50 group"
              style={{ backdropFilter: 'blur(20px)' }}
            >
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-all">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <span className="flex-1 font-medium text-red-400 group-hover:text-red-300 transition-colors">
                Logout
              </span>
            </button>
          </div>
          )}
        </div>
      </div>
    </>
  );
}
