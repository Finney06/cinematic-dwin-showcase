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
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-12 py-6"
    >
      <Link
        to="/"
        className="font-display text-xl font-light tracking-[0.15em] uppercase text-foreground hover:opacity-50 transition-opacity duration-500"
      >
        Dwindik
      </Link>
      <div className="flex items-center gap-8">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`font-body text-[11px] tracking-[0.2em] uppercase transition-opacity duration-500 ${
              location.pathname === item.path
                ? "text-foreground opacity-100"
                : "text-foreground opacity-40 hover:opacity-100"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </motion.nav>
  );
};

export default Navbar;
