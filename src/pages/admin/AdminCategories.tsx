import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
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
import {
  AdminHeader,
  ConfirmDelete,
  ImageField,
  PrimaryButton,
  SecondaryButton,
  TextField,
  TextareaField,
} from "@/components/admin/FormFields";
import { useUndoRedo } from "@/hooks/useEditHistory";
import {
  createCategory,
  deleteCategory,
  fetchAdminCategories,
  reorderCategories,
  updateCategory,
} from "@/lib/adminApi";
import { ADMIN_QUERY, invalidateContent } from "@/lib/adminQueries";
import type { CategoryData } from "@/lib/api";

const blank = { slug: "", label: "", description: "", hero_image: "" };

/**
 * Categories — the sections of the slate.
 *
 * A row here does three jobs at once: it filters the projects table, it
 * becomes a live page at /<slug>, and it fills the Category dropdown in the
 * project editor. Adding "Documentary" here is the whole job; nothing needs to
 * be built.
 *
 * There is deliberately no publish switch. A category shows up in the site's
 * navigation once it holds published work and disappears when it doesn't, so
 * the thing that decides visibility is the work itself.
 */
const AdminCategories = () => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<CategoryData | "new" | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown>>(blank);
  const [deleteTarget, setDeleteTarget] = useState<CategoryData | null>(null);
  const [ordered, setOrdered] = useState<CategoryData[]>([]);
  const { reset: resetHistory } = useUndoRedo(draft, setDraft);

  const { data: categories = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["adminCategories"],
    queryFn: fetchAdminCategories,
    ...ADMIN_QUERY,
  });

  useEffect(() => setOrdered(categories), [categories]);

  const invalidate = () => invalidateContent(queryClient);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const saveMutation = useMutation({
    mutationFn: () =>
      editing === "new"
        ? createCategory(draft as Partial<CategoryData>)
        : updateCategory((editing as CategoryData).id, draft as Partial<CategoryData>),
    onSuccess: () => {
      invalidate();
      setEditing(null);
      toast.success("Category saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      invalidate();
      setDeleteTarget(null);
      toast.success("Category deleted");
    },
    // The server refuses to delete a category that still holds projects, so
    // the reason arrives here as a readable sentence rather than a 500.
    onError: (error: Error) => {
      toast.error(error.message);
      setDeleteTarget(null);
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ordered.findIndex((item) => item.id === active.id);
    const newIndex = ordered.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(ordered, oldIndex, newIndex);
    setOrdered(next);
    reorderCategories(next.map((item, index) => ({ id: item.id, sort_order: index + 1 })))
      .then(() => {
        invalidate();
        toast.success("Reordered");
      })
      .catch((error: Error) => toast.error(error.message));
  };

  const openEditor = (category: CategoryData | "new") => {
    const next = category === "new" ? { ...blank } : { ...category };
    setEditing(category);
    setDraft(next);
    resetHistory(next);
  };

  const setField = (key: string, value: unknown) => setDraft((prev) => ({ ...prev, [key]: value }));

  if (editing !== null) {
    const isNew = editing === "new";
    const current = isNew ? null : (editing as CategoryData);

    return (
      <div>
        <AdminHeader
          title={isNew ? "New Category" : `Edit ${current?.label}`}
          description="The slug is the page address and the value stored on every project in this section."
        >
          <SecondaryButton onClick={() => setEditing(null)}>Back</SecondaryButton>
          <PrimaryButton onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving…" : "Save"}
          </PrimaryButton>
        </AdminHeader>

        <div className="max-w-2xl space-y-6">
          <section className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <TextField
                label="Label"
                value={String(draft.label || "")}
                onChange={(value) => setField("label", value)}
                placeholder="Documentary"
              />
              <TextField
                label="URL"
                value={String(draft.slug || "")}
                onChange={(value) => setField("slug", value)}
                placeholder="documentary"
                hint={
                  isNew
                    ? "Leave blank to build it from the label."
                    : "Renaming this moves the page and updates every project in it."
                }
              />
            </div>
            <TextareaField
              label="Description"
              rows={3}
              value={String(draft.description || "")}
              onChange={(value) => setField("description", value)}
              hint="Shown under the heading on the category page."
            />
            <ImageField
              label="Hero image"
              value={String(draft.hero_image || "")}
              onChange={(value) => setField("hero_image", value)}
              hint="Optional. A wide still that sits under the heading."
            />
          </section>

          {current && (
            <p className="text-[11px] text-white/25">
              {current.project_count || 0} published project
              {current.project_count === 1 ? "" : "s"} in this section ·{" "}
              <Link to={`/admin/projects?category=${current.slug}`} className="text-white/45 hover:text-white/70">
                Manage them →
              </Link>
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader
        title="Categories"
        description="Sections of the slate. Each is a page at its own address and an option in the project editor. A section joins the site's navigation once it holds published work."
      >
        <PrimaryButton onClick={() => openEditor("new")}>+ New Category</PrimaryButton>
      </AdminHeader>

      {isLoading ? (
        <div className="text-center py-20">
          <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin mx-auto" />
        </div>
      ) : isError ? (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-6 py-12 text-center">
          <p className="text-sm text-white/40">Couldn't load categories.</p>
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
          <p className="text-sm text-white/30">No categories yet</p>
          <button
            type="button"
            onClick={() => openEditor("new")}
            className="mt-3 text-[11px] tracking-[0.15em] uppercase text-white/45 hover:text-white/70 cursor-pointer"
          >
            Create the first one →
          </button>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden max-w-3xl">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={ordered.map((item) => item.id)} strategy={verticalListSortingStrategy}>
              <div className="divide-y divide-white/[0.04]">
                {ordered.map((category, index) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    index={index}
                    onEdit={() => openEditor(category)}
                    onDelete={() => setDeleteTarget(category)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      <ConfirmDelete
        open={deleteTarget !== null}
        title="Delete category"
        body={
          (deleteTarget?.project_count || 0) > 0
            ? `${deleteTarget?.label} still holds ${deleteTarget?.project_count} project(s). Move them to another section first — deleting will be refused.`
            : "This removes the section and its page. To take it off the site but keep it, hide it instead."
        }
        onConfirm={() => deleteMutation.mutate(deleteTarget!.id)}
        onCancel={() => setDeleteTarget(null)}
        pending={deleteMutation.isPending}
      />
    </div>
  );
};

const CategoryRow = ({
  category,
  index,
  onEdit,
  onDelete,
}: {
  category: CategoryData;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-4 px-5 py-4 group transition-colors ${
        isDragging ? "bg-white/[0.04]" : ""
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-white/25 hover:text-white/70 cursor-grab active:cursor-grabbing select-none text-base shrink-0"
        aria-label="Drag to reorder"
      >
        ≡
      </button>
      <span className="text-[11px] text-white/20 tabular-nums w-5 text-center shrink-0">
        {String(index + 1).padStart(2, "0")}
      </span>

      <button type="button" onClick={onEdit} className="flex-1 min-w-0 text-left cursor-pointer">
        <p className="text-[15px] text-white/70 truncate group-hover:text-white/90 transition-colors">
          {category.label}
        </p>
        <p className="text-[11px] text-white/25 mt-0.5 truncate">
          /{category.slug} · {category.project_count || 0} project
          {category.project_count === 1 ? "" : "s"}
        </p>
      </button>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[9px] tracking-[0.18em] uppercase text-white/25 hidden sm:inline">
          {(category.project_count || 0) > 0 ? "In navigation" : "Hidden — no work yet"}
        </span>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onEdit}
            className="px-3 py-1.5 bg-white/[0.06] rounded-md text-[10px] tracking-wider uppercase text-white/40 hover:text-white/70 hover:bg-white/[0.1] transition-colors cursor-pointer"
          >
            Edit
          </button>
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

export default AdminCategories;
