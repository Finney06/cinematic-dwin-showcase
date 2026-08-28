import { useSearchParams } from "react-router-dom";
import PageShell from "@/components/site/PageShell";
import Masthead from "@/components/site/Masthead";
import CategoryFilter from "@/components/site/CategoryFilter";
import MediaFrame from "@/components/site/MediaFrame";
import PageBlocks from "@/components/PageBlocks";
import { GUTTER, SlateCard, SlateFeature, SlateGrid, SlateSection } from "@/components/site/Slate";
import { EmptyState, ErrorState, LoadingState } from "@/components/site/states";
import NotFound from "@/pages/NotFound";
import { useCategories, useProjects } from "@/hooks/useContent";
import { useCmsPage } from "@/hooks/useCmsPage";
import { groupByCategory, pickFeature } from "@/lib/slate";

/**
 * Work — the whole of CRA8's output, and the only place it lives.
 *
 * There is no separate page per discipline. Film, Music and anything added
 * later are filters on this page, carried in the URL as `?category=`, so a
 * filtered view is still a real address that can be shared and indexed. The old
 * `/film`-style URLs redirect here (see SlugPage), which is what keeps a
 * project from ever appearing in two competing places.
 *
 * A filter carries no page of its own: its label, description and hero image
 * come straight from Admin → Categories, which is also the only place they're
 * edited — there's no second "page copy" record to keep in sync with it.
 *
 * The layout answers to the filter:
 *
 *   All        the archive — grouped by discipline, numbered, one lead card of
 *              eight columns per group with four-column standards after it.
 *   Filtered   one discipline, so nothing to group — larger half-width frames
 *              with more air, which is the cinematic read.
 *
 * Both are dealt from the same primitives in `components/site/Slate.tsx`, so a
 * project added in the admin inherits its treatment with nothing to configure.
 */
const Work = () => {
  const [searchParams] = useSearchParams();
  const requested = searchParams.get("category") || "";

  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const category = categories.find((item) => item.slug === requested);
  // An unknown or emptied filter falls back to the full archive rather than an
  // error — a stale bookmark should still land somewhere useful.
  const activeSlug = category?.slug || "";

  const { data: projects = [], isLoading, isError, refetch } = useProjects(activeSlug || undefined);
  const { data: allProjects = [] } = useProjects();

  /**
   * The whole page's own copy comes from Admin → Pages. A filter has no page
   * of its own to hold copy in — its label, description and hero image are
   * whatever's set on the category in Admin → Categories, which is also its
   * only editor, so there is exactly one place to change what a filter shows.
   */
  const archivePage = useCmsPage("work", "Work");

  const { feature, rest } = pickFeature(projects);
  const sections = groupByCategory(rest, categories);
  const loading = isLoading || categoriesLoading;

  // Work's own publish state — a category has no draft state of its own, so
  // this only ever gates the unfiltered archive and the page as a whole.
  if (!archivePage.isLoading && archivePage.isUnpublished) return <NotFound />;

  const intro = activeSlug
    ? category?.description || ""
    : archivePage.intro || "Everything CRA8 has made — film, music and everything between.";

  let running = 1; // the archive is numbered straight through, the opener being 01

  return (
    <PageShell
      title={activeSlug ? `${category?.label} — Work` : archivePage.seo.title}
      description={activeSlug ? category?.description || archivePage.seo.description : archivePage.seo.description}
      image={activeSlug ? category?.hero_image || archivePage.seo.image : archivePage.seo.image}
      bleed
    >
      <div className={`${GUTTER} pt-28 sm:pt-32 md:pt-40 pb-12 sm:pb-16`}>
        <Masthead
          size="hero"
          eyebrow={activeSlug ? `The Archive — ${category?.label}` : "The Archive"}
          title={archivePage.title}
          intro={intro}
          meta={
            projects.length
              ? {
                  value: String(projects.length).padStart(2, "0"),
                  label: projects.length === 1 ? "Title" : "Titles",
                }
              : null
          }
        >
          <CategoryFilter categories={categories} active={activeSlug} total={allProjects.length} />
        </Masthead>

        {/* A discipline's own hero still, set in Admin → Categories. */}
        {activeSlug && category?.hero_image && (
          <MediaFrame
            src={category.hero_image}
            alt={category.label}
            aspect="aspect-[21/9] sm:aspect-[2.5/1]"
            className="mt-12 sm:mt-16"
          />
        )}

        {/* Content blocks belong to the whole Work page, not to a filter —
            a filter has nothing of its own to hold them in. */}
        {!activeSlug && <PageBlocks blocks={archivePage.blocks} className="mt-10 sm:mt-14 max-w-2xl" />}
      </div>

      {loading && <LoadingState label="Loading the archive" />}
      {!loading && isError && (
        <ErrorState message="We couldn't load the archive right now." onRetry={refetch} />
      )}
      {!loading && !isError && !projects.length && (
        <EmptyState
          message={
            activeSlug
              ? `No ${category?.label.toLowerCase()} published yet`
              : "The archive goes live soon"
          }
          hint={activeSlug ? "Everything else is under All." : undefined}
        />
      )}

      {feature && <SlateFeature project={feature} eyebrow={feature.status || "Featured"} />}

      {/* ═══ ONE DISCIPLINE — larger frames, no grouping ═══ */}
      {activeSlug && rest.length > 0 && (
        <div className={`${GUTTER} pt-20 sm:pt-28 pb-8`}>
          <SlateGrid>
            {rest.map((project) => (
              <SlateCard key={project.id} project={project} size="half" />
            ))}
          </SlateGrid>
        </div>
      )}

      {/* ═══ THE WHOLE ARCHIVE — grouped and numbered ═══ */}
      {!activeSlug && sections.length > 0 && (
        <div className={`${GUTTER} pt-20 sm:pt-28 pb-8`}>
          {sections.map((section) => (
            <SlateSection
              key={section.slug || section.label}
              label={section.label}
              count={section.items.length}
              href={section.slug ? `/work?category=${section.slug}` : undefined}
            >
              {section.items.map((project, index) => {
                running += 1;
                return (
                  <SlateCard
                    key={project.id}
                    project={project}
                    size={index === 0 ? "lead" : "standard"}
                    index={running}
                  />
                );
              })}
            </SlateSection>
          ))}
        </div>
      )}
    </PageShell>
  );
};

export default Work;
