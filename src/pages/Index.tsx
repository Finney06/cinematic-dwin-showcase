import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";

const Index = () => {
  const heroTags = ["Award-Winning Visuals", "Story-First Direction", "Global Production"];

  return (
    <PageTransition>
      <Navbar />
      <main className="bg-background min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 sm:px-8">
        {/* Cinematic background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/dwindik 1.jpg"
            alt=""
            className="w-full h-full object-cover object-[center_22%] scale-[1.14] md:scale-[1.08] opacity-35 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/78 to-background/92" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_38%),radial-gradient(circle_at_85%_18%,rgba(255,255,255,0.1),transparent_34%)]" />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Hero card */}
        <motion.section
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="relative z-10 w-full max-w-5xl rounded-2xl border border-white/10 bg-black/35 backdrop-blur-md px-6 py-10 sm:px-10 sm:py-12 md:px-14"
        >
          <div className="absolute -inset-px rounded-2xl border border-white/10 opacity-60" />

          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            animate={{ opacity: 1, letterSpacing: "0.35em" }}
            transition={{ duration: 1, delay: 0.35 }}
            className="relative font-body text-[10px] sm:text-xs uppercase text-muted-foreground/90"
          >
            Cinematic Direction · Visual Storytelling
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
            className="relative font-display mt-4 text-5xl sm:text-6xl md:text-7xl lg:text-[6.2rem] font-light tracking-[0.02em] text-foreground leading-[0.95]"
          >
            DWINDIK
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.65 }}
            className="w-16 h-px bg-foreground/30 mt-8 mb-6 origin-left"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="font-body text-[11px] sm:text-xs tracking-[0.3em] uppercase text-muted-foreground"
          >
            Filmmaker / Creative Director
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.15 }}
            className="font-body text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-muted-foreground/60 mt-4"
          >
            Films · Commercials · Music Videos
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.25 }}
            className="mt-8 flex flex-wrap gap-2"
          >
            {heroTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] sm:text-[11px] tracking-[0.2em] uppercase text-foreground/80"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </motion.section>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.9 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <span className="font-body text-[9px] tracking-[0.4em] uppercase text-muted-foreground/40">
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-8 bg-foreground/15"
          />
        </motion.div>
      </main>
    </PageTransition>
  );
};

export default Index;
