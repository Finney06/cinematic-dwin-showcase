export const SPHERE_FRAG = /* glsl */ `
uniform float uTime;
uniform float uEmergence;
uniform float uRimIntensity;
uniform float uRimWidth;
uniform vec3  uLightDir;
uniform float uFocusSoften;
uniform float uBleedAmount;
uniform float uBleedNoise;
uniform float uAperture;
uniform float uExposure;
uniform sampler2D uVideoTex;
uniform sampler2D uPortraitTex;
uniform float uPortraitBlend;
uniform float uSweepX;
uniform float uSweepSharp;

varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec2 vUv;

/* ─── Noise utilities ─── */
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.y * u.x;
}

void main() {
  vec3 N = normalize(vNormal);
  vec3 L = normalize(uLightDir);
  vec3 V = normalize(cameraPosition - vWorldPosition);

  /* ─── 1. EMERGENCE — sphere rises from black ─── */
  float limbDarken = pow(max(dot(N, V), 0.0), 1.8);
  float ambientBase = 0.05 * uEmergence;
  /* edges catch ambient scatter first, then center */
  float edgeScatter = (1.0 - limbDarken) * 0.5 + 0.5;
  vec3 color = vec3(ambientBase * edgeScatter);

  /* ─── 2. CRESCENT RIM LIGHT ─── */
  /* How edge-on is this fragment to the camera? (0=center, 1=silhouette) */
  float rimFactor = 1.0 - max(dot(N, V), 0.0);
  rimFactor = pow(rimFactor, 2.2);

  /* Crescent zone: edge-on AND facing toward the light source */
  float lightAlignment = dot(N, L);
  float crescentMask = smoothstep(-uRimWidth, -uRimWidth + 0.25, lightAlignment);
  crescentMask *= smoothstep(0.28, 0.78, rimFactor);

  /* Organic arc variation — non-uniform intensity along the crescent */
  float arcNoise = noise(vUv * 6.0 + uTime * 0.05);
  crescentMask *= (0.82 + 0.18 * arcNoise);

  /* Slight warm tint at the hottest edge */
  vec3 rimColor = mix(vec3(0.96, 0.97, 1.0), vec3(1.0, 0.97, 0.93), rimFactor);
  color += crescentMask * uRimIntensity * rimColor;

  /* ─── 3. BLEED — light bending past the terminator ─── */
  float bleedReach = lightAlignment + uBleedAmount * 0.62;
  float bleedMask = smoothstep(-0.06, 0.22, bleedReach) * rimFactor;

  /* Noise-based imperfect falloff — organic diffraction variation */
  float bleedNoise = noise(vUv * 4.0 + vec2(uTime * 0.03, uBleedNoise));
  bleedMask *= (0.55 + 0.45 * bleedNoise) * uBleedAmount;

  /* Cooler, softer color than rim — scattered corona light */
  color += bleedMask * vec3(0.68, 0.74, 0.84) * 0.42;

  /* ─── 4. APERTURE — interior ambient scatter ─── */
  float scatterBias = smoothstep(0.18, 0.82, lightAlignment * 0.5 + 0.5);
  float scatterNoise = noise(vUv * 3.2 + vec2(0.0, uTime * 0.018));
  float internalScatter = uAperture * 0.16 * (scatterBias * 0.72 + 0.28 * scatterNoise);
  color += vec3(internalScatter);

  /* ─── 5. EXPOSURE — content revealed through light gate ─── */
  /* Upper-left fills first; lower-right last — uneven sensor accumulation */
  float lightGate = smoothstep(0.04, 0.62, uExposure * (0.38 + 0.62 * scatterBias));
  /* Bleed edges also contribute to content reveal at exposure boundary */
  lightGate = max(lightGate, bleedMask * uExposure * 0.32);

  vec4 videoSample    = texture2D(uVideoTex, vUv);
  vec4 portraitSample = texture2D(uPortraitTex, vUv);
  vec4 contentSample  = mix(videoSample, portraitSample, uPortraitBlend);

  color = mix(color, color + contentSample.rgb * lightGate, lightGate);

  /* ─── 6. LENS SWEEP — clarity pass (left → right) ─── */
  float sweepDist   = abs(vUv.x - uSweepX);
  float sweepEffect = smoothstep(0.09, 0.0, sweepDist) * uSweepSharp;
  /* Brief local gamma lift — feels like lens wiping clean */
  color = mix(color, pow(max(color + 0.05, vec3(0.0)), vec3(0.88)), sweepEffect);

  /* ─── 7. FOCUS SOFTEN — radial contrast reduction during parallax ─── */
  vec2 centeredUV = vUv - 0.5;
  float radialDist = length(centeredUV) * 2.0;
  float softness = uFocusSoften * smoothstep(0.28, 1.0, radialDist);
  color = mix(color, vec3(dot(color, vec3(0.333))), softness);

  /* ─── 8. BASE FILM GRAIN — constant, extremely subtle ─── */
  float grain = (hash(vUv + fract(uTime * 7.31)) - 0.5) * 0.018;
  color += grain;

  /* ─── 9. EDGE VIGNETTE — sphere silhouette soft fade ─── */
  float sphereDist = length(centeredUV);
  float edgeMask   = 1.0 - smoothstep(0.44, 0.5, sphereDist);

  /* Alpha: sphere silhouette fades in with emergence */
  float alpha = edgeMask * smoothstep(0.0, 0.25, uEmergence);

  gl_FragColor = vec4(color * edgeMask, alpha);
}
`;
