import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import portrait from "@/assets/portrait.jpg";

const AboutSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="px-8 md:px-16 py-32 md:py-48">
      <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative aspect-[3/4] overflow-hidden"
        >
          <img
            src={portrait}
            alt="DwinDik portrait"
            className="w-full h-full object-cover grayscale"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <span className="font-body text-xs tracking-[0.3em] uppercase text-dim">About</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-3 mb-8">
            Crafting Visual Stories
          </h2>
          <div className="space-y-6 font-body text-base md:text-lg leading-relaxed text-secondary-foreground">
            <p>
              DwinDik is a cinematographer and VFX artist with over a decade of experience 
              bringing cinematic visions to life. Specializing in atmospheric storytelling 
              through light, shadow, and motion.
            </p>
            <p>
              From indie films to commercial campaigns, every frame is crafted with 
              intention — merging technical precision with raw creative instinct to deliver 
              visuals that resonate long after the screen fades to black.
            </p>
          </div>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
            className="mt-10 h-px bg-foreground/15 origin-left"
          />
          <div className="mt-10 flex gap-16 font-body">
            <div>
              <span className="font-display text-3xl font-bold text-foreground">50+</span>
              <p className="text-xs tracking-[0.2em] uppercase text-dim mt-1">Projects</p>
            </div>
            <div>
              <span className="font-display text-3xl font-bold text-foreground">10+</span>
              <p className="text-xs tracking-[0.2em] uppercase text-dim mt-1">Years</p>
            </div>
            <div>
              <span className="font-display text-3xl font-bold text-foreground">8</span>
              <p className="text-xs tracking-[0.2em] uppercase text-dim mt-1">Awards</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
