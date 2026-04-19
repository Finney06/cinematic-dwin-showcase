import { useEffect, useRef, useState } from "react";
import { Vector3 } from "three";

/* ─── Phase definition ─── */
export type CinematicPhase =
  | "void"
  | "emergence"
  | "occlusion"
  | "shift"
  | "bleed"
  | "video"
  | "sweep"
  | "collapse"
  | "identity"
  | "done";

const PHASE_ORDER: CinematicPhase[] = [
  "void", "emergence", "occlusion", "shift", "bleed",
  "video", "sweep", "collapse", "identity", "done",
];

/* Fixed durations in ms. "video" and "done" are omitted — event-driven. */
const PHASE_DURATIONS: Partial<Record<CinematicPhase, number>> = {
  void:       1000,
  emergence:  2000,
  occlusion:  2000,
  shift:      2500,
  bleed:      3000,
  sweep:      1000,
  collapse:   1500,
  identity:   1500,
};

/* ─── Easing helpers ─── */
function ss(e0: number, e1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}
function easeOutExpo(p: number): number {
  return p >= 1 ? 1 : 1 - Math.pow(2, -10 * p);
}

/* ─── Uniform types ─── */
export interface IntroUniforms {
  uTime: number;
  uEmergence: number;
  uRimIntensity: number;
  uRimWidth: number;
  uLightDir: Vector3;
  uFocusSoften: number;
  uBleedAmount: number;
  uBleedNoise: number;
  uAperture: number;
  uExposure: number;
  uPortraitBlend: number;
  uSweepX: number;
  uSweepSharp: number;
  /* camera (written directly, not a shader uniform) */
  cameraYRotation: number;
  /* post-processing */
  bloomIntensity: number;
  caAmount: number;
  /* dust particles */
  dustActive: boolean;
  /* HTML sync */
  textLightLevel: number;
  navbarVisible: boolean;
}

const DONE_UNIFORMS: IntroUniforms = {
  uTime: 0,
  uEmergence: 1,
  uRimIntensity: 0,
  uRimWidth: 0.05,
  uLightDir: new Vector3(-0.7, 0.5, 0.5).normalize(),
  uFocusSoften: 0,
  uBleedAmount: 0,
  uBleedNoise: 0,
  uAperture: 1,
  uExposure: 1,
  uPortraitBlend: 1,
  uSweepX: 1.1,
  uSweepSharp: 0,
  cameraYRotation: 0,
  bloomIntensity: 0,
  caAmount: 0,
  dustActive: false,
  textLightLevel: 1,
  navbarVisible: true,
};

/* ─── Per-phase uniform computation ─── */
function getUniforms(
  phase: CinematicPhase,
  p: number,               // phase progress [0,1] (for timed phases)
  elapsedMs: number,       // ms elapsed in current phase (for video phase)
  globalElapsedMs: number, // total ms since start (for uTime + noise)
  prev: IntroUniforms,
): IntroUniforms {
  const uTime = globalElapsedMs / 1000;
  const base: IntroUniforms = {
    ...prev,
    uTime,
    uBleedNoise: uTime * 0.1,
  };

  switch (phase) {
    case "void":
      return {
        ...base,
        uEmergence: 0,
        uRimIntensity: 0,
        uRimWidth: 0.05,
        uFocusSoften: 0,
        uBleedAmount: 0,
        uAperture: 0,
        uExposure: 0,
        uPortraitBlend: 0,
        uSweepX: -0.1,
        uSweepSharp: 0,
        cameraYRotation: 0,
        bloomIntensity: 0,
        caAmount: 0,
        dustActive: false,
        textLightLevel: 0,
        navbarVisible: false,
      };

    case "emergence":
      return {
        ...base,
        uEmergence: ss(0, 1, p),
        uRimIntensity: 0,
        bloomIntensity: 0,
        caAmount: 0,
        dustActive: false,
        textLightLevel: 0,
        navbarVisible: false,
      };

    case "occlusion":
      return {
        ...base,
        uEmergence: 1,
        uRimIntensity: ss(0, 1, p),
        uRimWidth: 0.05 + p * 0.28,
        bloomIntensity: ss(0, 1, p) * 0.14,
        caAmount: 0,
        dustActive: false,
        textLightLevel: 0,
        navbarVisible: false,
      };

    case "shift": {
      const arc = Math.sin(p * Math.PI); // peaks at mid-phase, returns to 0
      return {
        ...base,
        uEmergence: 1,
        uRimIntensity: 1,
        uRimWidth: 0.33,
        uFocusSoften: arc * 0.04,
        uLightDir: computeShiftedLightDir(arc),
        cameraYRotation: arc * 0.0436,
        bloomIntensity: 0.14,
        caAmount: arc * 0.0008,
        dustActive: false,
        textLightLevel: 0,
        navbarVisible: false,
      };
    }

    case "bleed":
      return {
        ...base,
        uEmergence: 1,
        uRimIntensity: 1 - ss(0.7, 1, p) * 0.3,
        uRimWidth: 0.33,
        uBleedAmount: easeOutExpo(p),
        uAperture: ss(0, 0.6, p),
        bloomIntensity: 0.12,
        caAmount: 0.0005,
        dustActive: easeOutExpo(p) > 0.6,
        textLightLevel: 0,
        navbarVisible: false,
      };

    case "video": {
      // Exposure ramps over first 2s of the video phase, then holds at 1
      const videoExposureP = Math.min(elapsedMs / 2000, 1);
      return {
        ...base,
        uEmergence: 1,
        uRimIntensity: 0.7,
        uRimWidth: 0.33,
        uBleedAmount: 1,
        uAperture: 1,
        uExposure: ss(0, 1, videoExposureP),
        bloomIntensity: 0.08,
        caAmount: 0.0004,
        dustActive: true,
        textLightLevel: 0,
        navbarVisible: false,
      };
    }

    case "sweep":
      return {
        ...base,
        uEmergence: 1,
        uRimIntensity: 0.7,
        uBleedAmount: 1,
        uAperture: 1,
        uExposure: 1,
        uSweepX: p * 1.2 - 0.1,
        uSweepSharp: Math.sin(p * Math.PI),
        bloomIntensity: 0.06,
        caAmount: Math.sin(p * Math.PI) * 0.004, // peaks mid-sweep
        dustActive: false,
        textLightLevel: 0,
        navbarVisible: false,
      };

    case "collapse":
      return {
        ...base,
        uEmergence: 1,
        uRimIntensity: 1 - ss(0.4, 1, p),
        uBleedAmount: 1 - ss(0, 1, p),
        uAperture: 1,
        uExposure: 1,
        uSweepX: 1.1,
        uSweepSharp: 0,
        cameraYRotation: 0,
        bloomIntensity: 0,
        caAmount: 0,
        dustActive: false,
        textLightLevel: 0,
        navbarVisible: false,
      };

    case "identity":
      return {
        ...base,
        uEmergence: 1,
        uRimIntensity: 0,
        uBleedAmount: 0,
        uAperture: 1,
        uExposure: 1,
        uPortraitBlend: ss(0, 1, p),
        bloomIntensity: 0,
        caAmount: 0,
        dustActive: false,
        textLightLevel: ss(0, 1, p),
        navbarVisible: false,
      };

    case "done":
      return {
        ...base,
        uEmergence: 1,
        uRimIntensity: 0,
        uBleedAmount: 0,
        uAperture: 1,
        uExposure: 1,
        uPortraitBlend: 1,
        bloomIntensity: 0,
        caAmount: 0,
        dustActive: false,
        textLightLevel: 1,
        navbarVisible: true,
      };
  }
}

