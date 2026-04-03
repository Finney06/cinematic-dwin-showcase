import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { usePageContent } from "@/hooks/useContent";

const News = () => {
  const { data } = usePageContent("news");
  const title = data?.title || "News";
  const content = (data?.content || {}) as {
    subtitle?: string;
    intro?: string;
    body?: string;
    sections?: { heading?: string; body?: string }[];
    cta?: { label?: string; url?: string };
  };
  const body = content.body || "";
  const paragraphs = body.split(/\n\s*\n/).filter(Boolean);
  const hasSections = (content.sections || []).some(
    (section) => section.heading || section.body
  );

  return (
    <PageTransition>
      <Navbar />
      <main className="bg-background min-h-screen pt-24 sm:pt-28 pb-12 px-5 sm:px-8 md:px-12">
        <div className="max-w-3xl">
          <h1 className="font-display text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-light text-foreground tracking-[0.04em] uppercase leading-[0.85]">
            {title}
          </h1>
          {content.subtitle && (
            <p className="mt-6 text-sm sm:text-base uppercase tracking-[0.2em] text-foreground/40">
              {content.subtitle}
            </p>
          )}
          <div className="mt-10 sm:mt-14 space-y-6 font-body text-sm sm:text-base leading-[1.9] text-foreground/55">
            {content.intro && <p className="text-foreground/60">{content.intro}</p>}
            {hasSections ? (
              <div className="space-y-8">
                {(content.sections || []).map((section, index) => (
                  <div key={`${index}-${section.heading || "section"}`}>
                    {section.heading && (
                      <h2 className="text-lg sm:text-xl tracking-[0.12em] uppercase text-foreground/70">
                        {section.heading}
                      </h2>
                    )}
                    {section.body && (
                      <p className="mt-3 text-foreground/55 whitespace-pre-wrap">
                        {section.body}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : paragraphs.length ? (
              paragraphs.map((paragraph, index) => (
                <p key={`${index}-${paragraph.slice(0, 16)}`}>{paragraph}</p>
              ))
            ) : (
              <p className="text-foreground/35">Coming soon</p>
            )}
            {content.cta?.label && content.cta?.url && (
              <a
                href={content.cta.url}
                className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-foreground/55 hover:text-foreground/80 transition-colors"
                target="_blank"
                rel="noreferrer"
              >
                {content.cta.label} →
              </a>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default News;
