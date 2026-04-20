import { useState, useEffect } from 'react';
import { orderBy, Timestamp } from 'firebase/firestore';
import { watchCollection, safeAddDoc } from '../services/firestore';
import { Achievement } from '../types';

export function useAchievements(userId: string | undefined): {
  achievements: Achievement[];
  loading: boolean;
  unlockAchievement: (type: Achievement['type'], title: string, description: string, icon: string) => Promise<string | null | void>;
} {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = watchCollection<Achievement>(
      `users/${userId}/achievements`,
      (data) => {
        setAchievements(data);
        setLoading(false);
      },
      [orderBy('unlockedAt', 'desc')]
    );

    return unsubscribe;
  }, [userId]);

  const unlockAchievement = async (type: Achievement['type'], title: string, description: string, icon: string): Promise<string | null | void> => {
    if (!userId) return;
    
    // Check if already unlocked
    const exists = achievements.find(a => a.type === type && a.title === title);
    if (exists) return;

    return await safeAddDoc(`users/${userId}/achievements`, {
      type,
      title,
      description,
      icon,
      unlockedAt: new Date().toISOString()
    }, `Pencapaian Baru: ${title}!`);
  };

  return { achievements, loading, unlockAchievement };
}
