import { useEffect, useRef } from "react";

// Secuencia de frames (técnica "video a frames" de las landings de Apple).
// Los frames salen de un video con `pnpm frames <video.mp4>` y caen en src/frames.
// Si la carpeta está vacía, hasFrames es false y la historia usa las pantallas en CSS.
const modules = import.meta.glob("../frames/*.webp", { eager: true, query: "?url", import: "default" });
export const FRAME_URLS = Object.keys(modules).sort().map((k) => modules[k]);
export const hasFrames = FRAME_URLS.length > 0;

/**
 * Dibuja el frame `index` en un canvas que llena su contenedor (object-fit: cover).
 * `register` recibe la función draw(index) para que un timeline de GSAP la llame.
 */
export default function FrameScrubber({ register }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const images = FRAME_URLS.map((src) => {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
      return img;
    });
    let current = 0;
    let w = 0;
    let h = 0;

    const draw = (index) => {
      current = Math.max(0, Math.min(images.length - 1, Math.round(index)));
      const img = images[current];
      if (!img.complete || !img.naturalWidth) return;
      const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    };

    const resize = () => {
      const parent = canvas.parentElement;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(current);
    };

    images.forEach((img, i) => {
      img.onload = () => { if (i === current) draw(current); };
    });
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);
    resize();
    register?.(draw);
    return () => {
      ro.disconnect();
      register?.(null);
    };
  }, [register]);

  return <canvas ref={ref} className="frame-canvas" />;
}
