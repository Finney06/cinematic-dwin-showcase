import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "@/components/site/PageShell";
import Masthead from "@/components/site/Masthead";
import Reveal from "@/components/site/Reveal";
import MediaFrame from "@/components/site/MediaFrame";
import PageBlocks from "@/components/PageBlocks";
import { ErrorState, LoadingState } from "@/components/site/states";
import NotFound from "@/pages/NotFound";
import { useArticles } from "@/hooks/useContent";
import { useCmsPage } from "@/hooks/useCmsPage";
import { formatDate, isoDate } from "@/lib/dates";
import type { Article } from "@/lib/api";

/** Dateline under a title — whichever of author and date the CMS actually has. */
const byline = (article: Article) =>
  [article.author, formatDate(article.published_at)].filter(Boolean).join(" · ");

/**
 * The Journal index. Behind the scenes, director stories, creative process,
 * campaign launches, culture and studio news — sectioned by each article's
 * `kicker`, which is free text, so a new section needs no code.
 *
 * The newest featured entry takes the lead slot; everything else runs as an
 * editorial list rather than a card grid.
 */
const Journal = () => {
  const { data: articles = [], isLoading, isError, refetch } = useArticles();
  const page = useCmsPage("journal", "Journal");
  const [section, setSection] = useState("");

  const sections = useMemo(
    () => [...new Set(articles.map((article) => article.kicker.trim()).filter(Boolean))],
    [articles]
  );

  const visible = section ? articles.filter((article) => article.kicker.trim() === section) : articles;
  const [lead, ...rest] = visible;

  return (
    <PageShell title={page.seo.title} description={page.seo.description} image={page.seo.image}>
      <Masthead
        size="hero"
        eyebrow="From the studio"
        title={page.title}
        intro={page.intro}
        meta={
          articles.length
            ? {
                value: String(articles.length).padStart(2, "0"),
                label: articles.length === 1 ? "Entry" : "Entries",
              }
            : null
        }
      >
        {sections.length > 1 && (
          <div className="mt-8 sm:mt-10 flex flex-wrap gap-2">
            {[{ key: "", label: "All" }, ...sections.map((key) => ({ key, label: key }))].map((chip) => (
              <button
                key={chip.key || "all"}
                type="button"
                onClick={() => setSection(chip.key)}
                aria-pressed={section === chip.key}
                className={`px-3.5 py-2 font-body text-[10px] tracking-[0.22em] uppercase transition-colors duration-500 border cursor-pointer ${
                  section === chip.key
                    ? "border-foreground/30 text-foreground/80"
                    : "border-foreground/[0.08] text-foreground/30 hover:text-foreground/70 hover:border-foreground/20"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}
      </Masthead>

      <PageBlocks blocks={page.blocks} className="mt-10 sm:mt-14 max-w-2xl" />

      {isLoading && <LoadingState label="Loading the journal" />}
      {!isLoading && isError && (
        <ErrorState message="We couldn't load the journal right now." onRetry={refetch} />
      )}
      {!isLoading && !isError && visible.length === 0 && (
        <Reveal className="mt-14 sm:mt-20 border-t border-foreground/[0.09] pt-14 sm:pt-20">
          <p className="font-display text-2xl sm:text-3xl md:text-4xl font-light text-foreground/75 leading-[1.3] max-w-2xl">
            {section
              ? `Nothing filed under ${section} yet.`
              : "The first entry is being written."}
          </p>
          <p className="mt-5 max-w-md font-body text-sm sm:text-base leading-[1.9] text-foreground/45">
            {section
              ? "Try another section, or read everything the studio has published so far."
              : "Notes from the set, how a cut comes together, and what the studio is working on next. Until then, the work speaks for itself."}
          </p>
          <div className="mt-8 flex flex-wrap gap-6">
            {section && (
              <button
                type="button"
                onClick={() => setSection("")}
                className="font-body text-[11px] tracking-[0.2em] uppercase text-foreground/50 hover:text-foreground/85 transition-colors border-b border-foreground/15 hover:border-foreground/40 pb-1 cursor-pointer"
              >
                All entries →
              </button>
            )}
            <Link
              to="/work"
              className="font-body text-[11px] tracking-[0.2em] uppercase text-foreground/50 hover:text-foreground/85 transition-colors border-b border-foreground/15 hover:border-foreground/40 pb-1"
            >
              See the slate →
            </Link>
          </div>
        </Reveal>
      )}

      {/* ═══ LEAD ENTRY ═══ */}
      {lead && (
        <Reveal className="mt-14 sm:mt-20">
          <Link to={`/journal/${lead.slug}`} className="group block">
            {lead.cover_image && (
              <div className="relative overflow-hidden">
                <MediaFrame
                  src={lead.cover_image}
                  alt={lead.title}
                  aspect="aspect-[16/10] sm:aspect-[2.2/1]"
                  className="[&>img]:transition-transform [&>img]:[transition-duration:1400ms] group-hover:[&>img]:scale-[1.04]"
                />
              </div>
            )}
            <div className="mt-6 sm:mt-8 max-w-3xl">
              {lead.kicker && (
                <span className="font-body text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-foreground/35">
                  {lead.kicker}
                </span>
              )}
              <h2 className="mt-3 font-display text-2xl sm:text-4xl md:text-5xl font-light text-foreground tracking-[0.01em] leading-[1.05] transition-colors duration-500 group-hover:text-foreground/70">
                {lead.title}
              </h2>
              {lead.excerpt && (
                <p className="mt-4 font-body text-sm sm:text-base leading-[1.9] text-foreground/50">
                  {lead.excerpt}
                </p>
              )}
              {byline(lead) && (
                <p className="mt-4 font-body text-[10px] tracking-[0.2em] uppercase text-foreground/25">
                  <time dateTime={isoDate(lead.published_at) || undefined}>{byline(lead)}</time>
                </p>
              )}
            </div>
          </Link>
        </Reveal>
      )}

      {/* ═══ THE REST — an editorial list, not cards ═══ */}
      {rest.length > 0 && (
        <div className="mt-16 sm:mt-24 border-t border-foreground/[0.06]">
          {rest.map((article, index) => (
            <Reveal key={article.id} index={index} className="border-b border-foreground/[0.06]">
              <Link
                to={`/journal/${article.slug}`}
                className="group grid grid-cols-1 sm:grid-cols-12 gap-5 sm:gap-8 items-center py-8 sm:py-10"
              >
                <div className="sm:col-span-3 md:col-span-3">
                  {article.cover_image ? (
                    <MediaFrame src={article.cover_image} alt={article.title} aspect="aspect-[4/3]" />
                  ) : (
                    <span
                      aria-hidden
                      className="block font-display font-light text-foreground/[0.10] leading-none text-[3rem] sm:text-[4rem]"
                    >
                      {String(index + 2).padStart(2, "0")}
                    </span>
                  )}
                </div>
                <div className="sm:col-span-7 md:col-span-7">
                  {article.kicker && (
                    <span className="font-body text-[9px] tracking-[0.3em] uppercase text-foreground/30">
                      {article.kicker}
                    </span>
                  )}
                  <h3 className="mt-2 font-display text-xl sm:text-2xl md:text-3xl font-light text-foreground/85 tracking-[0.01em] leading-[1.15] transition-colors duration-500 group-hover:text-foreground">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="mt-3 font-body text-sm leading-[1.8] text-foreground/45 line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2 md:col-span-2 sm:text-right">
                  {byline(article) && (
                    <p className="font-body text-[10px] tracking-[0.2em] uppercase text-foreground/25">
                      <time dateTime={isoDate(article.published_at) || undefined}>{byline(article)}</time>
                    </p>
                  )}
                  <span className="mt-2 inline-block font-body text-[10px] tracking-[0.2em] uppercase text-foreground/20 group-hover:text-foreground/60 transition-colors duration-500">
                    Read →
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </PageShell>
  );
};

export default Journal;
