import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useHeroContent, useLatestProjects } from "@/hooks/useContent";

const VIDEO_START_DELAY = 1800;

const letterContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.5 },
  },
};

const letterVariant = {
  hidden: { y: "110%", opacity: 0 },
  visible: {
    y: "0%",
    opacity: 1,
    transition: { duration: 1, ease: [0.22, 1, 0.36, 1] as const },
  },
};

type Phase = "idle" | "video" | "image";

const Index = () => {
  const isOgPreview =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("og");
  const [phase, setPhase] = useState<Phase>(isOgPreview ? "image" : "idle");
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const { data: heroData } = useHeroContent();
  const { data: latestProjects } = useLatestProjects(5);

  const brandText = heroData?.brand_text || "DWINDIK";
  const tagline = heroData?.tagline || "Cre8te";
  const videoUrl = heroData?.video_url || "/dwindik/video1.mp4";
  const heroImage = heroData?.hero_image || "/dwindik/5.jpeg";
  const heroLink = heroData?.hero_link || "https://youtu.be/mPAZSvF5usk?si=IxaXZFE0nJZw0ypt";

  useEffect(() => {
    if (isOgPreview) return;
    const t = setTimeout(() => setPhase("video"), VIDEO_START_DELAY);
    return () => clearTimeout(t);
  }, [isOgPreview]);

  useEffect(() => {
    if (isOgPreview) return;
    if (phase !== "video") return;
    const vid = videoRef.current;
    if (!vid) return;
    vid.currentTime = 0;
    vid.playbackRate = 1;
    vid.play().catch(() => {});
    const onEnded = () => setPhase("image");
    vid.addEventListener("ended", onEnded);
    return () => vid.removeEventListener("ended", onEnded);
  }, [phase, isOgPreview]);

  return (
    <div className="bg-background min-h-screen relative">
      <Navbar enterDelay={isOgPreview ? 0 : 2.4} />

      {/* ═══ HERO ═══ */}
      <main className="h-screen flex items-center justify-center relative overflow-hidden">
        {/* Circle */}
        <motion.div
          className="absolute z-0 translate-x-4 sm:translate-x-6 md:translate-x-10 lg:translate-x-14"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: isOgPreview ? 0 : 1.8, delay: isOgPreview ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ perspective: "800px" }}
        >
          <a
            href={heroLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-full cursor-pointer"
          >
            <motion.div
              className="circle-media w-[80vw] h-[80vw] sm:w-[75vw] sm:h-[75vw] md:w-[55vw] md:h-[55vw] lg:w-[45vw] lg:h-[45vw] rounded-full relative"
              animate={{ rotateX: [0, 1.5, -1, 0], rotateY: [0, -2, 1.5, 0] }}
              transition={{ duration: 10, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
              style={{
                transformStyle: "preserve-3d",
                background: "hsl(0 0% 10%)",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 0 80px rgba(0,0,0,0.4), 0 30px 80px rgba(0,0,0,0.35)",
              }}
            >
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full rounded-full"
                src={videoUrl}
                muted
                playsInline
                style={{
                  objectFit: "cover",
                  opacity: phase === "video" ? 1 : 0,
                  transition: "opacity 0.3s linear",
                }}
              />
              {phase === "image" && (
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  {isOgPreview ? (
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
                        transition={{ duration: 1.4, delay: 0.15, ease: [0.25, 0.9, 0.3, 1] }}
                      >
                        <img className="w-full h-full object-cover" src={heroImage} alt={brandText} />
                        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.15)" }} />
                      </motion.div>
                      <motion.div
                        className="absolute pointer-events-none z-20"
                        initial={{ left: "-10%" }}
                        animate={{ left: "105%" }}
                        transition={{ duration: 1.4, delay: 0.15, ease: [0.25, 0.9, 0.3, 1] }}
                        style={{
                          top: "-5%", width: "14%", height: "110%",
                          background: "radial-gradient(ellipse 50% 45% at 50% 50%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.12) 50%, transparent 100%)",
                          filter: "blur(8px)", borderRadius: "50%",
                        }}
                      />
                      <motion.div
                        className="absolute pointer-events-none z-20"
                        initial={{ left: "-22%" }}
                        animate={{ left: "100%" }}
                        transition={{ duration: 1.6, delay: 0.15, ease: [0.25, 0.9, 0.3, 1] }}
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
            </motion.div>
          </a>
        </motion.div>

        {/* DWINDIK text */}
        <motion.h1
          className="relative z-10 flex items-center overflow-hidden"
          variants={letterContainer}
          initial={isOgPreview ? "visible" : "hidden"}
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

        {/* Rotating arc */}
        <motion.div
          className="absolute z-5 pointer-events-none"
          initial={{ opacity: 0, rotate: 0, scale: 1 }}
          animate={{
            opacity: isOgPreview ? 0 : [0, 0.6, 0.6, 0],
            rotate: [0, 360],
            scale: isOgPreview ? 1 : [1, 1, 0.15],
          }}
          transition={{
            duration: isOgPreview ? 0 : 2.2, delay: isOgPreview ? 0 : 0.2, ease: [0.22, 1, 0.36, 1],
            times: [0, 0.08, 0.65, 1],
          }}
        >
          <svg width="320" height="320" viewBox="0 0 320 320" className="w-[70vw] h-[70vw] md:w-[50vw] md:h-[50vw] lg:w-[42vw] lg:h-[42vw]">
            <circle cx="160" cy="160" r="155" fill="none" stroke="hsl(0 0% 92%)" strokeWidth="1" strokeOpacity="0.8" strokeDasharray="50 900" strokeLinecap="round" />
          </svg>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 0.2, y: 0 }}
          transition={{ duration: isOgPreview ? 0 : 1.2, delay: isOgPreview ? 0 : 2.6 }}
          className="absolute bottom-10 sm:bottom-14 left-0 right-0 text-center px-4 font-body text-[11px] sm:text-[12px] tracking-[0.35em] sm:tracking-[0.6em] uppercase text-foreground"
        >
          {tagline}
        </motion.p>
      </main>
    </div>
  );
};

export default Index;
