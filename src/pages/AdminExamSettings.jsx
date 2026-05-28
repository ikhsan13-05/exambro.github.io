import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Edit3,
  ExternalLink,
  FileText,
  Loader2,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  Settings,
  ShieldCheck,
  QrCode,
  Download,
  Trash2,
  X,
} from "lucide-react";
import { api } from "../services/api";
import PremiumCard from "../components/PremiumCard";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../components/ToastProvider";
import { useConfirm } from "../components/ConfirmProvider";
import { QRCodeCanvas } from "qrcode.react";

const defaultForm = {
  id: "",
  namaUjian: "",
  token: "",
  kelas: "",
  formUrl: "",
  durasiMenit: 60,
  mulai: "",
  selesai: "",
  maxPelanggaran: 3,
  status: "AKTIF",
};

export default function AdminExamSettings() {
  const savedAdmin = JSON.parse(localStorage.getItem("adminSession") || "{}");
  const adminPin = savedAdmin.adminPin || "";

  const [data, setData] = useState([]);
  const [kelasList, setKelasList] = useState([]);

  const [form, setForm] = useState(defaultForm);
  const [openForm, setOpenForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [qrOpen, setQrOpen] = useState(false);
  const [selectedQr, setSelectedQr] = useState(null);

  const toast = useToast();
  const confirm = useConfirm();

  const totalAktif = useMemo(
    () =>
      data.filter((item) => String(item.status).toUpperCase() === "AKTIF")
        .length,
    [data],
  );

  const totalNonaktif = useMemo(
    () =>
      data.filter((item) => String(item.status).toUpperCase() !== "AKTIF")
        .length,
    [data],
  );

  async function loadData() {
    setLoading(true);
    setError("");
    setSuccess("");

    const [settingRes, kelasRes] = await Promise.all([
      api.getExamSettings({ adminPin }),
      api.getKelas(),
    ]);

    setLoading(false);

    if (!settingRes.success) {
      toast.error(settingRes.message || "Gagal memuat setting ujian.");
      return;
    }

    setData(settingRes.data || []);

    if (kelasRes.success) {
      setKelasList(kelasRes.data || []);
    }
  }

  function openCreate() {
    setForm(defaultForm);
    setIsEdit(false);
    setOpenForm(true);
    setError("");
    setSuccess("");
  }

  function openEdit(item) {
    setForm({
      id: item.id || "",
      namaUjian: item.namaUjian || "",
      token: item.token || "",
      kelas: item.kelas || "",
      formUrl: item.formUrl || "",
      durasiMenit: Number(item.durasiMenit || 60),
      mulai: toInputDateTime(item.mulai),
      selesai: toInputDateTime(item.selesai),
      maxPelanggaran: Number(item.maxPelanggaran || 3),
      status: item.status || "AKTIF",
    });

    setIsEdit(true);
    setOpenForm(true);
    setError("");
    setSuccess("");
  }

  function validateForm() {
    if (!form.namaUjian.trim()) return "Nama ujian wajib diisi.";
    if (!form.token.trim()) return "Token ujian wajib diisi.";
    if (!form.kelas.trim()) return "Kelas wajib dipilih.";
    if (!form.formUrl.trim()) return "URL Google Form wajib diisi.";
    if (!form.mulai) return "Waktu mulai wajib diisi.";
    if (!form.selesai) return "Waktu selesai wajib diisi.";
    if (Number(form.durasiMenit) <= 0) return "Durasi ujian tidak valid.";
    if (Number(form.maxPelanggaran) <= 0)
      return "Maksimal pelanggaran tidak valid.";
    if (new Date(form.selesai) <= new Date(form.mulai)) {
      return "Waktu selesai harus lebih besar dari waktu mulai.";
    }

    return "";
  }

  async function handleSave(e) {
    e.preventDefault();

    const validation = validateForm();

    if (validation) {
      setError(validation);
      return;
    }

    setLoadingSave(true);
    setError("");
    setSuccess("");

    const res = await api.saveExamSetting({
      adminPin,
      form: {
        ...form,
        token: form.token.trim().toUpperCase(),
      },
    });

    setLoadingSave(false);

    if (!res.success) {
      toast.error(res.message || "Gagal menyimpan setting ujian.");
      return;
    }

    toast.success(res.message || "Setting ujian berhasil disimpan.");
    setOpenForm(false);
    setForm(defaultForm);
    await loadData();
  }

  async function handleDelete(id) {
    const yakin = await confirm({
      type: "danger",
      title: "Hapus Data?",
      message: "Data yang dihapus tidak dapat dikembalikan.",
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
    });

    if (!yakin) return;

    setDeletingId(id);
    setError("");
    setSuccess("");

    const res = await api.deleteExamSetting({
      adminPin,
      id,
    });

    setDeletingId("");

    if (!res.success) {
      toast.error(res.message || "Gagal menghapus setting ujian.");
      return;
    }

    toast.success(res.message || "Setting ujian berhasil dihapus.");
    await loadData();
  }

  function handleLogout() {
    localStorage.removeItem("adminSession");
    window.location.href = "/admin/login";
  }

  useEffect(() => {
    loadData();
  }, []);

  function openQr(item) {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/?token=${encodeURIComponent(
      item.token,
    )}&kelas=${encodeURIComponent(item.kelas)}`;

    setSelectedQr({
      ...item,
      qrUrl: url,
    });

    setQrOpen(true);
  }

  function downloadQr() {
    const canvas = document.getElementById("exam-qr-canvas");
    if (!canvas || !selectedQr) return;

    const safeName = `${selectedQr.namaUjian}-${selectedQr.kelas}`
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");

    const link = document.createElement("a");
    link.href = pngUrl;
    link.download = `QR-${safeName}.png`;
    link.click();
  }

  return (
    <AdminLayout
      title="Setting Ujian"
      subtitle="Pantau sesi ujian, pelanggaran, dan siswa yang terkunci secara ringkas."
    >
      <div className="relative min-h-screen overflow-hidden bg-[#F6F8FF] px-4 py-6 md:px-6 md:py-8">
        <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-44 h-80 w-80 rounded-full bg-sky-200/60 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={loadData}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-2xl
            bg-indigo-600 px-5 py-3 text-sm font-black text-white
            shadow-xl shadow-indigo-200 transition hover:bg-indigo-700
            disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <RefreshCw className="h-5 w-5" />
                )}
                Refresh
              </button>

              <button
                onClick={openCreate}
                className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-xl shadow-emerald-100 transition hover:bg-emerald-700"
              >
                <Plus className="h-5 w-5" />
                Tambah
              </button>
            </div>
          </div>

          {(error || success) && (
            <PremiumCard className="mb-6 p-5">
              {error && (
                <div className="flex items-start gap-3 rounded-3xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <span className="leading-6">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-3 rounded-3xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  <span className="leading-6">{success}</span>
                </div>
              )}
            </PremiumCard>
          )}

          <div className="mb-6 grid grid-cols-3 gap-3 sm:gap-4 md:grid-cols-3">
            <SummaryCard
              title="Total Setting"
              value={data.length}
              icon={<Settings className="h-7 w-7 text-indigo-600" />}
            />
            <SummaryCard
              title="Aktif"
              value={totalAktif}
              icon={<CheckCircle2 className="h-7 w-7 text-emerald-600" />}
            />
            <SummaryCard
              title="Nonaktif"
              value={totalNonaktif}
              icon={<AlertCircle className="h-7 w-7 text-orange-600" />}
            />
          </div>

          <PremiumCard className="overflow-hidden">
            <div className="border-b border-slate-100 p-5">
              <h2 className="text-lg font-black text-slate-900">
                Daftar Setting Ujian
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Data diambil dari sheet SETTING_UJIAN.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Ujian</th>
                    <th className="px-5 py-4">Token</th>
                    <th className="px-5 py-4">Kelas</th>
                    <th className="px-5 py-4">Durasi</th>
                    <th className="px-5 py-4">Jadwal</th>
                    <th className="px-5 py-4">Max</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-sm">
                  {data.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-5 py-10 text-center font-semibold text-slate-400"
                      >
                        Belum ada setting ujian.
                      </td>
                    </tr>
                  ) : (
                    data.map((item) => (
                      <tr key={item.id}>
                        <td className="px-5 py-4">
                          <p className="font-black text-slate-900">
                            {item.namaUjian}
                          </p>
                          <a
                            href={item.formUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs font-black text-indigo-600 hover:text-indigo-700"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Google Form
                          </a>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                            {item.token}
                          </span>
                        </td>

                        <td className="px-5 py-4 font-bold text-slate-600">
                          {item.kelas}
                        </td>

                        <td className="px-5 py-4 font-bold text-slate-600">
                          {item.durasiMenit} menit
                        </td>

                        <td className="px-5 py-4 text-xs font-semibold leading-5 text-slate-500">
                          <div>Mulai: {formatDate(item.mulai)}</div>
                          <div>Selesai: {formatDate(item.selesai)}</div>
                        </td>

                        <td className="px-5 py-4 font-bold text-red-600">
                          {item.maxPelanggaran}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={item.status} />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEdit(item)}
                              className="rounded-2xl bg-blue-50 p-3 text-blue-700 transition hover:bg-blue-100"
                              title="Edit"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleDelete(item.id)}
                              disabled={deletingId === item.id}
                              className="rounded-2xl bg-red-50 p-3 text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                              title="Hapus"
                            >
                              {deletingId === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>

                            <button
                              onClick={() => openQr(item)}
                              className="rounded-2xl bg-indigo-50 p-3 text-indigo-700 transition hover:bg-indigo-100"
                              title="Generate QR"
                            >
                              <QrCode className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </PremiumCard>
        </div>

        {openForm && (
          <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-5">
            <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-[2rem]">
              {/* HEADER */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-6 sm:py-5">
                <div>
                  <h2 className="text-lg font-black text-slate-900 sm:text-xl">
                    {isEdit ? "Edit Setting Ujian" : "Tambah Setting Ujian"}
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-slate-500 sm:text-sm">
                    Isi data ujian dengan lengkap.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpenForm(false)}
                  className="rounded-2xl bg-slate-100 p-3 text-slate-600 hover:bg-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* BODY */}
              <form
                id="exam-setting-form"
                onSubmit={handleSave}
                className="flex-1 overflow-y-auto p-5 sm:p-6"
              >
                <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
                  <Input
                    label="Nama Ujian"
                    icon={<FileText className="h-5 w-5" />}
                    value={form.namaUjian}
                    onChange={(value) => setForm({ ...form, namaUjian: value })}
                    placeholder="Contoh: Ujian Matematika"
                  />

                  <Input
                    label="Token"
                    value={form.token}
                    onChange={(value) =>
                      setForm({ ...form, token: value.toUpperCase() })
                    }
                    placeholder="Contoh: MTK123"
                  />

                  <Select
                    label="Kelas"
                    value={form.kelas}
                    onChange={(value) => setForm({ ...form, kelas: value })}
                    options={kelasList.map((item) => ({
                      label: item.namaKelas,
                      value: item.namaKelas,
                    }))}
                  />

                  <Input
                    label="Durasi Menit"
                    type="number"
                    value={form.durasiMenit}
                    onChange={(value) =>
                      setForm({ ...form, durasiMenit: value })
                    }
                    placeholder="60"
                  />

                  <div className="md:col-span-2">
                    <Input
                      label="URL Google Form"
                      value={form.formUrl}
                      onChange={(value) => setForm({ ...form, formUrl: value })}
                      placeholder="https://docs.google.com/forms/..."
                    />
                  </div>

                  <Input
                    label="Mulai"
                    icon={<CalendarClock className="h-5 w-5" />}
                    type="datetime-local"
                    value={form.mulai}
                    onChange={(value) => setForm({ ...form, mulai: value })}
                  />

                  <Input
                    label="Selesai"
                    icon={<CalendarClock className="h-5 w-5" />}
                    type="datetime-local"
                    value={form.selesai}
                    onChange={(value) => setForm({ ...form, selesai: value })}
                  />

                  <Input
                    label="Max Pelanggaran"
                    type="number"
                    value={form.maxPelanggaran}
                    onChange={(value) =>
                      setForm({ ...form, maxPelanggaran: value })
                    }
                    placeholder="3"
                  />

                  <Select
                    label="Status"
                    value={form.status}
                    onChange={(value) => setForm({ ...form, status: value })}
                    options={[
                      { label: "AKTIF", value: "AKTIF" },
                      { label: "NONAKTIF", value: "NONAKTIF" },
                    ]}
                  />
                </div>
              </form>

              {/* FOOTER FIXED MOBILE */}
              <div className="border-t border-slate-100 bg-white px-5 py-4 sm:px-6">
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setOpenForm(false)}
                    className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-200"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    form="exam-setting-form"
                    disabled={loadingSave}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {loadingSave ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        Simpan
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {qrOpen && selectedQr && (
          <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-5">
            <div className="flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-[2rem]">
              {/* HEADER */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-6 sm:py-5">
                <div>
                  <h2 className="text-lg font-black text-slate-900 sm:text-xl">
                    QR Ujian
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-slate-500 sm:text-sm">
                    Scan untuk mengisi kelas dan token otomatis.
                  </p>
                </div>

                <button
                  onClick={() => setQrOpen(false)}
                  className="rounded-2xl bg-slate-100 p-3 text-slate-600 hover:bg-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* BODY */}
              <div className="flex-1 overflow-y-auto p-5 text-center sm:p-6">
                <div className="mx-auto mb-5 inline-flex rounded-[1.7rem] border border-slate-100 bg-white p-3 shadow-xl shadow-slate-200/80 sm:rounded-[2rem] sm:p-4">
                  <QRCodeCanvas
                    id="exam-qr-canvas"
                    value={selectedQr.qrUrl}
                    size={220}
                    level="H"
                    includeMargin
                  />
                </div>

                <h3 className="line-clamp-2 text-lg font-black text-slate-900">
                  {selectedQr.namaUjian}
                </h3>

                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">
                    {selectedQr.kelas}
                  </span>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                    Token: {selectedQr.token}
                  </span>
                </div>

                <div className="mt-5 rounded-3xl bg-slate-50 p-4 text-left">
                  <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                    Link QR
                  </p>
                  <p className="mt-1 break-all text-xs font-semibold leading-5 text-slate-600">
                    {selectedQr.qrUrl}
                  </p>
                </div>

                <div className="mt-5 rounded-3xl border border-amber-100 bg-amber-50 p-4 text-left">
                  <p className="text-sm font-black text-amber-700">Catatan</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-amber-700/90">
                    QR ini hanya mengisi otomatis kelas dan token. Siswa tetap
                    wajib mengisi nama lengkap sebelum mulai ujian.
                  </p>
                </div>
              </div>

              {/* FOOTER */}
              <div className="border-t border-slate-100 bg-white px-5 py-4 sm:px-6">
                <button
                  onClick={downloadQr}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white shadow-xl shadow-indigo-200 transition hover:bg-indigo-700"
                >
                  <Download className="h-5 w-5" />
                  Download QR
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function SummaryCard({ title, value, icon }) {
  return (
    <PremiumCard className="p-4 sm:p-5">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-50">
        {icon}
      </div>
      <p className="text-sm font-black text-slate-500">{title}</p>
      <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
        {value}
      </h2>
    </PremiumCard>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  icon = null,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </label>

      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full rounded-2xl border border-slate-200 bg-white
            py-3.5 text-sm font-bold text-slate-800 outline-none transition
            placeholder:text-slate-400
            focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100
            ${icon ? "pl-12 pr-4" : "px-4"}
          `}
        />
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options = [] }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-700">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full rounded-2xl border border-slate-200 bg-white
          px-4 py-3.5 text-sm font-bold text-slate-800 outline-none transition
          focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100
        "
      >
        <option value="">Pilih</option>

        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function StatusBadge({ status }) {
  const value = String(status || "-").toUpperCase();

  const style =
    value === "AKTIF"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-slate-100 text-slate-600";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${style}`}>
      {value}
    </span>
  );
}

function toInputDateTime(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);

  return localDate.toISOString().slice(0, 16);
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

function MobileInfo({ label, value, custom, wide = false }) {
  return (
    <div className={`rounded-2xl bg-slate-50 p-3 ${wide ? "col-span-2" : ""}`}>
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="mt-1 break-words text-xs font-black text-slate-700">
        {custom || value || "-"}
      </div>
    </div>
  );
}
