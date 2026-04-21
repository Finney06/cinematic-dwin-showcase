import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSiteSettings } from "@/lib/api";
import { updateSettings, changePassword } from "@/lib/adminApi";
import { toast } from "sonner";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

type SocialLink = { label: string; url: string };

const GOOGLE_FONTS = [
  { label: "Heiti TC", family: "Heiti TC", fallback: '"PingFang TC", "Microsoft JhengHei", sans-serif' },
  { label: "Pragmatica", family: "Pragmatica", fallback: '"Inter", "Helvetica Neue", Arial, sans-serif' },
  { label: "Cormorant Garamond", family: "Cormorant Garamond", fallback: "serif" },
  { label: "Inter", family: "Inter", fallback: "sans-serif" },
  { label: "Playfair Display", family: "Playfair Display", fallback: "serif" },
  { label: "Lora", family: "Lora", fallback: "serif" },
  { label: "Merriweather", family: "Merriweather", fallback: "serif" },
  { label: "Libre Baskerville", family: "Libre Baskerville", fallback: "serif" },
  { label: "Crimson Pro", family: "Crimson Pro", fallback: "serif" },
  { label: "Spectral", family: "Spectral", fallback: "serif" },
  { label: "Fraunces", family: "Fraunces", fallback: "serif" },
  { label: "Montserrat", family: "Montserrat", fallback: "sans-serif" },
  { label: "Poppins", family: "Poppins", fallback: "sans-serif" },
  { label: "Raleway", family: "Raleway", fallback: "sans-serif" },
  { label: "Roboto", family: "Roboto", fallback: "sans-serif" },
  { label: "DM Sans", family: "DM Sans", fallback: "sans-serif" },
  { label: "Manrope", family: "Manrope", fallback: "sans-serif" },
  { label: "Space Grotesk", family: "Space Grotesk", fallback: "sans-serif" },
  { label: "Outfit", family: "Outfit", fallback: "sans-serif" },
  { label: "Sora", family: "Sora", fallback: "sans-serif" },
];

const parseSocialLinks = (raw?: string): SocialLink[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => item?.label && item?.url);
    }
  } catch {
    return [];
  }
  return [];
};

