import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

const newsItems = [
  {
    date: "Mar 2025",
    title: "Echoes of Light premieres at Berlin International Film Festival",
    source: "Variety",
  },
  {
    date: "Feb 2025",
    title: "Dwindik signs multi-project deal with StreamVision",
    source: "Deadline",
  },
  {
    date: "Jan 2025",
    title: "Cre8te Studios expands into long-form documentary",
    source: "The Hollywood Reporter",
  },
  {
    date: "Dec 2024",
    title: "The Quiet Hours wins D&AD Pencil Award for Best Direction",
    source: "D&AD",
  },
  {
    date: "Nov 2024",
    title: "Behind the scenes of The Distance — six-part limited series",
    source: "IndieWire",
  },
  {
    date: "Sep 2024",
    title: "Dwindik featured in Forbes 30 Under 30: Film & Entertainment",
    source: "Forbes",
  },
];

const News = () => {
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
            News
          </h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="h-px bg-foreground/8 origin-left mt-8"
          />
        </motion.div>

        {/* News list */}
        <div className="max-w-3xl">
          {newsItems.map((item, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.3 + i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group border-b border-foreground/[0.06] py-8 cursor-pointer"
            >
              <div className="flex items-start gap-6 md:gap-10">
                <span className="font-body text-[10px] tracking-[0.2em] uppercase text-foreground/20 min-w-[70px] pt-1">
                  {item.date}
                </span>
                <div className="flex-1">
                  <h3 className="font-display text-lg md:text-xl font-light text-foreground/80 group-hover:text-foreground transition-colors duration-500 leading-snug">
                    {item.title}
                  </h3>
                  <span className="font-body text-[10px] tracking-[0.2em] uppercase text-foreground/20 mt-2 inline-block">
                    {item.source}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default News;
