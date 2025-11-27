'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { getTextColor, getMutedTextColor } from '@/lib/utils';

const sections = [
  { id: 'introduction', title: 'Introduction', icon: '📋' },
  { id: 'information', title: 'Information We Collect', icon: '📊' },
  { id: 'usage', title: 'How We Use Your Information', icon: '🔧' },
  { id: 'security', title: 'Data Security', icon: '🔒' },
  { id: 'sharing', title: 'Data Sharing', icon: '🤝' },
  { id: 'rights', title: 'Your Privacy Rights', icon: '⚖️' },
  { id: 'islamic', title: 'Islamic Principles', icon: '🕌' },
  { id: 'contact', title: 'Contact Us', icon: '📧' },
  { id: 'updates', title: 'Policy Updates', icon: '🔄' },
];

export default function PrivacyPolicyPage() {
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState<string>('introduction');

  useEffect(() => {

    // Scroll spy for table of contents
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

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
        <div className="grid lg:grid-cols-4 gap-8">
            {/* Table of Contents - Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div 
                className="rounded-2xl p-6 sticky top-24"
                style={glassStyle}
              >
                <h3 className={`text-lg font-bold ${getTextColor(theme)} mb-4 flex items-center gap-2`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Contents
                </h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-3 group ${
                        activeSection === section.id
                          ? 'scale-105'
                          : 'hover:scale-105'
                      }`}
                      style={{
                        background: activeSection === section.id
                          ? (theme === 'dark' 
                              ? 'rgba(16, 185, 129, 0.2)' 
                              : 'rgba(16, 185, 129, 0.15)')
                          : 'transparent',
                        border: activeSection === section.id
                          ? (theme === 'dark' 
                              ? '1px solid rgba(16, 185, 129, 0.3)' 
                              : '1px solid rgba(16, 185, 129, 0.25)')
                          : '1px solid transparent',
                      }}
                    >
                      <span className="text-lg">{section.icon}</span>
                      <span 
                        className={`text-sm font-medium transition-colors ${
                          activeSection === section.id 
                            ? getTextColor(theme) 
                            : getMutedTextColor(theme)
                        } group-hover:${getTextColor(theme)}`}
                      >
                        {section.title}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Hero Header */}
              <div 
                className="rounded-[32px] p-8 md:p-12 relative overflow-hidden"
                style={glassStyle}
              >
                <div 
                  className="absolute inset-0 opacity-60 pointer-events-none"
                  style={{
                    background: theme === 'dark'
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)'
                      : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%)',
                  }}
                />
                <div className="relative z-10">
                    <div className="flex-1">
                      <h1 className={`text-4xl md:text-5xl font-bold ${getTextColor(theme)} mb-3`}>
                        Privacy Policy
                      </h1>
                      <p className={`${getMutedTextColor(theme)} text-lg`}>
                        Last updated: November 19, 2025
                      </p>
                    </div>
                  </div>
                  <div
                    className="mt-6 p-4 rounded-xl backdrop-blur-md border"
                    style={{
                      background: theme === 'dark'
                        ? 'rgba(16, 185, 129, 0.1)'
                        : 'rgba(16, 185, 129, 0.08)',
                      border: theme === 'dark'
                        ? '1px solid rgba(16, 185, 129, 0.2)'
                        : '1px solid rgba(16, 185, 129, 0.15)',
                    }}
                  >
                    <p className={`${getMutedTextColor(theme)} leading-relaxed`}>
                      Your privacy is important to us. This policy explains how we collect, use, and protect your personal information in accordance with Islamic principles of trust and integrity.
                    </p>
                  </div>
                </div>

            {/* Introduction */}
              <section id="introduction" className="scroll-mt-24">
                <div 
                  className="rounded-[32px] p-8 relative overflow-hidden"
                  style={glassStyle}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center backdrop-blur-md"
                      style={{
                        background: theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)',
                      }}
                    >
                      <span className="text-2xl">📋</span>
                    </div>
                    <h2 className={`text-3xl font-bold ${getTextColor(theme)}`}>Introduction</h2>
                  </div>
                  <p className={`${getMutedTextColor(theme)} leading-relaxed text-lg`}>
                Welcome to Rizq Trackr. We are committed to protecting your personal information and your right to privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our
                Islamic finance tracking application.
              </p>
            </div>
              </section>

            {/* Information We Collect */}
              <section id="information" className="scroll-mt-24">
                <div 
                  className="rounded-[32px] p-8 relative overflow-hidden"
                  style={glassStyle}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center backdrop-blur-md"
                      style={{
                        background: theme === 'dark' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)',
                      }}
                    >
                      <span className="text-2xl">📊</span>
                    </div>
                    <h2 className={`text-3xl font-bold ${getTextColor(theme)}`}>Information We Collect</h2>
                  </div>
                  <div className="space-y-6">
                <div>
                      <h3 className={`text-xl font-semibold ${getTextColor(theme)} mb-3 flex items-center gap-2`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Personal Information
                      </h3>
                      <ul className={`list-disc list-inside ${getMutedTextColor(theme)} space-y-2 ml-4`}>
                    <li>Email address and account credentials</li>
                    <li>Name and profile information</li>
                    <li>Financial transaction data (income, expenses, savings)</li>
                    <li>Zakat calculation data</li>
                  </ul>
                </div>
                <div>
                      <h3 className={`text-xl font-semibold ${getTextColor(theme)} mb-3 flex items-center gap-2`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Automatically Collected Information
                      </h3>
                      <ul className={`list-disc list-inside ${getMutedTextColor(theme)} space-y-2 ml-4`}>
                    <li>Device information and IP address</li>
                    <li>Browser type and version</li>
                    <li>Usage data and analytics</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </div>
              </section>

            {/* How We Use Your Information */}
              <section id="usage" className="scroll-mt-24">
                <div 
                  className="rounded-[32px] p-8 relative overflow-hidden"
                  style={glassStyle}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center backdrop-blur-md"
                      style={{
                        background: theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                      }}
                    >
                      <span className="text-2xl">🔧</span>
                    </div>
                    <h2 className={`text-3xl font-bold ${getTextColor(theme)}`}>How We Use Your Information</h2>
                  </div>
                  <p className={`${getMutedTextColor(theme)} mb-4`}>We use your information to:</p>
                  <ul className={`list-disc list-inside ${getMutedTextColor(theme)} space-y-3 ml-4`}>
                <li>Provide and maintain our finance tracking services</li>
                <li>Calculate Zakat obligations based on Islamic principles</li>
                <li>Generate financial reports and analytics</li>
                <li>Send important notifications about your account</li>
                <li>Improve our services and user experience</li>
                <li>Prevent fraud and ensure security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
              </section>

            {/* Data Security */}
              <section id="security" className="scroll-mt-24">
                <div 
                  className="rounded-[32px] p-8 relative overflow-hidden"
                  style={glassStyle}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center backdrop-blur-md"
                      style={{
                        background: theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)',
                      }}
                    >
                      <span className="text-2xl">🔒</span>
                    </div>
                    <h2 className={`text-3xl font-bold ${getTextColor(theme)}`}>Data Security</h2>
                  </div>
                  <p className={`${getMutedTextColor(theme)} leading-relaxed mb-4`}>
                We implement industry-standard security measures to protect your personal information:
              </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      'End-to-end encryption for sensitive data',
                      'Secure authentication using Supabase',
                      'Regular security audits and updates',
                      'Restricted access to personal information',
                      'Secure data storage and backup procedures',
                    ].map((item, idx) => (
                      <div 
                        key={idx}
                        className="p-4 rounded-xl backdrop-blur-md border flex items-start gap-3"
                        style={{
                          background: theme === 'dark' 
                            ? 'rgba(255, 255, 255, 0.05)' 
                            : 'rgba(255, 255, 255, 0.3)',
                          border: theme === 'dark' 
                            ? '1px solid rgba(255, 255, 255, 0.1)' 
                            : '1px solid rgba(31, 41, 55, 0.15)',
                        }}
                      >
                        <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className={`${getMutedTextColor(theme)}`}>{item}</span>
                      </div>
                    ))}
                  </div>
            </div>
              </section>

            {/* Data Sharing */}
              <section id="sharing" className="scroll-mt-24">
                <div 
                  className="rounded-[32px] p-8 relative overflow-hidden"
                  style={glassStyle}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center backdrop-blur-md"
                      style={{
                        background: theme === 'dark' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.15)',
                      }}
                    >
                      <span className="text-2xl">🤝</span>
                    </div>
                    <h2 className={`text-3xl font-bold ${getTextColor(theme)}`}>Data Sharing and Disclosure</h2>
                  </div>
                  <p className={`${getMutedTextColor(theme)} leading-relaxed mb-4`}>
                We do not sell your personal information. We may share your information only in the following circumstances:
              </p>
                  <ul className={`list-disc list-inside ${getMutedTextColor(theme)} space-y-3 ml-4`}>
                <li>With your explicit consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and prevent fraud</li>
                <li>With trusted service providers who assist in operations (under strict confidentiality agreements)</li>
                <li>In connection with a business transfer or merger</li>
              </ul>
            </div>
              </section>

            {/* Your Rights */}
              <section id="rights" className="scroll-mt-24">
                <div 
                  className="rounded-[32px] p-8 relative overflow-hidden"
                  style={glassStyle}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center backdrop-blur-md"
                      style={{
                        background: theme === 'dark' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                      }}
                    >
                      <span className="text-2xl">⚖️</span>
                    </div>
                    <h2 className={`text-3xl font-bold ${getTextColor(theme)}`}>Your Privacy Rights</h2>
                  </div>
                  <p className={`${getMutedTextColor(theme)} mb-4`}>You have the right to:</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      'Access your personal information',
                      'Correct inaccurate or incomplete data',
                      'Request deletion of your data',
                      'Export your data in a portable format',
                      'Opt-out of marketing communications',
                      'Withdraw consent for data processing',
                    ].map((right, idx) => (
                      <div 
                        key={idx}
                        className="p-4 rounded-xl backdrop-blur-md border flex items-start gap-3"
                        style={{
                          background: theme === 'dark' 
                            ? 'rgba(255, 255, 255, 0.05)' 
                            : 'rgba(255, 255, 255, 0.3)',
                          border: theme === 'dark' 
                            ? '1px solid rgba(255, 255, 255, 0.1)' 
                            : '1px solid rgba(31, 41, 55, 0.15)',
                        }}
                      >
                        <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className={`${getMutedTextColor(theme)}`}>{right}</span>
                      </div>
                    ))}
                  </div>
            </div>
              </section>

            {/* Islamic Principles */}
              <section id="islamic" className="scroll-mt-24">
                <div 
                  className="rounded-[32px] p-8 relative overflow-hidden"
                  style={{
                    ...glassStyle,
                    background: theme === 'dark' 
                      ? 'rgba(16, 185, 129, 0.15)' 
                      : 'rgba(16, 185, 129, 0.1)',
                    border: theme === 'dark' 
                      ? '1px solid rgba(16, 185, 129, 0.3)' 
                      : '1px solid rgba(16, 185, 129, 0.25)',
                  }}
                >
                  <div 
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)',
                    }}
                  />
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div 
                        className="w-14 h-14 rounded-xl flex items-center justify-center backdrop-blur-md"
                        style={{
                          background: theme === 'dark' 
                            ? 'rgba(245, 158, 11, 0.2)' 
                            : 'rgba(245, 158, 11, 0.15)',
                        }}
                      >
                        <span className="text-2xl">🕌</span>
                      </div>
                      <h2 className={`text-3xl font-bold ${getTextColor(theme)}`}>Islamic Principles</h2>
              </div>
                    <p className={`${getMutedTextColor(theme)} leading-relaxed text-lg`}>
                Our privacy practices align with Islamic values of trust (Amanah) and integrity. We are committed to
                handling your information with the utmost honesty and transparency, in accordance with Islamic ethical
                principles. Your financial data, especially Zakat calculations, is treated with special care and
                confidentiality as befitting the sacred nature of this obligation.
              </p>
            </div>
                </div>
              </section>

            {/* Contact */}
              <section id="contact" className="scroll-mt-24">
                <div 
                  className="rounded-[32px] p-8 relative overflow-hidden"
                  style={glassStyle}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center backdrop-blur-md"
                      style={{
                        background: theme === 'dark' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(6, 182, 212, 0.15)',
                      }}
                    >
                      <span className="text-2xl">📧</span>
                    </div>
                    <h2 className={`text-3xl font-bold ${getTextColor(theme)}`}>Contact Us</h2>
                  </div>
                  <p className={`${getMutedTextColor(theme)} leading-relaxed mb-4`}>
                If you have questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
                  <div 
                    className="p-6 rounded-xl backdrop-blur-md border space-y-3"
                    style={{
                      background: theme === 'dark' 
                        ? 'rgba(255, 255, 255, 0.05)' 
                        : 'rgba(255, 255, 255, 0.3)',
                      border: theme === 'dark' 
                        ? '1px solid rgba(255, 255, 255, 0.1)' 
                        : '1px solid rgba(31, 41, 55, 0.15)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className={getMutedTextColor(theme)}><strong className={getTextColor(theme)}>Email:</strong> privacy@financetracker.com</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <span className={getMutedTextColor(theme)}><strong className={getTextColor(theme)}>Website:</strong> www.financetracker.com</span>
                    </div>
                    <p className={`${getMutedTextColor(theme)} mt-4`}>
                  We will respond to your inquiry within 48 hours, In sha Allah.
                </p>
              </div>
            </div>
              </section>

            {/* Updates */}
              <section id="updates" className="scroll-mt-24">
                <div 
                  className="rounded-[32px] p-8 relative overflow-hidden"
                  style={glassStyle}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center backdrop-blur-md"
                      style={{
                        background: theme === 'dark' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(168, 85, 247, 0.15)',
                      }}
                    >
                      <span className="text-2xl">🔄</span>
                    </div>
                    <h2 className={`text-3xl font-bold ${getTextColor(theme)}`}>Changes to This Privacy Policy</h2>
                  </div>
                  <p className={`${getMutedTextColor(theme)} leading-relaxed`}>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the
                new Privacy Policy on this page and updating the &quot;Last updated&quot; date. We encourage you to review this
                Privacy Policy periodically for any changes.
              </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
