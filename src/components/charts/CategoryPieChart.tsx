import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import { Transaction } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { TRANSACTION_CATEGORIES } from '../../constants';

interface CategoryPieChartProps {
  transactions: Transaction[];
}

const COLORS = ['#606C38', '#BC6C25', '#DDA15E', '#2B2D42', '#8D99AE', '#CD5C5C', '#6B8E23', '#A89F91'];

export const CategoryPieChart = ({ transactions }: CategoryPieChartProps) => {
  const expenseData = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((acc: any, tx) => {
      const categoryLabel = TRANSACTION_CATEGORIES.find(c => c.id === tx.category)?.label || tx.category;
      const existing = acc.find((i: any) => i.name === categoryLabel);
      if (existing) {
        existing.value += tx.amount;
      } else {
        acc.push({ name: categoryLabel, value: tx.amount });
      }
      return acc;
    }, [])
    .sort((a: any, b: any) => b.value - a.value);

  const totalExpense = expenseData.reduce((sum: number, entry: any) => sum + entry.value, 0);

  return (
    <div className="h-[250px] w-full relative">
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-8">
        <p className="text-[10px] font-bold text-natural-mute uppercase tracking-widest">Total</p>
        <p className="text-lg font-serif font-bold text-natural-ink italic leading-tight">
          {formatCurrency(totalExpense)}
        </p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={expenseData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={85}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {expenseData.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <RechartsTooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 rounded-xl shadow-lg border border-natural-line/50">
                    <p className="text-[10px] font-bold text-natural-mute uppercase mb-1">{payload[0].name}</p>
                    <p className="text-sm font-serif font-bold text-natural-ink">
                      {formatCurrency(payload[0].value as number)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            content={({ payload }) => (
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-4">
                {payload?.map((entry: any, index: number) => (
                  <div key={`legend-${index}`} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-[10px] font-bold text-natural-mute uppercase tracking-tight">{entry.value}</span>
                  </div>
                ))}
              </div>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
