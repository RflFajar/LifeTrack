import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  loading, 
  variant = 'primary', 
  size = 'md', 
  className, 
  disabled, 
  ...props 
}) => {
  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: "bg-natural-olive text-white hover:bg-natural-dark-olive shadow-sm",
    secondary: "bg-natural-terracotta text-white hover:opacity-90 shadow-sm",
    outline: "bg-white dark:bg-transparent border border-natural-line dark:border-white/10 text-natural-ink dark:text-dark-text hover:bg-natural-bg dark:hover:bg-white/5",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
    ghost: "bg-transparent text-natural-mute hover:bg-natural-bg dark:hover:bg-white/5"
  };

  const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};
