# VOLT landing

Página de descarga de VOLT (`com.volt.music`). Vite + React, sin backend.
Vive en un repo aparte para que el código de la app pueda seguir privado y la página sea pública.

## Correr en local

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm build        # genera dist/
pnpm preview      # sirve dist/ en http://localhost:8080
```

## Qué hay en la página

| Pieza | Dónde | Qué hace |
|---|---|---|
| Hero 3D | `src/components/hero/` | Un cristal con la forma exacta del rayo del launcher (three.js + react-three-fiber + drei, `MeshTransmissionMaterial`) refracta el titular, que vive detrás como textura. Al fondo, una tormenta: el shader de `Lightning` de React Bits portado a un plano de la misma escena, con ráfagas aleatorias que crecen con el scroll. Arquitectura adaptada de PrismHero: calidad por tier según pantalla y núcleos, se apaga fuera de pantalla, carga aparte (`lazy`). Sin WebGL muestra el rayo plano y el titular en HTML. |
| Marco Android | `src/components/Phone.jsx` | El mockup Android de Magic UI (SVG 380×830) con la pantalla en HTML real debajo, no una imagen: el cuerpo lleva un hueco con `fill-rule: evenodd`. |
| Historia con scroll | `src/components/Story.jsx` | Sección pinned (GSAP ScrollTrigger): el teléfono se queda fijo e inclina en 3D mientras cambian cuatro pantallas y los textos. |
| Galería | `src/components/Gallery.jsx` + `mocks/Screens.jsx` | Inicio, Buscar, Biblioteca y Estadísticas en marcos Android. En escritorio el scroll vertical las recorre de lado (pin horizontal); en móvil es un carrusel nativo con snap. |
| Rayo de VOLT Share | `src/components/Share.jsx` | Al aceptar, se monta el componente `Lightning` de React Bits (copiado tal cual) dentro del teléfono durante un segundo, con flash, sacudida y el trueno real de la app. |
| Frames de video | `src/components/FrameScrubber.jsx` | Técnica "video a frames". Si hay frames en `src/frames`, sustituyen a las pantallas en CSS de la historia. |
| Descarga | `src/lib/useRelease.js` | Consulta GitHub Releases y rellena versión, tamaño y fecha. |

Scroll suave con Lenis y grano de película sobre toda la página. Todo respeta `prefers-reduced-motion`:
sin Lenis, sin pin, sin entradas, cristal quieto y tormenta apagada; la historia se muestra como lista.

## Cómo funciona la descarga

`useRelease` consulta `https://api.github.com/repos/<repo>/releases/latest`, toma el primer asset `.apk`
y rellena la tabla. Si no hay release o no hay red, el botón lleva a la página de releases.

El repo que consulta está en un solo lugar: `CONFIG.repo` en `src/lib/config.js`.
Por defecto es `torresjr94dev/volt-landing`, es decir, este mismo repo. Los APK nunca se commitean.

## Publicar una versión nueva

1. En `music-app`, genera el APK firmado (`./gradlew assembleRelease` con un `signingConfig` de release).
2. Desde esta carpeta:

```bash
gh release create v0.1 ../music-app/app/build/outputs/apk/release/app-release.apk \
  --title "VOLT 0.1" --notes "Primera versión pública."
```

## Publicar la página (GitHub Pages)

```bash
gh repo create volt-landing --public --source . --push
```

Luego en GitHub: Settings → Pages → Source: **GitHub Actions**. El workflow en
`.github/workflows/pages.yml` instala con pnpm, construye y publica `dist/` en cada push a `main`.
La página queda en `https://torresjr94dev.github.io/volt-landing/`.

Con dominio propio: agrega `public/CNAME` con el dominio y cambia la URL de `og:image` en `index.html`.

## Meter la app real con frames de video

La historia con scroll acepta una secuencia de frames en lugar de las pantallas dibujadas en CSS.

1. Graba la app en un teléfono de 20:9 (unos 6 a 8 segundos):

```bash
adb shell screenrecord --time-limit 8 /sdcard/volt.mp4
adb pull /sdcard/volt.mp4 .
```

