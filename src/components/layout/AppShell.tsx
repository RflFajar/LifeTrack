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
    <div className="min-h-screen bg-natural-bg pb-20 md:pb-0 md:pl-20 text-natural-ink font-sans transition-colors duration-300">
      <Sidebar logout={logout} />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-4 md:p-10">
        <header className="flex items-center justify-between mb-8 border-b border-natural-line pb-6">
          <div>
            <h2 className="text-[10px] font-bold text-natural-mute uppercase tracking-widest mb-1 font-sans font-black">
              {path === 'dashboard' ? 'Status' : 'LifeTrack'}
            </h2>
            <h1 className="text-3xl font-serif font-bold text-natural-ink italic">
              {getPageTitle(path)}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className="p-3 bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-natural-line text-natural-mute hover:text-natural-terracotta transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5 text-natural-peach" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setIsProfileOpen(true)} 
              className="bg-white dark:bg-dark-card p-2 rounded-2xl shadow-sm border border-natural-line hover:border-natural-olive transition-all flex items-center gap-2"
              title="Buka Profil"
            >
              <div className="text-right mr-2 hidden sm:block">
                <p className="text-[10px] uppercase tracking-widest text-natural-mute font-bold">User Status</p>
                <p className="text-xs font-medium text-natural-ink dark:text-dark-text italic">Aktif & Sinkron</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-natural-peach flex items-center justify-center overflow-hidden border border-natural-line shrink-0">
                {(profile?.photoURL || user.photoURL) ? (
                  <img 
                    src={profile?.photoURL || user.photoURL || undefined} 
                    alt="User" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer" 
                  />
                ) : (
                  <UserIcon className="text-natural-mute" />
                )}
              </div>
            </button>
            <button onClick={logout} className="md:hidden p-3 bg-white text-slate-400 rounded-2xl shadow-sm border border-slate-100">
              <LogOut className="w-6 h-6" />
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
