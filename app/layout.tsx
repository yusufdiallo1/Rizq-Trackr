import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./globals-mobile.css";
import { ThemeProvider } from "@/lib/contexts/ThemeContext";
import { LanguageProvider } from "@/lib/contexts/LanguageContext";
import { LocationProvider } from "@/lib/contexts/LocationContext";
import { PageTransition } from "@/components/PageTransition";
import { ClientErrorBoundary } from "@/components/ClientErrorBoundary";
import { ErrorFirewall } from "@/components/ErrorFirewall";

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
  metadataBase: new URL('https://rizqtrackr.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://rizqtrackr.com',
    siteName: 'Rizq Trackr',
    title: 'Rizq Trackr - Islamic Finance Tracker',
    description: 'Track your income, expenses, and zakat payments with Rizq Trackr. The comprehensive Islamic finance management app for Muslims.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Rizq Trackr - Islamic Finance Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rizq Trackr - Islamic Finance Tracker',
    description: 'Track your income, expenses, and zakat payments with Rizq Trackr.',
    images: ['/opengraph-image'],
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
      { url: '/icon.svg', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icon.svg', sizes: '180x180' },
    ],
    shortcut: '/icon.svg',
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
        
        {/* Structured Data for Rich Search Results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Rizq Trackr",
              "description": "Track your income, expenses, and zakat payments with Rizq Trackr. The comprehensive Islamic finance management app for Muslims.",
              "url": "https://rizqtrackr.com",
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
              "logo": "https://rizqtrackr.com/icon.svg",
              "image": "https://rizqtrackr.com/opengraph-image",
              "screenshot": "https://rizqtrackr.com/opengraph-image",
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
        <ErrorFirewall>
          <ClientErrorBoundary>
            <ThemeProvider>
              <LanguageProvider>
                <LocationProvider>
                  <PageTransition>{children}</PageTransition>
                </LocationProvider>
              </LanguageProvider>
            </ThemeProvider>
          </ClientErrorBoundary>
        </ErrorFirewall>
      </body>
    </html>
  );
}

