import { useState, useEffect } from 'react';
import { Timestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { safeSetDoc } from '../services/firestore';
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

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, `users/${userId}/profile/data`));
        if (snap.exists()) {
          const data = snap.data();
          if (data) {
            setProfile(data as UserProfile);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const saveProfile = async (data: UserProfile): Promise<void> => {
    if (!userId) return;
    const success = await safeSetDoc(`users/${userId}/profile`, 'data', {
      ...data,
      userId,
      updatedAt: Timestamp.now()
    }, 'Profil berhasil diperbarui');
    if (success) {
      setProfile(data);
    }
  };

  const bmi = profile ? calculateBMI(profile.weight || 70, profile.height || 170) : "0";

  return { profile, loading, saveProfile, bmi };
}
