/**
 * Amplía el catálogo con las 16 emisoras que GameSpot documenta dentro del juego
 * (19 nov 2026) y una muestra de canciones verificadas de cada una.
 *
 * Regla del proyecto: no se inventan emisoras, artistas ni canciones. Todo lo que
 * agrega este script aparece textualmente en el artículo citado y se marca como
 * `press-reported`, no como confirmado por Rockstar.
 *
 * Uso: node scripts/expand-catalog.mjs
 * Es idempotente: no duplica emisoras ni canciones si ya existen.
 */
import { readFileSync, writeFileSync } from "node:fs";

const STATIONS_PATH = "src/data/stations.json";
const TRACKS_PATH = "src/data/tracks.json";
const GAMESPOT =
  "https://www.gamespot.com/articles/all-gta-6-radio-stations-and-songs/";
const CONFIRMED_AT = "2026-11-19";

const stations = JSON.parse(readFileSync(STATIONS_PATH, "utf8"));
const tracks = JSON.parse(readFileSync(TRACKS_PATH, "utf8"));

const stationIds = new Set(stations.map((station) => station.id));
const trackIds = new Set(tracks.map((track) => track.id));

const NEW_STATIONS = [
  {
    id: "emotion-98-3",
    name: "Emotion 98.3",
    frequency: "98.3",
    genre: "Soft rock",
    genres: ["Soft rock", "Baladas", "Pop rock"],
    description:
      "La emisora de baladas y soft rock de Vice City vuelve para los trayectos largos. Reportada dentro del juego; Rockstar no publicó su ficha oficial.",
    hosts: [],
    accent: "violet",
    glyph: "wave",
    songs: [
      ["Drive", "The Cars"],
      ["In the Air Tonight", "Phil Collins"],
      ["Listen to Your Heart", "Roxette"],
      ["The Way It Is", "Bruce Hornsby & The Range"],
    ],
  },
  {
    id: "vice-city-fm",
    name: "Vice City FM",
    frequency: null,
    genre: "Pop de los 80",
    genres: ["80s pop", "New wave", "Synthpop"],
    description:
      "Pop y new wave de los 80. Visto en un anuncio real y reportado dentro del juego; Rockstar no la anunció como emisora en su comunicado.",
    hosts: [],
    accent: "cyan",
    glyph: "sun",
    songs: [
      ["Loverboy", "Billy Ocean"],
      ["All Night Long", "Lionel Richie"],
      ["Thieves Like Us", "New Order"],
      ["Shattered Dreams", "Johnny Hates Jazz"],
    ],
  },
  {
    id: "stockyard-fm",
    name: "Stockyard FM",
    frequency: null,
    genre: "Indie y dance",
    genres: ["Indie", "Dance", "Electrónica"],
    description:
      "Indie y dance reportados dentro del juego. Rockstar no publicó su ficha oficial.",
    hosts: [],
    accent: "orange",
    glyph: "pulse",
    songs: [
      ["North American Scum", "LCD Soundsystem"],
      ["Overpowered", "Róisín Murphy"],
      ["One Night / All Night", "Justice & Tame Impala"],
      ["Emerge", "Fischerspooner"],
    ],
  },
  {
    id: "vcrr",
    name: "VCRR",
    frequency: null,
    genre: "Rap moderno",
    genres: ["Rap", "Hip-hop", "Trap"],
    description:
      "Rap moderno reportado dentro del juego. Rockstar no publicó su ficha oficial.",
    hosts: [],
    accent: "pink",
    glyph: "bolt",
    songs: [
      ["Nonstop", "Drake"],
      ["Dior", "Pop Smoke"],
      ["RHYNO", "Travis Scott"],
      ["Unforgettable", "French Montana & Swae Lee"],
    ],
  },
  {
    id: "honey-fm",
    name: "Honey FM",
    frequency: null,
    genre: "R&B y soul de los 90",
    genres: ["R&B", "Soul", "90s"],
    description:
      "R&B y soul de los 90. También fue vista en material oficial (camiseta y anuncio) antes del lanzamiento; reportada dentro del juego.",
    hosts: [],
    accent: "orange",
    glyph: "star",
    songs: [
      ["Creep", "TLC"],
      ["Too Close", "Next"],
      ["Bad Girl", "Usher"],
      ["Whip Appeal", "Babyface"],
    ],
  },
  {
    id: "radio-la-ola",
    name: "Radio La Ola",
    frequency: null,
    genre: "Latin clásico",
    genres: ["Latin", "Salsa", "Bolero", "Clásicos latinos"],
    description:
      "La contraparte de oro de Cocoteo FM: clásicos latinos reportados dentro del juego.",
    hosts: [],
    accent: "coral",
    glyph: "wave",
    songs: [
      ["Besito de Coco", "Celia Cruz feat. Johnny Pacheco"],
      ["Pedro Navaja", "Willie Colón & Rubén Blades"],
      ["Mi Tierra", "Gloria Estefan"],
      ["Sopa de Caracol", "Banda Blanca"],
    ],
  },
  {
    id: "radio-on-u",
    name: "Radio On-U",
    frequency: null,
    genre: "Reggae y dub",
    genres: ["Reggae", "Dub", "Roots"],
    description:
      "Dub, reggae y roots con el nombre del sello On-U Sound. Reportada dentro del juego.",
    hosts: [],
    accent: "cyan",
    glyph: "orbit",
    songs: [
      ["Skylarking", "Horace Andy"],
      ["Everything I Own", "Ken Boothe"],
      ["Big Ship", "Freddie McGregor"],
      ["Dub Inspector", "Adrian Sherwood"],
    ],
  },
  {
    id: "v-rock",
    name: "V-Rock",
    frequency: null,
    genre: "Rock clásico",
    genres: ["Rock clásico", "Hard rock"],
    description:
      "El buitre vuelve, ahora con más rock clásico que metal. Visto en material oficial y reportado dentro del juego.",
    hosts: [],
    accent: "violet",
    glyph: "bolt",
    songs: [
      ["Runaway", "Bon Jovi"],
      ["Panama", "Van Halen"],
      ["Rock the Casbah", "The Clash"],
      ["Cherry Pie", "Warrant"],
    ],
  },
  {
    id: "gloriana-blues-radio",
    name: "Gloriana Blues Radio",
    frequency: null,
    genre: "Blues",
    genres: ["Blues", "Delta blues", "R&B"],
    description:
      "Blues en todas sus variantes, reportado dentro del juego. Rockstar no publicó su ficha oficial.",
    hosts: [],
    accent: "orange",
    glyph: "disc",
    songs: [
      ["Boogie Chillen", "John Lee Hooker"],
      ["I Got What It Takes", "Koko Taylor"],
      ["Didn't It Rain", "Sister Rosetta Tharpe"],
      ["Me and My Chauffeur", "Memphis Minnie"],
    ],
  },
  {
    id: "leonida-jazz-radio",
    name: "Leonida Jazz Radio",
    frequency: null,
    genre: "Jazz fusión",
    genres: ["Jazz", "Fusión", "Jazz funk"],
    description:
      "Fusión y jazz de los 70 reportados dentro del juego. Rockstar no publicó su ficha oficial.",
    hosts: [],
    accent: "violet",
    glyph: "orbit",
    songs: [
      ["School Days", "Stanley Clarke"],
      ["Sorceress", "Return to Forever"],
      ["Night Crawlers", "Bob James"],
      ["Time Limit", "Casiopea"],
    ],
  },
  {
    id: "symphony-fm",
    name: "Symphony FM",
    frequency: null,
    genre: "Clásica",
    genres: ["Clásica", "Orquestal"],
    description:
      "Música clásica y orquestal reportada dentro del juego. Rockstar no publicó su ficha oficial.",
    hosts: [],
    accent: "cyan",
    glyph: "star",
    songs: [
      ["Messiah", "George Frideric Handel"],
      ["Nocturnes, L. 91: II. Fêtes", "Claude Debussy"],
      ["Symphony No. 6: Allegro Energico", "Gustav Mahler"],
      ["Les Préludes", "Franz Liszt"],
    ],
  },
  {
    id: "worldwide-fm",
    name: "Worldwide FM",
    frequency: null,
    genre: "World music y jazz",
    genres: ["World", "Jazz", "Global club"],
    description:
      "Música del mundo y jazz; regresa de GTA V. Reportada dentro del juego.",
    hosts: [],
    accent: "orange",
    glyph: "orbit",
    songs: [
      ["Smile", "Jamiroquai"],
      ["The First Time Ever I Saw Your Face", "Roberta Flack"],
      ["Star Chasers", "4hero"],
      ["Atmosphere Strut", "Cloud One"],
    ],
  },
  {
    id: "kaleidoscope-fm",
    name: "Kaleidoscope FM",
    frequency: null,
    genre: "Global pop ecléctico",
    genres: ["Global pop", "Ecléctico", "Covers"],
    description:
      "Covers insólitos, pop global y discos finlandeses, con Jeremy Irons como locutor. Reportada dentro del juego.",
    hosts: [{ name: "Jeremy Irons" }],
    accent: "pink",
    glyph: "star",
    songs: [
      ["Herz Aus Glas", "Marianne Rosenberg"],
      ["Chia Tay Trong Mua", "Phương Thanh"],
      ["Say It Right", "Alim Qasimov & Farghana Qasimova"],
      ["How You Remind Me", "Alkistis Protopsalti"],
    ],
  },
  {
    id: "wktt",
    name: "WKTT",
    frequency: null,
    genre: "Talk radio",
    genres: ["Talk", "Sátira", "Call-in"],
    description:
      "We Know The Truth: talk show conservador satírico con Stavros Halkias. Reportado dentro del juego; sin canciones.",
    hosts: [{ name: "Stavros Halkias" }],
    accent: "coral",
    glyph: "pulse",
    songs: [],
  },
  {
    id: "the-wipe",
    name: "The Wipe",
    frequency: null,
    genre: "Talk radio",
    genres: ["Talk", "Sátira", "Trivia"],
    description:
      "Talk show satírico sobre las rarezas de Leonida. Reportado dentro del juego; sin canciones.",
    hosts: [],
    accent: "violet",
    glyph: "disc",
    songs: [],
  },
  {
    id: "vault-radio",
    name: "The Vault Radio",
    frequency: null,
    genre: "Electrónica y rave",
    genres: ["Electrónica", "Rave", "Dance"],
    description:
      "Emisora secreta: se desbloquea escaneando el póster de la máscara rosa en The Vault Nightclub, en Vice City. Reproduce la música de dance y electrónica del club. Reportada dentro del juego.",
    hosts: [],
    accent: "cyan",
    glyph: "bolt",
    songs: [],
  },
];

