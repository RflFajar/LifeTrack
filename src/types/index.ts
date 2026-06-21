import { User } from 'firebase/auth';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  quantity?: number;
  date: string;
  source?: string;
  description?: string;
  userId: string;
}

export interface UserProfile {
  height?: number;
  weight?: number;
  age?: number;
  gender?: 'male' | 'female';
  goal?: string;
  job: string;
  budget: number;
  equipment?: string;
  targetWeight?: number;
  streak?: number;
  lastActive?: string;
  theme?: 'light' | 'dark';
  
  // Biodata / Profil Pribadi Baru
  name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  photoURL?: string;
  birthDate?: string;
  currency?: string;
}

export interface SavingGoal {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category?: string;
  description?: string;
  createdAt: string;
}

