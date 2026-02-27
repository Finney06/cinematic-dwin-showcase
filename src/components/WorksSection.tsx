import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";
import project4 from "@/assets/project-4.jpg";

const projects = [
  { img: project1, title: "Echoes of Light", category: "Short Film" },
  { img: project2, title: "Dune Wanderer", category: "Commercial" },
  { img: project3, title: "Noir City", category: "Music Video" },
  { img: project4, title: "Tidal", category: "Documentary" },
];

const ProjectCard = ({ project, index }: { project: typeof projects[0]; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 80 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: index * 0.15 }}
      className="group cursor-pointer"
    >
      <div className="relative overflow-hidden aspect-video">
        <img
          src={project.img}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-background/20 group-hover:bg-background/0 transition-colors duration-500" />
      </div>
      <div className="mt-5 flex items-baseline justify-between">
        <h3 className="font-display text-xl md:text-2xl font-semibold text-foreground">{project.title}</h3>
        <span className="font-body text-xs tracking-[0.2em] uppercase text-dim">{project.category}</span>
      </div>
    </motion.div>
  );
};

const WorksSection = () => {
  const titleRef = useRef<HTMLDivElement>(null);
  const titleInView = useInView(titleRef, { once: true, margin: "-100px" });

  return (
    <section id="works" className="px-8 md:px-16 py-32 md:py-48">
      <motion.div
        ref={titleRef}
        initial={{ opacity: 0, y: 40 }}
        animate={titleInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="mb-20"
      >
        <span className="font-body text-xs tracking-[0.3em] uppercase text-dim">Portfolio</span>
        <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground mt-3">Selected Works</h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
        {projects.map((project, i) => (
          <ProjectCard key={project.title} project={project} index={i} />
        ))}
      </div>
    </section>
  );
};

export default WorksSection;
