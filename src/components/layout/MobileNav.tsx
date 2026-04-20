import React from 'react';
import { motion } from 'motion/react';
import { Info, Calendar, Wallet, Dumbbell, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn';

export const MobileNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-dark-card border-t border-natural-line dark:border-white/5 flex items-center justify-around px-2 md:hidden z-50 transition-colors duration-300">
      <MobileNavIcon to="/dashboard" icon={<Info />} />
      <MobileNavIcon to="/schedule" icon={<Calendar />} />
      <MobileNavIcon to="/money" icon={<Wallet />} />
      <MobileNavIcon to="/social" icon={<Users />} />
      <MobileNavIcon to="/health" icon={<Dumbbell />} />
    </nav>
  );
};

function MobileNavIcon({ icon, to }: { icon: any, to: string }) {
  return (
    <NavLink 
      to={to}
      className={({ isActive }) => cn(
        "flex-1 h-full flex flex-col items-center justify-center gap-1 transition-colors",
        isActive ? "text-natural-olive" : "text-natural-mute"
      )}
    >
      {({ isActive }) => (
        <>
          {React.cloneElement(icon, { size: 24, strokeWidth: isActive ? 2.5 : 2 })}
          {isActive && <motion.div layoutId="mobile-dot" className="w-1 h-1 bg-natural-terracotta rounded-full" />}
        </>
      )}
    </NavLink>
  );
}
