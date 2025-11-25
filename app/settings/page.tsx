'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, User, signOut, changePassword, deleteAccount } from '@/lib/auth';
import { DashboardLayout, PageContainer } from '@/components/layout';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { useLocation } from '@/lib/contexts/LocationContext';
import { getTextColor, getMutedTextColor } from '@/lib/utils';
import { EditProfileModal } from '@/components/EditProfileModal';
import { ChangePasswordModal } from '@/components/ChangePasswordModal';
import { CurrencySelectorSheet } from '@/components/CurrencySelectorSheet';
import { NotificationPreferencesModal } from '@/components/NotificationPreferencesModal';
import { DeleteAccountModal } from '@/components/DeleteAccountModal';
import { ToggleSwitch } from '@/components/ToggleSwitch';
import { SpendingLimitsModal } from '@/components/SpendingLimitsModal';

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile state
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  // Settings state
  const { location, refreshLocation, requestPermission, permissionGranted } = useLocation();
  const [currency, setCurrency] = useState('USD');
  const [hijriCalendar, setHijriCalendar] = useState(true);
  const [showHijriFirst, setShowHijriFirst] = useState(false);
  const [autoDetectLocation, setAutoDetectLocation] = useState(true);
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    zakatReminders: true,
    monthlySummary: false,
    transactionAlerts: false,
  });

  // Modal states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);
  const [showNotificationPrefs, setShowNotificationPrefs] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showSpendingLimits, setShowSpendingLimits] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const currentUser = await getCurrentUser();
    // Don't redirect - middleware handles authentication
    // If no user, just don't load data (middleware will redirect if needed)
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setUser(currentUser);
    setEmail(currentUser.email);
    setFullName(currentUser.email.split('@')[0] || 'User');
    setLoading(false);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveProfile = async (data: { fullName: string; phoneNumber: string }) => {
    setFullName(data.fullName);
    setPhoneNumber(data.phoneNumber);
    showToast('Profile updated successfully!', 'success');
  };

  const handleChangePassword = async (data: { currentPassword: string; newPassword: string }) => {
    if (!data.currentPassword || !data.newPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    
    if (data.newPassword.length < 8) {
      showToast('New password must be at least 8 characters', 'error');
      return;
    }
    
    const result = await changePassword(data.currentPassword, data.newPassword);
    if (result.error) {
      showToast(result.error, 'error');
    } else {
      showToast('Password updated successfully!', 'success');
    }
  };

  const handleCurrencySelect = (selectedCurrency: string) => {
    setCurrency(selectedCurrency);
    showToast('Currency updated!', 'success');
  };

  const handleSaveNotifications = async (prefs: typeof notifications) => {
    setNotifications(prefs);
    showToast('Notification preferences saved!', 'success');
  };

  const handleDeleteAccount = async () => {
    setShowDeleteAccount(true);
  };

  const handleConfirmDeleteAccount = async () => {
    
    const result = await deleteAccount();
    if (result.error) {
      showToast(result.error, 'error');
      // If deletion requires server-side processing, redirect to login
      if (result.error.includes('server-side') || result.error.includes('contact support')) {
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } else {
      showToast('Account deletion initiated. You have been signed out.', 'success');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  };

  const handleLogout = async () => {
    const result = await signOut();
    if (result.error) {
      // Silent error - still redirect
    }
    // Redirect to login
    router.push('/login');
    // Fallback redirect
    setTimeout(() => {
      window.location.href = '/login';
    }, 100);
    router.push('/login');
  };

  // Early return for loading state
  if (loading) {
    return (
      <DashboardLayout user={user}>
        <PageContainer>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white font-body">Loading settings...</p>
            </div>
          </div>
        </PageContainer>
      </DashboardLayout>
    );
  }

  // Main return
  return (
    <DashboardLayout user={user}>
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-6 z-50 animate-slide-in-right">
          <div 
            className="px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl"
            style={{
              background: toast.type === 'success'
                ? 'rgba(16, 185, 129, 0.2)'
                : 'rgba(239, 68, 68, 0.2)',
              border: toast.type === 'success'
                ? '1px solid rgba(16, 185, 129, 0.3)'
                : '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' ? (
                <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <p className={`font-medium ${toast.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {toast.message}
              </p>
            </div>
          </div>
        </div>
      )}

      <div 
        className="min-h-screen pt-20 pb-24 lg:pb-8"
        style={{
          background: 'linear-gradient(135deg, #1a1d2e 0%, #1e2139 50%, #252942 100%)',
        }}
      >
        <PageContainer maxWidth="2xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className={`text-4xl font-bold ${getTextColor(theme)} mb-2`}>Settings</h1>
            <p className={getMutedTextColor(theme)}>Manage your account and preferences</p>
          </div>

          <div className="space-y-6">
            {/* Profile Header Card */}
            <div className={`rounded-3xl p-8 shadow-2xl border backdrop-blur-xl relative overflow-hidden ${theme === 'dark' ? 'bg-white/10 border-white/20' : 'bg-white/80 border-slate-200/50'}`}>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white relative bg-gradient-to-br from-cyan-500 to-cyan-600 border-[3px] border-white/30">
                      {fullName.charAt(0).toUpperCase()}
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left min-w-0">
                  <h2 className={`text-2xl font-bold ${getTextColor(theme)} mb-1 truncate`}>{fullName}</h2>
                  <p className={`${getMutedTextColor(theme)} truncate`}>{email}</p>
                </div>

                {/* Edit Button */}
                  <button
                  onClick={() => setShowEditProfile(true)}
                  className="px-6 py-3 rounded-xl font-medium text-white transition-all hover:scale-105 bg-white/20 backdrop-blur-md border border-white/30"
                >
                  Edit Profile
                  </button>
              </div>
            </div>

            {/* Account Settings */}
            <div 
              className="rounded-3xl p-6 lg:p-8 shadow-2xl border backdrop-blur-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(25px)',
              }}
            >
              <h2 className={`text-2xl font-bold ${getTextColor(theme)} mb-6 flex items-center gap-3`}>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'rgba(6, 182, 212, 0.2)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                Account Settings
              </h2>

              <div className="space-y-4">
                {/* Change Password Row */}
                <div 
                  className="p-4 rounded-xl flex items-center justify-between hover:scale-[1.01] transition-all cursor-pointer"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                  onClick={() => setShowChangePassword(true)}
                >
                  <div className="flex items-center gap-4">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                <div>
                      <p className={`font-semibold ${getTextColor(theme)}`}>Change Password</p>
                      <p className={`text-sm ${getMutedTextColor(theme)}`}>Update your account password</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>


              </div>
            </div>

            {/* Preferences */}
            <div 
              className="rounded-3xl p-6 lg:p-8 shadow-2xl border backdrop-blur-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(25px)',
              }}
            >
              <h2 className={`text-2xl font-bold ${getTextColor(theme)} mb-6 flex items-center gap-3`}>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'rgba(245, 158, 11, 0.2)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                Preferences
              </h2>

              <div className="space-y-4">
                {/* Currency Selector */}
                <div 
                  className="p-4 rounded-xl flex items-center justify-between hover:scale-[1.01] transition-all cursor-pointer"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                  onClick={() => setShowCurrencySelector(true)}
                >
                  <div className="flex items-center gap-4">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  <div>
                      <p className={`font-semibold ${getTextColor(theme)}`}>Currency</p>
                      <p className={`text-sm ${getMutedTextColor(theme)}`}>{currency}</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Notifications */}
                <div
                  className="p-4 rounded-xl flex items-center justify-between hover:scale-[1.01] transition-all cursor-pointer"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                  onClick={() => setShowNotificationPrefs(true)}
                >
                  <div className="flex items-center gap-4">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  <div>
                      <p className={`font-semibold ${getTextColor(theme)}`}>Notifications</p>
                      <p className={`text-sm ${getMutedTextColor(theme)}`}>Manage notification preferences</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Spending Limits */}
                <div
                  className="p-4 rounded-xl flex items-center justify-between hover:scale-[1.01] transition-all cursor-pointer"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                  onClick={() => setShowSpendingLimits(true)}
                >
                  <div className="flex items-center gap-4">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <div>
                      <p className={`font-semibold ${getTextColor(theme)}`}>Spending Limits</p>
                      <p className={`text-sm ${getMutedTextColor(theme)}`}>Set limits and get alerts when exceeded</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Theme Toggle */}
                <div 
                  className="p-4 rounded-xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                  <div>
                      <p className={`font-semibold ${getTextColor(theme)}`}>Dark Theme</p>
                      <p className={`text-sm ${getMutedTextColor(theme)}`}>Use dark mode</p>
                  </div>
                  <button
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        theme === 'dark' ? 'bg-cyan-500' : 'bg-white/20'
                    }`}
                  >
                    <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 shadow-lg ${
                          theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  </div>
                </div>

                {/* Hijri Calendar Toggle */}
                <div 
                  className="p-4 rounded-xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className={`font-semibold ${getTextColor(theme)}`}>Show Hijri Calendar</p>
                      <p className={`text-sm ${getMutedTextColor(theme)}`}>Display Islamic calendar dates</p>
                    </div>
                  <ToggleSwitch
                    enabled={hijriCalendar}
                    onToggle={setHijriCalendar}
                    />
                  </div>
                  
                  {hijriCalendar && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-semibold ${getTextColor(theme)}`}>Show Hijri First</p>
                          <p className={`text-sm ${getMutedTextColor(theme)}`}>Display Hijri date before Gregorian</p>
                        </div>
                        <ToggleSwitch
                          enabled={showHijriFirst}
                          onToggle={setShowHijriFirst}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Location Settings */}
                <div 
                  className="p-4 rounded-xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className={`font-semibold ${getTextColor(theme)}`}>Auto-detect Location</p>
                      <p className={`text-sm ${getMutedTextColor(theme)}`}>
                        {location ? `${location.city || 'Location'} ${location.country ? `, ${location.country}` : ''}` : 'Location not detected'}
                      </p>
                    </div>
                    <ToggleSwitch
                      enabled={autoDetectLocation}
                      onToggle={setAutoDetectLocation}
                    />
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    {!permissionGranted && (
                      <button
                        onClick={async () => {
                          await requestPermission();
                        }}
                        className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                          background: 'rgba(6, 182, 212, 0.2)',
                          color: '#06b6d4',
                          border: '1px solid rgba(6, 182, 212, 0.4)',
                        }}
                      >
                        Request Permission
                      </button>
                    )}
                    <button
                      onClick={refreshLocation}
                      className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: getTextColor(theme),
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      Refresh Location
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Zakat Settings */}
            <div 
              className="rounded-3xl p-6 lg:p-8 shadow-2xl border backdrop-blur-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(25px)',
              }}
            >
              <h2 className={`text-2xl font-bold ${getTextColor(theme)} mb-6 flex items-center gap-3`}>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'rgba(245, 158, 11, 0.2)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <span className="text-2xl">🕌</span>
                </div>
                Zakat Settings
              </h2>

              <div className="space-y-4">
                <div 
                  className="p-4 rounded-xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <p className={`font-semibold ${getTextColor(theme)} mb-2`}>Nisab Threshold</p>
                  <p className={`text-sm ${getMutedTextColor(theme)}`}>Automatically calculated from gold/silver prices</p>
                </div>

                <div 
                  className="p-4 rounded-xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <ToggleSwitch
                    enabled={notifications.zakatReminders}
                    onToggle={(enabled) => setNotifications(prev => ({ ...prev, zakatReminders: enabled }))}
                    label="Zakat Reminders"
                    description="Get reminders 30 days before your Zakat date"
                  />
                </div>
              </div>
            </div>

            {/* Data & Privacy */}
            <div 
              className="rounded-3xl p-6 lg:p-8 shadow-2xl border backdrop-blur-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(25px)',
              }}
            >
              <h2 className={`text-2xl font-bold ${getTextColor(theme)} mb-6 flex items-center gap-3`}>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'rgba(139, 92, 246, 0.2)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                Data & Privacy
              </h2>

              <div className="space-y-4">
                  <button
                  onClick={() => showToast('Data export started! Check your downloads.', 'success')}
                  className="w-full p-4 rounded-xl text-left transition-all hover:scale-[1.01]"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <p className={`font-semibold ${getTextColor(theme)} mb-1`}>Export Your Data</p>
                  <p className={`text-sm ${getMutedTextColor(theme)}`}>Download all your data in CSV format</p>
                  </button>

                <div 
                  className="p-4 rounded-xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className={`text-sm ${getMutedTextColor(theme)}`}>Last synced: 2 hours ago</p>
                  </div>
                </div>

                  <button
                  onClick={() => setShowDeleteAccount(true)}
                  className="w-full p-4 rounded-xl text-left transition-all hover:scale-[1.01]"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <p className="font-semibold text-red-400 mb-1">Delete Account</p>
                  <p className="text-sm text-red-400/70">Permanently delete your account and all data</p>
                  </button>
              </div>
            </div>

            {/* About Section */}
            <div 
              className="rounded-3xl p-6 lg:p-8 shadow-2xl border backdrop-blur-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(25px)',
              }}
            >
              <h2 className={`text-2xl font-bold ${getTextColor(theme)} mb-6 flex items-center gap-3`}>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                About
              </h2>

              <div className="space-y-4">
                <div 
                  className="p-4 rounded-xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <p className={`font-semibold ${getTextColor(theme)} mb-1`}>Version</p>
                  <p className={`text-sm ${getMutedTextColor(theme)}`}>1.0.0</p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button className={`text-sm ${getTextColor(theme)} hover:underline`}>Privacy Policy</button>
                  <button className={`text-sm ${getTextColor(theme)} hover:underline`}>Terms of Service</button>
                  <button className={`text-sm ${getTextColor(theme)} hover:underline`}>Help & Support</button>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full p-6 rounded-3xl font-semibold text-white transition-all hover:scale-[1.02] shadow-2xl"
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                backdropFilter: 'blur(25px)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
              }}
            >
              Logout
            </button>
          </div>
        </PageContainer>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        onSave={handleSaveProfile}
        initialData={{ fullName, phoneNumber, email }}
      />
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onSave={handleChangePassword}
      />
      <CurrencySelectorSheet
        isOpen={showCurrencySelector}
        onClose={() => setShowCurrencySelector(false)}
        onSelect={handleCurrencySelect}
        currentCurrency={currency}
      />
      <NotificationPreferencesModal
        isOpen={showNotificationPrefs}
        onClose={() => setShowNotificationPrefs(false)}
        onSave={handleSaveNotifications}
        initialPreferences={notifications}
      />
      <DeleteAccountModal
        isOpen={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
        onConfirm={handleConfirmDeleteAccount}
      />
      {user && (
        <SpendingLimitsModal
          isOpen={showSpendingLimits}
          onClose={() => setShowSpendingLimits(false)}
          userId={user.id}
        />
      )}
    </DashboardLayout>
  );
}
