import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { ProjectData } from "@/lib/api";

interface CategoryPageLayoutProps {
  title: string;
  projects: ProjectData[];
  isLoading?: boolean;
}

const CategoryPageLayout = ({ title, projects, isLoading }: CategoryPageLayoutProps) => {
  const featured = projects[0];
  const rest = projects.slice(1);

  return (
    <>
      {/* Page title */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10 sm:mb-16 md:mb-20"
      >
        <h1 className="font-display text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-light text-foreground tracking-[0.04em] uppercase leading-[0.85]">
          {title}
        </h1>
      </motion.div>

      {/* Loading state */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center py-20"
        >
          <div className="w-6 h-6 border-2 border-foreground/10 border-t-foreground/40 rounded-full animate-spin" />
        </motion.div>
      )}

      {/* Featured / hero project — full width */}
      {featured && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 sm:mb-12 md:mb-20"
        >
          <Link to={`/work/${featured.id}`} className="group block relative">
            <div className="relative aspect-[16/10] sm:aspect-[21/9] md:aspect-[2.4/1] overflow-hidden bg-secondary">
              <img
                src={featured.thumbnail}
                alt={featured.title}
                className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background/50 to-transparent" />

              {/* Play icon if has video */}
              {featured.youtube_id && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-sm bg-white/5">
                    <div className="w-0 h-0 border-t-[6px] sm:border-t-[8px] border-t-transparent border-b-[6px] sm:border-b-[8px] border-b-transparent border-l-[10px] sm:border-l-[14px] border-l-white/70 ml-0.5 sm:ml-1" />
                  </div>
                </div>
              )}

              {/* Info overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-10">
                {featured.status && (
                  <span className="font-body text-[8px] sm:text-[9px] tracking-[0.3em] uppercase text-foreground/50 mb-2 sm:mb-3 block">
                    {featured.status}
                  </span>
                )}
                <h2 className="font-display text-xl sm:text-3xl md:text-5xl lg:text-6xl font-light text-foreground tracking-[0.03em] leading-[0.95]">
                  {featured.title}
                </h2>
              </div>
            </div>
          </Link>
        </motion.div>
      )}

      {/* Rest of projects — grid */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {rest.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.4 + i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link
                to={`/work/${project.id}`}
                className="group block relative"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />

                  {/* Play icon */}
                  {project.youtube_id && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/25 flex items-center justify-center backdrop-blur-sm bg-white/5">
                        <div className="w-0 h-0 border-t-[5px] sm:border-t-[6px] border-t-transparent border-b-[5px] sm:border-b-[6px] border-b-transparent border-l-[8px] sm:border-l-[10px] border-l-white/60 ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Title + status overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5">
                    {project.status && (
                      <span className="font-body text-[7px] sm:text-[8px] tracking-[0.3em] uppercase text-foreground/40 mb-1 sm:mb-2 block">
                        {project.status}
                      </span>
                    )}
                    <h3 className="font-display text-base sm:text-xl md:text-2xl font-light text-foreground tracking-[0.02em] leading-tight">
                      {project.title}
                    </h3>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && projects.length === 0 && (
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
