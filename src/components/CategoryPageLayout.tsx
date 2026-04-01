import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { Project } from "@/lib/projects";

interface CategoryPageLayoutProps {
  title: string;
  projects: Project[];
}

const cardVariant = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: 0.3 + i * 0.12,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const CategoryPageLayout = ({ title, projects }: CategoryPageLayoutProps) => {
  return (
    <>
      {/* Page title */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="mb-16 md:mb-24"
      >
        <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-light text-foreground tracking-[0.04em] uppercase leading-[0.85]">
          {title}
        </h1>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="h-px bg-foreground/8 origin-left mt-8"
        />
      </motion.div>

      {/* Project grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {projects.map((project, i) => (
          <motion.div
            key={project.id}
            custom={i}
            variants={cardVariant}
            initial="hidden"
            animate="visible"
          >
            <Link
              to={`/work/${project.id}`}
              className="group block relative"
            >
              {/* Image container */}
              <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 filter grayscale group-hover:grayscale-0"
                />
                {/* Dark overlay that lifts on hover */}
                <div className="absolute inset-0 bg-background/30 group-hover:bg-background/0 transition-colors duration-700" />
              </div>

              {/* Title + meta below image */}
              <div className="mt-4 flex items-baseline justify-between">
                <h3 className="font-display text-xl md:text-2xl font-light text-foreground tracking-[0.02em] group-hover:opacity-70 transition-opacity duration-500">
                  {project.title}
                </h3>
                <span className="font-body text-[10px] tracking-[0.2em] uppercase text-foreground/25">
                  {project.year}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {projects.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="font-body text-sm text-foreground/30 tracking-[0.15em] uppercase text-center py-20"
        >
          Coming soon
        </motion.p>
      )}
    </>
  );
};

export default CategoryPageLayout;
