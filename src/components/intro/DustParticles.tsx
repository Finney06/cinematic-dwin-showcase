import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Points, PointsMaterial, BufferGeometry, Float32BufferAttribute } from "three";
import type { IntroUniforms } from "./useIntroTimeline";

/* 3 dust motes, slightly in front of the sphere */
const DUST_COUNT = 3;
const INITIAL_POSITIONS = [
  [-0.28,  0.35, 1.06],
  [ 0.42, -0.18, 1.08],
  [-0.12, -0.44, 1.05],
];

interface Props {
  uniformsRef: React.RefObject<IntroUniforms>;
}

export function DustParticles({ uniformsRef }: Props) {
  const pointsRef = useRef<Points>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(DUST_COUNT * 3);
    INITIAL_POSITIONS.forEach(([x, y, z], i) => {
      positions[i * 3]     = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    });
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new PointsMaterial({
        color: 0xffffff,
        size: 0.007,
        transparent: true,
        opacity: 0.7,
        sizeAttenuation: true,
        depthWrite: false,
      }),
    [],
  );

  useFrame(() => {
    const u = uniformsRef.current;
    if (!pointsRef.current) return;

    pointsRef.current.visible = u?.dustActive ?? false;
    if (!u?.dustActive) return;

    /* Slow organic drift — tiny per-frame displacement */
    const pos = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < DUST_COUNT; i++) {
      pos[i * 3]     += (Math.random() - 0.5) * 0.00012;
      pos[i * 3 + 1] += (Math.random() - 0.5) * 0.00009;
    }
    geometry.attributes.position.needsUpdate = true;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}
