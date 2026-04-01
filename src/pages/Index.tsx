import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

const BRAND = "DWINDIK";

const menuItems = [
  { label: "Film", path: "/work" },
  { label: "Television", path: "/work" },
  { label: "Nonfiction", path: "/work" },
  { label: "Audio", path: "/work" },
  { label: "Music", path: "/work" },
  { label: "News", path: "/about" },
  { label: "Internship", path: "/contact" },
  { label: "About", path: "/about" },
];

const VIDEO_START_DELAY = 2600;
const VIDEO_DURATION = 10; // 10s of video then switch to image

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

const menuContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
  exit: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
};

const menuItemVariant = {
  hidden: { y: 40, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { y: -20, opacity: 0, transition: { duration: 0.3, ease: "easeIn" as const } },
};

type Phase = "idle" | "video" | "image";

const Index = () => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [menuOpen, setMenuOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Start video when letters settle
  useEffect(() => {
    const t = setTimeout(() => setPhase("video"), VIDEO_START_DELAY);
    return () => clearTimeout(t);
  }, []);

  // Play video at normal speed from 3s
  useEffect(() => {
    if (phase !== "video") return;
    const vid = videoRef.current;
    if (!vid) return;
    vid.currentTime = 3;
    vid.playbackRate = 1;
    vid.play().catch(() => { });

    const t = setTimeout(() => setPhase("image"), VIDEO_DURATION);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div className="bg-background min-h-screen relative overflow-hidden">
      {/* ═══ NAVBAR ═══ */}
      <motion.nav
        initial={{ opacity: 0, y: "-2rem" }}
        animate={{ opacity: 1, y: "0rem" }}
        transition={{ duration: 1.2, delay: 2.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-8 md:px-12 py-8"
      >
        <Link to="/" className="group flex items-center gap-2 hover:opacity-60 transition-opacity duration-700">
          <span className="font-body text-[13px] md:text-[15px] font-medium tracking-[0.22em] uppercase text-foreground leading-none">
            Dwindik
          </span>
          <span className="block w-[5px] h-[5px] bg-foreground/40 rounded-full group-hover:bg-foreground/70 transition-colors duration-700" />
        </Link>

        <button onClick={() => setMenuOpen(!menuOpen)} className="group flex items-center gap-3 cursor-pointer">
          <span className="font-body text-[10px] tracking-[0.25em] uppercase text-foreground/25 group-hover:text-foreground/70 transition-colors duration-500">
            Menu
          </span>
          <div className="flex flex-col gap-[5px] w-5">
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 7, width: 20 } : { rotate: 0, y: 0, width: 20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="block h-px bg-foreground origin-center"
            />
            <motion.span
              animate={menuOpen ? { opacity: 0, x: 10 } : { opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="block h-px bg-foreground/60 w-3 ml-auto"
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -7, width: 20 } : { rotate: 0, y: 0, width: 14 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="block h-px bg-foreground origin-center ml-auto"
            />
          </div>
        </button>
      </motion.nav>

      {/* ═══ MENU OVERLAY ═══ */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="fixed inset-0 z-[90]">
            <motion.div className="absolute inset-0 bg-background/95 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <div className="relative z-10 w-full h-full flex flex-col md:flex-row items-start md:items-center px-10 md:px-20 pt-28 md:pt-0">
              <motion.div className="flex-1 flex flex-col gap-1 md:gap-2" variants={menuContainer} initial="hidden" animate="visible" exit="exit">
                {menuItems.map((item, i) => (
                  <motion.div key={i} variants={menuItemVariant}>
                    <Link to={item.path} onClick={() => setMenuOpen(false)} className="group flex items-center gap-4">
                      <span className="font-body text-[8px] tracking-[0.2em] text-foreground/20 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                      <span className="font-display text-3xl md:text-5xl lg:text-6xl font-light tracking-[0.08em] uppercase text-foreground/70 group-hover:text-foreground transition-colors duration-500 leading-tight">{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
              <motion.div className="mt-12 md:mt-0 md:w-[280px] flex flex-col gap-6" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.6, delay: 0.4 }}>
                <div>
                  <p className="font-body text-[8px] tracking-[0.3em] uppercase text-foreground/30 mb-3">Get in touch</p>
                  <a href="mailto:hello@dwindik.com" className="font-body text-xs text-foreground/50 hover:text-foreground/80 transition-colors duration-500">hello@dwindik.com</a>
                </div>
                <div>
                  <p className="font-body text-[8px] tracking-[0.3em] uppercase text-foreground/30 mb-3">Follow</p>
                  <div className="flex gap-4">
                    {["Instagram", "Twitter", "Youtube"].map((s) => (
                      <span key={s} className="font-body text-[9px] tracking-[0.15em] uppercase text-foreground/30 hover:text-foreground/70 cursor-pointer transition-colors duration-500">{s}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ HERO ═══ */}
      <main className="h-screen flex items-center justify-center relative">
        {/* Circle */}
        <motion.div
          className="absolute z-0"
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
              className="circle-media w-[18rem] h-[18rem] md:w-[24rem] md:h-[24rem] lg:w-[28rem] lg:h-[28rem] rounded-full relative"
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
                src="/dwindik/video.mp4"
                muted
                playsInline
                style={{
                  objectFit: "cover",
                  opacity: phase === "video" ? 1 : 0,
                  transition: "opacity 0.3s linear",
                }}
              />

              {/* Image — snaps in when video ends */}
              <div
                className="absolute inset-0 rounded-full overflow-hidden"
                style={{
                  opacity: phase === "image" ? 1 : 0,
                  transition: "opacity 0.3s linear",
                }}
              >
                <img
                  className="w-full h-full object-cover"
                  src="/dwindik/4.jpeg"
                  alt="Dwindik"
                />
                {/* Subtle dark overlay on image */}
                <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.2)" }} />
              </div>

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

        {/* Rotating arc */}
        <motion.div
          className="absolute z-5 pointer-events-none"
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: [0, 0.2, 0.2, 0], rotate: [0, 360, 720] }}
          transition={{ duration: 2.8, delay: 0.2, ease: "linear", times: [0, 0.1, 0.85, 1] }}
        >
          <svg width="320" height="320" viewBox="0 0 320 320" className="w-[16rem] h-[16rem] md:w-[22rem] md:h-[22rem] lg:w-[26rem] lg:h-[26rem]">
            <circle cx="160" cy="160" r="155" fill="none" stroke="hsl(0 0% 92%)" strokeWidth="0.5" strokeDasharray="50 900" strokeLinecap="round" />
          </svg>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 0.2, y: 0 }}
          transition={{ duration: 1.2, delay: 2.6 }}
          className="absolute bottom-14 left-1/2 -translate-x-1/2 font-body text-[8px] tracking-[0.6em] uppercase text-foreground"
        >
          Create
        </motion.p>
      </main>
    </div>
  );
};

export default Index;
