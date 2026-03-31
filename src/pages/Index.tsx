import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="bg-background min-h-screen relative overflow-hidden">
      {/* Near-invisible nav — fades in late */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 4 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-14 py-8"
      >
        <div />
        <div className="flex items-center gap-10">
          {[
            { label: "Work", path: "/work" },
            { label: "About", path: "/about" },
            { label: "Contact", path: "/contact" },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="font-body text-[9px] tracking-[0.3em] uppercase text-foreground/20 hover:text-foreground/60 transition-all duration-700"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </motion.nav>

      <main className="h-screen flex items-center justify-center relative">
        {/* Geometric circle accent — appears first */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 0.06, scale: 1 }}
          transition={{ duration: 2.5, delay: 1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute z-0"
        >
          <div className="w-[20rem] h-[20rem] md:w-[26rem] md:h-[26rem] rounded-full border border-foreground/40" />
        </motion.div>

        {/* Thin horizontal line — draws across */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute z-0 w-full h-px bg-foreground/[0.04] origin-left"
        />

        {/* DWINDIK — full viewport width, massive */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2.5, delay: 2, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 font-display text-[18vw] md:text-[15vw] font-light tracking-[0.25em] md:tracking-[0.35em] text-foreground leading-none uppercase select-none whitespace-nowrap"
        >
          DWINDIK
        </motion.h1>

        {/* Small tagline — bottom center, barely visible */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 2, delay: 4 }}
          className="absolute bottom-14 left-1/2 -translate-x-1/2 font-body text-[8px] tracking-[0.6em] uppercase text-foreground"
        >
          Create
        </motion.p>
      </main>
    </div>
  );
};

export default Index;
