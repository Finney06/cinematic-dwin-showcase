import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { useAboutContent, useSiteSettings } from "@/hooks/useContent";
import { BRAND, orEmpty } from "@/lib/brand";

const About = () => {
  const { data: aboutData } = useAboutContent();
  const { data: settings } = useSiteSettings();

  /**
   * Every field below falls back to a CRA8 default only when the CMS field is
   * genuinely empty — whatever's actually saved in Admin → About is trusted verbatim.
   * Imagery defaults to real photos of DWINDIK, never the slate's movie-poster
   * thumbnails — those belong on /work, not stacked repeatedly on a founder page.
   */
  const content = aboutData?.content;

  const heroImage = content?.heroImage || "/dwindik/4.jpeg";
  const title = content?.title || BRAND.name;
  const subtitle = content?.subtitle || "Film Studio · Nigeria";
  const bioIntro = content?.bioIntro || "A film studio working in spiritual drama and thriller.";
  const bioParagraphs = content?.bioParagraphs?.length ? content.bioParagraphs : [];
  const galleryImages = content?.galleryImages?.length ? content.galleryImages : [];
  const fullWidthImage = content?.fullWidthImage || "";
  /** This block credits CRA8's founder — reuses the `productionCompany` fields from Admin → About. */
  const founderName = content?.productionCompany?.name || "DWINDIK";
  const founderBio =
    content?.productionCompany?.description ||
    "Founder of CRA8. Director of Photography, VFX Artist, and Editor across the studio's slate.";
  const founderRole =
    content?.productionCompany?.collaborator || `In collaboration with ${BRAND.collaborator}`;
  const founderImage = content?.portraitImage || "/dwindik/5.jpeg";
  const extraSections = content?.sections?.length ? content.sections : [];
  const ctaLabel = content?.cta?.label || "";
  const ctaUrl = content?.cta?.url || "";
  const contactEmail = orEmpty(settings?.contact_email);

  return (
    <PageTransition>
      <Navbar />
      <main className="bg-background min-h-screen">
        {/* ═══ HERO — Full-bleed still ═══ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4 }}
          className="relative w-full h-[70vh] sm:h-[80vh] overflow-hidden bg-secondary"
        >
          {heroImage && (
            <img
              src={heroImage}
              alt={`${title} — from the slate`}
              className="w-full h-full object-cover"
            />
          )}
          <div className="film-grain absolute inset-0 z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-5 sm:px-8 md:px-12 pb-10 sm:pb-14">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light text-foreground tracking-[0.04em] uppercase leading-[0.85]"
            >
              {title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-3 sm:mt-4 font-body text-[10px] sm:text-xs tracking-[0.3em] uppercase text-foreground/35"
            >
              {subtitle}
            </motion.p>
          </div>
        </motion.div>

        {/* ═══ STUDIO STATEMENT ═══ */}
        <section className="px-5 sm:px-8 md:px-12 pt-16 sm:pt-24">
          <div className="max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8 }}
              className="font-display text-2xl sm:text-3xl md:text-4xl font-light text-foreground/85 leading-[1.4] tracking-[0.01em]"
            >
              {bioIntro}
            </motion.p>

            {bioParagraphs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.8, delay: 0.15 }}
                className="mt-10 sm:mt-14 space-y-6 font-body text-sm sm:text-base leading-[1.9] text-foreground/50"
              >
                {bioParagraphs.map((paragraph, index) => (
                  <p key={`${index}-${paragraph.slice(0, 16)}`}>{paragraph}</p>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* ═══ IMAGE BREAK — Two-column ═══ */}
        {galleryImages.filter(Boolean).length > 0 && (
          <section className="px-5 sm:px-8 md:px-12 pt-16 sm:pt-24">
            <div className="grid grid-cols-2 gap-3 sm:gap-5">
              {[galleryImages[0], galleryImages[1] || galleryImages[0]].map((image, index) => (
                <motion.div
                  key={`${index}-${image}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="relative aspect-[3/4] overflow-hidden bg-secondary"
                >
                  <img
                    src={image}
                    alt={`${title} — from the slate`}
                    className="w-full h-full object-cover"
                  />
                  <div className="film-grain absolute inset-0 pointer-events-none" />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ═══ ADMIN-ADDED SECTIONS ═══ */}
        {extraSections.length > 0 && (
          <section className="px-5 sm:px-8 md:px-12 pt-16 sm:pt-24">
            <div className="max-w-3xl space-y-10">
              {extraSections.map((section, index) => (
                <motion.div
                  key={`${section.heading}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.8 }}
                >
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
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* ═══ FULL-WIDTH STILL ═══ */}
        {fullWidthImage && (
          <section className="px-5 sm:px-8 md:px-12 pt-16 sm:pt-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1 }}
              className="relative w-full aspect-[21/9] sm:aspect-[2.5/1] overflow-hidden bg-secondary"
            >
              <img
                src={fullWidthImage}
                alt={`${title} — from the slate`}
                className="w-full h-full object-cover"
              />
              <div className="film-grain absolute inset-0 pointer-events-none" />
            </motion.div>
          </section>
        )}

        {/* ═══ FOUNDER & CONTACT ═══ */}
        <section className="px-5 sm:px-8 md:px-12 pt-16 sm:pt-24 pb-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8 }}
            className="border-t border-foreground/[0.06] pt-10 sm:pt-14"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
              {/* Left — founder credit */}
              <div>
                <span className="font-body text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-foreground/20 block mb-4">
                  Founder
                </span>
                <p className="font-display text-3xl sm:text-4xl font-light text-foreground/80 tracking-[0.06em] uppercase">
                  {founderName}
                </p>
                <p className="mt-4 font-body text-sm leading-[1.8] text-foreground/40">
                  {founderBio}
                </p>
                <p className="mt-3 font-body text-[10px] tracking-[0.2em] uppercase text-foreground/25">
                  {founderRole}
                </p>
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

              {/* Right — founder portrait */}
              {founderImage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="relative aspect-[4/5] overflow-hidden bg-secondary"
                >
                  <img
                    src={founderImage}
                    alt={founderName}
                    className="w-full h-full object-cover"
                  />
                  <div className="film-grain absolute inset-0 pointer-events-none" />
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="border-t border-foreground/[0.06] pt-8 sm:pt-10 mt-14 sm:mt-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
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
              <span />
            )}
            <Link
              to="/work"
              className="font-body text-[11px] tracking-[0.2em] uppercase text-foreground/25 hover:text-foreground/60 transition-colors duration-500 border-b border-foreground/10 pb-1 inline-block"
            >
              View Work →
            </Link>
          </motion.div>
        </section>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default About;
