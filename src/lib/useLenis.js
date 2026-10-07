import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap.js";
import { prefersReducedMotion } from "./motion.js";

// Scroll suave (Lenis) sincronizado con el ticker de GSAP.
// Con reduced-motion se queda el scroll nativo tal cual.
export function useLenis() {
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: { offset: -64 } });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
}
