import { User } from 'firebase/auth';

export interface ScheduleItem {
  id: string;
  title: string;
  startTime: string;
  endTime?: string;
  date: string;
  activityType: string;
  userId: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  reminderMinutes?: number;
}

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
  height: number;
  weight: number;
  age: number;
  gender: 'male' | 'female';
  goal: string;
  job: string;
  budget: number;
  equipment?: string;
  targetWeight?: number;
  streak?: number;
  lastActive?: string;
  theme?: 'light' | 'dark';
}

export interface WeightEntry {
  id: string;
  weight: number;
  date: string;
  userId: string;
}

export interface LoggedMeal {
  id: string;
  name: string;
  protein: number;
  calories: number;
  carbs: number;
}

export interface WorkoutPlan {
  day: string;
  exercises: Array<{
    name: string;
    sets: string;
    reps: string;
    notes?: string;
  }>;
}

export interface NutritionRecommendation {
  meals: Array<{
    name: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    reason: string;
  }>;
  totalCalories: number;
  dailyTarget: {
    protein: number;
    carbohydrates: number;
  };
}

export interface Achievement {
  id: string;
  type: 'streak' | 'workout' | 'weight' | 'budget';
  title: string;
  description: string;
  unlockedAt: string;
  icon: string;
}

export interface SharedItem {
  id: string;
  type: 'workout' | 'recipe' | 'finance';
  title: string;
  creatorId: string;
  creatorName: string;
  content: Record<string, unknown>;
  likes: number;
  createdAt: string;
  userIds?: string[]; // For specific sharing
}

export interface Challenge {
  id: string;
  type: 'budget' | 'fitness';
  title: string;
  description: string;
  target: number;
  participants: string[];
  ownerId: string;
  status: 'active' | 'completed';
  startDate: string;
  endDate: string;
}

export interface UserConnection {
  userId: string;
  displayName: string;
  photoURL?: string;
  followedAt: string;
}
