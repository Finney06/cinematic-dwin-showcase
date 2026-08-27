import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useContent";
import Index from "./pages/Index";
import Work from "./pages/Work";
import Film from "./pages/Film";
import Television from "./pages/Television";
import Nonfiction from "./pages/Nonfiction";
import Audio from "./pages/Audio";
import MusicPage from "./pages/Music";
import Commercials from "./pages/Commercials";
import News from "./pages/News";
import Internship from "./pages/Internship";
import About from "./pages/About";
import ProjectDetail from "./pages/ProjectDetail";
import NotFound from "./pages/NotFound";
// Admin
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminProjectForm from "./pages/admin/AdminProjectForm";
import AdminAbout from "./pages/admin/AdminAbout";
import AdminHero from "./pages/admin/AdminHero";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminMenu from "./pages/admin/AdminMenu";
import AdminPages from "./pages/admin/AdminPages";
import ProtectedRoute from "./components/admin/ProtectedRoute";

const queryClient = new QueryClient();

const RouteSeo = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const studioDescription =
      "CRA8 is a Nigerian film studio working in spiritual drama and thriller — cinematography, editing, visual effects and sound design.";

    const map: Record<string, { title: string; description: string }> = {
      "/": { title: "CRA8 — Film Studio", description: studioDescription },
      "/work": { title: "Work | CRA8", description: "The CRA8 slate — every film, with credits." },
      "/film": { title: "Film | CRA8", description: "Films on the CRA8 slate." },
      "/television": { title: "Television | CRA8", description: "Television work on the CRA8 slate." },
      "/nonfiction": { title: "Nonfiction | CRA8", description: "Nonfiction work on the CRA8 slate." },
      "/audio": { title: "Audio | CRA8", description: "Audio and sound-driven work from CRA8." },
      "/music": { title: "Music | CRA8", description: "Music visuals from CRA8." },
      "/commercials": { title: "Commercials | CRA8", description: "Commercial work from CRA8." },
      "/news": { title: "News | CRA8", description: "Announcements and updates from CRA8." },
      "/internship": { title: "Internship | CRA8", description: "Internship opportunities and information." },
      "/about": { title: "About | CRA8", description: studioDescription },
      "/admin/login": { title: "Admin Login | CRA8", description: "Sign in to the CRA8 admin portal." },
      "/admin": { title: "Admin Dashboard | CRA8", description: "Manage projects, pages, and settings." },
      "/admin/projects": { title: "Admin Projects | CRA8", description: "Manage the CRA8 slate." },
      "/admin/pages": { title: "Admin Pages | CRA8", description: "Edit custom page content." },
      "/admin/about": { title: "Admin About | CRA8", description: "Edit About page content." },
      "/admin/hero": { title: "Admin Hero | CRA8", description: "Edit homepage hero section." },
      "/admin/settings": { title: "Admin Settings | CRA8", description: "Update site settings and account options." },
      "/admin/menu": { title: "Admin Menu | CRA8", description: "Manage navigation structure." },
    };

    const meta =
      map[path] ||
      (path.startsWith("/work/")
        ? { title: "Project | CRA8", description: "Project details and credits." }
        : path.startsWith("/admin/projects/")
        ? { title: "Admin Project Editor | CRA8", description: "Create and edit project entries." }
        : { title: "Page Not Found | CRA8", description: "The requested page could not be found." });

    document.title = meta.title;

    let descriptionEl = document.querySelector('meta[name="description"]');
    if (!descriptionEl) {
      descriptionEl = document.createElement("meta");
      descriptionEl.setAttribute("name", "description");
      document.head.appendChild(descriptionEl);
    }
    descriptionEl.setAttribute("content", meta.description);
  }, [location.pathname]);

  return null;
};

const FontSettings = () => {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (!settings) return;
    const display = settings.font_display || '"Heiti TC", "PingFang TC", "Microsoft JhengHei", sans-serif';
    const body = settings.font_body || '"Pragmatica", "Inter", "Helvetica Neue", Arial, sans-serif';
    document.documentElement.style.setProperty("--font-display", display);
    document.documentElement.style.setProperty("--font-body", body);

    const localOnlyFamilies = new Set(["Pragmatica", "Heiti TC"]);

    const extractFamily = (value: string) => {
      const match = value.match(/"([^"]+)"/);
      return match?.[1] || value.split(",")[0].trim();
    };

    const families = [extractFamily(display), extractFamily(body)]
      .filter(Boolean)
      .filter((f) => !localOnlyFamilies.has(f))
      .map((f) => f.replace(/\s+/g, "+"));

    if (!families.length) {
      const existing = document.getElementById("dynamic-google-fonts");
      if (existing) existing.remove();
      return;
    }

    const href = `https://fonts.googleapis.com/css2?${families
      .map((f) => `family=${f}:wght@300;400;500;600;700`)
      .join("&")}&display=swap`;

    let link = document.getElementById("dynamic-google-fonts") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.id = "dynamic-google-fonts";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
    link.href = href;
  }, [settings]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <FontSettings />
      <BrowserRouter>
        <RouteSeo />
        <AnimatePresence mode="wait">
          <Routes>
            {/* ─── Public ─── */}
            <Route path="/" element={<Index />} />
            <Route path="/work" element={<Work />} />
            <Route path="/film" element={<Film />} />
            <Route path="/television" element={<Television />} />
            <Route path="/nonfiction" element={<Nonfiction />} />
            <Route path="/audio" element={<Audio />} />
            <Route path="/music" element={<MusicPage />} />
            <Route path="/commercials" element={<Commercials />} />
            <Route path="/news" element={<News />} />
            <Route path="/internship" element={<Internship />} />
            <Route path="/about" element={<About />} />
            <Route path="/work/:id" element={<ProjectDetail />} />

            {/* ─── Admin ─── */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="projects/new" element={<AdminProjectForm />} />
              <Route path="projects/:id/edit" element={<AdminProjectForm />} />
              <Route path="pages" element={<AdminPages />} />
              <Route path="about" element={<AdminAbout />} />
              <Route path="hero" element={<AdminHero />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="menu" element={<AdminMenu />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
