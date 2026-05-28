import { AlertTriangle } from "lucide-react";

export default function ViolationModal({
  open,
  count,
  max,
  message,
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>

        <h2 className="text-center text-xl font-black text-slate-900">
          Peringatan Pelanggaran
        </h2>

        <p className="mt-3 text-center text-sm leading-6 text-slate-600">
          {message || "Terdeteksi aktivitas yang tidak diperbolehkan."}
        </p>

        <div className="mt-5 rounded-2xl bg-red-50 p-4 text-center">
          <p className="text-sm font-semibold text-red-700">
            Pelanggaran {count} dari {max}
          </p>
        </div>

        <button
          onClick={onClose}
          className="
            mt-6 w-full rounded-2xl bg-slate-900 py-3
            text-sm font-bold text-white transition hover:bg-slate-800
          "
        >
          Saya Mengerti
        </button>
      </div>
    </div>
  );
}