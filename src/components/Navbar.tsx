import { motion } from "framer-motion";

const Navbar = () => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 py-6 mix-blend-difference"
    >
      <button onClick={() => scrollTo("hero")} className="font-display text-lg font-bold tracking-wider text-foreground">
        DWINDIK
      </button>
      <div className="hidden md:flex items-center gap-10 font-body text-xs tracking-[0.2em] uppercase text-foreground">
        <button onClick={() => scrollTo("works")} className="hover:opacity-50 transition-opacity duration-300">Works</button>
        <button onClick={() => scrollTo("about")} className="hover:opacity-50 transition-opacity duration-300">About</button>
        <button onClick={() => scrollTo("contact")} className="hover:opacity-50 transition-opacity duration-300">Contact</button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
