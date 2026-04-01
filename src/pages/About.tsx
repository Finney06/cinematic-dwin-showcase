import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

const About = () => {
  return (
    <PageTransition>
      <Navbar />
      <main className="bg-background min-h-screen pt-28 pb-12 px-8 md:px-12">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 md:mb-20"
        >
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-light text-foreground tracking-[0.04em] uppercase leading-[0.85]">
            About
          </h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="h-px bg-foreground/8 origin-left mt-8"
          />
        </motion.div>

        {/* Two-column layout: Image + Bio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 mb-24">
          {/* Portrait image */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="aspect-[3/4] overflow-hidden"
          >
            <img
              src="/dwindik/5.jpeg"
              alt="Dwindik"
              className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-1000"
            />
          </motion.div>

          {/* Bio text */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col justify-center"
          >
            <p className="font-display text-2xl md:text-3xl font-light text-foreground/90 leading-snug mb-10 tracking-[0.01em]">
              Dwindik is a filmmaker and creative director working at the intersection of cinema, commercial storytelling, and visual art.
            </p>
            <div className="space-y-5 font-body text-sm md:text-base leading-relaxed text-foreground/50">
              <p>
                With over a decade of experience directing films, commercials, and music videos, Dwindik brings a distinctive visual language rooted in atmosphere, restraint, and emotional precision.
              </p>
              <p>
                His work has been recognized at international film festivals and has been commissioned by brands seeking cinematic authenticity over conventional advertising.
              </p>
              <p>
                Through his production company Cre8te, Dwindik collaborates with artists, agencies, and studios to craft visual narratives that feel both intimate and monumental.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Recognition section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="border-t border-foreground/[0.06] pt-12 mb-16"
        >
          <span className="font-body text-[10px] tracking-[0.3em] uppercase text-foreground/25 block mb-8">
            Select Recognition
          </span>
          <div className="space-y-4 font-body text-sm text-foreground/50">
            <p>Berlin International Film Festival — Official Selection</p>
            <p>Cannes Court Métrage — Selected</p>
            <p>D&AD — Pencil Award</p>
            <p>AICP — Best Direction</p>
          </div>
        </motion.div>

        {/* Production company + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="border-t border-foreground/[0.06] pt-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
        >
          <div>
            <span className="font-body text-[10px] tracking-[0.3em] uppercase text-foreground/25 block mb-4">
              Production Company
            </span>
            <p className="font-display text-3xl font-light text-foreground tracking-[0.06em] uppercase">
              Cre8te
            </p>
          </div>
          <Link
            to="/news"
            className="font-body text-[11px] tracking-[0.2em] uppercase text-foreground/30 hover:text-foreground/70 transition-colors duration-500 border-b border-foreground/10 pb-1 inline-block"
          >
            See Latest News →
          </Link>
        </motion.div>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default About;
