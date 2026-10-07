import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap.js";
import { prefersReducedMotion } from "../lib/motion.js";

// Botón magnético: con puntero fino, el botón se inclina hacia el cursor cuando
// se acerca y regresa con un rebote al salir. En touch y con reduced-motion no hace nada.
export default function Magnetic({ children, strength = 0.32, radius = 80, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (prefersReducedMotion() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return undefined;

    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
    let near = false;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const inside = Math.abs(dx) < r.width / 2 + radius && Math.abs(dy) < r.height / 2 + radius;
      if (inside) {
        near = true;
        xTo(dx * strength);
        yTo(dy * strength);
      } else if (near) {
        near = false;
        gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.45)" });
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [strength, radius]);

  return <span ref={ref} className={`magnetic ${className}`.trim()}>{children}</span>;
}
