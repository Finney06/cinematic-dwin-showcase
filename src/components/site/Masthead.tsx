import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useAnimationSettings } from "@/hooks/useAnimationSettings";

interface MastheadProps {
  /** Small wide-tracked label above the title — text, or a breadcrumb. */
  eyebrow?: ReactNode;
  title: string;
  /** Short lead paragraph under the rule. */
  intro?: string;
  /** Right-hand counter — e.g. `{ value: 10, label: "Titles" }`. */
  meta?: { value: string | number; label: string } | null;
  /** Filters, links or anything else that sits under the rule. */
  children?: ReactNode;
  size?: "page" | "hero";
}

/**
 * The oversized title block that opens every page. One component so /work,
 * /services, /journal, a category and a custom page all share the same
 * typographic entrance rather than each re-inventing a heading.
 */
const Masthead = ({ eyebrow, title, intro, meta, children, size = "page" }: MastheadProps) => {
  const shouldReduceMotion = useReducedMotion();
  const { getSectionDuration, getSectionDelay, getSectionEase, isSectionEnabled } = useAnimationSettings();
  const instant = shouldReduceMotion || !isSectionEnabled("categoryPages");
  const ease = getSectionEase("categoryPages");

  const titleClass =
    size === "hero"
      ? "text-[16vw] sm:text-8xl md:text-9xl lg:text-[10rem] leading-[0.82]"
      : "text-4xl sm:text-6xl md:text-8xl lg:text-9xl leading-[0.85]";

  return (
    <div>
      <motion.div
        initial={{ opacity: instant ? 1 : 0, y: instant ? 0 : 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: instant ? 0 : getSectionDuration("categoryPages", 1), ease }}
        className="flex items-end justify-between gap-6 flex-wrap"
      >
        <div className="min-w-0">
          {eyebrow && (
            <span className="block mb-4 sm:mb-6 font-body text-[9px] sm:text-[10px] tracking-[0.35em] uppercase text-foreground/30">
              {eyebrow}
            </span>
          )}
          <h1
            className={`font-display font-light text-foreground tracking-[0.02em] uppercase break-words ${titleClass}`}
          >
            {title}
          </h1>
        </div>

        {meta && (
          <div className="text-right pb-2 sm:pb-4 shrink-0">
            <span className="block font-display text-3xl sm:text-4xl font-light text-foreground/50 tabular-nums leading-none">
              {meta.value}
            </span>
            <span className="block mt-1 font-body text-[9px] tracking-[0.3em] uppercase text-foreground/25">
              {meta.label}
            </span>
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ scaleX: instant ? 1 : 0 }}
        animate={{ scaleX: 1 }}
        transition={{
          duration: instant ? 0 : getSectionDuration("categoryPages", 1.2),
          delay: instant ? 0 : getSectionDelay("categoryPages", 0.3),
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ originX: 0 }}
        className="h-px bg-foreground/15 mt-8 sm:mt-10"
      />

      {intro && (
        <motion.p
          initial={{ opacity: instant ? 1 : 0, y: instant ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: instant ? 0 : getSectionDuration("categoryPages", 0.9),
            delay: instant ? 0 : getSectionDelay("categoryPages", 0.35),
            ease,
          }}
          className="mt-8 sm:mt-10 max-w-2xl font-body text-sm sm:text-base leading-[1.9] text-foreground/50"
        >
          {intro}
        </motion.p>
      )}

      {children}
    </div>
  );
};

export default Masthead;
