import { useState, useEffect } from 'react';
import { orderBy, Timestamp, limit, where, QueryConstraint } from 'firebase/firestore';
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear, 
  subMonths,
  format 
} from 'date-fns';
import { watchCollection, safeAddDoc, safeDeleteDoc, safeUpdateDoc } from '../services/firestore';
import { Transaction } from '../types';

export type PeriodType = 'weekly' | 'monthly' | 'yearly' | 'six_months' | 'custom';

export function useTransactions(
  userId: string | undefined, 
  period: PeriodType = 'monthly', 
  customRange?: { start: string, end: string }
): {
  transactions: Transaction[];
  balance: { income: number; expense: number };
  loading: boolean;
  addTransaction: (type: 'income' | 'expense', amount: number, category: string, date: string, description?: string) => Promise<string | null>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
} {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState({ income: 0, expense: 0 });

  useEffect(() => {
    if (!userId) return;

    let start = '';
    let end = '';
    const now = new Date();

    if (period === 'weekly') {
      start = format(startOfWeek(now), 'yyyy-MM-dd');
      end = format(endOfWeek(now), 'yyyy-MM-dd');
    } else if (period === 'monthly') {
      start = format(startOfMonth(now), 'yyyy-MM-dd');
      end = format(endOfMonth(now), 'yyyy-MM-dd');
    } else if (period === 'yearly') {
      start = format(startOfYear(now), 'yyyy-MM-dd');
      end = format(endOfYear(now), 'yyyy-MM-dd');
    } else if (period === 'six_months') {
      start = format(subMonths(now, 5), 'yyyy-MM-01');
      end = format(now, 'yyyy-MM-dd');
    } else if (period === 'custom' && customRange) {
      start = customRange.start;
      end = customRange.end;
    }

    const constraints: QueryConstraint[] = [
      orderBy('date', 'desc'),
    ];

    if (start && end) {
      constraints.push(where('date', '>=', start));
      constraints.push(where('date', '<=', end));
    }

    const unsubscribe = watchCollection<Transaction>(
      `users/${userId}/transactions`,
      (data) => {
        const txs = data;
        setTransactions(txs);
        
        let inc = 0;
        let exp = 0;
        txs.forEach(tx => {
          if (tx.type === 'income') inc += tx.amount;
          else exp += tx.amount;
        });
        setBalance({ income: inc, expense: exp });
        setLoading(false);
      },
      constraints
    );

    return unsubscribe;
  }, [userId, period, customRange?.start, customRange?.end]);

  const addTransaction = async (type: 'income' | 'expense', amount: number, category: string, date: string, description?: string): Promise<string | null> => {
    if (!userId || !amount || !category) return null;
    return await safeAddDoc(`users/${userId}/transactions`, {
      type,
      amount,
      category,
      date,
      description,
      userId,
      createdAt: Timestamp.now()
    }, 'Transaksi berhasil dicatat');
  };

  const deleteTransaction = async (id: string): Promise<void> => {
    if (!userId) return;
    await safeDeleteDoc(`users/${userId}/transactions`, id, 'Transaksi berhasil dihapus');
  };

  const updateTransaction = async (id: string, data: Partial<Transaction>): Promise<void> => {
    if (!userId) return;
    await safeUpdateDoc(`users/${userId}/transactions`, id, data, 'Transaksi berhasil diperbarui');
  };

  return { transactions, balance, loading, addTransaction, deleteTransaction, updateTransaction };
}
