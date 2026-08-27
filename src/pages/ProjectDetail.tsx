import { motion, useReducedMotion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { useProject, useProjects } from "@/hooks/useContent";
import { useAnimationSettings } from "@/hooks/useAnimationSettings";

const ProjectDetail = () => {
  const shouldReduceMotion = useReducedMotion();
  const { getSectionDuration, getSectionDelay, getSectionOffsetY, getSectionEase, isSectionEnabled } = useAnimationSettings();
  const instant = shouldReduceMotion || !isSectionEnabled("projectDetail");
  const sectionEase = getSectionEase("projectDetail");

  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading } = useProject(id || "");
  const { data: categoryProjects = [] } = useProjects(project?.category);

  // Find next project in the same category
  const currentCategoryIndex = categoryProjects.findIndex((p) => p.id === id);
  const nextProject =
    categoryProjects[(currentCategoryIndex + 1) % categoryProjects.length];
  const hasNext = nextProject && nextProject.id !== project?.id;

  if (isLoading) {
    return (
      <PageTransition>
        <Navbar />
        <main className="bg-background min-h-screen flex items-center justify-center px-5">
          <div className="w-6 h-6 border-2 border-foreground/10 border-t-foreground/40 rounded-full animate-spin" />
        </main>
      </PageTransition>
    );
  }

  if (!project) {
    return (
      <PageTransition>
        <Navbar />
        <main className="bg-background min-h-screen flex items-center justify-center px-5">
          <div className="text-center">
            <p className="font-body text-sm text-foreground/30 tracking-[0.2em] uppercase">
              Project not found
            </p>
            <Link
              to="/work"
              className="font-body text-[11px] tracking-[0.2em] uppercase text-foreground/50 mt-6 inline-block border-b border-foreground/10 pb-1 hover:text-foreground/70 transition-colors duration-500"
            >
              Browse the Slate
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
        {/* ═══ HERO ═══ */}
        <motion.div
          initial={{ opacity: instant ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: instant ? 0 : getSectionDuration("projectDetail", 1.2), ease: sectionEase }}
          className="relative w-full h-[40vh] sm:h-[55vh] md:h-[70vh] overflow-hidden"
        >
          <img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-background/10" />

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-8 md:px-12 pb-6 sm:pb-10 md:pb-14">
            <motion.div
              initial={{ opacity: instant ? 1 : 0, y: instant ? 0 : getSectionOffsetY("projectDetail", 20) }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: instant ? 0 : getSectionDuration("projectDetail", 0.8),
                delay: instant ? 0 : getSectionDelay("projectDetail", 0.3),
                ease: sectionEase,
              }}
            >
              <span className="font-body text-[8px] sm:text-[9px] tracking-[0.3em] uppercase text-foreground/40 block mb-2 sm:mb-3">
                {project.category_label} — {project.year}
              </span>
              <h1 className="font-display text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-light text-foreground tracking-[0.02em] leading-[0.9]">
                {project.title}
              </h1>
              {project.status && (
                <span className="inline-block mt-3 sm:mt-4 font-body text-[9px] sm:text-[10px] tracking-[0.25em] uppercase text-foreground/35">
                  {project.status}
                </span>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* ═══ CONTENT ═══ */}
        <div className="px-5 sm:px-8 md:px-12">
          {/* Description / Synopsis */}
          <motion.div
            initial={{ opacity: instant ? 1 : 0, y: instant ? 0 : getSectionOffsetY("projectDetail", 20) }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: instant ? 0 : getSectionDuration("projectDetail", 0.8),
              delay: instant ? 0 : getSectionDelay("projectDetail", 0.5),
              ease: sectionEase,
            }}
            className="max-w-3xl pt-10 sm:pt-14 pb-12 sm:pb-16"
          >
            <p className="font-body text-sm sm:text-base md:text-lg leading-[1.8] text-foreground/55">
              {project.synopsis || project.description}
            </p>
          </motion.div>

          {/* ═══ YOUTUBE EMBED ═══ */}
          {project.youtube_id && (
            <motion.div
              initial={{ opacity: instant ? 1 : 0, y: instant ? 0 : getSectionOffsetY("projectDetail", 30) }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: instant ? 0 : getSectionDuration("projectDetail", 0.8),
                delay: instant ? 0 : getSectionDelay("projectDetail", 0.6),
                ease: sectionEase,
              }}
              className="mb-14 sm:mb-20"
            >
              <div className="relative aspect-video w-full max-w-5xl overflow-hidden bg-secondary">
                <iframe
                  src={`https://www.youtube.com/embed/${project.youtube_id}?rel=0&modestbranding=1&color=white`}
                  title={`${project.title} — Video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              </div>
            </motion.div>
          )}

          {/* ═══ CREDITS ═══ */}
          <motion.div
            initial={{ opacity: instant ? 1 : 0, y: instant ? 0 : getSectionOffsetY("projectDetail", 20) }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: instant ? 0 : getSectionDuration("projectDetail", 0.8), ease: sectionEase }}
            className="border-t border-foreground/[0.06] pt-10 sm:pt-12 max-w-3xl"
          >
            <span className="font-body text-[9px] tracking-[0.3em] uppercase text-foreground/25 block mb-6 sm:mb-8">
              Credits
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5 sm:gap-y-6">
              {project.director && (
                <div>
                  <span className="font-body text-[10px] tracking-[0.2em] uppercase text-foreground/20 block mb-1.5">
                    Director
                  </span>
                  <span className="font-body text-sm text-foreground/65">
                    {project.director}
                  </span>
                </div>
              )}
              <div>
                <span className="font-body text-[10px] tracking-[0.2em] uppercase text-foreground/20 block mb-1.5">
                  CRA8 Credits
                </span>
                <span className="font-body text-sm text-foreground/65">
                  {project.role}
                </span>
              </div>
              {project.producers && (
                <div>
                  <span className="font-body text-[10px] tracking-[0.2em] uppercase text-foreground/20 block mb-1.5">
                    Producers
                  </span>
                  <span className="font-body text-sm text-foreground/65">
                    {project.producers}
                  </span>
                </div>
              )}
              <div>
                <span className="font-body text-[10px] tracking-[0.2em] uppercase text-foreground/20 block mb-1.5">
                  Year
                </span>
                <span className="font-body text-sm text-foreground/65">
                  {project.year}
                </span>
              </div>
              {project.cast_info && (
                <div className="sm:col-span-2">
                  <span className="font-body text-[10px] tracking-[0.2em] uppercase text-foreground/20 block mb-1.5">
                    Cast
                  </span>
                  <span className="font-body text-sm text-foreground/65">
                    {project.cast_info}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* ═══ NAVIGATION ═══ */}
          <motion.div
            initial={{ opacity: instant ? 1 : 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: instant ? 0 : getSectionDuration("projectDetail", 0.8), ease: sectionEase }}
            className="border-t border-foreground/[0.06] pt-8 sm:pt-10 mt-14 sm:mt-20 pb-6 sm:pb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
          >
            <Link
              to={`/${project.category}`}
              className="font-body text-[10px] tracking-[0.25em] uppercase text-foreground/25 hover:text-foreground/60 transition-colors duration-500"
            >
              ← All {project.category_label}
            </Link>
            {hasNext && (
              <Link to={`/work/${nextProject.id}`} className="group sm:text-right">
                <span className="font-body text-[9px] tracking-[0.25em] uppercase text-foreground/20 block mb-1">
                  Next
                </span>
                <span className="font-display text-lg sm:text-xl md:text-2xl font-light text-foreground/40 group-hover:text-foreground/80 transition-colors duration-500 tracking-[0.02em]">
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
