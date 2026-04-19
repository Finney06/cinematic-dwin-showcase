import { ShaderMaterial, Vector3, Texture } from "three";
import { SPHERE_VERT } from "./shaders/sphere.vert";
import { SPHERE_FRAG } from "./shaders/sphere.frag";

export class SphereMaterial extends ShaderMaterial {
  constructor() {
    super({
      vertexShader: SPHERE_VERT,
      fragmentShader: SPHERE_FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime:          { value: 0 },
        uEmergence:     { value: 0 },
        uRimIntensity:  { value: 0 },
        uRimWidth:      { value: 0.05 },
        uLightDir:      { value: new Vector3(-0.7, 0.5, 0.5).normalize() },
        uFocusSoften:   { value: 0 },
        uBleedAmount:   { value: 0 },
        uBleedNoise:    { value: 0 },
        uAperture:      { value: 0 },
        uExposure:      { value: 0 },
        uVideoTex:      { value: null as Texture | null },
        uPortraitTex:   { value: null as Texture | null },
        uPortraitBlend: { value: 0 },
        uSweepX:        { value: -0.1 },
        uSweepSharp:    { value: 0 },
      },
    });
  }
}
