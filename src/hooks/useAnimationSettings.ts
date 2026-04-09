import { useSiteSettings } from "@/hooks/useContent";

type AnimationPreset = "cinematic" | "smooth" | "snappy" | "minimal";
type AnimationProfileKey =
  | "inherit"
  | "cinematic"
  | "smooth"
  | "snappy"
  | "minimal"
  | "gentle"
  | "dramatic"
  | "luxury"
  | "energetic"
  | "documentary"
  | "editorial"
  | "experimental";
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

const PROFILE_SETTINGS: Record<Exclude<AnimationProfileKey, "inherit">, {
  preset: AnimationPreset;
  duration: number;
  delay: number;
  distance: number;
}> = {
  cinematic: { preset: "cinematic", duration: 1, delay: 1, distance: 1 },
  smooth: { preset: "smooth", duration: 1.18, delay: 1.14, distance: 0.92 },
  snappy: { preset: "snappy", duration: 0.72, delay: 0.62, distance: 0.62 },
  minimal: { preset: "minimal", duration: 0.62, delay: 0.55, distance: 0.42 },
  gentle: { preset: "smooth", duration: 1.34, delay: 1.25, distance: 0.76 },
  dramatic: { preset: "cinematic", duration: 1.4, delay: 1.35, distance: 1.55 },
  luxury: { preset: "cinematic", duration: 1.55, delay: 1.42, distance: 1.12 },
  energetic: { preset: "snappy", duration: 0.58, delay: 0.52, distance: 1.18 },
  documentary: { preset: "minimal", duration: 0.7, delay: 0.64, distance: 0.5 },
  editorial: { preset: "smooth", duration: 0.86, delay: 0.78, distance: 0.66 },
  experimental: { preset: "cinematic", duration: 1.68, delay: 1.5, distance: 1.85 },
};

const SECTION_KEY_MAP: Record<AnimationSection, string> = {
  pageTransition: "animation_section_page_transition",
  categoryPages: "animation_section_category_pages",
  navbar: "animation_section_navbar",
  footer: "animation_section_footer",
  homeHero: "animation_section_home_hero",
  projectDetail: "animation_section_project_detail",
};

const SECTION_DURATION_KEY_MAP: Record<AnimationSection, string> = {
  pageTransition: "animation_section_page_transition_duration",
  categoryPages: "animation_section_category_pages_duration",
  navbar: "animation_section_navbar_duration",
  footer: "animation_section_footer_duration",
  homeHero: "animation_section_home_hero_duration",
  projectDetail: "animation_section_project_detail_duration",
};

const SECTION_DELAY_KEY_MAP: Record<AnimationSection, string> = {
  pageTransition: "animation_section_page_transition_delay",
  categoryPages: "animation_section_category_pages_delay",
  navbar: "animation_section_navbar_delay",
  footer: "animation_section_footer_delay",
  homeHero: "animation_section_home_hero_delay",
  projectDetail: "animation_section_project_detail_delay",
};

const SECTION_DISTANCE_KEY_MAP: Record<AnimationSection, string> = {
  pageTransition: "animation_section_page_transition_distance",
  categoryPages: "animation_section_category_pages_distance",
  navbar: "animation_section_navbar_distance",
  footer: "animation_section_footer_distance",
  homeHero: "animation_section_home_hero_distance",
  projectDetail: "animation_section_project_detail_distance",
};

