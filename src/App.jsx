import { useEffect } from "react";
import { ScrollTrigger } from "./lib/gsap.js";
import { useLenis } from "./lib/useLenis.js";
import { useRelease } from "./lib/useRelease.js";
import Header from "./components/Header.jsx";
import BoltHero from "./components/hero/BoltHero.jsx";
import Story from "./components/Story.jsx";
import Features from "./components/Features.jsx";
import Gallery from "./components/Gallery.jsx";
import Share from "./components/Share.jsx";
import Install from "./components/Install.jsx";
import Download from "./components/Download.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
  useLenis();
  const release = useRelease();

  // Las fuentes cambian alturas: recalcular los triggers cuando terminen de cargar.
  useEffect(() => {
    let alive = true;
    document.fonts?.ready.then(() => { if (alive) ScrollTrigger.refresh(); });
    return () => { alive = false; };
  }, []);

  return (
    <>
      <a className="skip" href="#descargar">Ir a la descarga</a>
      <div className="frame">
        <Header release={release} />
        <main>
          <BoltHero release={release} />
          <Story />
          <Features />
          <Gallery />
          <Share />
          <Install />
          <Download release={release} />
        </main>
        <Footer />
      </div>
      <div className="grain" aria-hidden="true" />
    </>
  );
}
