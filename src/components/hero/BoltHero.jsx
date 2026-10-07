import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { gsap, ScrollTrigger, useGSAP, EASE_IN } from "../../lib/gsap.js";
import { useReducedMotion } from "../../lib/motion.js";
import { CONFIG } from "../../lib/config.js";
import { DownloadIcon } from "../Icons.jsx";
import Magnetic from "../Magnetic.jsx";
import boltUrl from "../../assets/bolt.svg";

// three.js se carga aparte: la página pinta primero y el cristal llega después.
const BoltScene = lazy(() => import("./BoltScene.jsx"));

const subscribeViewport = (cb) => {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
};
const detectQuality = () => {
  const cores = navigator.hardwareConcurrency ?? 4;
  const w = window.innerWidth;
  if (w < 768 || cores <= 4) return "low";
  if (w < 1440 || cores <= 8) return "medium";
  return "high";
};
const hasWebGL = () => {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
};
const clamp01 = (x) => Math.min(1, Math.max(0, x));
// ?noPause en la URL mantiene el frameloop encendido aunque el hero salga de pantalla (depuración).
const NO_PAUSE = typeof location !== "undefined" && new URLSearchParams(location.search).has("noPause");

export default function BoltHero({ release }) {
  const section = useRef(null);
  const stage = useRef(null);
  const copy = useRef(null);
  const cue = useRef(null);
  const flash = useRef(null);
  const progress = useRef(0);
  const fired = useRef(false);
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const quality = useSyncExternalStore(subscribeViewport, detectQuality, () => "medium");
  const webgl = useMemo(hasWebGL, []);
  const onReady = useCallback(() => setReady(true), []);

  // La transmisión es lo más caro de la página: se apaga cuando el hero sale de pantalla.
  useEffect(() => {
    const el = stage.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => setActive(NO_PAUSE || entry.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useGSAP(() => {
    // El relámpago en pantalla: dos destellos cortos cuando el scroll pasa del 80 %.
    const strike = () => {
      gsap.timeline()
        .fromTo(flash.current, { opacity: 0.55 }, { opacity: 0, duration: 0.45, ease: "power2.out" })
        .fromTo(flash.current, { opacity: 0.35 }, { opacity: 0, duration: 0.7, ease: "power2.out" }, 0.16);
    };

    ScrollTrigger.create({
      trigger: section.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const p = reduced ? 0 : self.progress;
        progress.current = p;
        if (reduced) return;
        const keep = 1 - clamp01((p - 0.5) / 0.2);
        gsap.set(copy.current, { autoAlpha: keep, y: (1 - keep) * -24 });
        gsap.set(cue.current, { autoAlpha: 1 - clamp01(p / 0.12) });
        if (p > 0.8 && p < 0.93 && !fired.current) { fired.current = true; strike(); }
        if (p < 0.55) fired.current = false;
      },
    });
    if (reduced) return;
    gsap.from(".hero3d-copy > *", { autoAlpha: 0, y: 18, duration: 0.8, stagger: 0.12, ease: EASE_IN, delay: 0.35 });
  }, { scope: section, dependencies: [reduced] });

  const meta = release.status === "ready"
    ? `Versión ${release.version}, ${release.size}. ${CONFIG.minAndroid}.`
    : `${CONFIG.minAndroid}.`;

  return (
    <section className="hero3d" id="inicio" ref={section}>
      <div className="hero3d-stage" ref={stage}>
        <div className={`hero3d-canvas ${ready ? "is-ready" : ""}`.trim()}>
          {webgl && (
            <Suspense fallback={null}>
              <BoltScene progress={progress} reducedMotion={reduced} quality={quality} onReady={onReady} active={active} />
            </Suspense>
          )}
        </div>

        {/* Mientras carga three.js (o si no hay WebGL): el titular en HTML y el rayo plano. */}
        <div className={`hero3d-fallback ${ready ? "is-hidden" : ""}`.trim()} aria-hidden={ready}>
          <img className="bolt-static" src={boltUrl} alt="" width="380" height="640" />
          <p className="hero3d-title">Tu música, a&nbsp;todo voltaje.</p>
        </div>

        <div className="hero3d-vignette" aria-hidden="true" />
        <div className="hero3d-flash" ref={flash} aria-hidden="true" />
        <h1 className="sr-only">Tu música, a todo voltaje.</h1>

        <div className="hero3d-copy" ref={copy}>
          <p className="lede">
            Reproductor para Android con todo YouTube Music. Segundo plano, letra al ritmo, descargas sin señal
            y un rayo para compartir.
          </p>
          <div className="cta">
            <Magnetic>
              <a className="btn btn-primary" href={release.url}>
                <DownloadIcon width="20" height="20" />
                <span>Descargar APK</span>
              </a>
            </Magnetic>
            <Magnetic strength={0.25}>
              <a className="btn btn-outline" href="#asi-se-siente">Ver cómo se siente</a>
            </Magnetic>
          </div>
          <p className="meta" aria-live="polite">{meta}</p>
        </div>

        <div className="hero3d-cue" ref={cue} aria-hidden="true">
          <span className="cue-line"><i /></span>
          <span>Desliza</span>
        </div>
      </div>
    </section>
  );
}
