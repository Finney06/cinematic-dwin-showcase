import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "Work", path: "/work" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const location = useLocation();

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 1.2 }}
      className="fixed top-0 left-0 right-0 z-50 px-5 sm:px-8 md:px-12 pt-4 md:py-6"
    >
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="group inline-flex items-center gap-2 font-body text-[12px] md:text-[13px] font-semibold tracking-[0.32em] uppercase text-foreground hover:opacity-80 transition-opacity duration-500"
        >
          <span>DWINDIK</span>
          <motion.span
            aria-hidden="true"
            initial={{ opacity: 0.55, scale: 0.9 }}
            animate={{ opacity: 0.95, scale: 1 }}
            transition={{ duration: 1.4, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            className="h-1.5 w-1.5 rounded-full bg-foreground/80 shadow-[0_0_10px_rgba(255,255,255,0.35)]"
          />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative pb-1 font-body text-[11px] tracking-[0.2em] uppercase transition-opacity duration-500 ${
                location.pathname === item.path
                  ? "text-foreground opacity-100"
                  : "text-foreground opacity-40 hover:opacity-100"
              }`}
            >
              {item.label}
              {location.pathname === item.path && (
                <motion.span
                  layoutId="nav-active-indicator"
                  className="absolute left-0 right-0 -bottom-0.5 h-px bg-foreground/70"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
              )}
            </Link>
          ))}
        </div>
      </div>

      <div className="md:hidden mt-3 flex justify-center w-full">
        <div className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 backdrop-blur px-1 py-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative rounded-full px-3 py-2 font-body text-[10px] tracking-[0.14em] uppercase transition-colors duration-300 ${
                  location.pathname === item.path
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {location.pathname === item.path && (
                  <motion.span
                    layoutId="nav-mobile-active-chip"
                    className="absolute inset-0 rounded-full border border-foreground/20 bg-foreground/10"
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            ))}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
