import { KeyRound, LockKeyhole } from "lucide-react";

export default function TokenInput({
  value,
  onChange,
  disabled = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-slate-700">
        Token Ujian
      </label>

      <div className="relative">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
          <KeyRound className="h-5 w-5 text-slate-400" />
        </div>

        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder="Contoh: UJIAN123"
          autoComplete="off"
          spellCheck={false}
          className="
            w-full rounded-2xl border border-slate-200
            bg-white py-3.5 pl-12 pr-12 text-sm font-black uppercase
            tracking-widest text-slate-800 outline-none transition
            placeholder:tracking-normal placeholder:text-slate-400
            focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100
            disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400
          "
        />

        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
          <LockKeyhole className="h-5 w-5 text-indigo-400" />
        </div>
      </div>
    </div>
  );
}