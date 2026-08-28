import { motion, useReducedMotion } from "framer-motion";

export type HeroAtmosphereVariant = "off" | "flow" | "halo";

/** Unset falls back to the flow — "off" has to be chosen deliberately. */
export function parseHeroAtmosphere(raw?: string): HeroAtmosphereVariant {
  const value = (raw || "").trim().toLowerCase();
  if (value === "off" || value === "halo") return value;
  return "flow";
}

/** Brightness multiplier for the glow. 1 is the authored default. */
export function parseHeroAtmosphereIntensity(raw?: string): number {
  const value = Number(raw);
  if (!Number.isFinite(value)) return 1;
  return Math.min(3, Math.max(0.4, value));
}

/** Matches the hero circle's own sizing so the halo stays tied to it. */
const CIRCLE_SIZE = "w-[80vw] sm:w-[75vw] md:w-[55vw] lg:w-[45vw]";
/** Same nudge the circle gets, so the light stays centred on it. */
const CIRCLE_OFFSET = "translate-x-4 sm:translate-x-6 md:translate-x-10 lg:translate-x-14";
/** Layers are stacked in one grid cell — motion owns the transform, so no translate utilities here. */
const LAYER = "col-start-1 row-start-1";

type Props = {
  variant: HeroAtmosphereVariant;
  /** The circle's `maxWidth`, so the halo shrinks with it on short screens. */
  circleMaxWidth: string;
  /** Held false until the hero's opening animations have finished. */
  visible: boolean;
  /** Brightness multiplier applied to every glow layer's alpha (admin-controlled). */
  intensity?: number;
};

/**
 * Light behind the hero circle. Purely decorative: sits under the circle, never
 * takes pointer events, and fades in only once the opening sequence is over.
 * Everything is CSS gradients and blur — no canvas, no assets.
 */
