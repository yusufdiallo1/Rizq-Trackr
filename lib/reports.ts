/**
 * Report Generation Service
 * Generates PDF and CSV reports for financial data
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';
import { ExpenseEntry } from './expenses';
import { IncomeEntry } from './income';
import { formatHijriDate, getHijriMonthName } from './hijri-calendar';

function getSupabaseClient() {
  return createClientComponentClient<Database>();
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  startDateHijri?: string;
  endDateHijri?: string;
  category?: string;
  type?: 'income' | 'expense' | 'all';
  location?: string;
}

export interface ReportData {
  income: IncomeEntry[];
  expenses: ExpenseEntry[];
  summary: {
    totalIncome: number;
    totalExpenses: number;
    net: number;
    transactionCount: number;
  };
  dateRange: {
    start: string;
    end: string;
    startHijri?: string;
    endHijri?: string;
  };
}

/**
 * Generate report data based on filters
 */
export async function generateReportData(
  userId: string,
  filters: ReportFilters
): Promise<{ data: ReportData | null; error: string | null }> {
  try {
    const supabase = getSupabaseClient();
    let incomeQuery = supabase
      .from('income_entries')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null);

    let expenseQuery = supabase
      .from('expense_entries')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null);

    // Apply date filters (Gregorian)
    if (filters.startDate) {
      incomeQuery = incomeQuery.gte('date', filters.startDate);
      expenseQuery = expenseQuery.gte('date', filters.startDate);
    }

    if (filters.endDate) {
      incomeQuery = incomeQuery.lte('date', filters.endDate);
      expenseQuery = expenseQuery.lte('date', filters.endDate);
    }

    // Apply Hijri date filters
    if (filters.startDateHijri) {
      incomeQuery = incomeQuery.gte('date_hijri', filters.startDateHijri);
      expenseQuery = expenseQuery.gte('date_hijri', filters.startDateHijri);
    }

    if (filters.endDateHijri) {
      incomeQuery = incomeQuery.lte('date_hijri', filters.endDateHijri);
      expenseQuery = expenseQuery.lte('date_hijri', filters.endDateHijri);
    }

    // Apply category filter
    if (filters.category && filters.category !== 'all') {
      incomeQuery = incomeQuery.eq('category', filters.category);
      expenseQuery = expenseQuery.eq('category', filters.category);
    }

    // Apply location filter
    if (filters.location) {
      incomeQuery = incomeQuery.ilike('location_city', `%${filters.location}%`);
      expenseQuery = expenseQuery.ilike('location_city', `%${filters.location}%`);
    }

    const [incomeResult, expenseResult] = await Promise.all([
      incomeQuery.order('date', { ascending: false }),
      expenseQuery.order('date', { ascending: false }),
    ]);

    if (incomeResult.error || expenseResult.error) {
      return {
        data: null,
        error: incomeResult.error?.message || expenseResult.error?.message || 'Failed to fetch data',
      };
    }

    const income = (incomeResult.data || []) as IncomeEntry[];
    const expenses = (expenseResult.data || []) as ExpenseEntry[];

    // Filter by type if specified
    let filteredIncome = income;
    let filteredExpenses = expenses;

    if (filters.type === 'income') {
      filteredExpenses = [];
    } else if (filters.type === 'expense') {
      filteredIncome = [];
    }

    const totalIncome = filteredIncome.reduce((sum, entry) => sum + entry.amount, 0);
    const totalExpenses = filteredExpenses.reduce((sum, entry) => sum + entry.amount, 0);
    const net = totalIncome - totalExpenses;

    return {
      data: {
        income: filteredIncome,
        expenses: filteredExpenses,
        summary: {
          totalIncome,
          totalExpenses,
          net,
          transactionCount: filteredIncome.length + filteredExpenses.length,
        },
        dateRange: {
          start: filters.startDate || 'N/A',
          end: filters.endDate || 'N/A',
          startHijri: filters.startDateHijri || undefined,
          endHijri: filters.endDateHijri || undefined,
        },
      },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Generate CSV report
 */
export function generateCSVReport(reportData: ReportData): string {
  const lines: string[] = [];

  // Header
  lines.push('Financial Report');
  lines.push(`Date Range: ${reportData.dateRange.start} to ${reportData.dateRange.end}`);
  if (reportData.dateRange.startHijri && reportData.dateRange.endHijri) {
    lines.push(`Hijri Date Range: ${reportData.dateRange.startHijri} to ${reportData.dateRange.endHijri}`);
  }
  lines.push('');

  // Summary
  lines.push('Summary');
  lines.push(`Total Income,${reportData.summary.totalIncome.toFixed(2)}`);
  lines.push(`Total Expenses,${reportData.summary.totalExpenses.toFixed(2)}`);
  lines.push(`Net,${reportData.summary.net.toFixed(2)}`);
  lines.push(`Transaction Count,${reportData.summary.transactionCount}`);
  lines.push('');

  // Income entries
  lines.push('Income Entries');
  lines.push('Date,Date (Hijri),Category,Amount,Location,Notes');
  reportData.income.forEach((entry) => {
    const hijriDate = entry.date_hijri
      ? (() => {
          const [year, month, day] = entry.date_hijri.split('-').map(Number);
          return `${day} ${getHijriMonthName(month)} ${year} AH`;
        })()
      : '';
    const location = entry.location_city
      ? `${entry.location_city}${entry.location_country ? `, ${entry.location_country}` : ''}`
      : '';
    lines.push(
      `${entry.date},${hijriDate},${entry.category},${entry.amount.toFixed(2)},${location},"${entry.notes || ''}"`
    );
  });
  lines.push('');

  // Expense entries
  lines.push('Expense Entries');
  lines.push('Date,Date (Hijri),Category,Amount,Location,Notes');
  reportData.expenses.forEach((entry) => {
    const hijriDate = entry.date_hijri
      ? (() => {
          const [year, month, day] = entry.date_hijri.split('-').map(Number);
          return `${day} ${getHijriMonthName(month)} ${year} AH`;
        })()
      : '';
    const location = entry.location_city
      ? `${entry.location_city}${entry.location_country ? `, ${entry.location_country}` : ''}`
      : '';
    lines.push(
      `${entry.date},${hijriDate},${entry.category},${entry.amount.toFixed(2)},${location},"${entry.notes || ''}"`
    );
  });

  return lines.join('\n');
}

/**
 * Generate PDF report (simplified - returns HTML that can be converted to PDF)
 * For full PDF generation, you'd use a library like jsPDF or puppeteer
 */
export function generatePDFReportHTML(reportData: ReportData, userName: string = 'User'): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Financial Report</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    h1 { color: #1e3a8a; }
    h2 { color: #312e81; margin-top: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #1e3a8a; color: white; }
    .summary { background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .positive { color: #10b981; }
    .negative { color: #ef4444; }
  </style>
</head>
<body>
  <h1>Financial Report</h1>
  <p><strong>Generated for:</strong> ${userName}</p>
  <p><strong>Date Range:</strong> ${reportData.dateRange.start} to ${reportData.dateRange.end}</p>
  ${reportData.dateRange.startHijri && reportData.dateRange.endHijri
    ? `<p><strong>Hijri Date Range:</strong> ${reportData.dateRange.startHijri} to ${reportData.dateRange.endHijri}</p>`
    : ''}
  
  <div class="summary">
    <h2>Summary</h2>
    <p><strong>Total Income:</strong> <span class="positive">$${reportData.summary.totalIncome.toFixed(2)}</span></p>
    <p><strong>Total Expenses:</strong> <span class="negative">$${reportData.summary.totalExpenses.toFixed(2)}</span></p>
    <p><strong>Net:</strong> <span class="${reportData.summary.net >= 0 ? 'positive' : 'negative'}">$${reportData.summary.net.toFixed(2)}</span></p>
    <p><strong>Transaction Count:</strong> ${reportData.summary.transactionCount}</p>
  </div>

  <h2>Income Entries (${reportData.income.length})</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Date (Hijri)</th>
        <th>Category</th>
        <th>Amount</th>
        <th>Location</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      ${reportData.income
        .map(
          (entry) => `
        <tr>
          <td>${entry.date}</td>
          <td>${
            entry.date_hijri
              ? (() => {
                  const [year, month, day] = entry.date_hijri.split('-').map(Number);
                  return `${day} ${getHijriMonthName(month)} ${year} AH`;
                })()
              : ''
          }</td>
          <td>${entry.category}</td>
          <td>$${entry.amount.toFixed(2)}</td>
          <td>${entry.location_city || ''}${entry.location_country ? `, ${entry.location_country}` : ''}</td>
          <td>${entry.notes || ''}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>

  <h2>Expense Entries (${reportData.expenses.length})</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Date (Hijri)</th>
        <th>Category</th>
        <th>Amount</th>
        <th>Location</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      ${reportData.expenses
        .map(
          (entry) => `
        <tr>
          <td>${entry.date}</td>
          <td>${
            entry.date_hijri
              ? (() => {
                  const [year, month, day] = entry.date_hijri.split('-').map(Number);
                  return `${day} ${getHijriMonthName(month)} ${year} AH`;
                })()
              : ''
          }</td>
          <td>${entry.category}</td>
          <td>$${entry.amount.toFixed(2)}</td>
          <td>${entry.location_city || ''}${entry.location_country ? `, ${entry.location_country}` : ''}</td>
          <td>${entry.notes || ''}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>
</body>
</html>
  `;
}

