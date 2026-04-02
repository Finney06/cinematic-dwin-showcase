import { useQuery } from "@tanstack/react-query";
import { fetchProjects, fetchMenuItems } from "@/lib/api";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { data: projects = [] } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: () => fetchProjects(),
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ["admin-menu"],
    queryFn: () => fetchMenuItems(true),
  });

  // Stats
  const categories = [...new Set(projects.map((p) => p.category))];
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  const stats = [
    { label: "Total Projects", value: projects.length, icon: "▸" },
    { label: "Categories", value: categories.length, icon: "◎" },
    { label: "Menu Items", value: menuItems.length, icon: "≡" },
    { label: "Visible Pages", value: menuItems.filter((m) => m.visible).length, icon: "◇" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl tracking-[0.06em] text-white/80 font-light">
          Dashboard
        </h1>
        <p className="text-xs text-white/25 tracking-wide mt-1">
          Overview of your portfolio content
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.1] transition-colors"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-white/15 text-sm">{stat.icon}</span>
              <span className="text-[10px] tracking-[0.15em] uppercase text-white/25">
                {stat.label}
              </span>
            </div>
            <p className="text-2xl text-white/70 font-light">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="text-xs tracking-[0.15em] uppercase text-white/25 font-medium mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/projects/new"
            className="inline-flex items-center gap-2 bg-white/90 text-black px-4 py-2.5 rounded-lg text-xs tracking-[0.1em] uppercase font-medium hover:bg-white transition-colors"
          >
            <span>+</span> New Project
          </Link>
          <Link
            to="/admin/about"
            className="inline-flex items-center gap-2 bg-white/[0.06] text-white/50 px-4 py-2.5 rounded-lg text-xs tracking-[0.1em] uppercase hover:bg-white/[0.1] hover:text-white/70 transition-colors"
          >
            Edit About Page
          </Link>
          <Link
            to="/admin/hero"
            className="inline-flex items-center gap-2 bg-white/[0.06] text-white/50 px-4 py-2.5 rounded-lg text-xs tracking-[0.1em] uppercase hover:bg-white/[0.1] hover:text-white/70 transition-colors"
          >
            Edit Hero
          </Link>
          <Link
            to="/admin/menu"
            className="inline-flex items-center gap-2 bg-white/[0.06] text-white/50 px-4 py-2.5 rounded-lg text-xs tracking-[0.1em] uppercase hover:bg-white/[0.1] hover:text-white/70 transition-colors"
          >
            Manage Menu
          </Link>
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs tracking-[0.15em] uppercase text-white/25 font-medium">
            Recent Projects
          </h2>
          <Link
            to="/admin/projects"
            className="text-[10px] tracking-[0.15em] uppercase text-white/20 hover:text-white/50 transition-colors"
          >
            View All →
          </Link>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
          {recentProjects.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-xs text-white/20">No projects yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/admin/projects/${project.id}/edit`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
                >
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-12 h-8 rounded object-cover bg-white/5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/60 truncate group-hover:text-white/80 transition-colors">
                      {project.title}
                    </p>
                    <p className="text-[10px] text-white/20 mt-0.5">
                      {project.category_label} · {project.year}
                    </p>
                  </div>
                  <span className="text-[10px] tracking-wider uppercase text-white/15">
                    {project.status || "Draft"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="mt-10">
        <h2 className="text-xs tracking-[0.15em] uppercase text-white/25 font-medium mb-4">
          By Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categories.map((cat) => {
            const count = projects.filter((p) => p.category === cat).length;
            return (
              <Link
                key={cat}
                to={`/admin/projects?category=${cat}`}
                className="bg-white/[0.02] border border-white/[0.06] rounded-lg px-4 py-3 hover:border-white/[0.1] transition-colors group"
              >
                <p className="text-xs text-white/40 capitalize group-hover:text-white/60 transition-colors">
                  {cat}
                </p>
                <p className="text-lg text-white/50 font-light mt-1">{count}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
