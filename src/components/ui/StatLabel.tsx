import React from 'react';

interface StatLabelProps {
  label: string;
  value: string | number;
}

export const StatLabel = ({ label, value }: StatLabelProps) => {
  return (
    <div>
      <p className="text-[10px] font-bold text-natural-mute uppercase tracking-widest mb-0.5">{label}</p>
      <p className="font-serif font-bold text-natural-olive italic">{value}</p>
    </div>
  );
};