const SECTION_PROFILE_KEY_MAP: Record<AnimationSection, string> = {
  pageTransition: "animation_section_page_transition_profile",
  categoryPages: "animation_section_category_pages_profile",
  navbar: "animation_section_navbar_profile",
  footer: "animation_section_footer_profile",
  homeHero: "animation_section_home_hero_profile",
  projectDetail: "animation_section_project_detail_profile",
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

function parseMultiplier(raw?: string, fallback = 1, min = 0.4, max = 2) {
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function parseProfile(raw?: string, allowInherit = true): AnimationProfileKey {
  const value = (raw || "").trim().toLowerCase();
  if (allowInherit && value === "inherit") return "inherit";
  if (
    value === "cinematic" ||
    value === "smooth" ||
    value === "snappy" ||
    value === "minimal" ||
    value === "gentle" ||
    value === "dramatic" ||
    value === "luxury" ||
    value === "energetic" ||
    value === "documentary" ||
    value === "editorial" ||
    value === "experimental"
  ) {
    return value;
  }
  return allowInherit ? "inherit" : "cinematic";
}

function getOffsetForPreset(baseOffset: number, selectedPreset: AnimationPreset) {
  if (selectedPreset === "snappy") return baseOffset * 0.5;
  if (selectedPreset === "minimal") return baseOffset * 0.35;
  return baseOffset;
}

export function useAnimationSettings() {
  const { data: settings } = useSiteSettings();

  const enabled = parseEnabled(settings?.animation_enabled);
  const selectedGlobalProfile = parseProfile(settings?.animation_preset, false) as Exclude<AnimationProfileKey, "inherit">;
  const globalProfile = PROFILE_SETTINGS[selectedGlobalProfile];
  const preset = globalProfile.preset;
  const speed = parseSpeed(settings?.animation_speed);
  const ease = EASE_BY_PRESET[preset];

  const getDuration = (baseDuration: number) =>
    enabled ? Math.max(0.05, (baseDuration / speed) * globalProfile.duration) : 0;

  const getDelay = (baseDelay: number) =>
    enabled ? Math.max(0, (baseDelay / speed) * globalProfile.delay) : 0;

  const getOffsetY = (baseOffset: number) => {
    if (!enabled) return 0;
    return getOffsetForPreset(baseOffset, preset) * globalProfile.distance;
  };

  const isSectionEnabled = (section: AnimationSection) => {
    if (!enabled) return false;
    const key = SECTION_KEY_MAP[section];
    return parseEnabled(settings?.[key]);
  };

  const getSectionProfile = (section: AnimationSection) => {
    const key = SECTION_PROFILE_KEY_MAP[section];
    const profile = parseProfile(settings?.[key]);
    if (profile === "inherit") return null;
    return PROFILE_SETTINGS[profile];
  };

  const getSectionEase = (section: AnimationSection) => {
    const profile = getSectionProfile(section);
    const selectedPreset = profile?.preset || preset;
    return EASE_BY_PRESET[selectedPreset];
  };

  const getSectionDuration = (section: AnimationSection, baseDuration: number) => {
    if (!isSectionEnabled(section)) return 0;
    const profile = getSectionProfile(section);
    const sectionMultiplier = parseMultiplier(settings?.[SECTION_DURATION_KEY_MAP[section]]);
    const profileMultiplier = profile?.duration || 1;
    return Math.max(0.05, getDuration(baseDuration) * sectionMultiplier * profileMultiplier);
  };

  const getSectionDelay = (section: AnimationSection, baseDelay: number) => {
    if (!isSectionEnabled(section)) return 0;
    const profile = getSectionProfile(section);
    const sectionMultiplier = parseMultiplier(settings?.[SECTION_DELAY_KEY_MAP[section]]);
    const profileMultiplier = profile?.delay || 1;
    return Math.max(0, getDelay(baseDelay) * sectionMultiplier * profileMultiplier);
  };

  const getSectionOffsetY = (section: AnimationSection, baseOffset: number) => {
    if (!isSectionEnabled(section)) return 0;
    const profile = getSectionProfile(section);
    const selectedPreset = profile?.preset || preset;
    const sectionMultiplier = parseMultiplier(settings?.[SECTION_DISTANCE_KEY_MAP[section]]);
    const profileMultiplier = profile?.distance || 1;
    return getOffsetForPreset(baseOffset, selectedPreset) * globalProfile.distance * sectionMultiplier * profileMultiplier;
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
    getSectionEase,
    getSectionDuration,
    getSectionDelay,
    getSectionOffsetY,
  };
}
