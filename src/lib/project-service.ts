import { projects as fallbackProjects, type Project, type ProjectCategory } from "@/lib/projects";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

interface ProjectRow {
  id: string;
  title: string;
  category: ProjectCategory;
  category_label: string;
  year: string;
  role: string;
  description: string;
  thumbnail: string;
  stills: string[] | null;
}

const projectColumns = "id,title,category,category_label,year,role,description,thumbnail,stills";

const mapRowToProject = (row: ProjectRow): Project => ({
  id: row.id,
  title: row.title,
  category: row.category,
  categoryLabel: row.category_label,
  year: row.year,
  role: row.role,
  description: row.description,
  thumbnail: row.thumbnail,
  stills: row.stills ?? [],
});

const mapProjectToRow = (project: Project): ProjectRow => ({
  id: project.id,
  title: project.title,
  category: project.category,
  category_label: project.categoryLabel,
  year: project.year,
  role: project.role,
  description: project.description,
  thumbnail: project.thumbnail,
  stills: project.stills ?? [],
});

const ensureSupabase = () => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  return supabase;
};

export const fetchProjects = async (): Promise<Project[]> => {
  if (!isSupabaseConfigured || !supabase) {
    return fallbackProjects;
  }

  const { data, error } = await supabase
    .from("projects")
    .select(projectColumns)
    .order("year", { ascending: false })
    .order("title", { ascending: true });

  if (error) {
    console.error("Failed to fetch projects from Supabase:", error.message);
    return fallbackProjects;
  }

  return (data as ProjectRow[]).map(mapRowToProject);
};

export const fetchProjectById = async (id: string): Promise<Project | null> => {
  if (!id) {
    return null;
  }

  if (!isSupabaseConfigured || !supabase) {
    return fallbackProjects.find((project) => project.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("projects")
    .select(projectColumns)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to fetch project from Supabase:", error.message);
    return fallbackProjects.find((project) => project.id === id) ?? null;
  }

  if (!data) {
    return null;
  }

  return mapRowToProject(data as ProjectRow);
};

export const upsertProject = async (project: Project): Promise<Project> => {
  const client = ensureSupabase();
  const payload = mapProjectToRow(project);

  const { data, error } = await client
    .from("projects")
    .upsert(payload, { onConflict: "id" })
    .select(projectColumns)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRowToProject(data as ProjectRow);
};

export const removeProject = async (id: string): Promise<void> => {
  const client = ensureSupabase();

  const { error } = await client.from("projects").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
};
