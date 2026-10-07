import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap.js";
import { prefersReducedMotion } from "../lib/motion.js";
import { useRevealHeading } from "../lib/reveal.js";
import { Bars, Headphones, Infinity, Lines, PhoneIcon, DownloadIcon } from "./Icons.jsx";

const FEATURES = [
  { Icon: Headphones, title: "Suena en segundo plano", text: "Controles en la notificación, en la pantalla de bloqueo, en tus audífonos Bluetooth y en Android Auto. Cierra la app y la música sigue." },
  { Icon: Lines, title: "La letra, al ritmo", text: "La línea que está sonando se resalta sola. Toca cualquier línea y la canción salta justo ahí." },
  { Icon: DownloadIcon, title: "Sin señal también suena", text: "Lo que escuchas se queda guardado en el teléfono. Si quieres asegurar una canción, mantenla presionada y descárgala completa." },
  { Icon: Infinity, title: "La cola no se acaba", text: "Cuando van quedando dos canciones, VOLT agrega otras parecidas a lo que estás oyendo, sin repetir las que ya pasaron." },
  { Icon: PhoneIcon, title: "Tus archivos también", text: "La música que ya tienes en el teléfono entra a la misma cola y al mismo reproductor. No necesitas otra app para eso." },
  { Icon: Bars, title: "Tus números", text: "Minutos escuchados, canciones y artistas favoritos de la semana, del mes o de toda la vida. Las estadísticas se quedan en tu teléfono." },
];

export default function Features() {
  const root = useRef(null);
  const heading = useRef(null);
  useRevealHeading(heading);

  // La corriente recorre la retícula: cada celda se "enciende" por su borde superior.
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const cells = gsap.utils.toArray(".cell", root.current);
    const tl = gsap.timeline({
      scrollTrigger: { trigger: root.current.querySelector(".grid"), start: "top 78%", once: true },
    });
    cells.forEach((cell, i) => {
      const charge = cell.querySelector(".cell-charge");
      const icon = cell.querySelector(".cell-icon");
      const at = i * 0.09;
      tl.fromTo(charge, { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 0.35, ease: "power2.out" }, at);
      tl.to(charge, { opacity: 0, duration: 0.5 }, at + 0.5);
      tl.fromTo(icon, { color: "#8A8F98" }, { color: "#C2FC4A", duration: 0.3 }, at + 0.2);
      tl.fromTo(cell.querySelectorAll("h3, p"), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.05, ease: "power3.out" }, at + 0.1);
    });
  }, { scope: root });

  // Foco de luz que sigue al cursor sobre la retícula (solo con puntero fino).
  useEffect(() => {
    const grid = root.current?.querySelector(".grid");
    if (!grid || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return undefined;
    const cells = Array.from(grid.querySelectorAll(".cell"));
    let raf = 0;
    let last = null;
    const paint = () => {
      raf = 0;
      if (!last) return;
      for (const cell of cells) {
        const r = cell.getBoundingClientRect();
        cell.style.setProperty("--mx", `${last.x - r.left}px`);
        cell.style.setProperty("--my", `${last.y - r.top}px`);
      }
    };
    const onMove = (e) => {
      last = { x: e.clientX, y: e.clientY };
      if (!raf) raf = requestAnimationFrame(paint);
    };
    grid.addEventListener("pointermove", onMove, { passive: true });
    return () => { grid.removeEventListener("pointermove", onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section className="section features" id="funciones" ref={root}>
      <div className="features-head">
        <h2 ref={heading}>Hecha para escuchar.</h2>
        <p>Lo que esperas de un reproductor de a de veras, sin menús de más. Tres pestañas: Inicio, Buscar y Biblioteca. Lo demás está a un toque largo.</p>
      </div>
      <ul className="grid">
        {FEATURES.map(({ Icon, title, text }) => (
          <li className="cell" key={title}>
            <span className="cell-charge" aria-hidden="true" />
            <Icon className="cell-icon" />
            <h3>{title}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ul>
      <p className="extras">Y además: widget para la pantalla de inicio, temporizador para dormir, volumen parejo entre canciones y respaldo de toda tu biblioteca en un solo archivo.</p>
    </section>
  );
}
