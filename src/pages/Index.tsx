import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getLatestProjects } from "@/lib/projects";

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
  const latestProjects = getLatestProjects(5);

  useEffect(() => {
    const t = setTimeout(() => setPhase("video"), VIDEO_START_DELAY);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== "video") return;
    const vid = videoRef.current;
    if (!vid) return;
    vid.currentTime = 0;
    vid.playbackRate = 1;
    vid.play().catch(() => {});
    const onEnded = () => setPhase("image");
    vid.addEventListener("ended", onEnded);
    return () => vid.removeEventListener("ended", onEnded);
  }, [phase]);

  return (
    <div className="bg-background min-h-screen relative">
      <Navbar enterDelay={2.4} />

      {/* ═══ HERO ═══ */}
      <main className="h-screen flex items-center justify-center relative overflow-hidden">
        {/* Circle */}
        <motion.div
          className="absolute z-0 translate-x-4 sm:translate-x-6 md:translate-x-10 lg:translate-x-14"
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
                src="/dwindik/video1.mp4"
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
                    <img className="w-full h-full object-cover" src="/dwindik/5.jpeg" alt="Dwindik" />
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
          initial="hidden"
          animate="visible"
        >
          {BRAND.split("").map((letter, i) => (
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
            opacity: [0, 0.3, 0.3, 0],
            rotate: [0, 360],
            scale: [1, 1, 0.15],
          }}
          transition={{
            duration: 2.2, delay: 0.2, ease: [0.22, 1, 0.36, 1],
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
          className="absolute bottom-10 sm:bottom-14 left-0 right-0 text-center px-4 font-body text-[11px] sm:text-[12px] tracking-[0.35em] sm:tracking-[0.6em] uppercase text-foreground"
        >
          Cre8te
        </motion.p>
      </main>

      {/* ═══ THE LATEST ═══ */}
      <section className="px-5 sm:px-8 md:px-12 pt-16 sm:pt-24 pb-8 sm:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-8 sm:mb-14"
        >
          <span className="font-body text-[10px] tracking-[0.3em] uppercase text-foreground/25">
            The Latest
          </span>
        </motion.div>

        {/* Featured project — full width */}
        {latestProjects[0] && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="mb-5 sm:mb-8"
          >
            <Link
              to={`/work/${latestProjects[0].id}`}
              className="group block relative"
            >
              <div className="relative aspect-[16/10] sm:aspect-[21/9] md:aspect-[2.4/1] overflow-hidden bg-secondary">
                <img
                  src={latestProjects[0].thumbnail}
                  alt={latestProjects[0].title}
                  className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-10">
                  <span className="font-body text-[8px] sm:text-[9px] tracking-[0.3em] uppercase text-foreground/40 mb-1 sm:mb-2 block">
                    {latestProjects[0].categoryLabel}
                  </span>
                  <h2 className="font-display text-xl sm:text-3xl md:text-5xl lg:text-6xl font-light text-foreground tracking-[0.03em] leading-[0.95]">
                    {latestProjects[0].title}
                  </h2>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Grid of more projects */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {latestProjects.slice(1).map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.7,
                delay: i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link
                to={`/work/${project.id}`}
                className="group block"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-[1s] ease-out group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-4">
                    <span className="font-body text-[7px] sm:text-[8px] tracking-[0.3em] uppercase text-foreground/35 block mb-0.5 sm:mb-1">
                      {project.categoryLabel}
                    </span>
                    <h3 className="font-display text-xs sm:text-base md:text-lg font-light text-foreground/80 leading-tight">
                      {project.title}
                    </h3>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
