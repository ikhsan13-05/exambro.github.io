import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  FileWarning,
  Loader2,
  LockKeyhole,
  RefreshCw,
  Search,
  ShieldAlert,
  UnlockKeyhole,
  UsersRound,
  Wifi,
  WifiOff,
  RotateCcw,
  X,
} from "lucide-react";
import { api } from "../services/api";
import PremiumCard from "../components/PremiumCard";
import AdminLayout from "../components/AdminLayout";
import { useConfirm } from "../components/ConfirmProvider";
import { useToast } from "../components/ToastProvider";

export default function AdminMonitoring() {
  const savedAdmin = JSON.parse(localStorage.getItem("adminSession") || "{}");
  const adminPin = savedAdmin.adminPin || "";

  const confirm = useConfirm();
  const toast = useToast();

  const [summary, setSummary] = useState({
    totalPeserta: 0,
    berlangsung: 0,
    selesai: 0,
    terkunci: 0,
    online: 0,
    peserta: [],
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("SEMUA");
  const [onlineFilter, setOnlineFilter] = useState("SEMUA");

  const [loading, setLoading] = useState(false);
  const [firstLoading, setFirstLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [violations, setViolations] = useState([]);

  async function loadMonitoring({ silent = false } = {}) {
    if (!adminPin) {
      setError("Session admin tidak ditemukan. Silakan login ulang.");
      setFirstLoading(false);
      return;
    }

    if (!silent) setLoading(true);
    setError("");

    const res = await api.getMonitoringData({ adminPin });

    if (!silent) setLoading(false);
    setFirstLoading(false);

    if (!res.success) {
      setError(res.message || "Gagal memuat data monitoring.");
      return;
    }

    setSummary(res.data || {});
    setLastUpdate(
      new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    );
  }

  async function openViolationDetail(item) {
    setSelectedSession(item);
    setViolations([]);
    setDetailError("");
    setDetailOpen(true);
    setDetailLoading(true);

    const res = await api.getSessionViolations({
      adminPin,
      sessionId: item.sessionId,
    });

    setDetailLoading(false);

    if (!res.success) {
      setDetailError(res.message || "Gagal memuat detail pelanggaran.");
      return;
    }

    setSelectedSession(res.data?.session || item);
    setViolations(res.data?.violations || []);
  }

  async function handleQuickUnlock() {
    if (!selectedSession?.sessionId) return;

    const yakin = await confirm({
      type: "info",
      title: "Buka Kunci Siswa?",
      message: `Sesi ujian ${selectedSession.nama} akan dibuka kembali dan siswa dapat login ulang dari perangkat baru.`,
      confirmText: "Ya, Buka Kunci",
      cancelText: "Batal",
    });

    if (!yakin) return;

    setUnlocking(true);
    setDetailError("");

    const res = await api.unlockSession({
      adminPin,
      sessionId: selectedSession.sessionId,
    });

    setUnlocking(false);

    if (!res.success) {
      setDetailError(res.message || "Gagal membuka kunci siswa.");
      toast.error(res.message || "Gagal membuka kunci siswa.");
      return;
    }

    toast.success(
      res.message || `Kunci ujian ${selectedSession.nama} berhasil dibuka.`,
    );

    const updatedSession = {
      ...selectedSession,
      status: "BERLANGSUNG",
      jumlahPelanggaran: 0,
      deviceId: "",
      lastSeen: "",
      onlineStatus: "OFFLINE",
    };

    setSelectedSession(updatedSession);

    setSummary((prev) => ({
      ...prev,
      berlangsung: Number(prev.berlangsung || 0) + 1,
      terkunci: Math.max(0, Number(prev.terkunci || 0) - 1),
      online: Math.max(0, Number(prev.online || 0) - 1),
      peserta: (prev.peserta || []).map((item) =>
        item.sessionId === selectedSession.sessionId ? updatedSession : item,
      ),
    }));

    await loadMonitoring({ silent: true });
  }

  async function handleResetDevice() {
    if (!selectedSession?.sessionId) return;

    const yakin = await confirm({
      type: "warning",
      title: "Reset Device Siswa?",
      message: `Device ID ${selectedSession.nama} akan dikosongkan. Siswa dapat login ulang dari perangkat/browser baru.`,
      confirmText: "Ya, Reset",
      cancelText: "Batal",
    });

    if (!yakin) return;

    setUnlocking(true);
    setDetailError("");

    const res = await api.resetSessionDevice({
      adminPin,
      sessionId: selectedSession.sessionId,
    });

    setUnlocking(false);

    if (!res.success) {
      setDetailError(res.message || "Gagal reset device siswa.");
      toast.error(res.message || "Gagal reset device siswa.");
      return;
    }

    toast.success(res.message || "Device siswa berhasil direset.");

    const updatedSession = {
      ...selectedSession,
      deviceId: "",
      lastSeen: "",
      onlineStatus: "OFFLINE",
    };

    setSelectedSession(updatedSession);

    setSummary((prev) => ({
      ...prev,
      online: Math.max(0, Number(prev.online || 0) - 1),
      peserta: (prev.peserta || []).map((item) =>
        item.sessionId === selectedSession.sessionId ? updatedSession : item,
      ),
    }));

    await loadMonitoring({ silent: true });
  }

  function closeViolationDetail() {
    setDetailOpen(false);
    setDetailLoading(false);
    setDetailError("");
    setUnlocking(false);
    setSelectedSession(null);
    setViolations([]);
  }

  useEffect(() => {
    loadMonitoring();

    const interval = setInterval(() => {
      loadMonitoring({ silent: true });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredPeserta = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return (summary.peserta || []).filter((item) => {
      const matchSearch =
        !keyword ||
        String(item.nama || "")
          .toLowerCase()
          .includes(keyword) ||
        String(item.kelas || "")
          .toLowerCase()
          .includes(keyword) ||
        String(item.namaUjian || "")
          .toLowerCase()
          .includes(keyword);

      const matchStatus =
        statusFilter === "SEMUA" ||
        String(item.status || "").toUpperCase() === statusFilter;

      const matchOnline =
        onlineFilter === "SEMUA" ||
        String(item.onlineStatus || "").toUpperCase() === onlineFilter;

      return matchSearch && matchStatus && matchOnline;
    });
  }, [summary.peserta, search, statusFilter, onlineFilter]);

  const offlineCount = Math.max(
    0,
    Number(summary.berlangsung || 0) - Number(summary.online || 0),
  );

  const cards = [
    {
      label: "Total Peserta",
      value: summary.totalPeserta || 0,
      icon: <UsersRound className="h-7 w-7 text-indigo-600" />,
      bg: "bg-indigo-50",
    },
    {
      label: "Online",
      value: summary.online || 0,
      icon: <Wifi className="h-7 w-7 text-sky-600" />,
      bg: "bg-sky-50",
    },
    {
      label: "Offline",
      value: offlineCount,
      icon: <WifiOff className="h-7 w-7 text-slate-600" />,
      bg: "bg-slate-100",
    },
    {
      label: "Berlangsung",
      value: summary.berlangsung || 0,
      icon: <Activity className="h-7 w-7 text-blue-600" />,
      bg: "bg-blue-50",
    },
    {
      label: "Selesai",
      value: summary.selesai || 0,
      icon: <CheckCircle2 className="h-7 w-7 text-emerald-600" />,
      bg: "bg-emerald-50",
    },
    {
      label: "Terkunci",
      value: summary.terkunci || 0,
      icon: <LockKeyhole className="h-7 w-7 text-red-600" />,
      bg: "bg-red-50",
    },
  ];

  return (
    <AdminLayout
      title="Monitoring Peserta"
      subtitle="Pantau peserta ujian realtime dengan heartbeat online/offline setiap 15 detik."
    >
      {firstLoading ? (
        <PremiumCard className="p-8 text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm font-black text-slate-600">
            Memuat monitoring peserta...
          </p>
        </PremiumCard>
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm font-bold text-slate-500 shadow-lg shadow-slate-200/60">
              Update terakhir:{" "}
              <span className="font-black text-slate-900">
                {lastUpdate || "-"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => loadMonitoring()}
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
            <PremiumCard className="mb-6 p-5">
              <div className="flex items-start gap-3 rounded-3xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <span className="leading-6">{error}</span>
              </div>
            </PremiumCard>
          )}

          <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-6">
            {cards.map((item) => (
              <PremiumCard key={item.label} className="p-4 sm:p-5">
                <div
                  className={`mb-5 flex h-14 w-14 items-center justify-center rounded-3xl ${item.bg}`}
                >
                  {item.icon}
                </div>

                <p className="text-sm font-black text-slate-500">
                  {item.label}
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
                  {item.value}
                </h2>
              </PremiumCard>
            ))}
          </div>

          <PremiumCard className="overflow-hidden">
            <div className="border-b border-slate-100 p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Daftar Peserta Ujian
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Status online berdasarkan heartbeat terakhir dari ExamRoom.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cari nama/kelas/ujian..."
                      className="
                        w-full rounded-2xl border border-slate-200 bg-white
                        py-3 pl-12 pr-4 text-sm font-bold text-slate-800
                        outline-none transition
                        focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100
                      "
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="
                      rounded-2xl border border-slate-200 bg-white
                      px-4 py-3 text-sm font-bold text-slate-800
                      outline-none transition
                      focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100
                    "
                  >
                    <option value="SEMUA">Semua Status</option>
                    <option value="BERLANGSUNG">Berlangsung</option>
                    <option value="SELESAI">Selesai</option>
                    <option value="DIKUNCI">Terkunci</option>
                  </select>

                  <select
                    value={onlineFilter}
                    onChange={(e) => setOnlineFilter(e.target.value)}
                    className="
                      rounded-2xl border border-slate-200 bg-white
                      px-4 py-3 text-sm font-bold text-slate-800
                      outline-none transition
                      focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100
                    "
                  >
                    <option value="SEMUA">Semua Koneksi</option>
                    <option value="ONLINE">Online</option>
                    <option value="OFFLINE">Offline</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1240px] text-left">
                <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Peserta</th>
                    <th className="px-5 py-4">Ujian</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Koneksi</th>
                    <th className="px-5 py-4">Pelanggaran</th>
                    <th className="px-5 py-4">Login</th>
                    <th className="px-5 py-4">Last Seen</th>
                    <th className="px-5 py-4">Durasi</th>
                    <th className="px-5 py-4 text-right">Detail</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredPeserta.length === 0 ? (
                    <tr>
                      <td
                        colSpan="9"
                        className="px-5 py-10 text-center font-semibold text-slate-400"
                      >
                        Tidak ada data peserta.
                      </td>
                    </tr>
                  ) : (
                    filteredPeserta.map((item, index) => (
                      <tr key={`${item.sessionId}-${index}`}>
                        <td className="px-5 py-4">
                          <p className="font-black text-slate-900">
                            {item.nama || "-"}
                          </p>
                          <p className="mt-1 text-xs font-bold text-slate-400">
                            {item.kelas || "-"}
                          </p>
                        </td>

                        <td className="px-5 py-4 font-semibold text-slate-600">
                          {item.namaUjian || "-"}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={item.status} />
                        </td>

                        <td className="px-5 py-4">
                          <OnlineBadge status={item.onlineStatus} />
                        </td>

                        <td className="px-5 py-4">
                          <ViolationBadge
                            count={item.jumlahPelanggaran}
                            max={item.maxPelanggaran}
                          />
                        </td>

                        <td className="px-5 py-4 font-semibold text-slate-500">
                          {formatDate(item.loginAt)}
                        </td>

                        <td className="px-5 py-4 font-semibold text-slate-500">
                          {formatLastSeen(item.lastSeen)}
                        </td>

                        <td className="px-5 py-4 font-bold text-slate-600">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-slate-400" />
                            {getDurationText(item.loginAt, item.selesaiAt)}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => openViolationDetail(item)}
                              className="
                                flex items-center gap-2 rounded-2xl
                                bg-indigo-50 px-4 py-2.5
                                text-xs font-black text-indigo-700
                                transition hover:bg-indigo-100
                              "
                            >
                              <Eye className="h-4 w-4" />
                              Detail
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-4 md:hidden">
              {filteredPeserta.length === 0 ? (
                <div className="rounded-3xl bg-slate-50 p-6 text-center text-sm font-bold text-slate-400">
                  Tidak ada data peserta.
                </div>
              ) : (
                filteredPeserta.map((item, index) => (
                  <div
                    key={`${item.sessionId}-mobile-${index}`}
                    className="rounded-3xl border border-slate-100 bg-white p-4 shadow-lg shadow-slate-200/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-black text-slate-900">
                          {item.nama || "-"}
                        </p>
                        <p className="mt-1 text-xs font-bold text-slate-400">
                          {item.kelas || "-"}
                        </p>
                      </div>

                      <OnlineBadge status={item.onlineStatus} />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <MobileInfo label="Ujian" value={item.namaUjian || "-"} />
                      <MobileInfo
                        label="Status"
                        custom={<StatusBadge status={item.status} />}
                      />
                      <MobileInfo
                        label="Pelanggaran"
                        custom={
                          <ViolationBadge
                            count={item.jumlahPelanggaran}
                            max={item.maxPelanggaran}
                          />
                        }
                      />
                      <MobileInfo
                        label="Last Seen"
                        value={formatLastSeen(item.lastSeen)}
                      />
                      <MobileInfo
                        label="Login"
                        value={formatDate(item.loginAt)}
                      />
                      <MobileInfo
                        label="Durasi"
                        value={getDurationText(item.loginAt, item.selesaiAt)}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => openViolationDetail(item)}
                      className="
            mt-4 flex w-full items-center justify-center gap-2
            rounded-2xl bg-indigo-600 px-4 py-3
            text-xs font-black text-white
            shadow-xl shadow-indigo-100
            transition hover:bg-indigo-700
          "
                    >
                      <Eye className="h-4 w-4" />
                      Lihat Detail
                    </button>
                  </div>
                ))
              )}
            </div>
          </PremiumCard>
        </>
      )}

      {detailOpen && (
        <ViolationDetailModal
          session={selectedSession}
          violations={violations}
          loading={detailLoading}
          error={detailError}
          unlocking={unlocking}
          onUnlock={handleQuickUnlock}
          onResetDevice={handleResetDevice}
          onClose={closeViolationDetail}
        />
      )}
    </AdminLayout>
  );
}

function ViolationDetailModal({
  session,
  violations = [],
  loading,
  error,
  unlocking,
  onUnlock,
  onResetDevice,
  onClose,
}) {
  const isLocked = String(session?.status || "").toUpperCase() === "DIKUNCI";

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:items-center sm:p-5">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur">
          <div>
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-3xl bg-red-50">
              <ShieldAlert className="h-7 w-7 text-red-600" />
            </div>

            <h2 className="text-xl font-black text-slate-900">
              Detail Peserta
            </h2>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Identitas, koneksi, dan riwayat pelanggaran.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-slate-100 p-3 text-slate-600 hover:bg-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(92vh-150px)] overflow-y-auto p-6">
          {session && (
            <div className="mb-5 grid gap-3 md:grid-cols-3">
              <InfoBox label="Nama" value={session.nama} />
              <InfoBox label="Kelas" value={session.kelas} />
              <InfoBox label="Status" value={session.status} />
              <InfoBox
                label="Koneksi"
                value={session.onlineStatus || "OFFLINE"}
              />
              <InfoBox
                label="Last Seen"
                value={formatLastSeen(session.lastSeen)}
              />
              <InfoBox
                label="Pelanggaran"
                value={`${session.jumlahPelanggaran || 0}/${
                  session.maxPelanggaran || 3
                }`}
              />
              <InfoBox label="Ujian" value={session.namaUjian} wide />
              <InfoBox label="Device ID" value={session.deviceId || "-"} wide />
            </div>
          )}

          {session?.deviceId && (
            <div className="mb-5 rounded-3xl border border-orange-100 bg-orange-50 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <RotateCcw className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />

                  <div>
                    <p className="text-sm font-black text-orange-700">
                      Reset Device Siswa
                    </p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-orange-700/90">
                      Gunakan jika siswa perlu login ulang dari
                      perangkat/browser baru.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onResetDevice}
                  disabled={unlocking}
                  className="
          flex items-center justify-center gap-2 rounded-2xl
          bg-orange-500 px-5 py-3 text-sm font-black text-white
          shadow-xl shadow-orange-100 transition hover:bg-orange-600
          disabled:cursor-not-allowed disabled:opacity-60
        "
                >
                  {unlocking ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="h-5 w-5" />
                      Reset Device
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {isLocked && (
            <div className="mb-5 rounded-3xl border border-red-100 bg-red-50 p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  <div>
                    <p className="text-sm font-black text-red-700">
                      Sesi peserta sedang terkunci
                    </p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-red-600">
                      Buka kunci akan menghapus deviceId agar siswa bisa login
                      ulang dari perangkat baru.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onUnlock}
                  disabled={unlocking}
                  className="
                    flex items-center justify-center gap-2 rounded-2xl
                    bg-emerald-600 px-5 py-3 text-sm font-black text-white
                    shadow-xl shadow-emerald-100 transition hover:bg-emerald-700
                    disabled:cursor-not-allowed disabled:opacity-60
                  "
                >
                  {unlocking ? (
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
            </div>
          )}

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-3xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <span className="leading-6">{error}</span>
            </div>
          )}

          {loading ? (
            <div className="rounded-3xl bg-slate-50 p-8 text-center">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-indigo-600" />
              <p className="text-sm font-black text-slate-600">
                Memuat detail pelanggaran...
              </p>
            </div>
          ) : violations.length === 0 ? (
            <div className="rounded-3xl bg-emerald-50 p-8 text-center">
              <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-emerald-600" />
              <h3 className="text-lg font-black text-slate-900">
                Tidak ada pelanggaran
              </h3>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                Peserta ini belum memiliki riwayat pelanggaran.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {violations.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="rounded-3xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-100">
                        <FileWarning className="h-5 w-5 text-orange-600" />
                      </div>

                      <div>
                        <p className="text-sm font-black text-slate-900">
                          {item.jenis || "PELANGGARAN"}
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                          {item.detail || "-"}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500">
                      {formatDate(item.waktu)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value, wide = false }) {
  return (
    <div
      className={`rounded-3xl border border-slate-100 bg-slate-50 p-4 ${
        wide ? "md:col-span-2" : ""
      }`}
    >
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-all text-sm font-black text-slate-800">
        {value || "-"}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const value = String(status || "-").toUpperCase();

  const styles = {
    BERLANGSUNG: "bg-blue-50 text-blue-700",
    SELESAI: "bg-emerald-50 text-emerald-700",
    DIKUNCI: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black ${
        styles[value] || "bg-slate-100 text-slate-600"
      }`}
    >
      {value}
    </span>
  );
}

function OnlineBadge({ status }) {
  const value = String(status || "OFFLINE").toUpperCase();
  const online = value === "ONLINE";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${
        online ? "bg-sky-50 text-sky-700" : "bg-slate-100 text-slate-600"
      }`}
    >
      {online ? (
        <Wifi className="h-3.5 w-3.5" />
      ) : (
        <WifiOff className="h-3.5 w-3.5" />
      )}
      {value}
    </span>
  );
}

function ViolationBadge({ count, max }) {
  const current = Number(count || 0);
  const limit = Number(max || 3);
  const danger = current >= limit;

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black ${
        danger ? "bg-red-50 text-red-700" : "bg-orange-50 text-orange-700"
      }`}
    >
      {current}/{limit}
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

function formatLastSeen(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  const diffMs = Date.now() - date.getTime();
  const seconds = Math.floor(diffMs / 1000);

  if (seconds < 10) return "Baru saja";
  if (seconds < 60) return `${seconds} detik lalu`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit lalu`;

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDurationText(start, end) {
  if (!start) return "-";

  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return "-";
  }

  const diffMs = Math.max(0, endDate.getTime() - startDate.getTime());
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "< 1 menit";

  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours} jam ${restMinutes} menit`;
  }

  return `${minutes} menit`;
}

function MobileInfo({ label, value, custom }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="mt-1 text-xs font-black text-slate-700">
        {custom || value || "-"}
      </div>
    </div>
  );
}
