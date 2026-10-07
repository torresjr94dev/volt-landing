import { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap.js";
import { prefersReducedMotion } from "../lib/motion.js";
import { useRevealHeading } from "../lib/reveal.js";
import Phone from "./Phone.jsx";
import { GALLERY } from "./mocks/Screens.jsx";

// Galería horizontal: en escritorio la sección se fija y el scroll vertical
// recorre las pantallas de lado; en móvil es un carrusel nativo con snap.
export default function Gallery() {
  const root = useRef(null);
  const heading = useRef(null);
  useRevealHeading(heading, { start: "top 90%" });

  useGSAP(() => {
    if (prefersReducedMotion()) return undefined;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 901px)", () => {
      const track = root.current.querySelector(".gallery-track");
      const distance = () => Math.max(0, track.scrollWidth - track.clientWidth);
      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
    });
    return () => mm.revert();
  }, { scope: root });

  return (
    <section className="gallery" id="pantallas" ref={root}>
      <div className="gallery-inner">
        <div className="gallery-head">
          <h2 ref={heading}>Todo lo demás, a un toque.</h2>
          <p>Tres pestañas y ningún menú escondido. Esto es lo que ves cada día.</p>
        </div>
        <div className="gallery-track">
          {GALLERY.map(({ id, title, text, Screen }) => (
            <figure className="gallery-item" key={id}>
              <Phone screenClassName="gal-screen"><Screen /></Phone>
              <figcaption><b>{title}</b><span>{text}</span></figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
