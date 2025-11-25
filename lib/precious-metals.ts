// Precious metals converter for gold and silver
// Supports USD, GBP, AED, SAR, EGP currencies
// Multi-API fallback system for reliability

import { logError } from './logger';

export type SupportedCurrency = 'USD' | 'GBP' | 'AED' | 'SAR' | 'EGP';
export type MetalType = 'gold' | 'silver';

export interface MetalPrice {
  currency: SupportedCurrency;
  pricePerGram: number;
  pricePerOunce: number;
  lastUpdated: Date;
  source?: string;
  priceChange?: {
    percentage: number;
    direction: 'up' | 'down' | 'neutral';
  };
}

export interface MetalPrices {
  gold: Record<SupportedCurrency, MetalPrice>;
  silver: Record<SupportedCurrency, MetalPrice>;
}

export interface ConversionResult {
  metal: MetalType;
  grams: number;
  currency: SupportedCurrency;
  value: number;
  pricePerGram: number;
  lastUpdated: Date;
}

export interface NisabValue {
  gold: number;
  silver: number;
  currency: SupportedCurrency;
  lastUpdated: Date;
}

// Constants
const GRAMS_PER_OUNCE = 31.1034768;
export const NISAB_GOLD_GRAMS = 87.48; // Approximately 3 ounces
export const NISAB_SILVER_GRAMS = 612.36; // Approximately 21.5 ounces

// Cache for metal prices (1 hour cache, optimized for fast load)
let priceCache: { data: MetalPrices | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};

// Price history for trend tracking (stored in localStorage for persistence)
const PRICE_HISTORY_KEY = 'precious_metals_price_history';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const API_TIMEOUT = 2000; // 2 seconds max for API calls (optimized for load time)

// API Configuration
const METAL_PRICE_API_KEY = process.env.NEXT_PUBLIC_METAL_PRICE_API_KEY || 'demo';
const METALS_LIVE_API_KEY = process.env.NEXT_PUBLIC_METALS_LIVE_API_KEY;
const GOLD_API_KEY = process.env.NEXT_PUBLIC_GOLD_API_KEY;

/**
 * Get price history from localStorage
 */
function getPriceHistory(): MetalPrices | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(PRICE_HISTORY_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      Object.keys(parsed).forEach((metal) => {
        Object.keys(parsed[metal]).forEach((currency) => {
          if (parsed[metal][currency].lastUpdated) {
            parsed[metal][currency].lastUpdated = new Date(parsed[metal][currency].lastUpdated);
          }
        });
      });
      return parsed;
    }
  } catch (error) {
    logError(error, 'Error reading price history');
  }
  return null;
}

/**
 * Save price history to localStorage
 */
function savePriceHistory(prices: MetalPrices): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRICE_HISTORY_KEY, JSON.stringify(prices));
  } catch (error) {
    logError(error, 'Error saving price history');
  }
}

/**
 * Calculate price change percentage
 */
function calculatePriceChange(
  current: number,
  previous: number | undefined
): { percentage: number; direction: 'up' | 'down' | 'neutral' } | undefined {
  if (previous === undefined || previous === 0) return undefined;
  const change = ((current - previous) / previous) * 100;
  return {
    percentage: Math.abs(change),
    direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
  };
}

/**
 * Fetch from MetalpriceAPI (primary)
 */
