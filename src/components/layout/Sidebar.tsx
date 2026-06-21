import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'motion/react';
import { LayoutGrid, Ban, Wallet } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SidebarProps {
  logout: () => void;
}

export const Sidebar = ({ logout }: SidebarProps) => {
  return (
    <nav className="fixed left-4 top-4 bottom-4 w-24 bg-white dark:bg-dark-card border border-natural-line dark:border-white/5 hidden md:flex flex-col items-center py-8 z-50 rounded-[40px] shadow-sm transition-all duration-300">
      {/* Brand Logo Box at Top */}
      <div className="mb-8">
        <NavLink 
          to="/dashboard" 
          className="w-14 h-14 bg-natural-olive rounded-[18px] flex items-center justify-center text-white font-display font-bold text-2xl shadow-sm hover:scale-105 active:scale-95 transition-all"
        >
          L
        </NavLink>
      </div>

      {/* Nav Items List */}
      <div className="flex flex-col gap-4 flex-1 w-full px-2">
        <NavButton to="/dashboard" icon={<LayoutGrid size={20} />} label="Beranda" />
        <NavButton to="/money" icon={<Wallet size={20} />} label="Keuangan" />
      </div>

      {/* Logout Box at Bottom */}
      <div className="mt-auto w-full px-2">
        <button 
          onClick={logout} 
          className="w-full flex flex-col items-center gap-1.5 py-4 text-[#9C9489] hover:text-red-500 transition-colors group"
        >
          <Ban size={18} className="transition-transform group-hover:scale-110" />
          <span className="text-[11px] font-sans font-medium tracking-wide">Keluar</span>
        </button>
      </div>
    </nav>
  );
};

interface NavButtonProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

function NavButton({ to, icon, label }: NavButtonProps) {
  return (
    <NavLink 
      to={to}
      className={({ isActive }) => cn(
        "w-full flex flex-col items-center justify-center gap-2 py-5 px-1 rounded-3xl transition-all duration-300 group-hover:scale-[1.02]",
        isActive 
          ? "bg-[#FAF8F4] dark:bg-bg-main shadow-sm text-natural-olive font-semibold" 
          : "text-natural-mute hover:bg-[#FAF8F4]/50 dark:hover:bg-dark-bg-deep/50 hover:text-natural-olive"
      )}
    >
      {({ isActive }) => (
        <>
          <div className={cn(
            "transition-transform group-hover:scale-110 flex items-center justify-center",
            isActive ? "text-natural-olive" : "text-natural-mute"
          )}>
            {icon}
          </div>
          <span className={cn(
            "text-[11px] font-sans tracking-wide transition-colors",
            isActive ? "text-natural-olive font-semibold" : "text-natural-mute"
          )}>
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}
