import { useRef, useState } from "react";
import { gsap, useGSAP } from "../lib/gsap.js";
import { useReducedMotion } from "../lib/motion.js";
import { useRevealHeading } from "../lib/reveal.js";
import Phone from "./Phone.jsx";
import Lightning from "./Lightning.jsx";
import { Bell, Bolt, Pause, Person } from "./Icons.jsx";
import thunderUrl from "../assets/volt_thunder.wav";

const FACTS = [
  { Icon: Person, strong: "Agregas amigos con un código de 6 caracteres.", text: "Sin número de teléfono, sin lista de contactos." },
  { Icon: Bell, strong: "Al que la recibe le llega una notificación con trueno.", text: "Si tiene la app abierta, le aparece ahí mismo." },
  { Icon: Bolt, strong: "Cuando acepta, cae el rayo y la canción empieza a sonar.", text: "Pruébalo en el teléfono de al lado." },
];

export default function Share() {
  const root = useRef(null);
  const heading = useRef(null);
  const audio = useRef(null);
  const [phase, setPhase] = useState("idle"); // idle | striking | struck
  const reduced = useReducedMotion();
  useRevealHeading(heading);

  // La tarjeta "te envió una canción" llega como una notificación cuando la sección entra.
  useGSAP(() => {
    if (reduced) return;
    gsap.from(".share-card", {
      autoAlpha: 0, y: 48, duration: 0.7, ease: "power3.out",
      scrollTrigger: { trigger: ".phone-share", start: "top 70%", once: true },
    });
  }, { scope: root, dependencies: [reduced] });

  const strike = () => {
    if (phase === "striking") return;
    setPhase("striking");
    try {
      if (!audio.current) audio.current = new Audio(thunderUrl);
      audio.current.currentTime = 0;
      audio.current.volume = 0.8;
      audio.current.play().catch(() => { /* el navegador bloqueó el audio; el rayo sigue */ });
    } catch { /* ignorar */ }
    if (!reduced && navigator.vibrate) { try { navigator.vibrate([0, 60, 40, 120]); } catch { /* ignorar */ } }
    window.setTimeout(() => setPhase("struck"), reduced ? 350 : 1100);
  };

  const reset = () => {
    setPhase("idle");
    try { audio.current?.pause(); } catch { /* ignorar */ }
  };

  return (
    <section className="section share" id="volt-share" ref={root}>
      <div className="share-copy">
        <h2 ref={heading}>Mándale una canción. Le cae un rayo.</h2>
        <p className="lede">VOLT Share es la parte social. Sirve para una sola cosa: que la canción que te voló la cabeza le llegue a tu amigo en ese momento, lista para sonar.</p>
        <ul className="share-facts">
          {FACTS.map(({ Icon, strong, text }) => (
            <li key={strong}>
              <Icon />
              <span><strong>{strong}</strong> {text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={`share-demo ${phase === "striking" ? "striking" : ""} ${phase === "struck" ? "struck" : ""}`.trim()}>
        <Phone className="phone-share" screenClassName="share-screen">
          <div className="list">
            {Array.from({ length: 6 }, (_, i) => (
              <div className="row" key={i}><i /><div><b /><b /></div></div>
            ))}
          </div>
          <div className="veil" />
          {/* El rayo de React Bits solo existe mientras cae: un contexto WebGL por segundo, no permanente. */}
          {phase === "striking" && !reduced && (
            <div className="lightning-wrap">
              <Lightning hue={80} xOffset={0} speed={1.6} intensity={1.3} size={1.25} />
            </div>
          )}
          <div className="flash" />

          <div className="share-card">
            <div className="share-card-bolt"><Bolt width="22" height="22" /></div>
            <p className="share-from">Jorge te envió una canción</p>
            <p className="share-song">Cielo eléctrico, de Nadia Ferrer</p>
            <div className="share-actions">
              <button type="button" className="btn btn-primary" onClick={strike} disabled={phase === "striking"}>Aceptar</button>
              <button type="button" className="btn-ghost" onClick={reset}>Después</button>
            </div>
          </div>

          <div className="share-after mini-player">
            <span className="bar" style={{ width: "32%" }} />
            <span className="mini-art" />
            <span><small>Sonando ahora</small><b>Cielo eléctrico</b></span>
            <span className="mini-play"><Pause width="18" height="18" /></span>
          </div>
        </Phone>
        {phase === "struck"
          ? <button type="button" className="btn-ghost" onClick={reset}>Repetir el rayo</button>
          : <p className="demo-hint">Toca “Aceptar” en el teléfono. Con sonido.</p>}
      </div>
    </section>
  );
}
