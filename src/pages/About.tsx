import { Link } from "react-router-dom";
import PageShell from "@/components/site/PageShell";
import Reveal from "@/components/site/Reveal";
import MediaFrame from "@/components/site/MediaFrame";
import PageBlocks from "@/components/PageBlocks";
import { useAboutContent, useSiteSettings, useTeam } from "@/hooks/useContent";
import { readBlocks } from "@/lib/pageBlocks";
import { BRAND, orEmpty } from "@/lib/brand";

/**
 * The studio page. Every field comes from Admin → About and is trusted
 * verbatim once saved. Until the client fills it in, the page shows a clean,
 * neutral placeholder — a text hero and a short statement, no invented lore,
 * no imagery. Only /work is populated for launch; everything else here is the
 * client's to write.
 *
 * Optional sections (founder, gallery, team, extra sections) only render once
 * they actually have content, so the placeholder never shows empty seats.
 */
const About = () => {
  const { data: aboutData } = useAboutContent();
  const { data: settings } = useSiteSettings();
  const { data: team = [] } = useTeam();

  const content = aboutData?.content;

  const heroImage = content?.heroImage || "";
  const title = content?.title || BRAND.name;
  const subtitle = content?.subtitle || "Film Studio · Nigeria";
  const bioIntro =
    content?.bioIntro || "CRA8 is a film studio based in Nigeria.";
  const bioParagraphs = content?.bioParagraphs?.filter(Boolean) || [];
  const galleryImages = content?.galleryImages?.filter(Boolean) || [];
  const fullWidthImage = content?.fullWidthImage || "";
  /** Founder credit — reuses the `productionCompany` fields from Admin → About. Renders only once the client fills it in. */
  const founderName = orEmpty(content?.productionCompany?.name);
  const founderBio = orEmpty(content?.productionCompany?.description);
  const founderRole = orEmpty(content?.productionCompany?.collaborator);
  const founderImage = content?.portraitImage || "";
  const hasFounder = Boolean(founderName || founderBio);
  const extraSections = content?.sections?.filter((section) => section?.heading || section?.body) || [];
  const blocks = readBlocks(content);
  const ctaLabel = content?.cta?.label || "";
  const ctaUrl = content?.cta?.url || "";
  const contactEmail = orEmpty(settings?.contact_email);

  return (
    <PageShell
      title={aboutData?.seo_title || title}
      description={aboutData?.seo_description || bioIntro}
      image={aboutData?.seo_image || heroImage}
      bleed
    >
      {/* ═══ HERO — Full-bleed still ═══ */}
      <div className="relative w-full h-[70vh] sm:h-[80vh] overflow-hidden bg-secondary">
        {heroImage && (
          <img src={heroImage} alt={`${title} — from the slate`} className="w-full h-full object-cover" />
        )}
        <div className="film-grain absolute inset-0 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-8 md:px-12 pb-10 sm:pb-14">
          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light text-foreground tracking-[0.04em] uppercase leading-[0.85]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 sm:mt-4 font-body text-[10px] sm:text-xs tracking-[0.3em] uppercase text-foreground/35">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* ═══ STUDIO STATEMENT ═══ */}
      <section className="px-5 sm:px-8 md:px-12 pt-16 sm:pt-24">
        <div className="max-w-3xl">
          <Reveal>
            <p className="font-display text-2xl sm:text-3xl md:text-4xl font-light text-foreground/85 leading-[1.4] tracking-[0.01em]">
              {bioIntro}
            </p>
          </Reveal>

          {bioParagraphs.length > 0 && (
            <Reveal delay={0.15}>
              <div className="mt-10 sm:mt-14 space-y-6 font-body text-sm sm:text-base leading-[1.9] text-foreground/50">
                {bioParagraphs.map((paragraph, index) => (
                  <p key={`${index}-${paragraph.slice(0, 16)}`}>{paragraph}</p>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ═══ IMAGE BREAK — Two-column ═══ */}
      {galleryImages.length > 0 && (
        <section className="px-5 sm:px-8 md:px-12 pt-16 sm:pt-24">
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            {[galleryImages[0], galleryImages[1] || galleryImages[0]].map((image, index) => (
              <Reveal key={`${index}-${image}`} index={index}>
                <MediaFrame src={image} alt={`${title} — from the slate`} aspect="aspect-[3/4]" />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ═══ ADMIN-ADDED SECTIONS ═══ */}
      {extraSections.length > 0 && (
        <section className="px-5 sm:px-8 md:px-12 pt-16 sm:pt-24">
          <div className="max-w-3xl space-y-10">
            {extraSections.map((section, index) => (
              <Reveal key={`${section.heading}-${index}`} index={index}>
                {section.heading && (
                  <h2 className="font-body text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-foreground/25">
                    {section.heading}
                  </h2>
                )}
                {section.body && (
                  <p className="mt-4 font-body text-sm sm:text-base leading-[1.9] text-foreground/50 whitespace-pre-wrap">
                    {section.body}
                  </p>
                )}
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ═══ FREEFORM BLOCKS ═══ */}
      {blocks.length > 0 && (
        <section className="px-5 sm:px-8 md:px-12 pt-16 sm:pt-24">
          <PageBlocks blocks={blocks} className="max-w-3xl" />
        </section>
      )}

      {/* ═══ FULL-WIDTH STILL ═══ */}
      {fullWidthImage && (
        <section className="px-5 sm:px-8 md:px-12 pt-16 sm:pt-24">
          <Reveal>
            <MediaFrame
              src={fullWidthImage}
              alt={`${title} — from the slate`}
              aspect="aspect-[21/9] sm:aspect-[2.5/1]"
            />
          </Reveal>
        </section>
      )}

      {/* ═══ FOUNDER — only once the client fills it in ═══ */}
      {hasFounder && (
      <section className="px-5 sm:px-8 md:px-12 pt-16 sm:pt-24">
        <Reveal className="border-t border-foreground/[0.06] pt-10 sm:pt-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
            <div>
              <span className="font-body text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-foreground/20 block mb-4">
                Founder
              </span>
              {founderName && (
                <p className="font-display text-3xl sm:text-4xl font-light text-foreground/80 tracking-[0.06em] uppercase">
                  {founderName}
                </p>
              )}
              {founderBio && (
                <p className="mt-4 font-body text-sm leading-[1.8] text-foreground/40">{founderBio}</p>
              )}
              {founderRole && (
                <p className="mt-3 font-body text-[10px] tracking-[0.2em] uppercase text-foreground/25">
                  {founderRole}
                </p>
              )}
              {ctaLabel && ctaUrl && (
                <a
                  href={ctaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 mt-6 text-[10px] tracking-[0.3em] uppercase text-foreground/40 hover:text-foreground/70 transition-colors"
                >
                  {ctaLabel} →
                </a>
              )}
            </div>

            {founderImage && (
              <MediaFrame src={founderImage} alt={founderName || "Founder"} aspect="aspect-[4/5]" />
            )}
          </div>
        </Reveal>
      </section>
      )}

      {/* ═══ TEAM — only once there is a team ═══ */}
      {team.length > 0 && (
        <section className="px-5 sm:px-8 md:px-12 pt-16 sm:pt-24">
          <div className="border-t border-foreground/[0.06] pt-10 sm:pt-14">
            <span className="font-body text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-foreground/20 block mb-8 sm:mb-12">
              The Studio
            </span>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
              {team.map((member, index) => (
                <Reveal key={member.id} index={index}>
                  {member.image && <MediaFrame src={member.image} alt={member.name} aspect="aspect-[4/5]" />}
                  <h3 className="mt-4 font-display text-lg sm:text-xl font-light text-foreground/80 tracking-[0.04em] uppercase">
                    {member.name}
                  </h3>
                  {member.role && (
                    <p className="mt-1 font-body text-[10px] tracking-[0.2em] uppercase text-foreground/30">
                      {member.role}
                    </p>
                  )}
                  {member.bio && (
                    <p className="mt-3 font-body text-sm leading-[1.8] text-foreground/45">{member.bio}</p>
                  )}
                  {member.links?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-4">
                      {member.links
                        .filter((link) => link?.label && link?.url)
                        .map((link) => (
                          <a
                            key={link.url}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-body text-[10px] tracking-[0.2em] uppercase text-foreground/30 hover:text-foreground/70 transition-colors"
                          >
                            {link.label}
                          </a>
                        ))}
                    </div>
                  )}
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ CONTACT CTA ═══ */}
      <section className="px-5 sm:px-8 md:px-12 pt-16 sm:pt-24 pb-8">
        <Reveal className="border-t border-foreground/[0.06] pt-8 sm:pt-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {contactEmail ? (
            <div>
              <span className="font-body text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-foreground/20 block mb-2">
                Get in Touch
              </span>
              <a
                href={`mailto:${contactEmail}`}
                className="font-body text-sm text-foreground/45 hover:text-foreground/75 transition-colors duration-500"
              >
                {contactEmail}
              </a>
            </div>
          ) : (
            <Link
              to="/contact"
              className="font-body text-[11px] tracking-[0.2em] uppercase text-foreground/25 hover:text-foreground/60 transition-colors duration-500 border-b border-foreground/10 pb-1 inline-block"
            >
              Contact CRA8 →
            </Link>
          )}
          <Link
            to="/work"
            className="font-body text-[11px] tracking-[0.2em] uppercase text-foreground/25 hover:text-foreground/60 transition-colors duration-500 border-b border-foreground/10 pb-1 inline-block"
          >
            View Work →
          </Link>
        </Reveal>
      </section>
    </PageShell>
  );
};

export default About;
