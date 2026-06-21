import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
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

    const fetchBudgets = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, `users/${userId}/budgets`, monthKey);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setBudgets(data?.categories || {});
        } else {
          setBudgets({});
        }
      } catch (error) {
        console.error("Error fetching budgets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
  }, [userId, monthKey]);

  const setCategoryBudget = async (categoryId: string, amount: number): Promise<boolean> => {
    if (!userId) return false;
    const newBudgets = { ...budgets, [categoryId]: amount };
    const success = await safeSetDoc(`users/${userId}/budgets`, monthKey, { categories: newBudgets }, 'Anggaran berhasil diperbarui');
    if (success) {
      setBudgets(newBudgets);
    }
    return success;
  };

  return { budgets, loading, setCategoryBudget };
}
