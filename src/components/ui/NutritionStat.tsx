import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../utils/cn';

interface NutritionStatProps {
  label: string;
  value: string;
  current: number;
  target: number;
  color: string;
}

export const NutritionStat = ({ label, value, current, target, color }: NutritionStatProps) => {
  const percentage = Math.min((current / (target || 1)) * 100, 100);
  return (
    <div className="text-center">
      <p className="text-[10px] text-natural-mute font-bold uppercase tracking-widest mb-1">{label}</p>
      <p className="text-[11px] font-black text-natural-ink leading-none mb-1">{value}</p>
      <div className="w-full bg-white h-1 mt-1 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={cn("h-full", color)}
        />
      </div>
    </div>
  );
};
