import { useState, useEffect } from 'react';
import { watchCollection, safeDeleteDoc, safeSetDoc } from '../services/firestore';
import { LoggedMeal, NutritionRecommendation } from '../types';
import { sanitizeMealData } from '../utils/validators';

export function useDailyProgress(
  userId: string | undefined, 
  recommendations: NutritionRecommendation | null, 
  today: string
): {
  loggedMeals: LoggedMeal[];
  totals: { protein: number; calories: number; carbs: number };
  targets: { protein: number; calories: number; carbs: number };
  addMeal: (meal: Partial<LoggedMeal>) => Promise<void>;
  removeMeal: (meal: LoggedMeal) => Promise<void>;
} {
  const [loggedMeals, setLoggedMeals] = useState<LoggedMeal[]>([]);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = watchCollection<LoggedMeal>(
      `users/${userId}/daily_progress/${today}/meals`,
      (data) => {
        setLoggedMeals(data);
      }
    );

    return unsubscribe;
  }, [userId, today]);

  const addMeal = async (meal: Partial<LoggedMeal>): Promise<void> => {
    if (!userId) return;
    
    // Use crypto.randomUUID() safely
    const mealId = meal.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2));
    
    const safeMeal = sanitizeMealData({
      ...meal,
      id: mealId
    });
    
    await safeSetDoc(`users/${userId}/daily_progress/${today}/meals`, mealId, safeMeal, 'Makanan berhasil dicatat');
  };

  const removeMeal = async (meal: LoggedMeal): Promise<void> => {
    if (!userId || !meal.id) return;
    await safeDeleteDoc(`users/${userId}/daily_progress/${today}/meals`, meal.id, 'Makanan berhasil dihapus');
  };

  const totals = loggedMeals.reduce((acc, meal) => ({
    protein: acc.protein + (Number(meal.protein) || 0),
    calories: acc.calories + (Number(meal.calories) || 0),
    carbs: acc.carbs + (Number(meal.carbs) || 0)
  }), { protein: 0, calories: 0, carbs: 0 });

  const targets = {
    protein: recommendations?.dailyTarget?.protein || 140,
    calories: recommendations?.totalCalories || 2500,
    carbs: recommendations?.dailyTarget?.carbohydrates || 300
  };

  return { loggedMeals, totals, targets, addMeal, removeMeal };
}
