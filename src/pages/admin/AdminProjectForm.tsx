import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMenuItems, fetchProject } from "@/lib/api";
import { createProject, updateProject } from "@/lib/adminApi";
import ImageUpload from "@/components/admin/ImageUpload";
import { toast } from "sonner";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

const getCategoryKeyFromPath = (path: string) =>
  path.replace(/^\//, "").split("/")[0] || path;

interface FormData {
  title: string;
  category: string;
  category_label: string;
  year: string;
  role: string;
  description: string;
  synopsis: string;
  thumbnail: string;
  youtube_id: string;
  director: string;
  producers: string;
  cast_info: string;
  status: string;
}

const emptyForm: FormData = {
  title: "",
  category: "film",
  category_label: "Film",
  year: new Date().getFullYear().toString(),
  role: "",
  description: "",
  synopsis: "",
  thumbnail: "",
  youtube_id: "",
  director: "",
  producers: "",
  cast_info: "",
  status: "",
};

const extractYouTubeId = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace("www.", "");
    if (host === "youtu.be") {
      return url.pathname.replace("/", "").slice(0, 11);
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      const v = url.searchParams.get("v");
      if (v) return v.slice(0, 11);
      const match = url.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (match) return match[1];
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
  const initialFormRef = useRef(JSON.stringify(emptyForm));

  const [form, setForm] = useState<FormData>(emptyForm);

  const { data: existingProject } = useQuery({
    queryKey: ["project", id],
    queryFn: () => fetchProject(id!),
    enabled: isEditing,
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ["adminMenuItems"],
    queryFn: () => fetchMenuItems(true),
  });

  const dynamicCategories = menuItems
    .filter((item) => item.page_type === "category" && item.visible === 1)
    .map((item) => ({
      key: getCategoryKeyFromPath(item.path),
      label: item.label,
    }));

  const categoryOptions = dynamicCategories.length ? dynamicCategories : [];

  useEffect(() => {
    if (existingProject) {
      const next = {
        title: existingProject.title,
        category: existingProject.category,
        category_label: existingProject.category_label,
        year: existingProject.year,
        role: existingProject.role,
        description: existingProject.description,
        synopsis: existingProject.synopsis,
        thumbnail: existingProject.thumbnail,
        youtube_id: existingProject.youtube_id,
        director: existingProject.director,
        producers: existingProject.producers,
        cast_info: existingProject.cast_info,
        status: existingProject.status,
      };
      setForm(next);
      initialFormRef.current = JSON.stringify(next);
    }
  }, [existingProject]);

  useEffect(() => {
    if (isEditing) return;
    if (!categoryOptions.length) return;
    const exists = categoryOptions.some((cat) => cat.key === form.category);
    if (!exists) {
      const first = categoryOptions[0];
      setForm((prev) => ({
        ...prev,
        category: first.key,
        category_label: first.label,
      }));
    }
  }, [categoryOptions, form.category, isEditing]);

  const createMutation = useMutation({
    mutationFn: (data: FormData) => createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      initialFormRef.current = JSON.stringify(form);
      toast.success("Project created!");
      navigate("/admin/projects");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => updateProject(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      initialFormRef.current = JSON.stringify(form);
      toast.success("Project updated!");
      navigate("/admin/projects");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (isEditing) {
      updateMutation.mutate(form);
    } else {
      createMutation.mutate(form);
    }
  };

  const setField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Auto-set category_label when category changes
    if (field === "category") {
      const cat = categoryOptions.find((c) => c.key === value);
      if (cat) {
        setForm((prev) => ({ ...prev, category: value, category_label: cat.label }));
      }
    }
  };

  const ytThumb = form.youtube_id
    ? `https://img.youtube.com/vi/${form.youtube_id}/maxresdefault.jpg`
    : "";

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isDirty = initialFormRef.current !== JSON.stringify(form);
  useUnsavedChanges(isDirty);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/admin/projects")}
          className="text-white/20 hover:text-white/50 transition-colors text-sm cursor-pointer"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-xl tracking-[0.06em] text-white/80 font-light">
            {isEditing ? "Edit Project" : "New Project"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
        {/* Title & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
              Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
              placeholder="Project title"
              required
            />
          </div>
          <div>
            <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
              Category *
            </label>
            <select
              value={form.category}
              onChange={(e) => setField("category", e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 focus:outline-none focus:border-white/20 transition-colors"
              disabled={!categoryOptions.length}
            >
              {!categoryOptions.length && (
                <option value="" className="bg-[#141414] text-white">
                  No categories set — add one in Menu
                </option>
              )}
              {categoryOptions.map((cat) => (
                <option key={cat.key} value={cat.key} className="bg-[#141414] text-white">
                  {cat.label}
                </option>
              ))}
            </select>
            {!categoryOptions.length && (
              <p className="mt-2 text-[10px] text-white/20">
                Go to Menu and create items with type “category” to populate this list.
              </p>
            )}
          </div>
        </div>

        {/* Year & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
              Year *
            </label>
            <input
              type="text"
              value={form.year}
              onChange={(e) => setField("year", e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
              placeholder="2025"
              required
            />
          </div>
          <div>
            <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
              Status
            </label>
            <input
              type="text"
              value={form.status}
              onChange={(e) => setField("status", e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
              placeholder="e.g. Now Streaming, Coming Soon"
            />
          </div>
        </div>

        {/* Role */}
        <div>
          <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
            Role
          </label>
          <input
            type="text"
            value={form.role}
            onChange={(e) => setField("role", e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
            placeholder="e.g. Director of Photography, Editor, VFX"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
            Short Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            rows={3}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors resize-none"
            placeholder="Brief project description..."
          />
        </div>

        {/* Synopsis */}
        <div>
          <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
            Full Synopsis
          </label>
          <textarea
            value={form.synopsis}
            onChange={(e) => setField("synopsis", e.target.value)}
            rows={5}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors resize-none"
            placeholder="Full project synopsis..."
          />
        </div>

        {/* YouTube ID */}
        <div>
          <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
            YouTube Video (ID or link)
          </label>
          <input
            type="text"
            value={form.youtube_id}
            onChange={(e) => setField("youtube_id", extractYouTubeId(e.target.value))}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
            placeholder="Paste a YouTube link or ID"
          />
          <p className="mt-2 text-[10px] text-white/20">
            Example: https://youtu.be/QIoUmnSkOXE or QIoUmnSkOXE
          </p>
          {form.youtube_id && (
            <div className="mt-3 flex items-center gap-3">
              <img
                src={ytThumb}
                alt="YouTube thumbnail"
                className="w-32 h-20 rounded object-cover bg-white/5"
              />
              <div>
                <p className="text-[10px] text-white/25">Thumbnail preview</p>
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
        </div>

        {/* Thumbnail */}
        <ImageUpload
          value={form.thumbnail}
          onChange={(url) => setField("thumbnail", url)}
          label="Thumbnail Image"
        />

        {/* Credits section */}
        <div className="border-t border-white/[0.06] pt-6">
          <h2 className="text-xs tracking-[0.15em] uppercase text-white/25 font-medium mb-5">
            Credits
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                Director
              </label>
              <input
                type="text"
                value={form.director}
                onChange={(e) => setField("director", e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
                placeholder="Director name"
              />
            </div>
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                Producers
              </label>
              <input
                type="text"
                value={form.producers}
                onChange={(e) => setField("producers", e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
                placeholder="Producer name(s)"
              />
            </div>
          </div>
          <div className="mt-5">
            <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
              Cast
            </label>
            <input
              type="text"
              value={form.cast_info}
              onChange={(e) => setField("cast_info", e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
              placeholder="Cast members"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="bg-white/90 text-black px-6 py-3 rounded-lg text-xs tracking-[0.1em] uppercase font-medium hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending
              ? isEditing ? "Saving..." : "Creating..."
              : isEditing ? "Save Changes" : "Create Project"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/projects")}
            className="bg-white/[0.06] text-white/40 px-6 py-3 rounded-lg text-xs tracking-[0.1em] uppercase hover:bg-white/[0.1] hover:text-white/60 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProjectForm;
