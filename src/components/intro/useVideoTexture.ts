import { useEffect, useRef } from "react";
import { VideoTexture, LinearFilter } from "three";

export function useVideoTexture(src: string | undefined) {
  const videoRef   = useRef<HTMLVideoElement | null>(null);
  const textureRef = useRef<VideoTexture | null>(null);

  useEffect(() => {
    if (!src) return;

    const video = document.createElement("video");
    video.src         = src;
    video.muted       = true;
    video.playsInline = true;
    video.preload     = "auto";
    video.loop        = false;
    video.style.display = "none";
    document.body.appendChild(video);

    const texture      = new VideoTexture(video);
    texture.minFilter  = LinearFilter;
    texture.magFilter  = LinearFilter;

    videoRef.current   = video;
    textureRef.current = texture;

    return () => {
      video.pause();
      video.src = "";
      if (document.body.contains(video)) document.body.removeChild(video);
      texture.dispose();
      videoRef.current   = null;
      textureRef.current = null;
    };
  }, [src]);

  return { videoRef, textureRef };
}
