import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
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
import ProtectedRoute from "./components/admin/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
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