const buildLegacySocials = (links: SocialLink[]) => {
  const byLabel = (label: string) =>
    links.find((l) => l.label.toLowerCase() === label)?.url || "";
  return {
    social_instagram: byLabel("instagram"),
    social_youtube: byLabel("youtube"),
    social_twitter: byLabel("twitter") || byLabel("x"),
  };
};

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const initialSettingsRef = useRef("");
  const [form, setForm] = useState({
    contact_email: "",
    social_instagram: "",
    social_youtube: "",
    social_twitter: "",
    font_display: '"Pragmatica", "Inter", "Helvetica Neue", Arial, sans-serif',
    font_body: '"Heiti TC", "PingFang TC", "Microsoft JhengHei", sans-serif',
    animation_enabled: "true",
    animation_preset: "cinematic",
    animation_speed: "1",
    animation_section_page_transition: "true",
    animation_section_page_transition_profile: "inherit",
    animation_section_page_transition_duration: "1",
    animation_section_page_transition_delay: "1",
    animation_section_page_transition_distance: "1",
    animation_section_category_pages: "true",
    animation_section_category_pages_profile: "inherit",
    animation_section_category_pages_duration: "1",
    animation_section_category_pages_delay: "1",
    animation_section_category_pages_distance: "1",
    animation_section_navbar: "true",
    animation_section_navbar_profile: "inherit",
    animation_section_navbar_duration: "1",
    animation_section_navbar_delay: "1",
    animation_section_navbar_distance: "1",
    animation_section_footer: "true",
    animation_section_footer_profile: "inherit",
    animation_section_footer_duration: "1",
    animation_section_footer_delay: "1",
    animation_section_footer_distance: "1",
    animation_section_home_hero: "true",
    animation_section_home_hero_profile: "inherit",
    animation_section_home_hero_duration: "1",
    animation_section_home_hero_delay: "1",
    animation_section_home_hero_distance: "1",
    animation_section_project_detail: "true",
    animation_section_project_detail_profile: "inherit",
    animation_section_project_detail_duration: "1",
    animation_section_project_detail_delay: "1",
    animation_section_project_detail_distance: "1",
    copyright_text: "",
    site_title: "",
  });
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const { data } = useQuery({
    queryKey: ["siteSettings"],
    queryFn: fetchSiteSettings,
  });

  useEffect(() => {
    if (data) {
      const nextForm = {
        contact_email: data.contact_email || "",
        social_instagram: data.social_instagram || "",
        social_youtube: data.social_youtube || "",
        social_twitter: data.social_twitter || "",
        font_display: data.font_display || '"Pragmatica", "Inter", "Helvetica Neue", Arial, sans-serif',
        font_body: data.font_body || '"Heiti TC", "PingFang TC", "Microsoft JhengHei", sans-serif',
        animation_enabled: data.animation_enabled || "true",
        animation_preset: data.animation_preset || "cinematic",
        animation_speed: data.animation_speed || "1",
        animation_section_page_transition: data.animation_section_page_transition || "true",
        animation_section_page_transition_profile: data.animation_section_page_transition_profile || "inherit",
        animation_section_page_transition_duration: data.animation_section_page_transition_duration || "1",
        animation_section_page_transition_delay: data.animation_section_page_transition_delay || "1",
        animation_section_page_transition_distance: data.animation_section_page_transition_distance || "1",
        animation_section_category_pages: data.animation_section_category_pages || "true",
        animation_section_category_pages_profile: data.animation_section_category_pages_profile || "inherit",
        animation_section_category_pages_duration: data.animation_section_category_pages_duration || "1",
        animation_section_category_pages_delay: data.animation_section_category_pages_delay || "1",
        animation_section_category_pages_distance: data.animation_section_category_pages_distance || "1",
        animation_section_navbar: data.animation_section_navbar || "true",
        animation_section_navbar_profile: data.animation_section_navbar_profile || "inherit",
        animation_section_navbar_duration: data.animation_section_navbar_duration || "1",
        animation_section_navbar_delay: data.animation_section_navbar_delay || "1",
        animation_section_navbar_distance: data.animation_section_navbar_distance || "1",
        animation_section_footer: data.animation_section_footer || "true",
        animation_section_footer_profile: data.animation_section_footer_profile || "inherit",
        animation_section_footer_duration: data.animation_section_footer_duration || "1",
        animation_section_footer_delay: data.animation_section_footer_delay || "1",
        animation_section_footer_distance: data.animation_section_footer_distance || "1",
        animation_section_home_hero: data.animation_section_home_hero || "true",
        animation_section_home_hero_profile: data.animation_section_home_hero_profile || "inherit",
        animation_section_home_hero_duration: data.animation_section_home_hero_duration || "1",
        animation_section_home_hero_delay: data.animation_section_home_hero_delay || "1",
        animation_section_home_hero_distance: data.animation_section_home_hero_distance || "1",
        animation_section_project_detail: data.animation_section_project_detail || "true",
        animation_section_project_detail_profile: data.animation_section_project_detail_profile || "inherit",
        animation_section_project_detail_duration: data.animation_section_project_detail_duration || "1",
        animation_section_project_detail_delay: data.animation_section_project_detail_delay || "1",
        animation_section_project_detail_distance: data.animation_section_project_detail_distance || "1",
        copyright_text: data.copyright_text || "",
        site_title: data.site_title || "",
      };
      setForm(nextForm);

      const parsedLinks = parseSocialLinks(data.social_links);
      if (parsedLinks.length) {
        setSocialLinks(parsedLinks);
        initialSettingsRef.current = JSON.stringify({ form: nextForm, socialLinks: parsedLinks });
      } else {
        const legacyLinks = [
          { label: "Instagram", url: data.social_instagram || "" },
          { label: "YouTube", url: data.social_youtube || "" },
          { label: "Twitter", url: data.social_twitter || "" },
        ].filter((link) => link.url);
        const fallbackLinks = legacyLinks.length ? legacyLinks : [{ label: "", url: "" }];
        setSocialLinks(fallbackLinks);
        initialSettingsRef.current = JSON.stringify({ form: nextForm, socialLinks: fallbackLinks });
      }
    }
  }, [data]);

  const isDirty =
    initialSettingsRef.current !== JSON.stringify({ form, socialLinks });
  useUnsavedChanges(isDirty);

  const saveMutation = useMutation({
    mutationFn: () => {
      const normalizedLinks = socialLinks.filter((link) => link.label && link.url);
      const legacy = buildLegacySocials(normalizedLinks);
      return updateSettings({
        ...form,
        ...legacy,
        social_links: JSON.stringify(normalizedLinks),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["siteSettings"] });
      initialSettingsRef.current = JSON.stringify({ form, socialLinks });
      toast.success("Settings saved!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const passwordMutation = useMutation({
    mutationFn: () => changePassword(passwordForm.currentPassword, passwordForm.newPassword),
    onSuccess: () => {
      toast.success("Password changed!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    passwordMutation.mutate();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl tracking-[0.06em] text-white/80 font-light">
          Settings
        </h1>
        <p className="text-xs text-white/25 tracking-wide mt-1">
          Global site settings and account management
        </p>
      </div>

      <div className="space-y-10 max-w-2xl">
        {/* Site Settings */}
        <form onSubmit={handleSettingsSubmit}>
          <section className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs tracking-[0.15em] uppercase text-white/30 font-medium">
                General
              </h2>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="bg-white/90 text-black px-4 py-2 rounded-lg text-[10px] tracking-[0.1em] uppercase font-medium hover:bg-white transition-colors disabled:opacity-40 cursor-pointer"
              >
                {saveMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                  Site Title
                </label>
                <input
                  type="text"
                  value={form.site_title}
                  onChange={(e) => setForm((p) => ({ ...p, site_title: e.target.value }))}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                  Display Font Family
                </label>
                <select
                  value={form.font_display}
                  onChange={(e) => setForm((p) => ({ ...p, font_display: e.target.value }))}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 focus:outline-none focus:border-white/20 transition-colors"
                >
                  {GOOGLE_FONTS.map((font) => (
                    <option
                      key={`display-${font.family}`}
                      value={`"${font.family}", ${font.fallback}`}
                      className="bg-[#141414]"
                    >
                      {font.label}
                    </option>
                  ))}
                </select>
                <div
                  className="mt-3 bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-white/60"
                  style={{ fontFamily: form.font_display }}
                >
                  Display preview — Dwindik
                </div>
                <p className="mt-2 text-[10px] text-white/20">
                  Used for headings.
                </p>
              </div>
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                  Body Font Family
                </label>
                <select
                  value={form.font_body}
                  onChange={(e) => setForm((p) => ({ ...p, font_body: e.target.value }))}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 focus:outline-none focus:border-white/20 transition-colors"
                >
                  {GOOGLE_FONTS.map((font) => (
                    <option
                      key={`body-${font.family}`}
                      value={`"${font.family}", ${font.fallback}`}
                      className="bg-[#141414]"
                    >
                      {font.label}
                    </option>
                  ))}
                </select>
                <div
                  className="mt-3 bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-3 text-white/60"
                  style={{ fontFamily: form.font_body }}
                >
                  Body preview — Every frame is intentional.
                </div>
                <p className="mt-2 text-[10px] text-white/20">
                  Used for body text.
                </p>
              </div>
              <div className="pt-1">
                <h3 className="text-xs tracking-[0.15em] uppercase text-white/30 font-medium mb-3">
                  Animation
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                      Animation Enabled
                    </label>
                    <select
                      value={form.animation_enabled}
                      onChange={(e) => setForm((p) => ({ ...p, animation_enabled: e.target.value }))}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 focus:outline-none focus:border-white/20 transition-colors"
                    >
                      <option value="true" className="bg-[#141414]">Enabled</option>
                      <option value="false" className="bg-[#141414]">Disabled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                      Animation Style
                    </label>
                    <select
                      value={form.animation_preset}
                      onChange={(e) => setForm((p) => ({ ...p, animation_preset: e.target.value }))}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 focus:outline-none focus:border-white/20 transition-colors"
                    >
                      <option value="cinematic" className="bg-[#141414]">Cinematic</option>
                      <option value="smooth" className="bg-[#141414]">Smooth</option>
                      <option value="snappy" className="bg-[#141414]">Snappy</option>
                      <option value="minimal" className="bg-[#141414]">Minimal</option>
                      <option value="gentle" className="bg-[#141414]">Gentle</option>
                      <option value="dramatic" className="bg-[#141414]">Dramatic</option>
                      <option value="luxury" className="bg-[#141414]">Luxury</option>
                      <option value="energetic" className="bg-[#141414]">Energetic</option>
                      <option value="documentary" className="bg-[#141414]">Documentary</option>
                      <option value="editorial" className="bg-[#141414]">Editorial</option>
                      <option value="experimental" className="bg-[#141414]">Experimental</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                      Animation Speed ({Number(form.animation_speed).toFixed(2)}x)
                    </label>
                    <input
                      type="range"
                      min="0.35"
                      max="2"
                      step="0.05"
                      value={form.animation_speed}
                      onChange={(e) => setForm((p) => ({ ...p, animation_speed: e.target.value }))}
                      className="w-full accent-white/80"
                    />
                    <p className="mt-2 text-[10px] text-white/20">
                      Lower is slower, higher is faster.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                      Section Controls
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: "animation_section_page_transition", profileKey: "animation_section_page_transition_profile", label: "Page Transitions" },
                        { key: "animation_section_category_pages", profileKey: "animation_section_category_pages_profile", label: "Category Pages" },
                        { key: "animation_section_navbar", profileKey: "animation_section_navbar_profile", label: "Navbar + Menu" },
                        { key: "animation_section_footer", profileKey: "animation_section_footer_profile", label: "Footer" },
                        { key: "animation_section_home_hero", profileKey: "animation_section_home_hero_profile", label: "Homepage Hero" },
                        { key: "animation_section_project_detail", profileKey: "animation_section_project_detail_profile", label: "Project Detail" },
                      ].map((item) => {
                        const durationKey = `${item.key}_duration` as keyof typeof form;
                        const delayKey = `${item.key}_delay` as keyof typeof form;
                        const distanceKey = `${item.key}_distance` as keyof typeof form;
                        const profileKey = item.profileKey as keyof typeof form;

                        return (
                        <div key={item.key} className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-3">
                          <p className="text-[10px] tracking-[0.12em] uppercase text-white/40 mb-2">{item.label}</p>
                          <select
                            value={form[item.key as keyof typeof form]}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                [item.key]: e.target.value,
                              }))
                            }
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-white/20 transition-colors"
                          >
                            <option value="true" className="bg-[#141414]">Enabled</option>
                            <option value="false" className="bg-[#141414]">Disabled</option>
                          </select>
                          <label className="mt-3 block text-[10px] tracking-[0.08em] uppercase text-white/35">
                            Profile
                          </label>
                          <select
                            value={form[profileKey]}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                [profileKey]: e.target.value,
                              }))
                            }
                            className="mt-1 w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-white/20 transition-colors"
                          >
                            <option value="inherit" className="bg-[#141414]">Inherit Global</option>
                            <option value="cinematic" className="bg-[#141414]">Cinematic</option>
                            <option value="smooth" className="bg-[#141414]">Smooth</option>
                            <option value="snappy" className="bg-[#141414]">Snappy</option>
                            <option value="minimal" className="bg-[#141414]">Minimal</option>
                            <option value="gentle" className="bg-[#141414]">Gentle</option>
                            <option value="dramatic" className="bg-[#141414]">Dramatic</option>
                            <option value="luxury" className="bg-[#141414]">Luxury</option>
                            <option value="energetic" className="bg-[#141414]">Energetic</option>
                            <option value="documentary" className="bg-[#141414]">Documentary</option>
                            <option value="editorial" className="bg-[#141414]">Editorial</option>
                            <option value="experimental" className="bg-[#141414]">Experimental</option>
                          </select>
                          <div className="mt-3 space-y-2">
                            <label className="block text-[10px] tracking-[0.08em] uppercase text-white/35">
                              Duration × {Number(form[durationKey]).toFixed(2)}
                            </label>
                            <input
                              type="range"
                              min="0.4"
                              max="2"
                              step="0.05"
                              value={form[durationKey]}
                              onChange={(e) =>
                                setForm((p) => ({
                                  ...p,
                                  [durationKey]: e.target.value,
                                }))
                              }
                              className="w-full accent-white/80"
                            />

                            <label className="block text-[10px] tracking-[0.08em] uppercase text-white/35">
                              Delay × {Number(form[delayKey]).toFixed(2)}
                            </label>
                            <input
                              type="range"
                              min="0.4"
                              max="2"
                              step="0.05"
                              value={form[delayKey]}
                              onChange={(e) =>
                                setForm((p) => ({
                                  ...p,
                                  [delayKey]: e.target.value,
                                }))
                              }
                              className="w-full accent-white/80"
                            />

                            <label className="block text-[10px] tracking-[0.08em] uppercase text-white/35">
                              Distance × {Number(form[distanceKey]).toFixed(2)}
                            </label>
                            <input
                              type="range"
                              min="0.4"
                              max="2"
                              step="0.05"
                              value={form[distanceKey]}
                              onChange={(e) =>
                                setForm((p) => ({
                                  ...p,
                                  [distanceKey]: e.target.value,
                                }))
                              }
                              className="w-full accent-white/80"
                            />
                          </div>
                        </div>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-[10px] text-white/20">
                      Use these to switch animation per section and fine-tune timing/motion without touching code.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => setForm((p) => ({ ...p, contact_email: e.target.value }))}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="hello@dwindik.com"
                />
              </div>
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                  Copyright Text
                </label>
                <input
                  type="text"
                  value={form.copyright_text}
                  onChange={(e) => setForm((p) => ({ ...p, copyright_text: e.target.value }))}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>
            </div>
          </section>
        </form>

        {/* Social Links */}
        <form onSubmit={handleSettingsSubmit}>
          <section className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs tracking-[0.15em] uppercase text-white/30 font-medium">
                Social Links
              </h2>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="bg-white/90 text-black px-4 py-2 rounded-lg text-[10px] tracking-[0.1em] uppercase font-medium hover:bg-white transition-colors disabled:opacity-40 cursor-pointer"
              >
                {saveMutation.isPending ? "Saving..." : "Save"}
              </button>
            </div>
            <div className="space-y-4">
              {socialLinks.map((link, index) => (
                <div key={`${link.label}-${index}`} className="grid grid-cols-1 sm:grid-cols-[140px_1fr_auto] gap-3 items-center">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => {
                      const updated = [...socialLinks];
                      updated[index] = { ...updated[index], label: e.target.value };
                      setSocialLinks(updated);
                    }}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
                    placeholder="Label (e.g. TikTok)"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => {
                      const updated = [...socialLinks];
                      updated[index] = { ...updated[index], url: e.target.value };
                      setSocialLinks(updated);
                    }}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
                    placeholder="https://..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = socialLinks.filter((_, i) => i !== index);
                      setSocialLinks(updated.length ? updated : [{ label: "", url: "" }]);
                    }}
                    className="text-xs text-white/20 hover:text-red-400/70 transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setSocialLinks((prev) => [...prev, { label: "", url: "" }])}
                className="text-xs text-white/30 hover:text-white/50 transition-colors cursor-pointer"
              >
                + Add social link
              </button>
            </div>
          </section>
        </form>

        {/* Change Password */}
        <form onSubmit={handlePasswordSubmit}>
          <section className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
            <h2 className="text-xs tracking-[0.15em] uppercase text-white/30 font-medium mb-5">
              Change Password
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={passwordMutation.isPending}
                className="bg-white/[0.08] text-white/50 px-5 py-2.5 rounded-lg text-xs tracking-[0.1em] uppercase hover:bg-white/[0.12] hover:text-white/70 transition-colors disabled:opacity-40 cursor-pointer"
              >
                {passwordMutation.isPending ? "Changing..." : "Change Password"}
              </button>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
