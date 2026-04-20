import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../utils/cn';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

export const Toast = ({ message, type = 'success', isVisible, onClose }: ToastProps) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-natural-olive" />,
    error: <AlertCircle className="w-5 h-5 text-natural-terracotta" />,
    info: <Info className="w-5 h-5 text-natural-mute" />
  };

  const colors = {
    success: 'bg-natural-peach border-natural-olive/20',
    error: 'bg-red-50 border-natural-terracotta/20',
    info: 'bg-natural-bg border-natural-line/50'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          className={cn(
            "fixed bottom-24 md:bottom-8 right-4 left-4 md:left-auto md:w-80 z-[100]",
            "flex items-center gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-md",
            colors[type]
          )}
        >
          <div className="flex-shrink-0">{icons[type]}</div>
          <p className="flex-1 text-sm font-serif italic text-natural-ink font-medium">{message}</p>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-black/5 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-natural-mute" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
