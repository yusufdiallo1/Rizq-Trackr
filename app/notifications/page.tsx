'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getCurrentUser, User } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import LoadingScreen from '@/components/LoadingScreen';

interface Notification {
  id: string;
  type: 'transaction' | 'zakat' | 'goal' | 'budget' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  actionUrl?: string;
}

type NotificationCategory = 'all' | 'transactions' | 'zakat' | 'goals' | 'system';

export default function NotificationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const init = async () => {
      const currentUser = await getCurrentUser();
      // Don't redirect - middleware handles authentication
      // If no user, just don't load data (middleware will redirect if needed)
      if (!currentUser) {
        setLoading(false);
        return;
      }
      setUser(currentUser);
      loadNotifications(currentUser);
      setLoading(false); // Set loading false immediately after getting user
      }
    };
    init();
  }, [router]);

  const loadNotifications = async (currentUser: User) => {
    // Mock notifications - in production, fetch from database
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'transaction',
        title: 'Income Added: $500',
        message: 'You added $500 in Salary income',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: false,
        actionLabel: 'View',
        actionUrl: '/transactions'
      },
      {
        id: '2',
        type: 'zakat',
        title: 'Zakat Payment Due',
        message: 'Your Zakat of $125 is due next week',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        read: false,
        actionLabel: 'Pay Now',
        actionUrl: '/zakat'
      },
      {
        id: '3',
        type: 'goal',
        title: 'Goal Milestone Reached!',
        message: "You've saved 50% toward Emergency Fund",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: false,
        actionLabel: 'View Goal',
        actionUrl: '/savings'
      },
      {
        id: '4',
        type: 'budget',
        title: 'Budget Limit Approaching',
        message: "You've spent 90% of your Food budget this month",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        actionLabel: 'View Budget',
        actionUrl: '/expenses'
      },
      {
        id: '5',
        type: 'system',
        title: 'New Feature Available',
        message: 'Check out our new analytics dashboard',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        actionLabel: 'Explore',
        actionUrl: '/analytics'
      },
      {
        id: '6',
        type: 'transaction',
        title: 'Expense Added: $45',
        message: 'You added $45 in Groceries expense',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        actionLabel: 'View',
        actionUrl: '/transactions'
      }
    ];

    setNotifications(mockNotifications);
  };

  const getFilteredNotifications = () => {
    if (activeCategory === 'all') return notifications;
    if (activeCategory === 'transactions') return notifications.filter(n => n.type === 'transaction');
    if (activeCategory === 'zakat') return notifications.filter(n => n.type === 'zakat');
    if (activeCategory === 'goals') return notifications.filter(n => n.type === 'goal' || n.type === 'budget');
    if (activeCategory === 'system') return notifications.filter(n => n.type === 'system');
    return notifications;
  };

  const getUnreadCount = (category: NotificationCategory) => {
    const filtered = category === 'all'
      ? notifications
      : notifications.filter(n => {
          if (category === 'transactions') return n.type === 'transaction';
          if (category === 'zakat') return n.type === 'zakat';
          if (category === 'goals') return n.type === 'goal' || n.type === 'budget';
          if (category === 'system') return n.type === 'system';
          return false;
        });
    return filtered.filter(n => !n.read).length;
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'transaction':
        return {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          color: 'emerald',
          bgClass: 'bg-emerald-500/20',
          borderClass: 'border-emerald-500/30',
          textClass: 'text-emerald-600'
        };
      case 'zakat':
        return {
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
            </svg>
          ),
          color: 'secondary',
          bgClass: 'bg-secondary/20',
          borderClass: 'border-secondary/30',
          textClass: 'text-secondary'
        };
      case 'goal':
        return {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          ),
          color: 'blue',
          bgClass: 'bg-blue-500/20',
          borderClass: 'border-blue-500/30',
          textClass: 'text-blue-600'
        };
      case 'budget':
        return {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          color: 'yellow',
          bgClass: 'bg-yellow-500/20',
          borderClass: 'border-yellow-500/30',
          textClass: 'text-yellow-600'
        };
      case 'system':
        return {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          color: 'gray',
          bgClass: 'bg-gray-500/20',
          borderClass: 'border-gray-500/30',
          textClass: 'text-gray-600'
        };
      default:
        return {
          icon: null,
          color: 'gray',
          bgClass: 'bg-gray-500/20',
          borderClass: 'border-gray-500/30',
          textClass: 'text-gray-600'
        };
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const filteredNotifications = getFilteredNotifications();

  return (
    <DashboardLayout user={user}>
      <div className="w-full px-4 sm:px-6 py-4 sm:py-8">
        {/* Page Header - Mobile Optimized */}
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">Notifications</h1>
          <p className="text-white/80 text-sm sm:text-base">Stay updated with your financial activity</p>
        </div>

        {/* Actions Bar - Mobile Optimized */}
        <div className="mb-4 sm:mb-6 rounded-2xl backdrop-blur-xl bg-white/75 border border-white/30 shadow-lg p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={markAllAsRead}
                disabled={notifications.every(n => n.read)}
                className="px-3 sm:px-4 py-2 rounded-xl bg-white/60 backdrop-blur-md border border-white/40 text-charcoal-dark font-medium text-sm sm:text-base hover:bg-white/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark All Read
              </button>
              <button
                onClick={clearAll}
                disabled={notifications.length === 0}
                className="px-3 sm:px-4 py-2 rounded-xl bg-white/40 backdrop-blur-md border border-white/40 text-charcoal font-medium text-sm sm:text-base hover:bg-white/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear All
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm text-charcoal/60">
                {notifications.filter(n => !n.read).length} unread
              </span>
            </div>
          </div>
        </div>

        {/* Category Tabs - Mobile Scroll */}
        <div className="mb-4 sm:mb-6 rounded-2xl backdrop-blur-xl bg-white/75 border border-white/30 shadow-lg p-2 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max sm:min-w-0">
            {[
              { key: 'all', label: 'All' },
              { key: 'transactions', label: 'Transactions' },
              { key: 'zakat', label: 'Zakat' },
              { key: 'goals', label: 'Goals' },
              { key: 'system', label: 'System' }
            ].map((category) => {
              const unreadCount = getUnreadCount(category.key as NotificationCategory);
              const isActive = activeCategory === category.key;

              return (
                <button
                  key={category.key}
                  onClick={() => setActiveCategory(category.key as NotificationCategory)}
                  className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-medium text-sm sm:text-base transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                      : 'bg-white/40 backdrop-blur-md text-charcoal hover:bg-white/60'
                  }`}
                >
                  <span>{category.label}</span>
                  {unreadCount > 0 && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                      isActive
                        ? 'bg-white/30 text-white'
                        : 'bg-red-500/20 text-red-600'
                    }`}>
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const iconData = getNotificationIcon(notification.type);

              return (
                <div
                  key={notification.id}
                  className={`rounded-2xl backdrop-blur-xl bg-white/75 border shadow-lg hover:shadow-xl transition-all ${
                    !notification.read
                      ? 'border-l-4 border-l-blue-500 border-white/30'
                      : 'border-white/30 opacity-75'
                  }`}
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Icon */}
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 ${iconData.bgClass} backdrop-blur-md rounded-xl sm:rounded-2xl flex items-center justify-center border ${iconData.borderClass} flex-shrink-0`}>
                        <div className={`text-lg sm:text-xl ${iconData.textClass}`}>{iconData.icon}</div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-charcoal-dark mb-1">{notification.title}</h3>
                        <p className="text-xs sm:text-sm text-charcoal mb-2">{notification.message}</p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <span className="text-xs text-charcoal/60">{getRelativeTime(notification.timestamp)}</span>
                          {notification.actionLabel && (
                            <button
                              onClick={() => router.push(notification.actionUrl || '/')}
                              className="px-3 py-1 rounded-lg bg-white/60 backdrop-blur-md border border-white/40 text-xs font-medium text-charcoal-dark hover:bg-white/80 transition-all"
                            >
                              {notification.actionLabel}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-start gap-1 sm:gap-2 flex-shrink-0">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="w-8 h-8 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 hover:bg-emerald-500 hover:text-white transition-all group"
                            title="Mark as read"
                          >
                            <svg className="w-4 h-4 text-charcoal group-hover:text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="w-8 h-8 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 hover:bg-red-500 hover:text-white transition-all group"
                          title="Delete"
                        >
                          <svg className="w-4 h-4 text-charcoal group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="rounded-3xl backdrop-blur-xl bg-white/75 border border-white/30 shadow-xl p-16">
            <div className="text-center">
              <div className="w-24 h-24 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 border border-white/40">
                <svg className="w-12 h-12 text-charcoal/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-charcoal-dark mb-2">All caught up!</h3>
              <p className="text-charcoal/60">No new notifications</p>
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-3xl backdrop-blur-xl bg-white/90 border border-white/30 shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-charcoal-dark">Notification Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 rounded-xl bg-white/50 backdrop-blur-md border border-white/30 hover:bg-white/70 transition-all"
              >
                <svg className="w-5 h-5 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Transaction Alerts', description: 'Get notified of new transactions' },
                { label: 'Zakat Reminders', description: 'Receive Zakat payment reminders' },
                { label: 'Goal Milestones', description: 'Celebrate savings goal achievements' },
                { label: 'Budget Warnings', description: 'Alert when approaching budget limits' },
                { label: 'Email Notifications', description: 'Receive notifications via email' }
              ].map((setting, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40">
                  <div className="flex-1">
                    <p className="font-medium text-charcoal-dark">{setting.label}</p>
                    <p className="text-sm text-charcoal/60">{setting.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-12 h-6 bg-white/60 backdrop-blur-md border border-white/50 rounded-full peer peer-checked:bg-emerald-500 peer-checked:border-emerald-600 transition-all peer-focus:ring-4 peer-focus:ring-emerald-300/50 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-white/50 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6 after:shadow-md"></div>
                  </label>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:shadow-lg transition-all"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
