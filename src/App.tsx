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
import About from "./pages/About";
import Services from "./pages/Services";
import Journal from "./pages/Journal";
import JournalArticle from "./pages/JournalArticle";
import Contact from "./pages/Contact";
import ProjectDetail from "./pages/ProjectDetail";
import SlugPage from "./pages/SlugPage";
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
import AdminCategories from "./pages/admin/AdminCategories";
import AdminJournal from "./pages/admin/AdminJournal";
import AdminServices from "./pages/admin/AdminServices";
import AdminTeam from "./pages/admin/AdminTeam";
import AdminMessages from "./pages/admin/AdminMessages";
import ProtectedRoute from "./components/admin/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Content is edited rarely and read constantly; a refetch on every tab
      // focus just adds load without showing anything new.
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Titles for the admin portal. Public pages set their own head tags from the
 * CMS (see `components/site/Seo.tsx`) — the admin has no CMS row to read, so
 * its titles live here.
 */
const AdminSeo = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!pathname.startsWith("/admin")) return;

    const titles: Record<string, string> = {
      "/admin/login": "Sign in",
      "/admin": "Dashboard",
      "/admin/pages": "Pages",
      "/admin/projects": "Projects",
      "/admin/categories": "Categories",
      "/admin/journal": "Journal",
      "/admin/services": "Services",
      "/admin/team": "Team",
      "/admin/messages": "Messages",
      "/admin/about": "About",
      "/admin/hero": "Hero",
      "/admin/menu": "Menu",
      "/admin/settings": "Settings",
    };

    const match =
      titles[pathname] ||
      Object.entries(titles)
        .filter(([path]) => path !== "/admin" && pathname.startsWith(path))
        .map(([, label]) => label)[0] ||
      "Admin";

    document.title = `${match} | CRA8 Admin`;
    document.querySelector('meta[name="robots"]')?.setAttribute("content", "noindex,nofollow");
  }, [pathname]);

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

/**
 * Routes.
 *
 * Public URLs fall into three groups: the pages the app renders with a
 * purpose-built layout, the two collection detail routes, and `/:slug` — the
 * catch-all that resolves categories and admin-created pages against live CMS
 * data. Anything Dwindik creates from now on lands on that last one, so new
 * pages need no deploy.
 *
 * `location` is passed to both AnimatePresence and Routes so the outgoing page
 * stays mounted long enough to fade out.
 */
const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ─── Public ─── */}
        <Route path="/" element={<Index />} />
        <Route path="/work" element={<Work />} />
        <Route path="/work/:id" element={<ProjectDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/journal/:slug" element={<JournalArticle />} />
        <Route path="/contact" element={<Contact />} />

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
          <Route path="categories" element={<AdminCategories />} />
          <Route path="pages" element={<AdminPages />} />
          <Route path="journal" element={<AdminJournal />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="team" element={<AdminTeam />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="about" element={<AdminAbout />} />
          <Route path="hero" element={<AdminHero />} />
          <Route path="menu" element={<AdminMenu />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Categories and pages created in the admin, e.g. /film or /press-kit */}
        <Route path="/:slug" element={<SlugPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <FontSettings />
      <BrowserRouter>
        <AdminSeo />
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
