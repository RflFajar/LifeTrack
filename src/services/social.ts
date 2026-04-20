import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { safeAddDoc, safeDeleteDoc } from './firestore';
import { SharedItem, Challenge, UserConnection } from '../types';

import { showToast } from '../context/ToastContext';
import { captureError } from './monitoring';

/**
 * FOLLOW SYSTEM
 */
export const followUser = async (currentUserId: string, targetUser: { id: string, name: string, photo?: string }): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    // Add to following of current user
    const followingRef = doc(db, `users/${currentUserId}/following/${targetUser.id}`);
    batch.set(followingRef, {
      userId: targetUser.id,
      displayName: targetUser.name,
      photoURL: targetUser.photo || '',
      followedAt: new Date().toISOString()
    });

    // Add to followers of target user
    const followersRef = doc(db, `users/${targetUser.id}/followers/${currentUserId}`);
    batch.set(followersRef, {
      userId: currentUserId,
      followedAt: new Date().toISOString()
    });

    await batch.commit();
    showToast(`Berhasil mengikuti ${targetUser.name}`, 'success');
  } catch (error) {
    captureError(error, { currentUserId, targetUserId: targetUser.id });
    showToast('Gagal mengikuti pengguna', 'error');
  }
};

/**
 * SHARING SYSTEM
 */
export const shareItem = async (item: Omit<SharedItem, 'id' | 'createdAt' | 'likes'>): Promise<string | null> => {
  return await safeAddDoc('shared_items', {
    ...item,
    likes: 0,
    createdAt: new Date().toISOString()
  }, 'Materi berhasil dibagikan');
};

/**
 * CHALLENGE SYSTEM
 */
export const createChallenge = async (challenge: Omit<Challenge, 'id' | 'status'>): Promise<string | null> => {
  return await safeAddDoc('challenges', {
    ...challenge,
    status: 'active'
  }, 'Tantangan baru dibuat!');
};

export const joinChallenge = async (challengeId: string, userId: string): Promise<void> => {
  // Simple update logic
};
