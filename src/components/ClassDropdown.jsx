import { ChevronDown, GraduationCap } from "lucide-react";

export default function ClassDropdown({
  value,
  onChange,
  options = [],
  disabled = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-700">
        Kelas
      </label>

      <div className="relative">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
          <GraduationCap className="h-5 w-5 text-slate-400" />
        </div>

        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="
            w-full appearance-none rounded-2xl border border-slate-200
            bg-white py-3.5 pl-12 pr-12 text-sm font-bold text-slate-800
            outline-none transition
            focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100
            disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400
          "
        >
          <option value="">Pilih kelas</option>

          {options.map((item) => (
            <option key={item.id} value={item.namaKelas}>
              {item.namaKelas}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
          <ChevronDown className="h-5 w-5 text-slate-400" />
        </div>
      </div>
    </div>
  );
}
