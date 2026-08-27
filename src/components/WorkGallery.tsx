import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import type { ProjectData } from "@/lib/api";
import { useAnimationSettings } from "@/hooks/useAnimationSettings";
import { BRAND } from "@/lib/brand";

interface WorkGalleryProps {
  title: string;
  projects: ProjectData[];
  isLoading?: boolean;
}

/**
 * The slate, art-directed: one flagship title full-bleed, then an editorial
 * mosaic that mixes large and small tiles rather than a uniform card grid,
 * with a full-bleed "beat" every third item so a project occasionally gets
 * the whole screen to itself — paced like a well-cut reel, not a dashboard.
 */
type Row =
  | { kind: "pair"; items: [ProjectData, ProjectData]; reversed: boolean }
  | { kind: "beat"; item: ProjectData }
  | { kind: "solo"; item: ProjectData };

function buildRows(items: ProjectData[]): Row[] {
  const rows: Row[] = [];
  let i = 0;
  let pairCount = 0;
  while (i < items.length) {
    const remaining = items.length - i;
    if (remaining === 1) {
      rows.push({ kind: "solo", item: items[i] });
      i += 1;
    } else if (remaining === 2) {
      rows.push({ kind: "pair", items: [items[i], items[i + 1]], reversed: pairCount % 2 === 1 });
      pairCount += 1;
      i += 2;
    } else {
      rows.push({ kind: "pair", items: [items[i], items[i + 1]], reversed: pairCount % 2 === 1 });
      rows.push({ kind: "beat", item: items[i + 2] });
      pairCount += 1;
      i += 3;
    }
  }
  return rows;
}

const PlayGlyph = ({ size = "md" }: { size?: "sm" | "md" }) => {
  const outer = size === "md" ? "w-14 h-14 sm:w-20 sm:h-20" : "w-10 h-10 sm:w-12 sm:h-12";
  const triangle =
    size === "md"
      ? "border-t-[8px] border-b-[8px] border-l-[13px]"
      : "border-t-[6px] border-b-[6px] border-l-[10px]";
  return (
    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
      <div className={`${outer} rounded-full border border-white/30 flex items-center justify-center backdrop-blur-sm bg-white/5`}>
        <div className={`w-0 h-0 border-t-transparent border-b-transparent border-l-white/70 ml-0.5 ${triangle}`} />
      </div>
    </div>
  );
};

/** Oversized, near-invisible index number set behind each tile's credits. */
const GhostIndex = ({ n, align = "left" }: { n: number; align?: "left" | "right" }) => (
  <span
    aria-hidden
    className={`pointer-events-none select-none font-display font-light text-foreground/[0.05] leading-none text-[5rem] sm:text-[7rem] md:text-[8rem] absolute -top-2 sm:-top-4 ${
      align === "left" ? "left-0" : "right-0"
    }`}
  >
    {String(n).padStart(2, "0")}
  </span>
);

/** Small recurring brand mark used as a section divider — sparingly, not spammed. */
const LogoDivider = () => (
  <div className="flex items-center gap-4 sm:gap-6 px-5 sm:px-8 md:px-12 py-14 sm:py-20">
    <div className="flex-1 h-px bg-foreground/[0.08]" />
    <img src={BRAND.logo} alt="" aria-hidden className="h-4 sm:h-5 w-auto object-contain opacity-40" />
    <div className="flex-1 h-px bg-foreground/[0.08]" />
  </div>
);

const Tile = ({
  project,
  index,
  aspect,
  instant,
  duration,
  delay,
  ease,
}: {
  project: ProjectData;
  index: number;
  aspect: string;
  instant: boolean;
  duration: number;
  delay: number;
  ease: readonly [number, number, number, number];
}) => (
  <motion.div
    initial={{ opacity: instant ? 1 : 0, y: instant ? 0 : 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration, delay, ease }}
    className="relative"
  >
    <GhostIndex n={index} align={index % 2 === 0 ? "left" : "right"} />
    <Link to={`/work/${project.id}`} className="group relative block">
      <div className={`relative ${aspect} overflow-hidden bg-secondary`}>
        <img
          src={project.thumbnail}
          alt={project.title}
          className="w-full h-full object-cover transition-transform [transition-duration:1400ms] ease-out group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/20 to-transparent" />
        <div className="film-grain absolute inset-0 z-10 pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-px bg-foreground/50 origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-500 z-20" />
        {project.youtube_id && <PlayGlyph size="sm" />}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          {project.status && (
            <span className="font-body text-[7px] sm:text-[8px] tracking-[0.3em] uppercase text-foreground/40 mb-1.5 sm:mb-2 block">
              {project.status}
            </span>
          )}
          <h3 className="font-display text-lg sm:text-2xl md:text-3xl font-light text-foreground tracking-[0.02em] leading-[1.05]">
            {project.title}
          </h3>
          <p className="mt-2 font-body text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-foreground/40 opacity-0 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
            {project.role} · {project.year}
          </p>
        </div>
      </div>
    </Link>
  </motion.div>
);

