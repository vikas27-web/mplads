"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "info" | "success" | "warning" | "error";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastItem, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

const toastIcons = {
  info: <Info className="w-4 h-4 text-[#0080FF] shrink-0" />,
  success: <CheckCircle2 className="w-4 h-4 text-[#00875A] shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-[#B76E00] shrink-0" />,
  error: <AlertCircle className="w-4 h-4 text-[#DE350B] shrink-0" />,
};

const toastStyles = {
  info: "bg-white border-[#0080FF]/40 text-[#0F1724]",
  success: "bg-white border-[#00875A]/40 text-[#0F1724]",
  warning: "bg-white border-[#B76E00]/40 text-[#0F1724]",
  error: "bg-white border-[#DE350B]/40 text-[#0F1724]",
};

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={cn(
            "pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg transition-all transform translate-y-0",
            toastStyles[toast.type]
          )}
        >
          {toastIcons[toast.type]}
          <div className="flex-1 space-y-0.5 min-w-0">
            <h5 className="text-xs font-semibold text-[#0F1724] truncate">{toast.title}</h5>
            {toast.message && <p className="text-xs text-[#4A5568] leading-relaxed">{toast.message}</p>}
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-[#6B7A8E] hover:text-[#0F1724] p-0.5 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-[#0080FF]"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
