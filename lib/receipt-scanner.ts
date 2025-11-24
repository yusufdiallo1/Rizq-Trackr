/**
 * Receipt scanning and OCR functionality
 * Uses OpenAI Vision API for accurate receipt extraction
 */

export interface ReceiptData {
  amount: number | null;
  merchant: string | null;
  date: string | null;
  items: string[];
  tax: number | null;
  total: number | null;
  suggestedCategory: string | null;
  suggestedNotes: string | null;
  confidence: number;
  rawText: string;
}

/**
 * Extract receipt data from an image using OpenAI Vision API
 *
 * @param imageFile - The receipt image file
 * @returns Extracted receipt data
 */
export async function extractReceiptData(
  imageFile: File
): Promise<{ data: ReceiptData | null; error: string | null }> {
  try {
    // Convert file to base64
    const base64Image = await fileToBase64WithDataUrl(imageFile);

    // Call our API route
    const response = await fetch('/api/analyze-receipt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image }),
    });

    const result = await response.json();

    if (!result.success) {
      // If OpenAI API fails, fall back to basic Tesseract
      console.warn('OpenAI API failed, falling back to Tesseract:', result.error);
      return await fallbackToTesseract(imageFile);
    }

    const data = result.data;

    // Map the API response to our ReceiptData format
    const receiptData: ReceiptData = {
      amount: data.amount,
      merchant: data.merchant,
      date: data.date,
      items: data.items || [],
      tax: data.tax,
      total: data.amount,
      suggestedCategory: data.category,
      suggestedNotes: data.notes,
      confidence: data.confidence,
      rawText: `Merchant: ${data.merchant || 'Unknown'}\nAmount: ${data.amount || 'Unknown'}\nDate: ${data.date || 'Unknown'}`,
    };

    return { data: receiptData, error: null };
  } catch (err) {
    console.error('Error extracting receipt data:', err);
    // Fall back to Tesseract on error
    return await fallbackToTesseract(imageFile);
  }
}

/**
 * Convert file to base64 string with data URL prefix
 */
async function fileToBase64WithDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Fallback to Tesseract.js if OpenAI API is not available
 */
async function fallbackToTesseract(
  imageFile: File
): Promise<{ data: ReceiptData | null; error: string | null }> {
  try {
    const base64Image = await fileToBase64(imageFile);
    const text = await performOCR(base64Image);

    if (!text || text.trim().length === 0) {
      return {
        data: null,
        error: 'Could not extract text from image. Please try a clearer photo.',
      };
    }

    const receiptData = parseReceiptText(text);
    const suggestedCategory = autoCategorizeExpense(
      receiptData.merchant,
      receiptData.items
    );
    receiptData.suggestedCategory = suggestedCategory;

    if (receiptData.merchant || receiptData.items.length > 0) {
      const notesParts: string[] = [];
      if (receiptData.merchant) {
        notesParts.push(`At ${receiptData.merchant}`);
      }
      if (receiptData.items.length > 0) {
        const topItems = receiptData.items.slice(0, 3).join(', ');
        notesParts.push(topItems);
      }
      receiptData.suggestedNotes = notesParts.join(' - ');
    }

    return { data: receiptData, error: null };
  } catch (err) {
    console.error('Tesseract fallback error:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to extract receipt data',
    };
  }
}

/**
 * Convert file to base64 string (without data URL prefix)
 */
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Perform OCR on image using Tesseract.js
 */
async function performOCR(base64Image: string): Promise<string> {
  try {
    const Tesseract = await import('tesseract.js').catch(() => null);

    if (!Tesseract) {
      console.warn('Tesseract.js not installed.');
      return '';
    }

    const { data: { text } } = await Tesseract.default.recognize(
      `data:image/jpeg;base64,${base64Image}`,
      'eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      }
    );

    return text;
  } catch (error) {
    console.error('OCR Error:', error);
    return '';
  }
}

/**
 * Parse receipt text to extract structured data
 */
