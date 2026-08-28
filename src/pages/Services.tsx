import { Link } from "react-router-dom";
import PageShell from "@/components/site/PageShell";
import Masthead from "@/components/site/Masthead";
import Reveal from "@/components/site/Reveal";
import MediaFrame from "@/components/site/MediaFrame";
import PageBlocks from "@/components/PageBlocks";
import { EmptyState, ErrorState, LoadingState } from "@/components/site/states";
import NotFound from "@/pages/NotFound";
import { useServices } from "@/hooks/useContent";
import { useCmsPage } from "@/hooks/useCmsPage";

/**
 * What CRA8 does. Not a features grid: each service is a full-width editorial
 * beat — an oversized index number, the craft, the copy, and its capabilities
 * set like on-screen credits beside it.
 *
 * Everything on this page is CMS-driven: the services come from Admin →
 * Services (reorderable, publishable), the heading and lead from Admin → Pages.
 */
const Services = () => {
  const { data: services = [], isLoading, isError, refetch } = useServices();
  const page = useCmsPage("services", "Services");

  // "Draft" in Admin → Pages actually takes the page offline, exactly like a
  // custom page — it isn't just an ignored switch on a page that's always live.
  if (!page.isLoading && page.isUnpublished) return <NotFound />;

  return (
    <PageShell title={page.seo.title} description={page.seo.description} image={page.seo.image}>
      <Masthead
        size="hero"
        eyebrow="Capabilities"
        title={page.title}
        intro={page.intro}
        meta={
          services.length
            ? { value: String(services.length).padStart(2, "0"), label: services.length === 1 ? "Craft" : "Crafts" }
            : null
        }
      />

      <PageBlocks blocks={page.blocks} className="mt-10 sm:mt-14 max-w-2xl" />

      {isLoading && <LoadingState label="Loading services" />}
      {!isLoading && isError && (
        <ErrorState message="We couldn't load the services list." onRetry={refetch} />
      )}
      {!isLoading && !isError && services.length === 0 && (
        <EmptyState message="Coming soon" hint="Services are added in the admin portal." />
      )}

      <div className="mt-16 sm:mt-24">
        {services.map((service, index) => (
          <Reveal
            key={service.id}
            className="border-t border-foreground/[0.06] py-12 sm:py-20 first:border-t-0 first:pt-0"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
              {/* Index + title */}
              <div className="md:col-span-5">
                <span
                  aria-hidden
                  className="block font-display font-light text-foreground/[0.10] leading-none text-[3.5rem] sm:text-[5rem] -mb-2 sm:-mb-4"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-light text-foreground/85 tracking-[0.02em] leading-[1.05]">
                  {service.title}
                </h2>
                {service.summary && (
                  <p className="mt-4 font-body text-sm sm:text-base leading-[1.8] text-foreground/50 max-w-md">
                    {service.summary}
                  </p>
                )}
              </div>

              {/* Copy + capabilities */}
              <div className="md:col-span-7 md:pt-14">
                {service.image && (
                  <MediaFrame
                    src={service.image}
                    alt={service.title}
                    aspect="aspect-[16/9]"
                    className="mb-8"
                  />
                )}
                {service.description && (
                  <p className="font-body text-sm sm:text-base leading-[1.9] text-foreground/55 whitespace-pre-wrap">
                    {service.description}
                  </p>
                )}
                {service.capabilities?.length > 0 && (
                  <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3">
                    {service.capabilities
                      .filter((capability) => capability?.trim())
                      .map((capability) => (
                        <li
                          key={capability}
                          className="font-body text-[11px] tracking-[0.18em] uppercase text-foreground/40 border-b border-foreground/[0.06] pb-2"
                        >
                          {capability}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* ═══ CLOSING CTA ═══ */}
      <Reveal className="border-t border-foreground/[0.06] pt-10 sm:pt-14 mt-4 pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <p className="font-display text-xl sm:text-3xl font-light text-foreground/70 max-w-lg leading-[1.3]">
          Working on something? Tell us what it is.
        </p>
        <Link
          to="/contact"
          className="font-body text-[11px] tracking-[0.2em] uppercase text-foreground/50 hover:text-foreground/85 transition-colors border-b border-foreground/15 hover:border-foreground/40 pb-1 whitespace-nowrap"
        >
          Start a conversation →
        </Link>
      </Reveal>
    </PageShell>
  );
};

export default Services;
