import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const ContactSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="contact" className="px-8 md:px-16 py-32 md:py-48">
      <div ref={ref} className="flex flex-col items-center text-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="font-body text-xs tracking-[0.3em] uppercase text-dim"
        >
          Get in Touch
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mt-4"
        >
          Let's Collaborate
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          className="mt-10"
        >
          <a
            href="mailto:hello@dwindik.com"
            className="inline-block font-body text-sm md:text-base tracking-[0.2em] uppercase border border-foreground/30 px-10 py-4 text-foreground hover:bg-foreground hover:text-background transition-all duration-500"
          >
            hello@dwindik.com
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 flex items-center gap-10 font-body text-xs tracking-[0.2em] uppercase text-dim"
        >
          <a href="#" className="hover:text-foreground transition-colors duration-300">Instagram</a>
          <a href="#" className="hover:text-foreground transition-colors duration-300">Vimeo</a>
          <a href="#" className="hover:text-foreground transition-colors duration-300">LinkedIn</a>
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
