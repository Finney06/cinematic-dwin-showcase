import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

const Internship = () => {
  return (
    <PageTransition>
      <Navbar />
      <main className="bg-background min-h-screen pt-24 sm:pt-28 pb-12 px-5 sm:px-8 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-5xl"
        >
          <h1 className="font-display text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-light text-foreground tracking-[0.04em] uppercase leading-[0.85]">
            Internship
          </h1>
          <p className="mt-8 font-body text-sm md:text-base tracking-[0.2em] uppercase text-foreground/40">
            Coming Soon
          </p>
        </motion.div>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default Internship;
