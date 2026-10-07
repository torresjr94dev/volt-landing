import { useMemo, useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap.js";
import { prefersReducedMotion } from "../lib/motion.js";
import { BrandMark } from "./Icons.jsx";
import ElectricLogo from "./ElectricLogo.jsx";
import Magnetic from "./Magnetic.jsx";
import boltUrl from "../assets/bolt.svg";

const hasWebGL2 = () => {
  try { return !!document.createElement("canvas").getContext("webgl2"); } catch { return false; }
};

export default function Header({ release }) {
  const root = useRef(null);
  const bar = useRef(null);
  // El logo vivo (ElectricLogo de React Bits) necesita WebGL2; si no hay, va la marca plana.
  const electric = useMemo(() => hasWebGL2() && !prefersReducedMotion(), []);

  // Progreso de lectura como la barra de 2 px del mini-player de la app.
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    gsap.fromTo(bar.current, { scaleX: 0 }, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.4 },
    });
  }, { scope: root });

  return (
    <header className="top" ref={root}>
      <a className="brand" href="#inicio" aria-label="VOLT, inicio">
        <span className="brand-mark">
          {electric ? (
            <ElectricLogo
              src={boltUrl}
              color="#F3FFD1"
              glowColor="#C2FC4A"
              scale={0.56}
              strands={2}
              thickness={1.1}
              glow={0.55}
              fill={0.3}
              arcs={0.6}
              flicker={0.4}
              speed={2}
              interactive
              cursorRadius={40}
            />
          ) : <BrandMark size={36} />}
        </span>
        <span>VOLT</span>
      </a>
      <nav aria-label="Secciones">
        <a href="#asi-se-siente">Así se siente</a>
        <a href="#funciones">Funciones</a>
        <a href="#pantallas">Pantallas</a>
        <a href="#volt-share">VOLT Share</a>
        <a href="#instalar">Instalar</a>
      </nav>
      <Magnetic strength={0.22} radius={36}>
        <a className="btn btn-small" href={release.url}>Descargar</a>
      </Magnetic>
      <span className="top-progress" ref={bar} aria-hidden="true" />
    </header>
  );
}
