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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <Routes>
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
