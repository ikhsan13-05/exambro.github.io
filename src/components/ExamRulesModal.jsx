import {
  AlertTriangle,
  CheckCircle2,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { APP_CONFIG } from "../utils/config";

export default function ExamRulesModal({
  open,
  onAccept,
  schoolName = "Sekolah",
}) {
  if (!open) return null;
  const iconMap = {
    secure: <ShieldCheck className="h-5 w-5 text-indigo-600" />,
    warning: <AlertTriangle className="h-5 w-5 text-red-600" />,
    education: <GraduationCap className="h-5 w-5 text-emerald-600" />,
    online: <CheckCircle2 className="h-5 w-5 text-sky-600" />,
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-slate-950/70 p-0 sm:p-5 backdrop-blur-md sm:items-center">
      <div className="flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-[2rem]">
        {/* HEADER */}
        <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 px-5 py-6 text-white md:px-8 md:py-7">
          <div
            className="
    mb-4 flex h-14 w-14
    items-center justify-center
    rounded-3xl bg-white/20
    backdrop-blur
    md:h-16 md:w-16
  "
          >
            <ShieldCheck className="h-9 w-9" />
          </div>

          <h2 className="text-xl font-black md:text-3xl">
            Aturan Ujian Online
          </h2>

          <p className="mt-3 text-sm font-semibold leading-6 text-white/85">
            Bacalah aturan berikut sebelum memulai ujian di{" "}
            <span className="font-black">{schoolName}</span>.
          </p>
        </div>

        {/* CONTENT */}
        <div
          className="
    flex-1 space-y-3 overflow-y-auto
    p-4 md:space-y-4 md:p-8
  "
        >
          {APP_CONFIG.examRules.map((item, index) => (
            <div
              key={index}
              className="
  flex items-start gap-3 rounded-2xl
  border border-slate-100
  bg-slate-50 p-3.5
  md:gap-4 md:rounded-3xl md:p-4
"
            >
              <div
                className="
  flex h-10 w-10 shrink-0
  items-center justify-center
  rounded-2xl bg-white shadow-sm
  md:h-11 md:w-11
"
              >
                {iconMap[item.type] || (
                  <ShieldCheck className="h-5 w-5 text-indigo-600" />
                )}
              </div>

              <div>
                <h3 className="text-[13px] font-black text-slate-900 md:text-sm">
                  {item.title}
                </h3>

                <p
                  className="
    mt-1 text-[12px]
    font-semibold leading-5
    text-slate-500
    md:text-sm md:leading-6
  "
                >
                  {item.desc}
                </p>
              </div>
            </div>
          ))}

          {/* WARNING */}
          <div
            className="
    rounded-2xl border border-amber-100
    bg-amber-50 p-3.5
    md:rounded-3xl md:p-4
  "
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

              <div>
                <p className="text-sm font-black text-amber-700">Penting</p>

                <p className="mt-1 text-sm font-semibold leading-6 text-amber-700/90">
                  Jika jumlah pelanggaran melebihi batas yang ditentukan, sistem
                  akan otomatis mengunci sesi ujian siswa.
                </p>
              </div>
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="button"
            onClick={onAccept}
            className="
  mt-2 flex w-full items-center justify-center gap-2
  rounded-2xl bg-indigo-600
  px-5 py-3 text-sm font-black text-white
  shadow-xl shadow-indigo-200
  transition hover:bg-indigo-700
  md:py-3.5
"
          >
            <ShieldCheck className="h-5 w-5" />
            Saya Mengerti dan Mulai Ujian
          </button>
        </div>
      </div>
    </div>
  );
}
