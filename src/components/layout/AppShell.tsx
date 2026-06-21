import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, 
  User as UserIcon,
  Sun,
  Moon
} from 'lucide-react';
import { User } from 'firebase/auth';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useProfile } from '../../hooks/useProfile';
import { Profile } from '../../pages/Profile';
import { cn } from '../../utils/cn';

import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

interface AppShellProps {
  children: React.ReactNode;
  user: User;
  logout: () => void;
}

export const AppShell = ({ children, user, logout }: AppShellProps) => {
  const { isDark, toggleTheme } = useTheme();
  const { profile } = useProfile(user.uid);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const path = location.pathname.substring(1) || 'dashboard';

  const getPageTitle = (p: string) => {
    switch (p) {
      case 'dashboard': return 'Overview';
      case 'money': return 'Keuangan';
      default: return 'Overview';
    }
  };

  return (
    <div className="min-h-screen bg-natural-bg pb-20 md:pb-0 md:pl-32 text-natural-ink font-sans transition-colors duration-300">
      <Sidebar logout={logout} />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-4 md:p-10">
        <header className="flex items-center justify-between mb-8 border-b border-natural-line pb-6">
          <div>
            <h2 className="text-[9px] md:text-[10px] font-bold text-natural-mute uppercase tracking-widest mb-1 font-sans font-black">
              {path === 'dashboard' ? 'Status' : 'LifeTrack'}
            </h2>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-natural-ink italic">
              {getPageTitle(path)}
            </h1>
          </div>
          <div className="flex items-center gap-1.5 md:gap-3">
            {/* Custom Theme Toggle Switch */}
            <div className="bg-white dark:bg-dark-card border border-natural-line/80 dark:border-white/5 h-9 md:h-14 px-2 md:px-4 rounded-full md:rounded-[24px] shadow-sm flex items-center justify-center gap-1 md:gap-2.5 select-none shrink-0">
              <Sun className={cn("transition-colors w-3.5 h-3.5 md:w-4 md:h-4 text-amber-500")} />
              <button 
                onClick={toggleTheme}
                className="relative inline-flex h-4.5 w-8 md:h-6 md:w-11 items-center shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none bg-natural-olive"
                aria-label="Toggle Theme"
              >
                <span 
                  className={cn(
                    "pointer-events-none inline-block h-3.5 w-3.5 md:h-4 md:w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    isDark ? "translate-x-[14px] md:translate-x-5.5" : "translate-x-0.5"
                  )}
                />
              </button>
              <Moon className={cn("transition-colors w-3.5 h-3.5 md:w-4 md:h-4", isDark ? "text-[#FFE8D6]" : "text-natural-mute")} />
            </div>
            <button 
              onClick={() => setIsProfileOpen(true)} 
              className="bg-white dark:bg-dark-card h-9 w-9 md:h-14 md:w-auto p-0 md:pl-5 md:pr-2.5 rounded-full md:rounded-[24px] shadow-sm border border-natural-line hover:border-natural-olive dark:border-white/5 dark:hover:border-white/15 transition-all flex items-center justify-center md:items-center gap-1.5 md:gap-3 shrink-0"
              title="Buka Profil"
            >
              <div className="text-right mr-1.5 hidden md:block">
                <p className="text-[9px] uppercase tracking-widest text-natural-mute font-bold">User Status</p>
                <p className="text-xs font-semibold text-natural-ink dark:text-dark-text italic font-serif">Aktif & Sinkron</p>
              </div>
              <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-natural-peach/40 flex items-center justify-center overflow-hidden border border-natural-line/60 shrink-0">
                {(profile?.photoURL || user.photoURL) ? (
                  <img 
                    src={profile?.photoURL || user.photoURL || undefined} 
                    alt="User" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <UserIcon className="text-natural-mute w-3.5 h-3.5 md:w-4 md:h-4" />
                )}
              </div>
            </button>
            <button onClick={logout} className="md:hidden h-9 w-9 flex items-center justify-center bg-white dark:bg-dark-card text-natural-mute hover:text-red-500 rounded-full shadow-sm border border-natural-line/80 dark:border-white/5 shrink-0" title="Keluar">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {children}
      </main>

      <MobileNav />

      {/* Profile OverLay Modal */}
      <AnimatePresence>
        {isProfileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 overflow-y-auto p-4 md:p-10 flex justify-center items-start"
          >
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="w-full max-w-5xl bg-natural-bg dark:bg-dark-bg-deep rounded-[40px] p-2 md:p-8 relative mt-6 md:mt-12"
            >
              <Profile user={user} onClose={() => setIsProfileOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
