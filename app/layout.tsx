import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./globals-mobile.css";
import "./globals-liquid-glass.css";
import { ThemeProvider } from "@/lib/contexts/ThemeContext";
import { LanguageProvider } from "@/lib/contexts/LanguageContext";
import { LocationProvider } from "@/lib/contexts/LocationContext";
import { PageTransition } from "@/components/PageTransition";
import { ClientErrorBoundary } from "@/components/ClientErrorBoundary";
import { ErrorFirewall } from "@/components/ErrorFirewall";
import { SafeWrapper } from "@/components/SafeWrapper";
import { LiquidGlassProvider } from "@/components/LiquidGlassProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Rizq Trackr - Islamic Finance Tracker | Income, Expenses & Zakat",
    template: "%s | Rizq Trackr"
  },
  description: "Track your income, expenses, and zakat payments with Rizq Trackr. The comprehensive Islamic finance management app for Muslims. Manage your finances, calculate Zakat, and achieve your financial goals.",
  keywords: ["Islamic finance", "Zakat calculator", "expense tracker", "income tracker", "Muslim finance", "halal finance", "budget tracker", "financial management", "Islamic banking"],
  authors: [{ name: "Rizq Trackr" }],
  creator: "Rizq Trackr",
  publisher: "Rizq Trackr",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.rizqtrackr.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.rizqtrackr.com',
    siteName: 'Rizq Trackr',
    title: 'Rizq Trackr - Islamic Finance Tracker',
    description: 'Track your income, expenses, and zakat payments with Rizq Trackr. The comprehensive Islamic finance management app for Muslims.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Rizq Trackr - Islamic Finance Tracker',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rizq Trackr - Islamic Finance Tracker',
    description: 'Track your income, expenses, and zakat payments with Rizq Trackr.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { url: '/icon.svg', sizes: '32x32', type: 'image/svg+xml' },
      { url: '/icon.svg', sizes: '16x16', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
    other: [
      {
        rel: 'mask-icon',
        url: '/icon.svg',
        color: '#f59e0b',
      },
    ],
  },
  verification: {
    google: 'NOXx0Bcdcbro2-S6Tioxt1HMwszoVG4DPCzx4oR-4lY',
  },
};

export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  viewportFit: "cover" as const, // For safe area support on iOS
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* iOS-specific meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0f172a" media="(prefers-color-scheme: dark)" />

        {/* Comprehensive Favicon Links for Maximum Compatibility */}
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="icon" type="image/svg+xml" href="https://rizqtrackr.com/icon.svg" />
        <link rel="shortcut icon" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon.svg" />
        <link rel="mask-icon" href="/icon.svg" color="#f59e0b" />
        
        {/* Additional meta for search engines */}
        <meta name="application-name" content="Rizq Trackr" />
        <meta name="msapplication-TileColor" content="#f59e0b" />
        <meta name="msapplication-TileImage" content="/icon.svg" />
        <meta name="theme-color" content="#f59e0b" />
        
        {/* Site verification and branding */}
        <link rel="canonical" href="https://www.rizqtrackr.com" />
        
        {/* Structured Data for Rich Search Results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Rizq Trackr",
              "description": "Track your income, expenses, and zakat payments with Rizq Trackr. The comprehensive Islamic finance management app for Muslims.",
              "url": "https://www.rizqtrackr.com",
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "5",
                "ratingCount": "1"
              },
              "logo": "https://www.rizqtrackr.com/icon.svg",
              "image": "https://www.rizqtrackr.com/og-image.png",
              "screenshot": "https://www.rizqtrackr.com/og-image.png",
              "thumbnailUrl": "https://www.rizqtrackr.com/og-image.png",
              "featureList": [
                "Income Tracking",
                "Expense Management",
                "Zakat Calculator",
                "Savings Goals",
                "Hijri Calendar Support",
                "Receipt Scanning"
              ]
            })
          }}
        />
      </head>
      <body className={inter.className}>
        {/* Skip to main content link */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <SafeWrapper>
          <ErrorFirewall>
            <ClientErrorBoundary>
              <ThemeProvider>
                <LanguageProvider>
                  <LocationProvider>
                    <LiquidGlassProvider>
                      <PageTransition>{children}</PageTransition>
                    </LiquidGlassProvider>
                  </LocationProvider>
                </LanguageProvider>
              </ThemeProvider>
            </ClientErrorBoundary>
          </ErrorFirewall>
        </SafeWrapper>
      </body>
    </html>
  );
}