2. Conviértela en frames (requiere ffmpeg en el PATH):

```bash
pnpm frames volt.mp4 --fps 12 --width 540
```

3. `pnpm dev` o `pnpm build`. Si `src/frames` tiene archivos `.webp`, el teléfono de la historia
   los dibuja en un canvas y el scroll avanza por ellos. Los frames no se commitean (`.gitignore`).

Guía de peso: 8 s a 12 fps y 540 px de ancho son unos 100 frames de 20 a 30 KB, es decir, 2 a 3 MB.

## Ajustar el hero 3D

Todo está en `src/components/hero/BoltScene.jsx`:

- Forma: `BOLT` son los puntos del rayo del launcher; `depth` y `bevel*` en `useBoltGeometry` dan el grosor.
- Vidrio: props de `MeshTransmissionMaterial` (`chromaticAberration` es la dispersión, `attenuationColor` el tinte).
- Luz: los cuatro `Lightformer` del `Environment` (uno es lima; sin él el cristal se ve neutro).
- Recorrido: el hero mide 260 svh; el scroll da una vuelta completa al rayo (`p * 2π`), lo inclina a la mitad
  y entre el 76 % y el 90 % dispara el final: tres rayos de tormenta (`LightningPlane`, uno siempre activo y
  dos solo del final) más un destello en pantalla (`.hero3d-flash`, lo lanza `BoltHero.jsx`).
- Tormenta: `uHue` 80 es el lima; las ráfagas se programan en `storm`; `targetX` dice dónde cae cada rayo.
  Abre la página con `?storm` para forzar el final sin scrollear y afinarlo. Otros flags de depuración:
  `?noStorm` quita los rayos, `?noPause` no apaga el frameloop fuera de pantalla, `?debug` expone el
  estado de three en `window.__r3f`.
- Ojo: react-three-fiber reinicia `clock.elapsedTime` a 0 cada vez que el frameloop pasa de `never` a
  `always`. Cualquier cosa que guarde marcas de tiempo (como la agenda de ráfagas) tiene que tolerar
  que el tiempo retroceda; si no, `exp()` se dispara y el canvas se pinta de blanco.
- Calidad: `QUALITY` por tier; `detectQuality` en `BoltHero.jsx` elige según ancho y núcleos.

Nota técnica: el `shaderMaterial` recibe los shaders por `args` (constructor). Si se pasan como props,
three compila el programa antes de recibirlos y el plano no dibuja nada.

## Micro-interacciones

- Botones: `.btn-primary` tiene un destello diagonal al pasar y se hunde al presionar; `.btn-outline` se carga
  de lima. `Magnetic.jsx` los acerca al cursor (solo puntero fino, nunca en touch ni con reduced-motion).
- Titulares: `useRevealHeading` (en `src/lib/reveal.js`) sube las líneas desde una máscara al entrar, una vez.
- Celdas de funciones: un foco de luz sigue al cursor (`--mx/--my` desde `Features.jsx`).
- Header: la marca es `ElectricLogo` de React Bits (WebGL2) sobre el rayo del launcher; sin WebGL2 va la marca plana.

## Estructura

```
index.html                     entrada de Vite (meta, fuentes, #root)
src/main.jsx, src/App.jsx      arranque y orden de secciones
src/styles.css                 tokens Kinetic Volt + layout; sin framework
src/lib/                       gsap (registro único), config, release, Lenis, reduced-motion
src/components/hero/           BoltHero (sección + copia), BoltScene (R3F), lightningShader (port)
src/components/mocks/          pantallas de la galería dibujadas con los tokens de la app
src/components/                Header, Story, Features, Gallery, Share, Install, Download, Footer,
                               Phone (marco Android), Lightning (React Bits, tal cual), FrameScrubber, Icons
src/assets/                    bolt.svg, volt_thunder.wav
src/frames/                    frames .webp generados (ignorados por git)
public/                        favicon.svg, og.png
scripts/extract-frames.mjs     video → frames con ffmpeg
scripts/og.html                plantilla con la que se generó public/og.png
.github/workflows/pages.yml    despliegue a GitHub Pages
```
