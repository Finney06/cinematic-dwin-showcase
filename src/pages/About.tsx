import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";

const About = () => {
  return (
    <PageTransition>
      <Navbar />
      <main className="bg-background min-h-screen pt-28 pb-24 px-8 md:px-12">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-display text-5xl md:text-6xl font-light text-foreground tracking-[0.02em] mb-4">
              About Me
            </h1>
          </motion.div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className="h-px bg-foreground/10 origin-left mb-16"
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <p className="font-display text-3xl md:text-4xl font-light text-foreground leading-snug mb-12 tracking-[0.01em]">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="space-y-6 font-body text-sm md:text-base leading-relaxed text-secondary-foreground"
          >
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.
            </p>
            <p>
              Sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-20 border-t border-divider pt-10"
          >
            <span className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground block mb-8">
             Recognitions
            </span>
            <div className="space-y-4 font-body text-sm text-secondary-foreground">
              <p>Lorem ipsum dolor sit amet — 2026</p>
              <p>Consectetur adipiscing elit — 2025</p>
              <p>Sed do eiusmod tempor — 2024</p>
              <p>Ut labore et dolore magna — 2023</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="mt-16 border-t border-divider pt-10"
          >
            <span className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground block mb-4">
              Production Company
            </span>
            <p className="font-display text-2xl font-light text-foreground tracking-[0.05em]">
              Lorem Ipsum Studio
            </p>
          </motion.div>
        </div>
      </main>
    </PageTransition>
  );
};

export default About;
