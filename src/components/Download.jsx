import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { gsap, useGSAP } from "../lib/gsap.js";
import { prefersReducedMotion } from "../lib/motion.js";
import { useRevealHeading } from "../lib/reveal.js";
import { CONFIG, isAndroid } from "../lib/config.js";
import { DownloadIcon } from "./Icons.jsx";
import Magnetic from "./Magnetic.jsx";

export default function Download({ release }) {
  const root = useRef(null);
  const heading = useRef(null);
  const qr = useRef(null);
  useRevealHeading(heading);

  // Quien entra desde una computadora ve un QR con esta misma página.
  useEffect(() => {
    if (isAndroid || !qr.current) return;
    QRCode.toCanvas(qr.current, location.origin + location.pathname, {
      width: 148, margin: 1, color: { dark: "#09090F", light: "#ffffff" },
    }).catch(() => { /* sin QR, la página sigue */ });
  }, []);

  // El botón final emite un anillo una vez al entrar en pantalla.
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    gsap.fromTo(".btn-ring", { scale: 1, opacity: 0.8 }, {
      scale: 1.9, opacity: 0, duration: 1.1, ease: "power2.out",
      scrollTrigger: { trigger: ".cta", start: "top 70%", once: true },
    });
  }, { scope: root });

  const pending = release.status !== "ready";
  const rows = [
    ["Versión", release.status === "loading" ? "cargando" : pending ? "todavía no publicada" : release.version],
    ["Tamaño", pending ? "pendiente" : release.size],
    ["Publicada", pending ? "pendiente" : release.date],
    ["Requiere", CONFIG.minAndroid],
  ];

  return (
    <section className="section download" id="descargar" ref={root}>
      <div>
        <h2 ref={heading}>Bájala. Súbele.</h2>
        <div className="cta">
          <Magnetic>
            <a className="btn btn-primary" href={release.url}>
              <DownloadIcon width="20" height="20" />
              <span>Descargar APK</span>
            </a>
            <span className="btn-ring" aria-hidden="true" />
          </Magnetic>
        </div>
        <dl className="release" aria-live="polite">
          {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
      </div>
      {!isAndroid && (
        <div className="qr">
          <div className="qr-box"><canvas ref={qr} /></div>
          <p>Estás en una computadora. Escanea el código con tu Android para abrir esta página y descargar desde ahí.</p>
        </div>
      )}
    </section>
  );
}