const HeroAtmosphere = ({ variant, circleMaxWidth, visible, intensity = 1 }: Props) => {
  const shouldReduceMotion = useReducedMotion();
  if (variant === "off") return null;

  /** Scales a gradient stop's alpha by the admin-set intensity, capped at fully opaque. */
  const a = (base: number) => Math.min(1, base * intensity);

  /** With reduced motion the light is still there, it simply holds still. */
  const still = shouldReduceMotion;

  const fade = {
    initial: { opacity: 0 },
    animate: { opacity: visible ? 1 : 0 },
    transition: {
      duration: still ? 0 : 2.6,
      delay: visible && !still ? 1.6 : 0,
      ease: "easeOut" as const,
    },
  };

  if (variant === "halo") {
    return (
      <motion.div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
        {...fade}
      >
        <div className={`grid place-items-center ${CIRCLE_SIZE} aspect-square ${CIRCLE_OFFSET}`} style={{ maxWidth: circleMaxWidth }}>
          {/* Broad bloom — the air around the circle, not a ring. */}
          <motion.div
            className={`${LAYER} w-full h-full rounded-full`}
            style={{
              background: `radial-gradient(circle closest-side, rgba(255,255,255,${a(0.11)}) 0%, rgba(255,255,255,${a(0.06)}) 42%, rgba(255,255,255,${a(0.02)}) 62%, transparent 82%)`,
              filter: "blur(70px)",
            }}
            animate={still ? { opacity: 0.8, scale: 2 } : { opacity: [0.6, 0.95, 0.6], scale: [1.94, 2.1, 1.94] }}
            transition={still ? { duration: 0 } : { duration: 13, ease: "easeInOut", repeat: Infinity }}
          />
          {/* The halo proper — brightest just outside the circle's edge. */}
          <motion.div
            className={`${LAYER} w-full h-full rounded-full`}
            style={{
              background: `radial-gradient(circle closest-side, transparent 62%, rgba(255,255,255,${a(0.2)}) 76%, rgba(255,255,255,${a(0.08)}) 86%, rgba(255,255,255,${a(0.02)}) 94%, transparent 100%)`,
              filter: "blur(28px)",
            }}
            animate={still ? { opacity: 0.85, scale: 1.35 } : { opacity: [0.65, 1, 0.65], scale: [1.31, 1.4, 1.31] }}
            transition={still ? { duration: 0 } : { duration: 9, ease: "easeInOut", repeat: Infinity, delay: 0.8 }}
          />
        </div>
      </motion.div>
    );
  }

  // Atmospheric flow — light spilling sideways from behind the circle.
  return (
    <motion.div
      aria-hidden
      className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
      {...fade}
    >
      <div
        className={`grid place-items-center w-full h-full ${CIRCLE_OFFSET}`}
        style={{
          // Reaches almost to the screen edges — only the last sliver tapers off.
          maskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
        }}
      >
        {/* Base haze — the widest, softest body of light. */}
        <motion.div
          className={`${LAYER} w-[128%] h-[34vh]`}
          style={{
            background: `radial-gradient(ellipse 100% 50% at 50% 50%, rgba(255,255,255,${a(0.13)}) 0%, rgba(255,255,255,${a(0.08)}) 36%, rgba(255,255,255,${a(0.022)}) 58%, rgba(255,255,255,${a(0.006)}) 76%, transparent 92%)`,
            filter: "blur(72px)",
          }}
          animate={still ? { opacity: 0.8 } : { opacity: [0.6, 0.92, 0.6], scaleX: [1, 1.06, 1] }}
          transition={still ? { duration: 0 } : { duration: 17, ease: "easeInOut", repeat: Infinity }}
        />
        {/* Wing — the tighter band that reads as light leaving the circle. */}
        <motion.div
          className={`${LAYER} w-[116%] h-[9vh]`}
          style={{
            background: `radial-gradient(ellipse 100% 50% at 50% 50%, rgba(255,255,255,${a(0.4)}) 0%, rgba(255,255,255,${a(0.26)}) 34%, rgba(255,255,255,${a(0.07)}) 58%, rgba(255,255,255,${a(0.015)}) 76%, transparent 92%)`,
            filter: "blur(34px)",
          }}
          animate={still ? { opacity: 0.75 } : { opacity: [0.55, 0.85, 0.55], scaleX: [0.98, 1.04, 0.98], x: ["-0.5%", "0.5%", "-0.5%"] }}
          transition={still ? { duration: 0 } : { duration: 21, ease: "easeInOut", repeat: Infinity }}
        />
        {/* Two drifting wisps, tilted apart so nothing reads as a straight beam. */}
        <motion.div
          className={`${LAYER} w-[110%] h-[3.5vh]`}
          style={{
            background: `radial-gradient(ellipse 100% 50% at 50% 50%, rgba(255,255,255,${a(0.4)}) 0%, rgba(255,255,255,${a(0.21)}) 38%, rgba(255,255,255,${a(0.04)}) 64%, transparent 88%)`,
            filter: "blur(18px)",
          }}
          animate={
            still
              ? { opacity: 0.5, y: "-2.6vh", rotate: -1.6 }
              : { opacity: [0.35, 0.7, 0.35], y: ["-3.4vh", "-2vh", "-3.4vh"], rotate: [-2, -1.2, -2], scaleX: [1, 1.05, 1] }
          }
          transition={still ? { duration: 0 } : { duration: 26, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.div
          className={`${LAYER} w-[110%] h-[3vh]`}
          style={{
            background: `radial-gradient(ellipse 100% 50% at 50% 50%, rgba(255,255,255,${a(0.3)}) 0%, rgba(255,255,255,${a(0.15)}) 38%, rgba(255,255,255,${a(0.03)}) 64%, transparent 88%)`,
            filter: "blur(22px)",
          }}
          animate={
            still
              ? { opacity: 0.45, y: "2.6vh", rotate: 1.2 }
              : { opacity: [0.6, 0.28, 0.6], y: ["2vh", "3.4vh", "2vh"], rotate: [1.6, 0.9, 1.6], scaleX: [1.04, 0.98, 1.04] }
          }
          transition={still ? { duration: 0 } : { duration: 23, ease: "easeInOut", repeat: Infinity, delay: 2 }}
        />
      </div>
    </motion.div>
  );
};

export default HeroAtmosphere;
