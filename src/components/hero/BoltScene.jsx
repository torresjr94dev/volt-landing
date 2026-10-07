// Escena 3D del hero: un cristal con la forma exacta del rayo del launcher,
// con transmisión real y dispersión cromática, refractando el titular que vive
// detrás como textura, y una tormenta (shader de Lightning) al fondo.
// Arquitectura adaptada de PrismHero (Bevel UI): titular en canvas, calidad por
// tier, frameloop apagado fuera de pantalla. Sin modelos, sin HDRI, sin assets.
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial, Environment, Lightformer } from "@react-three/drei";
import { lightningVertex, lightningFragment } from "./lightningShader.js";

const LINES = ["TU MÚSICA,", "A TODO", "VOLTAJE."];
const TEX_W = 2048;
const TEX_H = 1400;
const TEX_ASPECT = TEX_W / TEX_H;
const FONT = '"Bricolage Grotesque", "Segoe UI", system-ui, sans-serif';

// Puntos del rayo (ic_launcher_foreground.xml, viewport 108).
const BOLT = [[61, 22], [36, 60], [52, 60], [47, 86], [74, 46], [57, 46]];

export const QUALITY = {
  low: { samples: 3, resolution: 192, backside: false, maxDpr: 1.25, octaves: 5 },
  medium: { samples: 4, resolution: 256, backside: true, maxDpr: 1.5, octaves: 7 },
  high: { samples: 6, resolution: 512, backside: true, maxDpr: 1.75, octaves: 9 },
};

/* ---------- Titular como textura ---------- */

function drawHeadline() {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = TEX_W;
  canvas.height = TEX_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, TEX_W, TEX_H);

  let size = 560;
  const widest = () => Math.max(...LINES.map((l) => ctx.measureText(l).width));
  do {
    ctx.font = `800 ${size}px ${FONT}`;
    if ("letterSpacing" in ctx) ctx.letterSpacing = `${-size * 0.02}px`;
    size -= 8;
  } while (widest() > TEX_W * 0.94 && size > 60);

  const lineHeight = size * 0.9;
  const total = lineHeight * LINES.length;
  ctx.fillStyle = "#EDEDEF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  LINES.forEach((line, i) => {
    ctx.fillText(line, TEX_W / 2, TEX_H / 2 - total / 2 + lineHeight * (i + 0.5));
  });

  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.needsUpdate = true;
  return t;
}

function useHeadlineTexture() {
  const [texture, setTexture] = useState(() => drawHeadline());
  useEffect(() => {
    let cancelled = false;
    const rebake = () => { if (!cancelled) setTexture(drawHeadline()); };
    // Hasta que Bricolage esté cargada, el canvas usa la fuente de respaldo.
    Promise.all([
      document.fonts?.load(`800 100px "Bricolage Grotesque"`),
      document.fonts?.ready,
    ]).then(rebake).catch(rebake);
    return () => { cancelled = true; };
  }, []);
  useEffect(() => () => texture?.dispose(), [texture]);
  return texture;
}

function Headline({ texture }) {
  const { viewport } = useThree();
  const width = Math.min(viewport.width * 0.96, viewport.height * 0.8 * TEX_ASPECT);
  const height = width / TEX_ASPECT;
  if (!texture) return null;
  return (
    <mesh position={[0, 0, -2.2]} renderOrder={-1}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

/* ---------- El rayo de cristal ---------- */

function useBoltGeometry() {
  return useMemo(() => {
    const shape = new THREE.Shape();
    const cx = 55;
    const cy = 54;
    const s = 0.042;
    BOLT.forEach(([x, y], i) => {
      const px = (x - cx) * s;
      const py = -(y - cy) * s;
      if (i === 0) shape.moveTo(px, py);
      else shape.lineTo(px, py);
    });
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.38,
      bevelEnabled: true,
      bevelThickness: 0.14,
      bevelSize: 0.11,
      bevelSegments: 4,
      curveSegments: 4,
    });
    geometry.center();
    return geometry;
  }, []);
}

