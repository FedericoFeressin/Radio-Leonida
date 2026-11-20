"use client";

import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { TrackRow } from "@/components/tracks/TrackRow";
import { allGenres, filterTracks, searchTracks, sortTracks, stations } from "@/lib/catalog";
import type { ConfirmationStatus, Track } from "@/lib/types";

const STATUS_OPTIONS: { value: ConfirmationStatus | ""; label: string }[] = [
  { value: "", label: "Todos los estados" },
  { value: "official", label: "Confirmado por Rockstar" },
  { value: "official-material", label: "Material oficial" },
  { value: "press-reported", label: "Reportado por prensa" },
  { value: "trailer", label: "Del tráiler" },
];

export function LibraryView({ tracks }: { tracks: Track[] }) {
  const [query, setQuery] = useState("");
  const [stationId, setStationId] = useState("");
  const [genre, setGenre] = useState("");
  const [status, setStatus] = useState<ConfirmationStatus | "">("");
  const [order, setOrder] = useState<"title" | "artist">("title");
  const [limit, setLimit] = useState(50);

  const genres = useMemo(() => allGenres(), []);

  useEffect(() => setLimit(50), [query, stationId, genre, status, order]);

  const visible = useMemo(() => {
    const filtered = filterTracks(
      {
        stationId: stationId || undefined,
        genre: genre || undefined,
        status: status || undefined,
      },
      searchTracks(query, tracks),
    );
    return sortTracks(filtered, order);
  }, [tracks, query, stationId, genre, status, order]);

  return (
    <div className="library">
      <div className="library__filters">
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar canción, artista o emisora…"
            aria-label="Buscar en la biblioteca"
          />
        </label>
        <label className="select-field">
          <span className="sr-only">Emisora</span>
          <select value={stationId} onChange={(event) => setStationId(event.target.value)}>
            <option value="">Todas las emisoras</option>
            {stations.map((station) => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
          </select>
        </label>
        <label className="select-field">
          <span className="sr-only">Género</span>
          <select value={genre} onChange={(event) => setGenre(event.target.value)}>
            <option value="">Todos los géneros</option>
            {genres.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="select-field">
          <span className="sr-only">Estado de confirmación</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as ConfirmationStatus | "")}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="select-field">
          <span className="sr-only">Ordenar</span>
          <select value={order} onChange={(event) => setOrder(event.target.value as "title" | "artist")}>
            <option value="title">Ordenar por título</option>
            <option value="artist">Ordenar por artista</option>
          </select>
        </label>
      </div>

      <p className="result-count">
        {visible.length} {visible.length === 1 ? "resultado" : "resultados"}
      </p>

      {visible.length > 0 ? (
        <>
          <div className="track-list">
            {visible.slice(0, limit).map((track, index) => (
              <TrackRow key={track.id} track={track} index={index} />
            ))}
          </div>
          {visible.length > limit && (
            <div className="library__more">
              <p>
                Mostrando {Math.min(limit, visible.length)} de {visible.length}
              </p>
              <button
                type="button"
                className="button button--ghost button--small"
                onClick={() => setLimit((current) => current + 50)}
              >
                Mostrar 50 más ↓
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title="No encontramos esa señal"
          description="Probá con otro término o quitá algún filtro. El catálogo crece cuando Rockstar confirma más música."
        />
      )}
    </div>
  );
}
