import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";
import { useAnimationSettings } from "@/hooks/useAnimationSettings";

const PageTransition = ({ children }: { children: ReactNode }) => {
  const shouldReduceMotion = useReducedMotion();
  const { getDuration, ease, isSectionEnabled } = useAnimationSettings();

  const instant = shouldReduceMotion || !isSectionEnabled("pageTransition");

  return (
    <motion.div
      initial={{ opacity: instant ? 1 : 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: instant ? 1 : 0 }}
      transition={{ duration: instant ? 0 : getDuration(0.6), ease }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
