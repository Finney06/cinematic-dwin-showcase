import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useMenuItems, useSiteSettings } from "@/hooks/useContent";

const Footer = () => {
  const { data: menuItems = [] } = useMenuItems();
  const { data: settings } = useSiteSettings();

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
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
          {settings?.social_instagram && (
            <a
              href={settings.social_instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-[10px] tracking-[0.2em] uppercase text-foreground/20 hover:text-foreground/50 transition-colors duration-500"
            >
              Instagram
            </a>
          )}
          {settings?.social_youtube && (
            <a
              href={settings.social_youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-[10px] tracking-[0.2em] uppercase text-foreground/20 hover:text-foreground/50 transition-colors duration-500"
            >
              YouTube
            </a>
          )}
          {settings?.social_twitter && (
            <a
              href={settings.social_twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-[10px] tracking-[0.2em] uppercase text-foreground/20 hover:text-foreground/50 transition-colors duration-500"
            >
              Twitter
            </a>
          )}
        </div>
        <p className="font-body text-[10px] tracking-[0.15em] uppercase text-foreground/15">
          {settings?.copyright_text || "©2026 Dwindik. All rights reserved."}
        </p>
      </div>
    </motion.footer>
  );
};

export default Footer;
