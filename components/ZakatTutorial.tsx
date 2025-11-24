'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';
import { getTextColor, getMutedTextColor } from '@/lib/utils';

interface ZakatTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const TUTORIAL_PAGES = [
  {
    title: 'Introduction to Zakat',
    icon: '🕌',
    content: (
      <div className="space-y-4">
        <p className="text-lg leading-relaxed">
          Zakat is one of the Five Pillars of Islam and is an obligatory act of worship for Muslims who meet certain criteria.
        </p>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📿</span>
            <div>
              <p className="font-semibold mb-1">Religious Obligation</p>
              <p className="text-sm opacity-80">Zakat is a mandatory charity, not voluntary giving</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <p className="font-semibold mb-1">Wealth Purification</p>
              <p className="text-sm opacity-80">It purifies your wealth and helps those in need</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🤝</span>
            <div>
              <p className="font-semibold mb-1">Social Responsibility</p>
              <p className="text-sm opacity-80">It strengthens community bonds and reduces poverty</p>
            </div>
          </div>
        </div>
        <div className="mt-6 p-4 rounded-xl" style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        }}>
          <p className="text-sm italic">
            "And establish prayer and give Zakat, and whatever good you put forward for yourselves - you will find it with Allah." - Quran 2:110
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'What is Nisab?',
    icon: '⚖️',
    content: (
      <div className="space-y-4">
        <p className="text-lg leading-relaxed">
          Nisab is the minimum threshold of wealth that a Muslim must possess before Zakat becomes obligatory.
        </p>
        <div className="space-y-4">
          <div className="p-4 rounded-xl" style={{
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
          }}>
            <p className="font-semibold mb-2 flex items-center gap-2">
              <span className="text-xl">🥇</span>
              Based on Gold
            </p>
            <p className="text-sm opacity-80">
              <strong>87.48 grams</strong> of gold (approximately 3 ounces)
            </p>
            <p className="text-xs mt-2 opacity-70">
              This is the most commonly used standard today
            </p>
          </div>
          <div className="p-4 rounded-xl" style={{
            background: 'rgba(156, 163, 175, 0.1)',
            border: '1px solid rgba(156, 163, 175, 0.3)',
          }}>
            <p className="font-semibold mb-2 flex items-center gap-2">
              <span className="text-xl">🥈</span>
              Based on Silver
            </p>
            <p className="text-sm opacity-80">
              <strong>612.36 grams</strong> of silver (approximately 21 ounces)
            </p>
            <p className="text-xs mt-2 opacity-70">
              Historically used, but less common today
            </p>
          </div>
        </div>
        <div className="mt-4 p-4 rounded-xl" style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
        }}>
          <p className="text-sm font-semibold mb-2">💡 Key Point</p>
          <p className="text-sm opacity-80">
            The Nisab value changes daily based on current gold and silver prices. You should use whichever standard results in a lower threshold to be more cautious.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Nisab Calculation',
    icon: '🧮',
    content: (
      <div className="space-y-4">
        <p className="text-lg leading-relaxed">
          Nisab is calculated by converting the weight of gold or silver to your local currency using current market prices.
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-xl" style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}>
            <p className="font-semibold mb-2">Example Calculation (Gold-based)</p>
            <div className="space-y-2 text-sm">
              <p className="opacity-80">Gold price per gram: <strong>$65</strong></p>
              <p className="opacity-80">Required weight: <strong>87.48 grams</strong></p>
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="font-bold text-lg">
                  Nisab = 87.48 × $65 = <span className="text-cyan-400">$5,686</span>
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl" style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}>
            <p className="font-semibold mb-2">Example Calculation (Silver-based)</p>
            <div className="space-y-2 text-sm">
              <p className="opacity-80">Silver price per gram: <strong>$0.85</strong></p>
              <p className="opacity-80">Required weight: <strong>612.36 grams</strong></p>
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="font-bold text-lg">
                  Nisab = 612.36 × $0.85 = <span className="text-cyan-400">$520</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 p-4 rounded-xl" style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        }}>
          <p className="text-sm font-semibold mb-2">⚠️ Important Note</p>
          <p className="text-sm opacity-80">
            Most scholars recommend using the gold-based Nisab as it's more stable and reflects modern economic conditions. The silver-based Nisab is typically much lower and may not accurately represent the threshold.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Hawl: The Lunar Year',
    icon: '📅',
    content: (
      <div className="space-y-4">
        <p className="text-lg leading-relaxed">
          For Zakat to be obligatory, your wealth must remain above the Nisab threshold for a complete <strong>lunar year (Hawl)</strong>.
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-xl" style={{
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
          }}>
            <p className="font-semibold mb-2">🌙 What is Hawl?</p>
            <p className="text-sm opacity-80">
              Hawl is one complete Islamic lunar year, which is approximately <strong>354 days</strong> (11 days shorter than a solar year).
            </p>
          </div>
          <div className="p-4 rounded-xl" style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}>
            <p className="font-semibold mb-2">📊 How It Works</p>
            <div className="space-y-2 text-sm">
              <p className="opacity-80">1. Your wealth exceeds Nisab on a specific date</p>
              <p className="opacity-80">2. You must maintain wealth above Nisab for 12 lunar months</p>
              <p className="opacity-80">3. After one full year, Zakat becomes due</p>
              <p className="opacity-80">4. You pay 2.5% of your total zakatable wealth</p>
            </div>
          </div>
          <div className="p-4 rounded-xl" style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}>
            <p className="font-semibold mb-2">💡 Example</p>
            <p className="text-sm opacity-80">
              If your wealth first exceeded Nisab on <strong>1st Ramadan 1444</strong>, your Zakat will be due on <strong>1st Ramadan 1445</strong> (one lunar year later).
            </p>
          </div>
        </div>
        <div className="mt-4 p-4 rounded-xl" style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        }}>
          <p className="text-sm font-semibold mb-2">⚠️ Important</p>
          <p className="text-sm opacity-80">
            If your wealth drops below Nisab at any point during the year, the countdown resets. You must start counting from when your wealth exceeds Nisab again.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'What is Zakatable?',
    icon: '💎',
    content: (
      <div className="space-y-4">
        <p className="text-lg leading-relaxed">
          Not all wealth is subject to Zakat. Here's what counts as zakatable wealth:
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-xl" style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}>
            <p className="font-semibold mb-2 flex items-center gap-2">
              <span className="text-xl">💵</span>
              Cash & Savings
            </p>
            <p className="text-sm opacity-80">Money in bank accounts, cash at home, and savings</p>
          </div>
          <div className="p-4 rounded-xl" style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}>
            <p className="font-semibold mb-2 flex items-center gap-2">
              <span className="text-xl">🥇</span>
              Gold & Silver
            </p>
            <p className="text-sm opacity-80">Jewelry, coins, or bullion (if not for personal use)</p>
          </div>
          <div className="p-4 rounded-xl" style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}>
            <p className="font-semibold mb-2 flex items-center gap-2">
              <span className="text-xl">📈</span>
              Investments
            </p>
            <p className="text-sm opacity-80">Stocks, bonds, mutual funds, and business inventory</p>
          </div>
          <div className="p-4 rounded-xl" style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}>
            <p className="font-semibold mb-2 flex items-center gap-2">
              <span className="text-xl">🏢</span>
              Business Assets
            </p>
            <p className="text-sm opacity-80">Inventory, equipment, and receivables</p>
          </div>
        </div>
        <div className="mt-4 p-4 rounded-xl" style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        }}>
          <p className="font-semibold mb-2">❌ Not Zakatable</p>
          <div className="space-y-1 text-sm opacity-80">
            <p>• Primary residence (your home)</p>
            <p>• Personal vehicle</p>
            <p>• Work tools and equipment</p>
            <p>• Household items and furniture</p>
            <p>• Debts owed to you (if unlikely to be repaid)</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Zakat Calculation (2.5%)',
    icon: '🧮',
    content: (
      <div className="space-y-4">
        <p className="text-lg leading-relaxed">
          Once you've determined your zakatable wealth exceeds Nisab for a full year, calculate Zakat at <strong>2.5%</strong> of your total zakatable wealth.
        </p>
        <div className="p-4 rounded-xl" style={{
          background: 'rgba(6, 182, 212, 0.1)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
        }}>
          <p className="font-semibold mb-3">📐 The Formula</p>
          <div className="space-y-2">
            <p className="text-sm opacity-80">Total Zakatable Wealth =</p>
            <p className="text-sm opacity-80">(Cash + Savings + Gold/Silver + Investments + Business Assets) - Debts</p>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-sm opacity-80 mb-2">Zakat Due =</p>
              <p className="text-2xl font-bold text-cyan-400">
                Total Zakatable Wealth × 2.5%
              </p>
              <p className="text-sm opacity-70 mt-2">or</p>
              <p className="text-xl font-bold text-cyan-400">
                Total Zakatable Wealth ÷ 40
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl" style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}>
          <p className="font-semibold mb-2">💡 Example Calculation</p>
          <div className="space-y-2 text-sm">
            <p className="opacity-80">Cash & Savings: <strong>$10,000</strong></p>
            <p className="opacity-80">Investments: <strong>$5,000</strong></p>
            <p className="opacity-80">Debts: <strong>-$2,000</strong></p>
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="opacity-80">Total Zakatable Wealth: <strong>$13,000</strong></p>
              <p className="text-lg font-bold mt-2">
                Zakat Due = $13,000 × 2.5% = <span className="text-emerald-400">$325</span>
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 p-4 rounded-xl" style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        }}>
          <p className="text-sm font-semibold mb-2">💡 Quick Tip</p>
          <p className="text-sm opacity-80">
            To quickly calculate 2.5%, divide your total by 40. For example: $10,000 ÷ 40 = $250
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Who Can Receive Zakat?',
    icon: '🤝',
    content: (
      <div className="space-y-4">
        <p className="text-lg leading-relaxed">
          Zakat can only be given to specific categories of people as defined in the Quran. These are the <strong>8 categories (Asnaf)</strong>:
        </p>
        <div className="grid grid-cols-1 gap-3">
          {[
            { icon: '🍞', title: 'The Poor (Fuqara)', desc: 'Those who don\'t have enough to meet basic needs' },
            { icon: '🏚️', title: 'The Needy (Masakin)', desc: 'Those in extreme poverty, worse off than the poor' },
            { icon: '👥', title: 'Zakat Administrators', desc: 'Those who collect and distribute Zakat' },
            { icon: '💝', title: 'New Muslims', desc: 'Those whose hearts are to be reconciled to Islam' },
            { icon: '🔗', title: 'Freeing Slaves', desc: 'Freeing captives and slaves (still relevant today)' },
            { icon: '💳', title: 'Those in Debt', desc: 'People burdened by debt they cannot repay' },
            { icon: '🛣️', title: 'In the Cause of Allah', desc: 'For Islamic causes and spreading knowledge' },
            { icon: '🧳', title: 'Travelers', desc: 'Stranded travelers in need of assistance' },
          ].map((category, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl flex items-start gap-3"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <span className="text-2xl">{category.icon}</span>
              <div>
                <p className="font-semibold text-sm mb-1">{category.title}</p>
                <p className="text-xs opacity-80">{category.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 rounded-xl" style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        }}>
          <p className="text-sm font-semibold mb-2">❌ Who Cannot Receive Zakat?</p>
          <div className="space-y-1 text-sm opacity-80">
            <p>• Your immediate family (spouse, children, parents)</p>
            <p>• Non-Muslims (unless they fall into specific categories)</p>
            <p>• Those who are wealthy enough to meet their needs</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'When to Pay Zakat?',
    icon: '⏰',
    content: (
      <div className="space-y-4">
        <p className="text-lg leading-relaxed">
          Zakat should be paid once per lunar year, typically during <strong>Ramadan</strong>, though it can be paid at any time once it becomes due.
        </p>
        <div className="space-y-3">
          <div className="p-4 rounded-xl" style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
          }}>
            <p className="font-semibold mb-2 flex items-center gap-2">
              <span className="text-xl">🌙</span>
              Best Time: Ramadan
            </p>
            <p className="text-sm opacity-80">
              Most Muslims pay Zakat during Ramadan because rewards are multiplied in this blessed month. However, you can pay it at any time once your Hawl (lunar year) is complete.
            </p>
          </div>
          <div className="p-4 rounded-xl" style={{
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
          }}>
            <p className="font-semibold mb-2 flex items-center gap-2">
              <span className="text-xl">📅</span>
              Your Zakat Date
            </p>
            <p className="text-sm opacity-80 mb-2">
              Your personal Zakat date is determined by when your wealth first exceeded Nisab. This date should be tracked annually.
            </p>
            <p className="text-sm opacity-80">
              For example: If your wealth exceeded Nisab on <strong>15th Shawwal 1444</strong>, your Zakat is due on <strong>15th Shawwal 1445</strong> each year.
            </p>
          </div>
          <div className="p-4 rounded-xl" style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}>
            <p className="font-semibold mb-2 flex items-center gap-2">
              <span className="text-xl">💡</span>
              Early Payment
            </p>
            <p className="text-sm opacity-80">
              You can pay Zakat in advance for future years, which is recommended if you have the means. This ensures you don't miss the obligation.
            </p>
          </div>
        </div>
        <div className="mt-4 p-4 rounded-xl" style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}>
          <p className="font-semibold mb-2">📋 Summary</p>
          <div className="space-y-2 text-sm opacity-80">
            <p>✓ Pay once per lunar year (Hawl)</p>
            <p>✓ Best time is during Ramadan</p>
            <p>✓ Track your personal Zakat date</p>
            <p>✓ Early payment is allowed and recommended</p>
            <p>✓ Calculate based on your wealth on the due date</p>
          </div>
        </div>
      </div>
    ),
  },
];

