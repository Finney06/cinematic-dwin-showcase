import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { useHeroContent, useLatestProjects } from "@/hooks/useContent";
import { useAnimationSettings } from "@/hooks/useAnimationSettings";

/* ─── Types ─────────────────────────────────────────────── */

type EclipsePhase =
  | "void"      // Total darkness
  | "corona"    // Bright light wrapping around one corner — circle is SMALL
  | "dim"       // Light dims, circle EXPANDS to full size
  | "video"     // Video plays inside the circle (waits until video ends)
  | "reveal"    // Hero image + DWINDIK text revealed
  | "done";     // Light gone completely — final state

const PHASE_ORDER: EclipsePhase[] = [
  "void", "corona", "dim", "video", "reveal", "done",
];

/** Timed phases (ms at speed=1). "reveal" is NOT timed — it's triggered by video end. */
const PHASE_TIMING: Partial<Record<EclipsePhase, number>> = {
  void: 0,
  corona: 650,
  dim: 3200,
  video: 4200,
  // reveal: triggered by video onEnded
  // done: reveal + 2000ms
};

/* ─── Helpers ───────────────────────────────────────────── */

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

function phaseIndex(p: EclipsePhase): number {
  return PHASE_ORDER.indexOf(p);
}

function isAtLeast(current: EclipsePhase, target: EclipsePhase): boolean {
  return phaseIndex(current) >= phaseIndex(target);
}

/* ─── Component ─────────────────────────────────────────── */

