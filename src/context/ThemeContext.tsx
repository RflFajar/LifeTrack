import React, { createContext, useContext, useEffect, useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { useAuthContext } from './AuthContext';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthContext();
  const { profile, saveProfile } = useProfile(user?.uid);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [hasSynced, setHasSynced] = useState(false);

  useEffect(() => {
    // Sync with profile theme ONCE when it loads
    if (profile?.theme && !hasSynced) {
      setIsDark(profile.theme === 'dark');
      setHasSynced(true);
    }
  }, [profile?.theme, hasSynced]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    
    // We don't want the profile sync to revert this change
    setHasSynced(true);

    if (user && profile) {
      saveProfile({
        ...profile,
        theme: newMode ? 'dark' : 'light'
      } as any);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
