'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/lib/contexts/ThemeContext';

interface MobileBottomTabBarProps {
  onAddClick?: () => void;
}

export function MobileBottomTabBar({ onAddClick }: MobileBottomTabBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const isDark = theme === 'dark';

  // Hide tab bar on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const handleIncomeClick = () => {
    // Haptic feedback simulation
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
    router.push('/income?action=add');
  };

  const handleTabClick = (href: string) => {
    // Haptic feedback simulation
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(5);
    }
    router.push(href);
  };

  // Tab icons - 5 tabs: Dashboard, Income (center elevated), Expenses, Savings, More
  const tabs = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
    },
    {
      href: '/income',
      label: 'Income',
      isCenter: true,
      icon: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      ),
    },
    {
      href: '/expenses',
      label: 'Expenses',
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      ),
    },
    {
      href: '/savings',
      label: 'Savings',
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="8" r="2"></circle>
          <path d="M3 12c0-1.657 1.343-3 3-3h12c1.657 0 3 1.343 3 3v8c0 1.657-1.343 3-3 3H6c-1.657 0-3-1.343-3-3v-8z"></path>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      ),
    },
    {
      href: '/settings',
      label: 'More',
      icon: (active: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <circle cx="5" cy="12" r="2"></circle>
          <circle cx="12" cy="12" r="2"></circle>
          <circle cx="19" cy="12" r="2"></circle>
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* iPhone-Native Bottom Tab Bar */}
      <nav
        className={`iphone-tab-bar iphone-tab-bar-glass lg:hidden transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-around w-full h-[62px] px-1">
          {tabs.map((tab, index) => {
            if (tab.isCenter) {
              // Center Floating Action Button (Income)
              const active = isActive(tab.href);
              return (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIncomeClick();
                  }}
                  aria-label="Add Income"
                  className="iphone-tab-fab iphone-haptic-medium"
                >
                  {tab.icon()}
                </button>
              );
            }

            const active = isActive(tab.href);

            return (
              <button
                key={tab.href}
                onClick={() => handleTabClick(tab.href)}
                className={`iphone-tab-item ${active ? 'active' : ''}`}
                aria-label={tab.label}
                aria-current={active ? 'page' : undefined}
                role="tab"
              >
                <div
                  className={`iphone-tab-icon transition-all duration-200 ${
                    active
                      ? 'text-emerald-500 scale-110'
                      : isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                  style={{
                    filter: active ? 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.5))' : 'none',
                  }}
                >
                  {tab.icon(active)}
                </div>
                <span
                  className={`iphone-tab-label transition-colors duration-200 ${
                    active
                      ? 'text-emerald-500'
                      : isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
