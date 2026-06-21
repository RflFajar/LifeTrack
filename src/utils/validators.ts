import { Transaction } from '../types';

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
