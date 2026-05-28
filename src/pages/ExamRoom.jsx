import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Expand,
  GraduationCap,
  ShieldCheck,
  UserRound,
  Wifi,
  WifiOff,
} from "lucide-react";
import { api } from "../services/api";
import ViolationModal from "../components/ViolationModal";
import { useConfirm } from "../components/ConfirmProvider";
import { useToast } from "../components/ToastProvider";
import ExamRulesModal from "../components/ExamRulesModal";
import { enterFullscreen, isFullscreen } from "../utils/fullscreen";
import { blockUnsafeKeys, preventDefaultEvent } from "../utils/securityGuard";
import { formatTime } from "../utils/timeHelper";
import { APP_CONFIG } from "../utils/config";

function calculateRemainingSeconds(loginAt, durasiMenit) {
  const durationSeconds = Number(durasiMenit || 0) * 60;

  if (!loginAt) return durationSeconds;

  const startTime = new Date(loginAt).getTime();

  if (Number.isNaN(startTime)) return durationSeconds;

  const endTime = startTime + durationSeconds * 1000;
  const now = Date.now();

  return Math.max(0, Math.floor((endTime - now) / 1000));
}

export default function ExamRoom() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const toast = useToast();

  const [session, setSession] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [online, setOnline] = useState(navigator.onLine);

  const [violationOpen, setViolationOpen] = useState(false);
  const [violationMessage, setViolationMessage] = useState("");
  const [violationCount, setViolationCount] = useState(0);
  const [maxViolation, setMaxViolation] = useState(3);

  const [timeWarningOpen, setTimeWarningOpen] = useState(false);
  const [timeExpiredOpen, setTimeExpiredOpen] = useState(false);

  const sessionRef = useRef(null);
  const recordingRef = useRef(false);
  const finishingRef = useRef(false);
  const allowLeaveRef = useRef(false);
  const lastViolationAtRef = useRef(0);
  const mountedRef = useRef(true);
  const interruptionCheckedRef = useRef(false);
  const oneMinuteWarnedRef = useRef(false);
  const heartbeatErrorRef = useRef(false);

  const [rulesOpen, setRulesOpen] = useState(false);
  const rulesAcceptedRef = useRef(false);

  const isFiveMinutesLeft = timeLeft > 0 && timeLeft <= 300;

  const saveSessionLocal = useCallback((data) => {
    localStorage.setItem("examSession", JSON.stringify(data));
  }, []);

  const removeSessionLocal = useCallback(() => {
    localStorage.removeItem("examSession");
  }, []);

  const getInterruptedKey = useCallback((sessionId) => {
    return `examInterrupted_${sessionId}`;
  }, []);

  const forceFullscreen = useCallback(() => {
    try {
      if (!isFullscreen()) {
        enterFullscreen();
      }
    } catch (error) {
      console.warn("Fullscreen gagal:", error);
    }
  }, []);

  function handleAcceptRules() {
    rulesAcceptedRef.current = true;
    setRulesOpen(false);

    setTimeout(() => {
      forceFullscreen();
    }, 300);
  }

  const handleFinish = useCallback(async () => {
    const activeSession = sessionRef.current;

    if (!activeSession || finishingRef.current) return;

    finishingRef.current = true;
    allowLeaveRef.current = true;

    localStorage.removeItem(getInterruptedKey(activeSession.sessionId));

    try {
      await api.finishExam({
        sessionId: activeSession.sessionId,
      });
    } catch (error) {
      console.warn("Gagal menyelesaikan ujian:", error);
    }

    removeSessionLocal();
    navigate("/finish", { replace: true });
  }, [navigate, removeSessionLocal, getInterruptedKey]);

  const handleTimeExpired = useCallback(async () => {
    if (finishingRef.current) return;

    setTimeExpiredOpen(true);

    setTimeout(() => {
      handleFinish();
    }, 1200);
  }, [handleFinish]);

  const handleConfirmFinish = useCallback(async () => {
    const yakin = await confirm({
      type: "warning",
      title: "Selesaikan Ujian?",
      message:
        "Pastikan jawaban Google Form sudah dikirim. Setelah menekan selesai, sesi ujian akan ditutup.",
      confirmText: "Ya, Selesai",
      cancelText: "Batal",
    });

    if (!yakin) return;

    handleFinish();
  }, [confirm, handleFinish]);

  const handleViolation = useCallback(
    async (jenis, detail, options = {}) => {
      if (!rulesAcceptedRef.current) return;

      const activeSession = sessionRef.current;

      if (!activeSession) return;
      if (recordingRef.current) return;
      if (finishingRef.current) return;

      const now = Date.now();

      if (!options.force && now - lastViolationAtRef.current < 1200) return;

      lastViolationAtRef.current = now;
      recordingRef.current = true;

      try {
        const res = await api.recordViolation({
          sessionId: activeSession.sessionId,
          jenis,
          detail,
        });

        if (!mountedRef.current) return;
        if (!res.success) return;

        const count = Number(res.data?.jumlahPelanggaran || 0);
        const max = Number(
          res.data?.maxPelanggaran || activeSession.maxPelanggaran || 3,
        );

        const updatedSession = {
          ...activeSession,
          jumlahPelanggaran: count,
          maxPelanggaran: max,
        };

        sessionRef.current = updatedSession;
        saveSessionLocal(updatedSession);

        setSession(updatedSession);
        setViolationCount(count);
        setMaxViolation(max);
        setViolationMessage(detail);
        setViolationOpen(true);

        if (res.data?.locked) {
          allowLeaveRef.current = true;
          localStorage.removeItem(getInterruptedKey(activeSession.sessionId));
          removeSessionLocal();
          navigate("/locked", { replace: true });
        }
      } catch (error) {
        console.warn("Gagal mencatat pelanggaran:", error);
      } finally {
        recordingRef.current = false;
      }
    },
    [navigate, removeSessionLocal, saveSessionLocal, getInterruptedKey],
  );

  const sendHeartbeat = useCallback(
    async ({ silent = true } = {}) => {
      const activeSession = sessionRef.current;

      if (!activeSession?.sessionId || !activeSession?.deviceId) return;
      if (finishingRef.current) return;
      if (heartbeatErrorRef.current) return;

      try {
        const res = await api.heartbeatSession({
          sessionId: activeSession.sessionId,
          deviceId: activeSession.deviceId,
        });

        if (!res.success) {
          heartbeatErrorRef.current = true;
          allowLeaveRef.current = true;

          toast.error(
            res.message ||
              "Sesi ujian tidak valid atau digunakan di perangkat lain.",
          );

          localStorage.removeItem(getInterruptedKey(activeSession.sessionId));
          removeSessionLocal();

          setTimeout(() => {
            navigate("/invalid-session", { replace: true });
          }, 1200);

          return;
        }

        if (!silent) {
          toast.success("Koneksi sesi berhasil diperbarui.");
        }
      } catch (error) {
        console.warn("Heartbeat gagal:", error);
      }
    },
    [navigate, removeSessionLocal, getInterruptedKey, toast],
  );

  useEffect(() => {
    mountedRef.current = true;

    const saved = localStorage.getItem("examSession");

    if (!saved) {
      navigate("/", { replace: true });
      return;
    }

    try {
      const parsed = JSON.parse(saved);

      const fixedSession = {
        ...parsed,
        loginAt: parsed.loginAt || new Date().toISOString(),
        durasiMenit: Number(parsed.durasiMenit || 60),
      };

      sessionRef.current = fixedSession;
      setSession(fixedSession);
      saveSessionLocal(fixedSession);

      const remaining = calculateRemainingSeconds(
        fixedSession.loginAt,
        fixedSession.durasiMenit,
      );

      setTimeLeft(remaining);
      setViolationCount(Number(fixedSession.jumlahPelanggaran || 0));
      setMaxViolation(Number(fixedSession.maxPelanggaran || 3));

      if (remaining <= 0) {
        setTimeout(() => {
          handleFinish();
        }, 500);
        return;
      }

      if (remaining <= 60 && remaining > 0) {
        oneMinuteWarnedRef.current = true;
        setTimeout(() => {
          setTimeWarningOpen(true);
        }, 800);
      }

      setRulesOpen(true);
    } catch {
      removeSessionLocal();
      navigate("/", { replace: true });
    }

    return () => {
      mountedRef.current = false;
    };
  }, [
    forceFullscreen,
    navigate,
    removeSessionLocal,
    saveSessionLocal,
    handleFinish,
  ]);

  useEffect(() => {
    if (!session) return;

    sendHeartbeat({ silent: true });

    const interval = setInterval(() => {
      sendHeartbeat({ silent: true });
    }, 15000);

    return () => clearInterval(interval);
  }, [session, sendHeartbeat]);

  useEffect(() => {
    if (!session) return;
    if (interruptionCheckedRef.current) return;

    interruptionCheckedRef.current = true;

    const key = getInterruptedKey(session.sessionId);
    const interrupted = localStorage.getItem(key);

    if (interrupted) {
      localStorage.removeItem(key);

      setTimeout(() => {
        handleViolation(
          "REFRESH_ATAU_TUTUP_TAB",
          "Siswa terdeteksi melakukan refresh, menutup tab, atau membuka ulang halaman ujian.",
          { force: true },
        );
      }, 800);
    }
  }, [session, handleViolation, getInterruptedKey]);

  useEffect(() => {
    if (!session) return;

    const timer = setInterval(() => {
      const activeSession = sessionRef.current;

      if (!activeSession) return;

      const remaining = calculateRemainingSeconds(
        activeSession.loginAt,
        activeSession.durasiMenit,
      );

      setTimeLeft(remaining);

      if (remaining <= 60 && remaining > 0 && !oneMinuteWarnedRef.current) {
        oneMinuteWarnedRef.current = true;
        setTimeWarningOpen(true);
      }

      if (remaining <= 0) {
        clearInterval(timer);
        handleTimeExpired();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [session, handleFinish]);

  useEffect(() => {
    if (!session) return;

    const onVisibilityChange = () => {
      if (document.hidden) {
        handleViolation(
          "PINDAH_TAB",
          "Siswa terdeteksi berpindah tab atau membuka aplikasi lain.",
        );
      } else {
        sendHeartbeat({ silent: true });
      }
    };

    const onFocus = () => {
      sendHeartbeat({ silent: true });
    };

    const onFullscreenChange = () => {
      if (!isFullscreen()) {
        handleViolation(
          "KELUAR_FULLSCREEN",
          "Siswa keluar dari mode fullscreen.",
        );
      }
    };

    const onKeyDown = (e) => {
      const blocked = blockUnsafeKeys(e);

      if (blocked) {
        handleViolation(
          "SHORTCUT_DILARANG",
          "Siswa menekan shortcut yang dilarang.",
        );
      }

      if (e.key === "Escape") {
        handleViolation("ESCAPE_KEY", "Siswa menekan tombol Escape.");
      }
    };

    const onBeforeUnload = (e) => {
      const activeSession = sessionRef.current;

      if (!activeSession || allowLeaveRef.current || !rulesAcceptedRef.current)
        return;

      localStorage.setItem(
        getInterruptedKey(activeSession.sessionId),
        JSON.stringify({
          sessionId: activeSession.sessionId,
          waktu: new Date().toISOString(),
        }),
      );

      e.preventDefault();
      e.returnValue = "Ujian sedang berlangsung. Yakin ingin keluar?";
      return e.returnValue;
    };

    const onOnline = () => {
      setOnline(true);
      sendHeartbeat({ silent: true });
    };

    const onOffline = () => {
      setOnline(false);
      handleViolation(
        "KONEKSI_TERPUTUS",
        "Koneksi internet siswa terputus saat ujian.",
      );
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    window.addEventListener("contextmenu", preventDefaultEvent);
    window.addEventListener("copy", preventDefaultEvent);
    window.addEventListener("cut", preventDefaultEvent);
    window.addEventListener("paste", preventDefaultEvent);
    window.addEventListener("dragstart", preventDefaultEvent);
    window.addEventListener("selectstart", preventDefaultEvent);

    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);

      window.removeEventListener("contextmenu", preventDefaultEvent);
      window.removeEventListener("copy", preventDefaultEvent);
      window.removeEventListener("cut", preventDefaultEvent);
      window.removeEventListener("paste", preventDefaultEvent);
      window.removeEventListener("dragstart", preventDefaultEvent);
      window.removeEventListener("selectstart", preventDefaultEvent);

      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        onFullscreenChange,
      );
    };
  }, [session, handleViolation, getInterruptedKey, sendHeartbeat]);

  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      if (
        rulesAcceptedRef.current &&
        !isFullscreen() &&
        !violationOpen &&
        !finishingRef.current
      ) {
        handleViolation(
          "FULLSCREEN_TIDAK_AKTIF",
          "Mode fullscreen tidak aktif saat ujian berlangsung.",
        );
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [session, violationOpen, handleViolation]);

  if (!session) return null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#EEF3FF] no-select">
      <header className="relative z-20 border-b border-white/70 bg-white/85 px-3 py-3 shadow-xl shadow-slate-200/60 backdrop-blur-xl md:px-5">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-50/70 via-white/60 to-sky-50/70" />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white shadow-xl shadow-indigo-200">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div>
                  <h1 className="truncate text-base font-black text-slate-950 md:text-lg">
                    {session.namaUjian}
                  </h1>

                  <p className="text-sm font-black text-indigo-600">
                    Mata Pelajaran: {session.mataPelajaran || "-"}
                  </p>
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700">
                  Secure Mode
                </span>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <UserRound className="h-3.5 w-3.5" />
                  {session.nama}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {session.kelas}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
            <StatusPill
              icon={
                online ? (
                  <Wifi className="h-4 w-4" />
                ) : (
                  <WifiOff className="h-4 w-4" />
                )
              }
              label={online ? "Online" : "Offline"}
              className={
                online
                  ? "bg-sky-50 text-sky-700 ring-sky-100"
                  : "bg-red-50 text-red-700 ring-red-100"
              }
            />

            <button
              type="button"
              onClick={forceFullscreen}
              className="
                flex items-center justify-center gap-2 rounded-2xl
                bg-white px-3 py-2 text-xs font-black text-slate-700
                ring-1 ring-slate-200 transition hover:bg-slate-50
              "
            >
              <Expand className="h-4 w-4" />
              Fullscreen
            </button>

            <div
              className={`
                flex items-center justify-center gap-2 rounded-2xl px-3 py-2 text-xs font-black ring-1
                ${
                  isFiveMinutesLeft
                    ? "animate-pulse bg-red-600 text-white ring-red-200 shadow-xl shadow-red-100"
                    : "bg-indigo-600 text-white ring-indigo-200 shadow-xl shadow-indigo-100"
                }
              `}
            >
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)}
            </div>

            <div className="flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-3 py-2 text-xs font-black text-red-700 ring-1 ring-red-100">
              <AlertTriangle className="h-4 w-4" />
              {violationCount}/{maxViolation}
            </div>

            <button
              onClick={handleConfirmFinish}
              className="
                col-span-2 rounded-2xl bg-slate-950 px-5 py-2.5
                text-xs font-black text-white shadow-xl shadow-slate-300
                transition hover:bg-slate-800 sm:col-span-1
              "
            >
              Selesai
            </button>
          </div>
        </div>
      </header>

      {!isFullscreen() && (
        <div className="z-10 border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-xs font-black text-amber-700">
          Mode fullscreen belum aktif. Klik tombol Fullscreen untuk melanjutkan
          ujian dengan aman.
        </div>
      )}

      <main className="relative flex-1 overflow-hidden p-2 md:p-4">
        <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />

        <div className="relative h-full overflow-hidden rounded-[1.7rem] border border-white/80 bg-white shadow-2xl shadow-slate-300/70">
          <div className="flex items-center justify-between border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400">
                  Jawaban tetap dikirim melalui Google Form
                </p>
              </div>
            </div>

            <div className="hidden rounded-full bg-slate-50 px-3 py-1 text-[11px] font-black text-slate-500 md:block">
              Jangan keluar dari halaman ini
            </div>
          </div>

          <iframe
            src={session.formUrl}
            title="Google Form Ujian"
            className="h-[calc(100%-58px)] w-full border-0 bg-white"
            allow="fullscreen"
          />
        </div>
      </main>

      <ViolationModal
        open={violationOpen}
        count={violationCount}
        max={maxViolation}
        message={violationMessage}
        onFullscreen={() => {
          setViolationOpen(false);
          setTimeout(forceFullscreen, 300);
        }}
        onClose={() => {
          setViolationOpen(false);
          setTimeout(forceFullscreen, 300);
        }}
      />

      <ExamRulesModal
        open={rulesOpen}
        onAccept={handleAcceptRules}
        schoolName={APP_CONFIG.schoolName}
      />

      {timeWarningOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white text-center shadow-2xl">
            <div className="bg-gradient-to-br from-red-600 to-orange-500 px-6 py-7 text-white">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/20 backdrop-blur">
                <AlertTriangle className="h-8 w-8" />
              </div>

              <h2 className="text-xl font-black">Waktu Hampir Habis</h2>
              <p className="mt-2 text-sm font-semibold text-white/85">
                Sisa waktu ujian kurang dari 1 menit.
              </p>
            </div>

            <div className="p-6">
              <p className="text-sm font-semibold leading-6 text-slate-500">
                Pastikan jawaban Google Form sudah dikirim sebelum waktu habis.
              </p>

              <button
                type="button"
                onClick={() => {
                  setTimeWarningOpen(false);
                  setTimeout(forceFullscreen, 300);
                }}
                className="mt-6 w-full rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-xl shadow-red-100 hover:bg-red-700"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {timeExpiredOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white text-center shadow-2xl">
            <div className="bg-gradient-to-br from-red-600 to-orange-500 px-6 py-8 text-white">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-white/20">
                <AlertTriangle className="h-10 w-10" />
              </div>

              <h2 className="text-2xl font-black">Waktu Ujian Habis</h2>

              <p className="mt-2 text-sm font-semibold text-white/85">
                Sesi ujian sedang ditutup otomatis.
              </p>
            </div>

            <div className="p-6">
              <p className="text-sm font-semibold leading-6 text-slate-500">
                Anda akan diarahkan ke halaman selesai. Jawaban hanya dianggap
                masuk jika sudah dikirim melalui Google Form.
              </p>

              <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-1/2 animate-[loadingBar_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-red-500 to-orange-500" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusPill({ icon, label, className = "" }) {
  return (
    <div
      className={`
        flex items-center justify-center gap-2 rounded-2xl px-3 py-2
        text-xs font-black ring-1 ${className}
      `}
    >
      {icon}
      {label}
    </div>
  );
}
