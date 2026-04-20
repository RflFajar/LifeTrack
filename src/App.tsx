/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, Suspense, lazy } from 'react';
import { RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Context
import { useAuthContext } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layout
import { AppShell } from './components/layout/AppShell';

// Lazy Pages
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const ScheduleTracker = lazy(() => import('./pages/ScheduleTracker').then(m => ({ default: m.ScheduleTracker })));
const MoneyTracker = lazy(() => import('./pages/MoneyTracker').then(m => ({ default: m.MoneyTracker })));
const HealthTracker = lazy(() => import('./pages/HealthTracker').then(m => ({ default: m.HealthTracker })));
const SmartInsights = lazy(() => import('./pages/SmartInsights').then(m => ({ default: m.SmartInsights })));
const Onboarding = lazy(() => import('./pages/Onboarding').then(m => ({ default: m.Onboarding })));
const SocialHub = lazy(() => import('./pages/SocialHub').then(m => ({ default: m.SocialHub })));

const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    >
      <RefreshCw className="w-10 h-10 text-natural-olive" />
    </motion.div>
    <p className="mt-4 text-natural-mute font-medium font-serif italic">Memuat LifeTrack...</p>
  </div>
);

import { useProfile } from './hooks/useProfile';

export default function App() {
  const { user, loading: authLoading, login, logout } = useAuthContext();
  const { profile, loading: profileLoading } = useProfile(user?.uid);

  if (authLoading || (user && profileLoading)) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-natural-bg p-6 text-natural-ink font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-[32px] p-8 shadow-sm border border-natural-line text-center"
        >
          <div className="w-20 h-20 bg-natural-olive rounded-full flex items-center justify-center mx-auto mb-6 text-white font-serif italic text-3xl">
            L
          </div>
          <h1 className="text-3xl font-serif font-bold text-natural-ink mb-2 tracking-tight">LifeTrack Engine</h1>
          <p className="text-natural-mute mb-8 italic">Optimalkan hidupmu melalui data dan kecerdasan buatan.</p>
          <button 
            onClick={login}
            className="w-full flex items-center justify-center gap-3 bg-natural-olive text-white rounded-2xl p-4 font-semibold hover:opacity-90 transition-opacity font-serif italic"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
            Lanjutkan dengan Google
          </button>
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <ToastProvider>
        <Suspense fallback={<LoadingScreen />}>
          <Onboarding user={user} />
        </Suspense>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <BrowserRouter>
        <AppShell user={user} logout={logout}>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard user={user} />} />
              <Route path="/schedule" element={<ScheduleTracker user={user} />} />
              <Route path="/money" element={<MoneyTracker user={user} />} />
              <Route path="/health" element={<HealthTracker user={user} />} />
              <Route path="/insights" element={<SmartInsights user={user} />} />
              <Route path="/social" element={<SocialHub user={user} />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </AppShell>
      </BrowserRouter>
    </ToastProvider>
  );
}
