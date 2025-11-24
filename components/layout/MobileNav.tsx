'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function MobileNav() {
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);

  const mainNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/income', label: 'Income', icon: '💰' },
    { href: '/zakat', label: 'Zakat', icon: '🕌' },
    { href: '/savings', label: 'Savings', icon: '🏦' },
    { href: '/transactions', label: 'Transactions', icon: '📜' },
  ];

  const additionalNavItems = [
    { href: '/expenses', label: 'Expenses', icon: '💸' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <>
      {/* Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 lg:hidden">
        <div className="flex justify-around items-center h-16">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive(item.href)
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-primary'
              }`}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Hamburger Menu Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-primary rounded-full shadow-lg flex items-center justify-center text-white z-40 lg:hidden hover:bg-primary-dark transition-colors"
      >
        <svg
          className={`w-6 h-6 transition-transform ${showMenu ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Slide-in Menu */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 transform transition-transform duration-300 lg:hidden ${
          showMenu ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ height: 'calc(100vh - 4rem)' }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-heading font-bold text-charcoal-dark">Menu</h2>
            <button
              onClick={() => setShowMenu(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-cream transition-colors"
            >
              <svg
                className="w-6 h-6 text-charcoal"
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
            </button>
          </div>

          <nav className="space-y-2">
            {additionalNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setShowMenu(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(item.href)
                    ? 'bg-primary text-white'
                    : 'text-charcoal hover:bg-cream'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-body font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}

