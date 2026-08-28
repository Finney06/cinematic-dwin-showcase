import { Link, useParams } from "react-router-dom";
import PageShell from "@/components/site/PageShell";
import Reveal from "@/components/site/Reveal";
import MediaFrame from "@/components/site/MediaFrame";
import PageBlocks from "@/components/PageBlocks";
import { ErrorState, LoadingState } from "@/components/site/states";
import NotFound from "@/pages/NotFound";
import { useArticle, useArticles } from "@/hooks/useContent";
import { isNotFound } from "@/lib/api";
import { formatDate, isoDate } from "@/lib/dates";
import { isBlockFilled } from "@/lib/pageBlocks";

/**
 * One Journal entry. The whole body is the shared block list, so an editor can
 * build a photo essay, a written piece, or something with an embedded cut,
 * using exactly the same editor the rest of the site uses.
 */
const JournalArticle = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data: article, isLoading, isError, error, refetch } = useArticle(slug);
  const { data: articles = [] } = useArticles();

  if (isLoading) {
    return (
      <PageShell title="Journal" noIndex>
        <LoadingState />
      </PageShell>
    );
  }

  // An unpublished or deleted entry is a genuine 404; anything else is the
  // backend being unreachable, which deserves a retry rather than a 404.
  if (isNotFound(error)) return <NotFound />;

  if (isError || !article) {
    return (
      <PageShell title="Journal" noIndex>
        <ErrorState message="We couldn't load this entry." onRetry={refetch} />
      </PageShell>
    );
  }

  const index = articles.findIndex((item) => item.slug === article.slug);
  const next = index >= 0 ? articles[(index + 1) % articles.length] : undefined;
  const hasNext = next && next.slug !== article.slug;
  const dateline = [article.author, formatDate(article.published_at)].filter(Boolean).join(" · ");
  const body = article.blocks.filter(isBlockFilled);

  return (
    <PageShell
      title={article.seo_title || article.title}
      description={article.seo_description || article.excerpt}
      image={article.cover_image}
      type="article"
      bleed
    >
      {/* ═══ COVER ═══ */}
      {article.cover_image && (
        <div className="relative w-full h-[50vh] sm:h-[70vh] overflow-hidden bg-secondary">
          <MediaFrame src={article.cover_image} alt={article.title} fill />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />
        </div>
      )}

      <article
        className={`px-5 sm:px-8 md:px-12 pb-16 sm:pb-24 ${
          article.cover_image ? "pt-12 sm:pt-16" : "pt-28 sm:pt-32 md:pt-40"
        }`}
      >
        <header className="max-w-3xl">
          {article.kicker && (
            <span className="font-body text-[9px] sm:text-[10px] tracking-[0.35em] uppercase text-foreground/35">
              {article.kicker}
            </span>
          )}
          <h1 className="mt-4 font-display text-3xl sm:text-5xl md:text-6xl font-light text-foreground tracking-[0.01em] leading-[1.05]">
            {article.title}
          </h1>
          {dateline && (
            <p className="mt-5 font-body text-[10px] tracking-[0.25em] uppercase text-foreground/30">
              <time dateTime={isoDate(article.published_at) || undefined}>{dateline}</time>
            </p>
          )}
          {article.excerpt && (
            <p className="mt-8 font-display text-lg sm:text-2xl font-light text-foreground/70 leading-[1.45]">
              {article.excerpt}
            </p>
          )}
          <div className="h-px bg-foreground/10 mt-10 sm:mt-12" />
        </header>

        <div className="max-w-3xl mt-10 sm:mt-14">
          <PageBlocks blocks={body} />
          {body.length === 0 && (
            <p className="font-body text-sm text-foreground/30 tracking-[0.15em] uppercase">
              This entry has no body yet.
            </p>
          )}
        </div>

        {/* ═══ NAVIGATION ═══ */}
        <Reveal className="max-w-3xl border-t border-foreground/[0.06] pt-8 sm:pt-10 mt-16 sm:mt-24 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <Link
            to="/journal"
            className="font-body text-[10px] tracking-[0.25em] uppercase text-foreground/25 hover:text-foreground/60 transition-colors duration-500"
          >
            ← All entries
          </Link>
          {hasNext && (
            <Link to={`/journal/${next.slug}`} className="group sm:text-right">
              <span className="font-body text-[9px] tracking-[0.25em] uppercase text-foreground/20 block mb-1">
                Next
              </span>
              <span className="font-display text-lg sm:text-xl font-light text-foreground/40 group-hover:text-foreground/80 transition-colors duration-500">
                {next.title}
              </span>
            </Link>
          )}
        </Reveal>
      </article>
    </PageShell>
  );
};

export default JournalArticle;
