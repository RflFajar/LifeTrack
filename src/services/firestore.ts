import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  query, 
  getDocs,
  onSnapshot,
  DocumentData,
  QueryConstraint,
  orderBy,
  limit
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { showToast } from '../context/ToastContext';

interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

/**
 * Centralized error handler for Firestore operations
 */
const handleFirestoreError = (
  error: Error | unknown, 
  operationType: FirestoreErrorInfo['operationType'], 
  path: string | null = null,
  silent: boolean = false
) => {
  const currentUser = auth.currentUser;
  const message = error instanceof Error ? error.message : 'Unknown Firestore error';
  
  const errorInfo: FirestoreErrorInfo = {
    error: message,
    operationType,
    path,
    authInfo: {
      userId: currentUser?.uid || 'unauthenticated',
      email: currentUser?.email || 'none',
      emailVerified: currentUser?.emailVerified || false,
      isAnonymous: currentUser?.isAnonymous || false,
      providerInfo: currentUser?.providerData.map(p => ({
        providerId: p.providerId,
        displayName: p.displayName || '',
        email: p.email || ''
      })) || []
    }
  };

  console.error("Firestore Error:", errorInfo);
  if (!silent) {
    showToast(message || 'Terjadi kesalahan pada server', 'error');
  }
  return errorInfo;
};

/**
 * safeAddDoc: Adds a document and shows toast
 */
export const safeAddDoc = async (
  path: string, 
  data: DocumentData, 
  successMsg: string = 'Data berhasil disimpan'
): Promise<string | null> => {
  try {
    const res = await addDoc(collection(db, path), data);
    showToast(successMsg, 'success');
    return res.id;
  } catch (error) {
    handleFirestoreError(error, 'create', path);
    return null;
  }
};

/**
 * safeDeleteDoc: Deletes a document and shows toast
 */
export const safeDeleteDoc = async (
  path: string, 
  id: string, 
  successMsg: string = 'Data berhasil dihapus'
): Promise<boolean> => {
  try {
    const docRef = doc(db, path, id);
    await deleteDoc(docRef);
    showToast(successMsg, 'success');
    return true;
  } catch (error) {
    handleFirestoreError(error, 'delete', `${path}/${id}`);
    return false;
  }
};

/**
 * safeUpdateDoc: Updates a document and shows toast
 */
export const safeUpdateDoc = async (
  path: string, 
  id: string, 
  data: Partial<DocumentData>, 
  successMsg: string = 'Perubahan berhasil disimpan'
): Promise<boolean> => {
  try {
    const docRef = doc(db, path, id);
    await updateDoc(docRef, data);
    showToast(successMsg, 'success');
    return true;
  } catch (error) {
    handleFirestoreError(error, 'update', `${path}/${id}`);
    return false;
  }
};

/**
 * safeSetDoc: Sets a document (create or overwrite) and shows toast
 */
export const safeSetDoc = async (
  path: string, 
  id: string, 
  data: DocumentData, 
  successMsg: string = 'Data berhasil disimpan'
): Promise<boolean> => {
  try {
    const docRef = doc(db, path, id);
    await setDoc(docRef, data, { merge: true });
    showToast(successMsg, 'success');
    return true;
  } catch (error) {
    handleFirestoreError(error, 'write', `${path}/${id}`);
    return false;
  }
};

/**
 * Original utility functions (kept for backward compatibility with existing hooks if needed, or internal use)
 */
export const fetchCollection = async (path: string, constraints: QueryConstraint[] = []) => {
  try {
    const q = query(collection(db, path), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    handleFirestoreError(error, 'list', path, true);
    return [];
  }
};

export const fetchDocument = async (path: string, id: string) => {
  try {
    const docRef = doc(db, path, id);
    const snap = await getDoc(docRef);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (error) {
    handleFirestoreError(error, 'get', `${path}/${id}`, true);
    return null;
  }
};

export const createDocument = async (path: string, data: DocumentData) => {
  try {
    return await addDoc(collection(db, path), data);
  } catch (error) {
    handleFirestoreError(error, 'create', path, true);
    throw error;
  }
};

export const updateDocument = async (path: string, id: string, data: Partial<DocumentData>) => {
  try {
    const docRef = doc(db, path, id);
    await updateDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, 'update', `${path}/${id}`, true);
    throw error;
  }
};

export const setDocument = async (path: string, id: string, data: DocumentData) => {
  try {
    const docRef = doc(db, path, id);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, 'write', `${path}/${id}`, true);
    throw error;
  }
};

export const removeDocument = async (path: string, id: string) => {
  try {
    const docRef = doc(db, path, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, 'delete', `${path}/${id}`, true);
    throw error;
  }
};

export const watchCollection = <T extends DocumentData>(
  path: string, 
  callback: (data: T[]) => void, 
  constraints: QueryConstraint[] = []
) => {
  const q = query(collection(db, path), ...constraints);
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as T)));
  }, (error) => {
    handleFirestoreError(error, 'list', path, true);
  });
};

/**
 * cleanupCollection: Deletes old documents keeping only N most recent
 */
export const cleanupCollection = async (path: string, keepCount: number, orderByField: string = 'createdAt') => {
  try {
    const q = query(collection(db, path), orderBy(orderByField, 'desc'));
    const snap = await getDocs(q);
    if (snap.size > keepCount) {
      const docsToDelete = snap.docs.slice(keepCount);
      const deletePromises = docsToDelete.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      console.log(`Cleaned up ${docsToDelete.length} documents from ${path}`);
    }
  } catch (error) {
    handleFirestoreError(error, 'delete', path, true);
  }
};
