import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  Utensils, 
  Car, 
  Gamepad2, 
  Receipt, 
  HeartPulse, 
  GraduationCap, 
  Wallet, 
  MoreHorizontal,
  Briefcase,
  Heart,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { TRANSACTION_CATEGORIES, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../constants';
import { cn } from '../../utils/cn';

const CATEGORY_ICONS: Record<string, any> = {
  Utensils,
  Car,
  Gamepad2,
  Receipt,
  HeartPulse,
  GraduationCap,
  Wallet,
  MoreHorizontal,
  Briefcase,
  Heart,
  Sparkles,
  TrendingUp
};

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  type?: 'income' | 'expense';
  className?: string;
}

export const CategorySelect = ({ value, onChange, type = 'expense', className }: CategorySelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const selectedCategory = categories.find(c => c.id === value) || categories[0];
  const SelectedIcon = CATEGORY_ICONS[selectedCategory.icon] || MoreHorizontal;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3.5 bg-natural-bg border border-natural-line rounded-2xl outline-none text-sm transition-all hover:border-natural-olive"
      >
        <div className="flex items-center gap-3">
          <SelectedIcon size={18} className="text-natural-olive" />
          <span className="font-medium text-natural-ink">{selectedCategory.label}</span>
        </div>
        <ChevronDown className={cn("text-natural-mute transition-transform duration-200", isOpen && "rotate-180")} size={16} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-natural-line rounded-[24px] shadow-xl overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200 origin-top">
          {categories.map((category) => {
            const Icon = CATEGORY_ICONS[category.icon] || MoreHorizontal;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => {
                  onChange(category.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-natural-bg",
                  value === category.id ? "bg-natural-bg/50 text-natural-olive font-bold" : "text-natural-ink"
                )}
              >
                <div className={cn(
                  "p-2 rounded-xl transition-colors",
                  value === category.id ? "bg-natural-olive text-white" : "bg-natural-line/50 text-natural-mute"
                )}>
                  <Icon size={16} />
                </div>
                {category.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
