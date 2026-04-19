import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Mesh, TextureLoader, Vector3 } from "three";
import { SphereMaterial } from "./SphereMaterial";
import { DustParticles } from "./DustParticles";
import type { IntroUniforms } from "./useIntroTimeline";

/* Segments: 128 desktop / 64 mobile for performance */
const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
const SEG = isMobile ? 64 : 128;

interface Props {
  uniformsRef: React.RefObject<IntroUniforms>;
  videoTextureRef: React.RefObject<import("three").VideoTexture | null>;
  portraitSrc: string;
}

export function SphereScene({ uniformsRef, videoTextureRef, portraitSrc }: Props) {
  const meshRef = useRef<Mesh>(null);
  const { camera } = useThree();

  /* ShaderMaterial — created once, mutated per frame */
  const material = useMemo(() => new SphereMaterial(), []);

  /* Portrait texture — preloaded once */
  const portraitTexture = useMemo(
    () => new TextureLoader().load(portraitSrc),
    [portraitSrc],
  );

  /* Clean up material on unmount */
  useEffect(() => () => material.dispose(), [material]);

  useFrame(() => {
    const u = uniformsRef.current;
    if (!u) return;

    /* Write all shader uniforms directly — zero React re-renders */
    const mu = material.uniforms;
    mu.uTime.value          = u.uTime;
    mu.uEmergence.value     = u.uEmergence;
    mu.uRimIntensity.value  = u.uRimIntensity;
    mu.uRimWidth.value      = u.uRimWidth;
    (mu.uLightDir.value as Vector3).copy(u.uLightDir);
    mu.uFocusSoften.value   = u.uFocusSoften;
    mu.uBleedAmount.value   = u.uBleedAmount;
    mu.uBleedNoise.value    = u.uBleedNoise;
    mu.uAperture.value      = u.uAperture;
    mu.uExposure.value      = u.uExposure;
    mu.uPortraitBlend.value = u.uPortraitBlend;
    mu.uSweepX.value        = u.uSweepX;
    mu.uSweepSharp.value    = u.uSweepSharp;

    if (videoTextureRef.current) {
      mu.uVideoTex.value = videoTextureRef.current;
    }
    mu.uPortraitTex.value = portraitTexture;

    /* Camera rotation for parallax — direct mutation, no re-render */
    camera.rotation.y = u.cameraYRotation;
  });

  return (
    <>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1, SEG, SEG]} />
        <primitive object={material} attach="material" />
      </mesh>

      <DustParticles uniformsRef={uniformsRef} />
    </>
  );
}
