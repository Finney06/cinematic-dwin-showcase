import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import CategoryPageLayout from "@/components/CategoryPageLayout";
import { useProjects } from "@/hooks/useContent";

const Audio = () => {
  const { data: projects = [], isLoading } = useProjects("audio");

  return (
    <PageTransition>
      <Navbar />
      <main className="bg-background min-h-screen pt-24 sm:pt-28 pb-12 px-5 sm:px-8 md:px-12">
        <CategoryPageLayout title="Audio" projects={projects} isLoading={isLoading} />
      </main>
      <Footer />
    </PageTransition>
  );
};

export default Audio;
