import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const navLinks = [
  { label: "Film", path: "/film" },
  { label: "Television", path: "/television" },
  { label: "Nonfiction", path: "/nonfiction" },
  { label: "Audio", path: "/audio" },
  { label: "Music", path: "/music" },
  { label: "About", path: "/about" },
  { label: "News", path: "/news" },
  { label: "Internship", path: "/internship" },
];

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com/dwindik" },
  { label: "YouTube", href: "https://youtube.com/@dwindik" },
  { label: "Twitter", href: "https://twitter.com/dwindik" },
];

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
      className="border-t border-foreground/[0.06] px-8 md:px-12 py-12 mt-20"
    >
      {/* Nav links row */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8">
        {navLinks.map((link) => (
          <Link
            key={link.path}
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
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-[10px] tracking-[0.2em] uppercase text-foreground/20 hover:text-foreground/50 transition-colors duration-500"
            >
              {link.label}
            </a>
          ))}
        </div>
        <p className="font-body text-[10px] tracking-[0.15em] uppercase text-foreground/15">
          ©2025 Dwindik. All rights reserved.
        </p>
      </div>
    </motion.footer>
  );
};

export default Footer;
