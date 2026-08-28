import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import MediaFrame from "@/components/site/MediaFrame";
import SmartImage from "@/components/site/SmartImage";
import { useAnimationSettings } from "@/hooks/useAnimationSettings";
import type { ProjectData } from "@/lib/api";

/**
 * ═══ THE SLATE GRID ═══
 *
 * One system, two rhythms. Work and Film are built from the same four
 * primitives and the same measurements, so they read as one studio — the
 * difference is only in how the cards are dealt.
 *
 * The rules, in full:
 *
 *   Columns    12, everywhere. Cards only ever span 12, 8, 6 or 4.
 *   Ratio      Every thumbnail is 16:9 — the shape CRA8's posters already are,
 *              so nothing is cropped. Only the full-bleed feature is wider.
 *   Caption    Always below the image, never over it, always the same three
 *              lines: status, title, year. No per-craft credits on the grid —
 *              CRA8 is a studio, not a crew reel. The one exception is the
 *              feature, where the overlay is the point.
 *   Type       Scales with the card's span and nothing else, so a project's
 *              size on the page is always legible as its importance.
 *   Spacing    Fixed column and row gaps; sections separated by a labelled rule.
 *
 * Because the rules are positional, a project added in the admin inherits the
 * right treatment automatically — there is no per-project layout to maintain
 * and no arrangement an editor can break.
 */

export const GUTTER = "px-5 sm:px-8 md:px-12";

/** The 12-column bed. Every row of cards sits in one of these. */
export const SlateGrid = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`grid grid-cols-12 gap-x-4 sm:gap-x-6 md:gap-x-8 gap-y-12 sm:gap-y-16 md:gap-y-20 ${className}`}
  >
    {children}
  </div>
);

/** The three card sizes, as column spans and the type scale that goes with them. */
const SIZES = {
  lead: {
    span: "col-span-12 md:col-span-8",
    title: "text-2xl sm:text-3xl md:text-4xl",
    eyebrow: "text-[9px] sm:text-[10px]",
  },
  half: {
    span: "col-span-12 md:col-span-6",
    title: "text-xl sm:text-2xl md:text-3xl",
    eyebrow: "text-[9px] sm:text-[10px]",
  },
  standard: {
    span: "col-span-12 sm:col-span-6 md:col-span-4",
    title: "text-lg sm:text-xl",
    eyebrow: "text-[9px]",
  },
} as const;

export type SlateSize = keyof typeof SIZES;

/**
 * Caption line under a slate card. CRA8 is a studio, not a crew reel, so the
 * grid deliberately doesn't carry per-craft titles (DoP, gaffer, editor) — it
 * shows the year, and craft credits live on the project page for whoever wants
 * them.
 */
const captionLine = (project: ProjectData) => (project.year || "").trim();

const PlayGlyph = ({ large = false }: { large?: boolean }) => (
  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
    <div
      className={`${
        large ? "w-16 h-16 sm:w-20 sm:h-20" : "w-11 h-11 sm:w-12 sm:h-12"
      } rounded-full border border-white/30 flex items-center justify-center backdrop-blur-sm bg-white/5`}
    >
      <div
        className={`w-0 h-0 border-t-transparent border-b-transparent border-l-white/70 ml-0.5 ${
          large ? "border-t-[8px] border-b-[8px] border-l-[13px]" : "border-t-[6px] border-b-[6px] border-l-[10px]"
        }`}
      />
    </div>
  </div>
);

/**
 * The page opener: one project given the whole screen, with its title set over
 * the image. Exactly one per page — the project marked Featured in the admin,
 * or the first in order if none is.
 */
