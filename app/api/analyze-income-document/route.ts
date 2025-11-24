import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

interface IncomeAnalysisResult {
  success: boolean;
  data?: {
    amount: number | null;
    payerName: string | null;
    date: string | null;
    paymentMethod: 'check' | 'cash' | 'bank_transfer' | 'wire' | 'other' | null;
    documentNumber: string | null;
    documentType: 'invoice' | 'check' | 'pay_stub' | 'receipt' | 'other';
    category: string | null;
    notes: string | null;
    confidence: number;
  };
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<IncomeAnalysisResult>> {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json({ success: false, error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert financial document analyzer specializing in invoices, checks, pay stubs, and payment receipts.
Extract the following information from the document image:
1. Amount (the total payment amount as a number)
2. Payer Name (who is paying - could be a company, individual, or employer)
3. Date (the date of the document or payment in YYYY-MM-DD format)
4. Payment Method (check, cash, bank_transfer, wire, or other)
5. Document Number (invoice number, check number, or reference number)
6. Document Type (invoice, check, pay_stub, receipt, or other)
7. Category (Salary, Business, Freelance, Gifts, Investments, or Other)
8. Notes (brief description of the payment purpose)

Return ONLY a valid JSON object with these fields. Be precise with numbers.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Please analyze this income document (invoice, check, pay stub, or receipt) and extract all relevant payment information.',
            },
            {
              type: 'image_url',
              image_url: {
                url: image,
                detail: 'high',
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ success: false, error: 'No response from AI' }, { status: 500 });
    }

    const parsed = JSON.parse(content);

    // Validate and normalize the amount
    let amount: number | null = null;
    if (parsed.amount !== undefined && parsed.amount !== null) {
      const numAmount = parseFloat(String(parsed.amount).replace(/[^0-9.-]/g, ''));
      if (!isNaN(numAmount) && numAmount > 0) {
        amount = numAmount;
      }
    }

    // Validate date format
    let date: string | null = null;
    if (parsed.date) {
      const dateStr = String(parsed.date);
      // Try to parse and format the date
      const parsedDate = new Date(dateStr);
      if (!isNaN(parsedDate.getTime())) {
        date = parsedDate.toISOString().split('T')[0];
      }
    }

    // Default to today if no date found
    if (!date) {
      date = new Date().toISOString().split('T')[0];
    }

    // Validate payment method
    const validPaymentMethods = ['check', 'cash', 'bank_transfer', 'wire', 'other'];
    const paymentMethod = validPaymentMethods.includes(parsed.paymentMethod?.toLowerCase())
      ? parsed.paymentMethod.toLowerCase()
      : 'other';

    // Validate document type
    const validDocTypes = ['invoice', 'check', 'pay_stub', 'receipt', 'other'];
    const documentType = validDocTypes.includes(parsed.documentType?.toLowerCase())
      ? parsed.documentType.toLowerCase()
      : 'other';

    // Validate category
    const validCategories = ['Salary', 'Business', 'Freelance', 'Gifts', 'Investments', 'Other'];
    const category = validCategories.includes(parsed.category) ? parsed.category : 'Other';

    // Calculate confidence based on how many fields were extracted
    let confidence = 0;
    if (amount) confidence += 30;
    if (parsed.payerName) confidence += 20;
    if (date) confidence += 15;
    if (parsed.documentNumber) confidence += 15;
    if (paymentMethod !== 'other') confidence += 10;
    if (documentType !== 'other') confidence += 10;

    return NextResponse.json({
      success: true,
      data: {
        amount,
        payerName: parsed.payerName || null,
        date,
        paymentMethod,
        documentNumber: parsed.documentNumber || null,
        documentType,
        category,
        notes: parsed.notes || null,
        confidence,
      },
    });
  } catch (error) {
    console.error('Error analyzing income document:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to analyze document' },
      { status: 500 }
    );
  }
}
