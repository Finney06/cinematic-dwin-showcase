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
            {menuOpen ? "Close" : "Menu"}
          </span>
          <div className="flex flex-col items-center gap-[5px] w-5">
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 6, width: 20 } : { rotate: 0, y: 0, width: 20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="block h-px bg-foreground origin-center"
            />
            <motion.span
              animate={menuOpen ? { opacity: 0, x: 10 } : { opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="block h-px bg-foreground/60 w-4"
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -6, width: 20 } : { rotate: 0, y: 0, width: 20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="block h-px bg-foreground origin-center"
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
                      <span className="font-body text-[10px] tracking-[0.2em] text-foreground/20 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                      <span className="font-display text-3xl md:text-5xl lg:text-6xl font-light tracking-[0.08em] uppercase text-foreground/70 group-hover:text-foreground transition-colors duration-500 leading-tight">{item.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
              <motion.div className="mt-12 md:mt-0 md:w-[280px] flex flex-col gap-6" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.6, delay: 0.4 }}>
                <div>
                  <p className="font-body text-[10px] tracking-[0.3em] uppercase text-foreground/30 mb-3">Get in touch</p>
                  <a href="mailto:hello@dwindik.com" className="font-body text-sm text-foreground/50 hover:text-foreground/80 transition-colors duration-500">hello@dwindik.com</a>
                </div>
                <div>
                  <p className="font-body text-[10px] tracking-[0.3em] uppercase text-foreground/30 mb-3">Follow</p>
                  <div className="flex gap-4">
                    {["Instagram", "Twitter", "Youtube"].map((s) => (
                      <span key={s} className="font-body text-[11px] tracking-[0.15em] uppercase text-foreground/30 hover:text-foreground/70 cursor-pointer transition-colors duration-500">{s}</span>
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
