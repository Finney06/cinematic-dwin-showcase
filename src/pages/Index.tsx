import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";

const BRAND = "DWINDIK";

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
  const [phase, setPhase] = useState<Phase>("idle");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Start video when letters settle
  useEffect(() => {
    const t = setTimeout(() => setPhase("video"), VIDEO_START_DELAY);
    return () => clearTimeout(t);
  }, []);

  // Play video from start, switch to image when it ends naturally
  useEffect(() => {
    if (phase !== "video") return;
    const vid = videoRef.current;
    if (!vid) return;
    vid.currentTime = 0;
    vid.playbackRate = 1;
    vid.play().catch(() => { });

    const onEnded = () => setPhase("image");
    vid.addEventListener("ended", onEnded);
    return () => vid.removeEventListener("ended", onEnded);
  }, [phase]);

  return (
    <div className="bg-background min-h-screen relative overflow-hidden">
      {/* ═══ NAVBAR (shared, with delayed entry for hero) ═══ */}
      <Navbar enterDelay={2.4} />

      {/* ═══ HERO ═══ */}
      <main className="h-screen flex items-center justify-center relative">
        {/* Circle */}
        <motion.div
          className="absolute z-0 translate-x-6 md:translate-x-10 lg:translate-x-14"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ perspective: "800px" }}
        >
          <a
            href="https://youtu.be/mPAZSvF5usk?si=IxaXZFE0nJZw0ypt"
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-full cursor-pointer"
          >
            <motion.div
              className="circle-media w-[75vw] h-[75vw] md:w-[55vw] md:h-[55vw] lg:w-[45vw] lg:h-[45vw] rounded-full relative"
              animate={{ rotateX: [0, 1.5, -1, 0], rotateY: [0, -2, 1.5, 0] }}
              transition={{ duration: 10, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
              style={{
                transformStyle: "preserve-3d",
                background: "hsl(0 0% 10%)",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.05), 0 0 80px rgba(0,0,0,0.4), 0 30px 80px rgba(0,0,0,0.35)",
              }}
            >
              {/* Video — always mounted, visibility toggled */}
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full rounded-full"
                src="/dwindik/video1.mp4"
                muted
                playsInline
                style={{
                  objectFit: "cover",
                  opacity: phase === "video" ? 1 : 0,
                  transition: "opacity 0.3s linear",
                }}
              />

              {/* Image — revealed by light-wipe sweep */}
              {phase === "image" && (
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  {/* Image revealed via concave clip-path for 3D feel */}
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
                    <img
                      className="w-full h-full object-cover"
                      src="/dwindik/5.jpeg"
                      alt="Dwindik"
                    />
                    {/* Subtle dark overlay on image */}
                    <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.15)" }} />
                  </motion.div>

                  {/* Leading-edge shine bar — concave-curved to match the wipe */}
                  <motion.div
                    className="absolute pointer-events-none z-20"
                    initial={{ left: "-10%" }}
                    animate={{ left: "105%" }}
                    transition={{ duration: 1.4, delay: 0.15, ease: [0.25, 0.9, 0.3, 1] }}
                    style={{
                      top: "-5%",
                      width: "14%",
                      height: "110%",
                      background: "radial-gradient(ellipse 50% 45% at 50% 50%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.12) 50%, transparent 100%)",
                      filter: "blur(8px)",
                      borderRadius: "50%",
                    }}
                  />

                  {/* Secondary softer glow trailing the edge */}
                  <motion.div
                    className="absolute pointer-events-none z-20"
                    initial={{ left: "-22%" }}
                    animate={{ left: "100%" }}
                    transition={{ duration: 1.6, delay: 0.15, ease: [0.25, 0.9, 0.3, 1] }}
                    style={{
                      top: "-10%",
                      width: "28%",
                      height: "120%",
                      background: "radial-gradient(ellipse 45% 40% at 50% 50%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.04) 50%, transparent 100%)",
                      filter: "blur(18px)",
                      borderRadius: "50%",
                    }}
                  />
                </div>
              )}

              {/* Permanent subtle specular on the circle */}
              <div
                className="absolute pointer-events-none z-10 rounded-full"
                style={{
                  top: "5%", left: "12%", width: "40%", height: "20%",
                  background: "radial-gradient(ellipse, rgba(255,255,255,0.07) 0%, transparent 70%)",
                  filter: "blur(8px)",
                  transform: "rotate(-12deg)",
                }}
              />
            </motion.div>
          </a>
        </motion.div>

        {/* DWINDIK text */}
        <motion.h1
          className="relative z-10 flex items-center overflow-hidden"
          variants={letterContainer}
          initial="hidden"
          animate="visible"
        >
          {BRAND.split("").map((letter, i) => (
            <span key={i} className="inline-block overflow-hidden">
              <motion.span
                variants={letterVariant}
                className="font-display text-[16vw] md:text-[13vw] lg:text-[11vw] font-light tracking-[0.15em] md:tracking-[0.25em] text-foreground leading-none uppercase select-none inline-block"
              >
                {letter}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        {/* Rotating arc — single spin, then collapses into the "I" */}
        <motion.div
          className="absolute z-5 pointer-events-none"
          initial={{ opacity: 0, rotate: 0, scale: 1 }}
          animate={{
            opacity: [0, 0.3, 0.3, 0],
            rotate: [0, 360],
            scale: [1, 1, 0.15],
          }}
          transition={{
            duration: 2.2,
            delay: 0.2,
            ease: [0.22, 1, 0.36, 1],
            times: [0, 0.08, 0.65, 1],
          }}
        >
          <svg width="320" height="320" viewBox="0 0 320 320" className="w-[70vw] h-[70vw] md:w-[50vw] md:h-[50vw] lg:w-[42vw] lg:h-[42vw]">
            <circle cx="160" cy="160" r="155" fill="none" stroke="hsl(0 0% 92%)" strokeWidth="0.5" strokeDasharray="50 900" strokeLinecap="round" />
          </svg>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 0.2, y: 0 }}
          transition={{ duration: 1.2, delay: 2.6 }}
          className="absolute bottom-14 left-1/2 -translate-x-1/2 font-body text-[12px] tracking-[0.6em] uppercase text-foreground"
        >
          Cre8te
        </motion.p>
      </main>
    </div>
  );
};

export default Index;
