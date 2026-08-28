import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import Seo from "@/components/site/Seo";
import ScrollToTop from "@/components/site/ScrollToTop";

interface PageShellProps {
  children: ReactNode;
  /** SEO — pass what the CMS holds for this page; blanks fall back to defaults. */
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
  /** Full-bleed pages (a hero image touching the top) opt out of the top padding. */
  bleed?: boolean;
  className?: string;
}

/**
 * The frame every public page shares: navigation, transition, SEO, footer, and
 * the standard page gutters. Building a new page means writing its content and
 * wrapping it in this — the chrome is never re-implemented.
 */
const PageShell = ({
  children,
  title,
  description,
  image,
  type,
  noIndex,
  bleed = false,
  className = "",
}: PageShellProps) => (
  <PageTransition>
    <Seo title={title} description={description} image={image} type={type} noIndex={noIndex} />
    <ScrollToTop />
    <Navbar />
    <main
      className={`bg-background min-h-screen ${
        bleed ? "" : "pt-24 sm:pt-28 pb-12 px-5 sm:px-8 md:px-12"
      } ${className}`}
    >
      {children}
    </main>
    <Footer />
  </PageTransition>
);

export default PageShell;
