import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import portraitBg from "@/assets/portrait.jpg";

const Index = () => {
  return (
    <PageTransition>
      <Navbar />
      <main className="bg-background min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background portrait */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/portrait.jpg"
            alt=""
            className="w-full h-full object-cover opacity-[0.07] grayscale"
          />
          <div className="absolute inset-0 bg-background/60" />
        </div>
        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center text-center px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] font-light tracking-[0.02em] text-foreground leading-none"
          >
            DWINDIK
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
            className="w-12 h-px bg-foreground/20 mt-8 mb-6"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="font-body text-[11px] tracking-[0.35em] uppercase text-muted-foreground"
          >
            Filmmaker / Creative Director
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.4 }}
            className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground/50 mt-4"
          >
            Films · Commercials · Music Videos
          </motion.p>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.2 }}
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
