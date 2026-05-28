import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Activity,
  BarChart3,
  FileCog,
  GraduationCap,
  LayoutDashboard,
  LockOpen,
  LogOut,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import { APP_CONFIG } from "../utils/config";

const menus = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Setting Ujian",
    path: "/admin/settings",
    icon: FileCog,
  },
  {
    label: "Kelas",
    path: "/admin/classes",
    icon: GraduationCap,
  },
  {
    label: "Monitoring",
    path: "/admin/monitoring",
    icon: Activity,
  },
  {
    label: "Buka Kunci",
    path: "/admin/unlock",
    icon: LockOpen,
  },
];

export default function AdminLayout({
  children,
  title = "Admin ExamBrowser",
  subtitle = "Panel pengelolaan ujian online.",
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem("adminSession");
    window.location.href = "/admin/login";
  }

  return (
    <div className="min-h-screen bg-[#F6F8FF]">
      <div className="pointer-events-none fixed -left-24 top-10 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl" />
      <div className="pointer-events-none fixed -right-24 top-44 h-80 w-80 rounded-full bg-sky-200/60 blur-3xl" />

      {/* MOBILE TOPBAR */}
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/85 px-4 py-3 shadow-sm backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-2xl bg-slate-100 p-3 text-slate-700"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex min-w-0 items-center gap-2">
            {/* <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 p-2 text-white shadow-lg shadow-indigo-100">
              <img
                src={APP_CONFIG.logoUrl}
                alt={APP_CONFIG.schoolName}
                className="h-full w-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div> */}

            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-900">
                {APP_CONFIG.appName}
              </p>
              <p className="truncate text-xs font-bold text-slate-400">
                {APP_CONFIG.schoolShortName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-2xl bg-slate-900 p-3 text-white"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-80 border-r border-white/70
          bg-white/90 shadow-2xl shadow-slate-200/80 backdrop-blur-xl
          transition-transform duration-300 lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-100 px-5 py-5">
            <div className="flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-sky-500 p-2.5 text-white shadow-xl shadow-indigo-200">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-sm">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-base font-black text-slate-950">
                    {APP_CONFIG.appName}
                  </h1>
                  <p className="truncate text-xs font-bold text-slate-400">
                    {APP_CONFIG.schoolShortName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded-2xl bg-slate-100 p-2 text-slate-600 lg:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 rounded-3xl bg-gradient-to-br from-indigo-50 to-sky-50 p-4">
              <div className="flex items-start gap-3">
                <img
                  src={APP_CONFIG.logoUrl}
                  alt={APP_CONFIG.schoolName}
                  className="h-12 w-12 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />

                <div>
                  <p className="text-sm font-black text-slate-900">
                    {APP_CONFIG.schoolName}
                  </p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                    Tahun Pelajaran {APP_CONFIG.academicYear}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
            {menus.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `
                      flex items-center gap-3 rounded-2xl px-4 py-3
                      text-sm font-black transition
                      ${
                        isActive
                          ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }
                    `
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="border-t border-slate-100 p-4">
            <div className="mb-4 rounded-3xl bg-slate-50 p-4">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                <BarChart3 className="h-6 w-6" />
              </div>

              <p className="text-sm font-black text-slate-900">
                Secure Admin Mode
              </p>

              <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                {APP_CONFIG.appTagline}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>

            <p className="mt-4 text-center text-[11px] font-semibold text-slate-400">
              {APP_CONFIG.footerText}
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="relative z-10 lg:pl-80">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-sm font-black text-indigo-700 shadow-lg shadow-indigo-100/70 backdrop-blur">
              <ShieldCheck className="h-4 w-4" />
              {APP_CONFIG.appName} Admin
            </div>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
              {title}
            </h2>

            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
              {subtitle}
            </p>
          </div>

          {children}
        </div>
      </main>
    </div>
  );
}
