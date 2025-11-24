'use client';

import { useTheme } from '@/lib/contexts/ThemeContext';
import { ZakatYearlyComparison } from '@/lib/zakat';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface ZakatComparisonChartProps {
  data: ZakatYearlyComparison[];
  currency?: string;
}

export function ZakatComparisonChart({ data, currency = 'USD' }: ZakatComparisonChartProps) {
  const { theme } = useTheme();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Transform data for chart
  const chartData = data.map((item) => ({
    year: `${item.year} / ${item.hijriYear}AH`,
    savings: item.savings,
    nisab: item.nisabThreshold,
    zakatPaid: item.zakatPaid,
    zakatDue: item.zakatDue,
  })).reverse(); // Show oldest to newest

  const textColor = theme === 'dark' ? '#fff' : '#1f2937';
  const mutedColor = theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={`p-4 rounded-xl shadow-xl backdrop-blur-md ${
            theme === 'dark' ? 'bg-slate-800/90 border border-white/10' : 'bg-white/90 border border-slate-200'
          }`}
        >
          <p className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className={theme === 'dark' ? 'text-white/70' : 'text-slate-600'}>
                {entry.name}:
              </span>
              <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className={`text-center py-8 ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>
        No historical data available yet
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="year"
            tick={{ fill: textColor, fontSize: 12 }}
            tickLine={{ stroke: gridColor }}
          />
          <YAxis
            tick={{ fill: textColor, fontSize: 12 }}
            tickLine={{ stroke: gridColor }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: 10 }}
            formatter={(value) => (
              <span style={{ color: textColor }}>{value}</span>
            )}
          />
          <Bar
            dataKey="savings"
            name="Your Savings"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="nisab"
            name="Nisab Threshold"
            fill="#f59e0b"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="zakatPaid"
            name="Zakat Paid"
            fill="#06b6d4"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
