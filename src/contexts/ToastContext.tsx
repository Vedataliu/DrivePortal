"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
};

type ToastContextType = {
  showToast: (toast: Omit<ToastItem, "id">) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_TIMEOUT_MS = 3000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastItem, "id">) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { ...toast, id }]);
    window.setTimeout(() => dismissToast(id), TOAST_TIMEOUT_MS);
  }, [dismissToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  const stylesByType: Record<ToastType, { ring: string; iconClass: string; Icon: typeof CheckCircle2 }> = {
    success: { ring: "ring-emerald-500/30", iconClass: "text-emerald-400", Icon: CheckCircle2 },
    error: { ring: "ring-red-500/30", iconClass: "text-red-400", Icon: AlertCircle },
    info: { ring: "ring-blue-500/30", iconClass: "text-blue-400", Icon: Info },
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[120] w-full max-w-sm space-y-2.5 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const style = stylesByType[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -8, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.99 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className={`pointer-events-auto rounded-xl border border-border/70 bg-background/95 backdrop-blur-md p-3.5 shadow-lg ring-1 ${style.ring}`}
              >
                <div className="flex items-start gap-3">
                  <style.Icon className={`w-5 h-5 mt-0.5 ${style.iconClass}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{toast.title}</p>
                    {toast.description && (
                      <p className="text-xs text-muted-foreground mt-1">{toast.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => dismissToast(toast.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Dismiss notification"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
