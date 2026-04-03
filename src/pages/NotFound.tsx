import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-5">
      <div className="max-w-md w-full bg-white/[0.02] border border-white/[0.08] rounded-xl p-8 text-center">
        <p className="text-[10px] tracking-[0.35em] uppercase text-white/20">Error</p>
        <h1 className="mt-3 text-5xl font-light text-white/80">404</h1>
        <p className="mt-4 text-sm text-white/45">
          {isAdminPath
            ? "This admin page does not exist or has moved."
            : "This page does not exist or has moved."}
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <Link
            to={isAdminPath ? "/admin" : "/"}
            className="px-4 py-2.5 rounded-lg bg-white/90 text-black text-xs tracking-[0.12em] uppercase font-medium"
          >
            {isAdminPath ? "Go to Dashboard" : "Go Home"}
          </Link>
          <Link
            to={isAdminPath ? "/admin/login" : "/about"}
            className="px-4 py-2.5 rounded-lg bg-white/[0.06] text-white/50 hover:text-white/70 text-xs tracking-[0.12em] uppercase"
          >
            {isAdminPath ? "Sign In" : "About"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
