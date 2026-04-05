import { useSiteSettings } from "@/hooks/useContent";

type AnimationPreset = "cinematic" | "smooth" | "snappy" | "minimal";
type AnimationSection =
  | "pageTransition"
  | "categoryPages"
  | "navbar"
  | "footer"
  | "homeHero"
  | "projectDetail";

const EASE_BY_PRESET: Record<AnimationPreset, readonly [number, number, number, number]> = {
  cinematic: [0.22, 1, 0.36, 1],
  smooth: [0.25, 0.1, 0.25, 1],
  snappy: [0.2, 0.9, 0.2, 1],
  minimal: [0.16, 1, 0.3, 1],
};

const SECTION_KEY_MAP: Record<AnimationSection, string> = {
  pageTransition: "animation_section_page_transition",
  categoryPages: "animation_section_category_pages",
  navbar: "animation_section_navbar",
  footer: "animation_section_footer",
  homeHero: "animation_section_home_hero",
  projectDetail: "animation_section_project_detail",
};

function parseEnabled(raw?: string): boolean {
  if (!raw) return true;
  const value = raw.trim().toLowerCase();
  return !["false", "0", "off", "no"].includes(value);
}

function parseSpeed(raw?: string): number {
  if (!raw) return 1;
  const speed = Number(raw);
  if (!Number.isFinite(speed)) return 1;
  return Math.min(2, Math.max(0.35, speed));
}

function parsePreset(raw?: string): AnimationPreset {
  const value = (raw || "").trim().toLowerCase();
  if (value === "smooth" || value === "snappy" || value === "minimal") {
    return value;
  }
  return "cinematic";
}

export function useAnimationSettings() {
  const { data: settings } = useSiteSettings();

  const enabled = parseEnabled(settings?.animation_enabled);
  const preset = parsePreset(settings?.animation_preset);
  const speed = parseSpeed(settings?.animation_speed);
  const ease = EASE_BY_PRESET[preset];

  const getDuration = (baseDuration: number) =>
    enabled ? Math.max(0.05, baseDuration / speed) : 0;

  const getDelay = (baseDelay: number) =>
    enabled ? Math.max(0, baseDelay / speed) : 0;

  const getOffsetY = (baseOffset: number) => {
    if (!enabled) return 0;
    if (preset === "snappy") return baseOffset * 0.5;
    if (preset === "minimal") return baseOffset * 0.35;
    return baseOffset;
  };

  const isSectionEnabled = (section: AnimationSection) => {
    if (!enabled) return false;
    const key = SECTION_KEY_MAP[section];
    return parseEnabled(settings?.[key]);
  };

  return {
    enabled,
    preset,
    speed,
    ease,
    getDuration,
    getDelay,
    getOffsetY,
    isSectionEnabled,
  };
}
