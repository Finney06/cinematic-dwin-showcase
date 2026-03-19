import { useQuery } from "@tanstack/react-query";
import { fetchProjectById, fetchProjects } from "@/lib/project-service";

export const useProjectsData = () =>
  useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    staleTime: 60 * 1000,
  });

export const useProjectData = (id?: string) =>
  useQuery({
    queryKey: ["project", id],
    queryFn: () => fetchProjectById(id ?? ""),
    enabled: Boolean(id),
  });
