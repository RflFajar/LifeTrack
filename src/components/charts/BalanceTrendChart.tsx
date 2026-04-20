import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Transaction } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { format, parseISO } from 'date-fns';

interface BalanceTrendChartProps {
  transactions: Transaction[];
}

export const BalanceTrendChart = ({ transactions }: BalanceTrendChartProps) => {
  // Sort by date ascending to calculate cumulative balance
  const sortedTxs = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  
  const dailyData: any[] = [];
  let runningBalance = 0;

  sortedTxs.forEach(tx => {
    runningBalance += (tx.type === 'income' ? tx.amount : -tx.amount);
    
    const existingDate = dailyData.find(d => d.date === tx.date);
    if (existingDate) {
      existingDate.balance = runningBalance;
    } else {
      dailyData.push({ 
        date: tx.date, 
        balance: runningBalance,
        displayDate: format(parseISO(tx.date), 'dd MMM')
      });
    }
  });

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6B8E23" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6B8E23" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E1DE" />
          <XAxis 
            dataKey="displayDate" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#7C7976', fontSize: 10, fontWeight: 600 }}
            dy={10}
          />
          <YAxis hide />
          <RechartsTooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 rounded-xl shadow-lg border border-natural-line/50">
                    <p className="text-[10px] font-bold text-natural-mute uppercase mb-1">{payload[0].payload.displayDate}</p>
                    <p className="text-sm font-serif font-bold text-natural-ink">
                      {formatCurrency(payload[0].value as number)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area 
            type="monotone" 
            dataKey="balance" 
            stroke="#6B8E23" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorBalance)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
