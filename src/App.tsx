import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useContent";
import Index from "./pages/Index";
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

const FontSettings = () => {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (!settings) return;
    const display = settings.font_display || '"Cormorant Garamond", serif';
    const body = settings.font_body || '"Inter", sans-serif';
    document.documentElement.style.setProperty("--font-display", display);
    document.documentElement.style.setProperty("--font-body", body);

    const extractFamily = (value: string) => {
      const match = value.match(/"([^"]+)"/);
      return match?.[1] || value.split(",")[0].trim();
    };

    const families = [extractFamily(display), extractFamily(body)]
      .filter(Boolean)
      .map((f) => f.replace(/\s+/g, "+"));

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
        <AnimatePresence mode="wait">
          <Routes>
            {/* ─── Public ─── */}
            <Route path="/" element={<Index />} />
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
