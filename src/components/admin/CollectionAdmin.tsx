import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  PairListField,
  PrimaryButton,
  SecondaryButton,
  StringListField,
  TextField,
  TextareaField,
  Toggle,
} from "@/components/admin/FormFields";
import BlockListEditor from "@/components/admin/BlockListEditor";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { useUndoRedo } from "@/hooks/useEditHistory";
import {
  createCollectionItem,
  deleteCollectionItem,
  fetchCollection,
  reorderCollection,
  updateCollectionItem,
} from "@/lib/adminApi";
import { ADMIN_QUERY, invalidateContent } from "@/lib/adminQueries";
import type { PageBlock } from "@/lib/pageBlocks";

type CollectionName = "journal" | "services" | "team";

export interface CollectionField {
  key: string;
  label: string;
  type: "text" | "textarea" | "image" | "date" | "blocks" | "strings" | "pairs" | "toggle";
  hint?: string;
  placeholder?: string;
  rows?: number;
  /** Half-width on wide screens, for fields that pair up naturally. */
  half?: boolean;
  /** `strings` fields: render each row as an image picker. */
  asImages?: boolean;
  /** `pairs` fields. */
  keyName?: string;
  valueName?: string;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  addLabel?: string;
}

interface CollectionRecord {
  id: number;
  slug: string;
  sort_order: number;
  published: number;
  [key: string]: unknown;
}

interface CollectionAdminProps {
  collection: CollectionName;
  /** Screen title, e.g. "Journal". */
  title: string;
  description: string;
  /** What one row is called, e.g. "Entry". */
  singular: string;
  /** Field holding the row's display name — "title" or "name". */
  titleKey: string;
  /** Optional second line in the list, e.g. "kicker" or "role". */
  subtitleKey?: string;
  /** Optional thumbnail in the list. */
  imageKey?: string;
  fields: CollectionField[];
  /** A brand-new record, before the editor touches it. */
  blank: Record<string, unknown>;
  /** Public URL for a saved row, so the editor can offer "View live". */
  publicPath?: (item: CollectionRecord) => string;
  /** New rows start unpublished for editorial content, published for lists. */
  publishHint?: string;
  /**
   * Whether these records have a draft state.
   *
   * Only content that gets written over time needs one. A service or a team
   * member is live the moment it's saved — offering a publish switch there just
   * adds a step that can be forgotten, and a way for the page to look broken.
   */
  publishable?: boolean;
}

/**
 * One admin screen for any ordered, publishable list — Journal, Services and
 * Team all run on this. Give it a field schema and it provides the list with
 * drag-to-reorder and publish toggles, the editor, create, and a two-step
 * delete, all wired to the shared collection API.
 *
 * Adding a new collection later is a schema plus a route, not a new screen.
 */
