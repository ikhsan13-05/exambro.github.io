export default function PremiumCard({
  children,
  className = "",
  hover = false,
}) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-[2rem]
        border border-white/70
        bg-white/90 backdrop-blur-xl
        shadow-2xl shadow-slate-200/80
        ${hover ? "transition duration-300 hover:-translate-y-1 hover:shadow-indigo-100" : ""}
        ${className}
      `}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-44 w-44 rounded-full bg-sky-100/80 blur-3xl" />

      <div className="relative z-10">{children}</div>
    </div>
  );
}