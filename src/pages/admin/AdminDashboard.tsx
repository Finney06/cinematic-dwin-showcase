import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FileText, FolderKanban, Newspaper } from "lucide-react";
import { AdminHeader } from "@/components/admin/FormFields";
import { ADMIN_QUERY } from "@/lib/adminQueries";
import { fetchAdminArticles, fetchAdminProjects, fetchMessages } from "@/lib/adminApi";

/** The three things Dwindik actually starts a session to do. */
const ACTIONS = [
  {
    label: "Add a project",
    hint: "A new film or music video for the slate",
    to: "/admin/projects/new",
    icon: FolderKanban,
  },
  {
    label: "Write a journal entry",
    hint: "Behind the scenes, studio news, process",
    to: "/admin/journal",
    icon: Newspaper,
  },
  {
    label: "Edit a page",
    hint: "Headings, copy and images on any page",
    to: "/admin/pages",
    icon: FileText,
  },
];

/**
 * The dashboard answers two questions and stops: is anything waiting for me,
 * and what do I want to do?
 *
 * It deliberately doesn't tally every table or log every keystroke. Counts that
 * nobody acts on are noise, and a change log is only ever read after something
 * has gone wrong — which the two-step deletes and draft states are there to
 * prevent in the first place.
 */
const AdminDashboard = () => {
  const messages = useQuery({ queryKey: ["adminMessages"], queryFn: fetchMessages, ...ADMIN_QUERY });
  const projects = useQuery({
    queryKey: ["adminProjects", ""],
    queryFn: () => fetchAdminProjects(),
    ...ADMIN_QUERY,
  });
  const articles = useQuery({
    queryKey: ["adminCollection", "journal"],
    queryFn: fetchAdminArticles,
    ...ADMIN_QUERY,
  });

  const unread = messages.data?.unread || 0;
  const drafts = [
    ...(projects.data || [])
      .filter((project) => !project.published)
      .map((project) => ({
        key: `project-${project.id}`,
        title: project.title,
        note: project.category_label,
        to: `/admin/projects/${project.id}/edit`,
      })),
    ...(articles.data || [])
      .filter((article) => !article.published)
      .map((article) => ({
        key: `article-${article.id}`,
        title: article.title || "Untitled entry",
        note: article.kicker || "Journal",
        to: "/admin/journal",
      })),
  ];

  const recent = [...(projects.data || [])]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 4);

  return (
    <div>
      <AdminHeader title="CRA8" description="Everything on the site is managed from here." />

      {/* ─── Waiting on you ─── */}
      {unread > 0 && (
        <Link
          to="/admin/messages"
          className="flex items-center justify-between gap-4 mb-4 bg-emerald-400/[0.06] border border-emerald-400/20 rounded-xl px-5 py-4 hover:bg-emerald-400/[0.1] transition-colors"
        >
          <p className="text-sm text-emerald-200/80">
            {unread} unread {unread === 1 ? "enquiry" : "enquiries"} from the Contact page
          </p>
          <span className="text-[10px] tracking-[0.2em] uppercase text-emerald-200/50 shrink-0">Read →</span>
        </Link>
      )}

      {drafts.length > 0 && (
        <div className="mb-10 bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
          <p className="px-5 pt-4 pb-3 text-[10px] tracking-[0.2em] uppercase text-white/30">
            {drafts.length} unfinished {drafts.length === 1 ? "draft" : "drafts"} — not visible on the site
          </p>
          <div className="divide-y divide-white/[0.04]">
            {drafts.slice(0, 4).map((draft) => (
              <Link
                key={draft.key}
                to={draft.to}
                className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors group"
              >
                <span className="text-sm text-white/60 group-hover:text-white/85 transition-colors truncate">
                  {draft.title}
                </span>
                <span className="text-[10px] tracking-wider uppercase text-white/20 shrink-0">
                  {draft.note}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ─── Start something ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.to}
              to={action.to}
              className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.14] hover:bg-white/[0.04] transition-colors group"
            >
              <Icon className="h-4 w-4 text-white/30 group-hover:text-white/60 transition-colors" />
              <p className="mt-4 text-[15px] text-white/75 group-hover:text-white/95 transition-colors">
                {action.label}
              </p>
              <p className="mt-1 text-[11px] text-white/25 leading-relaxed">{action.hint}</p>
            </Link>
          );
        })}
      </div>

      {/* ─── Pick up where you left off ─── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs tracking-[0.15em] uppercase text-white/25 font-medium">Recently edited</h2>
          <Link
            to="/admin/projects"
            className="text-[10px] tracking-[0.15em] uppercase text-white/20 hover:text-white/50 transition-colors"
          >
            All projects →
          </Link>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
          {projects.isLoading ? (
            <div className="px-5 py-8 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-11 bg-white/[0.03] rounded animate-pulse" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-xs text-white/20">Nothing on the slate yet</p>
              <Link
                to="/admin/projects/new"
                className="inline-block mt-3 text-[10px] tracking-[0.18em] uppercase text-white/35 hover:text-white/55"
              >
                Add the first project →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {recent.map((project) => (
                <Link
                  key={project.id}
                  to={`/admin/projects/${project.id}/edit`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
                >
                  {project.thumbnail ? (
                    <img src={project.thumbnail} alt="" className="w-12 h-8 rounded object-cover bg-white/5" />
                  ) : (
                    <div className="w-12 h-8 rounded bg-white/[0.04]" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/60 truncate group-hover:text-white/85 transition-colors">
                      {project.featured ? <span className="text-amber-300/70 mr-1.5">★</span> : null}
                      {project.title}
                    </p>
                    <p className="text-[10px] text-white/20 mt-0.5">
                      {project.category_label} · {project.year}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] tracking-wider uppercase shrink-0 ${
                      project.published ? "text-emerald-300/40" : "text-white/20"
                    }`}
                  >
                    {project.published ? "Live" : "Draft"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
