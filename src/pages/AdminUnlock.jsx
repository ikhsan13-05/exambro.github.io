import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  LogOut,
  RefreshCw,
  ShieldCheck,
  UnlockKeyhole,
  UserRound,
} from "lucide-react";
import { api } from "../services/api";
import PremiumCard from "../components/PremiumCard";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../components/ToastProvider";

export default function AdminUnlock() {
  const savedAdmin = JSON.parse(localStorage.getItem("adminSession") || "{}");

  const [adminPin] = useState(savedAdmin.adminPin || "");
  const [lockedList, setLockedList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [unlockingId, setUnlockingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const toast = useToast();

  async function loadLockedSessions() {
    if (!adminPin) {
      toast.error("Session admin tidak ditemukan. Silakan login ulang.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const res = await api.getLockedSessions({
      adminPin,
    });

    setLoading(false);

    if (!res.success) {
      toast.error(res.message || "Gagal mengambil data siswa terkunci.");
      return;
    }

    setLockedList(res.data || []);
  }

  async function handleUnlock(sessionId, nama) {
    setUnlockingId(sessionId);
    setError("");
    setSuccess("");

    const res = await api.unlockSession({
      adminPin,
      sessionId,
    });

    setUnlockingId("");

    if (!res.success) {
      toast.error(res.message || "Gagal membuka kunci siswa.");
      return;
    }

    setLockedList((prev) =>
      prev.filter((item) => item.sessionId !== sessionId),
    );

    toast.success(`Kunci ujian ${nama} berhasil dibuka.`);
  }

  async function handleResetDevice(sessionId, nama) {
    const yakin = await confirm({
      type: "warning",
      title: "Reset Device Siswa?",
      message: `Device ID ${nama} akan dikosongkan agar dapat login dari perangkat baru.`,
      confirmText: "Ya, Reset",
      cancelText: "Batal",
    });

    if (!yakin) return;

    const res = await api.resetSessionDevice({
      adminPin,
      sessionId,
    });

    if (!res.success) {
      toast.error(res.message || "Gagal reset device siswa.");
      return;
    }

    toast.success(res.message || "Device siswa berhasil direset.");
    await loadLockedSessions();
  }

  function handleLogout() {
    localStorage.removeItem("adminSession");
    window.location.href = "/admin/login";
  }

  useEffect(() => {
    loadLockedSessions();
  }, []);

  return (
    <AdminLayout
      title="Buka Kunci Siswa"
      subtitle="Pantau sesi ujian, pelanggaran, dan siswa yang terkunci secara ringkas."
    >
      <div className="relative min-h-screen overflow-hidden bg-[#F6F8FF] px-4 py-6 md:px-6 md:py-8">
        <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-44 h-80 w-80 rounded-full bg-sky-200/60 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <PremiumCard className="mb-6 p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Daftar Siswa Terkunci
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Klik refresh untuk memperbarui data dari Google Sheet.
                </p>
              </div>

              <button
                type="button"
                onClick={loadLockedSessions}
                disabled={loading}
                className="
                flex items-center justify-center gap-2 rounded-2xl
                bg-indigo-600 px-5 py-3 text-sm font-black text-white
                shadow-xl shadow-indigo-200 transition hover:bg-indigo-700
                disabled:cursor-not-allowed disabled:opacity-60
              "
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Memuat...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5" />
                    Refresh
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-5 flex items-start gap-3 rounded-3xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <span className="leading-6">{error}</span>
              </div>
            )}

            {success && (
              <div className="mt-5 flex items-start gap-3 rounded-3xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <span className="leading-6">{success}</span>
              </div>
            )}
          </PremiumCard>

          <div className="grid gap-4">
            {lockedList.length === 0 ? (
              <PremiumCard className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-slate-100">
                  <LockKeyhole className="h-10 w-10 text-slate-400" />
                </div>

                <h2 className="text-lg font-black text-slate-900">
                  Tidak ada siswa terkunci
                </h2>

                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                  Semua sesi siswa masih aman atau belum ada pelanggaran yang
                  membuat sesi terkunci.
                </p>
              </PremiumCard>
            ) : (
              lockedList.map((item) => (
                <PremiumCard key={item.sessionId} className="p-5 md:p-6">
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-red-50">
                        <UserRound className="h-7 w-7 text-red-600" />
                      </div>

                      <div>
                        <h3 className="text-lg font-black text-slate-900">
                          {item.nama}
                        </h3>

                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge label={item.kelas} />
                          <Badge label={item.namaUjian} />
                          <Badge
                            label={`Pelanggaran: ${item.jumlahPelanggaran}/${item.maxPelanggaran}`}
                            danger
                          />
                        </div>

                        <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">
                          Login: {formatDate(item.loginAt)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleUnlock(item.sessionId, item.nama)}
                      disabled={unlockingId === item.sessionId}
                      className="
                      flex items-center justify-center gap-2 rounded-2xl
                      bg-emerald-600 px-5 py-3 text-sm font-black text-white
                      shadow-xl shadow-emerald-100 transition hover:bg-emerald-700
                      disabled:cursor-not-allowed disabled:opacity-60
                    "
                    >
                      {unlockingId === item.sessionId ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Membuka...
                        </>
                      ) : (
                        <>
                          <UnlockKeyhole className="h-5 w-5" />
                          Buka Kunci
                        </>
                      )}
                    </button>
                  </div>
                </PremiumCard>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function Badge({ label, danger = false }) {
  return (
    <span
      className={`
        rounded-full px-3 py-1 text-xs font-black
        ${danger ? "bg-red-50 text-red-700" : "bg-indigo-50 text-indigo-700"}
      `}
    >
      {label || "-"}
    </span>
  );
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