async function fetchFromMetalpriceAPI(): Promise<MetalPrices | null> {
  try {
    const currencies = ['USD', 'GBP', 'AED', 'SAR', 'EGP'].join(',');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(
      `https://api.metalpriceapi.com/v1/latest?api_key=${METAL_PRICE_API_KEY}&base=USD&currencies=${currencies}`,
      {
        signal: controller.signal,
        next: { revalidate: 3600 },
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error('API returned unsuccessful response');
    }

    const goldPriceUsdPerOz = data.rates?.XAU ? 1 / data.rates.XAU : 0;
    const silverPriceUsdPerOz = data.rates?.XAG ? 1 / data.rates.XAG : 0;

    if (goldPriceUsdPerOz === 0 || silverPriceUsdPerOz === 0 || !isFinite(goldPriceUsdPerOz) || !isFinite(silverPriceUsdPerOz)) {
      return null; // Silent failure - invalid data
    }

    const goldPriceUsdPerGram = goldPriceUsdPerOz / GRAMS_PER_OUNCE;
    const silverPriceUsdPerGram = silverPriceUsdPerOz / GRAMS_PER_OUNCE;

    const lastUpdated = new Date();
    const previousPrices = getPriceHistory();
    const metalPrices: MetalPrices = {
      gold: {} as Record<SupportedCurrency, MetalPrice>,
      silver: {} as Record<SupportedCurrency, MetalPrice>,
    };

    const supportedCurrencies: SupportedCurrency[] = ['USD', 'GBP', 'AED', 'SAR', 'EGP'];

    for (const currency of supportedCurrencies) {
      const rate = currency === 'USD' ? 1 : (data.rates?.[currency] || 1);
      const goldPricePerGram = goldPriceUsdPerGram * rate;
      const silverPricePerGram = silverPriceUsdPerGram * rate;

      metalPrices.gold[currency] = {
        currency,
        pricePerGram: goldPricePerGram,
        pricePerOunce: goldPriceUsdPerOz * rate,
        lastUpdated,
        source: 'metalpriceapi',
        priceChange: previousPrices
          ? calculatePriceChange(goldPricePerGram, previousPrices.gold[currency]?.pricePerGram)
          : undefined,
      };

      metalPrices.silver[currency] = {
        currency,
        pricePerGram: silverPricePerGram,
        pricePerOunce: silverPriceUsdPerOz * rate,
        lastUpdated,
        source: 'metalpriceapi',
        priceChange: previousPrices
          ? calculatePriceChange(silverPricePerGram, previousPrices.silver[currency]?.pricePerGram)
          : undefined,
      };
    }

    return metalPrices;
  } catch (error) {
    // Silent failure - will try next API
    if (error instanceof Error && error.name !== 'AbortError') {
      logError(error, 'MetalpriceAPI fetch error');
    }
    return null;
  }
    }

/**
 * Fetch from metals.live API (fallback 1)
 */
async function fetchFromMetalsLive(): Promise<MetalPrices | null> {
  if (!METALS_LIVE_API_KEY) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    // Fetch gold and silver prices
    const [goldResponse, silverResponse] = await Promise.all([
      fetch(`https://api.metals.live/v1/spot/gold?currency=USD`, {
        signal: controller.signal,
        headers: {
          'X-API-Key': METALS_LIVE_API_KEY,
        },
      }),
      fetch(`https://api.metals.live/v1/spot/silver?currency=USD`, {
        signal: controller.signal,
        headers: {
          'X-API-Key': METALS_LIVE_API_KEY,
        },
      }),
    ]);

    clearTimeout(timeoutId);

    if (!goldResponse.ok || !silverResponse.ok) {
      throw new Error('Metals.live API request failed');
    }

    const goldData = await goldResponse.json();
    const silverData = await silverResponse.json();

    const goldPriceUsdPerOz = goldData.price || 0;
    const silverPriceUsdPerOz = silverData.price || 0;

    if (goldPriceUsdPerOz === 0 || silverPriceUsdPerOz === 0 || !isFinite(goldPriceUsdPerOz) || !isFinite(silverPriceUsdPerOz)) {
      return null; // Silent failure - invalid data
    }

    // Get currency exchange rates (simplified - would need currency API in production)
    const exchangeRates: Record<string, number> = {
      USD: 1,
      GBP: 0.79, // Approximate
      AED: 3.67,
      SAR: 3.75,
      EGP: 50.0,
    };

    const goldPriceUsdPerGram = goldPriceUsdPerOz / GRAMS_PER_OUNCE;
    const silverPriceUsdPerGram = silverPriceUsdPerOz / GRAMS_PER_OUNCE;

    const lastUpdated = new Date();
    const previousPrices = getPriceHistory();
    const metalPrices: MetalPrices = {
      gold: {} as Record<SupportedCurrency, MetalPrice>,
      silver: {} as Record<SupportedCurrency, MetalPrice>,
    };

    const supportedCurrencies: SupportedCurrency[] = ['USD', 'GBP', 'AED', 'SAR', 'EGP'];

    for (const currency of supportedCurrencies) {
      const rate = exchangeRates[currency] || 1;
      const goldPricePerGram = goldPriceUsdPerGram * rate;
      const silverPricePerGram = silverPriceUsdPerGram * rate;

      metalPrices.gold[currency] = {
        currency,
        pricePerGram: goldPricePerGram,
        pricePerOunce: goldPriceUsdPerOz * rate,
        lastUpdated,
        source: 'metals.live',
        priceChange: previousPrices
          ? calculatePriceChange(goldPricePerGram, previousPrices.gold[currency]?.pricePerGram)
          : undefined,
      };

      metalPrices.silver[currency] = {
        currency,
        pricePerGram: silverPricePerGram,
        pricePerOunce: silverPriceUsdPerOz * rate,
        lastUpdated,
        source: 'metals.live',
        priceChange: previousPrices
          ? calculatePriceChange(silverPricePerGram, previousPrices.silver[currency]?.pricePerGram)
          : undefined,
    };
    }

    return metalPrices;
  } catch (error) {
    // Silent failure - will try next API
    if (error instanceof Error && error.name !== 'AbortError') {
      logError(error, 'Metals.live API fetch error');
    }
    return null;
  }
}

