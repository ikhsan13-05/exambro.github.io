import { createContext, useContext, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Trash2,
  X,
} from "lucide-react";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [confirmState, setConfirmState] = useState(null);

  function closeConfirm() {
    setConfirmState(null);
  }

  function confirm(options = {}) {
    return new Promise((resolve) => {
      setConfirmState({
        title: options.title || "Konfirmasi",
        message: options.message || "Apakah Anda yakin ingin melanjutkan?",
        confirmText: options.confirmText || "Ya, Lanjutkan",
        cancelText: options.cancelText || "Batal",
        type: options.type || "warning",
        resolve,
      });
    });
  }

  function handleCancel() {
    confirmState?.resolve(false);
    closeConfirm();
  }

  function handleConfirm() {
    confirmState?.resolve(true);
    closeConfirm();
  }

  const value = useMemo(
    () => ({
      confirm,
    }),
    []
  );

  return (
    <ConfirmContext.Provider value={value}>
      {children}

      {confirmState && (
        <ConfirmModal
          {...confirmState}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
        />
      )}
    </ConfirmContext.Provider>
  );
}

function ConfirmModal({
  title,
  message,
  confirmText,
  cancelText,
  type,
  onCancel,
  onConfirm,
}) {
  const config = {
    danger: {
      icon: <Trash2 className="h-8 w-8 text-red-600" />,
      bg: "bg-red-50",
      button: "bg-red-600 hover:bg-red-700 shadow-red-100",
    },
    warning: {
      icon: <AlertTriangle className="h-8 w-8 text-orange-600" />,
      bg: "bg-orange-50",
      button: "bg-orange-500 hover:bg-orange-600 shadow-orange-100",
    },
    success: {
      icon: <CheckCircle2 className="h-8 w-8 text-emerald-600" />,
      bg: "bg-emerald-50",
      button: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100",
    },
    info: {
      icon: <HelpCircle className="h-8 w-8 text-indigo-600" />,
      bg: "bg-indigo-50",
      button: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100",
    },
  };

  const item = config[type] || config.warning;

  return (
    <div className="fixed inset-0 z-[99998] flex items-end justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:items-center sm:p-5">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="relative px-6 py-6">
          <button
            type="button"
            onClick={onCancel}
            className="absolute right-4 top-4 rounded-2xl bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className={`mb-5 flex h-20 w-20 items-center justify-center rounded-[1.7rem] ${item.bg}`}
          >
            {item.icon}
          </div>

          <h2 className="text-2xl font-black text-slate-950">{title}</h2>

          <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
            {message}
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onCancel}
              className="
                rounded-2xl bg-slate-100 px-5 py-3
                text-sm font-black text-slate-700
                transition hover:bg-slate-200
              "
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className={`
                rounded-2xl px-5 py-3 text-sm font-black text-white
                shadow-xl transition
                ${item.button}
              `}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);

  if (!ctx) {
    throw new Error("useConfirm harus digunakan di dalam ConfirmProvider");
  }

  return ctx.confirm;
}