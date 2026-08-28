import type { CategoryData, ProjectData } from "@/lib/api";

/**
 * The rules that turn a flat list of projects into the slate's layout. They
 * live here rather than in a component so Work and Film apply exactly the same
 * logic, and so the hierarchy is set by the CMS rather than by markup.
 */

/**
 * One project opens the page. It's whichever project is marked Featured in the
 * admin — and if none is, the first in the editor's own order, so the page is
 * never without an opener.
 */
export function pickFeature(projects: ProjectData[]) {
  const feature = projects.find((project) => project.featured) || projects[0];
  const rest = feature ? projects.filter((project) => project.id !== feature.id) : [];
  return { feature, rest };
}

export interface SlateSectionData {
  slug: string;
  label: string;
  items: ProjectData[];
}

/**
 * Groups the slate by discipline, in the category order set in the admin.
 * Anything filed under a category that no longer exists is collected at the
 * end rather than silently disappearing from the archive.
 */
export function groupByCategory(projects: ProjectData[], categories: CategoryData[]): SlateSectionData[] {
  const sections = categories
    .map((category) => ({
      slug: category.slug,
      label: category.label,
      items: projects.filter((project) => project.category === category.slug),
    }))
    .filter((section) => section.items.length > 0);

  const claimed = new Set(sections.flatMap((section) => section.items.map((item) => item.id)));
  const orphans = projects.filter((project) => !claimed.has(project.id));
  if (orphans.length) {
    sections.push({ slug: "", label: "Other Work", items: orphans });
  }

  return sections;
}

/** Categories worth linking to — an empty section is never offered as a filter. */
export function navigableCategories(categories: CategoryData[]) {
  return categories.filter((category) => (category.project_count ?? 0) > 0);
}
