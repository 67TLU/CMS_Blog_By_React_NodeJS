import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext();

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle2,
    bar: "bg-emerald-500",
    border: "border-emerald-500/30",
    iconClass: "text-emerald-400",
  },
  error: {
    icon: AlertCircle,
    bar: "bg-red-500",
    border: "border-red-500/30",
    iconClass: "text-red-400",
  },
  info: {
    icon: Info,
    bar: "bg-blue-500",
    border: "border-blue-500/30",
    iconClass: "text-blue-400",
  },
  warning: {
    icon: AlertCircle,
    bar: "bg-amber-500",
    border: "border-amber-500/30",
    iconClass: "text-amber-400",
  },
};

function ToastItem({ toast, onRemove }) {
  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
  const Icon = config.icon;
  const [visible, setVisible] = useState(false);

  // Slide-in nhẹ sau mount
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onRemove(toast.id), 250);
  };

  return (
    <div
      className={`pointer-events-auto relative flex items-start gap-3 p-4 rounded-xl border shadow-xl
        bg-zinc-900 ${config.border} overflow-hidden
        transition-all duration-250 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${config.bar} animate-[shrink_var(--dur)_linear_forwards]`}
        style={{ "--dur": `${toast.duration}ms` }}
      />

      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconClass}`} />

      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold text-zinc-100 leading-snug">{toast.title}</p>
        )}
        <p className={`text-xs leading-relaxed ${toast.title ? "text-zinc-400 mt-0.5" : "text-zinc-200 font-semibold"}`}>
          {toast.message}
        </p>
      </div>

      <button
        onClick={handleClose}
        aria-label="Đóng thông báo"
        className="text-zinc-500 hover:text-zinc-200 transition-colors p-0.5 rounded shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);
  const timeoutsRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const t = timeoutsRef.current.get(id);
    if (t) { clearTimeout(t); timeoutsRef.current.delete(id); }
  }, []);

  /**
   * addToast(message, type?, duration?, title?)
   * hoặc addToast({ message, type, duration, title })
   */
  const addToast = useCallback(
    (messageOrOpts, type = "success", duration = 4000, title) => {
      const opts = typeof messageOrOpts === "object" && messageOrOpts !== null
        ? messageOrOpts
        : { message: messageOrOpts, type, duration, title };

      const id = ++idRef.current;
      const finalDuration = opts.duration ?? 4000;

      setToasts((prev) => {
        // Giới hạn tối đa 5 toast hiện tại
        const next = [...prev, { id, message: opts.message, type: opts.type ?? "success", duration: finalDuration, title: opts.title }];
        return next.length > 5 ? next.slice(next.length - 5) : next;
      });

      const timer = setTimeout(() => {
        removeToast(id);
        timeoutsRef.current.delete(id);
      }, finalDuration + 300); // +300 để chờ slide-out animation
      timeoutsRef.current.set(id, timer);
    },
    [removeToast],
  );

  useEffect(() => {
    const timers = timeoutsRef.current;
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container — bottom-right desktop, bottom-center mobile */}
      <div
        role="region"
        aria-live="polite"
        aria-label="Thông báo"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm pointer-events-none"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);