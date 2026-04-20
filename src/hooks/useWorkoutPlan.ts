import { useState, useEffect } from 'react';
import { orderBy, limit, Timestamp } from 'firebase/firestore';
import { watchCollection, safeAddDoc, cleanupCollection } from '../services/firestore';
import { UserProfile, WorkoutPlan } from '../types';
import { getWorkoutRecommendation } from '../services/gemini';

export function useWorkoutPlan(userId: string | undefined, profile: UserProfile | null): {
  plans: WorkoutPlan[];
  loading: boolean;
  generatePlan: () => Promise<void>;
} {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const constraints = [orderBy('generatedAt', 'desc'), limit(1)];
    const unsubscribe = watchCollection<{ exercises: WorkoutPlan[] }>(`users/${userId}/workout_plans`, (data) => {
      if (data.length > 0) {
        setPlans(data[0].exercises);
      }
    }, constraints);

    return unsubscribe;
  }, [userId]);

  const generatePlan = async (): Promise<void> => {
    if (!userId || !profile) return;
    setLoading(true);
    try {
      const exercises = await getWorkoutRecommendation(profile);
      await safeAddDoc(`users/${userId}/workout_plans`, {
        exercises,
        userId,
        generatedAt: Timestamp.now()
      }, 'Rencana latihan baru berhasil dibuat');
      
      // Cleanup: keep max 3
      await cleanupCollection(`users/${userId}/workout_plans`, 3, 'generatedAt');
    } catch (e) {
      console.error("Gagal membuat rencana latihan:", e);
    } finally {
      setLoading(false);
    }
  };

  return { plans, loading, generatePlan };
}
