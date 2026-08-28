import { Link, useParams } from "react-router-dom";
import PageShell from "@/components/site/PageShell";
import Reveal from "@/components/site/Reveal";
import MediaFrame from "@/components/site/MediaFrame";
import PageBlocks from "@/components/PageBlocks";
import { SlateCard, SlateGrid } from "@/components/site/Slate";
import { ErrorState, LoadingState } from "@/components/site/states";
import NotFound from "@/pages/NotFound";
import { useProject, useProjects } from "@/hooks/useContent";
import { isNotFound, type ProjectData } from "@/lib/api";
import { isBlockFilled } from "@/lib/pageBlocks";

/**
 * Builds the credit block. The four fixed fields the project editor has always
 * had come first, then any free-form credits added in the editor — so CRA8 can
 * list a colourist or a first AD without a schema change, and a project that
 * only fills in two fields shows exactly two lines.
 */
function buildCredits(project: ProjectData) {
  const fixed = [
    { role: "Director", name: project.director },
    { role: "CRA8 Credits", name: project.role },
    { role: "Producers", name: project.producers },
    { role: "Year", name: project.year },
    { role: "Cast", name: project.cast_info, wide: true },
  ];
  const custom = (project.credits || []).map((credit) => ({
    role: credit?.role || "",
    name: credit?.name || "",
    wide: false,
  }));

  return [...fixed, ...custom].filter((credit) => credit.role?.trim() && credit.name?.trim());
}

