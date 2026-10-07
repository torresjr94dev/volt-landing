import { useEffect, useState } from "react";
import { CONFIG, releasesUrl } from "./config.js";

const formatMb = (bytes) => `${Math.max(1, Math.round(bytes / 1048576))} MB`;

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return String(iso).slice(0, 10);
  }
};

async function fetchLatestRelease() {
  const key = `volt-release:${CONFIG.repo}`;
  try {
    const cached = JSON.parse(sessionStorage.getItem(key) || "null");
    if (cached && Date.now() - cached.at < CONFIG.cacheMinutes * 60000) return cached.data;
  } catch { /* sin sessionStorage, seguimos */ }

  const res = await fetch(`https://api.github.com/repos/${CONFIG.repo}/releases/latest`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`GitHub respondió ${res.status}`);
  const data = await res.json();
  try { sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data })); } catch { /* ignorar */ }
  return data;
}

/**
 * Estado de la descarga:
 *  - loading: consultando GitHub
 *  - ready:   hay APK en el último release (url directa + metadatos)
 *  - missing: no hay release o no hay red; el botón lleva a la página de releases
 */
export function useRelease() {
  const [release, setRelease] = useState({ status: "loading", url: releasesUrl });

  useEffect(() => {
    let alive = true;
    fetchLatestRelease()
      .then((rel) => {
        const apk = (rel.assets || []).find((a) => CONFIG.assetPattern.test(a.name));
        if (!apk) throw new Error("El release no trae APK");
        if (!alive) return;
        setRelease({
          status: "ready",
          url: apk.browser_download_url,
          version: String(rel.tag_name || rel.name || "").replace(/^v/i, "") || "última",
          size: formatMb(apk.size),
          date: formatDate(rel.published_at),
        });
      })
      .catch((err) => {
        console.info("[VOLT] Sin release publicado:", err.message);
        if (alive) setRelease({ status: "missing", url: releasesUrl });
      });
    return () => { alive = false; };
  }, []);

  return release;
}
