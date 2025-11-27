'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { getTextColor, getMutedTextColor, getCardTextColor } from '@/lib/utils';

export default function ContactUsPage() {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus('idle');

    // Simulate form submission
    setTimeout(() => {
      setSubmitting(false);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    }, 1500);
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
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero Header */}
          <div 
            className="rounded-[32px] p-8 md:p-12 mb-8 relative overflow-hidden"
            style={glassStyle}
          >
            <div 
              className="absolute inset-0 opacity-60 pointer-events-none"
              style={{
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)'
                  : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
              }}
            />
            <div className="relative z-10">
              <div className="flex-1">
                <h1 className={`text-4xl md:text-5xl font-bold ${getTextColor(theme)} mb-3`}>
                  Contact Us
                </h1>
                <p className={`${getMutedTextColor(theme)} text-lg`}>
                  We&apos;d love to hear from you! Get in touch with our team.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Contact Form */}
            <div 
              className="rounded-[32px] backdrop-blur-xl border shadow-2xl p-8 relative overflow-hidden"
              style={{
                backdropFilter: 'blur(30px)',
                background: theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.85)',
                border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(31, 41, 55, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              }}
            >
              <h2 className={`text-2xl font-bold ${getTextColor(theme)} mb-6`}>Send us a Message</h2>

              {submitStatus === 'success' && (
                <div 
                  className="mb-6 p-4 rounded-2xl backdrop-blur-md border animate-slide-down"
                  style={{
                    background: theme === 'dark' 
                      ? 'rgba(16, 185, 129, 0.2)' 
                      : 'rgba(16, 185, 129, 0.15)',
                    border: theme === 'dark' 
                      ? '1px solid rgba(16, 185, 129, 0.4)' 
                      : '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: theme === 'dark' 
                          ? 'rgba(16, 185, 129, 0.3)' 
                          : 'rgba(16, 185, 129, 0.2)',
                      }}
                    >
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className={`font-semibold ${getTextColor(theme)} mb-1`}>Message sent successfully!</p>
                      <p className={`text-sm ${getMutedTextColor(theme)}`}>We&apos;ll get back to you soon, In sha Allah.</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="name" className={`block text-sm font-medium ${getTextColor(theme)} mb-2`}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 rounded-2xl backdrop-blur-md bg-white/50 border border-white/30 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all ${getCardTextColor(theme, true)} placeholder-charcoal/50`}
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className={`block text-sm font-medium ${getTextColor(theme)} mb-2`}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 rounded-2xl backdrop-blur-md bg-white/50 border border-white/30 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all ${getCardTextColor(theme, true)} placeholder-charcoal/50`}
                    placeholder="your.email@example.com"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label htmlFor="subject" className={`block text-sm font-medium ${getTextColor(theme)} mb-2`}>
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 rounded-2xl backdrop-blur-md bg-white/50 border border-white/30 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all ${getCardTextColor(theme, true)}`}
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="zakat">Zakat Calculation Question</option>
                    <option value="feature">Feature Request</option>
                    <option value="bug">Report a Bug</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className={`block text-sm font-medium ${getTextColor(theme)} mb-2`}>
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className={`w-full px-4 py-3 rounded-2xl backdrop-blur-md bg-white/50 border border-white/30 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all ${getCardTextColor(theme, true)} placeholder-charcoal/50 resize-none`}
                    placeholder="Type your message here..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                    boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information & FAQ */}
            <div className="space-y-6">
              {/* Contact Info */}
              <div 
                className="rounded-[32px] backdrop-blur-xl border shadow-2xl p-8 relative overflow-hidden"
                style={{
                  backdropFilter: 'blur(30px)',
                  background: theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.85)',
                  border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(31, 41, 55, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                }}
              >
                <h2 className={`text-2xl font-bold ${getTextColor(theme)} mb-6`}>Get in Touch</h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0 backdrop-blur-md border border-emerald-500/30">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className={`font-semibold ${getTextColor(theme)} mb-1`}>Email</h3>
                      <p className={getMutedTextColor(theme)}>support@rizqtrackr.com</p>
                      <p className={`text-sm ${getMutedTextColor(theme)} opacity-60`}>We reply within 24-48 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0 backdrop-blur-md border border-cyan-500/30">
                      <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <div>
                      <h3 className={`font-semibold ${getTextColor(theme)} mb-1`}>Website</h3>
                      <p className={getMutedTextColor(theme)}>www.rizqtrackr.com</p>
                      <p className={`text-sm ${getMutedTextColor(theme)} opacity-60`}>Visit our knowledge base</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center flex-shrink-0 backdrop-blur-md border border-secondary/30">
                      <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className={`font-semibold ${getTextColor(theme)} mb-1`}>Support Hours</h3>
                      <p className={getMutedTextColor(theme)}>Monday - Friday</p>
                      <p className={`text-sm ${getMutedTextColor(theme)} opacity-60`}>9:00 AM - 5:00 PM (GMT)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ */}
              <div 
                className="rounded-[32px] backdrop-blur-xl border shadow-2xl p-8 relative overflow-hidden"
                style={glassStyle}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-md"
                    style={{
                      background: theme === 'dark' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.15)',
                    }}
                  >
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className={`text-2xl font-bold ${getTextColor(theme)}`}>Quick Answers</h2>
                </div>
                <div className="space-y-6">
                  {[
                    {
                      q: 'How do I reset my password?',
                      a: 'Go to Settings → Security → Change Password',
                      icon: '🔐',
                    },
                    {
                      q: 'Is my data secure?',
                      a: 'Yes! We use bank-level encryption to protect your financial data.',
                      icon: '🛡️',
                    },
                    {
                      q: 'How accurate is the Zakat calculator?',
                      a: 'Our calculator follows authentic Islamic sources, but we recommend consulting a scholar for verification.',
                      icon: '🕌',
                    },
                  ].map((faq, idx) => (
                    <div 
                      key={idx}
                      className="p-4 rounded-xl backdrop-blur-md border transition-all hover:scale-[1.02]"
                      style={{
                        background: theme === 'dark' 
                          ? 'rgba(255, 255, 255, 0.05)' 
                          : 'rgba(255, 255, 255, 0.3)',
                        border: theme === 'dark' 
                          ? '1px solid rgba(255, 255, 255, 0.1)' 
                          : '1px solid rgba(31, 41, 55, 0.15)',
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{faq.icon}</span>
                        <div className="flex-1">
                          <h3 className={`font-semibold ${getTextColor(theme)} mb-1.5`}>{faq.q}</h3>
                          <p className={`text-sm ${getMutedTextColor(theme)}`}>{faq.a}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Islamic Message */}
              <div 
                className="rounded-[32px] backdrop-blur-xl border shadow-2xl p-6 relative overflow-hidden"
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
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-md"
                      style={{
                        background: theme === 'dark' 
                          ? 'rgba(245, 158, 11, 0.2)' 
                          : 'rgba(245, 158, 11, 0.15)',
                      }}
                    >
                      <span className="text-2xl">🕌</span>
                    </div>
                    <h3 className={`text-lg font-bold ${getTextColor(theme)}`}>Assalamu Alaikum</h3>
                  </div>
                  <p className={`text-sm ${getMutedTextColor(theme)} leading-relaxed`}>
                    We value your feedback and questions. May Allah bless your efforts in managing your finances in accordance with Islamic principles.
                  </p>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
