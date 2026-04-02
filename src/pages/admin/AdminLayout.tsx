import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearToken } from "@/lib/adminApi";

const navItems = [
  { label: "Dashboard", path: "/admin", icon: "◇" },
  { label: "Projects", path: "/admin/projects", icon: "▸" },
  { label: "About Page", path: "/admin/about", icon: "◎" },
  { label: "Hero", path: "/admin/hero", icon: "⬡" },
  { label: "Menu", path: "/admin/menu", icon: "≡" },
  { label: "Settings", path: "/admin/settings", icon: "⚙" },
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* ─── Sidebar ─── */}
      <aside className="w-56 border-r border-white/[0.06] flex flex-col fixed left-0 top-0 bottom-0 z-50">
        {/* Brand */}
        <div className="px-5 py-6 border-b border-white/[0.06]">
          <Link to="/admin" className="block">
            <h1 className="text-[11px] tracking-[0.35em] uppercase text-white/40 font-medium">
              Dwindik
            </h1>
            <p className="text-[9px] tracking-[0.2em] uppercase text-white/15 mt-1">
              CMS Admin
            </p>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.path === "/admin"
                ? location.pathname === "/admin"
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs tracking-wide transition-all duration-200 group ${
                  isActive
                    ? "bg-white/[0.06] text-white/80"
                    : "text-white/30 hover:text-white/60 hover:bg-white/[0.03]"
                }`}
              >
                <span className={`text-sm ${isActive ? "text-white/50" : "text-white/20 group-hover:text-white/40"}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-white/[0.06] space-y-1">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs tracking-wide text-white/25 hover:text-white/50 hover:bg-white/[0.03] transition-all"
          >
            <span className="text-sm">↗</span>
            View Site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs tracking-wide text-white/25 hover:text-red-400/60 hover:bg-red-500/[0.05] transition-all cursor-pointer"
          >
            <span className="text-sm">⏻</span>
            Logout
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 ml-56 min-h-screen">
        <div className="px-8 py-8 max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
