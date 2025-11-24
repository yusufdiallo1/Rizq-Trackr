'use client';

import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/contexts/ThemeContext';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  type: 'income' | 'expense' | 'zakat' | 'savings' | 'analytics' | 'default';
}

const defaultActions: QuickAction[] = [
  {
    id: 'add-income',
    label: 'Add Income',
    href: '/income?action=add',
    type: 'income',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
  },
  {
    id: 'add-expense',
    label: 'Add Expense',
    href: '/expenses?action=add',
    type: 'expense',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    ),
  },
  {
    id: 'zakat',
    label: 'Zakat',
    href: '/zakat',
    type: 'zakat',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
];

interface IPhoneQuickActionsProps {
  actions?: QuickAction[];
}

export function IPhoneQuickActions({ actions = defaultActions }: IPhoneQuickActionsProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleClick = (href: string) => {
    // Haptic feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(5);
    }
    router.push(href);
  };

  return (
    <div className="iphone-quick-actions">
      {actions.map((action, index) => (
        <button
          key={action.id}
          onClick={() => handleClick(action.href)}
          className={`iphone-action-button ${
            isDark ? 'iphone-action-button-dark' : 'iphone-action-button-light'
          } iphone-animate-slide-up iphone-stagger-${index + 1}`}
          style={{ animationFillMode: 'backwards' }}
        >
          <div className={`iphone-action-icon iphone-action-icon-${action.type}`}>
            {action.icon}
          </div>
          <span className={`iphone-action-label ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
}
