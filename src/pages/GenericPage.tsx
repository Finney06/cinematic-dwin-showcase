import PageShell from "@/components/site/PageShell";
import Masthead from "@/components/site/Masthead";
import MediaFrame from "@/components/site/MediaFrame";
import PageBlocks from "@/components/PageBlocks";
import LegacyPageFields, { hasLegacyContent, type LegacyContent } from "@/components/site/LegacyPageFields";
import { EmptyState, ErrorState } from "@/components/site/states";
import { useCmsPage } from "@/hooks/useCmsPage";
import { isBlockFilled } from "@/lib/pageBlocks";

/**
 * Any page created in Admin → Pages, plus the older hand-made ones (News,
 * Internship) that are now just content. The layout is entirely CMS-driven:
 * an optional hero image, the masthead, whatever blocks were stacked, and the
 * legacy fields if that page still holds them.
 *
 * Resolution — whether this slug is a real page at all — happens one level up
 * in SlugPage, so by the time this renders the page is known to exist.
 */
const GenericPage = ({ slug, fallbackTitle = "" }: { slug: string; fallbackTitle?: string }) => {
  const page = useCmsPage(slug, fallbackTitle);
  const legacy = page.content as LegacyContent;

  const heroImage = typeof page.content.heroImage === "string" ? page.content.heroImage : "";
  const hasBlocks = page.blocks.some(isBlockFilled);
  const hasAnything = hasBlocks || hasLegacyContent(legacy) || Boolean(heroImage || page.intro);

  return (
    <PageShell
      title={page.seo.title || page.title}
      description={page.seo.description}
      image={page.seo.image || heroImage}
      bleed
    >
      {heroImage && (
        <div className="relative w-full h-[45vh] sm:h-[60vh] overflow-hidden">
          <MediaFrame src={heroImage} alt={page.title} fill />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>
      )}

      <div
        className={`px-5 sm:px-8 md:px-12 pb-16 sm:pb-24 ${
          heroImage ? "pt-12 sm:pt-16" : "pt-28 sm:pt-32 md:pt-40"
        }`}
      >
        <div className="max-w-3xl">
          <Masthead size="hero" eyebrow={page.eyebrow} title={page.title} intro={page.intro} />

          <LegacyPageFields content={legacy} className="mt-10 sm:mt-14" />
          <PageBlocks blocks={page.blocks} className="mt-10 sm:mt-14" />

          {page.isError && (
            <ErrorState message="We couldn't load this page's content." onRetry={page.refetch} />
          )}
          {!page.isLoading && !page.isError && !hasAnything && <EmptyState />}
        </div>
      </div>
    </PageShell>
  );
};

export default GenericPage;
