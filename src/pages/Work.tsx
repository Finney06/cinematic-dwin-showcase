import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import { projects, categories, type ProjectCategory } from "@/lib/projects";
import { useState } from "react";

const Work = () => {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory | "all">("all");

  const filtered = activeCategory === "all"
    ? projects
    : projects.filter((p) => p.category === activeCategory);

  return (
    <PageTransition>
      <Navbar />
      <main className="bg-background min-h-screen pt-28 pb-24 px-8 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16"
        >
          <h1 className="font-display text-5xl md:text-6xl font-light text-foreground tracking-[0.02em]">
            Work
          </h1>
        </motion.div>

        {/* Category filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex items-center gap-6 mb-16 border-b border-divider pb-6"
        >
          <button
            onClick={() => setActiveCategory("all")}
            className={`font-body text-[11px] tracking-[0.2em] uppercase transition-opacity duration-400 ${
              activeCategory === "all" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`font-body text-[11px] tracking-[0.2em] uppercase transition-opacity duration-400 ${
                activeCategory === cat.key ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </motion.div>

        {/* Project grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
          {filtered.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 + i * 0.1 }}
            >
              <Link to={`/work/${project.id}`} className="group block">
                <div className="relative aspect-[16/10] bg-secondary overflow-hidden mb-5">
                  <div className="absolute inset-0 bg-foreground/5 group-hover:bg-foreground/0 transition-colors duration-700" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-2xl md:text-3xl font-light text-foreground/20 group-hover:text-foreground/40 transition-colors duration-700 tracking-wider">
                      {project.title}
                    </span>
                  </div>
                </div>
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-xl md:text-2xl font-light text-foreground group-hover:opacity-70 transition-opacity duration-500">
                    {project.title}
                  </h3>
                  <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                    {project.categoryLabel} — {project.year}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </PageTransition>
  );
};

export default Work;
