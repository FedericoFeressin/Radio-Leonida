import rawStations from "@/data/stations.json";
import rawTracks from "@/data/tracks.json";
import rawSources from "@/data/sources.json";
import { normalize } from "./format";
import type { Source, Station, Track } from "./types";

export const stations = rawStations as unknown as Station[];
export const tracks = rawTracks as unknown as Track[];
export const sources = rawSources as unknown as Source[];

const stationById = new Map(stations.map((station) => [station.id, station]));
const trackById = new Map(tracks.map((track) => [track.id, track]));
const sourceById = new Map(sources.map((source) => [source.id, source]));

export function getStation(id: string | null | undefined): Station | undefined {
  return id ? stationById.get(id) : undefined;
}

export function getTrack(id: string | null | undefined): Track | undefined {
  return id ? trackById.get(id) : undefined;
}

export function getStationTracks(station: Station): Track[] {
  const listedTracks = station.trackIds
    .map((id) => trackById.get(id))
    .filter((track): track is Track => Boolean(track));

  const listedIds = new Set(listedTracks.map((track) => track.id));
  const assignedTracks = tracks.filter(
    (track) => track.stationId === station.id && !listedIds.has(track.id),
  );

  return [...listedTracks, ...assignedTracks];
}

export function getPlayableSource(track: Track): Source | undefined {
  return track.sourceIds
    .map((id) => sourceById.get(id))
    .find((source) => source?.kind === "youtube" && source.embeddable && source.videoId);
}

export function getSources(track: Track): Source[] {
  const explicit = track.sourceIds
    .map((id) => sourceById.get(id))
    .filter((source): source is Source => Boolean(source));

  // Fallback siempre disponible: búsqueda en la plataforma autorizada, nunca un ID inventado.
  const query = encodeURIComponent(`${track.artist} ${track.title}`);
  const fallback: Source = {
    id: `spotify-search-${track.id}`,
    kind: "spotify",
    url: `https://open.spotify.com/search/${query}`,
    label: "Buscar en Spotify",
    verifiedAt: "2026-11-19",
    embeddable: false,
  };

  return [...explicit, fallback];
}

export function searchTracks(query: string, pool: Track[] = tracks): Track[] {
  const term = normalize(query);
  if (!term) return pool;
  return pool.filter((track) => {
    const stationName = getStation(track.stationId)?.name ?? "";
    const haystack = normalize(
      `${track.title} ${track.artist} ${track.genre ?? ""} ${stationName}`,
    );
    return haystack.includes(term);
  });
}

export interface TrackFilters {
  stationId?: string;
  genre?: string;
  status?: Track["status"];
}

export function filterTracks(filters: TrackFilters, pool: Track[] = tracks): Track[] {
  return pool.filter((track) => {
    if (filters.stationId && track.stationId !== filters.stationId) return false;
    if (filters.genre && track.genre !== filters.genre) return false;
    if (filters.status && track.status !== filters.status) return false;
    return true;
  });
}

export function sortTracks(
  items: Track[],
  order: "title" | "artist" = "title",
): Track[] {
  const key = order === "artist" ? "artist" : "title";
  return [...items].sort((a, b) =>
    normalize(a[key]).localeCompare(normalize(b[key]), "es"),
  );
}

export function allGenres(): string[] {
  const values = new Set<string>();
  stations.forEach((station) => station.genres.forEach((genre) => values.add(genre)));
  tracks.forEach((track) => {
    if (track.genre) values.add(track.genre);
  });
  return [...values].sort((a, b) => a.localeCompare(b, "es"));
}

export function officialStations(): Station[] {
  return stations.filter((station) => station.status === "official");
}