const ProjectDetail = () => {
  const { id = "" } = useParams<{ id: string }>();
  const { data: project, isLoading, isError, error, refetch } = useProject(id);
  const { data: categoryProjects = [] } = useProjects(project?.category);

  if (isLoading) {
    return (
      <PageShell noIndex>
        <LoadingState label="Loading project" />
      </PageShell>
    );
  }

  // Unpublished or deleted is a real 404; a backend that didn't answer is not.
  if (isNotFound(error)) return <NotFound />;

  if (isError || !project) {
    return (
      <PageShell noIndex>
        <ErrorState message="We couldn't load this project." onRetry={refetch} />
        <div className="text-center">
          <Link
            to="/work"
            className="font-body text-[11px] tracking-[0.2em] uppercase text-foreground/50 border-b border-foreground/10 pb-1 hover:text-foreground/70 transition-colors duration-500"
          >
            Browse the slate
          </Link>
        </div>
      </PageShell>
    );
  }

  const credits = buildCredits(project);
  const gallery = (project.gallery || []).filter((url) => url?.trim());
  const body = (project.blocks || []).filter(isBlockFilled);

  const index = categoryProjects.findIndex((item) => item.id === project.id);
  const next = index >= 0 ? categoryProjects[(index + 1) % categoryProjects.length] : undefined;
  const hasNext = next && next.id !== project.id;
  const related = categoryProjects.filter((item) => item.id !== project.id).slice(0, 3);

  const watchUrl = project.youtube_id ? `https://www.youtube.com/watch?v=${project.youtube_id}` : "";

  return (
    <PageShell
      title={project.title}
      description={project.seo_description || project.logline || project.description}
      image={project.thumbnail}
      type="article"
      bleed
    >
      {/* ═══ HERO ═══ */}
      {/*
        A confirmed trailer plays silently behind the title. Where there isn't
        one, the still holds the frame and the full film is a link out — a
        feature is never used as ambient background footage.
      */}
      <div className="relative w-full h-[45vh] sm:h-[60vh] md:h-[75vh] overflow-hidden bg-secondary">
        {project.trailer_youtube_id ? (
          <MediaFrame src={project.trailer_youtube_id} alt={`${project.title} — trailer`} fill ambient />
        ) : (
          project.thumbnail && (
            <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover" />
          )
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/10" />
        <div className="film-grain absolute inset-0 z-10 pointer-events-none" />

        <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-8 md:px-12 pb-6 sm:pb-10 md:pb-14 z-20">
          <span className="font-body text-[8px] sm:text-[9px] tracking-[0.3em] uppercase text-foreground/40 block mb-2 sm:mb-3">
            {[project.category_label, project.year].filter(Boolean).join(" — ")}
          </span>
          <h1 className="font-display text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-light text-foreground tracking-[0.02em] leading-[0.9]">
            {project.title}
          </h1>
          {project.status && (
            <span className="inline-block mt-3 sm:mt-4 font-body text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-foreground/35">
              {project.status}
            </span>
          )}
        </div>
      </div>

      <div className="px-5 sm:px-8 md:px-12">
        {/* ═══ LOGLINE + SYNOPSIS ═══ */}
        <Reveal className="max-w-3xl pt-10 sm:pt-16 pb-12 sm:pb-16">
          {project.logline && (
            <p className="font-display text-xl sm:text-2xl md:text-3xl font-light text-foreground/80 leading-[1.35] mb-8">
              {project.logline}
            </p>
          )}
          {(project.synopsis || project.description) && (
            <p className="font-body text-sm sm:text-base md:text-lg leading-[1.8] text-foreground/55 whitespace-pre-wrap">
              {project.synopsis || project.description}
            </p>
          )}
          {watchUrl && (
            <a
              href={watchUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 mt-8 font-body text-[11px] tracking-[0.22em] uppercase text-foreground/60 hover:text-foreground transition-colors border-b border-foreground/20 hover:border-foreground/60 pb-1.5"
            >
              Watch the full film →
            </a>
          )}
        </Reveal>

        {/* ═══ FULL FILM / MAIN VIDEO ═══ */}
        {project.youtube_id && (
          <Reveal className="mb-14 sm:mb-20">
            <MediaFrame
              src={project.youtube_id}
              alt={`${project.title} — video`}
              aspect="aspect-video"
              className="w-full max-w-5xl"
              grain={false}
            />
          </Reveal>
        )}

        {/* ═══ STILLS ═══ */}
        {gallery.length > 0 && (
          <Reveal className="mb-14 sm:mb-20">
            <span className="font-body text-[9px] tracking-[0.3em] uppercase text-foreground/25 block mb-6">
              Stills
            </span>
            <div className={`grid gap-3 sm:gap-5 ${gallery.length === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"}`}>
              {gallery.map((url, i) => (
                <MediaFrame key={`${i}-${url}`} src={url} alt={`${project.title} — still`} aspect="aspect-video" />
              ))}
            </div>
          </Reveal>
        )}

        {/* ═══ EXTRA CONTENT ═══ */}
        {body.length > 0 && <PageBlocks blocks={body} className="max-w-3xl mb-14 sm:mb-20" />}

        {/* ═══ CREDITS ═══ */}
        {credits.length > 0 && (
          <Reveal className="border-t border-foreground/[0.06] pt-10 sm:pt-12 max-w-3xl">
            <span className="font-body text-[9px] tracking-[0.3em] uppercase text-foreground/25 block mb-6 sm:mb-8">
              Credits
            </span>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5 sm:gap-y-6">
              {credits.map((credit, i) => (
                <div key={`${credit.role}-${i}`} className={credit.wide ? "sm:col-span-2" : ""}>
                  <dt className="font-body text-[10px] tracking-[0.2em] uppercase text-foreground/20 mb-1.5">
                    {credit.role}
                  </dt>
                  <dd className="font-body text-sm text-foreground/65">{credit.name}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}

        {/* ═══ MORE FROM THIS SECTION ═══ */}
        {related.length > 0 && (
          <Reveal className="border-t border-foreground/[0.06] pt-10 sm:pt-14 mt-14 sm:mt-20">
            <span className="font-body text-[9px] tracking-[0.3em] uppercase text-foreground/25 block mb-6 sm:mb-8">
              More {project.category_label}
            </span>
            {/* The same card the slate uses, so a project looks identical
                wherever it appears on the site. */}
            <SlateGrid>
              {related.map((item) => (
                <SlateCard key={item.id} project={item} size="standard" />
              ))}
            </SlateGrid>
          </Reveal>
        )}

        {/* ═══ NAVIGATION ═══ */}
        <Reveal className="border-t border-foreground/[0.06] pt-8 sm:pt-10 mt-14 sm:mt-20 pb-6 sm:pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <Link
            to={`/work?category=${project.category}`}
            className="font-body text-[10px] tracking-[0.25em] uppercase text-foreground/25 hover:text-foreground/60 transition-colors duration-500"
          >
            ← All {project.category_label}
          </Link>
          {hasNext && (
            <Link to={`/work/${next.id}`} className="group sm:text-right">
              <span className="font-body text-[9px] tracking-[0.25em] uppercase text-foreground/20 block mb-1">
                Next
              </span>
              <span className="font-display text-lg sm:text-xl md:text-2xl font-light text-foreground/40 group-hover:text-foreground/80 transition-colors duration-500 tracking-[0.02em]">
                {next.title}
              </span>
            </Link>
          )}
        </Reveal>
      </div>
    </PageShell>
  );
};

export default ProjectDetail;
