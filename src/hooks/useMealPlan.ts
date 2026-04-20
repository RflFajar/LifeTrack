import { useState, useEffect } from 'react';
import { orderBy, limit, Timestamp } from 'firebase/firestore';
import { watchCollection, safeAddDoc, cleanupCollection } from '../services/firestore';
import { UserProfile, NutritionRecommendation } from '../types';
import { getNutritionRecommendation } from '../services/gemini';

export function useMealPlan(userId: string | undefined, profile: UserProfile | null): {
  mealPlan: NutritionRecommendation | null;
  loading: boolean;
  generatePlan: () => Promise<void>;
} {
  const [mealPlan, setMealPlan] = useState<NutritionRecommendation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const constraints = [orderBy('generatedAt', 'desc'), limit(1)];
    const unsubscribe = watchCollection<NutritionRecommendation>(`users/${userId}/meal_plans`, (data) => {
      if (data.length > 0) {
        setMealPlan(data[0]);
      }
    }, constraints);

    return unsubscribe;
  }, [userId]);

  const generatePlan = async (): Promise<void> => {
    if (!userId || !profile) return;
    setLoading(true);
    try {
      const nutrition = await getNutritionRecommendation(profile);
      await safeAddDoc(`users/${userId}/meal_plans`, {
        ...nutrition,
        userId,
        generatedAt: Timestamp.now()
      }, 'Rencana nutrisi harian berhasil dibuat');
      
      // Cleanup: keep max 3
      await cleanupCollection(`users/${userId}/meal_plans`, 3, 'generatedAt');
    } catch (e) {
      console.error("Gagal membuat rencana makan:", e);
    } finally {
      setLoading(false);
    }
  };

  return { mealPlan, loading, generatePlan };
}
