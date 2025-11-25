// Precious metals converter for gold and silver
// Supports USD, GBP, AED, SAR, EGP currencies

export type SupportedCurrency = 'USD' | 'GBP' | 'AED' | 'SAR' | 'EGP';
export type MetalType = 'gold' | 'silver';

export interface MetalPrice {
  currency: SupportedCurrency;
  pricePerGram: number;
  pricePerOunce: number;
  lastUpdated: Date;
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

// Cache for metal prices (1 hour cache)
let priceCache: { data: MetalPrices | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const GRAMS_PER_OUNCE = 31.1034768;

// Free API key for MetalpriceAPI (100 requests/month on free tier)
// You should replace this with your own API key from https://metalpriceapi.com
const API_KEY = process.env.NEXT_PUBLIC_METAL_PRICE_API_KEY || 'demo';
const API_URL = 'https://api.metalpriceapi.com/v1/latest';

/**
 * Fetch current gold and silver prices from MetalpriceAPI
 * Note: Free tier allows 100 requests/month
 */
export async function fetchMetalPrices(): Promise<MetalPrices> {
  // Check cache first
  const now = Date.now();
  if (priceCache.data && now - priceCache.timestamp < CACHE_DURATION) {
    return priceCache.data;
  }

  try {
    // Fetch prices for gold (XAU) and silver (XAG) in all supported currencies
    const currencies = ['USD', 'GBP', 'AED', 'SAR', 'EGP'].join(',');
    const response = await fetch(
      `${API_URL}?api_key=${API_KEY}&base=USD&currencies=${currencies}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour in Next.js
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error('API returned unsuccessful response');
    }

    // Get gold and silver prices (in troy ounces) for USD base
    const goldPriceUsdPerOz = data.rates?.XAU ? 1 / data.rates.XAU : 0;
    const silverPriceUsdPerOz = data.rates?.XAG ? 1 / data.rates.XAG : 0;

    // Convert to grams
    const goldPriceUsdPerGram = goldPriceUsdPerOz / GRAMS_PER_OUNCE;
    const silverPriceUsdPerGram = silverPriceUsdPerOz / GRAMS_PER_OUNCE;

    const lastUpdated = new Date();

    // Build prices for all currencies
    const metalPrices: MetalPrices = {
      gold: {} as Record<SupportedCurrency, MetalPrice>,
      silver: {} as Record<SupportedCurrency, MetalPrice>,
    };

    const supportedCurrencies: SupportedCurrency[] = ['USD', 'GBP', 'AED', 'SAR', 'EGP'];

    for (const currency of supportedCurrencies) {
      const rate = currency === 'USD' ? 1 : (data.rates?.[currency] || 1);

      metalPrices.gold[currency] = {
        currency,
        pricePerGram: goldPriceUsdPerGram * rate,
        pricePerOunce: goldPriceUsdPerOz * rate,
        lastUpdated,
      };

      metalPrices.silver[currency] = {
        currency,
        pricePerGram: silverPriceUsdPerGram * rate,
        pricePerOunce: silverPriceUsdPerOz * rate,
        lastUpdated,
      };
    }

    // Update cache
    priceCache = {
      data: metalPrices,
      timestamp: now,
    };

    return metalPrices;
  } catch (error) {
    console.error('Error fetching metal prices:', error);

    // Return fallback prices if API fails (approximate values as of 2025)
    // These should be updated periodically
    const fallbackPrices: MetalPrices = {
      gold: {
        USD: { currency: 'USD', pricePerGram: 85, pricePerOunce: 2643, lastUpdated: new Date() },
        GBP: { currency: 'GBP', pricePerGram: 68, pricePerOunce: 2115, lastUpdated: new Date() },
        AED: { currency: 'AED', pricePerGram: 312, pricePerOunce: 9706, lastUpdated: new Date() },
        SAR: { currency: 'SAR', pricePerGram: 319, pricePerOunce: 9913, lastUpdated: new Date() },
        EGP: { currency: 'EGP', pricePerGram: 4250, pricePerOunce: 132189, lastUpdated: new Date() },
      },
      silver: {
        USD: { currency: 'USD', pricePerGram: 0.95, pricePerOunce: 29.5, lastUpdated: new Date() },
        GBP: { currency: 'GBP', pricePerGram: 0.76, pricePerOunce: 23.6, lastUpdated: new Date() },
        AED: { currency: 'AED', pricePerGram: 3.49, pricePerOunce: 108.5, lastUpdated: new Date() },
        SAR: { currency: 'SAR', pricePerGram: 3.56, pricePerOunce: 110.6, lastUpdated: new Date() },
        EGP: { currency: 'EGP', pricePerGram: 47.5, pricePerOunce: 1476, lastUpdated: new Date() },
      },
    };

    return fallbackPrices;
  }
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
 * Convert multiple metals to multiple currencies at once
 */
export async function convertMultipleMetals(
  conversions: Array<{ metal: MetalType; grams: number; currency: SupportedCurrency }>
): Promise<ConversionResult[]> {
  const prices = await fetchMetalPrices();

  return conversions.map(({ metal, grams, currency }) => {
    const metalPrice = prices[metal][currency];
    return {
      metal,
      grams,
      currency,
      value: grams * metalPrice.pricePerGram,
      pricePerGram: metalPrice.pricePerGram,
      lastUpdated: metalPrice.lastUpdated,
    };
  });
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
