import { useEffect, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  LockKeyhole,
  RefreshCw,
  UsersRound,
  Trash2,
} from "lucide-react";
import { api } from "../services/api";
import PremiumCard from "../components/PremiumCard";
import AdminLayout from "../components/AdminLayout";
import { APP_CONFIG } from "../utils/config";
import { useConfirm } from "../components/ConfirmProvider";
import { useToast } from "../components/ToastProvider";

export default function AdminDashboard() {
  const savedAdmin = JSON.parse(localStorage.getItem("adminSession") || "{}");

  const [adminPin] = useState(savedAdmin.adminPin || "");
  const [summary, setSummary] = useState({
    totalSesi: 0,
    berlangsung: 0,
    selesai: 0,
    terkunci: 0,
    totalPelanggaran: 0,
    recentSessions: [],
    recentViolations: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const confirm = useConfirm();
  const toast = useToast();

  async function loadSummary() {
    if (!adminPin) {
      setError("Session admin tidak ditemukan. Silakan login ulang.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await api.getAdminSummary({
      adminPin,
    });

    setLoading(false);

    if (!res.success) {
      setError(res.message || "Gagal mengambil ringkasan dashboard.");
      return;
    }

    setSummary(res.data || {});
  }

  async function handleCleanup() {
    const yakin = await confirm({
      type: "warning",
      title: "Cleanup Session Lama?",
      message:
        "Session lama akan dipindahkan ke arsip dan session menggantung akan ditandai selesai otomatis.",
      confirmText: "Ya, Cleanup",
      cancelText: "Batal",
    });

    if (!yakin) return;

    setLoading(true);

    const res = await api.cleanupOldSessions({
      adminPin,
      selesaiAfterDays: 7,
      berlangsungAfterHours: 12,
      terkunciAfterDays: 3,
    });

    setLoading(false);

    if (!res.success) {
      toast.error(res.message || "Cleanup gagal.");
      return;
    }

    toast.success(res.message || "Cleanup selesai.");
    await loadSummary();
  }

  useEffect(() => {
    loadSummary();
  }, []);

  const cards = [
    {
      label: "Total Sesi",
      value: summary.totalSesi || 0,
      icon: <UsersRound className="h-7 w-7 text-indigo-600" />,
      bg: "bg-indigo-50",
    },
    {
      label: "Berlangsung",
      value: summary.berlangsung || 0,
      icon: <Clock className="h-7 w-7 text-blue-600" />,
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
    // {
    //   label: "Pelanggaran",
    //   value: summary.totalPelanggaran || 0,
    //   icon: <AlertTriangle className="h-7 w-7 text-orange-600" />,
    //   bg: "bg-orange-50",
    // },
  ];

  return (
    <AdminLayout
      title="Dashboard Admin"
      subtitle="Pantau sesi ujian, pelanggaran, dan siswa yang terkunci secara ringkas."
    >
      <div className="mb-6 flex gap-2 justify-end">
        <button
          type="button"
          onClick={loadSummary}
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

        <button
          type="button"
          onClick={handleCleanup}
          disabled={loading}
          className="
    flex items-center justify-center gap-2 rounded-2xl
    bg-orange-500 px-5 py-3 text-sm font-black text-white
    shadow-xl shadow-orange-100 transition hover:bg-orange-600
    disabled:cursor-not-allowed disabled:opacity-60
  "
        >
          <Trash2 className="h-5 w-5" />
          Cleanup
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

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards.map((item) => (
          <PremiumCard key={item.label} className="p-4 sm:p-5">
            <div
              className={`mb-5 flex h-14 w-14 items-center justify-center rounded-3xl ${item.bg}`}
            >
              {item.icon}
            </div>

            <p className="text-sm font-black text-slate-500">{item.label}</p>

            <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
              {item.value}
            </h2>
          </PremiumCard>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PremiumCard className="overflow-hidden">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-lg font-black text-slate-900">Sesi Terbaru</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              10 sesi terakhir dari Google Sheet.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Nama</th>
                  <th className="px-5 py-4">Kelas</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Login</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {(summary.recentSessions || []).length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-5 py-8 text-center font-semibold text-slate-400"
                    >
                      Belum ada sesi ujian.
                    </td>
                  </tr>
                ) : (
                  summary.recentSessions.map((item, index) => (
                    <tr key={`${item.sessionId}-${index}`}>
                      <td className="px-5 py-4 font-black text-slate-800">
                        {item.nama || "-"}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-500">
                        {item.kelas || "-"}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-500">
                        {formatDate(item.loginAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </PremiumCard>

        <PremiumCard className="overflow-hidden">
          <div className="border-b border-slate-100 p-5">
            <h2 className="text-lg font-black text-slate-900">
              Pelanggaran Terbaru
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              10 pelanggaran terakhir yang tercatat.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Nama</th>
                  <th className="px-5 py-4">Kelas</th>
                  <th className="px-5 py-4">Jenis</th>
                  <th className="px-5 py-4">Waktu</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                {(summary.recentViolations || []).length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-5 py-8 text-center font-semibold text-slate-400"
                    >
                      Belum ada pelanggaran.
                    </td>
                  </tr>
                ) : (
                  summary.recentViolations.map((item, index) => (
                    <tr key={`${item.id}-${index}`}>
                      <td className="px-5 py-4 font-black text-slate-800">
                        {item.nama || "-"}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-500">
                        {item.kelas || "-"}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
                          {item.jenis || "-"}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-500">
                        {formatDate(item.waktu)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </PremiumCard>
      </div>
    </AdminLayout>
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
