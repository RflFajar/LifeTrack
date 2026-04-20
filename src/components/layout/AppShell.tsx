import React from 'react';
import { motion } from 'motion/react';
import { 
  LogOut, 
  User as UserIcon,
  Sun,
  Moon
} from 'lucide-react';
import { User } from 'firebase/auth';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

interface AppShellProps {
  children: React.ReactNode;
  user: User;
  logout: () => void;
}

export const AppShell = ({ children, user, logout }: AppShellProps) => {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const path = location.pathname.substring(1) || 'dashboard';

  const getPageTitle = (p: string) => {
    switch (p) {
      case 'dashboard': return 'Overview';
      case 'schedule': return 'Jadwal Harian';
      case 'money': return 'Keuangan';
      case 'health': return 'Kesehatan & Nutrisi';
      case 'insights': return 'Intelligence Insights';
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
            <div className="bg-white dark:bg-dark-card p-2 rounded-2xl shadow-sm border border-natural-line hidden sm:flex items-center gap-2">
              <div className="text-right mr-2 hidden lg:block">
                <p className="text-[10px] uppercase tracking-widest text-natural-mute font-bold">User Status</p>
                <p className="text-xs font-medium text-natural-ink italic">Aktif & Sinkron</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-natural-peach flex items-center justify-center overflow-hidden border border-natural-line">
                {user.photoURL ? <img src={user.photoURL} alt="User" /> : <UserIcon className="text-natural-mute" />}
              </div>
            </div>
            <button onClick={logout} className="md:hidden p-3 bg-white text-slate-400 rounded-2xl shadow-sm border border-slate-100">
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </header>

        {children}
      </main>

      <MobileNav />
    </div>
  );
};
