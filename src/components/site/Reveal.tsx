import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useAnimationSettings } from "@/hooks/useAnimationSettings";

interface RevealProps {
  children: ReactNode;
  /** Stagger position — each step adds a beat to the delay. */
  index?: number;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "figure";
}

/**
 * The site's one scroll reveal: a short rise and fade as an element enters.
 * Respects both the OS reduced-motion setting and the per-section animation
 * controls in Admin → Settings, so motion stays adjustable without code.
 */
const Reveal = ({ children, index = 0, delay = 0, className = "", as = "div" }: RevealProps) => {
  const shouldReduceMotion = useReducedMotion();
  const { getSectionDuration, getSectionDelay, getSectionOffsetY, getSectionEase, isSectionEnabled } =
    useAnimationSettings();
  const instant = shouldReduceMotion || !isSectionEnabled("categoryPages");

  const Component = motion[as];

  return (
    <Component
      initial={{ opacity: instant ? 1 : 0, y: instant ? 0 : getSectionOffsetY("categoryPages", 24) }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: instant ? 0 : getSectionDuration("categoryPages", 0.8),
        delay: instant ? 0 : getSectionDelay("categoryPages", delay + index * 0.08),
        ease: getSectionEase("categoryPages"),
      }}
      className={className}
    >
      {children}
    </Component>
  );
};

export default Reveal;
