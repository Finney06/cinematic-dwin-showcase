import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AdminHeader,
  Field,
  ImageField,
  PairListField,
  PrimaryButton,
  SecondaryButton,
  StringListField,
  TextField,
  TextareaField,
  Toggle,
  inputClass,
} from "@/components/admin/FormFields";
import BlockListEditor from "@/components/admin/BlockListEditor";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { useUndoRedo } from "@/hooks/useEditHistory";
import {
  createProject,
  fetchAdminCategories,
  fetchAdminProject,
  updateProject,
} from "@/lib/adminApi";
import { ADMIN_QUERY, invalidateContent } from "@/lib/adminQueries";
import type { PageBlock } from "@/lib/pageBlocks";
import type { ProjectCredit, ProjectData } from "@/lib/api";

type FormData = Pick<
  ProjectData,
  | "title"
  | "category"
  | "category_label"
  | "year"
  | "role"
  | "description"
  | "synopsis"
  | "logline"
  | "thumbnail"
  | "youtube_id"
  | "trailer_youtube_id"
  | "director"
  | "producers"
  | "cast_info"
  | "status"
  | "seo_description"
> & {
  credits: ProjectCredit[];
  gallery: string[];
  blocks: PageBlock[];
  published: number;
  featured: number;
};

const emptyForm: FormData = {
  title: "",
  category: "",
  category_label: "",
  year: new Date().getFullYear().toString(),
  role: "",
  description: "",
  synopsis: "",
  logline: "",
  thumbnail: "",
  youtube_id: "",
  trailer_youtube_id: "",
  director: "",
  producers: "",
  cast_info: "",
  status: "",
  seo_description: "",
  credits: [],
  gallery: [],
  blocks: [],
  published: 1,
  featured: 0,
};

/** Accepts a full YouTube link in any of its shapes, or a bare ID. */
const extractYouTubeId = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace("www.", "");
    if (host === "youtu.be") return url.pathname.replace("/", "").slice(0, 11);
    if (host === "youtube.com" || host === "m.youtube.com") {
      const v = url.searchParams.get("v");
      if (v) return v.slice(0, 11);
      const shorts = url.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (shorts) return shorts[1];
      const embed = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
      if (embed) return embed[1];
    }
  } catch {
    return trimmed;
  }

  return trimmed;
};

const AdminProjectForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const savedRef = useRef(JSON.stringify(emptyForm));

  const [form, setForm] = useState<FormData>(emptyForm);
  const { reset: resetHistory } = useUndoRedo(form, setForm);

  const { data: existing } = useQuery({
    queryKey: ["adminProject", id],
    queryFn: () => fetchAdminProject(id!),
    ...ADMIN_QUERY,
    enabled: isEditing,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["adminCategories"],
    queryFn: fetchAdminCategories,
    ...ADMIN_QUERY,
  });

  useEffect(() => {
    if (!existing) return;
    const next: FormData = {
      ...emptyForm,
      ...existing,
      credits: Array.isArray(existing.credits) ? existing.credits : [],
      gallery: Array.isArray(existing.gallery) ? existing.gallery : [],
      blocks: Array.isArray(existing.blocks) ? existing.blocks : [],
      published: existing.published ?? 1,
      featured: existing.featured ?? 0,
    };
    setForm(next);
    savedRef.current = JSON.stringify(next);
    resetHistory(next);
  }, [existing, resetHistory]);

  // A new project defaults to the first category rather than an empty value,
  // which the server would reject.
  useEffect(() => {
    if (isEditing || !categories.length || form.category) return;
    const first = categories[0];
    setForm((prev) => ({ ...prev, category: first.slug, category_label: first.label }));
  }, [categories, form.category, isEditing]);

  const save = useMutation({
    mutationFn: (data: FormData) => (isEditing ? updateProject(id!, data) : createProject(data)),
    onSuccess: () => {
      invalidateContent(queryClient);
      savedRef.current = JSON.stringify(form);
      resetHistory(form);
      toast.success(isEditing ? "Project updated" : "Project created");
      navigate("/admin/projects");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setCategory = (slug: string) => {
    const category = categories.find((item) => item.slug === slug);
    setForm((prev) => ({
      ...prev,
      category: slug,
      category_label: category?.label || prev.category_label,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim()) return toast.error("Give the project a title");
    if (!form.category) return toast.error("Choose a category");
    if (!form.year.trim()) return toast.error("Add a year");
    save.mutate(form);
  };

  const isDirty = savedRef.current !== JSON.stringify(form);
  useUnsavedChanges(isDirty);

  const ytThumb = form.youtube_id
    ? `https://img.youtube.com/vi/${form.youtube_id}/maxresdefault.jpg`
    : "";

  return (
    <div>
      <AdminHeader
        title={isEditing ? "Edit Project" : "New Project"}
        description="Everything here appears on the project's own page and in the slate."
      >
        <SecondaryButton onClick={() => navigate("/admin/projects")}>Back</SecondaryButton>
      </AdminHeader>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* ─── Status ─── */}
        <section className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 space-y-5">
          <Toggle
            checked={Boolean(form.published)}
            onChange={(checked) => setField("published", checked ? 1 : 0)}
            label={form.published ? "Published" : "Draft"}
            hint="A draft is invisible on the site — its page shows “not found” to visitors. Save to apply."
          />
          <Toggle
            checked={Boolean(form.featured)}
            onChange={(checked) => setField("featured", checked ? 1 : 0)}
            label="Feature this project"
            hint="Opens the Work page and its own section, full width. Only one project can be featured — turning this on retires the last."
          />
        </section>

        {/* ─── The basics ─── */}
        <section className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 space-y-5">
          <TextField
            label="Title"
            value={form.title}
            onChange={(value) => setField("title", value)}
            placeholder="Prophet Suddenly 4"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field
              label="Category"
              hint={
                categories.length
                  ? "Sections are managed in Categories."
                  : "No categories yet — create one in Categories first."
              }
            >
              <select
                value={form.category}
                onChange={(event) => setCategory(event.target.value)}
                className={inputClass}
                disabled={!categories.length}
              >
                {!categories.length && (
                  <option value="" className="bg-[#141414]">
                    No categories yet
                  </option>
                )}
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug} className="bg-[#141414]">
                    {category.label}
                    {category.published ? "" : " (hidden)"}
                  </option>
                ))}
              </select>
            </Field>
            <TextField label="Year" value={form.year} onChange={(value) => setField("year", value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <TextField
              label="Status"
              value={form.status}
              onChange={(value) => setField("status", value)}
              placeholder="Now Streaming"
            />
            <TextField
              label="CRA8 credits"
              value={form.role}
              onChange={(value) => setField("role", value)}
              placeholder="Director of Photography, Editor, VFX"
              hint="Shown beside the title across the site."
            />
          </div>

          <TextareaField
            label="Logline"
            rows={2}
            value={form.logline}
            onChange={(value) => setField("logline", value)}
            hint="One sentence, set large at the top of the project page."
          />
          <TextareaField
            label="Short description"
            rows={3}
            value={form.description}
            onChange={(value) => setField("description", value)}
            hint="Used wherever there's no room for the full synopsis."
          />
          <TextareaField
            label="Synopsis"
            rows={6}
            value={form.synopsis}
            onChange={(value) => setField("synopsis", value)}
          />
        </section>

        {/* ─── Media ─── */}
        <section className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 space-y-5">
          <h2 className="text-xs tracking-[0.15em] uppercase text-white/35 font-medium">Media</h2>

          <TextField
            label="Full film (YouTube)"
            value={form.youtube_id}
            onChange={(value) => setField("youtube_id", extractYouTubeId(value))}
            placeholder="Paste a YouTube link or ID"
            hint="Shown as an embedded player, and as the 'Watch the full film' link."
          />
          <TextField
            label="Trailer (YouTube)"
            value={form.trailer_youtube_id}
            onChange={(value) => setField("trailer_youtube_id", extractYouTubeId(value))}
            placeholder="Optional — a short trailer only"
            hint="A trailer plays silently behind the title. Leave empty and the still holds the frame instead — never put a full film here."
          />

          {ytThumb && (
            <div className="flex items-center gap-3">
              <img src={ytThumb} alt="" className="w-32 h-20 rounded object-cover bg-white/5" />
              <div>
                <p className="text-[10px] text-white/25">YouTube thumbnail</p>
                <button
                  type="button"
                  onClick={() => setField("thumbnail", ytThumb)}
                  className="text-[10px] text-white/40 hover:text-white/70 transition-colors mt-1 cursor-pointer"
                >
                  Use as thumbnail →
                </button>
              </div>
            </div>
          )}

          <ImageField
            label="Thumbnail"
            value={form.thumbnail}
            onChange={(value) => setField("thumbnail", value)}
            hint="The key image, used across the slate and as the link preview."
          />
          <StringListField
            label="Stills"
            values={form.gallery}
            onChange={(gallery) => setField("gallery", gallery)}
            addLabel="Still"
            asImages
            hint="Optional. Shown as a gallery on the project page."
          />
        </section>

        {/* ─── Credits ─── */}
        <section className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 space-y-5">
          <h2 className="text-xs tracking-[0.15em] uppercase text-white/35 font-medium">Credits</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <TextField
              label="Director"
              value={form.director}
              onChange={(value) => setField("director", value)}
            />
            <TextField
              label="Producers"
              value={form.producers}
              onChange={(value) => setField("producers", value)}
            />
          </div>
          <TextField label="Cast" value={form.cast_info} onChange={(value) => setField("cast_info", value)} />
          <PairListField
            label="Other credits"
            values={form.credits as unknown as Record<string, string>[]}
            onChange={(credits) => setField("credits", credits as unknown as ProjectCredit[])}
            keyName="role"
            valueName="name"
            keyPlaceholder="Colourist"
            valuePlaceholder="Name"
            addLabel="Credit"
            hint="Any role at all — these are listed after the four above."
          />
        </section>

        {/* ─── Extra content ─── */}
        <section className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
          <BlockListEditor
            blocks={form.blocks}
            onChange={(blocks) => setField("blocks", blocks)}
            label="Extra content"
          />
        </section>

        {/* ─── How this project appears when shared ─── */}
        <section className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
          <TextareaField
            label="Preview description"
            rows={2}
            value={form.seo_description}
            onChange={(value) => setField("seo_description", value)}
            hint="What shows up in a Google search result or a shared link. Optional — defaults to the logline, then the short description."
          />
        </section>

        <div className="flex gap-3 pt-2 pb-8">
          <PrimaryButton type="submit" disabled={save.isPending}>
            {save.isPending ? "Saving…" : isEditing ? "Save changes" : "Create project"}
          </PrimaryButton>
          <SecondaryButton onClick={() => navigate("/admin/projects")}>Cancel</SecondaryButton>
        </div>
      </form>
    </div>
  );
};

export default AdminProjectForm;
