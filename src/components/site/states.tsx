import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { BRAND } from "@/lib/brand";

/**
 * The three things a CMS-driven page has to be able to say when it has no
 * content to show. Shared so /work, /journal, a category and a custom page all
 * fail and wait in exactly the same voice.
 */

/** Waiting on the backend. The mark breathes rather than a spinner ticking. */
export const LoadingState = ({ label = "Loading" }: { label?: string }) => {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      role="status"
      aria-label={label}
      initial={{ opacity: 0.35 }}
      animate={shouldReduceMotion ? { opacity: 0.6 } : { opacity: [0.25, 0.7, 0.25] }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className="flex justify-center py-24 sm:py-32"
    >
      <img src={BRAND.logo} alt="" aria-hidden className="h-6 w-auto object-contain" />
      <span className="sr-only">{label}</span>
    </motion.div>
  );
};

/** Nothing published here yet — a normal state on a young site, not a fault. */
export const EmptyState = ({
  message = "Coming soon",
  hint,
}: {
  message?: string;
  hint?: string;
}) => (
  <div className="py-20 sm:py-28 text-center">
    <p className="font-body text-sm text-foreground/30 tracking-[0.15em] uppercase">{message}</p>
    {hint && <p className="mt-3 font-body text-xs text-foreground/20">{hint}</p>}
  </div>
);

/**
 * The backend didn't answer. Distinct from empty on purpose: content probably
 * exists, so offer a retry rather than implying the page is bare.
 */
export const ErrorState = ({
  message = "We couldn't load this right now.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) => (
  <div className="py-20 sm:py-28 text-center">
    <p className="font-body text-sm text-foreground/40">{message}</p>
    <div className="mt-6 flex items-center justify-center gap-5">
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="font-body text-[11px] tracking-[0.2em] uppercase text-foreground/50 hover:text-foreground/80 transition-colors border-b border-foreground/15 pb-1 cursor-pointer"
        >
          Try again
        </button>
      )}
      <Link
        to="/"
        className="font-body text-[11px] tracking-[0.2em] uppercase text-foreground/25 hover:text-foreground/60 transition-colors"
      >
        Home
      </Link>
    </div>
  </div>
);