const Index = () => {
  const shouldReduceMotion = useReducedMotion();
  const {
    getSectionDuration,
    getSectionDelay,
    getSectionEase,
    enabled,
    isSectionEnabled,
    speed,
  } = useAnimationSettings();
  const sectionEnabled = isSectionEnabled("homeHero");
  const instant = shouldReduceMotion || !sectionEnabled;
  const sectionEase = getSectionEase("homeHero");

  const isOgPreview =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("og");

  const [phase, setPhase] = useState<EclipsePhase>(
    isOgPreview || instant ? "done" : "void"
  );
  const videoRef = useRef<HTMLVideoElement>(null);

  const { data: heroData } = useHeroContent();
  const { data: latestProjects } = useLatestProjects(5);

  const brandText = heroData?.brand_text || "DWINDIK";
  const tagline = heroData?.tagline || "Cre8te";
  const videoUrl = heroData?.video_url || "/dwindik/video1.mp4";
  const heroImage = heroData?.hero_image || "/dwindik/5.jpeg";
  const heroLink =
    heroData?.hero_link || "https://youtu.be/mPAZSvF5usk?si=IxaXZFE0nJZw0ypt";
  const canPlayHeroVideo = isPlayableVideoSource(videoUrl);

  /* ─ Phase progression (timed phases only) ─ */
  useEffect(() => {
    if (isOgPreview || instant) return;
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Only schedule timed phases (void → corona → dim → video)
    Object.entries(PHASE_TIMING).forEach(([p, ms]) => {
      if (p === "void" || ms === undefined) return;
      timers.push(setTimeout(() => setPhase(p as EclipsePhase), ms / speed));
    });

    return () => timers.forEach(clearTimeout);
  }, [isOgPreview, instant, speed]);

  /* ─ Play video when "video" phase starts ─ */
  useEffect(() => {
    if (phase !== "video" || !canPlayHeroVideo) return;
    const vid = videoRef.current;
    if (!vid) return;
    vid.currentTime = 0;
    vid.play().catch(() => {});
  }, [phase, canPlayHeroVideo]);

  /* ─ Video ended → trigger reveal ─ */
  const handleVideoEnded = useCallback(() => {
    if (phase === "video") {
      setPhase("reveal");
      // Schedule "done" after the reveal animation completes
      setTimeout(() => setPhase("done"), 2200 / speed);
    }
  }, [phase, speed]);

  /* ─ Fallback: if no video, auto-advance from video → reveal ─ */
  useEffect(() => {
    if (phase === "video" && !canPlayHeroVideo) {
      const timer = setTimeout(() => {
        setPhase("reveal");
        setTimeout(() => setPhase("done"), 2200 / speed);
      }, 2000 / speed);
      return () => clearTimeout(timer);
    }
  }, [phase, canPlayHeroVideo, speed]);

  /* ─ Derived ─ */
  const isDone = phase === "done";
  const showText = isAtLeast(phase, "reveal");
  const showTagline = isAtLeast(phase, "done");

  const introBackgroundColor = (() => {
    if (isDone) return "hsl(0 0% 2%)";
    switch (phase) {
      case "corona": return "hsl(225 20% 8%)";
      case "dim": return "hsl(225 12% 5%)";
      case "video": return "hsl(0 0% 3%)";
      case "reveal": return "hsl(0 0% 2.5%)";
      default: return "#000";
    }
  })();

  /* Circle SCALE — starts small during corona, expands when light dims */
  const circleScale = (() => {
    if (instant || isOgPreview) return 1;
    switch (phase) {
      case "void": return 0.9;
      case "corona": return 0.9;
      case "dim": return 1;      // expands to full
      case "video": return 1;
      case "reveal": return 1;
      case "done": return 1;
      default: return 1;
    }
  })();

  const circleGlowClass = (() => {
    switch (phase) {
      case "void": return "eclipse-glow-none";
      case "corona": return "eclipse-glow-intense";
      case "dim": return "eclipse-glow-dim";
      case "video": return "eclipse-glow-subtle";
      default: return "eclipse-glow-final";
    }
  })();

  const letterContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: instant ? 0 : getSectionDuration("homeHero", 0.12),
        delayChildren: 0,
      },
    },
  };

  const letterVariant = {
    hidden: { y: "110%", opacity: 0 },
    visible: {
      y: "0%",
      opacity: 1,
      transition: {
        duration: instant ? 0 : getSectionDuration("homeHero", 1),
        ease: sectionEase,
      },
    },
  };

  const navbarEnterDelay =
    isOgPreview || instant ? 0 : 8.5 / speed;

  /* ═══════════════════════════════════════════════════════ */
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundColor: introBackgroundColor,
        transition: "background-color 1.9s ease",
      }}
    >
      <Navbar enterDelay={navbarEnterDelay} />

      <main className="h-screen flex items-center justify-center relative overflow-hidden">

        {/* ─── AMBIENT BACKGROUND BLOOM ─── */}
        {/* Huge blurred glow that lights up the upper-left of the viewport */}
        <motion.div
          className="absolute pointer-events-none z-0"
          style={{
            top: "-36%",
            left: "4%",
            width: "74vw",
            height: "74vw",
            maxWidth: "760px",
            maxHeight: "760px",
            background: `radial-gradient(
              ellipse 58% 54% at 50% 62%,
              rgba(255,255,255,0.62) 0%,
              rgba(255,255,255,0.28) 26%,
              rgba(255,255,255,0.08) 50%,
              rgba(255,255,255,0.02) 66%,
              transparent 84%
            )`,
            filter: "blur(70px)",
          }}
          animate={{
            opacity:
              phase === "void" ? 0 :
              phase === "corona" ? [0.16, 0.62, 0.34] :
              phase === "dim" ? 0.22 :
              phase === "video" ? 0.12 :
              0,
            scale:
              phase === "corona" ? [0.92, 1.05, 0.97] :
              1,
          }}
          transition={{
            duration: getSectionDuration("homeHero", phase === "corona" ? 2.4 : 2.2),
            times: phase === "corona" ? [0, 0.3, 1] : undefined,
            ease: phase === "corona" ? [0.12, 0.9, 0.24, 1] : sectionEase,
          }}
        />

        {/* ─── CIRCLE GROUP ─── */}
        <motion.div
          className="absolute z-[2]"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            /* Circle starts SMALL and EXPANDS when light dims */
            scale: circleScale,
          }}
          transition={{
            duration: instant ? 0 : getSectionDuration("homeHero",
              phase === "dim" ? 2.0 : 1.6
            ),
            delay: instant ? 0 : getSectionDelay("homeHero", 0.15),
            ease: [0.22, 1, 0.36, 1], // smooth ease-out for expansion
          }}
          style={{ perspective: "800px" }}
        >
          <div className="relative w-[80vw] h-[80vw] sm:w-[75vw] sm:h-[75vw] md:w-[55vw] md:h-[55vw] lg:w-[45vw] lg:h-[45vw] translate-x-2 sm:translate-x-3 md:translate-x-5 lg:translate-x-7">

            {/* SIMPLE ECLIPSE LIGHT — bright first, then dim */}
            <motion.div
              className="absolute pointer-events-none"
              style={{
                top: "-52%",
                left: "-12%",
                width: "124%",
                height: "124%",
                background: `radial-gradient(
                  circle at 52% 50%,
                  rgba(255,255,255,0.95) 0%,
                  rgba(255,255,255,0.45) 28%,
                  rgba(255,255,255,0.14) 52%,
                  transparent 74%
                )`,
                filter: "blur(52px)",
                zIndex: -1,
              }}
              animate={{
                opacity:
                  phase === "void" ? 0 :
                  phase === "corona" ? [1, 0.62, 0.34] :
                  phase === "dim" ? 0.22 :
                  phase === "video" ? 0.08 :
                  0,
                scale:
                  phase === "void" ? 0.25 :
                  phase === "corona" ? [1.24, 0.98, 0.74] :
                  phase === "dim" ? 0.76 :
                  0.6,
                x:
                  phase === "corona" ? [0, -8, -16] :
                  phase === "dim" ? -10 :
                  0,
                y:
                  phase === "corona" ? [0, 4, 9] :
                  phase === "dim" ? 6 :
                  0,
                filter:
                  phase === "corona" ? ["blur(62px)", "blur(48px)", "blur(40px)"] :
                  phase === "dim" ? "blur(42px)" :
                  "blur(52px)",
              }}
              transition={{
                duration: getSectionDuration("homeHero", phase === "corona" ? 2.2 : 1.4),
                times: phase === "corona" ? [0, 0.34, 1] : undefined,
                ease: phase === "corona" ? [0.1, 0.92, 0.22, 1] : sectionEase,
              }}
            />

            <motion.div
              className="absolute pointer-events-none"
              style={{
                top: "-8%",
                left: "8%",
                width: "56%",
                height: "50%",
                background: `radial-gradient(
                  ellipse 62% 58% at 56% 66%,
                  rgba(255,255,255,1) 0%,
                  rgba(255,255,255,0.7) 28%,
                  rgba(255,255,255,0.2) 55%,
                  transparent 82%
                )`,
                filter: "blur(10px)",
                zIndex: 16,
              }}
              animate={{
                opacity:
                  phase === "void" ? 0 :
                  phase === "corona" ? [0.9, 0.52, 0.14] :
                  phase === "dim" ? 0.16 :
                  0,
                scale:
                  phase === "void" ? 0.4 :
                  phase === "corona" ? [1.12, 0.96, 0.8] :
                  phase === "dim" ? 0.74 :
                  0.6,
                x:
                  phase === "corona" ? [0, -5, -10] :
                  phase === "dim" ? -6 :
                  0,
                y:
                  phase === "corona" ? [0, 2, 4] :
                  phase === "dim" ? 3 :
                  0,
              }}
              transition={{
                duration: getSectionDuration("homeHero", phase === "corona" ? 2.0 : 1.3),
                times: phase === "corona" ? [0, 0.3, 1] : undefined,
                ease: phase === "corona" ? [0.15, 0.88, 0.25, 1] : sectionEase,
              }}
            />

            <motion.div
              className="absolute pointer-events-none rounded-full"
              style={{
                top: "-12%",
                left: "-12%",
                width: "124%",
                height: "124%",
                background: `radial-gradient(
                  circle,
                  transparent 74%,
                  rgba(255,255,255,0.32) 78%,
                  rgba(255,255,255,0.1) 82%,
                  transparent 90%
                )`,
                filter: "blur(5px)",
                zIndex: -1,
              }}
              animate={{
                opacity:
                  phase === "void" ? 0 :
                  phase === "corona" ? [0.75, 1, 0.4] :
                  phase === "dim" ? 0.28 :
                  phase === "video" ? 0.1 :
                  0,
                scale:
                  phase === "corona" ? [1.02, 1.08, 1] :
                  1,
              }}
              transition={{
                duration: getSectionDuration("homeHero", phase === "corona" ? 2.05 : 1.4),
                times: phase === "corona" ? [0, 0.24, 1] : undefined,
                ease: phase === "corona" ? [0.16, 0.85, 0.26, 1] : sectionEase,
              }}
            />

            {/* ══ THE DARK CIRCLE ══ */}
            <a
              href={heroLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-full rounded-full cursor-pointer"
            >
              <motion.div
                className={`circle-media w-full h-full rounded-full relative overflow-hidden eclipse-circle ${circleGlowClass}`}
                animate={
                  enabled && sectionEnabled && !instant && isDone
                    ? { rotateX: [0, 1.5, -1, 0], rotateY: [0, -2, 1.5, 0] }
                    : { rotateX: 0, rotateY: 0 }
                }
                transition={
                  enabled && sectionEnabled && !instant && isDone
                    ? {
                        duration: getSectionDuration("homeHero", 10),
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "mirror",
                      }
                    : { duration: 0 }
                }
                style={{
                  transformStyle: "preserve-3d",
                  background: "hsl(0 0% 5%)",
                }}
              >
                {/* White Exposure — soft glow inside circle as light pushes through */}
                <motion.div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    zIndex: 5,
                    background: `radial-gradient(
                      circle at 39% 24%,
                      rgba(255,255,255,1) 0%,
                      rgba(255,255,255,0.72) 24%,
                      rgba(255,255,255,0.24) 52%,
                      transparent 78%
                    )`,
                  }}
                  animate={{
                    opacity:
                      phase === "corona" ? [0.12, 0.36, 0.58] :
                      phase === "dim" ? 0.3 :
                      phase === "video" ? 0.08 :
                      0,
                    scale:
                      phase === "corona" ? [0.92, 1.02, 1.08] :
                      phase === "dim" ? 0.96 :
                      phase === "video" ? 1.05 :
                      0.3,
                    x:
                      phase === "corona" ? [0, 3, 6] :
                      0,
                    y:
                      phase === "corona" ? [0, 1, 2] :
                      0,
                  }}
                  transition={{
                    duration: getSectionDuration("homeHero", phase === "corona" ? 1.9 : 1.2),
                    times: phase === "corona" ? [0, 0.24, 1] : undefined,
                    ease: phase === "corona" ? [0.2, 0.86, 0.28, 1] : sectionEase,
                  }}
                />

                {/* Video — plays to completion, then triggers reveal */}
                {canPlayHeroVideo && (
                  <motion.div
                    className="absolute inset-0 rounded-full overflow-hidden"
                    style={{ zIndex: 3 }}
                    animate={{
                      opacity:
                        phase === "video" ? 1 :
                        phase === "reveal" ? 0 :
                        0,
                    }}
                    transition={{
                      duration: getSectionDuration("homeHero", 0.8),
                      ease: sectionEase,
                    }}
                  >
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      src={videoUrl}
                      muted
                      playsInline
                      preload="auto"
                      onEnded={handleVideoEnded}
                    />
                  </motion.div>
                )}

                {/* Hero Image — final reveal */}
                {isAtLeast(phase, "reveal") && (
                  <div
                    className="absolute inset-0 rounded-full overflow-hidden"
                    style={{ zIndex: 4 }}
                  >
                    {isOgPreview || instant ? (
                      <>
                        <img className="w-full h-full object-cover" src={heroImage} alt={brandText} />
                        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.15)" }} />
                      </>
                    ) : (
                      <>
                        <motion.div
                          className="absolute inset-0"
                          initial={{
                            clipPath: "polygon(0% 0%, 0% 0%, -4% 15%, -8% 30%, -10% 50%, -8% 70%, -4% 85%, 0% 100%, 0% 100%)",
                          }}
                          animate={{
                            clipPath: "polygon(0% 0%, 115% 0%, 111% 15%, 107% 30%, 105% 50%, 107% 70%, 111% 85%, 115% 100%, 0% 100%)",
                          }}
                          transition={{
                            duration: getSectionDuration("homeHero", 1.4),
                            delay: getSectionDelay("homeHero", 0.15),
                            ease: sectionEase,
                          }}
                        >
                          <img className="w-full h-full object-cover" src={heroImage} alt={brandText} />
                          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.15)" }} />
                        </motion.div>
                        <motion.div
                          className="absolute pointer-events-none"
                          initial={{ left: "-10%" }}
                          animate={{ left: "105%" }}
                          transition={{
                            duration: getSectionDuration("homeHero", 1.4),
                            delay: getSectionDelay("homeHero", 0.15),
                            ease: sectionEase,
                          }}
                          style={{
                            top: "-5%", width: "14%", height: "110%", zIndex: 20,
                            background: "radial-gradient(ellipse 50% 45% at 50% 50%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.12) 50%, transparent 100%)",
                            filter: "blur(8px)", borderRadius: "50%",
                          }}
                        />
                        <motion.div
                          className="absolute pointer-events-none"
                          initial={{ left: "-22%" }}
                          animate={{ left: "100%" }}
                          transition={{
                            duration: getSectionDuration("homeHero", 1.6),
                            delay: getSectionDelay("homeHero", 0.15),
                            ease: sectionEase,
                          }}
                          style={{
                            top: "-10%", width: "28%", height: "120%", zIndex: 20,
                            background: "radial-gradient(ellipse 45% 40% at 50% 50%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.04) 50%, transparent 100%)",
                            filter: "blur(18px)", borderRadius: "50%",
                          }}
                        />
                      </>
                    )}
                  </div>
                )}

                {/* Specular highlight */}
                <div
                  className="absolute pointer-events-none rounded-full"
                  style={{
                    top: "5%", left: "12%", width: "40%", height: "20%", zIndex: 10,
                    background: "radial-gradient(ellipse, rgba(255,255,255,0.07) 0%, transparent 70%)",
                    filter: "blur(8px)", transform: "rotate(-12deg)",
                  }}
                />
              </motion.div>
            </a>
          </div>
        </motion.div>

        {/* ═══ DWINDIK TEXT ═══ */}
        {showText && (
          <motion.h1
            className="relative z-10 flex items-center overflow-hidden"
            variants={letterContainer}
            initial="hidden"
            animate="visible"
          >
            {brandText.split("").map((letter, i) => (
              <span key={i} className="inline-block overflow-hidden">
                <motion.span
                  variants={letterVariant}
                  className="font-display text-[16vw] md:text-[13vw] lg:text-[11vw] font-light tracking-[0.12em] sm:tracking-[0.15em] md:tracking-[0.25em] text-foreground leading-none uppercase select-none inline-block"
                >
                  {letter}
                </motion.span>
              </span>
            ))}
          </motion.h1>
        )}

        {/* ═══ ROTATING ARC ═══ */}
        {phase === "reveal" && (
          <motion.div
            className="absolute z-5 pointer-events-none"
            initial={{ opacity: 0, rotate: 0, scale: 1 }}
            animate={{
              opacity: [0, 0.6, 0.6, 0],
              rotate: [0, 360],
              scale: [1, 1, 0.15],
            }}
            transition={{
              duration: getSectionDuration("homeHero", 2.0),
              ease: sectionEase,
              times: [0, 0.08, 0.65, 1],
            }}
          >
            <svg width="320" height="320" viewBox="0 0 320 320"
              className="w-[70vw] h-[70vw] md:w-[50vw] md:h-[50vw] lg:w-[42vw] lg:h-[42vw]">
              <circle cx="160" cy="160" r="155" fill="none" stroke="hsl(0 0% 92%)"
                strokeWidth="1" strokeOpacity="0.8" strokeDasharray="50 900" strokeLinecap="round" />
            </svg>
          </motion.div>
        )}

        {/* ═══ TAGLINE ═══ */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: showTagline ? 0.2 : 0, y: showTagline ? 0 : 16 }}
          transition={{
            duration: instant ? 0 : getSectionDuration("homeHero", 1.2),
            ease: sectionEase,
          }}
          className="absolute bottom-10 sm:bottom-14 left-0 right-0 text-center px-4 font-body text-[11px] sm:text-[12px] tracking-[0.35em] sm:tracking-[0.6em] uppercase text-foreground"
        >
          {tagline}
        </motion.p>
      </main>
    </div>
  );
};

export default Index;
