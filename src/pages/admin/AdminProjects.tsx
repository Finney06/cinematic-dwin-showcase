import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AdminHeader, ConfirmDelete, inputClass } from "@/components/admin/FormFields";
import {
  deleteProject,
  fetchAdminCategories,
  fetchAdminProjects,
  reorderProjects,
  updateProject,
} from "@/lib/adminApi";
import { ADMIN_QUERY, invalidateContent } from "@/lib/adminQueries";
import type { ProjectData } from "@/lib/api";

/**
 * The slate. Drag-to-reorder is available whenever a search isn't active — the
 * order stored is a single global sort_order, and it's the order the public
 * pages render in, both on Work and within each category.
 */
const AdminProjects = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category") || "";
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ProjectData | null>(null);
  const [ordered, setOrdered] = useState<ProjectData[]>([]);

  const { data: projects = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["adminProjects", categoryFilter],
    queryFn: () => fetchAdminProjects(categoryFilter || undefined),
    ...ADMIN_QUERY,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["adminCategories"],
    queryFn: fetchAdminCategories,
    ...ADMIN_QUERY,
  });

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return projects;
    return projects.filter(
      (project) =>
        project.title.toLowerCase().includes(query) ||
        project.category_label.toLowerCase().includes(query) ||
        project.year.includes(query)
    );
  }, [projects, search]);

  useEffect(() => setOrdered(filtered), [filtered]);

  // Reordering writes a single global sort_order, which is what every public
  // query sorts by — so it works in the "All" view and within a category alike.
  // Search is the only thing that disables it, since a filtered list can't
  // express a complete order.
  const canReorder = !search.trim();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const invalidate = () => invalidateContent(queryClient);

  const publishMutation = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      updateProject(id, { published: published ? 1 : 0 }),
    onSuccess: (_, variables) => {
      invalidate();
      toast.success(variables.published ? "Published" : "Unpublished — hidden from the site");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
      toast.success("Project deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ordered.findIndex((item) => item.id === active.id);
    const newIndex = ordered.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(ordered, oldIndex, newIndex);
    setOrdered(next);
    reorderProjects(next.map((item, index) => ({ id: item.id, sort_order: index + 1 })))
      .then(() => {
        invalidate();
        toast.success("Reordered");
      })
      .catch((error: Error) => toast.error(error.message));
  };

  const setCategory = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    if (slug) params.set("category", slug);
    else params.delete("category");
    setSearchParams(params);
  };

  const chip = (isActive: boolean) =>
    `px-3 py-2.5 rounded-lg text-xs tracking-wide transition-colors cursor-pointer ${
      isActive ? "bg-white/[0.08] text-white/60" : "bg-white/[0.03] text-white/25 hover:text-white/50"
    }`;

  const draftCount = projects.filter((project) => !project.published).length;

  return (
    <div>
      <AdminHeader
        title="Projects"
        description={`${projects.length} project${projects.length === 1 ? "" : "s"}${
          draftCount ? ` · ${draftCount} draft` : ""
        }${draftCount > 1 ? "s" : ""}`}
      >
        <Link
          to="/admin/projects/new"
          className="inline-flex items-center gap-2 bg-white/90 text-black px-4 py-2.5 rounded-lg text-xs tracking-[0.1em] uppercase font-medium hover:bg-white transition-colors"
        >
          + New Project
        </Link>
      </AdminHeader>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search projects…"
          className={`${inputClass} flex-1 min-w-[200px] py-2.5`}
        />
        <button type="button" onClick={() => setCategory("")} className={chip(!categoryFilter)}>
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.slug}
            type="button"
            onClick={() => setCategory(category.slug)}
            className={chip(categoryFilter === category.slug)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <p className="text-[11px] text-white/25 mb-6">
        {canReorder
          ? "Drag to set the order projects appear in on the site."
          : "Clear the search to drag projects into order."}{" "}
        The ★ project opens Work and its own section full width.
      </p>

      {isLoading ? (
        <div className="text-center py-20">
          <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin mx-auto" />
        </div>
      ) : isError ? (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-6 py-12 text-center">
          <p className="text-sm text-white/40">Couldn't load projects.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 text-[11px] tracking-[0.15em] uppercase text-white/45 hover:text-white/70 cursor-pointer"
          >
            Try again
          </button>
        </div>
      ) : ordered.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-6 py-14 text-center">
          <p className="text-sm text-white/30">
            {search ? "Nothing matches that search" : "No projects here yet"}
          </p>
          <Link
            to="/admin/projects/new"
            className="inline-block mt-3 text-[11px] tracking-[0.15em] uppercase text-white/45 hover:text-white/70"
          >
            Create a project →
          </Link>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={ordered.map((item) => item.id)} strategy={verticalListSortingStrategy}>
              <div className="divide-y divide-white/[0.04]">
                {ordered.map((project, index) => (
                  <ProjectRow
                    key={project.id}
                    project={project}
                    index={index}
                    canReorder={canReorder}
                    onDelete={() => setDeleteTarget(project)}
                    onTogglePublish={() =>
                      publishMutation.mutate({ id: project.id, published: !project.published })
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      <ConfirmDelete
        open={deleteTarget !== null}
        title="Delete project"
        body={`“${deleteTarget?.title}” will be removed permanently. Unpublish it instead to take it off the site but keep the record.`}
        onConfirm={() => deleteMutation.mutate(deleteTarget!.id)}
        onCancel={() => setDeleteTarget(null)}
        pending={deleteMutation.isPending}
      />
    </div>
  );
};

const ProjectRow = ({
  project,
  index,
  canReorder,
  onDelete,
  onTogglePublish,
}: {
  project: ProjectData;
  index: number;
  canReorder: boolean;
  onDelete: () => void;
  onTogglePublish: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
    disabled: !canReorder,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-4 px-5 py-4 group transition-colors hover:bg-white/[0.02] ${
        project.published ? "" : "opacity-55"
      } ${isDragging ? "bg-white/[0.04]" : ""}`}
    >
      {canReorder ? (
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-white/25 hover:text-white/70 cursor-grab active:cursor-grabbing select-none text-base shrink-0"
          aria-label="Drag to reorder"
        >
          ≡
        </button>
      ) : (
        <span className="text-white/10 select-none text-base shrink-0" aria-hidden>
          ≡
        </span>
      )}
      <span className="text-[11px] text-white/20 tabular-nums w-5 text-center shrink-0">
        {String(index + 1).padStart(2, "0")}
      </span>

      {project.thumbnail ? (
        <img
          src={project.thumbnail}
          alt=""
          className="w-20 h-14 rounded-lg object-cover bg-white/5 shrink-0"
        />
      ) : (
        <div className="w-20 h-14 rounded-lg bg-white/[0.04] shrink-0" />
      )}

      <Link to={`/admin/projects/${project.id}/edit`} className="flex-1 min-w-0">
        <p className="text-[15px] text-white/70 font-medium group-hover:text-white/90 transition-colors truncate">
          {project.featured ? (
            <span title="Featured — opens the Work page" className="text-amber-300/70 mr-1.5">
              ★
            </span>
          ) : null}
          {project.title}
        </p>
        <div className="flex items-center gap-3 mt-1 text-[11px] text-white/25">
          <span className="tracking-wider uppercase">{project.category_label}</span>
          <span className="text-white/10">·</span>
          <span>{project.year}</span>
          {project.status && (
            <>
              <span className="text-white/10">·</span>
              <span className="text-white/20 truncate">{project.status}</span>
            </>
          )}
        </div>
      </Link>

      <div className="flex items-center gap-3 shrink-0">
        <span
          className={`text-[9px] tracking-[0.18em] uppercase ${
            project.published ? "text-emerald-300/50" : "text-white/25"
          }`}
        >
          {project.published ? "Live" : "Draft"}
        </span>
        <button
          type="button"
          onClick={onTogglePublish}
          className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${
            project.published ? "bg-emerald-400/25" : "bg-white/[0.06]"
          }`}
          aria-label={project.published ? "Unpublish" : "Publish"}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
              project.published ? "left-[22px] bg-emerald-300/70" : "left-0.5 bg-white/20"
            }`}
          />
        </button>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            to={`/admin/projects/${project.id}/edit`}
            className="px-3 py-1.5 bg-white/[0.06] rounded-md text-[10px] tracking-wider uppercase text-white/40 hover:text-white/70 hover:bg-white/[0.1] transition-colors"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={onDelete}
            className="px-3 py-1.5 bg-red-500/10 rounded-md text-[10px] tracking-wider uppercase text-red-400/50 hover:text-red-400/80 hover:bg-red-500/20 transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProjects;
