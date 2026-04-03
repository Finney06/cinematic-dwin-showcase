import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProjects } from "@/lib/api";
import { deleteProject } from "@/lib/adminApi";
import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

const AdminProjects = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category") || "";
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["admin-projects", categoryFilter],
    queryFn: () => fetchProjects(categoryFilter || undefined),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      toast.success("Project deleted");
      setDeleteConfirm(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const categories = [...new Set(projects.map((p) => p.category_label))];
  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered
    .sort((a, b) => {
      if (a.category_label !== b.category_label) {
        return a.category_label.localeCompare(b.category_label);
      }
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    })
    .reduce<Record<string, typeof filtered>>((acc, project) => {
      const key = project.category_label || project.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push(project);
      return acc;
    }, {});

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl tracking-[0.05em] text-white/85 font-light">
            Projects
          </h1>
          <p className="text-[13px] text-white/30 tracking-wide mt-1">
            {projects.length} projects total
          </p>
        </div>
        <Link
          to="/admin/projects/new"
          className="inline-flex items-center gap-2 bg-white/90 text-black px-4 py-2.5 rounded-lg text-xs tracking-[0.1em] uppercase font-medium hover:bg-white transition-colors"
        >
          <span>+</span> New Project
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-[14px] text-white/75 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
        />
        <Link
          to="/admin/projects"
          className={`px-3 py-2.5 rounded-lg text-xs tracking-wide transition-colors ${
            !categoryFilter
              ? "bg-white/[0.08] text-white/60"
              : "bg-white/[0.03] text-white/25 hover:text-white/50"
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat}
            to={`/admin/projects?category=${cat.toLowerCase()}`}
            className={`px-3 py-2.5 rounded-lg text-xs tracking-wide transition-colors ${
              categoryFilter === cat.toLowerCase()
                ? "bg-white/[0.08] text-white/60"
                : "bg-white/[0.03] text-white/25 hover:text-white/50"
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* Projects List */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] border border-white/[0.06] rounded-xl">
          <p className="text-[14px] text-white/25">No projects found</p>
          <Link
            to="/admin/projects/new"
            className="inline-block mt-4 text-[12px] text-white/45 hover:text-white/60 transition-colors"
          >
            Create your first project →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, items]) => (
            <div
              key={category}
              className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <h3 className="text-[12px] tracking-[0.18em] uppercase text-white/45">
                    {category}
                  </h3>
                  <span className="text-[11px] text-white/25">{items.length} items</span>
                </div>
                <Link
                  to={`/admin/projects?category=${items[0]?.category}`}
                  className="text-[11px] tracking-[0.15em] uppercase text-white/25 hover:text-white/55 transition-colors"
                >
                  Filter →
                </Link>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {items.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors group"
                  >
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="w-20 h-14 rounded-lg object-cover bg-white/5 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] text-white/70 font-medium group-hover:text-white/85 transition-colors">
                        {project.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[11px] tracking-wider uppercase text-white/25">
                          {project.category_label}
                        </span>
                        <span className="text-white/10">·</span>
                        <span className="text-[11px] text-white/25">{project.year}</span>
                        {project.status && (
                          <>
                            <span className="text-white/10">·</span>
                            <span className="text-[11px] text-white/20">{project.status}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        to={`/admin/projects/${project.id}/edit`}
                        className="px-3 py-1.5 bg-white/[0.06] rounded-md text-[10px] tracking-wider uppercase text-white/40 hover:text-white/70 hover:bg-white/[0.1] transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(project.id)}
                        className="px-3 py-1.5 bg-red-500/10 rounded-md text-[10px] tracking-wider uppercase text-red-400/50 hover:text-red-400/80 hover:bg-red-500/20 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-5">
          <div className="bg-[#141414] border border-white/[0.08] rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-sm text-white/70 font-medium mb-2">Delete Project</h3>
            <p className="text-xs text-white/35 mb-6">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-white/[0.06] rounded-lg text-xs text-white/40 hover:text-white/60 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-500/20 rounded-lg text-xs text-red-400/70 hover:bg-red-500/30 hover:text-red-400 transition-colors disabled:opacity-40 cursor-pointer"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProjects;