function BoltCrystal({ progress, reducedMotion, spec }) {
  const ref = useRef(null);
  const pointer = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();
  const geometry = useBoltGeometry();

  const portrait = viewport.width < viewport.height;
  const fit = Math.min(viewport.width, viewport.height);
  const baseScale = THREE.MathUtils.clamp(fit / 5.1, portrait ? 0.6 : 0.7, 1.15);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reducedMotion]);

  useFrame((state, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    const p = progress.current ?? 0;
    const t = state.clock.elapsedTime;
    // En reposo se mece. El scroll le da una vuelta completa (vuelve de frente al final),
    // lo inclina a la mitad y lo acerca; en el tramo final la tormenta hace el resto.
    const arc = Math.sin(p * Math.PI);
    const finale = reducedMotion ? 0 : finaleAt(p);
    mesh.rotation.y = reducedMotion ? -0.3 : Math.sin(t * 0.35) * 0.45 - 0.2 + p * Math.PI * 2;
    mesh.rotation.x = (reducedMotion ? 0 : Math.sin(t * 0.21) * 0.08) + arc * 0.5;
    mesh.rotation.z = -0.08 + (reducedMotion ? 0 : Math.cos(t * 0.17) * 0.04) - arc * 0.2;
    const tx = pointer.current.x * 0.35 + (reducedMotion ? 0 : finale * Math.sin(t * 38) * 0.03);
    const ty = -pointer.current.y * 0.28 + arc * 0.25;
    mesh.position.x += (tx - mesh.position.x) * Math.min(1, delta * 2.2);
    mesh.position.y += (ty - mesh.position.y) * Math.min(1, delta * 2.2);
    mesh.scale.setScalar(baseScale * (1 + arc * 0.12 + finale * 0.08));
  });

  return (
    <mesh ref={ref} geometry={geometry}>
      <MeshTransmissionMaterial
        transmission={1}
        thickness={1.2}
        roughness={0.05}
        ior={1.8}
        chromaticAberration={0.5}
        anisotropy={0.25}
        distortion={0.2}
        distortionScale={0.4}
        temporalDistortion={0.06}
        backside={spec.backside}
        backsideThickness={0.45}
        samples={spec.samples}
        resolution={spec.resolution}
        color="#f2ffcc"
        attenuationColor="#C2FC4A"
        attenuationDistance={3}
      />
    </mesh>
  );
}

/* ---------- Tormenta de fondo ---------- */

// smoothstep en JS: 0 → 1 con suavizado en los extremos.
const smooth = (x) => {
  const k = Math.min(1, Math.max(0, x));
  return k * k * (3 - 2 * k);
};

// Flags de depuración en la URL: ?storm fuerza el final de tormenta (para afinarlo sin
// scrollear), ?noStorm quita los rayos, ?debug expone el estado de three en window.__r3f.
const PARAMS = typeof location !== "undefined" ? new URLSearchParams(location.search) : new URLSearchParams();
const STORM_DEBUG = PARAMS.has("storm");
const NO_STORM = PARAMS.has("noStorm");
const DEBUG = PARAMS.has("debug");

// Envolvente del final: sube del 76 % al 90 % del scroll del hero y se apaga del 93 % al 100 %.
const finaleAt = (p) => (STORM_DEBUG ? 1 : smooth((p - 0.76) / 0.14) * (1 - smooth((p - 0.93) / 0.07)));

/**
 * Un rayo de tormenta. `targetX` es dónde cae (en unidades de aspecto, 0 = centro).
 * El principal parpadea en ráfagas todo el tiempo; los `finaleOnly` solo existen
 * en el tramo final del hero, cuando el scroll pasa del 76 %.
 */
