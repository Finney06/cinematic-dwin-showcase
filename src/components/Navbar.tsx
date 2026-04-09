import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState, useEffect } from "react";
import { useMenuItems, useSiteSettings } from "@/hooks/useContent";
import { useAnimationSettings } from "@/hooks/useAnimationSettings";

interface NavbarProps {
  enterDelay?: number;
}

const Navbar = ({ enterDelay = 0 }: NavbarProps) => {
  const shouldReduceMotion = useReducedMotion();
  const { getSectionDuration, getSectionDelay, getSectionOffsetY, getSectionEase, isSectionEnabled } = useAnimationSettings();
  const instant = shouldReduceMotion || !isSectionEnabled("navbar");
  const sectionEase = getSectionEase("navbar");

  const menuContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: instant ? 0 : getSectionDuration("navbar", 0.06),
        delayChildren: instant ? 0 : getSectionDelay("navbar", 0.2),
      },
    },
    exit: {
      transition: {
        staggerChildren: instant ? 0 : getSectionDuration("navbar", 0.03),
        staggerDirection: -1,
      },
    },
  };

  const menuItemVariant = {
    hidden: { y: instant ? 0 : getSectionOffsetY("navbar", 40), opacity: instant ? 1 : 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: instant ? 0 : getSectionDuration("navbar", 0.5), ease: sectionEase },
    },
    exit: {
      y: instant ? 0 : getSectionOffsetY("navbar", -20),
      opacity: instant ? 1 : 0,
      transition: { duration: instant ? 0 : getSectionDuration("navbar", 0.3), ease: "easeIn" as const },
    },
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
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

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <motion.nav
        initial={{ opacity: instant ? 1 : 0, y: instant ? "0rem" : "-2rem" }}
        animate={{ opacity: 1, y: "0rem" }}
        transition={{
          duration: instant ? 0 : getSectionDuration("navbar", 1.2),
          delay: instant ? 0 : getSectionDelay("navbar", enterDelay),
          ease: sectionEase,
        }}
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-5 sm:px-8 md:px-12 py-6 sm:py-8"
      >
        <Link
          to="/"
          className="group flex items-center gap-2 hover:opacity-60 transition-opacity duration-700"
        >
          <span className="font-body text-[12px] sm:text-[13px] md:text-[15px] font-medium tracking-[0.22em] uppercase text-foreground leading-none">
            Dwindik
          </span>
          <span className="block w-[5px] h-[5px] bg-foreground/40 rounded-full group-hover:bg-foreground/70 transition-colors duration-700" />
        </Link>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="group flex items-center gap-3 cursor-pointer"
        >
          <span className="font-body text-[10px] tracking-[0.25em] uppercase text-foreground/25 group-hover:text-foreground/70 transition-colors duration-500">
            {menuOpen ? "Close" : "Menu"}
          </span>
          <div className="flex flex-col items-center gap-[5px] w-5">
            <motion.span
              animate={
                menuOpen
                  ? { rotate: 45, y: 6, width: 20 }
                  : { rotate: 0, y: 0, width: 20 }
              }
              transition={{ duration: instant ? 0 : getSectionDuration("navbar", 0.4), ease: sectionEase }}
              className="block h-px bg-foreground origin-center"
            />
            <motion.span
              animate={
                menuOpen
                  ? { opacity: 0, x: 10 }
                  : { opacity: 1, x: 0 }
              }
              transition={{ duration: instant ? 0 : getSectionDuration("navbar", 0.3), ease: sectionEase }}
              className="block h-px bg-foreground/60 w-4"
            />
            <motion.span
              animate={
                menuOpen
                  ? { rotate: -45, y: -6, width: 20 }
                  : { rotate: 0, y: 0, width: 20 }
              }
              transition={{ duration: instant ? 0 : getSectionDuration("navbar", 0.4), ease: sectionEase }}
              className="block h-px bg-foreground origin-center"
            />
          </div>
        </button>
      </motion.nav>

      {/* ═══ FULLSCREEN MENU OVERLAY ═══ */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="menu"
            initial={{ opacity: instant ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: instant ? 1 : 0 }}
            transition={{ duration: instant ? 0 : getSectionDuration("navbar", 0.5), ease: sectionEase }}
            className="fixed inset-0 z-[90]"
          >
            <motion.div
              className="absolute inset-0 bg-background/95 backdrop-blur-xl"
              initial={{ opacity: instant ? 1 : 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: instant ? 1 : 0 }}
              transition={{ duration: instant ? 0 : getSectionDuration("navbar", 0.4), ease: sectionEase }}
            />
            <div className="relative z-10 w-full h-full overflow-y-auto flex flex-col md:flex-row items-start md:items-center px-5 sm:px-10 md:px-20 pt-24 sm:pt-28 pb-8 md:pt-0 md:pb-0">
              <motion.div
                className="flex-1 flex flex-col gap-0.5 sm:gap-1 md:gap-2"
                variants={menuContainer}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {menuItems.filter(item => item.visible).map((item, i) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.div key={item.id} variants={menuItemVariant}>
                      <Link
                        to={item.path}
                        onClick={() => setMenuOpen(false)}
                        className="group flex items-center gap-3 sm:gap-4"
                      >
                        <span className="font-body text-[9px] sm:text-[10px] tracking-[0.2em] text-foreground/20 tabular-nums">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span
                          className={`font-display text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-light tracking-[0.08em] uppercase transition-colors duration-500 leading-tight ${
                            isActive
                              ? "text-foreground"
                              : "text-foreground/70 group-hover:text-foreground"
                          }`}
                        >
                          {item.label}
                        </span>
                        {isActive && (
                          <span className="block w-1.5 h-1.5 rounded-full bg-foreground/50" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>

              <motion.div
                className="mt-8 sm:mt-12 md:mt-0 md:w-[280px] flex flex-col gap-5 sm:gap-6"
                initial={{ opacity: instant ? 1 : 0, x: instant ? 0 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: instant ? 1 : 0, x: instant ? 0 : 30 }}
                transition={{
                  duration: instant ? 0 : getSectionDuration("navbar", 0.6),
                  delay: instant ? 0 : getSectionDelay("navbar", 0.4),
                  ease: sectionEase,
                }}
              >
                <div>
                  <p className="font-body text-[10px] tracking-[0.3em] uppercase text-foreground/30 mb-3">
                    Get in touch
                  </p>
                  <a
                    href={`mailto:${settings?.contact_email || "hello@dwindik.com"}`}
                    className="font-body text-sm text-foreground/50 hover:text-foreground/80 transition-colors duration-500"
                  >
                    {settings?.contact_email || "hello@dwindik.com"}
                  </a>
                </div>
                <div>
                  <p className="font-body text-[10px] tracking-[0.3em] uppercase text-foreground/30 mb-3">
                    Follow
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {socialLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-body text-sm tracking-[0.15em] uppercase text-foreground/30 hover:text-foreground/70 transition-colors duration-500"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
