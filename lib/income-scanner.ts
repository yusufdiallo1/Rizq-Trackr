/**
 * Income Scanner - OCR for invoices and checks
 * Uses OpenAI Vision API to extract income data from images
 */

export interface IncomeDocumentData {
  amount: number | null;
  payerName: string | null;
  date: string | null;
  paymentMethod: 'check' | 'cash' | 'bank_transfer' | 'wire' | 'other' | null;
  documentNumber: string | null; // Invoice or check number
  documentType: 'invoice' | 'check' | 'pay_stub' | 'receipt' | 'other';
  suggestedCategory: string | null;
  suggestedNotes: string | null;
  confidence: number;
  rawText: string;
}

/**
 * Extract income data from an image using OpenAI Vision API
 */
export async function extractIncomeData(
  imageFile: File
): Promise<{ data: IncomeDocumentData | null; error: string | null }> {
  try {
    // Convert file to base64
    const base64Image = await fileToBase64WithDataUrl(imageFile);

    // Call our API route
    const response = await fetch('/api/analyze-income-document', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Image }),
    });

    const result = await response.json();

    if (!result.success) {
      console.warn('OpenAI API failed for income document:', result.error);
      return { data: null, error: result.error || 'Failed to analyze document' };
    }

    const data = result.data;

    // Map the API response to our IncomeDocumentData format
    const incomeData: IncomeDocumentData = {
      amount: data.amount,
      payerName: data.payerName,
      date: data.date,
      paymentMethod: data.paymentMethod,
      documentNumber: data.documentNumber,
      documentType: data.documentType || 'other',
      suggestedCategory: data.category,
      suggestedNotes: data.notes,
      confidence: data.confidence || 0,
      rawText: `Payer: ${data.payerName || 'Unknown'}\nAmount: ${data.amount || 'Unknown'}\nDate: ${data.date || 'Unknown'}`,
    };

    return { data: incomeData, error: null };
  } catch (err) {
    console.error('Error extracting income data:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to extract income data',
    };
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
 * Auto-categorize income based on payer name and document type
 */
export function autoCategorizeIncome(
  payerName: string | null,
  documentType: string
): 'Salary' | 'Business' | 'Freelance' | 'Gifts' | 'Investments' | 'Other' {
  const searchText = (payerName || '').toLowerCase();

  // Check for salary indicators
  const salaryKeywords = ['payroll', 'salary', 'wages', 'employer', 'hr', 'human resources', 'paycheck'];
  if (salaryKeywords.some(kw => searchText.includes(kw)) || documentType === 'pay_stub') {
    return 'Salary';
  }

  // Check for business indicators
  const businessKeywords = ['invoice', 'client', 'customer', 'payment for services', 'consulting', 'contract'];
  if (businessKeywords.some(kw => searchText.includes(kw)) || documentType === 'invoice') {
    return 'Business';
  }

  // Check for investment indicators
  const investmentKeywords = ['dividend', 'interest', 'capital gain', 'stock', 'bond', 'investment', 'brokerage'];
  if (investmentKeywords.some(kw => searchText.includes(kw))) {
    return 'Investments';
  }

  // Check for gift indicators
  const giftKeywords = ['gift', 'present', 'birthday', 'wedding', 'celebration'];
  if (giftKeywords.some(kw => searchText.includes(kw))) {
    return 'Gifts';
  }

  // Check for freelance indicators
  const freelanceKeywords = ['freelance', 'gig', 'project', 'commission'];
  if (freelanceKeywords.some(kw => searchText.includes(kw))) {
    return 'Freelance';
  }

  return 'Other';
}

/**
 * Convert Gregorian date to Hijri date
 */
export function toHijriDate(gregorianDate: string): string {
  try {
    const date = new Date(gregorianDate);
    const hijri = new Intl.DateTimeFormat('en-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
    return hijri;
  } catch {
    return '';
  }
}
