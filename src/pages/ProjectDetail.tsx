import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { getProjectById, projects } from "@/lib/projects";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const project = getProjectById(id || "");

  // Find next project for navigation
  const currentIndex = projects.findIndex((p) => p.id === id);
  const nextProject = projects[(currentIndex + 1) % projects.length];

  if (!project) {
    return (
      <PageTransition>
        <Navbar />
        <main className="bg-background min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="font-body text-sm text-foreground/30 tracking-[0.2em] uppercase">
              Project not found
            </p>
            <Link
              to="/film"
              className="font-body text-[11px] tracking-[0.2em] uppercase text-foreground/50 mt-6 inline-block border-b border-foreground/10 pb-1 hover:text-foreground/70 transition-colors duration-500"
            >
              Back to Film
            </Link>
          </div>
        </main>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Navbar />
      <main className="bg-background min-h-screen">
        {/* Full-bleed hero image */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full h-[60vh] md:h-[75vh] overflow-hidden"
        >
          <img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

          {/* Title overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 px-8 md:px-12 pb-12">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="font-body text-[10px] tracking-[0.3em] uppercase text-foreground/40 block mb-3"
            >
              {project.categoryLabel} — {project.year}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-5xl md:text-7xl lg:text-8xl font-light text-foreground tracking-[0.02em] leading-[0.9]"
            >
              {project.title}
            </motion.h1>
          </div>
        </motion.div>

        {/* Content */}
        <div className="px-8 md:px-12 pt-16 pb-12">
          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="font-body text-base md:text-lg leading-relaxed text-foreground/60 max-w-2xl mb-16"
          >
            {project.description}
          </motion.p>

          {/* Watch CTA */}
          {project.watchUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="mb-16"
            >
              <a
                href={project.watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 font-body text-[11px] tracking-[0.2em] uppercase text-foreground/60 hover:text-foreground/90 border border-foreground/15 hover:border-foreground/30 px-6 py-3 transition-all duration-500"
              >
                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-current" />
                Watch Now
              </a>
            </motion.div>
          )}

          {/* Credits grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="border-t border-foreground/[0.06] pt-10 max-w-2xl"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-10">
              <div>
                <span className="font-body text-[10px] tracking-[0.25em] uppercase text-foreground/25 block mb-2">
                  Role
                </span>
                <span className="font-body text-sm text-foreground/70">
                  {project.role}
                </span>
              </div>
              {project.director && (
                <div>
                  <span className="font-body text-[10px] tracking-[0.25em] uppercase text-foreground/25 block mb-2">
                    Director
                  </span>
                  <span className="font-body text-sm text-foreground/70">
                    {project.director}
                  </span>
                </div>
              )}
              <div>
                <span className="font-body text-[10px] tracking-[0.25em] uppercase text-foreground/25 block mb-2">
                  Year
                </span>
                <span className="font-body text-sm text-foreground/70">
                  {project.year}
                </span>
              </div>
              {project.producers && (
                <div>
                  <span className="font-body text-[10px] tracking-[0.25em] uppercase text-foreground/25 block mb-2">
                    Producers
                  </span>
                  <span className="font-body text-sm text-foreground/70">
                    {project.producers}
                  </span>
                </div>
              )}
              {project.cast && (
                <div className="col-span-2">
                  <span className="font-body text-[10px] tracking-[0.25em] uppercase text-foreground/25 block mb-2">
                    Cast
                  </span>
                  <span className="font-body text-sm text-foreground/70">
                    {project.cast}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Back + Next navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="border-t border-foreground/[0.06] pt-10 mt-16 flex items-center justify-between"
          >
            <Link
              to={`/${project.category}`}
              className="font-body text-[10px] tracking-[0.25em] uppercase text-foreground/30 hover:text-foreground/60 transition-colors duration-500"
            >
              ← Back to {project.categoryLabel}
            </Link>
            {nextProject && (
              <Link
                to={`/work/${nextProject.id}`}
                className="group text-right"
              >
                <span className="font-body text-[10px] tracking-[0.25em] uppercase text-foreground/25 block mb-1">
                  Next
                </span>
                <span className="font-display text-lg md:text-xl font-light text-foreground/50 group-hover:text-foreground/80 transition-colors duration-500">
                  {nextProject.title}
                </span>
              </Link>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default ProjectDetail;
