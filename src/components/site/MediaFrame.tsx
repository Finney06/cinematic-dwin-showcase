import SmartImage from "@/components/site/SmartImage";
import { getYouTubeId } from "@/lib/pageBlocks";

interface MediaFrameProps {
  /** An image URL, a direct video file, or a YouTube link/ID. */
  src: string;
  alt?: string;
  /**
   * Tailwind aspect class, e.g. "aspect-[16/10]" — the frame is cropped to it.
   * Omit for an image at its natural height (video falls back to 16:9).
   */
  aspect?: string;
  /** Stretch to fill a positioned parent instead of sizing itself. */
  fill?: boolean;
  /** Play a YouTube source silently on loop as ambient motion. */
  ambient?: boolean;
  className?: string;
  /** The grain overlay is on by default; turn it off inside a busy composite. */
  grain?: boolean;
  /** Skip lazy-loading for the one frame above the fold. */
  eager?: boolean;
}

const isVideoFile = (url: string) => /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url);

/**
 * One frame for every kind of media the CMS can hold, so a still, an uploaded
 * clip and a YouTube link all sit in the same treatment, with film grain over
 * the top.
 *
 * Three layouts: cropped to an aspect ratio, filling a positioned parent, or —
 * for a still with neither — flowing at its natural height. Inside a fixed
 * frame the still is handled by SmartImage, which crops or letterboxes based
 * on the picture's own shape rather than guessing.
 */
const MediaFrame = ({
  src,
  alt = "",
  aspect,
  fill = false,
  ambient = false,
  className = "",
  grain = true,
  eager = false,
}: MediaFrameProps) => {
  if (!src) return null;

  const youTubeId = getYouTubeId(src) || (/^[\w-]{11}$/.test(src) ? src : "");
  const isVideo = Boolean(youTubeId) || isVideoFile(src);
  // Video always needs a box to sit in; a still can size itself.
  const natural = !fill && !aspect && !isVideo;
  const box = fill ? "absolute inset-0" : `relative ${aspect || (isVideo ? "aspect-video" : "")}`;

  return (
    <div className={`${box} overflow-hidden bg-secondary ${className}`}>
      {youTubeId ? (
        <iframe
          src={
            ambient
              ? `https://www.youtube.com/embed/${youTubeId}?autoplay=1&mute=1&loop=1&controls=0&modestbranding=1&rel=0&playsinline=1&playlist=${youTubeId}`
              : `https://www.youtube.com/embed/${youTubeId}?rel=0&modestbranding=1`
          }
          title={alt || "Video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className={`absolute inset-0 w-full h-full border-0 ${
            ambient ? "pointer-events-none scale-[1.35]" : ""
          }`}
        />
      ) : isVideoFile(src) ? (
        <video
          src={src}
          controls={!ambient}
          autoPlay={ambient}
          muted={ambient}
          loop={ambient}
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : natural ? (
        <img src={src} alt={alt} loading="lazy" className="w-full h-auto" />
      ) : (
        <SmartImage src={src} alt={alt} eager={eager} />
      )}
      {grain && <div className="film-grain absolute inset-0 pointer-events-none" />}
    </div>
  );
};

export default MediaFrame;
