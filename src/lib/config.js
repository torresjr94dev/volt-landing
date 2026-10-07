// Único punto de configuración de la descarga.
// El APK se publica como asset de un Release en este repo (público);
// el repo del código de la app puede seguir privado.
export const CONFIG = {
  repo: "torresjr94dev/volt-landing",
  assetPattern: /\.apk$/i,
  cacheMinutes: 10,
  minAndroid: "Android 8.0 o más reciente",
};

export const releasesUrl = `https://github.com/${CONFIG.repo}/releases`;
export const repoUrl = (path = "") => `https://github.com/${CONFIG.repo}${path}`;

export const isAndroid = /android/i.test(navigator.userAgent);
