import React from 'react';
import { motion } from 'motion/react';
import { Info, Calendar, Wallet, Dumbbell, BrainCircuit, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn';

interface SidebarProps {
  logout: () => void;
}

export const Sidebar = ({ logout }: SidebarProps) => {
  return (
    <nav className="fixed left-0 top-0 bottom-0 w-20 bg-white dark:bg-dark-card border-r border-natural-line dark:border-white/5 hidden md:flex flex-col items-center py-8 z-50 transition-colors duration-300">
      <div className="mb-12">
        <NavLink to="/dashboard" className="w-10 h-10 bg-natural-olive rounded-full flex items-center justify-center text-white font-serif italic text-xl">L</NavLink>
      </div>
      <div className="flex flex-col gap-6 flex-1">
        <NavIcon to="/dashboard" icon={<Info />} label="Dash" />
        <NavIcon to="/schedule" icon={<Calendar />} label="Jadwal" />
        <NavIcon to="/money" icon={<Wallet />} label="Uang" />
        <NavIcon to="/health" icon={<Dumbbell />} label="Sehat" />
        <NavIcon to="/insights" icon={<BrainCircuit />} label="Insights" />
      </div>
      <div className="mt-auto">
        <button onClick={logout} className="p-3 text-slate-400 hover:text-red-500 transition-colors">
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
};

function NavIcon({ icon, label, to }: { icon: any, label: string, to: string }) {
  return (
    <NavLink 
      to={to}
      className={({ isActive }) => cn(
        "relative p-3 rounded-2xl transition-all duration-300 group",
        isActive 
          ? "bg-natural-peach dark:bg-natural-olive/20 text-natural-olive" 
          : "text-natural-mute hover:bg-natural-bg dark:hover:bg-dark-bg-deep hover:text-natural-olive"
      )}
    >
      {({ isActive }) => (
        <>
          {React.cloneElement(icon, { size: 24 })}
          {isActive && <motion.div layoutId="nav-pill" className="absolute left-0 top-0 bottom-0 w-1 bg-natural-terracotta rounded-r-full" />}
          <span className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}