function parseReceiptText(text: string): ReceiptData {
  const receiptData: ReceiptData = {
    amount: null,
    merchant: null,
    date: null,
    items: [],
    tax: null,
    total: null,
    suggestedCategory: null,
    suggestedNotes: null,
    confidence: 0,
    rawText: text,
  };

  let confidenceScore = 0;

  // Extract total amount - comprehensive patterns
  const totalPatterns = [
    { pattern: /(?:grand\s*)?total[:\s]*[\$]?\s*([\d,]+\.?\d{0,2})/i, boost: 25 },
    { pattern: /total[:\s]*[\$]?\s*([\d,]+\.?\d{0,2})/i, boost: 20 },
    { pattern: /amount\s*(?:due|paid)?[:\s]*[\$]?\s*([\d,]+\.?\d{0,2})/i, boost: 18 },
    { pattern: /balance\s*(?:due)?[:\s]*[\$]?\s*([\d,]+\.?\d{0,2})/i, boost: 15 },
    { pattern: /(?:charge|charged|paid|payment)[:\s]*[\$]?\s*([\d,]+\.?\d{0,2})/i, boost: 12 },
    { pattern: /[\$]\s*([\d,]+\.\d{2})\s*(?:total|final|amount)/i, boost: 10 },
  ];

  let foundAmounts: { amount: number; boost: number }[] = [];

  for (const { pattern, boost } of totalPatterns) {
    const matches = text.matchAll(new RegExp(pattern, 'gi'));
    for (const match of matches) {
      const amountStr = match[1].replace(/,/g, '').trim();
      const amount = parseFloat(amountStr);
      if (amount && !isNaN(amount) && amount > 0 && amount < 100000) {
        foundAmounts.push({ amount, boost });
      }
    }
  }

  // Fallback: Look for any currency amounts (format: $XX.XX or XX.XX at end of lines)
  if (foundAmounts.length === 0) {
    const currencyPatterns = [
      /\$(\d{1,3}(?:,\d{3})*\.\d{2})/g,  // $1,234.56
      /\$(\d+\.\d{2})/g,                  // $123.45
      /(\d{1,3}(?:,\d{3})*\.\d{2})/g,    // 1,234.56
      /(\d+\.\d{2})/g,                    // 123.45
    ];

    for (const pattern of currencyPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const amountStr = match[1] || match[0].replace('$', '').trim();
        const amount = parseFloat(amountStr.replace(/,/g, ''));
        if (amount && !isNaN(amount) && amount > 0.01 && amount < 100000) {
          // Prefer amounts that are likely totals (larger amounts, or at end of line)
          const lineContext = match[0];
          const isEndOfLine = /\.\d{2}\s*$/i.test(lineContext);
          const boost = isEndOfLine && amount > 10 ? 8 : 5;
          foundAmounts.push({ amount, boost });
        }
      }
    }

    // If we found multiple amounts, prefer the largest reasonable one (likely the total)
    if (foundAmounts.length > 1) {
      foundAmounts.sort((a, b) => b.amount - a.amount);
      // Take the largest amount that's reasonable (not too small)
      const largestReasonable = foundAmounts.find(a => a.amount >= 1) || foundAmounts[0];
      foundAmounts = [largestReasonable];
    }
  }

  if (foundAmounts.length > 0) {
    // Sort by boost first, then by amount (prefer higher boost, then larger amounts)
    foundAmounts.sort((a, b) => {
      if (b.boost !== a.boost) return b.boost - a.boost;
      return b.amount - a.amount;
    });
    const bestMatch = foundAmounts[0];
    receiptData.total = bestMatch.amount;
    receiptData.amount = bestMatch.amount;
    confidenceScore += bestMatch.boost;
  }

  // Extract date
  const datePatterns = [
    { pattern: /(\d{1,2}\/\d{1,2}\/\d{4})/, format: 'MM/DD/YYYY' },
    { pattern: /(\d{1,2}\/\d{1,2}\/\d{2})(?!\d)/, format: 'MM/DD/YY' },
    { pattern: /(\d{4}-\d{2}-\d{2})/, format: 'YYYY-MM-DD' },
  ];

  for (const { pattern } of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      const parsedDate = parseDate(match[1]);
      if (parsedDate) {
        receiptData.date = parsedDate;
        confidenceScore += 15;
        break;
      }
    }
  }

  if (!receiptData.date) {
    receiptData.date = new Date().toISOString().split('T')[0];
  }

  // Extract merchant name
  const lines = text.split('\n').filter((line) => line.trim().length > 0);
  if (lines.length > 0) {
    const possibleMerchants = lines.slice(0, 5).filter((line) => {
      const trimmed = line.trim();
      return (
        !/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(trimmed) &&
        !/\d{5}(-\d{4})?/.test(trimmed) &&
        !/^#?\d{6,}/.test(trimmed) &&
        trimmed.length >= 3 &&
        trimmed.length < 50
      );
    });

    if (possibleMerchants.length > 0) {
      let merchantName = possibleMerchants[0].trim();
      merchantName = merchantName.replace(/^(welcome\s+to|thank\s+you\s+for)/i, '').trim();
      merchantName = merchantName.replace(/\s*(inc|llc|corp|ltd)\.?$/i, '').trim();

      if (merchantName.length >= 2) {
        receiptData.merchant = merchantName;
        confidenceScore += 15;
      }
    }
  }

  receiptData.confidence = Math.min(100, confidenceScore);

  return receiptData;
}