export const SlateFeature = ({ project, eyebrow }: { project: ProjectData; eyebrow?: string }) => {
  const shouldReduceMotion = useReducedMotion();
  const { getSectionDuration, getSectionEase, isSectionEnabled } = useAnimationSettings();
  const instant = shouldReduceMotion || !isSectionEnabled("categoryPages");

  return (
    <motion.div
      initial={{ opacity: instant ? 1 : 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: instant ? 0 : getSectionDuration("categoryPages", 1.2), ease: getSectionEase("categoryPages") }}
      className="relative w-full aspect-[4/5] sm:aspect-[16/9] lg:aspect-[2.4/1] overflow-hidden bg-secondary"
    >
      {project.thumbnail && <SmartImage src={project.thumbnail} alt={project.title} eager />}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-transparent" />
      <div className="film-grain absolute inset-0 z-10 pointer-events-none" />

      {(project.trailer_youtube_id || project.youtube_id) && <PlayGlyph large />}

      <Link to={`/work/${project.id}`} className="absolute inset-0 z-20 group flex items-end">
        <div className={`w-full ${GUTTER} pb-8 sm:pb-10 md:pb-14`}>
          <span className="block font-body text-[9px] sm:text-[10px] tracking-[0.35em] uppercase text-foreground/45 mb-3 sm:mb-4">
            {eyebrow || project.status || "Featured"}
          </span>
          <h2 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-foreground tracking-[0.01em] leading-[0.95] max-w-[16ch] transition-transform duration-700 group-hover:-translate-y-1">
            {project.title}
          </h2>
          {captionLine(project) && (
            <p className="mt-4 font-body text-[10px] sm:text-xs tracking-[0.2em] uppercase text-foreground/40 max-w-2xl line-clamp-1">
              {captionLine(project)}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

/**
 * A project in the grid. Same anatomy at every size — 16:9 frame, then the
 * caption beneath it — so rows line up whatever mix of sizes they hold.
 */
export const SlateCard = ({
  project,
  size = "standard",
  index,
}: {
  project: ProjectData;
  size?: SlateSize;
  /** Archive number, shown on Work. Omit on Film. */
  index?: number;
}) => {
  const shouldReduceMotion = useReducedMotion();
  const { getSectionDuration, getSectionEase, isSectionEnabled } = useAnimationSettings();
  const instant = shouldReduceMotion || !isSectionEnabled("categoryPages");
  const scale = SIZES[size];

  return (
    <motion.article
      initial={{ opacity: instant ? 1 : 0, y: instant ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: instant ? 0 : getSectionDuration("categoryPages", 0.7), ease: getSectionEase("categoryPages") }}
      className={scale.span}
    >
      <Link to={`/work/${project.id}`} className="group block">
        <div className="relative aspect-video overflow-hidden bg-secondary">
          {project.thumbnail && (
            <SmartImage
              src={project.thumbnail}
              alt={project.title}
              className="transition-transform [transition-duration:1200ms] ease-out group-hover:scale-[1.03]"
            />
          )}
          <div className="film-grain absolute inset-0 z-10 pointer-events-none" />
          {(project.trailer_youtube_id || project.youtube_id) && <PlayGlyph />}
        </div>

        <div className="mt-4 sm:mt-5">
          <div className="flex items-baseline gap-3">
            {typeof index === "number" && (
              <span className="font-body text-[9px] tracking-[0.2em] text-foreground/20 tabular-nums shrink-0">
                {String(index).padStart(2, "0")}
              </span>
            )}
            {project.status && (
              <span
                className={`font-body ${scale.eyebrow} tracking-[0.3em] uppercase text-foreground/30 truncate`}
              >
                {project.status}
              </span>
            )}
          </div>
          <h3
            className={`mt-2 font-display ${scale.title} font-light text-foreground/85 group-hover:text-foreground transition-colors duration-500 tracking-[0.01em] leading-[1.15]`}
          >
            {project.title}
          </h3>
          {captionLine(project) && (
            <p className="mt-2 font-body text-[10px] tracking-[0.2em] uppercase text-foreground/30 leading-relaxed truncate">
              {captionLine(project)}
            </p>
          )}
          <span className="mt-4 block h-px w-full bg-foreground/[0.07] origin-left scale-x-100 group-hover:bg-foreground/25 transition-colors duration-500" />
        </div>
      </Link>
    </motion.article>
  );
};

/** The labelled rule that separates one section of the slate from the next. */
export const SlateSection = ({
  label,
  count,
  href,
  children,
}: {
  label: string;
  count?: number;
  /** Turns the label into a link to that section's own page. */
  href?: string;
  children: React.ReactNode;
}) => {
  const heading = (
    <span className="font-display text-xl sm:text-2xl font-light text-foreground/70 tracking-[0.04em] uppercase">
      {label}
    </span>
  );

  return (
    <section className="mt-20 sm:mt-28 first:mt-0">
      <div className="flex items-baseline justify-between gap-6 pb-5 border-b border-foreground/[0.09]">
        {href ? (
          <Link to={href} className="group flex items-baseline gap-3 hover:opacity-80 transition-opacity">
            {heading}
            <span className="font-body text-[10px] tracking-[0.2em] uppercase text-foreground/25 group-hover:text-foreground/50 transition-colors">
              View all →
            </span>
          </Link>
        ) : (
          heading
        )}
        {typeof count === "number" && (
          <span className="font-body text-[10px] tracking-[0.25em] uppercase text-foreground/25 tabular-nums shrink-0">
            {String(count).padStart(2, "0")} {count === 1 ? "Title" : "Titles"}
          </span>
        )}
      </div>
      <SlateGrid className="mt-10 sm:mt-14">{children}</SlateGrid>
    </section>
  );
};

/** Kept for pages that want a frame outside the grid (a category's hero still). */
export const SlateStill = MediaFrame;
