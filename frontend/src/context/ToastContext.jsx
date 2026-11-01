import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0); // id tăng dần — không phụ thuộc Date.now() (tránh trùng khi gọi nhanh)
  const timeoutsRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const t = timeoutsRef.current.get(id);
    if (t) {
      clearTimeout(t);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (message, type = "success", duration = 3000) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, message, type }]);

      const timer = setTimeout(() => {
        removeToast(id);
        timeoutsRef.current.delete(id);
      }, duration);
      timeoutsRef.current.set(id, timer);
    },
    [removeToast]
  );

  // Dọn toàn bộ timer khi unmount → không setState sau khi component đã tắt
  useEffect(() => {
    const timers = timeoutsRef.current;
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  // Memoize value → consumer chỉ re-render khi addToast đổi (rất hiếm)
  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border shadow-xl transition-all animate-in fade-in slide-in-from-bottom-3 duration-200 ${
              toast.type === "success"
                ? "bg-zinc-900 border-emerald-500/30 text-emerald-400"
                : toast.type === "error"
                ? "bg-zinc-900 border-red-500/30 text-red-400"
                : "bg-zinc-900 border-blue-500/30 text-blue-400"
            }`}
          >
            <div className="flex items-center gap-2.5 text-xs font-semibold">
              {toast.type === "success" && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />}
              {toast.type === "error" && <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />}
              {toast.type === "info" && <Info className="w-4 h-4 shrink-0 text-blue-400" />}
              <span className="text-zinc-200">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-500 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);