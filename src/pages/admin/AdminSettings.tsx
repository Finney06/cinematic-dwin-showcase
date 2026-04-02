import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSiteSettings } from "@/lib/api";
import { updateSettings, changePassword } from "@/lib/adminApi";
import { toast } from "sonner";

type SocialLink = { label: string; url: string };

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
  const [form, setForm] = useState({
    contact_email: "",
    social_instagram: "",
    social_youtube: "",
    social_twitter: "",
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
      setForm({
        contact_email: data.contact_email || "",
        social_instagram: data.social_instagram || "",
        social_youtube: data.social_youtube || "",
        social_twitter: data.social_twitter || "",
        copyright_text: data.copyright_text || "",
        site_title: data.site_title || "",
      });

      const parsedLinks = parseSocialLinks(data.social_links);
      if (parsedLinks.length) {
        setSocialLinks(parsedLinks);
      } else {
        const legacyLinks = [
          { label: "Instagram", url: data.social_instagram || "" },
          { label: "YouTube", url: data.social_youtube || "" },
          { label: "Twitter", url: data.social_twitter || "" },
        ].filter((link) => link.url);
        setSocialLinks(legacyLinks.length ? legacyLinks : [{ label: "", url: "" }]);
      }
    }
  }, [data]);

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