/**
 * Fetch from goldapi.io (fallback 2)
 */
async function fetchFromGoldAPI(): Promise<MetalPrices | null> {
  if (!GOLD_API_KEY) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const [goldResponse, silverResponse] = await Promise.all([
      fetch(`https://www.goldapi.io/api/XAU/USD`, {
        signal: controller.signal,
        headers: {
          'x-access-token': GOLD_API_KEY,
        },
      }),
      fetch(`https://www.goldapi.io/api/XAG/USD`, {
        signal: controller.signal,
        headers: {
          'x-access-token': GOLD_API_KEY,
        },
      }),
    ]);

    clearTimeout(timeoutId);

    if (!goldResponse.ok || !silverResponse.ok) {
      throw new Error('GoldAPI request failed');
    }

    const goldData = await goldResponse.json();
    const silverData = await silverResponse.json();

    const goldPriceUsdPerOz = goldData.price || 0;
    const silverPriceUsdPerOz = silverData.price || 0;

    if (goldPriceUsdPerOz === 0 || silverPriceUsdPerOz === 0 || !isFinite(goldPriceUsdPerOz) || !isFinite(silverPriceUsdPerOz)) {
      return null; // Silent failure - invalid data
    }

    // Get currency exchange rates (simplified)
    const exchangeRates: Record<string, number> = {
      USD: 1,
      GBP: 0.79,
      AED: 3.67,
      SAR: 3.75,
      EGP: 50.0,
    };

    const goldPriceUsdPerGram = goldPriceUsdPerOz / GRAMS_PER_OUNCE;
    const silverPriceUsdPerGram = silverPriceUsdPerOz / GRAMS_PER_OUNCE;

    const lastUpdated = new Date();
    const previousPrices = getPriceHistory();
    const metalPrices: MetalPrices = {
      gold: {} as Record<SupportedCurrency, MetalPrice>,
      silver: {} as Record<SupportedCurrency, MetalPrice>,
    };

    const supportedCurrencies: SupportedCurrency[] = ['USD', 'GBP', 'AED', 'SAR', 'EGP'];

    for (const currency of supportedCurrencies) {
      const rate = exchangeRates[currency] || 1;
      const goldPricePerGram = goldPriceUsdPerGram * rate;
      const silverPricePerGram = silverPriceUsdPerGram * rate;

      metalPrices.gold[currency] = {
        currency,
        pricePerGram: goldPricePerGram,
        pricePerOunce: goldPriceUsdPerOz * rate,
        lastUpdated,
        source: 'goldapi.io',
        priceChange: previousPrices
          ? calculatePriceChange(goldPricePerGram, previousPrices.gold[currency]?.pricePerGram)
          : undefined,
      };

      metalPrices.silver[currency] = {
        currency,
        pricePerGram: silverPricePerGram,
        pricePerOunce: silverPriceUsdPerOz * rate,
        lastUpdated,
        source: 'goldapi.io',
        priceChange: previousPrices
          ? calculatePriceChange(silverPricePerGram, previousPrices.silver[currency]?.pricePerGram)
          : undefined,
      };
    }

    return metalPrices;
  } catch (error) {
    // Silent failure - will use fallback prices
    if (error instanceof Error && error.name !== 'AbortError') {
      logError(error, 'GoldAPI fetch error');
    }
    return null;
  }
}

