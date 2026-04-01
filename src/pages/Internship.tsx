import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

const Internship = () => {
  return (
    <PageTransition>
      <Navbar />
      <main className="bg-background min-h-screen pt-28 pb-12 px-8 md:px-12">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 md:mb-24"
        >
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-light text-foreground tracking-[0.04em] uppercase leading-[0.85]">
            Internship
          </h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="h-px bg-foreground/8 origin-left mt-8"
          />
        </motion.div>

        {/* Content */}
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-display text-2xl md:text-3xl font-light text-foreground/80 leading-snug mb-12 tracking-[0.01em]"
          >
            Cre8te Studios offers internship opportunities across film, television, nonfiction, and audio production.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="space-y-6 font-body text-sm md:text-base leading-relaxed text-foreground/50"
          >
            <p>
              We believe in nurturing the next generation of filmmakers and storytellers. Our internship program provides hands-on experience working alongside directors, producers, and creative leads on active productions.
            </p>
            <p>
              Interns work across all stages of production — from development and pre-production through post and distribution — gaining practical experience in the craft of visual storytelling.
            </p>
          </motion.div>

          {/* Application status */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 border-t border-foreground/[0.06] pt-10"
          >
            <span className="font-body text-[10px] tracking-[0.3em] uppercase text-foreground/25 block mb-4">
              Status
            </span>
            <p className="font-body text-sm text-foreground/60">
              We are not currently accepting applications. Please check back for <span className="text-foreground/80">Summer / Fall 2026</span> opportunities.
            </p>
          </motion.div>

          {/* Contact for inquiries */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-12 border-t border-foreground/[0.06] pt-10"
          >
            <span className="font-body text-[10px] tracking-[0.3em] uppercase text-foreground/25 block mb-4">
              Inquiries
            </span>
            <a
              href="mailto:internship@dwindik.com"
              className="font-body text-sm text-foreground/50 hover:text-foreground/80 transition-colors duration-500"
            >
              internship@dwindik.com
            </a>
          </motion.div>
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default Internship;
