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
              About
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
              Dwindik is a filmmaker and creative director working at the intersection of cinema, commercial storytelling, and visual art.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="space-y-6 font-body text-sm md:text-base leading-relaxed text-secondary-foreground"
          >
            <p>
              With over a decade of experience directing films, commercials, and music videos, Dwindik brings a distinctive visual language rooted in atmosphere, restraint, and emotional precision.
            </p>
            <p>
              His work has been recognized at international film festivals and has been commissioned by brands seeking cinematic authenticity over conventional advertising.
            </p>
            <p>
              Through his production company CREATE, Dwindik collaborates with artists, agencies, and studios to craft visual narratives that feel both intimate and monumental.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-20 border-t border-divider pt-10"
          >
            <span className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground block mb-8">
              Select Recognition
            </span>
            <div className="space-y-4 font-body text-sm text-secondary-foreground">
              <p>Berlin International Film Festival — Official Selection</p>
              <p>Cannes Court Métrage — Selected</p>
              <p>D&AD — Pencil Award</p>
              <p>AICP — Best Direction</p>
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
              CREATE
            </p>
          </motion.div>
        </div>
      </main>
    </PageTransition>
  );
};

export default About;
