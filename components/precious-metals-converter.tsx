'use client';

import { useState, useEffect } from 'react';
import {
  convertMetalToValue,
  type MetalType,
  type SupportedCurrency,
  type ConversionResult,
  getCurrencySymbol,
  formatCurrencyValue,
} from '@/lib/precious-metals';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

interface PreciousMetalsConverterProps {
  className?: string;
}

const GRAMS_PER_OUNCE = 31.1034768;

export function PreciousMetalsConverter({ className }: PreciousMetalsConverterProps) {
  const [metal, setMetal] = useState<MetalType>('gold');
  const [unit, setUnit] = useState<'grams' | 'ounces'>('grams');
  const [amount, setAmount] = useState<string>('3.2');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const currencies: SupportedCurrency[] = ['USD', 'GBP', 'AED', 'SAR', 'EGP'];

  useEffect(() => {
    const convertValues = async () => {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        setResults([]);
        return;
      }

      // Convert to grams if in ounces
      const gramsNum = unit === 'ounces' ? amountNum * GRAMS_PER_OUNCE : amountNum;

      setLoading(true);
      setError(null);

      try {
        const conversions = await Promise.all(
          currencies.map((currency) => convertMetalToValue(metal, gramsNum, currency))
        );
        setResults(conversions);
        if (conversions.length > 0) {
          setLastUpdated(conversions[0].lastUpdated);
        }
      } catch (err) {
        console.error('Error converting metals:', err);
        setError('Failed to fetch current prices. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    // Debounce the conversion
    const timeout = setTimeout(convertValues, 300);
    return () => clearTimeout(timeout);
  }, [metal, amount, unit]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">{metal === 'gold' ? '🥇' : '🥈'}</span>
          Precious Metals Converter
        </CardTitle>
        <CardDescription>
          Convert gold and silver to multiple currencies with live market prices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metal Type Selector */}
        <div className="space-y-2">
          <Label>Metal Type</Label>
          <Tabs value={metal} onValueChange={(value) => setMetal(value as MetalType)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="gold">Gold (Au)</TabsTrigger>
              <TabsTrigger value="silver">Silver (Ag)</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Unit Selector */}
        <div className="space-y-2">
          <Label>Unit of Measurement</Label>
          <Tabs value={unit} onValueChange={(value) => setUnit(value as 'grams' | 'ounces')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grams">Grams (g)</TabsTrigger>
              <TabsTrigger value="ounces">Ounces (oz)</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount">
            Amount in {unit === 'grams' ? 'Grams' : 'Ounces'}
            {metal === 'silver' && unit === 'grams' && (
              <span className="ml-2 text-xs text-muted-foreground">(Nisab: ~595g)</span>
            )}
            {metal === 'gold' && unit === 'grams' && (
              <span className="ml-2 text-xs text-muted-foreground">(Nisab: ~85g)</span>
            )}
            {metal === 'silver' && unit === 'ounces' && (
              <span className="ml-2 text-xs text-muted-foreground">(Nisab: ~19.1oz)</span>
            )}
            {metal === 'gold' && unit === 'ounces' && (
              <span className="ml-2 text-xs text-muted-foreground">(Nisab: ~2.7oz)</span>
            )}
          </Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Enter ${unit}`}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Results */}
        {!loading && !error && results.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Current Values</span>
              {lastUpdated && (
                <span className="text-xs">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>

            <div className="grid gap-2">
              {results.map((result) => (
                <div
                  key={result.currency}
                  className="flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-accent"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">{getCurrencySymbol(result.currency)}</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{result.currency}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrencyValue(result.pricePerGram, result.currency)}/g
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {formatCurrencyValue(result.value, result.currency)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Zakat Notice */}
            {(() => {
              const amountNum = parseFloat(amount);
              const gramsNum = unit === 'ounces' ? amountNum * GRAMS_PER_OUNCE : amountNum;
              const nisabThreshold = metal === 'gold' ? 85 : 595;
              return gramsNum >= nisabThreshold;
            })() && (
              <div className="rounded-md bg-green-50 dark:bg-green-950/20 p-3 text-sm text-green-800 dark:text-green-200">
                <p className="font-semibold">Zakat Applicable</p>
                <p className="text-xs mt-1">
                  Your {metal} holdings have reached the Nisab threshold. Zakat of 2.5% may be due.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
          <p>
            <strong>Note:</strong> Prices update hourly from live market data. You can convert any amount
            of gold or silver in grams or ounces. The Nisab threshold for gold is ~85g (2.7oz) and for silver is ~595g (19.1oz).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
