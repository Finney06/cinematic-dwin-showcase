import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearToken } from "@/lib/adminApi";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Info,
  Inbox,
  Layers,
  Newspaper,
  Sparkles,
  Users,
  Wrench,
  Menu as MenuIcon,
  Settings as SettingsIcon,
  ExternalLink,
  LogOut,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchMessages } from "@/lib/adminApi";
import { ADMIN_QUERY } from "@/lib/adminQueries";
import { EditHistoryProvider } from "@/hooks/useEditHistory";
import UndoRedo from "@/components/admin/UndoRedo";

/**
 * The admin's shape mirrors the site's: the things a visitor sees are grouped
 * under Content, everything that shapes the site itself under Structure.
 */
const navSections = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", path: "/admin", icon: LayoutDashboard }],
  },
  {
    title: "Content",
    items: [
      { label: "Projects", path: "/admin/projects", icon: FolderKanban },
      { label: "Journal", path: "/admin/journal", icon: Newspaper },
      { label: "Services", path: "/admin/services", icon: Wrench },
      { label: "Team", path: "/admin/team", icon: Users },
      { label: "About", path: "/admin/about", icon: Info },
      { label: "Hero", path: "/admin/hero", icon: Sparkles },
    ],
  },
  {
    title: "Structure",
    items: [
      { label: "Pages", path: "/admin/pages", icon: FileText },
      { label: "Categories", path: "/admin/categories", icon: Layers },
      { label: "Menu", path: "/admin/menu", icon: MenuIcon },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Messages", path: "/admin/messages", icon: Inbox, badge: "messages" },
      { label: "Settings", path: "/admin/settings", icon: SettingsIcon },
    ],
  },
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Unread enquiries surface in the sidebar so they aren't missed.
  const { data: messages } = useQuery({
    queryKey: ["adminMessages"],
    queryFn: fetchMessages,
    ...ADMIN_QUERY,
    refetchInterval: 5 * 60 * 1000,
  });

  const handleLogout = () => {
    clearToken();
    navigate("/admin/login");
  };

  return (
    <EditHistoryProvider>
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 border-b border-white/[0.06] bg-[#0a0a0a]">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-md bg-white/[0.04] text-white/60 hover:text-white/80"
        >
          <MenuIcon className="h-4 w-4" />
        </button>
        <div className="text-[10px] tracking-[0.35em] uppercase text-white/40">CRA8</div>
        <div className="flex items-center gap-1">
          <UndoRedo />
          <button
            onClick={handleLogout}
            className="p-2 rounded-md bg-white/[0.04] text-white/60 hover:text-white/80"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/60"
        />
      )}

      {/* ─── Sidebar ─── */}
      <aside
        className={`w-64 border-r border-white/[0.06] flex flex-col fixed left-0 top-0 bottom-0 z-50 bg-[#0a0a0a] transition-transform duration-300 md:translate-x-0 md:w-56 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:flex`}
      >
        {/* Brand */}
        <div className="px-5 py-6 border-b border-white/[0.06] flex items-center justify-between">
          <Link to="/admin" className="block">
            <h1 className="text-[11px] tracking-[0.35em] uppercase text-white/40 font-medium">
              CRA8
            </h1>
            <p className="text-[9px] tracking-[0.2em] uppercase text-white/15 mt-1">
              Admin Portal
            </p>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 rounded-md text-white/40 hover:text-white/70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="px-3 text-[9px] tracking-[0.32em] uppercase text-white/15 mb-2">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    item.path === "/admin"
                      ? location.pathname === "/admin"
                      : location.pathname.startsWith(item.path);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs tracking-wide transition-all duration-200 group ${
                        isActive
                          ? "bg-white/[0.06] text-white/80"
                          : "text-white/30 hover:text-white/60 hover:bg-white/[0.03]"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 ${
                          isActive ? "text-white/60" : "text-white/25 group-hover:text-white/50"
                        }`}
                      />
                      <span className="flex-1">{item.label}</span>
                      {"badge" in item && item.badge === "messages" && (messages?.unread || 0) > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-400/15 text-emerald-300/70 text-[9px] tabular-nums">
                          {messages?.unread}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-white/[0.06] space-y-1">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs tracking-wide text-white/25 hover:text-white/50 hover:bg-white/[0.03] transition-all"
          >
            <ExternalLink className="h-4 w-4 text-white/35" />
            View Site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs tracking-wide text-white/25 hover:text-red-400/60 hover:bg-red-500/[0.05] transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4 text-white/35" />
            Logout
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 md:ml-56 min-h-screen">
        <div className="px-5 sm:px-6 md:px-8 py-8 max-w-5xl pt-20 md:pt-8">
          <Outlet />
        </div>
      </main>
    </div>
    </EditHistoryProvider>
  );
};

export default AdminLayout;
