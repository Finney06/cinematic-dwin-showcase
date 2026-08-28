import { Link } from "react-router-dom";
import Reveal from "@/components/site/Reveal";
import MediaFrame from "@/components/site/MediaFrame";
import { isBlockFilled, type PageBlock } from "@/lib/pageBlocks";

const SPACER_HEIGHT = { sm: "h-8 sm:h-12", md: "h-16 sm:h-24", lg: "h-28 sm:h-40" };

/**
 * Renders the admin-built block sequence for any page, article or project.
 * This is the whole rich-content layer: whatever an editor stacks in the admin
 * comes out here, in the site's own type and spacing.
 */
const PageBlocks = ({ blocks = [], className = "" }: { blocks?: PageBlock[]; className?: string }) => {
  const filled = (Array.isArray(blocks) ? blocks : []).filter(isBlockFilled);
  if (!filled.length) return null;

  return (
    <div className={`space-y-8 sm:space-y-12 ${className}`}>
      {filled.map((block, index) => {
        switch (block.type) {
          case "heading":
            return (
              <Reveal key={index}>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-light text-foreground/85 tracking-[0.01em] leading-[1.15]">
                  {block.text}
                </h2>
              </Reveal>
            );

          case "text":
            return (
              <Reveal key={index}>
                <div className="space-y-5 font-body text-sm sm:text-base leading-[1.9] text-foreground/55">
                  {block.text
                    .split(/\n\s*\n/)
                    .filter((paragraph) => paragraph.trim())
                    .map((paragraph, i) => (
                      <p key={i} className="whitespace-pre-wrap">
                        {paragraph}
                      </p>
                    ))}
                </div>
              </Reveal>
            );

          case "quote":
            return (
              <Reveal key={index}>
                <figure className="border-l border-foreground/15 pl-6 sm:pl-10 py-2">
                  <blockquote className="font-display text-xl sm:text-2xl md:text-3xl font-light text-foreground/75 leading-[1.4] tracking-[0.01em]">
                    {block.text}
                  </blockquote>
                  {block.attribution && (
                    <figcaption className="mt-4 font-body text-[10px] tracking-[0.25em] uppercase text-foreground/30">
                      {block.attribution}
                    </figcaption>
                  )}
                </figure>
              </Reveal>
            );

          case "image":
            return (
              <Reveal key={index} as="figure">
                <MediaFrame src={block.url} alt={block.caption || ""} className="w-full" />
                {block.caption && (
                  <figcaption className="mt-3 font-body text-[11px] tracking-[0.15em] uppercase text-foreground/30">
                    {block.caption}
                  </figcaption>
                )}
              </Reveal>
            );

          case "gallery": {
            const urls = block.urls.filter((url) => url?.trim());
            return (
              <Reveal key={index} as="figure">
                <div
                  className={`grid gap-3 sm:gap-5 ${
                    urls.length === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"
                  }`}
                >
                  {urls.map((url, i) => (
                    <MediaFrame key={`${i}-${url}`} src={url} alt={block.caption || ""} aspect="aspect-[3/4]" />
                  ))}
                </div>
                {block.caption && (
                  <figcaption className="mt-3 font-body text-[11px] tracking-[0.15em] uppercase text-foreground/30">
                    {block.caption}
                  </figcaption>
                )}
              </Reveal>
            );
          }

          case "video":
            return (
              <Reveal key={index}>
                <MediaFrame src={block.url} aspect="aspect-video" grain={false} />
              </Reveal>
            );

          case "button": {
            const isInternal = block.url.startsWith("/");
            const style =
              "inline-flex items-center gap-2 font-body text-[11px] tracking-[0.2em] uppercase text-foreground/55 hover:text-foreground/85 transition-colors border-b border-foreground/15 hover:border-foreground/40 pb-1";
            return (
              <Reveal key={index}>
                {isInternal ? (
                  <Link to={block.url} className={style}>
                    {block.label} →
                  </Link>
                ) : (
                  <a href={block.url} target="_blank" rel="noreferrer" className={style}>
                    {block.label} →
                  </a>
                )}
              </Reveal>
            );
          }

          case "columns":
            return (
              <Reveal key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
                <p className="font-body text-sm sm:text-base leading-[1.9] text-foreground/55 whitespace-pre-wrap">
                  {block.left}
                </p>
                <p className="font-body text-sm sm:text-base leading-[1.9] text-foreground/55 whitespace-pre-wrap">
                  {block.right}
                </p>
              </Reveal>
            );

          case "spacer":
            return <div key={index} aria-hidden className={SPACER_HEIGHT[block.size] || SPACER_HEIGHT.md} />;

          default:
            // A block type saved by a newer version of the admin shouldn't
            // blank the page — skip it and render everything else.
            return null;
        }
      })}
    </div>
  );
};

export default PageBlocks;
