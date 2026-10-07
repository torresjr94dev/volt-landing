import { gsap, SplitText, useGSAP, EASE_IN } from "./gsap.js";
import { prefersReducedMotion } from "./motion.js";

// Un solo patrón de entrada para los titulares de sección: las líneas suben
// desde una máscara cuando el titular llega al 82 % de la pantalla. Una vez.
export function useRevealHeading(ref, { start = "top 82%" } = {}) {
  useGSAP(() => {
    if (prefersReducedMotion() || !ref.current) return undefined;
    let split;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled || !ref.current) return;
      split = SplitText.create(ref.current, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.lines, {
            yPercent: 110, duration: 0.8, stagger: 0.08, ease: EASE_IN,
            scrollTrigger: { trigger: ref.current, start, once: true },
          });
        },
      });
    });
    return () => { cancelled = true; split?.revert(); };
  }, { scope: ref });
}
