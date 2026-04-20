import { ACTIVITY_TYPES, GOAL_OPTIONS } from '../constants';
import { ScheduleItem, Transaction, UserProfile } from '../types';

/**
 * Validate Schedule Item data
 */
export const validateScheduleItem = (data: Partial<ScheduleItem>): string | null => {
  if (!data.title || data.title.trim().length === 0) {
    return 'Judul agenda wajib diisi';
  }
  if (data.title.length > 100) {
    return 'Judul agenda maksimal 100 karakter';
  }
  if (!data.startTime) {
    return 'Waktu mulai wajib diisi';
  }
  if (data.endTime && data.startTime >= data.endTime) {
    return 'Waktu selesai harus setelah waktu mulai';
  }
  if (!data.date) {
    return 'Tanggal wajib diisi';
  }
  if (!data.activityType || !ACTIVITY_TYPES.includes(data.activityType)) {
    return 'Tipe aktivitas tidak valid';
  }
  return null;
};

/**
 * Validate Transaction data
 */
export const validateTransaction = (data: Partial<Transaction>): string | null => {
  if (data.type !== 'income' && data.type !== 'expense') {
    return 'Tipe transaksi harus Pemasukan atau Pengeluaran';
  }
  if (!data.amount || data.amount <= 0) {
    return 'Jumlah harus lebih besar dari 0';
  }
  if (!data.category || data.category.trim().length === 0) {
    return 'Kategori wajib diisi';
  }
  if (data.category.length > 50) {
    return 'Kategori maksimal 50 karakter';
  }
  return null;
};

/**
 * Validate User Profile data
 */
export const validateProfile = (data: Partial<UserProfile>): string | null => {
  if (!data.height || data.height < 50 || data.height > 300) {
    return 'Tinggi badan harus antara 50cm - 300cm';
  }
  if (!data.weight || data.weight < 20 || data.weight > 500) {
    return 'Berat badan harus antara 20kg - 500kg';
  }
  if (!data.age || data.age < 1 || data.age > 150) {
    return 'Usia harus antara 1 - 150 tahun';
  }
  if (!data.gender) {
    return 'Jenis kelamin wajib dipilih';
  }
  if (data.budget === undefined || data.budget < 0) {
    return 'Anggaran minimal 0';
  }
  if (data.goal && !GOAL_OPTIONS.includes(data.goal)) {
    return 'Target goal tidak valid';
  }
  if (!data.job || data.job.trim().length === 0) {
    return 'Pekerjaan wajib diisi';
  }
  if (!data.targetWeight || data.targetWeight < 20 || data.targetWeight > 500) {
    return 'Target berat badan wajib diisi dengan valid';
  }
  return null;
};

/**
 * Sanitize meal data to ensure numbers are valid
 */
export const sanitizeMealData = (meal: Record<string, unknown>): {
  id: string;
  name: string;
  protein: number;
  calories: number;
  carbs: number;
} => {
  return {
    id: String(meal.id || ''),
    name: String(meal.name || 'Tanpa Nama'),
    protein: Number(meal.protein) || 0,
    calories: Number(meal.calories) || 0,
    carbs: Number(meal.carbs) || 0
  };
};
