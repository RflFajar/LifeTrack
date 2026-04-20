import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { safeSetDoc } from '../services/firestore';

export interface CategoryBudget {
  [categoryId: string]: number;
}

export function useBudgets(userId: string | undefined, monthKey: string): {
  budgets: CategoryBudget;
  loading: boolean;
  setCategoryBudget: (categoryId: string, amount: number) => Promise<boolean>;
} {
  const [budgets, setBudgets] = useState<CategoryBudget>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const docRef = doc(db, `users/${userId}/budgets`, monthKey);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBudgets(data?.categories || {});
      } else {
        setBudgets({});
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [userId, monthKey]);

  const setCategoryBudget = async (categoryId: string, amount: number): Promise<boolean> => {
    if (!userId) return false;
    const newBudgets = { ...budgets, [categoryId]: amount };
    return await safeSetDoc(`users/${userId}/budgets`, monthKey, { categories: newBudgets }, 'Anggaran berhasil diperbarui');
  };

  return { budgets, loading, setCategoryBudget };
}
