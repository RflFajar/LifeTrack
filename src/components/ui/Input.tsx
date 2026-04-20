import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  onChange: (value: string) => void;
}

export const Input = ({ label, className, onChange, ...props }: InputProps) => {
  return (
    <div className="w-full">
      <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest">{label}</label>
      <input 
        {...props}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full mt-1 p-2 bg-white dark:bg-dark-bg-deep border border-natural-line dark:border-white/5 rounded-lg outline-none text-sm focus:ring-1 focus:ring-natural-olive/30 text-natural-ink dark:text-dark-text italic placeholder:text-natural-mute/50",
          className
        )}
      />
    </div>
  );
};
