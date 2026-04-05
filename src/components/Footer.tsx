import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useMenuItems, useSiteSettings } from "@/hooks/useContent";
import { useAnimationSettings } from "@/hooks/useAnimationSettings";

const Footer = () => {
  const shouldReduceMotion = useReducedMotion();
  const { getSectionDuration, getSectionEase, isSectionEnabled } = useAnimationSettings();
  const instant = shouldReduceMotion || !isSectionEnabled("footer");
  const sectionEase = getSectionEase("footer");

  const { data: menuItems = [] } = useMenuItems();
  const { data: settings } = useSiteSettings();

  const socialLinks = (() => {
    if (settings?.social_links) {
      try {
        const parsed = JSON.parse(settings.social_links);
        if (Array.isArray(parsed)) return parsed.filter((l) => l?.label && l?.url);
      } catch {
        return [];
      }
    }
    return [
      settings?.social_instagram ? { label: "Instagram", url: settings.social_instagram } : null,
      settings?.social_youtube ? { label: "YouTube", url: settings.social_youtube } : null,
      settings?.social_twitter ? { label: "Twitter", url: settings.social_twitter } : null,
    ].filter(Boolean);
  })();

  return (
    <motion.footer
      initial={{ opacity: instant ? 1 : 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: instant ? 0 : getSectionDuration("footer", 1), ease: sectionEase }}
      className="border-t border-foreground/[0.06] px-5 sm:px-8 md:px-12 py-10 sm:py-12 mt-14 sm:mt-20"
    >
      {/* Nav links row */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8">
        {menuItems.filter(item => item.visible).map((link) => (
          <Link
            key={link.id}
            to={link.path}
            className="font-body text-[10px] tracking-[0.25em] uppercase text-foreground/25 hover:text-foreground/60 transition-colors duration-500"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Social + copyright row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-4">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-[10px] tracking-[0.2em] uppercase text-foreground/20 hover:text-foreground/50 transition-colors duration-500"
            >
              {link.label}
            </a>
          ))}
        </div>
        <p className="font-body text-[10px] tracking-[0.15em] uppercase text-foreground/15">
          {settings?.copyright_text || "©2026 Dwindik. All rights reserved."}
        </p>
        <p className="font-body text-[9px] tracking-[0.12em] uppercase text-foreground/10">
          Build: 2026-04-05
        </p>
      </div>
    </motion.footer>
  );
};

export default Footer;
