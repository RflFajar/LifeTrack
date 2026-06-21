import { format } from 'date-fns';

/**
 * Formats a number as Indonesian Rupiah currency
 */
export const formatCurrency = (amount: number): string => {
  return `Rp ${amount.toLocaleString()}`;
};

/**
 * Formats a date string or Date object
 */
export const formatDate = (date: string | Date, formatStr: string = 'EEEE, d MMMM'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr);
};

/**
 * Calculates BMI index
 */
export const calculateBMI = (weight: number, height: number): string => {
  if (!height || height === 0) return "0";
  return (weight / ((height / 100) ** 2)).toFixed(1);
};

/**
 * Interprets BMI score
 */
export const getBMICategory = (bmi: string): 'Kurus' | 'Ideal' | 'Overweight' => {
  const score = parseFloat(bmi);
  if (score < 18.5) return 'Kurus';
  if (score < 25) return 'Ideal';
  return 'Overweight';
};

/**
 * Calculates BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
 */
export const calculateBMR = (gender: 'male' | 'female', weight: number, height: number, age: number): number => {
  if (gender === 'male') {
    return (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
};

/**
 * Formats a number compactly in Indonesian format, e.g., Rp 5.2 jt
 */
export const formatCurrencyCompact = (amount: number): string => {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  
  if (absAmount >= 1_000_000_000) {
    const value = (absAmount / 1_000_000_000).toFixed(1).replace('.0', '');
    return `${sign}Rp ${value.replace('.', ',')} M`;
  }
  if (absAmount >= 1_000_000) {
    const value = (absAmount / 1_000_000).toFixed(1).replace('.0', '');
    return `${sign}Rp ${value.replace('.', ',')} jt`;
  }
  if (absAmount >= 1_000) {
    const value = (absAmount / 1_000).toFixed(1).replace('.0', '');
    return `${sign}Rp ${value.replace('.', ',')} rb`;
  }
  return `${sign}Rp ${absAmount.toLocaleString()}`;
};
