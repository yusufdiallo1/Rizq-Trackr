'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { getCurrentUser, User } from '@/lib/auth';
import LoadingScreen from '@/components/LoadingScreen';
import { useTheme } from '@/lib/contexts/ThemeContext';

interface UserProfile {
  full_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  location?: string;
  created_at: string;
  avatar_url?: string;
}

interface AccountStats {
  totalTransactions: number;
  currentBalance: number;
  totalZakatPaid: number;
}

interface Activity {
  id: string;
  icon: string;
  action: string;
  timestamp: string;
}

type ModalType = 'edit' | 'delete' | null;

export default function ProfilePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const [profile, setProfile] = useState<UserProfile>({
    full_name: 'Fatoumata Balde',
    email: 'fatoumata@email.com',
    phone: '+1 (555) 123-4567',
    date_of_birth: '1995-01-15',
    location: 'Ashburn, Virginia',
    created_at: '2024-01-15T00:00:00Z',
    avatar_url: undefined
  });

  const [editForm, setEditForm] = useState({ ...profile });

  const [stats, setStats] = useState<AccountStats>({
    totalTransactions: 234,
    currentBalance: 12450,
    totalZakatPaid: 1250
  });

  const [preferences, setPreferences] = useState({
    notifications: true,
    hijriCalendar: false,
    currency: 'USD',
    language: 'English'
  });

  const [activities] = useState<Activity[]>([
    { id: '1', icon: '💰', action: 'Added income entry', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: '2', icon: '💸', action: 'Recorded expense', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
    { id: '3', icon: '🕌', action: 'Calculated Zakat', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
    { id: '4', icon: '📊', action: 'Viewed analytics', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    { id: '5', icon: '⚙️', action: 'Updated settings', timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() }
  ]);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const currentUser = await getCurrentUser();
    // Don't redirect - middleware handles authentication
    // If no user, just don't load data (middleware will redirect if needed)
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setUser(currentUser);
    setProfile(prev => ({ ...prev, email: currentUser.email }));
    setEditForm(prev => ({ ...prev, email: currentUser.email }));
    setLoading(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleSaveProfile = () => {
    setProfile(editForm);
    setActiveModal(null);
  };

  const textColor = theme === 'dark' ? 'text-white' : 'text-charcoal-dark';
  const textColorLight = theme === 'dark' ? 'text-white/80' : 'text-charcoal';
  const textColorMuted = theme === 'dark' ? 'text-white/60' : 'text-charcoal/60';

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <DashboardLayout user={user}>
      <div className="min-h-screen pb-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pt-4">
          {/* Profile Header Card */}
          <div
            className="rounded-[20px] sm:rounded-[28px] p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6"
            style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(16, 185, 129, 0.2))',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: theme === 'dark'
                ? '0 0 40px rgba(6, 182, 212, 0.2)'
                : '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="flex flex-col items-center">
              {/* Avatar with Camera Overlay */}
              <div className="relative mb-3 sm:mb-4 group cursor-pointer">
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 lg:w-[120px] lg:h-[120px] rounded-full flex items-center justify-center text-white font-bold text-3xl sm:text-4xl lg:text-5xl relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                    border: '4px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 0 30px rgba(6, 182, 212, 0.5)'
                  }}
                >
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                    ) : (
                    <span className="relative z-10">{getInitials(profile.full_name)}</span>
                    )}
                  </div>

                {/* Camera Icon Overlay */}
                <div
                  className="absolute bottom-0 right-0 w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
                  style={{
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.9), rgba(16, 185, 129, 0.9))',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  </div>
                </div>

              {/* Name & Email */}
              <h1 className={`${textColor} font-bold text-xl sm:text-2xl lg:text-3xl mb-1 sm:mb-2 text-center`}>{profile.full_name}</h1>
              <p className={`${textColorLight} text-sm sm:text-base lg:text-lg mb-0.5 sm:mb-1 text-center`}>{profile.email}</p>
              <p className={`${textColorMuted} text-xs sm:text-sm text-center`}>Member since {formatDate(profile.created_at)}</p>

              {/* Edit Button */}
                  <button
                onClick={() => { setEditForm(profile); setActiveModal('edit'); }}
                className="mt-3 sm:mt-4 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(16, 185, 129, 0.3))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                <span className={`${textColor} font-medium text-sm`}>Edit Profile</span>
                  </button>
          </div>
        </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
            {/* Total Transactions */}
            <div
              className="rounded-[16px] sm:rounded-[20px] p-3 sm:p-4 lg:p-6"
              style={{
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.6), rgba(30, 64, 175, 0.6))'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.8))',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'}`,
                boxShadow: theme === 'dark'
                  ? '0 0 20px rgba(6, 182, 212, 0.1)'
                  : '0 4px 12px rgba(0, 0, 0, 0.08)'
              }}
            >
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center mb-2 sm:mb-3 mx-auto"
                style={{
                  background: 'rgba(168, 85, 247, 0.2)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 0 15px rgba(168, 85, 247, 0.3)'
                }}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className={`${textColor} font-bold text-lg sm:text-xl lg:text-2xl text-center mb-0.5 sm:mb-1`}>{stats.totalTransactions}</p>
              <p className={`${textColorLight} text-[10px] sm:text-xs lg:text-sm text-center leading-tight`}>Transactions</p>
          </div>

            {/* Current Balance */}
            <div
              className="rounded-[16px] sm:rounded-[20px] p-3 sm:p-4 lg:p-6"
              style={{
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.6), rgba(30, 64, 175, 0.6))'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.8))',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'}`,
                boxShadow: theme === 'dark'
                  ? '0 0 20px rgba(245, 158, 11, 0.1)'
                  : '0 4px 12px rgba(0, 0, 0, 0.08)'
              }}
            >
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center mb-2 sm:mb-3 mx-auto"
                style={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 0 15px rgba(245, 158, 11, 0.3)'
                }}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p className={`${textColor} font-bold text-lg sm:text-xl lg:text-2xl text-center mb-0.5 sm:mb-1`}>${(stats.currentBalance / 1000).toFixed(1)}k</p>
              <p className={`${textColorLight} text-[10px] sm:text-xs lg:text-sm text-center leading-tight`}>Balance</p>
          </div>

            {/* Zakat Paid */}
            <div
              className="rounded-[16px] sm:rounded-[20px] p-3 sm:p-4 lg:p-6"
              style={{
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.6), rgba(30, 64, 175, 0.6))'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.8))',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'}`,
                boxShadow: theme === 'dark'
                  ? '0 0 20px rgba(16, 185, 129, 0.1)'
                  : '0 4px 12px rgba(0, 0, 0, 0.08)'
              }}
            >
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center mb-2 sm:mb-3 mx-auto"
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)'
                }}
              >
                <span className="text-base sm:text-xl lg:text-2xl">🕌</span>
              </div>
              <p className={`${textColor} font-bold text-lg sm:text-xl lg:text-2xl text-center mb-0.5 sm:mb-1`}>${(stats.totalZakatPaid / 1000).toFixed(1)}k</p>
              <p className={`${textColorLight} text-[10px] sm:text-xs lg:text-sm text-center leading-tight`}>Zakat Paid</p>
          </div>
        </div>

          {/* Personal Information Card */}
          <div
            className="rounded-[20px] sm:rounded-[24px] p-4 sm:p-6 mb-4 sm:mb-6"
            style={{
              background: theme === 'dark'
                ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.6), rgba(30, 64, 175, 0.6))'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.8))',
              backdropFilter: 'blur(30px)',
              border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
              boxShadow: theme === 'dark'
                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                : '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className={`${textColor} font-bold text-lg sm:text-xl`}>Personal Information</h2>
                <button
                onClick={() => { setEditForm(profile); setActiveModal('edit'); }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all active:scale-95 text-xs sm:text-sm"
                style={{
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(16, 185, 129, 0.2))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(6, 182, 212, 0.5)',
                  color: '#06b6d4'
                }}
              >
                Edit
                </button>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {[
                { icon: '👤', label: 'Full Name', value: profile.full_name },
                { icon: '📧', label: 'Email', value: profile.email, locked: true },
                { icon: '📱', label: 'Phone', value: profile.phone },
                { icon: '📅', label: 'Date of Birth', value: profile.date_of_birth ? formatDate(profile.date_of_birth) : 'Not set' },
                { icon: '📍', label: 'Location', value: profile.location }
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl"
                  style={{
                    background: theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
                  }}
                >
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: theme === 'dark'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.05)',
                      backdropFilter: 'blur(5px)'
                    }}
                  >
                    <span className="text-base sm:text-lg">{item.icon}</span>
              </div>
                  <div className="flex-1 min-w-0">
                    <p className={`${textColorMuted} text-[10px] sm:text-xs mb-0.5`}>{item.label}</p>
                    <p className={`${textColor} text-xs sm:text-sm font-medium truncate`}>{item.value}</p>
                  </div>
                  {item.locked && (
                    <svg className={`w-4 h-4 ${textColorMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  )}
                  {!item.locked && (
                    <svg className={`w-5 h-5 ${textColorMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
              </div>

          {/* Security Card */}
          <div
            className="rounded-[20px] sm:rounded-[24px] p-4 sm:p-6 mb-4 sm:mb-6"
            style={{
              background: theme === 'dark'
                ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.6), rgba(30, 64, 175, 0.6))'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.8))',
              backdropFilter: 'blur(30px)',
              border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
              boxShadow: theme === 'dark'
                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                : '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <h2 className={`${textColor} font-bold text-lg sm:text-xl mb-3 sm:mb-4`}>Security & Privacy</h2>

            <div className="space-y-3">
              {/* Password */}
              <div
                className="flex items-center justify-between p-3 rounded-2xl"
                style={{
                  background: theme === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: theme === 'dark'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.05)',
                      backdropFilter: 'blur(5px)'
                    }}
                  >
                    <span className="text-lg">🔒</span>
                  </div>
              <div>
                    <p className={`${textColor} text-sm font-medium`}>Password</p>
                    <p className={`${textColorMuted} text-xs`}>••••••••</p>
                  </div>
                </div>
                <button
                  className="px-4 py-2 rounded-xl text-sm transition-all active:scale-95"
                  style={{
                    background: theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(0, 0, 0, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                    color: theme === 'dark' ? 'white' : '#1f2937'
                  }}
                >
                  Change
                </button>
              </div>

              {/* 2FA */}
              <div
                className="flex items-center justify-between p-3 rounded-2xl"
                style={{
                  background: theme === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: theme === 'dark'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.05)',
                      backdropFilter: 'blur(5px)'
                    }}
                  >
                    <span className="text-lg">🛡️</span>
              </div>
              <div>
                    <p className={`${textColor} text-sm font-medium`}>Two-Factor Auth</p>
                    <p className={`${textColorMuted} text-xs`}>2FA</p>
                </div>
                </div>
                <span className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{
                    background: theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(0, 0, 0, 0.05)',
                    color: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'
                  }}
                >
                  Coming Soon
                </span>
              </div>
            </div>
          </div>

          {/* Preferences Card */}
          <div
            className="rounded-[20px] sm:rounded-[24px] p-4 sm:p-6 mb-4 sm:mb-6"
            style={{
              background: theme === 'dark'
                ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.6), rgba(30, 64, 175, 0.6))'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.8))',
              backdropFilter: 'blur(30px)',
              border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
              boxShadow: theme === 'dark'
                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                : '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <h2 className={`${textColor} font-bold text-lg sm:text-xl mb-3 sm:mb-4`}>Preferences</h2>

            <div className="space-y-3">
              {/* Currency */}
              <div
                className="flex items-center justify-between p-3 rounded-2xl cursor-pointer"
                style={{
                  background: theme === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🇺🇸</span>
                  <p className={`${textColor} text-sm font-medium`}>USD</p>
                </div>
                <svg className={`w-5 h-5 ${textColorMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Language */}
              <div
                className="flex items-center justify-between p-3 rounded-2xl cursor-pointer"
                style={{
                  background: theme === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌐</span>
                  <p className={`${textColor} text-sm font-medium`}>English</p>
                  </div>
                <svg className={`w-5 h-5 ${textColorMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Notifications */}
              <div
                className="flex items-center justify-between p-3 rounded-2xl"
                style={{
                  background: theme === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔔</span>
                  <p className={`${textColor} text-sm font-medium`}>Notifications</p>
                </div>
                <div
                  className="relative inline-flex h-8 w-14 items-center rounded-full cursor-pointer transition-all"
                  style={{
                    background: preferences.notifications
                      ? 'linear-gradient(135deg, #06b6d4, #0891b2)'
                      : theme === 'dark'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.1)'
                  }}
                  onClick={() => setPreferences(p => ({ ...p, notifications: !p.notifications }))}
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-lg ${preferences.notifications ? 'translate-x-7' : 'translate-x-1'}`} />
                </div>
              </div>

              {/* Hijri Calendar */}
              <div
                className="flex items-center justify-between p-3 rounded-2xl"
                style={{
                  background: theme === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📅</span>
                  <p className={`${textColor} text-sm font-medium`}>Hijri Calendar</p>
                  </div>
                <div
                  className="relative inline-flex h-8 w-14 items-center rounded-full cursor-pointer transition-all"
                  style={{
                    background: preferences.hijriCalendar
                      ? 'linear-gradient(135deg, #06b6d4, #0891b2)'
                      : theme === 'dark'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.1)'
                  }}
                  onClick={() => setPreferences(p => ({ ...p, hijriCalendar: !p.hijriCalendar }))}
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-lg ${preferences.hijriCalendar ? 'translate-x-7' : 'translate-x-1'}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Data Management Card */}
          <div
            className="rounded-[20px] sm:rounded-[24px] p-4 sm:p-6 mb-4 sm:mb-6"
            style={{
              background: theme === 'dark'
                ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.6), rgba(30, 64, 175, 0.6))'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.8))',
              backdropFilter: 'blur(30px)',
              border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
              boxShadow: theme === 'dark'
                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                : '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <h2 className={`${textColor} font-bold text-lg sm:text-xl mb-3 sm:mb-4`}>Data Management</h2>

            <div className="space-y-3">
              {/* Export Data */}
              <button
                className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl transition-all active:scale-98"
                style={{
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(16, 185, 129, 0.2))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(6, 182, 212, 0.5)'
                }}
              >
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                <span className="text-cyan-400 font-medium">Export My Data</span>
                </button>

              {/* Delete Account */}
              <button
                onClick={() => setActiveModal('delete')}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl transition-all active:scale-98"
                style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(239, 68, 68, 0.5)'
                }}
              >
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="text-red-400 font-medium">Delete Account</span>
                </button>
          </div>
        </div>

          {/* Activity Log */}
          <div
            className="rounded-[20px] sm:rounded-[24px] p-4 sm:p-6"
            style={{
              background: theme === 'dark'
                ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.6), rgba(30, 64, 175, 0.6))'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.8))',
              backdropFilter: 'blur(30px)',
              border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
              boxShadow: theme === 'dark'
                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                : '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className={`${textColor} font-bold text-lg sm:text-xl`}>Recent Activity</h2>
              <button className="text-cyan-400 text-xs sm:text-sm font-medium">View All →</button>
          </div>

            <div className="space-y-2">
              {activities.map((activity, index) => (
              <div
                key={activity.id}
                  className="flex items-center gap-3 p-3 rounded-2xl"
                  style={{
                    background: theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
                    borderBottom: index < activities.length - 1 ? 'none' : undefined
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: theme === 'dark'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.05)',
                      backdropFilter: 'blur(5px)'
                    }}
                  >
                    <span className="text-lg">{activity.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className={`${textColor} text-sm font-medium`}>{activity.action}</p>
                    <p className={`${textColorMuted} text-xs`}>{getRelativeTime(activity.timestamp)}</p>
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {activeModal === 'edit' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:p-6">
          <div
            className="w-full max-w-md rounded-[28px] p-6 lg:p-8"
            style={{
              background: theme === 'dark'
                ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.95), rgba(30, 64, 175, 0.95))'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95))',
              backdropFilter: 'blur(40px)',
              border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`${textColor} font-bold text-2xl`}>Edit Profile</h2>
              <button
                onClick={() => setActiveModal(null)}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
                style={{
                  background: theme === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.05)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <svg className={`w-5 h-5 ${textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Avatar Upload */}
            <div className="flex flex-col items-center mb-6">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-4xl mb-3"
                style={{
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
                }}
              >
                {getInitials(editForm.full_name)}
              </div>
              <button
                className="px-4 py-2 rounded-xl text-sm transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(16, 185, 129, 0.2))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(6, 182, 212, 0.5)',
                  color: '#06b6d4'
                }}
              >
                Change Photo
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className={`${textColorLight} text-sm font-medium mb-2 block`}>Full Name</label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none"
                  style={{
                    background: theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                    color: theme === 'dark' ? 'white' : '#1f2937'
                  }}
                />
              </div>

              <div>
                <label className={`${textColorLight} text-sm font-medium mb-2 block`}>Phone Number</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none"
                  style={{
                    background: theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                    color: theme === 'dark' ? 'white' : '#1f2937'
                  }}
                />
                    </div>

              <div>
                <label className={`${textColorLight} text-sm font-medium mb-2 block`}>Date of Birth</label>
                <input
                  type="date"
                  value={editForm.date_of_birth}
                  onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none"
                  style={{
                    background: theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                    color: theme === 'dark' ? 'white' : '#1f2937'
                  }}
                />
              </div>

              <div>
                <label className={`${textColorLight} text-sm font-medium mb-2 block`}>Location</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none"
                  style={{
                    background: theme === 'dark'
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                    color: theme === 'dark' ? 'white' : '#1f2937'
                  }}
                />
              </div>
              </div>

            {/* Save Button */}
                <button
              onClick={handleSaveProfile}
              className="w-full mt-6 py-4 rounded-xl font-medium text-white transition-all active:scale-98"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
              }}
            >
              Save Changes
                </button>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {activeModal === 'delete' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="w-full max-w-sm rounded-[28px] p-8"
            style={{
              background: theme === 'dark'
                ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.95), rgba(30, 64, 175, 0.95))'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95))',
              backdropFilter: 'blur(40px)',
              border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Alert Icon */}
            <div className="flex justify-center mb-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(239, 68, 68, 0.5)',
                  boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)'
                }}
              >
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                </div>

            <h2 className={`${textColor} font-bold text-2xl text-center mb-3`}>Delete Your Account?</h2>
            <p className={`${textColorLight} text-sm text-center mb-6 leading-relaxed`}>
              This will permanently delete all your data including transactions, goals, and Zakat records. This action cannot be undone.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-3 rounded-xl font-medium transition-all active:scale-98"
                style={{
                  background: theme === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                  color: theme === 'dark' ? 'white' : '#1f2937'
                }}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-3 rounded-xl font-medium text-white transition-all active:scale-98"
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)'
                }}
              >
                Delete Forever
              </button>
          </div>
        </div>
    </div>
      )}
    </DashboardLayout>
  );
}
