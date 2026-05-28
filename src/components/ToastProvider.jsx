import { createContext, useContext, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  X,
  XCircle,
} from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function removeToast(id) {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }

  function showToast({
    type = "info",
    title = "",
    message = "",
    duration = 3500,
  }) {
    const id = crypto.randomUUID();

    setToasts((prev) => [
      ...prev,
      {
        id,
        type,
        title,
        message,
      },
    ]);

    if (duration) {
      setTimeout(() => removeToast(id), duration);
    }

    return id;
  }

  const value = useMemo(
    () => ({
      success: (message, title = "Berhasil") =>
        showToast({ type: "success", title, message }),
      error: (message, title = "Gagal") =>
        showToast({ type: "error", title, message, duration: 4500 }),
      info: (message, title = "Informasi") =>
        showToast({ type: "info", title, message }),
      warning: (message, title = "Peringatan") =>
        showToast({ type: "warning", title, message, duration: 4500 }),
      loading: (message, title = "Memproses") =>
        showToast({ type: "loading", title, message, duration: 0 }),
      dismiss: removeToast,
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="fixed right-4 top-4 z-[99999] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-5 sm:top-5 sm:w-full">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  const config = {
    success: {
      icon: <CheckCircle2 className="h-6 w-6 text-emerald-600" />,
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    error: {
      icon: <XCircle className="h-6 w-6 text-red-600" />,
      bg: "bg-red-50",
      border: "border-red-100",
    },
    warning: {
      icon: <AlertCircle className="h-6 w-6 text-orange-600" />,
      bg: "bg-orange-50",
      border: "border-orange-100",
    },
    info: {
      icon: <Info className="h-6 w-6 text-indigo-600" />,
      bg: "bg-indigo-50",
      border: "border-indigo-100",
    },
    loading: {
      icon: <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />,
      bg: "bg-indigo-50",
      border: "border-indigo-100",
    },
  };

  const item = config[toast.type] || config.info;

  return (
    <div
      className={`
        animate-[toastIn_.25s_ease-out]
        overflow-hidden rounded-3xl border ${item.border}
        bg-white/95 p-4 shadow-2xl shadow-slate-300/60 backdrop-blur-xl
      `}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.bg}`}
        >
          {item.icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-slate-900">
            {toast.title}
          </p>

          {toast.message && (
            <p className="mt-1 text-sm font-semibold leading-5 text-slate-500">
              {toast.message}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-xl p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);

  if (!ctx) {
    throw new Error("useToast harus digunakan di dalam ToastProvider");
  }

  return ctx;
}