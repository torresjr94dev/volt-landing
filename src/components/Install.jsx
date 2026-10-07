import { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap.js";
import { prefersReducedMotion } from "../lib/motion.js";
import { useRevealHeading } from "../lib/reveal.js";

const STEPS = [
  { title: "Descarga el APK", text: "Con el botón de esta página, desde el navegador de tu Android." },
  { title: "Ábrelo y permite la instalación", text: "Android te va a preguntar si permites instalar apps desde tu navegador. Di que sí: aparece porque VOLT no viene de Play Store." },
  { title: "Abre VOLT y busca tu primera canción", text: "Escribe tu nombre en la bienvenida y listo. Si quieres mandar canciones, pide el código de amigo de quien sea." },
];

export default function Install() {
  const root = useRef(null);
  const heading = useRef(null);
  useRevealHeading(heading);

  // Los números se cargan de lima en orden: es una secuencia, y se nota.
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    gsap.fromTo(".steps li", { "--num": "#33333B", autoAlpha: 0, y: 16 }, {
      "--num": "#C2FC4A", autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.18, ease: "power3.out",
      scrollTrigger: { trigger: ".steps", start: "top 78%", once: true },
    });
  }, { scope: root });

  return (
    <section className="section install" id="instalar" ref={root}>
      <h2 ref={heading}>Instalar toma un minuto.</h2>
      <ol className="steps">
        {STEPS.map((s) => (
          <li key={s.title}>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
      <p className="note">Para actualizar, descarga la versión nueva desde aquí mismo e instálala encima. Tus favoritos, playlists e historial se quedan donde están.</p>
    </section>
  );
}
