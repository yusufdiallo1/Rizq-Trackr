'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/income', label: 'Income', icon: '💰' },
    { href: '/expenses', label: 'Expenses', icon: '💸' },
    { href: '/savings', label: 'Savings', icon: '🏦' },
    { href: '/zakat', label: 'Zakat Calculator', icon: '🕌' },
    { href: '/transactions', label: 'Transactions', icon: '📜' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg z-30 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="h-full overflow-y-auto">
          {/* Logo at top */}
          <div className="p-6 border-b border-gray-200">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🕌</span>
              </div>
              <span className="font-heading font-bold text-lg text-charcoal-dark">
                Rizq Trackr
              </span>
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-secondary to-secondary-dark text-white shadow-md'
                    : 'text-charcoal hover:bg-cream hover:text-primary'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-body font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}

export function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden fixed top-20 left-4 z-40 w-12 h-12 bg-primary rounded-lg shadow-lg flex items-center justify-center text-white hover:bg-primary-dark transition-colors"
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
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  );
}
