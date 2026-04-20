import { useState, useEffect } from 'react';
import { orderBy, Timestamp } from 'firebase/firestore';
import { watchCollection, safeAddDoc, safeDeleteDoc, safeUpdateDoc } from '../services/firestore';
import { ScheduleItem } from '../types';

export function useSchedule(userId: string | undefined): {
  items: ScheduleItem[];
  loading: boolean;
  addItem: (data: Omit<ScheduleItem, 'id' | 'userId'>) => Promise<string | null>;
  updateItem: (id: string, data: Partial<ScheduleItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
} {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const constraints = [
      orderBy('date', 'desc'),
      orderBy('startTime', 'asc')
    ];

    const unsubscribe = watchCollection<ScheduleItem>(
      `users/${userId}/schedule`, 
      (data) => {
        setItems(data);
        setLoading(false);
      },
      constraints
    );

    return unsubscribe;
  }, [userId]);

  const addItem = async (data: Omit<ScheduleItem, 'id' | 'userId'>): Promise<string | null> => {
    if (!userId || !data.title || !data.startTime) return null;
    return await safeAddDoc(`users/${userId}/schedule`, {
      ...data,
      userId,
      createdAt: Timestamp.now()
    }, 'Agenda berhasil ditambahkan');
  };

  const updateItem = async (id: string, data: Partial<ScheduleItem>): Promise<void> => {
    if (!userId) return;
    await safeUpdateDoc(`users/${userId}/schedule`, id, data, 'Agenda berhasil diperbarui');
  };

  const deleteItem = async (id: string): Promise<void> => {
    if (!userId) return;
    await safeDeleteDoc(`users/${userId}/schedule`, id, 'Agenda berhasil dihapus');
  };

  return { items, loading, addItem, updateItem, deleteItem };
}
