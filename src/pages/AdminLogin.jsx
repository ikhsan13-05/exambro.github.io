import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  KeyRound,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { api } from "../services/api";
import PremiumCard from "../components/PremiumCard";
import { useToast } from "../components/ToastProvider";
import { APP_CONFIG } from "../utils/config";

export default function AdminLogin() {
  const navigate = useNavigate();
  const toast = useToast();

  const [adminPin, setAdminPin] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("adminSession");

    if (saved) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  async function handleLogin(e) {
    e.preventDefault();

    if (!adminPin.trim()) {
      toast.warning("PIN admin wajib diisi.");
      return;
    }

    setLoading(true);

    const res = await api.verifyAdmin({
      adminPin: adminPin.trim(),
    });

    setLoading(false);

    if (!res.success) {
      toast.error(res.message || "Login admin gagal.");
      return;
    }

    localStorage.setItem(
      "adminSession",
      JSON.stringify({
        isAdmin: true,
        adminPin: adminPin.trim(),
        loginAt: new Date().toISOString(),
      })
    );

    toast.success("Login admin berhasil.");
    navigate("/admin/dashboard", { replace: true });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F6F8FF] p-4">
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-sky-200/60 blur-3xl" />

      <div className="grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-sm font-black text-indigo-700 shadow-lg shadow-indigo-100/70 backdrop-blur">
            <Sparkles className="h-4 w-4" />
            {APP_CONFIG.appName} Admin
          </div>

          <h1 className="mt-6 max-w-xl text-5xl font-black leading-tight tracking-tight text-slate-950">
            Panel Admin Ujian Online
          </h1>

          <p className="mt-5 max-w-xl text-base font-medium leading-8 text-slate-600">
            Kelola setting ujian, kelas, monitoring peserta, sesi terkunci,
            dan keamanan ujian dari satu panel premium.
          </p>

          <div className="mt-8 grid max-w-xl grid-cols-3 gap-4">
            <InfoCard
              icon={<ShieldCheck className="h-7 w-7 text-indigo-600" />}
              title="Aman"
              desc="Akses memakai PIN"
            />
            <InfoCard
              icon={<LockKeyhole className="h-7 w-7 text-red-600" />}
              title="Kontrol"
              desc="Unlock sesi siswa"
            />
            <InfoCard
              icon={<KeyRound className="h-7 w-7 text-emerald-600" />}
              title="Token"
              desc="Kelola ujian"
            />
          </div>
        </section>

        <PremiumCard className="mx-auto w-full max-w-md overflow-hidden">
          <div className="bg-gradient-to-br from-slate-950 via-indigo-900 to-blue-700 px-6 py-7 text-white md:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white/20 shadow-xl backdrop-blur">
                <img
                  src={APP_CONFIG.logoUrl}
                  alt={APP_CONFIG.schoolName}
                  className="h-11 w-11 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-white/75">
                  Admin Area
                </p>
                <h2 className="mt-1 text-2xl font-black">
                  {APP_CONFIG.schoolShortName}
                </h2>
              </div>
            </div>

            <p className="mt-5 text-sm font-medium leading-6 text-white/85">
              Masukkan PIN admin/guru untuk mengakses panel pengelolaan ujian.
            </p>
          </div>

          <div className="px-6 py-6 md:px-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-black text-slate-700">
                  PIN Admin/Guru
                </label>

                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    type="password"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    placeholder="Masukkan PIN admin"
                    autoComplete="off"
                    className="
                      w-full rounded-2xl border border-slate-200 bg-white
                      py-3.5 pl-12 pr-4 text-sm font-bold text-slate-800
                      outline-none transition
                      placeholder:text-slate-400
                      focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100
                    "
                  />
                </div>
              </div>

              <div className="rounded-3xl bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
                  <p className="text-xs font-semibold leading-5 text-slate-500">
                    Halaman ini khusus guru/admin. Jangan membagikan PIN kepada
                    siswa.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="
                  flex w-full items-center justify-center gap-2 rounded-2xl
                  bg-indigo-600 py-3.5 text-sm font-black text-white
                  shadow-xl shadow-indigo-200 transition
                  hover:bg-indigo-700
                  disabled:cursor-not-allowed disabled:bg-slate-300
                  disabled:shadow-none
                "
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Memeriksa PIN...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5" />
                    Masuk Admin
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs font-semibold text-slate-400">
              {APP_CONFIG.footerText}
            </p>
          </div>
        </PremiumCard>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, desc }) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-xl shadow-slate-200/70 backdrop-blur">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
        {icon}
      </div>
      <p className="text-sm font-black text-slate-900">{title}</p>
      <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
        {desc}
      </p>
    </div>
  );
}