/**
 * Parse date string into ISO format
 */
function parseDate(dateString: string): string | null {
  try {
    let date: Date | null = null;

    const mdyMatch = dateString.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (mdyMatch) {
      const [, month, day, year] = mdyMatch;
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    const mdyShortMatch = dateString.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/);
    if (!date && mdyShortMatch) {
      const [, month, day, year] = mdyShortMatch;
      const fullYear = parseInt(year) > 50 ? 1900 + parseInt(year) : 2000 + parseInt(year);
      date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
    }

    const ymdMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!date && ymdMatch) {
      const [, year, month, day] = ymdMatch;
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    if (date && !isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch {
    // Invalid date
  }
  return null;
}

/**
 * Auto-categorize expense based on merchant name and items
 */
export function autoCategorizeExpense(
  merchant: string | null,
  items: string[]
): 'Housing' | 'Food' | 'Transport' | 'Healthcare' | 'Education' | 'Charity' | 'Entertainment' | 'Bills' | 'Other' {
  const searchText = `${merchant || ''} ${items.join(' ')}`.toLowerCase();

  const categoryKeywords: { [key: string]: string[] } = {
    Housing: ['rent', 'mortgage', 'utilities', 'electric', 'water', 'gas', 'apartment', 'home'],
    Food: ['restaurant', 'cafe', 'grocery', 'supermarket', 'food', 'walmart', 'target', 'costco', 'pizza', 'burger', 'coffee', 'starbucks', 'mcdonalds', 'wendys', 'chipotle'],
    Transport: ['gas', 'petrol', 'fuel', 'uber', 'lyft', 'taxi', 'parking', 'shell', 'exxon', 'chevron', 'bp'],
    Healthcare: ['pharmacy', 'cvs', 'walgreens', 'hospital', 'clinic', 'doctor', 'dentist', 'medical'],
    Education: ['school', 'university', 'college', 'tuition', 'book', 'textbook'],
    Charity: ['donation', 'charity', 'zakat', 'mosque', 'church'],
    Entertainment: ['movie', 'cinema', 'netflix', 'spotify', 'game', 'gym', 'fitness'],
    Bills: ['phone', 'internet', 'cable', 'subscription', 'insurance', 'att', 'verizon', 'tmobile'],
  };

  const categoryScores: { [key: string]: number } = {};

  Object.keys(categoryKeywords).forEach((category) => {
    categoryScores[category] = categoryKeywords[category].reduce((score, keyword) => {
      if (searchText.includes(keyword)) {
        return score + 1;
      }
      return score;
    }, 0);
  });

  const sortedCategories = Object.entries(categoryScores).sort((a, b) => b[1] - a[1]);

  if (sortedCategories[0][1] > 0) {
    return sortedCategories[0][0] as any;
  }

  return 'Other';
}
