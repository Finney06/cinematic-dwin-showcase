import { EffectComposer, Bloom, ChromaticAberration, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";
import { useMemo } from "react";

interface Props {
  bloomIntensity: number;
  caAmount: number;
}

export function PostStack({ bloomIntensity, caAmount }: Props) {
  /* Stable Vector2 reference — updated by value, not recreated */
  const caOffset = useMemo(() => new Vector2(caAmount, caAmount * 0.6), []);

  /* Update offset values without allocating new objects */
  caOffset.set(caAmount, caAmount * 0.6);

  return (
    <EffectComposer>
      {/* Bloom — only extreme highlights; mipmapBlur = soft filmic quality */}
      <Bloom
        luminanceThreshold={0.86}
        luminanceSmoothing={0.92}
        intensity={bloomIntensity}
        mipmapBlur
      />

      {/* Chromatic aberration — physical lens fringing at peak light */}
      <ChromaticAberration
        offset={caOffset}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* Film grain — constant, subtle, adds organic texture */}
      <Noise
        premultiply
        blendFunction={BlendFunction.ADD}
        opacity={0.022}
      />
    </EffectComposer>
  );
}
