/**
 * Importa TODAS las canciones listadas por GameSpot en "All GTA 6 Radio Stations
 * And Songs" y las fusiona con el catálogo local.
 *
 * - No inventa nada: cada línea se lee del artículo y se marca `press-reported`.
 * - No duplica: compara título+artista normalizados con los temas ya presentes.
 * - Respeta los 18 temas `official`: nunca cambia su estado ni sus fuentes.
 *
 * Uso: node scripts/import-gamespot-tracks.mjs [--dry]
 */
import { readFileSync, writeFileSync } from "node:fs";

const GAMESPOT =
  "https://www.gamespot.com/articles/all-gta-6-radio-stations-and-songs/";
const ARTICLE = `https://r.jina.ai/${GAMESPOT}`;
const CONFIRMED_AT = "2026-11-19";
const dry = process.argv.includes("--dry");

const stations = JSON.parse(readFileSync("src/data/stations.json", "utf8"));
const tracks = JSON.parse(readFileSync("src/data/tracks.json", "utf8"));

const STATION_IDS = new Map([
  ["Flash FM", "flash-fm"],
  ["Emotion 98.3", "emotion-98-3"],
  ["Vice City FM", "vice-city-fm"],
  ["Stockyard FM", "stockyard-fm"],
  ["Dirty South Classics", "dirty-south-classics"],
  ["VCRR", "vcrr"],
  ["Honey FM", "honey-fm"],
  ["Cocoteo FM", "cocoteo-fm"],
  ["Radio La Ola", "radio-la-ola"],
  ["Radio On-U", "radio-on-u"],
  ["V-Rock", "v-rock"],
  ["The Chamber 106.6", "the-chamber-106-6"],
  ["Back Country Radio", "back-country-radio"],
  ["Gloriana Blues Radio", "gloriana-blues-radio"],
  ["Leonida Jazz Radio", "leonida-jazz-radio"],
  ["Symphony FM", "symphony-fm"],
  ["Worldwide FM", "worldwide-fm"],
  ["CircoLoco Records Radio", "circoloco-records"],
  ["AfroBank FM", "afrobank-fm"],
  ["Kaleidoscope FM", "kaleidoscope-fm"],
]);

function normalize(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function keyOf(artist, title) {
  // Compara artista principal y título sin paréntesis: "Midnight Sun (Girls Trip)"
  // y "Midnight Sun" son el mismo tema, aunque el crédito cambie de "and" a "&".
  const primary = artist.split(/\s+(?:feat\.?|ft\.?|with|&|and)\s+/i)[0] ?? artist;
  const cleanTitle = title.replace(/\s*[([][^)\]]*[)\]]\s*/g, "");
  return `${normalize(primary)}|${normalize(cleanTitle)}`;
}

function parseSong(line) {
  const raw = line.replace(/^\s*[-*]\s+/, "").trim();
  if (!raw || raw.startsWith("[")) return null;

  const parts = raw.includes(" – ") ? raw.split(" – ") : raw.split(".- ");
  if (parts.length !== 2) return null;

  const artist = parts[0].replace(/\.\s*$/, "").trim();
  const title = parts[1].trim();
  if (!artist || !title) return null;
  return { artist, title };
}

const response = await fetch(ARTICLE);
if (!response.ok) throw new Error(`No se pudo leer el artículo: ${response.status}`);
const markdown = await response.text();

const parsed = [];
let currentId = null;
let unparsed = 0;

for (const line of markdown.split(/\r?\n/)) {
  const heading = line.match(/^##\s+(.+?)\s*$/);
  if (heading) {
    currentId = STATION_IDS.get(heading[1].trim()) ?? null;
    continue;
  }
  if (!currentId || !/^\s*[-*]\s+/.test(line)) continue;

  const song = parseSong(line);
  if (song) parsed.push({ ...song, stationId: currentId });
  else if (line.includes(" – ")) unparsed += 1;
}

const stationById = new Map(stations.map((station) => [station.id, station]));
const existingKeys = new Set(
  tracks.map((track) => keyOf(track.artist, track.title)),
);
const addedByStation = new Map();
let added = 0;

for (const song of parsed) {
  const key = keyOf(song.artist, song.title);
  if (existingKeys.has(key)) continue;
  const station = stationById.get(song.stationId);
  if (!station) continue;

  existingKeys.add(key);
  const index = (addedByStation.get(station.id) ?? 0) + 1;
  addedByStation.set(station.id, index);

  const id = `t-gs-${station.id}-${index}`;
  tracks.push({
    id,
    title: song.title,
    artist: song.artist,
    album: null,
    year: null,
    stationId: station.id,
    genre: station.genre,
    status: "press-reported",
    sourceIds: [],
    artwork: { kind: "gradient", token: station.accent },
    confirmedBy: GAMESPOT,
    confirmedAt: CONFIRMED_AT,
  });
  station.trackIds.push(id);
  added += 1;
}

console.log(`leídas=${parsed.length} nuevas=${added} sin parsear=${unparsed}`);
for (const [id, count] of [...addedByStation].sort()) {
  console.log(`  ${id.padEnd(24)} +${count}`);
}

if (!dry) {
  writeFileSync("src/data/stations.json", `${JSON.stringify(stations, null, 2)}\n`, "utf8");
  writeFileSync("src/data/tracks.json", `${JSON.stringify(tracks, null, 2)}\n`, "utf8");
  console.log(`total: stations=${stations.length} tracks=${tracks.length}`);
}
