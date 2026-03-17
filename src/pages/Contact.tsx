import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";

const Contact = () => {
  return (
    <PageTransition>
      <Navbar />
      <main className="bg-background min-h-screen flex flex-col justify-center px-8 md:px-12 py-28">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-display text-5xl md:text-6xl font-light text-foreground tracking-[0.02em]">
              Contact
            </h1>
          </motion.div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            className="h-px bg-foreground/10 origin-left my-12"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="font-display text-2xl md:text-3xl font-light text-foreground leading-snug mb-16 italic tracking-[0.01em]"
          >
            Let's create something cinematic.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="space-y-8"
          >
            <div>
              <span className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground block mb-3">
                Email
              </span>
              <a
                href="mailto:hello@dwindik.com"
                className="font-body text-sm text-foreground hover:opacity-50 transition-opacity duration-500"
              >
                hello@dwindik.com
              </a>
            </div>

            <div>
              <span className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground block mb-3">
                Instagram
              </span>
              <a
                href="https://www.instagram.com/dwin_dik/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-sm text-foreground hover:opacity-50 transition-opacity duration-500"
              >
                @dwin_dik
              </a>
            </div>

            <div>
              <span className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground block mb-3">
                YouTube
              </span>
              <a
                href="https://www.youtube.com/@Dwin_dik"
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-sm text-foreground hover:opacity-50 transition-opacity duration-500"
              >
                @Dwin_dik
              </a>
            </div>

            <div>
              <span className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground block mb-3">
                Production Inquiries
              </span>
              <a
                href="mailto:produce@create.studio"
                className="font-body text-sm text-foreground hover:opacity-50 transition-opacity duration-500"
              >
                produce@lorem.studio
              </a>
            </div>
          </motion.div>
        </div>
      </main>
    </PageTransition>
  );
};

export default Contact;
