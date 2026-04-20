import React from 'react';
import { motion, HTMLMotionProps, VariantLabels, Target, Transition } from 'motion/react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  initial?: boolean | VariantLabels | Target;
  animate?: VariantLabels | Target;
  layout?: boolean;
}

export const Card = ({ children, className, initial, animate, layout }: CardProps) => (
  <motion.div 
    layout={layout}
    initial={initial || { opacity: 0, y: 10 }} 
    animate={animate || { opacity: 1, y: 0 }} 
    className={cn("bg-white dark:bg-dark-card rounded-[32px] p-6 shadow-sm border border-natural-line/50 dark:border-white/5", className)}
  >
    {children}
  </motion.div>
);
