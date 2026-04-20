import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { Transaction } from '../../types';
import { subMonths, format, startOfMonth, isSameMonth, parseISO } from 'date-fns';

interface IncomeExpenseChartProps {
  transactions: Transaction[];
}

export const IncomeExpenseChart = ({ transactions }: IncomeExpenseChartProps) => {
  // Generate last 6 months
  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(new Date(), i);
    return {
      monthKey: format(d, 'yyyy-MM'),
      monthLabel: format(d, 'MMM'),
      income: 0,
      expense: 0
    };
  }).reverse();

  // Aggregate
  transactions.forEach(tx => {
    const txDate = parseISO(tx.date);
    const monthKey = format(txDate, 'yyyy-MM');
    const monthData = last6Months.find(m => m.monthKey === monthKey);
    if (monthData) {
      if (tx.type === 'income') monthData.income += tx.amount;
      else monthData.expense += tx.amount;
    }
  });

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={last6Months} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E1DE" />
          <XAxis 
            dataKey="monthLabel" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#7C7976', fontSize: 11, fontWeight: 600 }}
            dy={10}
          />
          <YAxis hide />
          <RechartsTooltip 
            cursor={{ fill: '#F5E6D3', opacity: 0.4 }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 rounded-xl shadow-lg border border-natural-line/50">
                    <p className="text-[10px] font-bold text-natural-mute uppercase mb-2">
                      {payload[0].payload.monthLabel} {payload[0].payload.monthKey.split('-')[0]}
                    </p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[10px] font-bold text-natural-olive uppercase">Masuk</span>
                        <span className="text-xs font-serif font-bold text-natural-ink italic">{formatCurrency(payload[0].value as number)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[10px] font-bold text-natural-terracotta uppercase">Keluar</span>
                        <span className="text-xs font-serif font-bold text-natural-ink italic">{formatCurrency(payload[1].value as number)}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="circle"
            wrapperStyle={{ paddingBottom: 20, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' }}
          />
          <Bar name="Masuk" dataKey="income" fill="#6B8E23" radius={[4, 4, 0, 0]} barSize={12} />
          <Bar name="Keluar" dataKey="expense" fill="#CD5C5C" radius={[4, 4, 0, 0]} barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
