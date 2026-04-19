import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { motion } from "framer-motion";

import Navbar from "@/components/Navbar";
import { useHeroContent } from "@/hooks/useContent";
import { useAnimationSettings } from "@/hooks/useAnimationSettings";

import { SphereScene } from "./SphereScene";
import { PostStack } from "./PostStack";
import { useIntroTimeline } from "./useIntroTimeline";
import { useVideoTexture } from "./useVideoTexture";

export function CinematicIntro() {
  const { data: heroData } = useHeroContent();
  const { getSectionDuration, getSectionEase } = useAnimationSettings();

  const brandText  = heroData?.brand_text  ?? "DWINDIK";
  const tagline    = heroData?.tagline     ?? "Cre8te";
  const videoUrl   = heroData?.video_url   ?? "/dwindik/video1.mp4";
  const heroImage  = heroData?.hero_image  ?? "/dwindik/5.jpeg";

  /* Video texture — preloaded, muted, plays when phase = "video" */
  const { videoRef, textureRef: videoTextureRef } = useVideoTexture(videoUrl);

  /* Phase-driven timeline — always runs; accessibility accommodated by design */
  const { uniformsRef, textLightLevel, navbarVisible } = useIntroTimeline({
    disabled: false,
    videoRef,
  });

  /* DWINDIK color: near-background when dark, full foreground when lit */
  const textLum   = Math.round(textLightLevel * 90 + 2);
  const textColor = `hsl(0 0% ${textLum}%)`;
  const textGlow  = textLightLevel > 0.45
    ? `0 0 ${Math.round(60 * textLightLevel)}px rgba(255,245,230,${(0.09 * textLightLevel).toFixed(3)})`
    : "none";

  /* Snapshot uniforms for PostStack props (read from ref each render) */
  const bloomIntensity = uniformsRef.current?.bloomIntensity ?? 0;
  const caAmount       = uniformsRef.current?.caAmount       ?? 0;

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">

      {/* ── LAYER 0: Three.js canvas — behind everything ── */}
      <div className="absolute inset-0 z-0">
        <Canvas
          gl={{
            antialias: true,
            alpha: true,
            preserveDrawingBuffer: false,
            powerPreference: "high-performance",
          }}
          camera={{ fov: 42, near: 0.1, far: 100, position: [0, 0, 3.2] }}
          dpr={[1, 1.5]}
          style={{ background: "transparent" }}
        >
          <Suspense fallback={null}>
            <SphereScene
              uniformsRef={uniformsRef}
              videoTextureRef={videoTextureRef}
              portraitSrc={heroImage}
            />
            <PostStack bloomIntensity={bloomIntensity} caAmount={caAmount} />
          </Suspense>
        </Canvas>
      </div>

      {/* ── LAYER 1: Navbar — appears after identity phase completes ── */}
      {navbarVisible && <Navbar enterDelay={0} />}

      {/* ── LAYER 2: DWINDIK — revealed by light, not faded in ── */}
      <main className="h-screen flex items-center justify-center relative z-10 pointer-events-none select-none">
        <h1
          className="font-display font-light tracking-[0.25em] uppercase leading-none text-[16vw] md:text-[13vw] lg:text-[11vw]"
          style={{
            color: textColor,
            textShadow: textGlow,
            /* Direct style mutation from timeline — no CSS transition */
            transition: "none",
          }}
        >
          {brandText}
        </h1>

        {/* Tagline — fades in after done */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{
            opacity: navbarVisible ? 0.2 : 0,
            y: navbarVisible ? 0 : 14,
          }}
          transition={{
            duration: getSectionDuration("homeHero", 1.4),
            ease: getSectionEase("homeHero"),
            delay: 0.5,
          }}
          className="absolute bottom-10 sm:bottom-14 left-0 right-0 text-center px-4 font-body text-[11px] sm:text-[12px] tracking-[0.45em] sm:tracking-[0.6em] uppercase"
          style={{ color: "hsl(0 0% 92%)" }}
        >
          {tagline}
        </motion.p>
      </main>
    </div>
  );
}
