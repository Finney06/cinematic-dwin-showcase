import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import { getProjectById } from "@/lib/projects";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const project = getProjectById(id || "");

  if (!project) {
    return (
      <PageTransition>
        <Navbar />
        <main className="bg-background min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="font-body text-sm text-muted-foreground tracking-[0.2em] uppercase">Project not found</p>
            <Link to="/work" className="font-body text-[11px] tracking-[0.2em] uppercase text-foreground mt-6 inline-block border-b border-foreground/20 pb-1 hover:border-foreground/60 transition-colors duration-500">
              Back to Work
            </Link>
          </div>
        </main>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Navbar />
      <main className="bg-background min-h-screen pt-28 pb-24 px-8 md:px-12">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            to="/work"
            className="font-body text-[10px] tracking-[0.25em] uppercase text-muted-foreground hover:text-foreground transition-colors duration-500"
          >
            ← Back
          </Link>
        </motion.div>

        {/* Hero area */}
        <div className="mt-16 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          >
            <span className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
              {project.categoryLabel} — {project.year}
            </span>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light text-foreground mt-4 tracking-[0.02em]">
              {project.title}
            </h1>
          </motion.div>
        </div>

        {/* Video placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          className="aspect-video bg-secondary mb-20 flex items-center justify-center"
        >
          <div className="w-16 h-16 border border-foreground/20 rounded-full flex items-center justify-center cursor-pointer hover:border-foreground/50 transition-colors duration-500">
            <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[14px] border-l-foreground/40 ml-1" />
          </div>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-2xl"
        >
          <div className="border-t border-divider pt-10">
            <div className="grid grid-cols-2 gap-8 mb-10">
              <div>
                <span className="font-body text-[10px] tracking-[0.25em] uppercase text-muted-foreground block mb-2">
                  Role
                </span>
                <span className="font-body text-sm text-foreground">{project.role}</span>
              </div>
              <div>
                <span className="font-body text-[10px] tracking-[0.25em] uppercase text-muted-foreground block mb-2">
                  Year
                </span>
                <span className="font-body text-sm text-foreground">{project.year}</span>
              </div>
            </div>
            <p className="font-body text-sm md:text-base leading-relaxed text-secondary-foreground">
              {project.description}
            </p>
          </div>
        </motion.div>
      </main>
    </PageTransition>
  );
};

export default ProjectDetail;
