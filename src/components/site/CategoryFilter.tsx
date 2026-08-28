import { Link } from "react-router-dom";
import type { CategoryData } from "@/lib/api";
import { navigableCategories } from "@/lib/slate";

interface CategoryFilterProps {
  categories: CategoryData[];
  /** Slug currently being filtered to, or "" for the whole archive. */
  active: string;
  /** Total across every discipline, shown against "All". */
  total: number;
}

/**
 * The filter bar on Work. Film, Music and anything else CRA8 adds are all just
 * options here — there are no separate discipline pages to keep in step.
 *
 * Each chip is a real link with the filter in the URL, so a filtered view can
 * be bookmarked, shared and indexed. Only disciplines that hold published work
 * appear, so a section CRA8 hasn't shot yet is never offered as a dead end —
 * and it starts appearing the moment the first project is published into it,
 * with nothing to switch on.
 */
const CategoryFilter = ({ categories, active, total }: CategoryFilterProps) => {
  const sections = navigableCategories(categories);
  if (!sections.length) return null;

  const chip = (isActive: boolean) =>
    `group px-4 py-2.5 font-body text-[10px] tracking-[0.22em] uppercase transition-colors duration-500 border ${
      isActive
        ? "border-foreground/35 text-foreground/85 bg-foreground/[0.04]"
        : "border-foreground/[0.08] text-foreground/35 hover:text-foreground/75 hover:border-foreground/25"
    }`;

  const count = (value: number, isActive: boolean) => (
    <span className={`ml-2 tabular-nums ${isActive ? "text-foreground/40" : "text-foreground/20"}`}>
      {value}
    </span>
  );

  return (
    <nav aria-label="Filter the archive by discipline" className="mt-8 sm:mt-10 flex flex-wrap gap-2">
      <Link to="/work" className={chip(!active)} aria-current={!active ? "page" : undefined}>
        All
        {count(total, !active)}
      </Link>
      {sections.map((category) => {
        const isActive = active === category.slug;
        return (
          <Link
            key={category.slug}
            to={`/work?category=${category.slug}`}
            className={chip(isActive)}
            aria-current={isActive ? "page" : undefined}
          >
            {category.label}
            {count(category.project_count ?? 0, isActive)}
          </Link>
        );
      })}
    </nav>
  );
};

export default CategoryFilter;
