// Iconos de línea (1.6 px, puntas redondas) y el rayo del launcher.
// Un solo set para toda la página; nada de emojis.
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export const Bolt = (props) => (
  <svg viewBox="14 14 80 80" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M61 22 36 60h16l-5 26 27-40H57z" />
  </svg>
);

export const BrandMark = ({ size = 28 }) => (
  <svg viewBox="14 14 80 80" width={size} height={size} aria-hidden="true">
    <rect x="14" y="14" width="80" height="80" rx="20" fill="#C2FC4A" />
    <path d="M61 22 36 60h16l-5 26 27-40H57z" fill="#09090F" />
  </svg>
);

export const DownloadIcon = (props) => (
  <svg {...base} strokeWidth={2} {...props}><path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14" /></svg>
);
export const Headphones = (props) => (
  <svg {...base} {...props}><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="13" width="4" height="7" rx="1.5" /><rect x="17" y="13" width="4" height="7" rx="1.5" /></svg>
);
export const Lines = (props) => (
  <svg {...base} {...props}><path d="M5 7h14M5 12h10M5 17h7" /></svg>
);
export const Infinity = (props) => (
  <svg {...base} {...props}><path d="M3 12c0-2.5 1.8-4 4-4 2.1 0 3.2 1.6 5 4s2.9 4 5 4c2.2 0 4-1.5 4-4s-1.8-4-4-4c-2.1 0-3.2 1.6-5 4s-2.9 4-5 4c-2.2 0-4-1.5-4-4z" /></svg>
);
export const PhoneIcon = (props) => (
  <svg {...base} {...props}><rect x="7" y="2.5" width="10" height="19" rx="2.5" /><path d="M11 18h2" /></svg>
);
export const Bars = (props) => (
  <svg {...base} {...props}><path d="M5 19v-8M12 19V5M19 19v-5" /></svg>
);
export const Person = (props) => (
  <svg {...base} strokeWidth={1.8} {...props}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
);
export const Bell = (props) => (
  <svg {...base} strokeWidth={1.8} {...props}><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z" /><path d="M10 21h4" /></svg>
);
export const Plane = (props) => (
  <svg {...base} {...props}><path d="M10 20.5 12 14l6.5-6.5a2 2 0 0 0-3-3L9 11l-6.5 1.5 2 2L9 13l2 2-1.5 4.5z" /></svg>
);
export const Check = (props) => (
  <svg {...base} strokeWidth={2.2} {...props}><path d="m5 12 4.5 4.5L19 7" /></svg>
);
export const Heart = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}><path d="M12 21s-7.5-4.6-9.5-9A5.3 5.3 0 0 1 12 6.4 5.3 5.3 0 0 1 21.5 12c-2 4.4-9.5 9-9.5 9z" /></svg>
);
export const Queue = (props) => (
  <svg {...base} strokeWidth={1.8} {...props}><path d="M4 6h16M4 12h16M4 18h9" /></svg>
);
export const Notes = (props) => (
  <svg {...base} strokeWidth={1.8} {...props}><path d="M9 18V6l10-2v12" /><circle cx="6" cy="18" r="3" /><circle cx="16" cy="16" r="3" /></svg>
);
export const Play = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}><path d="M8 5v14l12-7z" /></svg>
);
export const Pause = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
);
export const Prev = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}><path d="M6 5h2v14H6zM19 5 9 12l10 7z" /></svg>
);
export const Next = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}><path d="M16 5h2v14h-2zM5 5l10 7-10 7z" /></svg>
);