const CollectionAdmin = ({
  collection,
  title,
  description,
  singular,
  titleKey,
  subtitleKey,
  imageKey,
  fields,
  blank,
  publicPath,
  publishHint,
  publishable = true,
}: CollectionAdminProps) => {
  const queryClient = useQueryClient();
  const queryKey = ["adminCollection", collection];
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown>>(blank);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [ordered, setOrdered] = useState<CollectionRecord[]>([]);
  const savedRef = useRef("");

  const { data: items = [], isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchCollection<CollectionRecord>(collection),
    ...ADMIN_QUERY,
  });

  useEffect(() => setOrdered(items), [items]);

  const editing = editingId === "new" ? null : items.find((item) => item.id === editingId);

  // Load the selected row into the draft once, then leave the editor alone so
  // a background refetch can't overwrite what's being typed.
  useEffect(() => {
    if (editingId === null) return;
    const next = editingId === "new" ? { ...blank } : { ...(editing || {}) };
    setDraft(next);
    savedRef.current = JSON.stringify(next);
    resetHistory(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId]);

  const isDirty = editingId !== null && savedRef.current !== JSON.stringify(draft);
  useUnsavedChanges(isDirty);
  const { reset: resetHistory } = useUndoRedo(draft, setDraft);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const invalidate = () => invalidateContent(queryClient);

  const saveMutation = useMutation({
    mutationFn: () =>
      editingId === "new"
        ? createCollectionItem<CollectionRecord>(collection, draft)
        : updateCollectionItem<CollectionRecord>(collection, editingId as number, draft),
    onSuccess: (saved) => {
      invalidate();
      savedRef.current = JSON.stringify(draft);
      resetHistory(draft);
      setEditingId(saved.id);
      toast.success(`${singular} saved`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, published }: { id: number; published: boolean }) =>
      updateCollectionItem<CollectionRecord>(collection, id, { published: published ? 1 : 0 }),
    onSuccess: (_, variables) => {
      invalidate();
      toast.success(variables.published ? "Published" : "Unpublished — hidden from the site");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCollectionItem(collection, id),
    onSuccess: () => {
      invalidate();
      setDeleteId(null);
      setEditingId(null);
      toast.success(`${singular} deleted`);
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
    reorderCollection(
      collection,
      next.map((item, index) => ({ id: item.id, sort_order: index + 1 }))
    )
      .then(() => {
        invalidate();
        toast.success("Reordered");
      })
      .catch((error: Error) => toast.error(error.message));
  };

  const setField = (key: string, value: unknown) => setDraft((prev) => ({ ...prev, [key]: value }));

  const displayName = (item: CollectionRecord) =>
    String(item[titleKey] || "").trim() || `Untitled ${singular.toLowerCase()}`;

  // ─── Editor ────────────────────────────────────────────────
  if (editingId !== null) {
    const livePath = editing && publicPath ? publicPath(editing) : "";

    return (
      <div>
        <AdminHeader
          title={editingId === "new" ? `New ${singular}` : `Edit ${singular}`}
          description={
            publishable && !draft.published
              ? "This is a draft — invisible to visitors until you publish it. Its address shows “not found” until then."
              : undefined
          }
        >
          <SecondaryButton onClick={() => setEditingId(null)}>
            {isDirty ? "Discard" : "Back"}
          </SecondaryButton>
          <PrimaryButton onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving…" : "Save"}
          </PrimaryButton>
        </AdminHeader>

        <div className="max-w-2xl space-y-6">
          {(publishable || livePath) && (
            <section className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
              {publishable ? (
                <Toggle
                  checked={Boolean(draft.published)}
                  onChange={(checked) => setField("published", checked ? 1 : 0)}
                  label={draft.published ? "Published" : "Draft"}
                  hint={publishHint || "Save after changing this."}
                />
              ) : (
                <p className="text-[11px] text-white/30">Saved changes go live immediately.</p>
              )}
              {livePath && (
                <a
                  href={livePath}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] tracking-[0.15em] uppercase text-white/35 hover:text-white/70 transition-colors"
                >
                  {livePath} — View live →
                </a>
              )}
            </section>
          )}

          <section className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {fields
                .filter((field) => field.half)
                .map((field) => (
                  <FieldRenderer key={field.key} field={field} draft={draft} setField={setField} />
                ))}
            </div>
            {fields
              .filter((field) => !field.half)
              .map((field) => (
                <FieldRenderer key={field.key} field={field} draft={draft} setField={setField} />
              ))}
          </section>

          {editingId !== "new" && (
            <button
              type="button"
              onClick={() => setDeleteId(editingId as number)}
              className="text-[10px] tracking-[0.15em] uppercase text-red-400/50 hover:text-red-400/80 transition-colors cursor-pointer"
            >
              Delete this {singular.toLowerCase()}
            </button>
          )}
        </div>

        <ConfirmDelete
          open={deleteId !== null}
          title={`Delete ${singular.toLowerCase()}`}
          body="This removes it permanently. To take it off the site but keep it, unpublish instead."
          onConfirm={() => deleteMutation.mutate(deleteId as number)}
          onCancel={() => setDeleteId(null)}
          pending={deleteMutation.isPending}
        />
      </div>
    );
  }

  // ─── List ──────────────────────────────────────────────────
  return (
    <div>
      <AdminHeader title={title} description={description}>
        <PrimaryButton onClick={() => setEditingId("new")}>+ New {singular}</PrimaryButton>
      </AdminHeader>

      {isLoading ? (
        <div className="text-center py-20">
          <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin mx-auto" />
        </div>
      ) : isError ? (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-6 py-12 text-center">
          <p className="text-sm text-white/40">Couldn't load this list.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 text-[11px] tracking-[0.15em] uppercase text-white/45 hover:text-white/70 transition-colors cursor-pointer"
          >
            Try again
          </button>
        </div>
      ) : ordered.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-6 py-14 text-center">
          <p className="text-sm text-white/30">No {title.toLowerCase()} yet</p>
          <button
            type="button"
            onClick={() => setEditingId("new")}
            className="mt-3 text-[11px] tracking-[0.15em] uppercase text-white/45 hover:text-white/70 transition-colors cursor-pointer"
          >
            Create the first one →
          </button>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden max-w-3xl">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={ordered.map((item) => item.id)} strategy={verticalListSortingStrategy}>
              <div className="divide-y divide-white/[0.04]">
                {ordered.map((item, index) => (
                  <SortableRow
                    key={item.id}
                    item={item}
                    index={index}
                    name={displayName(item)}
                    subtitle={subtitleKey ? String(item[subtitleKey] || "") : ""}
                    image={imageKey ? String(item[imageKey] || "") : ""}
                    publishable={publishable}
                    onEdit={() => setEditingId(item.id)}
                    onDelete={() => setDeleteId(item.id)}
                    onTogglePublish={() =>
                      publishMutation.mutate({ id: item.id, published: !item.published })
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      <ConfirmDelete
        open={deleteId !== null}
        title={`Delete ${singular.toLowerCase()}`}
        body="This removes it permanently. To take it off the site but keep it, unpublish instead."
        onConfirm={() => deleteMutation.mutate(deleteId as number)}
        onCancel={() => setDeleteId(null)}
        pending={deleteMutation.isPending}
      />
    </div>
  );
};

const SortableRow = ({
  item,
  index,
  name,
  subtitle,
  image,
  publishable,
  onEdit,
  onDelete,
  onTogglePublish,
}: {
  item: CollectionRecord;
  index: number;
  name: string;
  subtitle: string;
  image: string;
  publishable: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-4 px-5 py-4 group transition-colors ${
        !publishable || item.published ? "" : "opacity-50"
      } ${isDragging ? "bg-white/[0.04]" : ""}`}
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

      {image ? (
        <img src={image} alt="" className="w-14 h-10 rounded object-cover bg-white/5 shrink-0" />
      ) : null}

      <button type="button" onClick={onEdit} className="flex-1 min-w-0 text-left cursor-pointer">
        <p className="text-[15px] text-white/70 truncate group-hover:text-white/90 transition-colors">
          {name}
        </p>
        <p className="text-[11px] text-white/25 mt-0.5 truncate">
          {[subtitle, `/${item.slug}`].filter(Boolean).join(" · ")}
        </p>
      </button>

      <div className="flex items-center gap-3 shrink-0">
        {publishable && (
          <>
            <span
              className={`text-[9px] tracking-[0.18em] uppercase ${
                item.published ? "text-emerald-300/50" : "text-white/25"
              }`}
            >
              {item.published ? "Live" : "Draft"}
            </span>
            <button
              type="button"
              onClick={onTogglePublish}
              className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${
                item.published ? "bg-emerald-400/25" : "bg-white/[0.06]"
              }`}
              aria-label={item.published ? "Unpublish" : "Publish"}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                  item.published ? "left-[22px] bg-emerald-300/70" : "left-0.5 bg-white/20"
                }`}
              />
            </button>
          </>
        )}
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

const FieldRenderer = ({
  field,
  draft,
  setField,
}: {
  field: CollectionField;
  draft: Record<string, unknown>;
  setField: (key: string, value: unknown) => void;
}) => {
  const value = draft[field.key];

  switch (field.type) {
    case "textarea":
      return (
        <TextareaField
          label={field.label}
          hint={field.hint}
          placeholder={field.placeholder}
          rows={field.rows}
          value={String(value || "")}
          onChange={(next) => setField(field.key, next)}
        />
      );
    case "image":
      return (
        <ImageField
          label={field.label}
          hint={field.hint}
          value={String(value || "")}
          onChange={(next) => setField(field.key, next)}
        />
      );
    case "date":
      return (
        <TextField
          label={field.label}
          hint={field.hint}
          type="date"
          value={String(value || "").slice(0, 10)}
          onChange={(next) => setField(field.key, next)}
        />
      );
    case "blocks":
      return (
        <BlockListEditor
          label={field.label}
          blocks={(Array.isArray(value) ? value : []) as PageBlock[]}
          onChange={(blocks) => setField(field.key, blocks)}
        />
      );
    case "strings":
      return (
        <StringListField
          label={field.label}
          hint={field.hint}
          placeholder={field.placeholder}
          addLabel={field.addLabel}
          asImages={field.asImages}
          values={(Array.isArray(value) ? value : []) as string[]}
          onChange={(next) => setField(field.key, next)}
        />
      );
    case "pairs":
      return (
        <PairListField
          label={field.label}
          hint={field.hint}
          keyName={field.keyName || "label"}
          valueName={field.valueName || "url"}
          keyPlaceholder={field.keyPlaceholder}
          valuePlaceholder={field.valuePlaceholder}
          addLabel={field.addLabel}
          values={(Array.isArray(value) ? value : []) as Record<string, string>[]}
          onChange={(next) => setField(field.key, next)}
        />
      );
    case "toggle":
      return (
        <Toggle
          checked={Boolean(value)}
          onChange={(checked) => setField(field.key, checked ? 1 : 0)}
          label={field.label}
          hint={field.hint}
        />
      );
    default:
      return (
        <TextField
          label={field.label}
          hint={field.hint}
          placeholder={field.placeholder}
          value={String(value || "")}
          onChange={(next) => setField(field.key, next)}
        />
      );
  }
};

export default CollectionAdmin;
