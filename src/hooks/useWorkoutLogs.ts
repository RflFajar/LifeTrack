import { useState, useEffect } from 'react';
import { where, Timestamp } from 'firebase/firestore';
import { watchCollection, safeAddDoc } from '../services/firestore';
import { format } from 'date-fns';

export function useWorkoutLogs(userId: string | undefined) {
  const [completedToday, setCompletedToday] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (!userId) return;

    const constraints = [where('date', '==', today)];
    const unsubscribe = watchCollection<{ date: string }>(
      `users/${userId}/workout_logs`,
      (data) => {
        setCompletedToday(data.length > 0);
      },
      constraints
    );

    return unsubscribe;
  }, [userId, today]);

  const logWorkout = async () => {
    if (!userId) return;
    await safeAddDoc(`users/${userId}/workout_logs`, {
      userId,
      date: today,
      completed: true,
      createdAt: Timestamp.now()
    }, 'Latihan hari ini berhasil dicatat! Terus semangat!');
  };

  return { completedToday, logWorkout };
}