const WorkGallery = ({ title, projects, isLoading }: WorkGalleryProps) => {
  const shouldReduceMotion = useReducedMotion();
  const { getSectionDuration, getSectionDelay, getSectionEase, isSectionEnabled } = useAnimationSettings();
  const instant = shouldReduceMotion || !isSectionEnabled("categoryPages");
  const ease = getSectionEase("categoryPages");

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", instant ? "0%" : "18%"]);

  const featured = projects[0];
  const rows = buildRows(projects.slice(1));

  let running = 1; // the featured piece is 01

  return (
    <div className="bg-background">
      {/* ═══ MASTHEAD ═══ */}
      <div className="px-5 sm:px-8 md:px-12 pt-28 sm:pt-32 md:pt-40 pb-12 sm:pb-16">
        <motion.div
          initial={{ opacity: instant ? 1 : 0, y: instant ? 0 : 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: instant ? 0 : getSectionDuration("categoryPages", 1), ease }}
          className="flex items-end justify-between gap-6 flex-wrap"
        >
          <h1 className="font-display text-[16vw] sm:text-8xl md:text-9xl lg:text-[10rem] font-light text-foreground tracking-[0.01em] uppercase leading-[0.82]">
            {title}
          </h1>
          {projects.length > 0 && (
            <div className="text-right pb-2 sm:pb-4">
              <span className="block font-display text-3xl sm:text-4xl font-light text-foreground/50 tabular-nums leading-none">
                {String(projects.length).padStart(2, "0")}
              </span>
              <span className="block mt-1 font-body text-[9px] tracking-[0.3em] uppercase text-foreground/25">
                {projects.length === 1 ? "Title" : "Titles"}
              </span>
            </div>
          )}
        </motion.div>
        <motion.div
          initial={{ scaleX: instant ? 1 : 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: instant ? 0 : getSectionDuration("categoryPages", 1.2), delay: instant ? 0 : getSectionDelay("categoryPages", 0.3), ease: [0.22, 1, 0.36, 1] }}
          style={{ originX: 0 }}
          className="h-px bg-foreground/15 mt-8 sm:mt-10"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <motion.div
          initial={{ opacity: instant ? 1 : 0.4 }}
          animate={{ opacity: [0.25, 0.7, 0.25] }}
          transition={instant ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex justify-center py-24"
        >
          <img src={BRAND.logo} alt="" aria-hidden className="h-6 w-auto object-contain" />
        </motion.div>
      )}

      {/* ═══ FEATURED — full-bleed, parallax ═══ */}
      {/*
        The ref-bearing container always mounts, even before `featured` exists
        (projects still loading). useScroll needs its target attached on the
        very first render — gating this whole block on `featured &&` meant the
        ref was still null when the hook mounted, which throws in production,
        not just in tests.
      */}
      <div
        ref={heroRef}
        className={`relative w-full overflow-hidden bg-secondary transition-[height] duration-300 ${
          featured ? "h-[68vh] sm:h-[85vh] lg:h-[92vh]" : "h-0"
        }`}
      >
        {featured && (
          <>
            <motion.div className="absolute inset-0" style={{ y: parallaxY, scale: instant ? 1 : 1.12 }}>
              <img src={featured.thumbnail} alt={featured.title} className="w-full h-full object-cover" />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/40 to-transparent" />
            <div className="film-grain absolute inset-0 z-10 pointer-events-none" />

            <img
              src={BRAND.logo}
              alt=""
              aria-hidden
              className="absolute top-6 sm:top-8 left-5 sm:left-8 md:left-12 h-5 sm:h-6 w-auto object-contain opacity-60 z-20"
            />
            <span
              aria-hidden
              className="pointer-events-none select-none font-display font-light text-foreground/[0.06] leading-none text-[7rem] sm:text-[10rem] md:text-[12rem] absolute top-0 right-5 sm:right-8 md:right-12 z-0"
            >
              01
            </span>

            {featured.youtube_id && <PlayGlyph size="md" />}

            <Link to={`/work/${featured.id}`} className="absolute inset-0 z-20 group">
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 md:p-12">
                {featured.status && (
                  <span className="font-body text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-foreground/50 mb-3 sm:mb-4 block">
                    {featured.status}
                  </span>
                )}
                <h2 className="font-display text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-foreground tracking-[0.02em] leading-[0.92] max-w-4xl transition-transform duration-700 group-hover:-translate-y-1">
                  {featured.title}
                </h2>
                <p className="mt-3 sm:mt-4 font-body text-[10px] sm:text-xs tracking-[0.2em] uppercase text-foreground/45">
                  {featured.role} · {featured.year}
                </p>
              </div>
            </Link>
          </>
        )}
      </div>

      {/* ═══ THE MOSAIC ═══ */}
      {rows.map((row, rowIndex) => {
        if (row.kind === "beat") {
          running += 1;
          const n = running;
          return (
            <div key={`beat-${row.item.id}`}>
              <div className="relative h-[52vh] sm:h-[64vh] overflow-hidden bg-secondary">
                <img src={row.item.thumbnail} alt={row.item.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <div className="film-grain absolute inset-0 z-10 pointer-events-none" />
                <span
                  aria-hidden
                  className="pointer-events-none select-none font-display font-light text-foreground/[0.06] leading-none text-[6rem] sm:text-[9rem] absolute top-0 left-5 sm:left-8 md:left-12"
                >
                  {String(n).padStart(2, "0")}
                </span>
                {row.item.youtube_id && <PlayGlyph size="md" />}
                <Link to={`/work/${row.item.id}`} className="absolute inset-0 z-20 group">
                  <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 md:p-12">
                    {row.item.status && (
                      <span className="font-body text-[8px] sm:text-[9px] tracking-[0.3em] uppercase text-foreground/45 mb-2 sm:mb-3 block">
                        {row.item.status}
                      </span>
                    )}
                    <h3 className="font-display text-2xl sm:text-4xl md:text-5xl font-light text-foreground tracking-[0.02em] leading-[0.95] max-w-3xl transition-transform duration-700 group-hover:-translate-y-1">
                      {row.item.title}
                    </h3>
                    <p className="mt-2 sm:mt-3 font-body text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-foreground/40">
                      {row.item.role} · {row.item.year}
                    </p>
                  </div>
                </Link>
              </div>
              {rowIndex < rows.length - 1 && <LogoDivider />}
            </div>
          );
        }

        if (row.kind === "solo") {
          running += 1;
          const n = running;
          return (
            <div key={`solo-${row.item.id}`} className="px-5 sm:px-8 md:px-12 pt-10 sm:pt-14 pb-16 sm:pb-24">
              <div className="max-w-md mx-auto sm:mx-0">
                <Tile
                  project={row.item}
                  index={n}
                  aspect="aspect-[3/4]"
                  instant={instant}
                  duration={getSectionDuration("categoryPages", 0.8)}
                  delay={0}
                  ease={ease}
                />
              </div>
            </div>
          );
        }

        // pair
        const [a, b] = row.items;
        running += 1;
        const nA = running;
        running += 1;
        const nB = running;
        const largeFirst = !row.reversed;

        return (
          <div key={`pair-${a.id}-${b.id}`} className="px-5 sm:px-8 md:px-12 pt-10 sm:pt-14 pb-10 sm:pb-14">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 sm:gap-8 md:gap-10 items-start">
              <div className={`sm:col-span-7 ${largeFirst ? "sm:order-1" : "sm:order-2"}`}>
                <Tile
                  project={a}
                  index={nA}
                  aspect="aspect-[16/11]"
                  instant={instant}
                  duration={getSectionDuration("categoryPages", 0.9)}
                  delay={instant ? 0 : getSectionDelay("categoryPages", 0.05)}
                  ease={ease}
                />
              </div>
              <div className={`sm:col-span-5 ${largeFirst ? "sm:order-2 sm:mt-16" : "sm:order-1 sm:mt-16"}`}>
                <Tile
                  project={b}
                  index={nB}
                  aspect="aspect-[3/4]"
                  instant={instant}
                  duration={getSectionDuration("categoryPages", 0.9)}
                  delay={instant ? 0 : getSectionDelay("categoryPages", 0.15)}
                  ease={ease}
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* Empty state */}
      {!isLoading && projects.length === 0 && (
        <motion.p
          initial={{ opacity: instant ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: instant ? 0 : getSectionDuration("categoryPages", 0.8), ease }}
          className="font-body text-sm text-foreground/30 tracking-[0.15em] uppercase text-center py-24"
        >
          Coming soon
        </motion.p>
      )}
    </div>
  );
};

export default WorkGallery;
