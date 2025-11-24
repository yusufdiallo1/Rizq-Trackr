/**
 * Nisab API Service
 * Fetches daily gold and silver prices for Nisab calculation
 * Uses free APIs with fallback mechanisms
 */

// Constants for Nisab weights (in grams)
export const NISAB_GOLD_GRAMS = 87.48; // Approximately 3 ounces
export const NISAB_SILVER_GRAMS = 612.36; // Approximately 21 ounces

export interface MetalPrice {
  goldPerGram: number;
  silverPerGram: number;
  currency: string;
  date: string;
  source: string;
}

export interface NisabValue {
  goldBased: number;
  silverBased: number;
  currency: string;
  date: string;
}

// Cache for prices (24 hours)
const PRICE_CACHE_KEY = 'nisab_prices_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface CachedPrice {
  data: MetalPrice;
  timestamp: number;
}

/**
 * Get cached prices if still valid
 */
function getCachedPrices(): MetalPrice | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(PRICE_CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp }: CachedPrice = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid (within 24 hours)
    if (now - timestamp < CACHE_DURATION) {
      return data;
    }

    // Cache expired, remove it
    localStorage.removeItem(PRICE_CACHE_KEY);
    return null;
  } catch (error) {
    console.error('Error reading price cache:', error);
    return null;
  }
}

/**
 * Cache prices
 */
function setCachedPrices(prices: MetalPrice): void {
  if (typeof window === 'undefined') return;

  try {
    const cache: CachedPrice = {
      data: prices,
      timestamp: Date.now(),
    };
    localStorage.setItem(PRICE_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error caching prices:', error);
  }
}

/**
 * Fetch gold price from free API (fallback method)
 * Uses exchangerate-api.com or similar free service
 */
async function fetchGoldPriceFromAPI(currency: string = 'USD'): Promise<number | null> {
  try {
    // Method 1: Try metals-api.com (free tier available)
    // Note: You'll need to sign up for a free API key
    const METALS_API_KEY = process.env.NEXT_PUBLIC_METALS_API_KEY;
    
    if (METALS_API_KEY) {
      const response = await fetch(
        `https://api.metals.live/v1/spot/gold?currency=${currency}`,
        {
          headers: {
            'X-API-Key': METALS_API_KEY,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Convert from per ounce to per gram (1 ounce = 31.1035 grams)
        if (data.price) {
          return data.price / 31.1035;
        }
      }
    }

    // Method 2: Try alternative free API (goldapi.io)
    const GOLD_API_KEY = process.env.NEXT_PUBLIC_GOLD_API_KEY;
    if (GOLD_API_KEY) {
      const response = await fetch(
        `https://www.goldapi.io/api/XAU/${currency}`,
        {
          headers: {
            'x-access-token': GOLD_API_KEY,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Convert from per ounce to per gram
        if (data.price) {
          return data.price / 31.1035;
        }
      }
    }

    // Method 3: Fallback to approximate values (last resort)
    // These are approximate values - should be updated regularly
    const fallbackPrices: { [key: string]: number } = {
      USD: 65.0, // Approximate gold price per gram in USD
      EUR: 60.0,
      GBP: 52.0,
      AED: 240.0,
      SAR: 245.0,
      EGP: 3200.0,
    };

    return fallbackPrices[currency] || fallbackPrices.USD;
  } catch (error) {
    console.error('Error fetching gold price:', error);
    return null;
  }
}

/**
 * Fetch silver price from free API
 */
async function fetchSilverPriceFromAPI(currency: string = 'USD'): Promise<number | null> {
  try {
    const METALS_API_KEY = process.env.NEXT_PUBLIC_METALS_API_KEY;
    
    if (METALS_API_KEY) {
      const response = await fetch(
        `https://api.metals.live/v1/spot/silver?currency=${currency}`,
        {
          headers: {
            'X-API-Key': METALS_API_KEY,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Convert from per ounce to per gram
        if (data.price) {
          return data.price / 31.1035;
        }
      }
    }

    // Fallback to approximate values
    const fallbackPrices: { [key: string]: number } = {
      USD: 0.85, // Approximate silver price per gram in USD
      EUR: 0.78,
      GBP: 0.68,
      AED: 3.12,
      SAR: 3.19,
      EGP: 42.0,
    };

    return fallbackPrices[currency] || fallbackPrices.USD;
  } catch (error) {
    console.error('Error fetching silver price:', error);
    return null;
  }
}

/**
 * Fetch current metal prices
 * Uses cache if available, otherwise fetches from API
 */
export async function fetchMetalPrices(currency: string = 'USD'): Promise<MetalPrice> {
  // Check cache first
  const cached = getCachedPrices();
  if (cached && cached.currency === currency) {
    return cached;
  }

  // Fetch from API
  const [goldPrice, silverPrice] = await Promise.all([
    fetchGoldPriceFromAPI(currency),
    fetchSilverPriceFromAPI(currency),
  ]);

  const prices: MetalPrice = {
    goldPerGram: goldPrice || 65.0, // Fallback to default
    silverPerGram: silverPrice || 0.85, // Fallback to default
    currency,
    date: new Date().toISOString().split('T')[0],
    source: goldPrice ? 'api' : 'fallback',
  };

  // Cache the prices
  setCachedPrices(prices);

  return prices;
}

/**
 * Calculate Nisab values based on current metal prices
 */
export async function calculateNisab(currency: string = 'USD'): Promise<NisabValue> {
  const prices = await fetchMetalPrices(currency);

  return {
    goldBased: prices.goldPerGram * NISAB_GOLD_GRAMS,
    silverBased: prices.silverPerGram * NISAB_SILVER_GRAMS,
    currency: prices.currency,
    date: prices.date,
  };
}

/**
 * Get Nisab threshold (uses gold-based by default, as recommended)
 */
export async function getNisabThreshold(currency: string = 'USD'): Promise<number> {
  const nisab = await calculateNisab(currency);
  // Most scholars recommend using gold-based Nisab
  return nisab.goldBased;
}

/**
 * Convert Nisab value to different currency
 * Note: This is a simplified conversion - in production, use a proper currency conversion API
 */
export async function convertNisabToCurrency(
  nisabValue: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) return nisabValue;

  // Simplified conversion rates (should use a real currency API)
  const conversionRates: { [key: string]: number } = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    AED: 3.67,
    SAR: 3.75,
    EGP: 49.0,
    PKR: 278.0,
    INR: 83.0,
    MYR: 4.7,
    IDR: 15700.0,
  };

  const fromRate = conversionRates[fromCurrency] || 1.0;
  const toRate = conversionRates[toCurrency] || 1.0;

  return (nisabValue / fromRate) * toRate;
}

