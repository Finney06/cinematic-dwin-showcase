import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import WorkGallery from "@/components/WorkGallery";
import { useProjects } from "@/hooks/useContent";

/** The full CRA8 slate — every title, in the order set in Admin → Projects. */
const Work = () => {
  const { data: projects = [], isLoading } = useProjects();

  return (
    <PageTransition>
      <Navbar />
      <main className="bg-background min-h-screen">
        <WorkGallery title="Work" projects={projects} isLoading={isLoading} />
      </main>
      <Footer />
    </PageTransition>
  );
};

export default Work;
