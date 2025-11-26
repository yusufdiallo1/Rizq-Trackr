'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef, MouseEvent, useMemo } from 'react';
import { motion } from 'framer-motion';
import { signOut, getCurrentUser, User } from '@/lib/auth';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { slideDownVariants } from '@/lib/animations';
import { NotificationBell } from '@/components/NotificationBell';
import { DesktopPillNav } from './DesktopPillNav';
import { Logo } from '@/components/Logo';

interface NavbarProps {
  user?: User | null;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showLanguageSubmenu, setShowLanguageSubmenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser();
      setIsAuthenticated(!!currentUser);
    };
    checkAuth();
    const interval = setInterval(checkAuth, 3000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user menu when clicking outside (simple, reliable version)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!showUserMenu) return;

    const handleClickOutside = (event: Event) => {
      const target = event.target as Node | null;
      if (!target) return;

      // Check if click is inside the user menu container or any interactive element within it
      if (userMenuRef.current && userMenuRef.current.contains(target)) {
        // Additional check: if clicking on a link or button, don't close immediately
        // Let the onClick handler manage the closing
        const element = target as HTMLElement;
        const isInteractiveElement = 
          element.tagName === 'A' || 
          element.tagName === 'BUTTON' ||
          element.closest('a') !== null ||
          element.closest('button') !== null;
        
        // If it's an interactive element, don't close here - let its onClick handle it
        if (isInteractiveElement) {
        return;
        }
      }

      // Otherwise, close menus
      setShowUserMenu(false);
      setShowLanguageSubmenu(false);
    };

    // Use click event instead of mousedown to allow onClick handlers to fire first
    document.addEventListener('click', handleClickOutside, true);

    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [showUserMenu]);

  const handleSignOut = async (e?: MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.stopPropagation();
    }

    // Close menus immediately in UI
    setShowUserMenu(false);
    setShowLanguageSubmenu(false);

    try {
      // Clear Supabase session
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear client-side state but preserve PIN + biometric settings
    if (typeof window !== 'undefined') {
      const pinHash = localStorage.getItem('finance_tracker_pin_hash');
      const userId = localStorage.getItem('finance_tracker_user_id');
      const biometricEnabled = localStorage.getItem('finance_tracker_biometric_enabled');
      const credentialId = localStorage.getItem('finance_tracker_credential_id');

      sessionStorage.clear();
      localStorage.clear();

      if (pinHash) localStorage.setItem('finance_tracker_pin_hash', pinHash);
      if (userId) localStorage.setItem('finance_tracker_user_id', userId);
      if (biometricEnabled) localStorage.setItem('finance_tracker_biometric_enabled', biometricEnabled);
      if (credentialId) localStorage.setItem('finance_tracker_credential_id', credentialId);

      // Force fresh login page; middleware will keep dashboard protected
      window.location.href = '/login';
    }
  };

  const navLinks = useMemo(() => [
    { href: '/dashboard', labelKey: 'nav.dashboard' },
    { href: '/income', labelKey: 'nav.income' },
    { href: '/expenses', labelKey: 'nav.expenses' },
    { href: '/savings', labelKey: 'nav.savings' },
    { href: '/zakat', labelKey: 'nav.zakat' },
    { href: '/transactions', labelKey: 'nav.transactions' },
    { href: '/analytics', labelKey: 'Analytics' },
  ], []);

  const languages = [
    { code: 'en' as const, name: 'English', flag: '🇺🇸' },
    { code: 'ar' as const, name: 'العربية', flag: '🇸🇦' },
    { code: 'es' as const, name: 'Español', flag: '🇪🇸' },
    { code: 'fr' as const, name: 'Français', flag: '🇫🇷' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  // Dynamic styles based on theme - Enhanced for light mode visibility
  const navBackground = theme === 'dark' 
    ? 'rgba(30, 41, 59, 0.85)' 
    : 'rgba(255, 255, 255, 0.9)';
  const navBorder = theme === 'dark'
    ? 'rgba(255, 255, 255, 0.15)'
    : 'rgba(31, 41, 55, 0.2)';
  const textColor = theme === 'dark' ? 'text-slate-100' : 'text-charcoal-dark';
  const hoverBg = theme === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(31, 41, 55, 0.08)';
  const activeBg = theme === 'dark'
    ? 'rgba(255, 255, 255, 0.15)'
    : 'rgba(31, 41, 55, 0.12)';

  return (
    <motion.nav 
      className="fixed top-4 inset-x-0 flex justify-center z-[9999]"
      variants={slideDownVariants}
      initial="hidden"
      animate="visible"
    >
      <div
        className="w-full max-w-6xl px-4 tablet:px-6 rounded-full py-3 tablet:py-4 flex justify-between items-center backdrop-blur-md transition-all duration-300 relative pointer-events-auto"
        style={{
          background: navBackground,
          border: `1px solid ${navBorder}`,
          boxShadow: isScrolled 
            ? theme === 'dark'
              ? '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(16, 185, 129, 0.2), 0 0 30px rgba(245, 158, 11, 0.15)' 
              : '0 8px 32px rgba(0, 0, 0, 0.15), 0 0 20px rgba(16, 185, 129, 0.3), 0 0 30px rgba(245, 158, 11, 0.2)'
            : theme === 'dark'
              ? '0 4px 24px rgba(0, 0, 0, 0.2), 0 0 15px rgba(16, 185, 129, 0.15), 0 0 25px rgba(245, 158, 11, 0.1)'
            : '0 4px 24px rgba(0, 0, 0, 0.1), 0 0 15px rgba(16, 185, 129, 0.25), 0 0 25px rgba(245, 158, 11, 0.15)',
          zIndex: 9999,
        }}
      >
        {/* Glow effect overlay */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none opacity-60"
          style={{
            background: theme === 'dark'
              ? 'radial-gradient(circle at 30% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)'
              : 'radial-gradient(circle at 30% 50%, rgba(16, 185, 129, 0.2) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)',
            zIndex: 0,
          }}
        ></div>
        
        {/* Logo */}
        <Link 
          href={isAuthenticated ? "/dashboard" : "/"} 
          className="flex items-center group animate-fade-in-instant relative z-10"
        >
          <Logo size={40} showText={false} className="group-hover:scale-105 transition-transform duration-300" />
          <span className={`font-heading font-bold text-lg ${textColor} group-hover:translate-y-[-2px] transition-transform duration-300 hidden sm:block ml-2`}>
            Rizq Trackr
          </span>
        </Link>

        {/* Desktop/Tablet Navigation - Center */}
        <div 
          className="hidden lg:flex items-center flex-1 justify-center mx-4 relative" 
          style={{ 
            zIndex: 10001, 
            pointerEvents: 'auto',
            position: 'relative',
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* When NOT authenticated: Show Login, Sign Up, Help buttons */}
          {!isAuthenticated ? (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-full font-body text-sm font-medium transition-all duration-200 hover:translate-y-[-2px] animate-fade-in-instant"
                style={{ 
                  backgroundColor: 'transparent',
                  color: theme === 'dark' ? 'white' : '#1e293b',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'inline-block',
                  position: 'relative',
                  zIndex: 10001,
                  pointerEvents: 'auto',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#10b981';
                  e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme === 'dark' ? 'white' : '#1e293b';
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-full font-body text-sm font-medium transition-all duration-200 hover:translate-y-[-2px] animate-fade-in-instant"
                style={{ 
                  backgroundColor: 'transparent',
                  color: theme === 'dark' ? 'white' : '#1e293b',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'inline-block',
                  position: 'relative',
                  zIndex: 10001,
                  pointerEvents: 'auto',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#10b981';
                  e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme === 'dark' ? 'white' : '#1e293b';
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Sign Up
              </Link>
              <Link
                href="/help"
                className="px-4 py-2 rounded-full font-body text-sm font-medium transition-all duration-200 hover:translate-y-[-2px] animate-fade-in-instant"
                style={{ 
                  backgroundColor: 'transparent',
                  color: theme === 'dark' ? 'white' : '#1e293b',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'inline-block',
                  position: 'relative',
                  zIndex: 10001,
                  pointerEvents: 'auto',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#10b981';
                  e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme === 'dark' ? 'white' : '#1e293b';
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Help
              </Link>
            </>
          ) : (
            /* When authenticated: Show pill navigation */
            <DesktopPillNav />
          )}
        </div>

        {/* Right Side Controls - Desktop/Tablet (only show when authenticated) */}
        {isAuthenticated && (
          <div className="hidden lg:flex items-center gap-2 relative z-10 animate-fade-in-instant">
            {/* Notification Bell */}
            {user && (
              <NotificationBell userId={user.id} />
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className={`px-3 py-2 rounded-full ${textColor} hover:bg-opacity-15 transition-all duration-300 backdrop-blur-sm`}
              style={{ backgroundColor: hoverBg }}
              title="Dark mode"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>

            {/* User Menu - Always render to prevent layout shift */}
            {user ? (
            <div 
              className="relative" 
              ref={userMenuRef}
            >
              <button
                data-menu-button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserMenu(!showUserMenu);
                  if (showUserMenu) setShowLanguageSubmenu(false);
                }}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full ${textColor} hover:bg-opacity-15 transition-all duration-300 backdrop-blur-sm`}
                style={{ backgroundColor: hoverBg }}
              >
                <div className={`w-8 h-8 ${theme === 'dark' ? 'bg-slate-700' : 'bg-white bg-opacity-30'} rounded-full flex items-center justify-center ${textColor} font-heading font-semibold text-sm backdrop-blur-sm`}>
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:block text-sm font-body">
                  {user.email.split('@')[0]}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div 
                  ref={userMenuRef}
                  className={`absolute right-0 mt-2 w-56 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-2xl border ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'} py-1 z-50 animate-scale-in backdrop-blur-xl`}
                  style={{ pointerEvents: 'auto' }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseEnter={() => {
                    if (window.innerWidth >= 1024) {
                      setShowUserMenu(true);
                    }
                  }}
                  onMouseLeave={() => {
                    if (window.innerWidth >= 1024) {
                      setShowUserMenu(false);
                      setShowLanguageSubmenu(false);
                    }
                  }}
                >
                  <div className={`px-4 py-2 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'} font-body`}>{t('nav.signedInAs')}</p>
                    <p className={`text-sm font-body ${textColor} truncate`}>{user.email}</p>
                  </div>

                  {/* Profile Link */}
                  <Link
                    href="/profile"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUserMenu(false);
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    className={`w-full text-left px-4 py-2 text-sm font-body ${textColor} hover:${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'} transition-colors flex items-center gap-2`}
                    style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>

                  {/* Notifications Link */}
                  <Link
                    href="/notifications"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUserMenu(false);
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    className={`w-full text-left px-4 py-2 text-sm font-body ${textColor} hover:${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'} transition-colors flex items-center gap-2`}
                    style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="flex-1">Notifications</span>
                    <span className="px-2 py-0.5 bg-gradient-to-br from-red-500 to-red-600 rounded-full text-white text-xs font-bold">
                      3
                    </span>
                  </Link>

                  {/* Settings Link */}
                  <Link
                    href="/settings"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUserMenu(false);
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    className={`w-full text-left px-4 py-2 text-sm font-body ${textColor} hover:${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'} transition-colors flex items-center gap-2`}
                    style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {t('nav.settings')}
                  </Link>

                  {/* Back to Home Link */}
                  <Link
                    href="/"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUserMenu(false);
                      // Set flag to show Dashboard button on homepage
                      if (typeof window !== 'undefined') {
                        sessionStorage.setItem('showDashboardButton', 'true');
                      }
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    className={`w-full text-left px-4 py-2 text-sm font-body ${textColor} hover:${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'} transition-colors flex items-center gap-2`}
                    style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Back to Home
                  </Link>

                  {/* Change Language Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowLanguageSubmenu(!showLanguageSubmenu);
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    className={`w-full text-left px-4 py-2 text-sm font-body ${textColor} hover:${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'} transition-colors flex items-center gap-2`}
                    style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <span className="flex-1">{t('nav.changeLanguage')}</span>
                    <span className="text-lg">{currentLanguage.flag}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${showLanguageSubmenu ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Language Submenu */}
                  {showLanguageSubmenu && (
                    <div className="pl-4 pr-2 py-1" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLanguage(lang.code);
                            setShowLanguageSubmenu(false);
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                          }}
                          className={`w-full text-left px-4 py-2 text-sm font-body ${textColor} hover:${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'} transition-colors flex items-center gap-2 rounded-lg ${
                            language === lang.code ? (theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50') : ''
                          }`}
                          style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                        >
                          <span className="text-lg">{lang.flag}</span>
                          <span className="flex-1">{lang.name}</span>
                          {language === lang.code && (
                            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Divider */}
                  <div className={`border-t ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'} my-1`}></div>

                  {/* Logout Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSignOut(e);
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    type="button"
                    className={`w-full text-left px-4 py-2 text-sm font-body text-red-600 hover:${theme === 'dark' ? 'bg-red-900 bg-opacity-30' : 'bg-red-50'} transition-colors flex items-center gap-2`}
                    style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Skeleton loader - maintains navbar width while user loads
            <div className="relative">
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-full ${textColor} backdrop-blur-sm animate-pulse`} style={{ backgroundColor: hoverBg }}>
                <div className={`w-8 h-8 ${theme === 'dark' ? 'bg-slate-700' : 'bg-white bg-opacity-30'} rounded-full backdrop-blur-sm`}></div>
                <div className="hidden md:block w-20 h-4 bg-opacity-50 rounded" style={{ backgroundColor: theme === 'dark' ? '#475569' : '#d1d5db' }}></div>
                <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            )}
          </div>
        )}

        {/* Mobile Menu Button & Controls are handled by MobileTopNav on smaller screens */}
      </div>

      {/* User Menu Dropdown - Mobile */}
      {showUserMenu && user && (
        <div 
          ref={userMenuRef}
          className={`lg:hidden absolute right-4 top-16 w-56 ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-2xl border ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'} py-1 z-50 animate-scale-in backdrop-blur-xl`}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className={`px-4 py-2 border-b ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'}`}>
            <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'} font-body`}>{t('nav.signedInAs')}</p>
            <p className={`text-sm font-body ${textColor} truncate`}>{user.email}</p>
          </div>

          {/* Profile Link */}
          <Link
            href="/profile"
            onClick={() => setShowUserMenu(false)}
            className={`w-full text-left px-4 py-2 text-sm font-body ${textColor} hover:${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'} transition-colors flex items-center gap-2`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </Link>

          {/* Notifications Link */}
          <Link
            href="/notifications"
            onClick={() => setShowUserMenu(false)}
            className={`w-full text-left px-4 py-2 text-sm font-body ${textColor} hover:${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'} transition-colors flex items-center gap-2`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="flex-1">Notifications</span>
            <span className="px-2 py-0.5 bg-gradient-to-br from-red-500 to-red-600 rounded-full text-white text-xs font-bold">
              3
            </span>
          </Link>

          {/* Settings Link */}
          <Link
            href="/settings"
            onClick={() => setShowUserMenu(false)}
            className={`w-full text-left px-4 py-2 text-sm font-body ${textColor} hover:${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'} transition-colors flex items-center gap-2`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {t('nav.settings')}
          </Link>

          {/* Change Language Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowLanguageSubmenu(!showLanguageSubmenu);
            }}
            className={`w-full text-left px-4 py-2 text-sm font-body ${textColor} hover:${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'} transition-colors flex items-center gap-2`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span className="flex-1">{t('nav.changeLanguage')}</span>
            <span className="text-lg">{currentLanguage.flag}</span>
            <svg
              className={`w-4 h-4 transition-transform ${showLanguageSubmenu ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Language Submenu */}
          {showLanguageSubmenu && (
            <div className="pl-4 pr-2 py-1" onClick={(e) => e.stopPropagation()}>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLanguage(lang.code);
                    setShowLanguageSubmenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm font-body ${textColor} hover:${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'} transition-colors flex items-center gap-2 rounded-lg ${
                    language === lang.code ? (theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50') : ''
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="flex-1">{lang.name}</span>
                  {language === lang.code && (
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className={`border-t ${theme === 'dark' ? 'border-slate-700' : 'border-gray-200'} my-1`}></div>

          {/* Logout Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSignOut(e);
            }}
            type="button"
            className={`w-full text-left px-4 py-2 text-sm font-body text-red-600 hover:${theme === 'dark' ? 'bg-red-900 bg-opacity-30' : 'bg-red-50'} transition-colors flex items-center gap-2`}
            style={{ pointerEvents: 'auto', cursor: 'pointer' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {t('nav.logout')}
          </button>
        </div>
      )}

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div 
          className="lg:hidden mt-2 rounded-2xl px-4 py-3 backdrop-blur-md animate-scale-in relative"
          style={{
            background: navBackground,
            border: `1px solid ${navBorder}`,
            boxShadow: theme === 'dark'
              ? '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(16, 185, 129, 0.2), 0 0 30px rgba(245, 158, 11, 0.15)'
              : '0 8px 32px rgba(0, 0, 0, 0.15), 0 0 20px rgba(16, 185, 129, 0.3), 0 0 30px rgba(245, 158, 11, 0.2)',
          }}
        >
          {/* Glow effect overlay */}
          <div 
            className="absolute inset-0 rounded-2xl pointer-events-none opacity-60"
            style={{
              background: theme === 'dark'
                ? 'radial-gradient(circle at 30% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)'
                : 'radial-gradient(circle at 30% 50%, rgba(16, 185, 129, 0.2) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(245, 158, 11, 0.15) 0%, transparent 50%)',
            }}
          ></div>
          <div className="flex flex-col space-y-1 relative z-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  setShowMobileMenu(false);
                }}
                className={`px-4 py-2 rounded-full font-body text-sm font-medium transition-all duration-300 ${textColor} ${
                  isActive(link.href)
                    ? 'shadow-md'
                    : ''
                }`}
                style={{
                  backgroundColor: isActive(link.href) ? activeBg : 'transparent',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'block',
                  textAlign: 'left',
                  width: '100%',
                }}
                onMouseEnter={(e) => {
                  if (!isActive(link.href)) {
                    e.currentTarget.style.backgroundColor = hoverBg;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(link.href)) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {t(link.labelKey)}
              </Link>
            ))}
            {user && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSignOut(e);
                }}
                type="button"
                className={`px-4 py-2 rounded-full font-body text-sm font-medium transition-all duration-300 text-red-600 hover:${theme === 'dark' ? 'bg-red-900 bg-opacity-30' : 'bg-red-50'} text-left`}
                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
              >
                {t('nav.logout')}
              </button>
            )}
          </div>
        </div>
      )}
    </motion.nav>
  );
}
