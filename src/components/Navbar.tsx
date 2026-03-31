import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "Work", path: "/work" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-12 py-8">
      <Link
        to="/"
        className="group flex items-center gap-1.5 hover:opacity-60 transition-opacity duration-700"
      >
        <span className="font-display text-lg md:text-xl font-light tracking-[0.2em] uppercase text-foreground leading-none">
          Dwindik
        </span>
        <span className="block w-1 h-1 bg-foreground/30 rounded-full group-hover:bg-foreground/70 transition-colors duration-700" />
      </Link>
      <div className="flex items-center gap-10">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`font-body text-[10px] tracking-[0.25em] uppercase transition-all duration-700 ${
              location.pathname === item.path
                ? "text-foreground opacity-80"
                : "text-foreground opacity-25 hover:opacity-70"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
