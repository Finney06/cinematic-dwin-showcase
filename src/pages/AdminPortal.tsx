import { FormEvent, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchProjects, removeProject, upsertProject } from "@/lib/project-service";
import { categories, type Project, type ProjectCategory } from "@/lib/projects";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const categoryLabels: Record<ProjectCategory, string> = {
  films: "Film",
  commercials: "Commercial",
  "music-videos": "Music Video",
};

const createEmptyProject = (): Project => ({
  id: "",
  title: "",
  category: "films",
  categoryLabel: categoryLabels.films,
  year: String(new Date().getFullYear()),
  role: "",
  description: "",
  thumbnail: "/placeholder.svg",
  stills: [],
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const AdminPortal = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Project>(createEmptyProject());
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: projects = [],
    isLoading,
    error: loadError,
    refetch,
  } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: fetchProjects,
    staleTime: 30 * 1000,
  });

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedId) ?? null,
    [projects, selectedId],
  );

  useEffect(() => {
    if (selectedProject) {
      setFormData(selectedProject);
      setError(null);
      setStatus(null);
      return;
    }

    setFormData(createEmptyProject());
  }, [selectedProject]);

  const handleSignOut = async () => {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
  };

  const handleCreateNew = () => {
    setSelectedId(null);
    setFormData(createEmptyProject());
    setError(null);
    setStatus("Creating a new project draft.");
  };

  const handleFieldChange = <T extends keyof Project>(field: T, value: Project[T]) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleCategoryChange = (category: ProjectCategory) => {
    setFormData((previous) => ({
      ...previous,
      category,
      categoryLabel: categoryLabels[category],
    }));
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isSupabaseConfigured) {
      setError("Supabase is not configured yet.");
      return;
    }

    const title = formData.title.trim();
    const projectId = formData.id.trim() || slugify(title);

    if (!title) {
      setError("Title is required.");
      return;
    }

    if (!projectId) {
      setError("A valid project ID (slug) is required.");
      return;
    }

    setIsSaving(true);
    setStatus(null);
    setError(null);

    try {
      const saved = await upsertProject({
        ...formData,
        id: projectId,
        title,
        categoryLabel: categoryLabels[formData.category],
      });

      await refetch();
      setSelectedId(saved.id);
      setFormData(saved);
      setStatus(`Saved project "${saved.title}".`);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : "Unable to save project.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProject) {
      return;
    }

    const shouldDelete = window.confirm(`Delete "${selectedProject.title}"? This action cannot be undone.`);

    if (!shouldDelete) {
      return;
    }

    setIsDeleting(true);
    setStatus(null);
    setError(null);

    try {
      await removeProject(selectedProject.id);
      await refetch();
      setSelectedId(null);
      setFormData(createEmptyProject());
      setStatus(`Deleted "${selectedProject.title}".`);
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Unable to delete project.";
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground px-6 md:px-10 py-10">
      <header className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">Dwindik CMS</p>
          <h1 className="font-display text-4xl md:text-5xl font-light tracking-[0.02em]">Projects Admin</h1>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleCreateNew}>New Project</Button>
          <Button variant="secondary" onClick={handleSignOut}>Sign out</Button>
        </div>
      </header>

      {!isSupabaseConfigured && (
        <div className="mb-6 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Supabase is not configured. The admin panel needs VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
        </div>
      )}

      {(error || status || loadError) && (
        <div className="mb-6 space-y-2">
          {status && <p className="text-sm text-emerald-300">{status}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {loadError && <p className="text-sm text-destructive">Failed to load projects. Refresh and try again.</p>}
        </div>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-8">
        <aside className="rounded-xl border border-border bg-card/20 p-4">
          <h2 className="font-body text-[10px] tracking-[0.24em] uppercase text-muted-foreground mb-4">Project List</h2>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading projects...</p>
          ) : projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects yet. Create your first one.</p>
          ) : (
            <div className="space-y-2 max-h-[65vh] overflow-auto pr-1">
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setSelectedId(project.id)}
                  className={`w-full text-left px-3 py-3 rounded-lg border transition-colors ${
                    selectedId === project.id
                      ? "border-foreground/40 bg-foreground/5"
                      : "border-border hover:border-foreground/20"
                  }`}
                >
                  <p className="font-body text-xs tracking-[0.16em] uppercase text-muted-foreground mb-1">
                    {project.categoryLabel} · {project.year}
                  </p>
                  <p className="font-display text-lg leading-tight">{project.title}</p>
                  <p className="font-body text-xs text-muted-foreground mt-1 truncate">/{project.id}</p>
                </button>
              ))}
            </div>
          )}
        </aside>

        <section className="rounded-xl border border-border bg-card/20 p-6">
          <h2 className="font-body text-[10px] tracking-[0.24em] uppercase text-muted-foreground mb-6">
            {selectedProject ? `Editing: ${selectedProject.title}` : "New Project"}
          </h2>

          <form className="space-y-5" onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-body text-[10px] tracking-[0.24em] uppercase text-muted-foreground block mb-2">
                  Title
                </label>
                <Input
                  value={formData.title}
                  onChange={(event) => {
                    const nextTitle = event.target.value;
                    const shouldRegenerateSlug = !selectedProject && (!formData.id || formData.id === slugify(formData.title));

                    setFormData((previous) => ({
                      ...previous,
                      title: nextTitle,
                      id: shouldRegenerateSlug ? slugify(nextTitle) : previous.id,
                    }));
                  }}
                  placeholder="Echoes of Light"
                  required
                />
              </div>

              <div>
                <label className="font-body text-[10px] tracking-[0.24em] uppercase text-muted-foreground block mb-2">
                  Project ID (slug)
                </label>
                <Input
                  value={formData.id}
                  onChange={(event) => handleFieldChange("id", slugify(event.target.value))}
                  placeholder="echoes-of-light"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="font-body text-[10px] tracking-[0.24em] uppercase text-muted-foreground block mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(event) => handleCategoryChange(event.target.value as ProjectCategory)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {categories.map((category) => (
                    <option key={category.key} value={category.key}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-body text-[10px] tracking-[0.24em] uppercase text-muted-foreground block mb-2">Year</label>
                <Input value={formData.year} onChange={(event) => handleFieldChange("year", event.target.value)} />
              </div>

              <div>
                <label className="font-body text-[10px] tracking-[0.24em] uppercase text-muted-foreground block mb-2">Role</label>
                <Input
                  value={formData.role}
                  onChange={(event) => handleFieldChange("role", event.target.value)}
                  placeholder="Director / Cinematographer"
                />
              </div>
            </div>

            <div>
              <label className="font-body text-[10px] tracking-[0.24em] uppercase text-muted-foreground block mb-2">
                Thumbnail URL
              </label>
              <Input
                value={formData.thumbnail}
                onChange={(event) => handleFieldChange("thumbnail", event.target.value)}
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="font-body text-[10px] tracking-[0.24em] uppercase text-muted-foreground block mb-2">
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(event) => handleFieldChange("description", event.target.value)}
                className="min-h-[180px]"
                placeholder="Write a short project description..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button type="submit" disabled={isSaving || isDeleting || !isSupabaseConfigured}>
                {isSaving ? "Saving..." : "Save Project"}
              </Button>
              <Button type="button" variant="outline" onClick={handleCreateNew}>
                Reset Form
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={!selectedProject || isSaving || isDeleting || !isSupabaseConfigured}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </form>
        </section>
      </section>
    </main>
  );
};

export default AdminPortal;
