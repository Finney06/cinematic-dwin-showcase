import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import portraitBg from "@/assets/portrait.jpg";

const Index = () => {
  return (
    <div className="bg-background min-h-screen relative overflow-hidden">
      {/* Navbar fades in last */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 4 }}
      >
        <Navbar />
      </motion.div>

      <main className="h-screen flex flex-col items-center justify-center relative">
        {/* Ghost portrait — fades in very late, barely visible */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.04 }}
          transition={{ duration: 4, delay: 3.5 }}
          className="absolute inset-0 z-0"
        >
          <img
            src={portraitBg}
            alt=""
            className="w-full h-full object-cover grayscale"
          />
        </motion.div>

        {/* Rotating lens ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.06, scale: 1 }}
          transition={{ duration: 3, delay: 1.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute z-0"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
            className="w-[28rem] h-[28rem] md:w-[36rem] md:h-[36rem] rounded-full border border-foreground/30"
          />
        </motion.div>

        {/* Second inner ring */}
        <motion.div
          initial={{ opacity: 0, scale: 1.2 }}
          animate={{ opacity: 0.04, scale: 1 }}
          transition={{ duration: 3, delay: 2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute z-0"
        >
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
            className="w-[22rem] h-[22rem] md:w-[28rem] md:h-[28rem] rounded-full border border-foreground/20"
          />
        </motion.div>

        {/* Horizontal line draws first */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute z-10 w-[80vw] md:w-[60vw] h-px bg-foreground/10 origin-center"
        />

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center text-center px-4">
          {/* DWINDIK — massive viewport-spanning text */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1], delay: 1.8 }}
            className="font-display text-[15vw] md:text-[12vw] lg:text-[10vw] font-light tracking-[0.15em] text-foreground leading-none uppercase select-none"
          >
            DWINDIK
          </motion.h1>

          {/* Thin accent line below title */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 2.8 }}
            className="w-16 h-px bg-foreground/15 mt-6 mb-5 origin-center"
          />

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 3.2 }}
            className="font-body text-[10px] md:text-[11px] tracking-[0.45em] uppercase text-muted-foreground"
          >
            Filmmaker · Creative Director
          </motion.p>

          {/* Production company */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 3.6 }}
            className="font-body text-[8px] md:text-[9px] tracking-[0.5em] uppercase text-muted-foreground/40 mt-3"
          >
            Create Studios
          </motion.p>
        </div>

        {/* Heartbeat scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 4.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <span className="font-body text-[8px] tracking-[0.5em] uppercase text-muted-foreground/30">
            Explore
          </span>
          <motion.div
            animate={{ scaleY: [1, 1.5, 1], opacity: [0.15, 0.4, 0.15] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-10 bg-foreground origin-top"
          />
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
