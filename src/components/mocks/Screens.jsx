// Pantallas de VOLT dibujadas con los tokens de la app (Inicio, Buscar, Biblioteca, Estadísticas).
// Datos ficticios; las secciones y el bottom nav de 3 destinos son los reales (PLAN.md).
import { Bars, Bolt, Check, DownloadIcon, Heart, Headphones, Notes, PhoneIcon, Queue } from "../Icons.jsx";

const SONGS = [
  { title: "Cielo eléctrico", artist: "Nadia Ferrer", dur: "3:28", art: "" },
  { title: "Luz de la avenida", artist: "Los Faros", dur: "4:02", art: "alt1" },
  { title: "Norte", artist: "Mar Abierto", dur: "2:51", art: "alt2" },
  { title: "Ruido blanco", artist: "Vera Sol", dur: "3:40", art: "alt1" },
];

const HomeIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z" /></svg>
);
const SearchIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>
);
const LibraryIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" {...p}><path d="M4 5v14M9 5v14M14 6l5 13" /></svg>
);

const Art = ({ variant = "" }) => <span className={`mini-art ${variant}`.trim()} />;

function Song({ s, rank }) {
  return (
    <div className={rank ? "rank" : "song"}>
      {rank && <i>{rank}</i>}
      <Art variant={s.art} />
      <span><b>{s.title}</b><small>{s.artist}</small></span>
      {!rank && <span className="dur">{s.dur}</span>}
    </div>
  );
}

function BottomNav({ active }) {
  return (
    <div className="bottom-nav">
      <span className={active === "inicio" ? "is-active" : ""}><HomeIcon />Inicio</span>
      <span className={active === "buscar" ? "is-active" : ""}><SearchIcon />Buscar</span>
      <span className={active === "biblioteca" ? "is-active" : ""}><LibraryIcon />Biblioteca</span>
    </div>
  );
}

export function HomeScreen() {
  return (
    <div className="scr-static">
      <div className="row-between">
        <b className="greet">Buenas noches, Jorge</b>
        <span className="avatar sm">J</span>
      </div>
      <h5 className="sec-title">Escuchado recientemente</h5>
      <div className="tiles">
        {SONGS.map((s) => (
          <div className="tile" key={s.title}><Art variant={s.art} /><b>{s.title}</b><small>{s.artist}</small></div>
        ))}
      </div>
      <h5 className="sec-title">Tus favoritos</h5>
      <Song s={SONGS[0]} />
      <Song s={SONGS[2]} />
      <BottomNav active="inicio" />
    </div>
  );
}

export function SearchScreen() {
  return (
    <div className="scr-static">
      <div className="search-field"><SearchIcon />nadia fe<i className="caret" /></div>
      <div className="chips"><span className="is-active">Canciones</span><span>Álbumes</span><span>Artistas</span></div>
      <div className="best">
        <Art />
        <span>
          <b>Cielo eléctrico</b><small>Nadia Ferrer</small>
          <span className="best-actions"><span className="primary">Reproducir</span><span className="ghost">Guardar</span></span>
        </span>
      </div>
      <div className="results">
        <Song s={SONGS[3]} />
        <Song s={SONGS[1]} />
        <Song s={SONGS[2]} />
      </div>
      <BottomNav active="buscar" />
    </div>
  );
}

export function LibraryScreen() {
  const rows = [
    { Icon: Heart, label: "Favoritos", count: "24" },
    { Icon: Queue, label: "Playlists", count: "3" },
    { Icon: Notes, label: "Historial", count: "" },
    { Icon: DownloadIcon, label: "Descargas", count: "12" },
    { Icon: PhoneIcon, label: "En este teléfono", count: "118" },
  ];
  return (
    <div className="scr-static">
      <h5 className="sec-title first">Biblioteca</h5>
      {rows.map(({ Icon, label, count }) => (
        <div className="lib-row" key={label}><span className="ico"><Icon /></span><span>{label}</span><span className="count">{count}</span></div>
      ))}
      <h5 className="sec-title">Artistas que sigues</h5>
      <div className="follow-row">
        {["N", "L", "M", "V"].map((i) => <span className="avatar" key={i}>{i}</span>)}
      </div>
      <BottomNav active="biblioteca" />
    </div>
  );
}

export function StatsScreen() {
  return (
    <div className="scr-static">
      <h5 className="sec-title first">Estadísticas</h5>
      <div className="chips"><span className="is-active">7 días</span><span>30 días</span><span>Todo</span></div>
      <div className="bento">
        <div><b>4 h 12 min</b><small>escuchados esta semana</small></div>
        <div><b>63</b><small>canciones</small></div>
        <div><b>18</b><small>artistas</small></div>
      </div>
      <h5 className="sec-title">Top canciones</h5>
      <Song s={SONGS[0]} rank="1" />
      <Song s={SONGS[1]} rank="2" />
      <Song s={SONGS[3]} rank="3" />
      <BottomNav active="biblioteca" />
    </div>
  );
}

export const GALLERY = [
  { id: "inicio", title: "Inicio", text: "Saludo según la hora y lo último que escuchaste, en una sola vista.", Screen: HomeScreen },
  { id: "buscar", title: "Buscar", text: "El mejor resultado al frente, listo para reproducir o guardar sin abrir nada.", Screen: SearchScreen },
  { id: "biblioteca", title: "Biblioteca", text: "Favoritos, playlists, historial, descargas y lo que ya traías en el teléfono.", Screen: LibraryScreen },
  { id: "stats", title: "Estadísticas", text: "Minutos, canciones y artistas de la semana, del mes o de toda la vida.", Screen: StatsScreen },
];

// Iconos reexportados para que Story y Share sigan importando de un solo lugar si hace falta.
export { Bars, Bolt, Check, Headphones };
