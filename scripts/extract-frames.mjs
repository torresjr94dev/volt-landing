#!/usr/bin/env node
// Convierte un video (por ejemplo, una grabación de pantalla de VOLT con
// `adb shell screenrecord`) en una secuencia de frames WebP para FrameScrubber.
//
// Uso: pnpm frames <video.mp4> [--fps 12] [--width 540] [--quality 80]
// Requiere ffmpeg en el PATH. Los frames caen en src/frames (ignorados por git).
import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync, readdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith("--"));
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? Number(args[i + 1]) : def;
};

if (!input || !existsSync(input)) {
  console.error("Uso: pnpm frames <video.mp4> [--fps 12] [--width 540] [--quality 80]");
  process.exit(1);
}

const fps = opt("fps", 12);
const width = opt("width", 540);
const quality = opt("quality", 80);
const out = resolve("src/frames");

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const result = spawnSync("ffmpeg", [
  "-y", "-i", input,
  "-vf", `fps=${fps},scale=${width}:-2`,
  "-c:v", "libwebp", "-quality", String(quality), "-compression_level", "6",
  resolve(out, "f%04d.webp"),
], { stdio: "inherit" });

if (result.status !== 0) {
  console.error("ffmpeg falló. Revisa que esté instalado y en el PATH.");
  process.exit(result.status ?? 1);
}

const n = readdirSync(out).filter((f) => f.endsWith(".webp")).length;
console.log(`Listo: ${n} frames en src/frames. Reconstruye con pnpm build (o reinicia pnpm dev).`);
