'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { getTextColor, getMutedTextColor, getCardTextColor } from '@/lib/utils';

export default function HelpPage() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [openFAQ, setOpenFAQ] = useState<{ category: string; index: number } | null>(null);

  const faqCategories = [
    {
      id: 'account',
      title: 'Account & Security',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      questions: [
        {
          q: 'How do I reset my password?',
          a: 'You can reset your password by clicking the "Forgot Password" link on the login page. We will send a reset link to your registered email address. Make sure to check your spam folder if you don\'t see it in your inbox.',
          related: ['Login issues', 'Security', 'Account access'],
        },
        {
          q: 'How do I update my profile information?',
          a: 'Navigate to Settings → Profile to update your personal information, including your name, email, and phone number. Changes are saved automatically.',
          related: ['Profile', 'Settings', 'Account'],
        },
        {
          q: 'Is my financial data secure?',
          a: 'Yes! We use bank-level encryption (AES-256) to protect all your financial data. Your information is stored securely using Supabase, which is SOC 2 Type II certified. We never share your data with third parties.',
          related: ['Security', 'Privacy', 'Data protection'],
        },
      ],
    },
    {
      id: 'transactions',
      title: 'Transactions & Records',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      questions: [
        {
          q: 'How do I add a new income entry?',
          a: 'Go to the Income page and click the "Add Income" button. Fill in the amount, category, date, and any notes. You can also mark income as Zakatable if it qualifies for Zakat calculation.',
          related: ['Income', 'Adding records', 'Categories'],
        },
        {
          q: 'Can I edit or delete transactions?',
          a: 'Yes! Click on any transaction in your transaction history to view details. You can edit or delete transactions from there. Deleted transactions cannot be recovered, so please be careful.',
          related: ['Editing', 'Deleting', 'Transaction history'],
        },
        {
          q: 'How do I filter my transactions?',
          a: 'On the Transactions page, use the filter section to search by category, date range, or transaction type. You can combine multiple filters for more specific results.',
          related: ['Filters', 'Search', 'Transactions'],
        },
      ],
    },
    {
      id: 'zakat',
      title: 'Zakat Calculator',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
        </svg>
      ),
      questions: [
        {
          q: 'How does the Zakat calculator work?',
          a: 'Our calculator follows authentic Islamic principles. It calculates Zakat based on your total Zakatable wealth (savings + Zakatable income - debts) and compares it to the Nisab threshold (equivalent to 85g of gold). If your wealth exceeds Nisab and has been held for one lunar year (Hawl), Zakat becomes obligatory at 2.5%.',
          related: ['Zakat', 'Calculation', 'Nisab'],
        },
        {
          q: 'What is considered Zakatable income?',
          a: 'Income from business, investments, and certain types of earnings are Zakatable. Salary and gifts may or may not be Zakatable depending on your school of thought. You can mark income as Zakatable when adding it, and we recommend consulting a scholar for guidance.',
          related: ['Zakatable', 'Income types', 'Islamic principles'],
        },
        {
          q: 'Can I record Zakat payments?',
          a: 'Yes! After calculating your Zakat, you can record payments directly in the Zakat calculator. This helps you track your Zakat obligations and payment history throughout the year.',
          related: ['Zakat payments', 'Recording', 'History'],
        },
      ],
    },
    {
      id: 'savings',
      title: 'Savings & Goals',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      questions: [
        {
          q: 'How do I set a savings goal?',
          a: 'Go to the Savings page and click "Add Goal". Enter your goal name, target amount, and optionally a target date. You can track your progress as you save towards your goal.',
          related: ['Goals', 'Savings', 'Planning'],
        },
        {
          q: 'How is my current savings calculated?',
          a: 'Your current savings are automatically calculated as: Total Income - Total Expenses. This gives you a real-time view of your available savings.',
          related: ['Savings', 'Calculation', 'Balance'],
        },
        {
          q: 'Can I track multiple savings goals?',
          a: 'Absolutely! You can create multiple savings goals and track progress for each one. Each goal shows your current progress, remaining amount, and completion percentage.',
          related: ['Multiple goals', 'Tracking', 'Progress'],
        },
      ],
    },
    {
      id: 'technical',
      title: 'Technical Support',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      questions: [
        {
          q: 'The app is running slowly. What should I do?',
          a: 'Try clearing your browser cache, closing unnecessary tabs, or refreshing the page. If the issue persists, check your internet connection. For mobile users, ensure you have the latest version of your browser.',
          related: ['Performance', 'Troubleshooting', 'Browser'],
        },
        {
          q: 'I\'m having trouble logging in. What can I do?',
          a: 'First, verify your email and password are correct. If you\'ve forgotten your password, use the "Forgot Password" link. Make sure cookies are enabled in your browser. If problems persist, contact our support team.',
          related: ['Login', 'Password', 'Access'],
        },
        {
          q: 'Can I export my financial data?',
          a: 'Yes! You can export your transaction history as a CSV file from the Transactions page. This allows you to backup your data or use it in other financial tools.',
          related: ['Export', 'Data', 'CSV'],
        },
      ],
    },
  ];

  const quickHelpCards = [
    {
      title: 'Getting Started',
      description: 'New to Rizq Trackr? Learn the basics',
      icon: '🚀',
      href: '#getting-started',
      color: 'emerald',
    },
    {
      title: 'Video Tutorials',
      description: 'Watch step-by-step guides',
      icon: '🎥',
      href: '#tutorials',
      color: 'blue',
    },
    {
      title: 'Zakat Guide',
      description: 'Understanding Zakat calculations',
      icon: '🕌',
      href: '/zakat',
      color: 'amber',
    },
    {
      title: 'Contact Support',
      description: 'Get help from our team',
      icon: '💬',
      href: '/contact',
      color: 'purple',
    },
  ];

  const glassStyle = {
    backdropFilter: 'blur(30px)',
    background: theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.85)',
    border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(31, 41, 55, 0.2)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
  };

  return (
    <div className="min-h-screen" style={{
      background: theme === 'dark'
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
        : 'linear-gradient(to bottom, #f8fafc, #e2e8f0, #f1f5f9)',
    }}>
      {/* Back to Home Link */}
      <div className="pt-6 px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium hover:underline" style={{
          color: theme === 'dark' ? '#10b981' : '#059669'
        }}>
          ← Back to Home
        </Link>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Hero Header Section */}
          <div 
            className="rounded-[32px] p-8 md:p-12 mb-8 relative overflow-hidden"
            style={glassStyle}
          >
            {/* Decorative gradient overlay */}
            <div 
              className="absolute inset-0 opacity-60 pointer-events-none"
              style={{
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(245, 158, 11, 0.15) 50%, rgba(139, 92, 246, 0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(245, 158, 11, 0.2) 50%, rgba(139, 92, 246, 0.15) 100%)',
              }}
            />
            
            {/* Islamic pattern overlay */}
            <div 
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '40px 40px'
              }}
            />

            <div className="relative z-10">
                <div className="flex-1">
                  <h1 className={`text-4xl md:text-5xl font-bold ${getTextColor(theme)} mb-3`}>
                    Help & Support Center
                  </h1>
                  <p className={`${getMutedTextColor(theme)} text-lg`}>
                    Find answers, get support, and learn how to make the most of Rizq Trackr
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative mt-8">
                <div className="relative">
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${getMutedTextColor(theme)}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(e.target.value.length > 0);
                    }}
                    onFocus={() => setShowSuggestions(searchQuery.length > 0)}
                    placeholder="Search for help articles, FAQs, or topics..."
                    className={`w-full pl-14 pr-4 py-4 rounded-2xl backdrop-blur-md border transition-all outline-none ${getCardTextColor(theme, theme === 'light')} placeholder-opacity-50`}
                    style={{
                      background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.6)',
                      border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(31, 41, 55, 0.2)',
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setShowSuggestions(false);
                      }}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 ${getMutedTextColor(theme)} hover:opacity-70 transition-opacity`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Help Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {quickHelpCards.map((card, index) => (
              <Link
                key={index}
                href={card.href}
                className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                style={glassStyle}
              >
                <div 
                  className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity"
                  style={{
                    background: `linear-gradient(135deg, var(--color-${card.color}-500), var(--color-${card.color}-600))`,
                  }}
                />
                <div className="relative z-10">
                  <div className="text-4xl mb-3">{card.icon}</div>
                  <h3 className={`text-lg font-semibold ${getTextColor(theme)} mb-2 group-hover:text-primary transition-colors`}>
                    {card.title}
                  </h3>
                  <p className={`text-sm ${getMutedTextColor(theme)}`}>
                    {card.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* FAQ Sections */}
          <div className="space-y-6 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-md"
                style={{
                  background: theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                }}
              >
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className={`text-3xl font-bold ${getTextColor(theme)}`}>Frequently Asked Questions</h2>
            </div>

            {faqCategories.map((category) => (
              <div
                key={category.id}
                className="rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01]"
                style={glassStyle}
              >
                <div className="p-6 flex items-center gap-4 border-b"
                  style={{
                    borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(31, 41, 55, 0.2)',
                  }}
                >
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center backdrop-blur-md"
                    style={{
                      background: theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                    }}
                  >
                    <div className="text-primary">
                      {category.icon}
                    </div>
                  </div>
                  <span className={`text-xl font-heading font-semibold flex-1 ${getTextColor(theme)}`}>
                    {category.title}
                  </span>
                </div>

                <div className="divide-y"
                  style={{
                    borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(31, 41, 55, 0.2)',
                  }}
                >
                  {category.questions.map((faq, idx) => {
                    const isOpen = openFAQ?.category === category.id && openFAQ?.index === idx;
                    return (
                      <div key={idx}>
                        <button
                          onClick={() => setOpenFAQ(isOpen ? null : { category: category.id, index: idx })}
                          className={`w-full p-6 text-left flex items-center justify-between hover:bg-opacity-10 transition-all group`}
                          style={{
                            background: isOpen 
                              ? (theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.05)')
                              : 'transparent',
                          }}
                        >
                          <span className={`font-heading font-semibold pr-4 ${getTextColor(theme)} group-hover:text-primary transition-colors`}>
                            {faq.q}
                          </span>
                          <svg
                            className={`w-5 h-5 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''} ${getMutedTextColor(theme)}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-6 animate-slide-down">
                            <p className={`mb-4 leading-relaxed ${getMutedTextColor(theme)}`}>
                              {faq.a}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {faq.related.map((related, ridx) => (
                                <span
                                  key={ridx}
                                  className="px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md transition-all hover:scale-105"
                                  style={{
                                    background: theme === 'dark' 
                                      ? 'rgba(16, 185, 129, 0.2)' 
                                      : 'rgba(16, 185, 129, 0.1)',
                                    color: theme === 'dark' ? '#6ee7b7' : '#059669',
                                    border: theme === 'dark' 
                                      ? '1px solid rgba(16, 185, 129, 0.3)' 
                                      : '1px solid rgba(16, 185, 129, 0.2)',
                                  }}
                                >
                                  {related}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Support CTA */}
          <div 
            className="rounded-[32px] p-8 md:p-12 text-center relative overflow-hidden"
            style={glassStyle}
          >
            <div 
              className="absolute inset-0 opacity-60 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
              }}
            />
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center backdrop-blur-md"
                style={{
                  background: theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                }}
              >
                <span className="text-4xl">💬</span>
              </div>
              <h2 className={`text-3xl font-bold ${getTextColor(theme)} mb-3`}>Still Need Help?</h2>
              <p className={`${getMutedTextColor(theme)} mb-8 max-w-2xl mx-auto text-lg`}>
                Our support team is here to assist you. Reach out to us and we&apos;ll get back to you within 24-48 hours, In sha Allah.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                    boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  Contact Support
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/help"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 backdrop-blur-md border"
                  style={{
                    background: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)',
                    border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(31, 41, 55, 0.2)',
                    color: theme === 'light' ? '#1e293b' : '#f1f5f9',
                  }}
                >
                  Browse All Articles
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
