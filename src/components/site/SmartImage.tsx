import { useCallback, useEffect, useRef, useState } from "react";

interface SmartImageProps {
  src: string;
  alt?: string;
  className?: string;
  /** Skip lazy-loading for the one image above the fold. */
  eager?: boolean;
}

/** How far a picture's shape may drift from its frame before we stop cropping. */
const CROP_TOLERANCE = 0.08;

/**
 * An image that decides how to sit in its frame.
 *
 * CRA8's thumbnails are YouTube poster art, not film stills: the title, the
 * cast and the "3 million views" flash all live near the edges, so a hard
 * cover-crop cuts the very thing the poster exists to show. But letterboxing
 * everything into grey bars would gut the full-bleed frames.
 *
 * So: measure. A picture already shaped like its frame is cropped edge to edge
 * as normal. One that isn't is shown whole, over a blurred, enlarged copy of
 * itself — the frame still fills with colour from the image, and nothing is
 * cut off. Editors never have to think about it, and an odd-sized upload years
 * from now is handled the same way.
 *
 * The parent must be positioned and sized; this fills it.
 */
const SmartImage = ({ src, alt = "", className = "", eager = false }: SmartImageProps) => {
  const ref = useRef<HTMLImageElement>(null);
  const [contain, setContain] = useState(false);

  const measure = useCallback(() => {
    const element = ref.current;
    if (!element || !element.naturalWidth || !element.clientHeight) return;
    const frameRatio = element.clientWidth / element.clientHeight;
    const imageRatio = element.naturalWidth / element.naturalHeight;
    setContain(Math.abs(imageRatio - frameRatio) / frameRatio > CROP_TOLERANCE);
  }, []);

  useEffect(() => {
    // A cached image can be complete before React attaches onLoad.
    if (ref.current?.complete) measure();

    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, [measure, src]);

  return (
    <>
      {contain && (
        <img
          src={src}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover scale-125 blur-2xl opacity-40 saturate-150"
        />
      )}
      <img
        ref={ref}
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        onLoad={measure}
        className={`absolute inset-0 w-full h-full ${contain ? "object-contain" : "object-cover"} ${className}`}
      />
    </>
  );
};

export default SmartImage;
