import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import CategoryPageLayout from "@/components/CategoryPageLayout";
import { getProjectsByCategory } from "@/lib/projects";

const Film = () => {
  const projects = getProjectsByCategory("film");

  return (
    <PageTransition>
      <Navbar />
      <main className="bg-background min-h-screen pt-28 pb-12 px-8 md:px-12">
        <CategoryPageLayout title="Film" projects={projects} />
      </main>
      <Footer />
    </PageTransition>
  );
};

export default Film;
