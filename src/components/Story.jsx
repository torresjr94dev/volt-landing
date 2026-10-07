import { useCallback, useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap.js";
import { useReducedMotion } from "../lib/motion.js";
import Phone from "./Phone.jsx";
import FrameScrubber, { hasFrames, FRAME_URLS } from "./FrameScrubber.jsx";
import { Bolt, Check, Heart, Next, Notes, Pause, Plane, Play, Prev, Queue } from "./Icons.jsx";

// Historia con scroll: el teléfono se queda fijo y la pantalla cambia conforme bajas.
// Cada paso ocupa una "pantalla" de scroll; el texto entra y sale, la pantalla hace crossfade.
const STEPS = [
  {
    id: "np",
    title: "La carátula manda.",
    text: "El arte ocupa la pantalla y su color tiñe el fondo. Un solo botón grande: play. Todo lo demás se quita de en medio.",
  },
  {
    id: "lyrics",
    title: "Canta con la letra.",
    text: "La línea que suena se resalta sola y avanza con la canción. Toca cualquier línea y la música salta justo ahí.",
  },
  {
    id: "offline",
    title: "Sin señal, igual suena.",
    text: "Lo que escuchas se queda guardado en el teléfono. Mantén presionada una canción para descargarla completa.",
  },
  {
    id: "share",
    title: "Mándala con un rayo.",
    text: "Elige a un amigo y la canción le cae con trueno. Más abajo lo puedes probar.",
  },
];

const LYRICS = [
  "Se apaga la ciudad",
  "y tú prendes el cielo",
  "cada paso es un rayo",
  "cada rayo, un recuerdo",
  "cielo eléctrico",
  "no me dejes en el suelo",
];

const FRIENDS = [
  { initial: "A", name: "Alexa" },
  { initial: "M", name: "Mau" },
  { initial: "R", name: "Ro" },
];

function NowPlayingScreen() {
  return (
    <div className="scr scr-np" data-screen="np">
      <div className="np-top"><span className="chev" /><span>Sonando ahora</span><span className="dots" /></div>
      <div className="art" />
      <div className="np-title">Cielo eléctrico</div>
      <div className="np-artist">Nadia Ferrer</div>
      <div className="np-slider"><span style={{ width: "49%" }} /></div>
      <div className="np-times"><span>1:42</span><span>3:28</span></div>
      <div className="np-controls">
        <span className="np-skip"><Prev width="26" height="26" /></span>
        <span className="play"><Play width="30" height="30" /></span>
        <span className="np-skip"><Next width="26" height="26" /></span>
      </div>
      <div className="np-row">
        <Heart className="on" /><Bolt /><Queue /><Notes />
      </div>
    </div>
  );
}

function LyricsScreen() {
  return (
    <div className="scr scr-lyrics" data-screen="lyrics">
      <div className="mini-head">
        <span className="mini-art" />
        <span><b>Cielo eléctrico</b><small>Nadia Ferrer</small></span>
      </div>
      <div className="lyrics">
        {LYRICS.map((line) => <p className="lyric" key={line}>{line}</p>)}
      </div>
      <div className="np-slider"><span style={{ width: "62%" }} /></div>
    </div>
  );
}

function OfflineScreen() {
  return (
    <div className="scr scr-offline" data-screen="offline">
      <div className="chip"><Plane width="16" height="16" />Modo avión</div>
      <h4 className="scr-title">Descargas</h4>
      <div className="dl-list">
        <div className="dl-row">
          <span className="mini-art" />
          <span><b>Cielo eléctrico</b><small>Descargando</small><i className="dl-bar"><i className="dl-bar-fill" /></i></span>
          <span className="dl-done"><Check width="18" height="18" /></span>
        </div>
        <div className="dl-row"><span className="mini-art alt1" /><span><b>Luz de la avenida</b><small>Guardada</small></span><span className="dl-done is-static"><Check width="18" height="18" /></span></div>
        <div className="dl-row"><span className="mini-art alt2" /><span><b>Norte</b><small>Guardada</small></span><span className="dl-done is-static"><Check width="18" height="18" /></span></div>
      </div>
      <div className="mini-player">
        <span className="bar" style={{ width: "40%" }} />
        <span className="mini-art" />
        <span><small>Sin conexión</small><b>Cielo eléctrico</b></span>
        <span className="mini-play"><Pause width="16" height="16" /></span>
      </div>
    </div>
  );
}

function ShareScreen() {
  return (
    <div className="scr scr-share" data-screen="share">
      <h4 className="scr-title">Enviar con VOLT</h4>
      <div className="mini-head">
        <span className="mini-art" />
        <span><b>Cielo eléctrico</b><small>Nadia Ferrer</small></span>
      </div>
      <div className="friends">
        {FRIENDS.map((f) => (
          <div className="friend" key={f.name}>
            <span className="avatar">{f.initial}</span>
            <b>{f.name}</b>
            <span className="radio" />
          </div>
        ))}
      </div>
      <div className="send-bolt"><Bolt width="34" height="34" /></div>
      <p className="send-hint">Toca el rayo para mandarla</p>
    </div>
  );
}

export default function Story() {
  const root = useRef(null);
  const pin = useRef(null);
  const reduced = useReducedMotion();
  const drawRef = useRef(null);
  const register = useCallback((fn) => { drawRef.current = fn; }, []);

  useGSAP(() => {
    if (reduced) return;
    const steps = gsap.utils.toArray(".story-step", root.current);
    const screens = gsap.utils.toArray(".scr", root.current);
    const phone = root.current.querySelector(".phone-3d");
    const rail = root.current.querySelector(".story-rail-fill");
    const dots = gsap.utils.toArray(".story-rail i", root.current);
    const n = steps.length;
    const tilts = [
      { rotateY: 10, rotateX: 3 },
      { rotateY: -9, rotateX: 2 },
      { rotateY: 7, rotateX: -2 },
      { rotateY: 0, rotateX: 0 },
    ];

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: root.current,
        start: "top top",
        end: () => `+=${n * 100}%`,
        pin: pin.current,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    steps.forEach((step, i) => {
      const t = i;
      if (i === 0) gsap.set(step, { autoAlpha: 1 });
      else tl.fromTo(step, { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 0.32 }, t);
      if (i < n - 1) tl.to(step, { autoAlpha: 0, y: -36, duration: 0.32 }, t + 1 - 0.32);
      tl.to(phone, { ...tilts[i], duration: 0.9 }, Math.max(0, t - 0.3));
      tl.to(dots[i], { backgroundColor: "#C2FC4A", borderColor: "#C2FC4A", duration: 0.1 }, t + 0.05);
    });
    tl.fromTo(rail, { scaleY: 0 }, { scaleY: 1, duration: n }, 0);

    if (hasFrames) {
      const f = { i: 0 };
      tl.to(f, { i: FRAME_URLS.length - 1, duration: n, onUpdate: () => drawRef.current?.(f.i) }, 0);
      return;
    }

    screens.forEach((scr, i) => {
      if (i === 0) gsap.set(scr, { autoAlpha: 1 });
      else tl.fromTo(scr, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, i - 0.2);
      if (i < n - 1) tl.to(scr, { autoAlpha: 0, duration: 0.4 }, i + 1 - 0.2);
    });

    // Paso 2: karaoke. Cada línea se enciende y la anterior se apaga.
    const lines = gsap.utils.toArray(".lyric", root.current);
    const slot = 0.55 / lines.length;
    lines.forEach((line, j) => {
      const at = 1 + 0.2 + j * slot;
      tl.to(line, { color: "#EDEDEF", x: 8, duration: 0.06 }, at);
      if (j < lines.length - 1) tl.to(line, { color: "rgba(237,237,239,0.32)", x: 0, duration: 0.06 }, at + slot);
    });

    // Paso 3: la descarga avanza con el scroll y termina con la palomita.
    tl.fromTo(".dl-bar-fill", { scaleX: 0 }, { scaleX: 1, duration: 0.5 }, 2 + 0.2);
    tl.fromTo(".dl-row:first-child .dl-done", { autoAlpha: 0, scale: 0.5 }, { autoAlpha: 1, scale: 1, duration: 0.1 }, 2 + 0.72);

    // Paso 4: el rayo se carga y se elige al amigo.
    tl.fromTo(".send-bolt", { scale: 0.86 }, { scale: 1.08, duration: 0.6 }, 3 + 0.15);
    tl.to(".friend:first-child .radio", { backgroundColor: "#C2FC4A", borderColor: "#C2FC4A", duration: 0.1 }, 3 + 0.35);
  }, { scope: root, dependencies: [reduced] });

  if (reduced) {
    return (
      <section className="section story story-static" id="asi-se-siente" ref={root}>
        <div className="story-static-grid">
          <div>
            {STEPS.map((s) => (
              <div className="story-step is-static" key={s.id}>
                <h2>{s.title}</h2>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
          <div className="story-stage">
            <Phone screenClassName="story-screen"><NowPlayingScreen /></Phone>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="story" id="asi-se-siente" ref={root}>
      <div className="story-pin" ref={pin}>
        <div className="story-copy">
          <div className="story-rail" aria-hidden="true">
            <span className="story-rail-fill" />
            {STEPS.map((s) => <i key={s.id} />)}
          </div>
          {STEPS.map((s) => (
            <div className="story-step" key={s.id}>
              <h2>{s.title}</h2>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
        <div className="story-stage">
          <div className="phone-3d">
            <Phone screenClassName="story-screen">
              {hasFrames ? <FrameScrubber register={register} /> : (
                <>
                  <NowPlayingScreen />
                  <LyricsScreen />
                  <OfflineScreen />
                  <ShareScreen />
                </>
              )}
            </Phone>
          </div>
        </div>
      </div>
    </section>
  );
}
