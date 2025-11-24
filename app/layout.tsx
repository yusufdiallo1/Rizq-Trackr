import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./globals-mobile.css";
import { ThemeProvider } from "@/lib/contexts/ThemeContext";
import { LanguageProvider } from "@/lib/contexts/LanguageContext";
import { LocationProvider } from "@/lib/contexts/LocationContext";
import { PageTransition } from "@/components/PageTransition";
import { ClientErrorBoundary } from "@/components/ClientErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rizq Trackr",
  description: "Track your income, expenses, and zakat payments",
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
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
      </head>
      <body className={inter.className}>
        {/* Skip to main content link */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ClientErrorBoundary>
        <ThemeProvider>
          <LanguageProvider>
            <LocationProvider>
              <PageTransition>{children}</PageTransition>
            </LocationProvider>
          </LanguageProvider>
        </ThemeProvider>
        </ClientErrorBoundary>
      </body>
    </html>
  );
}

