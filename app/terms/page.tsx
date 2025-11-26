'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { getTextColor, getMutedTextColor } from '@/lib/utils';

const sections = [
  { id: 'agreement', title: 'Agreement to Terms', icon: '📝' },
  { id: 'services', title: 'Description of Services', icon: '🎯' },
  { id: 'accounts', title: 'User Accounts', icon: '👤' },
  { id: 'acceptable', title: 'Acceptable Use', icon: '✅' },
  { id: 'zakat', title: 'Zakat Disclaimer', icon: '🕌' },
  { id: 'intellectual', title: 'Intellectual Property', icon: '©️' },
  { id: 'liability', title: 'Limitation of Liability', icon: '⚖️' },
  { id: 'disclaimers', title: 'Disclaimers', icon: '⚠️' },
  { id: 'changes', title: 'Changes to Terms', icon: '🔄' },
  { id: 'governing', title: 'Governing Law', icon: '🌍' },
  { id: 'contact', title: 'Contact Us', icon: '📧' },
];

export default function TermsOfServicePage() {
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState<string>('agreement');

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
                        Terms of Service
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
                      Please read these Terms of Service carefully before using Rizq Trackr. By accessing or using our service, you agree to be bound by these terms.
                    </p>
                  </div>
                </div>
              </div>

              {/* Agreement */}
              <section id="agreement" className="scroll-mt-24">
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
                      <span className="text-2xl">📝</span>
                    </div>
                    <h2 className={`text-3xl font-bold ${getTextColor(theme)}`}>Agreement to Terms</h2>
                  </div>
                  <p className={`${getMutedTextColor(theme)} leading-relaxed text-lg`}>
                    By accessing or using Rizq Trackr, you agree to be bound by these Terms of Service. If you disagree
                    with any part of these terms, you may not access the service. These terms apply to all visitors, users,
                    and others who access or use the service.
                  </p>
                </div>
              </section>

              {/* Services */}
              <section id="services" className="scroll-mt-24">
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
                      <span className="text-2xl">🎯</span>
                    </div>
                    <h2 className={`text-3xl font-bold ${getTextColor(theme)}`}>Description of Services</h2>
                  </div>
                  <p className={`${getMutedTextColor(theme)} mb-4`}>Rizq Trackr provides:</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      'Personal finance tracking and management tools',
                      'Income and expense tracking',
                      'Islamic Zakat calculation based on Shariah principles',
                      'Savings goals and progress monitoring',
                      'Financial analytics and reporting',
                      'Transaction history and categorization',
                    ].map((service, idx) => (
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
                        <span className={getMutedTextColor(theme)}>{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* User Accounts */}
              <section id="accounts" className="scroll-mt-24">
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
                      <span className="text-2xl">👤</span>
                    </div>
                    <h2 className={`text-3xl font-bold ${getTextColor(theme)}`}>User Accounts</h2>
                  </div>
                  <div className="space-y-4">
                    {[
                      { title: 'Account Creation', text: 'You must provide accurate and complete information when creating an account.' },
                      { title: 'Account Security', text: 'You are responsible for maintaining the confidentiality of your account credentials.' },
                      { title: 'Account Termination', text: 'We reserve the right to terminate accounts that violate these terms or engage in fraudulent activity.' },
                      { title: 'Age Requirement', text: 'You must be at least 13 years old to use our service.' },
                    ].map((item, idx) => (
                      <div 
                        key={idx}
                        className="p-5 rounded-xl backdrop-blur-md border"
                        style={{
                          background: theme === 'dark' 
                            ? 'rgba(255, 255, 255, 0.05)' 
                            : 'rgba(255, 255, 255, 0.3)',
                          border: theme === 'dark' 
                            ? '1px solid rgba(255, 255, 255, 0.1)' 
                            : '1px solid rgba(31, 41, 55, 0.15)',
                        }}
                      >
                        <h3 className={`font-semibold ${getTextColor(theme)} mb-2`}>{item.title}:</h3>
                        <p className={getMutedTextColor(theme)}>{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Acceptable Use */}
              <section id="acceptable" className="scroll-mt-24">
                <div 
                  className="rounded-[32px] p-8 relative overflow-hidden"
                  style={glassStyle}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center backdrop-blur-md"
                      style={{
                        background: theme === 'dark' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)',
                      }}
                    >
                      <span className="text-2xl">✅</span>
                    </div>
                    <h2 className={`text-3xl font-bold ${getTextColor(theme)}`}>Acceptable Use Policy</h2>
                  </div>
                  <p className={`${getMutedTextColor(theme)} mb-4`}>You agree NOT to:</p>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      'Use the service for any illegal purposes',
                      'Attempt to gain unauthorized access to our systems',
                      'Upload malicious code or viruses',
                      'Harass, abuse, or harm other users',
                      'Impersonate another person or entity',
                      'Share your account with others',
                      'Scrape or collect data without permission',
                      'Interfere with the proper functioning of the service',
                    ].map((item, idx) => (
                      <div 
                        key={idx}
                        className="p-3 rounded-xl backdrop-blur-md border flex items-start gap-3"
                        style={{
                          background: theme === 'dark' 
                            ? 'rgba(239, 68, 68, 0.1)' 
                            : 'rgba(239, 68, 68, 0.08)',
                          border: theme === 'dark' 
                            ? '1px solid rgba(239, 68, 68, 0.2)' 
                            : '1px solid rgba(239, 68, 68, 0.15)',
                        }}
                      >
                        <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className={getMutedTextColor(theme)}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Zakat Calculations */}
              <section id="zakat" className="scroll-mt-24">
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
                      <h2 className={`text-3xl font-bold ${getTextColor(theme)}`}>Zakat Calculation Disclaimer</h2>
                    </div>
                    <p className={`${getMutedTextColor(theme)} leading-relaxed mb-4`}>
                      While we strive to provide accurate Zakat calculations based on authentic Islamic sources and scholarly consensus:
                    </p>
                    <ul className={`list-disc list-inside ${getMutedTextColor(theme)} space-y-3 ml-4`}>
                      <li>Our Zakat calculator is a tool to assist you; it is not a substitute for consultation with qualified Islamic scholars</li>
                      <li>Different schools of Islamic jurisprudence may have varying interpretations</li>
                      <li>You are ultimately responsible for verifying calculations with a knowledgeable scholar</li>
                      <li>We are not liable for any errors in Zakat calculations or their religious implications</li>
                      <li>The final decision on Zakat obligations rests with you and your religious advisor</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Intellectual Property */}
              <section id="intellectual" className="scroll-mt-24">
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
                      <span className="text-2xl">©️</span>
                    </div>
                    <h2 className={`text-3xl font-bold ${getTextColor(theme)}`}>Intellectual Property</h2>
                  </div>
                  <p className={`${getMutedTextColor(theme)} leading-relaxed mb-4`}>
                    The service and its original content, features, and functionality are owned by Rizq Trackr and are
                    protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                  </p>
                  <p className={getMutedTextColor(theme)}>
                    Your financial data remains yours. We do not claim ownership of any information you provide through the service.
                  </p>
                </div>
              </section>

              {/* Limitation of Liability */}
              <section id="liability" className="scroll-mt-24">
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
                    <h2 className={`text-3xl font-bold ${getTextColor(theme)}`}>Limitation of Liability</h2>
                  </div>
                  <p className={`${getMutedTextColor(theme)} leading-relaxed mb-4`}>
                    Rizq Trackr and its affiliates shall not be liable for:
                  </p>
                  <ul className={`list-disc list-inside ${getMutedTextColor(theme)} space-y-3 ml-4`}>
                    <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                    <li>Loss of profits, revenue, data, or use</li>
                    <li>Service interruptions or technical failures</li>
                    <li>Errors or inaccuracies in financial calculations</li>
                    <li>Unauthorized access to your data due to security breaches beyond our control</li>
                    <li>Any financial decisions made based on the service</li>
                  </ul>
                </div>
              </section>

              {/* Disclaimers */}
              <section id="disclaimers" className="scroll-mt-24">
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
                      <span className="text-2xl">⚠️</span>
                    </div>
                    <h2 className={`text-3xl font-bold ${getTextColor(theme)}`}>Disclaimers</h2>
                  </div>
                  <div className="space-y-4">
                    {[
                      { title: 'Financial Advice', text: 'Rizq Trackr is a tool for tracking finances. It does not provide financial, tax, or investment advice.' },
                      { title: 'Religious Guidance', text: 'Zakat calculations are provided as a convenience. Always consult with qualified Islamic scholars for religious matters.' },
                      { title: 'Accuracy', text: 'While we strive for accuracy, we do not guarantee that all information is error-free or up-to-date.' },
                      { title: 'Service Availability', text: 'We do not guarantee uninterrupted or error-free service.' },
                    ].map((item, idx) => (
                      <div 
                        key={idx}
                        className="p-5 rounded-xl backdrop-blur-md border"
                        style={{
                          background: theme === 'dark' 
                            ? 'rgba(255, 255, 255, 0.05)' 
                            : 'rgba(255, 255, 255, 0.3)',
                          border: theme === 'dark' 
                            ? '1px solid rgba(255, 255, 255, 0.1)' 
                            : '1px solid rgba(31, 41, 55, 0.15)',
                        }}
                      >
                        <h3 className={`font-semibold ${getTextColor(theme)} mb-2`}>{item.title}:</h3>
                        <p className={getMutedTextColor(theme)}>{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Changes to Terms */}
              <section id="changes" className="scroll-mt-24">
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
                    <h2 className={`text-3xl font-bold ${getTextColor(theme)}`}>Changes to Terms</h2>
                  </div>
                  <p className={getMutedTextColor(theme)}>
                    We reserve the right to modify or replace these Terms at any time. We will provide notice of significant
                    changes by posting a notice on our service or sending you an email. Your continued use of the service
                    after such modifications constitutes acceptance of the updated Terms.
                  </p>
                </div>
              </section>

              {/* Governing Law */}
              <section id="governing" className="scroll-mt-24">
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
                      <span className="text-2xl">🌍</span>
                    </div>
                    <h2 className={`text-3xl font-bold ${getTextColor(theme)}`}>Governing Law</h2>
                  </div>
                  <p className={getMutedTextColor(theme)}>
                    These Terms shall be governed by and construed in accordance with applicable laws, without regard to
                    conflict of law provisions. Any disputes arising from these Terms shall be resolved through binding
                    arbitration or in courts of competent jurisdiction.
                  </p>
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
                    If you have questions about these Terms of Service, please contact us:
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
                      <span className={getMutedTextColor(theme)}><strong className={getTextColor(theme)}>Email:</strong> legal@financetracker.com</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      <span className={getMutedTextColor(theme)}><strong className={getTextColor(theme)}>Website:</strong> www.financetracker.com</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
