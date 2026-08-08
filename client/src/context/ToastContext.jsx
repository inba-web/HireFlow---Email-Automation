import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2Icon, AlertTriangleIcon, XCircleIcon, InfoIcon, XIcon } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg, duration) => addToast(msg, 'success', duration), [addToast]);
  const error = useCallback((msg, duration) => addToast(msg, 'error', duration), [addToast]);
  const warning = useCallback((msg, duration) => addToast(msg, 'warning', duration), [addToast]);
  const info = useCallback((msg, duration) => addToast(msg, 'info', duration), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl glass bg-black/80 backdrop-blur-xl border border-white/20 shadow-2xl text-white text-xs"
            >
              {t.type === 'success' && <CheckCircle2Icon className="size-4.5 text-emerald-400 shrink-0 mt-0.5" />}
              {t.type === 'error' && <XCircleIcon className="size-4.5 text-rose-400 shrink-0 mt-0.5" />}
              {t.type === 'warning' && <AlertTriangleIcon className="size-4.5 text-amber-400 shrink-0 mt-0.5" />}
              {t.type === 'info' && <InfoIcon className="size-4.5 text-blue-400 shrink-0 mt-0.5" />}

              <div className="flex-1 leading-relaxed text-gray-100 font-medium">
                {t.message}
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="text-gray-400 hover:text-white transition shrink-0 p-0.5"
              >
                <XIcon className="size-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