export function ZakatTutorial({ isOpen, onClose }: ZakatTutorialProps) {
  const { theme } = useTheme();
  const [currentPage, setCurrentPage] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCurrentPage(0); // Reset to first page when opened
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentPageData = TUTORIAL_PAGES[currentPage];
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === TUTORIAL_PAGES.length - 1;

  const handleNext = () => {
    if (!isLastPage) {
      setSlideDirection('right');
      setIsAnimating(true);
      setTimeout(() => {
      setCurrentPage(prev => prev + 1);
        setTimeout(() => setIsAnimating(false), 50);
      }, 350);
    } else {
      // Auto-restart when finished
      setSlideDirection('right');
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentPage(0);
        setTimeout(() => setIsAnimating(false), 50);
      }, 350);
    }
  };

  const handlePrevious = () => {
    if (!isFirstPage) {
      setSlideDirection('left');
      setIsAnimating(true);
      setTimeout(() => {
      setCurrentPage(prev => prev - 1);
        setTimeout(() => setIsAnimating(false), 50);
      }, 350);
    }
  };

  const handlePageClick = (index: number) => {
    if (index === currentPage) return;
    const direction = index > currentPage ? 'right' : 'left';
    setSlideDirection(direction);
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentPage(index);
      setTimeout(() => setIsAnimating(false), 50);
    }, 350);
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[99] transition-opacity duration-300"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          opacity: 0.95,
          backdropFilter: 'blur(8px)',
        }}
        onClick={onClose}
      />

      {/* Tutorial Modal */}
      <div
        className="fixed z-[100] transition-all duration-300"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: isMobile ? 'calc(100% - 2rem)' : '700px',
          width: '100%',
          maxHeight: 'calc(100vh - 80px)',
          background: theme === 'dark'
            ? 'rgba(15, 23, 42, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(30px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              style={{
                background: 'rgba(245, 158, 11, 0.2)',
                backdropFilter: 'blur(10px)',
              }}
            >
              {currentPageData.icon}
            </div>
            <div>
              <h2 className={`text-xl font-bold ${getTextColor(theme)}`}>
                {currentPageData.title}
              </h2>
              <p className={`text-xs ${getMutedTextColor(theme)} opacity-70`}>
                Page {currentPage + 1} of {TUTORIAL_PAGES.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-2">
          <div className="w-full h-1 rounded-full overflow-hidden" style={{
            background: 'rgba(255, 255, 255, 0.1)',
          }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${((currentPage + 1) / TUTORIAL_PAGES.length) * 100}%`,
                background: 'linear-gradient(90deg, #06b6d4, #0891b2)',
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden px-6 py-6 relative">
          <div className="relative h-full overflow-y-auto" style={{ scrollBehavior: 'smooth' }}>
            <div 
              className={`${getTextColor(theme)} transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                isAnimating 
                  ? slideDirection === 'right' 
                    ? 'translate-x-full opacity-0 scale-95' 
                    : '-translate-x-full opacity-0 scale-95'
                  : 'translate-x-0 opacity-100 scale-100'
              }`}
              key={currentPage}
              style={{
                willChange: isAnimating ? 'transform, opacity' : 'auto',
              }}
            >
            {currentPageData.content}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={isFirstPage}
            className="px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: isFirstPage ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: getTextColor(theme),
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>

          {/* Page Indicators */}
          <div className="flex gap-2">
            {TUTORIAL_PAGES.map((_, index) => (
              <button
                key={index}
                onClick={() => handlePageClick(index)}
                className="w-2 h-2 rounded-full transition-all hover:scale-125"
                style={{
                  background: index === currentPage
                    ? 'rgba(6, 182, 212, 0.8)'
                    : 'rgba(255, 255, 255, 0.3)',
                  width: index === currentPage ? '24px' : '8px',
                }}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="px-6 py-3 rounded-xl font-medium text-white transition-all hover:scale-105 flex items-center gap-2 btn-hover"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
              boxShadow: '0 4px 16px rgba(6, 182, 212, 0.4)',
            }}
          >
            {isLastPage ? 'Restart Tutorial' : 'Next'}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}