function LightningPlane({ progress, reducedMotion, octaves, seed = 0, targetX = 0.5, finaleOnly = false }) {
  const ref = useRef(null);
  const { viewport, camera } = useThree();
  const far = viewport.getCurrentViewport(camera, [0, 0, -3.6]);
  const storm = useRef({ next: 1.2, start: -10 });
  const uniforms = useMemo(() => ({
    iTime: { value: 0 },
    uSeed: { value: seed },
    uAspect: { value: 1 },
    uHue: { value: 80 },
    uXOffset: { value: 0 },
    uSpeed: { value: 1 },
    uIntensity: { value: 0 },
    uSize: { value: 1.3 },
  }), [seed]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = progress.current ?? 0;
    const aspect = far.width / far.height;
    const finale = reducedMotion ? 0 : finaleAt(p);
    uniforms.iTime.value = reducedMotion ? 0 : t;
    uniforms.uAspect.value = aspect;
    uniforms.uXOffset.value = -Math.min(0.95, Math.abs(targetX) * aspect) * Math.sign(targetX || 1);
    uniforms.uSpeed.value = 1 + finale * 1.2;

    let intensity;
    if (finaleOnly) {
      intensity = finale * 1.15;
    } else {
      let burst = 0;
      if (!reducedMotion) {
        const s = storm.current;
        // R3F reinicia el reloj a 0 al reanudar el frameloop (cuando el hero vuelve a
        // pantalla). Si el tiempo retrocede, la ráfaga anterior quedaría en el "futuro" y
        // exp() de un número positivo enorme pintaba el canvas de blanco. Se reprograma.
        if (t < s.start) {
          s.start = -10;
          s.next = t + 1 + Math.random() * 2;
        }
        if (t > s.next) {
          s.start = t;
          s.next = t + 2.6 + Math.random() * 4.5;
        }
        const age = t - s.start;
        burst = age >= 0 ? Math.exp(-age * 3.4) * 0.9 : 0;
      }
      intensity = 0.05 + burst + p * 0.2 + finale * 1.0;
    }
    uniforms.uIntensity.value = intensity;
    if (ref.current) ref.current.visible = intensity > 0.01;
  });

  // Los shaders van por args (constructor): si llegan como props, three compila el
  // programa antes de recibirlos y el material se queda mudo.
  return (
    <mesh ref={ref} position={[0, 0, -3.6]} renderOrder={-2}>
      <planeGeometry args={[far.width, far.height]} />
      <shaderMaterial
        key={octaves}
        args={[{
          vertexShader: lightningVertex,
          fragmentShader: lightningFragment(octaves),
          uniforms,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }]}
      />
    </mesh>
  );
}

/* ---------- Escena ---------- */

function FocalGroup({ children }) {
  const { viewport } = useThree();
  const portrait = viewport.width < viewport.height;
  return <group position={[0, portrait ? 0.45 : 0.5, portrait ? -0.6 : 0]}>{children}</group>;
}

function Scene({ progress, reducedMotion, spec, onReady }) {
  const texture = useHeadlineTexture();
  useEffect(() => {
    const id = requestAnimationFrame(() => onReady?.());
    return () => cancelAnimationFrame(id);
  }, [onReady]);

  return (
    <>
      <Environment resolution={256}>
        <Lightformer intensity={4} position={[0, 5, 4]} scale={[12, 4, 1]} color="#fff8e6" />
        <Lightformer intensity={3} position={[-6, 1, 3]} scale={[4, 9, 1]} color="#C2FC4A" />
        <Lightformer intensity={2.2} position={[6, -2, 2]} scale={[5, 6, 1]} color="#9fc5ff" />
        <Lightformer intensity={1.6} position={[0, -4, -3]} scale={[9, 3, 1]} color="#ffffff" />
      </Environment>
      {!NO_STORM && (
        <>
          <LightningPlane progress={progress} reducedMotion={reducedMotion} octaves={spec.octaves} seed={0} targetX={0.5} />
          <LightningPlane progress={progress} reducedMotion={reducedMotion} octaves={spec.octaves} seed={37} targetX={-0.6} finaleOnly />
          <LightningPlane progress={progress} reducedMotion={reducedMotion} octaves={spec.octaves} seed={91} targetX={0.05} finaleOnly />
        </>
      )}
      <FocalGroup>
        <Headline texture={texture} />
        <BoltCrystal progress={progress} reducedMotion={reducedMotion} spec={spec} />
      </FocalGroup>
    </>
  );
}

export default function BoltScene({ progress, reducedMotion, quality = "medium", onReady, active = true }) {
  const spec = QUALITY[quality] || QUALITY.medium;
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, spec.maxDpr]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ fov: 40, near: 0.1, far: 60, position: [0, 0, 7] }}
      onCreated={(state) => { if (DEBUG) window.__r3f = state; }}
    >
      <Scene progress={progress} reducedMotion={reducedMotion} spec={spec} onReady={onReady} />
    </Canvas>
  );
}
