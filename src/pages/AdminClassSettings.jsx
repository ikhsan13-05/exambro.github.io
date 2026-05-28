import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  GraduationCap,
  Layers3,
  Loader2,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  School,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { api } from "../services/api";
import PremiumCard from "../components/PremiumCard";
import AdminLayout from "../components/AdminLayout";
import { useToast } from "../components/ToastProvider";
import { useConfirm } from "../components/ConfirmProvider";

const defaultForm = {
  id: "",
  namaKelas: "",
  tingkat: "",
  status: "AKTIF",
};

const tingkatOptions = ["VII", "VIII", "IX"];

export default function AdminClassSettings() {
  const savedAdmin = JSON.parse(localStorage.getItem("adminSession") || "{}");
  const adminPin = savedAdmin.adminPin || "";

  const [data, setData] = useState([]);
  const [form, setForm] = useState(defaultForm);

  const [openForm, setOpenForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

    const res = await api.getAdminKelas({
      adminPin,
    });

    setLoading(false);

    if (!res.success) {
      toast.error(res.message || "Gagal memuat data kelas.");
      return;
    }

    setData(res.data || []);
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
      namaKelas: item.namaKelas || "",
      tingkat: item.tingkat || "",
      status: item.status || "AKTIF",
    });

    setIsEdit(true);
    setOpenForm(true);
    setError("");
    setSuccess("");
  }

  function validateForm() {
    if (!form.namaKelas.trim()) return "Nama kelas wajib diisi.";
    if (!form.tingkat.trim()) return "Tingkat wajib dipilih.";
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

    const res = await api.saveKelas({
      adminPin,
      form: {
        ...form,
        namaKelas: form.namaKelas.trim().toUpperCase(),
        tingkat: form.tingkat.trim().toUpperCase(),
      },
    });

    setLoadingSave(false);

    if (!res.success) {
      toast.error(res.message || "Gagal menyimpan data kelas.");
      return;
    }

    toast.success(res.message || "Data kelas berhasil disimpan.");
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

    const res = await api.deleteKelas({
      adminPin,
      id,
    });

    setDeletingId("");

    if (!res.success) {
      toast.error(res.message || "Gagal menghapus data kelas.");
      return;
    }

    toast.success(res.message || "Data kelas berhasil dihapus.");
    await loadData();
  }

  function handleLogout() {
    localStorage.removeItem("adminSession");
    window.location.href = "/admin/login";
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AdminLayout
      title="Manajemen Kelas"
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
                className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white shadow-xl shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60"
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
              title="Total Kelas"
              value={data.length}
              icon={<School className="h-7 w-7 text-indigo-600" />}
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
              <h2 className="text-lg font-black text-slate-900">Data Kelas</h2>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                Kelola daftar kelas yang digunakan saat login ujian.
              </p>
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[700px] text-left">
                <thead className="bg-slate-50 text-xs font-black uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Nama Kelas</th>
                    <th className="px-5 py-4">Keterangan</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-sm">
                  {data.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-5 py-10 text-center font-semibold text-slate-400"
                      >
                        Belum ada data kelas.
                      </td>
                    </tr>
                  ) : (
                    data.map((item) => (
                      <tr key={item.id}>
                        <td className="px-5 py-4">
                          <p className="font-black text-slate-900">
                            {item.namaKelas}
                          </p>
                        </td>

                        <td className="px-5 py-4 font-semibold text-slate-500">
                          {item.keterangan || "-"}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={item.status} />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEdit(item)}
                              className="
                      rounded-2xl bg-blue-50 p-3
                      text-blue-700 transition hover:bg-blue-100
                    "
                              title="Edit"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleDelete(item.id)}
                              disabled={deletingId === item.id}
                              className="
                      rounded-2xl bg-red-50 p-3
                      text-red-700 transition hover:bg-red-100
                      disabled:opacity-60
                    "
                              title="Hapus"
                            >
                              {deletingId === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARD */}
            <div className="grid gap-3 p-4 md:hidden">
              {data.length === 0 ? (
                <div className="rounded-3xl bg-slate-50 p-6 text-center text-sm font-bold text-slate-400">
                  Belum ada data kelas.
                </div>
              ) : (
                data.map((item) => (
                  <div
                    key={`${item.id}-mobile`}
                    className="
            rounded-3xl border border-slate-100
            bg-white p-4
            shadow-lg shadow-slate-200/60
          "
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-base font-black text-slate-900">
                          {item.namaKelas}
                        </p>

                        <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                          {item.keterangan || "Tidak ada keterangan"}
                        </p>
                      </div>

                      <StatusBadge status={item.status} />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <MobileInfo
                        label="Status"
                        custom={<StatusBadge status={item.status} />}
                      />

                      <MobileInfo
                        label="Keterangan"
                        value={item.keterangan || "-"}
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="
                flex items-center justify-center gap-2
                rounded-2xl bg-blue-50 px-4 py-3
                text-xs font-black text-blue-700
                transition hover:bg-blue-100
              "
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="
                flex items-center justify-center gap-2
                rounded-2xl bg-red-50 px-4 py-3
                text-xs font-black text-red-700
                transition hover:bg-red-100
                disabled:opacity-60
              "
                      >
                        {deletingId === item.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Hapus...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4" />
                            Hapus
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </PremiumCard>
        </div>

        {openForm && (
          <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-5">
            <div className="flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl sm:max-h-[92vh] sm:rounded-[2rem]">
              {/* HEADER */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-6 sm:py-5">
                <div>
                  <h2 className="text-lg font-black text-slate-900 sm:text-xl">
                    {isEdit ? "Edit Kelas" : "Tambah Kelas"}
                  </h2>

                  <p className="mt-1 text-xs font-semibold text-slate-500 sm:text-sm">
                    Isi data kelas dengan benar.
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
                id="class-setting-form"
                onSubmit={handleSave}
                className="flex-1 overflow-y-auto p-5 sm:p-6"
              >
                <div className="grid gap-4 sm:gap-5">
                  <Input
                    label="Nama Kelas"
                    icon={<GraduationCap className="h-5 w-5" />}
                    value={form.namaKelas}
                    onChange={(value) =>
                      setForm({ ...form, namaKelas: value.toUpperCase() })
                    }
                    placeholder="Contoh: VII A"
                  />

                  <Select
                    label="Tingkat"
                    icon={<Layers3 className="h-5 w-5" />}
                    value={form.tingkat}
                    onChange={(value) => setForm({ ...form, tingkat: value })}
                    options={tingkatOptions.map((item) => ({
                      label: item,
                      value: item,
                    }))}
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

                  <div className="rounded-3xl bg-indigo-50 p-4">
                    <div className="flex items-start gap-3">
                      <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
                      <p className="text-xs font-semibold leading-5 text-indigo-700">
                        Kelas yang berstatus AKTIF akan tampil otomatis pada
                        dropdown login siswa dan setting ujian.
                      </p>
                    </div>
                  </div>
                </div>
              </form>

              {/* FOOTER */}
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
                    form="class-setting-form"
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

function Select({ label, value, onChange, options = [], icon = null }) {
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

        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full rounded-2xl border border-slate-200 bg-white
            py-3.5 text-sm font-bold text-slate-800 outline-none transition
            focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100
            ${icon ? "pl-12 pr-4" : "px-4"}
          `}
        >
          <option value="">Pilih</option>

          {options.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
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
