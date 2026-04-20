import { useState, useEffect } from 'react';
import { orderBy, limit, Timestamp } from 'firebase/firestore';
import { watchCollection, safeAddDoc } from '../services/firestore';
import { WeightEntry } from '../types';

export function useWeightHistory(userId: string | undefined): {
  history: WeightEntry[];
  loading: boolean;
  addWeight: (weight: number, date: string) => Promise<string | null>;
} {
  const [history, setHistory] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = watchCollection<WeightEntry>(
      `users/${userId}/weight_history`,
      (data) => {
        setHistory(data);
        setLoading(false);
      },
      [orderBy('date', 'desc'), limit(30)]
    );

    return unsubscribe;
  }, [userId]);

  const addWeight = async (weight: number, date: string): Promise<string | null> => {
    if (!userId) return null;
    return await safeAddDoc(`users/${userId}/weight_history`, {
      weight,
      date,
      userId,
      createdAt: Timestamp.now()
    }, 'Berat badan berhasil dicatat');
  };

  return { history, loading, addWeight };
}
