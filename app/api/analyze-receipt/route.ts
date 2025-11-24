import { NextRequest, NextResponse } from 'next/server';

/**
 * API route for analyzing receipt images using OpenAI Vision API
 * This provides accurate receipt data extraction including:
 * - Total amount
 * - Date
 * - Merchant name
 * - Line items
 * - Category suggestion
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface ReceiptAnalysisResult {
  success: boolean;
  data?: {
    amount: number | null;
    date: string | null;
    merchant: string | null;
    items: string[];
    tax: number | null;
    subtotal: number | null;
    category: string;
    notes: string;
    confidence: number;
  };
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<ReceiptAnalysisResult>> {
  try {
    // Check for API key
    if (!OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your .env.local file.',
      }, { status: 500 });
    }

    // Get the base64 image from request
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({
        success: false,
        error: 'No image provided',
      }, { status: 400 });
    }

    // Call OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a receipt analyzer. Extract information from receipt images and return ONLY valid JSON.

Categories to choose from: Housing, Food, Transport, Healthcare, Education, Charity, Entertainment, Bills, Other

Return this exact JSON structure (no markdown, no code blocks, just JSON):
{
  "amount": <number or null - the total/grand total amount paid>,
  "date": "<YYYY-MM-DD format or null>",
  "merchant": "<store/business name or null>",
  "items": ["<item1>", "<item2>"],
  "tax": <number or null>,
  "subtotal": <number or null>,
  "category": "<one of the categories above>",
  "notes": "<brief description like 'Groceries at Walmart' or 'Gas at Shell'>",
  "confidence": <0-100 integer>
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this receipt image and extract the total amount, date, merchant name, items, and suggest a category. Return ONLY valid JSON, no markdown.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      return NextResponse.json({
        success: false,
        error: `OpenAI API error: ${errorData.error?.message || response.statusText}`,
      }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({
        success: false,
        error: 'No response from OpenAI',
      }, { status: 500 });
    }

    // Parse the JSON response
    try {
      // Clean the response - remove any markdown code blocks if present
      let cleanedContent = content.trim();
      if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
      }

      const parsedData = JSON.parse(cleanedContent);

      return NextResponse.json({
        success: true,
        data: {
          amount: parsedData.amount ?? null,
          date: parsedData.date ?? null,
          merchant: parsedData.merchant ?? null,
          items: parsedData.items ?? [],
          tax: parsedData.tax ?? null,
          subtotal: parsedData.subtotal ?? null,
          category: parsedData.category ?? 'Other',
          notes: parsedData.notes ?? '',
          confidence: parsedData.confidence ?? 85,
        },
      });
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      return NextResponse.json({
        success: false,
        error: 'Failed to parse receipt data',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Receipt analysis error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze receipt',
    }, { status: 500 });
  }
}
