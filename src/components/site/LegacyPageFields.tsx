import Reveal from "@/components/site/Reveal";

/**
 * Before the block editor existed, pages were saved as a fixed set of fields
 * (subtitle, intro, body, sections, cta). Real content still lives in that
 * shape on pages like News and Internship, so it keeps rendering here — an
 * editor never loses copy just because the editor changed.
 *
 * `subtitle` and `intro` are not rendered here: the page masthead already
 * shows them, as its eyebrow and lead paragraph respectively.
 *
 * Nothing writes these fields any more; new copy goes into blocks.
 */
export interface LegacyContent {
  subtitle?: string;
  intro?: string;
  body?: string;
  sections?: { heading?: string; body?: string }[];
  cta?: { label?: string; url?: string };
}

export const hasLegacyContent = (content: LegacyContent) =>
  Boolean(
    content.body?.trim() ||
      content.sections?.some((section) => section?.heading || section?.body) ||
      (content.cta?.label && content.cta?.url)
  );

const LegacyPageFields = ({ content, className = "" }: { content: LegacyContent; className?: string }) => {
  const paragraphs = (content.body || "").split(/\n\s*\n/).filter((part) => part.trim());
  const sections = (content.sections || []).filter((section) => section?.heading || section?.body);

  if (!hasLegacyContent(content)) return null;

  return (
    <div className={`space-y-6 font-body text-sm sm:text-base leading-[1.9] text-foreground/55 ${className}`}>
      {sections.length > 0 && (
        <div className="space-y-8">
          {sections.map((section, index) => (
            <Reveal key={`${index}-${section.heading || "section"}`} index={index}>
              {section.heading && (
                <h2 className="text-lg sm:text-xl tracking-[0.12em] uppercase text-foreground/70">
                  {section.heading}
                </h2>
              )}
              {section.body && <p className="mt-3 text-foreground/55 whitespace-pre-wrap">{section.body}</p>}
            </Reveal>
          ))}
        </div>
      )}

      {paragraphs.map((paragraph, index) => (
        <Reveal key={`${index}-${paragraph.slice(0, 16)}`} index={index}>
          <p>{paragraph}</p>
        </Reveal>
      ))}

      {content.cta?.label && content.cta?.url && (
        <Reveal>
          <a
            href={content.cta.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-foreground/55 hover:text-foreground/80 transition-colors border-b border-foreground/15 pb-1"
          >
            {content.cta.label} →
          </a>
        </Reveal>
      )}
    </div>
  );
};

export default LegacyPageFields;