/* Light direction shifts subtly during the shift phase (spatial parallax) */
const BASE_LIGHT = new Vector3(-0.7, 0.5, 0.5).normalize();
const SHIFT_LIGHT = new Vector3(-0.85, 0.5, 0.35).normalize();
function computeShiftedLightDir(arc: number): Vector3 {
  return BASE_LIGHT.clone().lerp(SHIFT_LIGHT, arc * 0.5);
}

/* ─── Hook ─── */
export function useIntroTimeline({
  disabled,
  videoRef,
}: {
  disabled: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}) {
  const phaseRef       = useRef<CinematicPhase>("void");
  const phaseStartRef  = useRef(performance.now());
  const startTimeRef   = useRef(performance.now());
  const uniformsRef    = useRef<IntroUniforms>({ ...DONE_UNIFORMS, uEmergence: 0, textLightLevel: 0, navbarVisible: false, uPortraitBlend: 0, uExposure: 0 });
  const rafRef         = useRef<number>(0);

  /* Sparse React state — only for HTML overlay sync */
  const [textLightLevel, setTextLightLevel] = useState(disabled ? 1 : 0);
  const [navbarVisible,  setNavbarVisible]  = useState(disabled);
  const prevTextRef = useRef(disabled ? 1 : 0);

  useEffect(() => {
    if (disabled) {
      uniformsRef.current = { ...DONE_UNIFORMS };
      return;
    }

    phaseRef.current      = "void";
    phaseStartRef.current = performance.now();
    startTimeRef.current  = performance.now();

    function advancePhase() {
      const idx = PHASE_ORDER.indexOf(phaseRef.current);
      if (idx < PHASE_ORDER.length - 1) {
        phaseRef.current      = PHASE_ORDER[idx + 1];
        phaseStartRef.current = performance.now();

        /* Start video immediately when entering video phase */
        if (phaseRef.current === "video" && videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(() => {});
        }
      }
    }

    function tick() {
      const now          = performance.now();
      const elapsed      = now - phaseStartRef.current;
      const globalElapsed = now - startTimeRef.current;
      const phase        = phaseRef.current;
      const duration     = PHASE_DURATIONS[phase];

      /* Advance timed phases */
      if (duration !== undefined && elapsed >= duration) {
        advancePhase();
      }

      /* Video phase: advance when video has ended */
      if (phase === "video") {
        const vid = videoRef.current;
        if (!vid) {
          /* No video element: fallback to 3s */
          if (elapsed >= 3000) advancePhase();
        } else if (vid.ended) {
          advancePhase();
        }
      }

      const currentPhase = phaseRef.current;
      const currentDur   = PHASE_DURATIONS[currentPhase];
      const currentElapsed = now - phaseStartRef.current;
      const p = currentDur ? Math.min(currentElapsed / currentDur, 1) : 0;

      const u = getUniforms(currentPhase, p, currentElapsed, globalElapsed, uniformsRef.current);
      uniformsRef.current = u;

      /* Sparse React updates — threshold gate */
      if (Math.abs(u.textLightLevel - prevTextRef.current) > 0.015) {
        setTextLightLevel(u.textLightLevel);
        prevTextRef.current = u.textLightLevel;
      }
      if (u.navbarVisible && currentPhase === "done") {
        setNavbarVisible(true);
      }

      if (currentPhase !== "done") {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [disabled, videoRef]);

  return { uniformsRef, textLightLevel, navbarVisible };
}
