import { useState, useEffect, useMemo } from 'react';
import { QueryConstraint, orderBy } from 'firebase/firestore';
import { watchCollection, safeAddDoc, safeUpdateDoc, safeDeleteDoc } from '../services/firestore';
import { SavingGoal } from '../types';

export function useSavingGoals(userId: string | undefined): {
  goals: SavingGoal[];
  loading: boolean;
  addGoal: (goal: Omit<SavingGoal, 'id' | 'userId' | 'createdAt'>) => Promise<string | null>;
  updateGoal: (id: string, goal: Partial<SavingGoal>) => Promise<boolean>;
  deleteGoal: (id: string) => Promise<boolean>;
} {
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [txsLoading, setTxsLoading] = useState(true);

  // Watch saving goals
  useEffect(() => {
    if (!userId) {
      setGoals([]);
      setGoalsLoading(false);
      return;
    }

    setGoalsLoading(true);
    const path = `users/${userId}/saving_goals`;
    const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];

    const unsubscribe = watchCollection<SavingGoal>(
      path,
      (data) => {
        setGoals(data);
        setGoalsLoading(false);
      },
      constraints
    );

    return unsubscribe;
  }, [userId]);

  // Watch transactions under the 'tabungan' category
  useEffect(() => {
    if (!userId) {
      setTransactions([]);
      setTxsLoading(false);
      return;
    }

    setTxsLoading(true);
    const path = `users/${userId}/transactions`;
    const unsubscribe = watchCollection<any>(
      path,
      (data) => {
        const savings = data.filter(tx => tx.category === 'tabungan');
        setTransactions(savings);
        setTxsLoading(false);
      }
    );

    return unsubscribe;
  }, [userId]);

  // Compute dynamic currentAmount based on transactions
  const computedGoals = useMemo(() => {
    return goals.map(goal => {
      // Find transactions explicitly linked to this goal, or implicitly via title match in the description
      const linkedTxs = transactions.filter(tx => {
        if (tx.goalId === goal.id) return true;
        if (tx.description && tx.description.toLowerCase().includes(goal.title.toLowerCase())) return true;
        return false;
      });

      let transactionDelta = linkedTxs.reduce((sum, tx) => {
        return tx.type === 'expense' ? sum + tx.amount : sum - tx.amount;
      }, 0);

      // Distribute generic / unallocated 'tabungan' transactions to the first / oldest saving goal
      const unallocatedTxs = transactions.filter(tx => {
        const hasExplicitLink = goals.some(g => tx.goalId === g.id || (tx.description && tx.description.toLowerCase().includes(g.title.toLowerCase())));
        return !hasExplicitLink;
      });

      if (unallocatedTxs.length > 0) {
        // If there's only one goal, OR if this goal is the default target (oldest/first)
        const isDefaultGoal = goals.length === 1 || goals[0].id === goal.id;
        if (isDefaultGoal) {
          const unallocatedDelta = unallocatedTxs.reduce((sum, tx) => {
            return tx.type === 'expense' ? sum + tx.amount : sum - tx.amount;
          }, 0);
          transactionDelta += unallocatedDelta;
        }
      }

      // Compute dynamic amount (stored initial value + transacted delta)
      const current = Math.max(0, (goal.currentAmount || 0) + transactionDelta);
      return {
        ...goal,
        currentAmount: Math.min(current, goal.targetAmount)
      };
    });
  }, [goals, transactions]);

  const addGoal = async (goal: Omit<SavingGoal, 'id' | 'userId' | 'createdAt'>): Promise<string | null> => {
    if (!userId) return null;
    const path = `users/${userId}/saving_goals`;
    const newGoal = {
      ...goal,
      userId,
      createdAt: new Date().toISOString()
    };
    return await safeAddDoc(path, newGoal, 'Tujuan tabungan berhasil ditambahkan');
  };

  const updateGoal = async (id: string, goal: Partial<SavingGoal>): Promise<boolean> => {
    if (!userId) return false;
    const path = `users/${userId}/saving_goals`;
    return await safeUpdateDoc(path, id, goal, 'Tujuan tabungan berhasil diperbarui');
  };

  const deleteGoal = async (id: string): Promise<boolean> => {
    if (!userId) return false;
    const path = `users/${userId}/saving_goals`;
    return await safeDeleteDoc(path, id, 'Tujuan tabungan berhasil dihapus');
  };

  return { goals: computedGoals, loading: goalsLoading || txsLoading, addGoal, updateGoal, deleteGoal };
}
