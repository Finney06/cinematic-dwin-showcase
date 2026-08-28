import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { useHeroContent } from "@/hooks/useContent";
import HeroAtmosphere, { parseHeroAtmosphere, parseHeroAtmosphereIntensity } from "@/components/site/HeroAtmosphere";
import { useAnimationSettings } from "@/hooks/useAnimationSettings";
import { BRAND, orEmpty } from "@/lib/brand";

const VIDEO_START_DELAY = 1800;
/** How long the opening clip runs before the logo takes the circle. */
const HERO_CLIP_DURATION = 8000;

/** Space kept clear above and below the hero circle so it never collides with the tagline. */
const HERO_VERTICAL_RESERVE = 180;

type Phase = "idle" | "video" | "image";

const YOUTUBE_ID_PATTERNS = [
  /youtu\.be\/([\w-]{6,})/,
  /\/shorts\/([\w-]{6,})/,
  /[?&]v=([\w-]{6,})/,
  /\/embed\/([\w-]{6,})/,
];

function getYouTubeId(url?: string): string {
  if (!url) return "";
  for (const pattern of YOUTUBE_ID_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return "";
}

/** `?t=` / `?start=` on the hero clip picks the moment the circle opens on. */
function getYouTubeStart(url?: string): number {
  const match = url?.match(/[?&](?:t|start)=(\d+)/);
  return match ? Number(match[1]) : 0;
}

function isPlayableVideoSource(url?: string): boolean {
  if (!url) return false;
  const input = url.trim();
  if (!input) return false;

  const allowed = /\.(mp4|webm|mov|ogg)(\?.*)?$/i;
  if (input.startsWith("/")) return allowed.test(input);

  try {
    const parsed = new URL(input);
    return allowed.test(parsed.pathname + parsed.search);
  } catch {
    return false;
  }
}

/**
 * Home is the hero and nothing else — a single, non-scrolling screen. The
 * studio statement, slate preview, and founder credit that used to live below
 * it now live on their own pages (About, Work) instead of being repeated here.
 */
const Index = () => {
  const shouldReduceMotion = useReducedMotion();
  const { getSectionDuration, getSectionDelay, getSectionEase, enabled, isSectionEnabled } = useAnimationSettings();
  const sectionEnabled = isSectionEnabled("homeHero");
  const instant = shouldReduceMotion || !sectionEnabled;
  const sectionEase = getSectionEase("homeHero");

  const isOgPreview =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("og");
  const [phase, setPhase] = useState<Phase>(isOgPreview ? "image" : "idle");
  const videoRef = useRef<HTMLVideoElement>(null);

  const { data: heroData } = useHeroContent();
  const atmosphere = parseHeroAtmosphere(heroData?.hero_atmosphere);
  const atmosphereIntensity = parseHeroAtmosphereIntensity(heroData?.hero_atmosphere_intensity);

  const brandText = orEmpty(heroData?.brand_text) || BRAND.name;
  const tagline = orEmpty(heroData?.tagline) || BRAND.tagline;
  /** Opening clip: a YouTube cut from the slate, or an uploaded video file. */
  const clipUrl = orEmpty(heroData?.video_url) || BRAND.heroClip;
  const clipYouTubeId = getYouTubeId(clipUrl);
  const clipIsPortrait = /\/shorts\//.test(clipUrl);
  const clipStart = getYouTubeStart(clipUrl);
  const canPlayHeroVideo = Boolean(clipYouTubeId) || isPlayableVideoSource(clipUrl);
  /** What the circle holds once the clip has run — the logo, unless admin sets a still. */
  const heroStill = orEmpty(heroData?.hero_image) || BRAND.logo;
  const stillIsLogo = heroStill === BRAND.logo;
  const stillClassName = stillIsLogo ? "w-full h-full object-contain" : "w-full h-full object-cover";
  const heroLink = heroData?.hero_link || "/work";
  const isExternalHeroLink = /^https?:\/\//i.test(heroLink);

  useEffect(() => {
    if (isOgPreview) return;
    const t = setTimeout(
      () => setPhase(canPlayHeroVideo && !instant ? "video" : "image"),
      instant ? 0 : VIDEO_START_DELAY
    );
    return () => clearTimeout(t);
  }, [isOgPreview, canPlayHeroVideo, instant]);

  // A YouTube clip runs for a preset window; an uploaded file plays to its end.
  useEffect(() => {
    if (isOgPreview) return;
    if (phase !== "video") return;

    if (clipYouTubeId) {
      const t = setTimeout(() => setPhase("image"), HERO_CLIP_DURATION);
      return () => clearTimeout(t);
    }

    const vid = videoRef.current;
    if (!vid) return;
    vid.currentTime = 0;
    vid.playbackRate = 1;
    vid.play().catch(() => {});
    const onEnded = () => setPhase("image");
    const onError = () => setPhase("image");
    vid.addEventListener("ended", onEnded);
    vid.addEventListener("error", onError);
    return () => {
      vid.removeEventListener("ended", onEnded);
      vid.removeEventListener("error", onError);
    };
  }, [phase, isOgPreview, clipYouTubeId]);

  const heroCircle = (
    <motion.div
      className="circle-media w-[80vw] sm:w-[75vw] md:w-[55vw] lg:w-[45vw] aspect-square rounded-full relative overflow-hidden"
      animate={enabled && sectionEnabled && !instant ? { rotateX: [0, 1.5, -1, 0], rotateY: [0, -2, 1.5, 0] } : { rotateX: 0, rotateY: 0 }}
      transition={enabled && sectionEnabled && !instant ? { duration: getSectionDuration("homeHero", 10), ease: "easeInOut", repeat: Infinity, repeatType: "mirror" } : { duration: 0 }}
      style={{
        transformStyle: "preserve-3d",
        background: "hsl(0 0% 10%)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 0 80px rgba(0,0,0,0.4), 0 30px 80px rgba(0,0,0,0.35)",
        maxWidth: `calc(100svh - ${HERO_VERTICAL_RESERVE}px)`,
      }}
    >
      {clipYouTubeId ? (
        phase === "video" && (
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <iframe
              // Muted, chromeless and unclickable: the clip is texture, not a player.
              src={
                `https://www.youtube.com/embed/${clipYouTubeId}?autoplay=1&mute=1&controls=0` +
                `&loop=1&playlist=${clipYouTubeId}&playsinline=1&modestbranding=1&rel=0` +
                `&disablekb=1&fs=0&iv_load_policy=3&vq=hd1080` +
                (clipStart ? `&start=${clipStart}` : "")
              }
              title={`${brandText} — opening clip`}
              allow="autoplay; encrypted-media"
              tabIndex={-1}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-0"
              style={
                clipIsPortrait
                  ? { width: "100%", height: "177.78%" }
                  : { width: "177.78%", height: "100%" }
              }
            />
          </div>
        )
      ) : (
        canPlayHeroVideo && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full rounded-full"
            src={clipUrl}
            muted
            playsInline
            preload="auto"
            style={{
              objectFit: "cover",
              opacity: phase === "video" ? 1 : 0,
              transition: "opacity 0.3s linear",
            }}
          />
        )
      )}
      {phase === "image" && heroStill && (
        <div className="absolute inset-0 rounded-full overflow-hidden">
          {isOgPreview ? (
            <div className={stillIsLogo ? "absolute inset-0 bg-black" : "absolute inset-0"}>
              <img className={stillClassName} src={heroStill} alt="" aria-hidden />
              {!stillIsLogo && <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.15)" }} />}
            </div>
          ) : (
            <>
              <motion.div
                className={stillIsLogo ? "absolute inset-0 bg-black" : "absolute inset-0"}
                initial={instant ? {
                  clipPath: "polygon(0% 0%, 115% 0%, 111% 15%, 107% 30%, 105% 50%, 107% 70%, 111% 85%, 115% 100%, 0% 100%)",
                } : {
                  clipPath: "polygon(0% 0%, 0% 0%, -4% 15%, -8% 30%, -10% 50%, -8% 70%, -4% 85%, 0% 100%, 0% 100%)",
                }}
                animate={{
                  clipPath: "polygon(0% 0%, 115% 0%, 111% 15%, 107% 30%, 105% 50%, 107% 70%, 111% 85%, 115% 100%, 0% 100%)",
                }}
                transition={{ duration: instant ? 0 : getSectionDuration("homeHero", 1.4), delay: instant ? 0 : getSectionDelay("homeHero", 0.15), ease: sectionEase }}
              >
                <img className={stillClassName} src={heroStill} alt="" aria-hidden />
                {!stillIsLogo && <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.15)" }} />}
              </motion.div>
              <motion.div
                className="absolute pointer-events-none z-20"
                initial={{ left: instant ? "105%" : "-10%" }}
                animate={{ left: "105%" }}
                transition={{ duration: instant ? 0 : getSectionDuration("homeHero", 1.4), delay: instant ? 0 : getSectionDelay("homeHero", 0.15), ease: sectionEase }}
                style={{
                  top: "-5%", width: "14%", height: "110%",
                  background: "radial-gradient(ellipse 50% 45% at 50% 50%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.12) 50%, transparent 100%)",
                  filter: "blur(8px)", borderRadius: "50%",
                }}
              />
              <motion.div
                className="absolute pointer-events-none z-20"
                initial={{ left: instant ? "100%" : "-22%" }}
                animate={{ left: "100%" }}
                transition={{ duration: instant ? 0 : getSectionDuration("homeHero", 1.6), delay: instant ? 0 : getSectionDelay("homeHero", 0.15), ease: sectionEase }}
                style={{
                  top: "-10%", width: "28%", height: "120%",
                  background: "radial-gradient(ellipse 45% 40% at 50% 50%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.04) 50%, transparent 100%)",
                  filter: "blur(18px)", borderRadius: "50%",
                }}
              />
            </>
          )}
        </div>
      )}
      <div
        className="absolute pointer-events-none z-10 rounded-full"
        style={{
          top: "5%", left: "12%", width: "40%", height: "20%",
          background: "radial-gradient(ellipse, rgba(255,255,255,0.07) 0%, transparent 70%)",
          filter: "blur(8px)", transform: "rotate(-12deg)",
        }}
      />

      {/* The wordmark itself is the logo artwork above; this names it for readers. */}
      <h1 className="sr-only">{brandText}</h1>
    </motion.div>
  );

  return (
    <div className="bg-background h-[100svh] overflow-hidden relative">
      <Navbar enterDelay={isOgPreview ? 0 : 2.4} />

      <main className="h-[100svh] flex items-center justify-center relative overflow-hidden">
        {/* Atmosphere — light behind the circle, once the opening has played out */}
        <HeroAtmosphere
          variant={isOgPreview ? "off" : atmosphere}
          circleMaxWidth={`calc(100svh - ${HERO_VERTICAL_RESERVE}px)`}
          visible={phase === "image"}
          intensity={atmosphereIntensity}
        />

        {/* Circle */}
        <motion.div
          className="absolute z-0 translate-x-4 sm:translate-x-6 md:translate-x-10 lg:translate-x-14"
          initial={{ opacity: instant ? 1 : 0, scale: instant ? 1 : 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: isOgPreview || instant ? 0 : getSectionDuration("homeHero", 1.8),
            delay: isOgPreview || instant ? 0 : getSectionDelay("homeHero", 0.3),
            ease: sectionEase,
          }}
          style={{ perspective: "800px" }}
        >
          {isExternalHeroLink ? (
            <a
              href={heroLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-full cursor-pointer"
            >
              {heroCircle}
            </a>
          ) : heroLink ? (
            <Link to={heroLink} className="block rounded-full cursor-pointer">
              {heroCircle}
            </Link>
          ) : (
            <div className="block rounded-full">{heroCircle}</div>
          )}
        </motion.div>

        {/* Rotating arc */}
        <motion.div
          className="absolute z-5 pointer-events-none"
          initial={{ opacity: instant ? 0 : 0, rotate: 0, scale: 1 }}
          animate={{
            opacity: isOgPreview ? 0 : [0, 0.6, 0.6, 0],
            rotate: [0, 360],
            scale: isOgPreview ? 1 : [1, 1, 0.15],
          }}
          transition={{
            duration: isOgPreview || instant ? 0 : getSectionDuration("homeHero", 2.2),
            delay: isOgPreview || instant ? 0 : getSectionDelay("homeHero", 0.2),
            ease: sectionEase,
            times: [0, 0.08, 0.65, 1],
          }}
        >
          <svg
            width="320"
            height="320"
            viewBox="0 0 320 320"
            className="w-[70vw] h-[70vw] md:w-[50vw] md:h-[50vw] lg:w-[42vw] lg:h-[42vw]"
            style={{
              maxWidth: `calc((100svh - ${HERO_VERTICAL_RESERVE}px) * 0.92)`,
              maxHeight: `calc((100svh - ${HERO_VERTICAL_RESERVE}px) * 0.92)`,
            }}
          >
            <circle cx="160" cy="160" r="155" fill="none" stroke="hsl(0 0% 92%)" strokeWidth="1" strokeOpacity="0.8" strokeDasharray="50 900" strokeLinecap="round" />
          </svg>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: instant ? 1 : 0, y: instant ? 0 : 16 }}
          animate={{ opacity: 0.2, y: 0 }}
          transition={{ duration: isOgPreview || instant ? 0 : getSectionDuration("homeHero", 1.2), delay: isOgPreview || instant ? 0 : getSectionDelay("homeHero", 2.6), ease: sectionEase }}
          className="absolute bottom-10 sm:bottom-14 left-0 right-0 text-center px-4 font-body text-[11px] sm:text-[12px] tracking-[0.35em] sm:tracking-[0.6em] uppercase text-foreground"
        >
          {tagline}
        </motion.p>
      </main>
    </div>
  );
};

export default Index;
