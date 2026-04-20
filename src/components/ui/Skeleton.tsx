import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'circle' | 'rect' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, variant = 'rect' }) => {
  return (
    <div 
      className={cn(
        "animate-shimmer bg-natural-line/30 dark:bg-dark-card/50",
        variant === 'circle' ? "rounded-full" : "rounded-2xl",
        variant === 'text' ? "h-4 w-full" : "",
        className
      )}
    />
  );
};

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-dark-card p-6 rounded-[32px] border border-natural-line dark:border-white/5 space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton className="w-12 h-12" variant="circle" />
      <div className="space-y-2 flex-1">
        <Skeleton className="w-1/2 h-4" variant="text" />
        <Skeleton className="w-1/4 h-3" variant="text" />
      </div>
    </div>
    <Skeleton className="h-24 w-full" />
  </div>
);
