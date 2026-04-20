import { useState, useEffect } from 'react';
import { Timestamp, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { watchCollection, safeSetDoc } from '../services/firestore';
import { UserProfile } from '../types';
import { calculateBMI } from '../utils/formatters';

export function useProfile(userId: string | undefined): {
  profile: UserProfile | null;
  loading: boolean;
  saveProfile: (data: UserProfile) => Promise<void>;
  bmi: string;
} {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, `users/${userId}/profile/data`), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        // Simple type gate
        if (data) {
          setProfile(data as UserProfile);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  const saveProfile = async (data: UserProfile): Promise<void> => {
    if (!userId) return;
    await safeSetDoc(`users/${userId}/profile`, 'data', {
      ...data,
      userId,
      updatedAt: Timestamp.now()
    }, 'Profil berhasil diperbarui');
  };

  const bmi = profile ? calculateBMI(profile.weight, profile.height) : "0";

  return { profile, loading, saveProfile, bmi };
}
