import { Link } from "react-router-dom";
import { CheckCircle2, Home, ShieldCheck } from "lucide-react";
import { APP_CONFIG } from "../utils/config";

export default function FinishPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F6F8FF] p-4">
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-emerald-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-sky-200/60 blur-3xl" />

      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-2xl shadow-slate-300/70 backdrop-blur-xl">
        <div className="bg-gradient-to-br from-emerald-600 to-sky-500 px-7 py-8 text-center text-white">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-white/20 backdrop-blur">
            <CheckCircle2 className="h-11 w-11" />
          </div>

          <h1 className="text-2xl font-black">Ujian Selesai</h1>

          <p className="mt-2 text-sm font-semibold leading-6 text-white/85">
            Sesi ujian Anda telah selesai dan tercatat di sistem.
          </p>
        </div>

        <div className="p-7 text-center">
          <div className="mb-6 rounded-3xl bg-emerald-50 p-4">
            <ShieldCheck className="mx-auto mb-2 h-6 w-6 text-emerald-600" />
            <p className="text-sm font-bold text-emerald-700">
              Terima kasih telah mengikuti ujian dengan tertib.
            </p>
          </div>

          <Link
            to="/"
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-xl shadow-slate-300 transition hover:bg-slate-800"
          >
            <Home className="h-5 w-5" />
            Kembali ke Login
          </Link>

          <p className="mt-6 text-xs font-semibold text-slate-400">
            {APP_CONFIG.footerText}
          </p>
        </div>
      </div>
    </div>
  );
}