for (const definition of NEW_STATIONS) {
  if (stationIds.has(definition.id)) continue;

  const stationTracks = definition.songs.map(([title, artist], index) => {
    const id = `t-${definition.id}-${index + 1}`;
    if (trackIds.has(id)) return id;
    trackIds.add(id);
    tracks.push({
      id,
      title,
      artist,
      album: null,
      year: null,
      stationId: definition.id,
      genre: definition.genre,
      status: "press-reported",
      sourceIds: [],
      artwork: { kind: "gradient", token: definition.accent },
      confirmedBy: GAMESPOT,
      confirmedAt: CONFIRMED_AT,
    });
    return id;
  });

  stations.push({
    id: definition.id,
    name: definition.name,
    frequency: definition.frequency,
    genre: definition.genre,
    genres: definition.genres,
    description: definition.description,
    hosts: definition.hosts,
    status: "press-reported",
    trackIds: stationTracks,
    accent: definition.accent,
    glyph: definition.glyph,
    confirmedBy: GAMESPOT,
  });
  stationIds.add(definition.id);
}

// CircoLoco ya existía por el preview oficial; su tracklist es reportado por prensa.
const circoloco = stations.find((station) => station.id === "circoloco-records");
if (circoloco && circoloco.trackIds.length === 0) {
  const songs = [
    ["Floral", "Skream"],
    ["Rhythm of the Night", "Michael Bibi"],
    ["Let It Go", "Mind Against"],
  ];
  circoloco.trackIds = songs.map(([title, artist], index) => {
    const id = `t-circoloco-${index + 1}`;
    if (trackIds.has(id)) return id;
    trackIds.add(id);
    tracks.push({
      id,
      title,
      artist,
      album: null,
      year: null,
      stationId: circoloco.id,
      genre: circoloco.genre,
      status: "press-reported",
      sourceIds: [],
      artwork: { kind: "gradient", token: circoloco.accent },
      confirmedBy: GAMESPOT,
      confirmedAt: CONFIRMED_AT,
    });
    return id;
  });
}

writeFileSync(STATIONS_PATH, `${JSON.stringify(stations, null, 2)}\n`, "utf8");
writeFileSync(TRACKS_PATH, `${JSON.stringify(tracks, null, 2)}\n`, "utf8");

console.log(`stations=${stations.length} tracks=${tracks.length}`);
