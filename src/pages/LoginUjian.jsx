import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  GraduationCap,
  Loader2,
  LockKeyhole,
  QrCode,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { api } from "../services/api";
import PremiumCard from "../components/PremiumCard";
import LoadingScreen from "../components/LoadingScreen";
import TokenInput from "../components/TokenInput";
import ClassDropdown from "../components/ClassDropdown";
import { useToast } from "../components/ToastProvider";
import { APP_CONFIG } from "../utils/config";
import { getOrCreateDeviceId } from "../utils/deviceId";

export default function LoginUjian() {
  const navigate = useNavigate();
  const toast = useToast();

  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
  const [token, setToken] = useState("");
  const [kelasList, setKelasList] = useState([]);

  const [isQrMode, setIsQrMode] = useState(false);
  const [qrInfo, setQrInfo] = useState({ token: "", kelas: "" });

  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingLogin, setLoadingLogin] = useState(false);

  const [recovering, setRecovering] = useState(false);

  const isValid = useMemo(() => {
    return nama.trim().length >= 3 && kelas && token.trim().length >= 4;
  }, [nama, kelas, token]);

  useEffect(() => {
    detectQrMode();
    loadKelas();
    checkRecoverySession();
  }, []);

  function detectQrMode() {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");
    const kelasFromUrl = params.get("kelas");

    if (tokenFromUrl && kelasFromUrl) {
      const cleanToken = tokenFromUrl.trim().toUpperCase();
      const cleanKelas = kelasFromUrl.trim();

      setToken(cleanToken);
      setKelas(cleanKelas);
      setQrInfo({ token: cleanToken, kelas: cleanKelas });
      setIsQrMode(true);
    }
  }

  async function loadKelas() {
    setLoadingPage(true);

    const res = await api.getKelas();

    if (res.success) {
      setKelasList(res.data || []);
    } else {
      toast.error(res.message || "Gagal memuat data kelas.");
    }

    setLoadingPage(false);
  }

  function resetQrMode() {
    setIsQrMode(false);
    setQrInfo({ token: "", kelas: "" });
    setToken("");
    setKelas("");

    window.history.replaceState({}, document.title, window.location.pathname);
    toast.info("QR Mode dinonaktifkan. Silakan pilih kelas dan token manual.");
  }

  function validateForm() {
    if (!nama.trim()) return "Nama lengkap wajib diisi.";
    if (nama.trim().length < 3) return "Nama lengkap minimal 3 karakter.";
    if (!kelas) return "Silakan pilih kelas terlebih dahulu.";
    if (!token.trim()) return "Token ujian wajib diisi.";
    if (token.trim().length < 4) return "Token ujian terlalu pendek.";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationMessage = validateForm();

    if (validationMessage) {
      toast.warning(validationMessage);
      return;
    }

    setLoadingLogin(true);

    const deviceId = getOrCreateDeviceId();

    const res = await api.validateLogin({
      nama: nama.trim(),
      kelas,
      token: token.trim().toUpperCase(),
      deviceId,
    });

    setLoadingLogin(false);

    if (!res.success) {
      if (res.multiDevice) {
        toast.error(res.message || "Sesi aktif di perangkat lain.");
        navigate("/invalid-session", { replace: true });
        return;
      }

      toast.error(res.message || "Login gagal. Periksa kembali token ujian.");
      return;
    }

    toast.success("Login berhasil. Masuk ke ruang ujian.");

    localStorage.setItem("examSession", JSON.stringify(res.data));
    navigate("/exam", { replace: true });
  }

  async function checkRecoverySession() {
    const saved = localStorage.getItem("examSession");

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);

      if (!parsed?.sessionId) return;

      setRecovering(true);

      const deviceId = getOrCreateDeviceId();

      const res = await api.resumeSession({
        sessionId: parsed.sessionId,
        deviceId,
      });

      setRecovering(false);

      if (!res.success) {
        localStorage.removeItem("examSession");

        if (res.multiDevice) {
          navigate("/invalid-session", { replace: true });
          return;
        }

        if (res.locked) {
          navigate("/locked", { replace: true });
          return;
        }

        return;
      }

      localStorage.setItem("examSession", JSON.stringify(res.data));
      toast.info("Sesi ujian sebelumnya ditemukan. Melanjutkan ujian.");
      navigate("/exam", { replace: true });
    } catch {
      setRecovering(false);
      localStorage.removeItem("examSession");
    }
  }

  {
    recovering && (
      <LoadingScreen
        text="Memulihkan sesi ujian..."
        subText="Mohon tunggu, sistem sedang mengecek sesi sebelumnya"
      />
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F6F8FF] px-4 py-6 md:px-6 md:py-8">
      {recovering && (
        <LoadingScreen
          text="Memulihkan sesi ujian..."
          subText="Mohon tunggu, sistem sedang mengecek sesi sebelumnya"
        />
      )}

      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-44 h-80 w-80 rounded-full bg-sky-200/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-100/60 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-48px)] max-w-6xl items-center justify-center">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="hidden lg:block">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-sm font-black text-indigo-700 shadow-lg shadow-indigo-100/70 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              {APP_CONFIG.appName} Secure Mode
            </div>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-white p-3 shadow-2xl shadow-slate-200/80">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm">
                  <ShieldCheck className="h-14 w-14" />
                </div>
              </div>

              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-indigo-600">
                  {APP_CONFIG.schoolShortName}
                </p>
                <h1 className="mt-1 text-4xl font-black leading-tight tracking-tight text-slate-950">
                  {APP_CONFIG.appName}
                </h1>
              </div>
            </div>

            <h2 className="mt-7 max-w-xl text-5xl font-black leading-tight tracking-tight text-slate-950">
              Ujian Online Lebih Aman dan Terkontrol
            </h2>

            <p className="mt-5 max-w-xl text-base font-medium leading-8 text-slate-600">
              {APP_CONFIG.appTagline}. Sistem akan mengaktifkan mode aman,
              mencatat sesi, serta memantau pelanggaran selama ujian
              berlangsung.
            </p>

            <div className="mt-4 inline-flex rounded-full bg-white/80 px-4 py-2 text-xs font-black text-slate-500 shadow-lg shadow-slate-200/60 backdrop-blur">
              Tahun Pelajaran {APP_CONFIG.academicYear}
            </div>

            <div className="mt-8 grid max-w-xl grid-cols-3 gap-4">
              <InfoCard
                icon={<ShieldCheck className="h-7 w-7 text-indigo-600" />}
                title="Secure"
                desc="Fullscreen dan anti-tab"
              />
              <InfoCard
                icon={<LockKeyhole className="h-7 w-7 text-rose-600" />}
                title="Token"
                desc="Akses sesuai kelas"
              />
              <InfoCard
                icon={<CheckCircle2 className="h-7 w-7 text-emerald-600" />}
                title="Log"
                desc="Aktivitas tercatat"
              />
            </div>
          </section>

          <PremiumCard className="mx-auto w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-500 px-6 py-7 text-white md:px-8">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-white/20 p-2 shadow-xl backdrop-blur">
                  <img
                    src={APP_CONFIG.logoUrl}
                    alt={APP_CONFIG.schoolName}
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-white/75">
                    {isQrMode ? "QR Access" : "Secure Login"}
                  </p>
                  <h2 className="mt-1 truncate text-xl font-black">
                    {APP_CONFIG.schoolName}
                  </h2>
                </div>
              </div>

              <p className="mt-5 text-sm font-medium leading-6 text-white/85">
                {isQrMode
                  ? "Token dan kelas otomatis terisi dari QR ujian."
                  : "Isi data dengan benar sebelum masuk ke ruang ujian."}
              </p>
            </div>

            <div className="px-6 py-6 md:px-8">
              <div className="mb-5 text-center">
                <h3 className="text-xl font-black text-slate-950">
                  Login Ujian
                </h3>
                <p className="mt-1 text-xs font-bold text-slate-400">
                  {APP_CONFIG.appName} • TP {APP_CONFIG.academicYear}
                </p>
              </div>

              {isQrMode && (
                <div className="mb-5 rounded-3xl border border-indigo-100 bg-indigo-50 p-4">
                  <div className="flex items-start gap-3">
                    <QrCode className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
                    <div className="flex-1">
                      <p className="text-sm font-black text-indigo-700">
                        QR Mode Aktif
                      </p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-indigo-600">
                        Kelas dan token dikunci sesuai QR yang discan.
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-indigo-700">
                          {qrInfo.kelas}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-indigo-700">
                          {qrInfo.token}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={resetQrMode}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-black text-indigo-700 shadow-sm transition hover:bg-indigo-100"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Gunakan Login Manual
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-black text-slate-700">
                    Nama Lengkap
                  </label>

                  <div className="relative">
                    <UserRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      placeholder="Contoh: Andi Saputra"
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

                <ClassDropdown
                  value={kelas}
                  onChange={setKelas}
                  options={kelasList}
                  disabled={isQrMode}
                />

                <TokenInput
                  value={token}
                  onChange={setToken}
                  disabled={isQrMode}
                />

                <div className="rounded-3xl bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
                    <p className="text-xs font-semibold leading-5 text-slate-500">
                      Pastikan nama lengkap sesuai. Setelah masuk, siswa wajib
                      tetap berada di halaman ujian sampai selesai.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingLogin || !isValid}
                  className="
                    flex w-full items-center justify-center gap-2 rounded-2xl
                    bg-indigo-600 py-3.5 text-sm font-black text-white
                    shadow-xl shadow-indigo-200 transition
                    hover:bg-indigo-700
                    disabled:cursor-not-allowed disabled:bg-slate-300
                    disabled:shadow-none
                  "
                >
                  {loadingLogin ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Memvalidasi Token...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-5 w-5" />
                      Mulai Ujian
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <Link
                  to="/admin/login"
                  className="
                    group flex items-center justify-center gap-2
                    rounded-2xl border border-slate-200
                    bg-white px-4 py-3
                    text-sm font-black text-slate-600
                    transition-all duration-200
                    hover:border-indigo-200
                    hover:bg-indigo-50
                    hover:text-indigo-700
                  "
                >
                  <ShieldCheck className="h-5 w-5 transition-transform group-hover:scale-110" />
                  Login Admin
                </Link>
              </div>

              <p className="mt-6 text-center text-xs font-semibold text-slate-400">
                {APP_CONFIG.footerText}
              </p>
            </div>
          </PremiumCard>
        </div>
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
