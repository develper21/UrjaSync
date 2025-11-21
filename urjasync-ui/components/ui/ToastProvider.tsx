'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
}

export interface ToastInternal extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  addToast: (toast: ToastOptions) => string;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastInternal[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, description, variant = 'info', durationMs = 4000 }: ToastOptions) => {
      const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `toast-${Date.now()}`;
      const toast: ToastInternal = { id, title, description, variant, durationMs };
      setToasts((prev) => [...prev, toast]);
      if (durationMs > 0) {
        setTimeout(() => removeToast(id), durationMs);
      }
      return id;
    },
    [removeToast],
  );

  const value = useMemo(() => ({ addToast, removeToast }), [addToast, removeToast]);

  const variantStyles: Record<ToastVariant, string> = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-rose-50 border-rose-200 text-rose-800',
    info: 'bg-slate-50 border-slate-200 text-slate-800',
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`min-w-[260px] rounded-xl border px-4 py-3 shadow-lg transition ${variantStyles[toast.variant ?? 'info']}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description && <p className="mt-1 text-xs opacity-80">{toast.description}</p>}
              </div>
              <button
                type="button"
                className="text-xs font-semibold opacity-60 hover:opacity-100"
                onClick={() => removeToast(toast.id)}
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return ctx;
};
