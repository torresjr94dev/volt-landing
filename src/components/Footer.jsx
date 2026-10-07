import { repoUrl } from "../lib/config.js";

export default function Footer() {
  return (
    <footer className="foot">
      <p>VOLT es un proyecto personal y no tiene relación con Google ni con YouTube. Reproduce música del servicio de YouTube Music, así que necesitas conexión para todo lo que no tengas guardado. Hecho en la Ciudad de México.</p>
      <nav aria-label="Enlaces">
        <a href={repoUrl("/issues")}>Reportar un problema</a>
        <a href={repoUrl("/releases")}>Todas las versiones</a>
      </nav>
    </footer>
  );
}
