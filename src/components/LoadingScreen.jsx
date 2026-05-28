import { Loader2, ShieldCheck } from "lucide-react";
import { APP_CONFIG } from "../utils/config";

export default function LoadingScreen({
  text = "Memuat data...",
  subText = "Mohon tunggu sebentar",
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xl">
      <div className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 p-7 text-center shadow-2xl shadow-slate-900/20">
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-indigo-200/50 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-14 -left-14 h-36 w-36 rounded-full bg-sky-200/60 blur-2xl" />

        <div className="relative z-10">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-gradient-to-br from-indigo-400 to-sky-300 text-white shadow-2xl shadow-indigo-200">
            <img
              src={APP_CONFIG.logoUrl}
              alt={APP_CONFIG.schoolName}
              className="h-20 w-20 rounded-2xl p-2 object-contain"
            />
          </div>

          <div className="mx-auto mb-5 flex items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
          </div>

          <h2 className="text-lg font-black text-slate-900">{text}</h2>

          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            {subText}
          </p>

          <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-1/2 animate-[loadingBar_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-indigo-500 to-sky-500" />
          </div>
        </div>
      </div>
    </div>
  );
}