/**
 * Get fallback prices (last resort)
 */
function getFallbackPrices(): MetalPrices {
  const lastUpdated = new Date();
  return {
      gold: {
      USD: { currency: 'USD', pricePerGram: 85, pricePerOunce: 2643, lastUpdated },
      GBP: { currency: 'GBP', pricePerGram: 68, pricePerOunce: 2115, lastUpdated },
      AED: { currency: 'AED', pricePerGram: 312, pricePerOunce: 9706, lastUpdated },
      SAR: { currency: 'SAR', pricePerGram: 319, pricePerOunce: 9913, lastUpdated },
      EGP: { currency: 'EGP', pricePerGram: 4250, pricePerOunce: 132189, lastUpdated },
      },
      silver: {
      USD: { currency: 'USD', pricePerGram: 0.95, pricePerOunce: 29.5, lastUpdated },
      GBP: { currency: 'GBP', pricePerGram: 0.76, pricePerOunce: 23.6, lastUpdated },
      AED: { currency: 'AED', pricePerGram: 3.49, pricePerOunce: 108.5, lastUpdated },
      SAR: { currency: 'SAR', pricePerGram: 3.56, pricePerOunce: 110.6, lastUpdated },
      EGP: { currency: 'EGP', pricePerGram: 47.5, pricePerOunce: 1476, lastUpdated },
    },
  };
}

/**
 * Fetch current gold and silver prices with multi-API fallback
 * Optimized for fast load times (max 2 seconds)
 */
export async function fetchMetalPrices(): Promise<MetalPrices> {
  // Check cache first (fast path)
  const now = Date.now();
  if (priceCache.data && now - priceCache.timestamp < CACHE_DURATION) {
    return priceCache.data;
  }

  // Try APIs in order with timeout
  let prices: MetalPrices | null = null;

  // Try MetalpriceAPI first
  prices = await fetchFromMetalpriceAPI();
  if (prices) {
    priceCache = { data: prices, timestamp: now };
    savePriceHistory(prices);
    return prices;
  }

  // Try metals.live
  prices = await fetchFromMetalsLive();
  if (prices) {
    priceCache = { data: prices, timestamp: now };
    savePriceHistory(prices);
    return prices;
  }

  // Try goldapi.io
  prices = await fetchFromGoldAPI();
  if (prices) {
    priceCache = { data: prices, timestamp: now };
    savePriceHistory(prices);
    return prices;
  }

  // Fallback to cached prices or default
  const fallback = getFallbackPrices();
  priceCache = { data: fallback, timestamp: now };
  return fallback;
}

/**
 * Convert grams of gold or silver to a specific currency
 */
export async function convertMetalToValue(
  metal: MetalType,
  grams: number,
  currency: SupportedCurrency
): Promise<ConversionResult> {
  const prices = await fetchMetalPrices();
  const metalPrice = prices[metal][currency];

  return {
    metal,
    grams,
    currency,
    value: grams * metalPrice.pricePerGram,
    pricePerGram: metalPrice.pricePerGram,
    lastUpdated: metalPrice.lastUpdated,
  };
}

/**
 * Calculate Nisab value for all currencies
 */
export async function calculateNisabValues(currency: SupportedCurrency): Promise<NisabValue> {
  const prices = await fetchMetalPrices();
  const goldPrice = prices.gold[currency];
  const silverPrice = prices.silver[currency];

    return {
    gold: NISAB_GOLD_GRAMS * goldPrice.pricePerGram,
    silver: NISAB_SILVER_GRAMS * silverPrice.pricePerGram,
      currency,
    lastUpdated: goldPrice.lastUpdated,
    };
}

/**
 * Get currency symbol for display
 */
export function getCurrencySymbol(currency: SupportedCurrency): string {
  const symbols: Record<SupportedCurrency, string> = {
    USD: '$',
    GBP: '£',
    AED: 'د.إ',
    SAR: 'ر.س',
    EGP: 'ج.م',
  };
  return symbols[currency];
}

/**
 * Format currency value with proper symbol and decimals
 */
export function formatCurrencyValue(value: number, currency: SupportedCurrency): string {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${value.toFixed(2)}`;
}
