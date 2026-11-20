"use client";

import type { CSSProperties } from "react";
import { ConfirmBadge } from "@/components/common/ConfirmBadge";
import { Glyph } from "@/components/common/Glyph";
import { usePlayer } from "@/components/player/PlayerProvider";
import { useFavorites } from "@/hooks/useFavorites";
import { getPlayableSource, getSources, getStationTracks } from "@/lib/catalog";
import { statusLabel } from "@/lib/format";
import type { Station } from "@/lib/types";

export function StationHero({ station, trackCount }: { station: Station; trackCount: number }) {
  const { playStation } = usePlayer();
  const { isStationFavorite, toggleStation } = useFavorites();
  const isFavorite = isStationFavorite(station.id);

  const stationTracks = getStationTracks(station);
  const firstPlayable = stationTracks.find((track) => getPlayableSource(track));
  const firstSource = stationTracks.length > 0 ? getSources(stationTracks[0])[0] : undefined;

  return (
    <section
      className="station-hero"
      style={{ "--accent": `var(--${station.accent})` } as CSSProperties}
    >
      <div className="station-hero__grid" aria-hidden="true" />
      <div className="station-hero__content">
        <div className={`station-hero__glyph station-glyph--${station.accent}`}>
          <Glyph name={station.glyph} />
        </div>
        <div className="station-hero__text">
          <div className="station-hero__badges">
            <ConfirmBadge status={station.status} />
            {station.frequency && <span className="frequency">{station.frequency} FM</span>}
            <span className="station-hero__count">
              {trackCount === 0
                ? "Sin canciones publicadas"
                : `${trackCount} ${trackCount === 1 ? "canción" : "canciones"} ${
                    station.status === "official" ? "confirmadas" : "reportadas"
                  }`}
            </span>
          </div>
          <h1>{station.name}</h1>
          <p className="station-hero__genre">{station.genre}</p>
          <p className="station-hero__description">{station.description}</p>

          <div className="station-hero__hosts">
            {station.hosts.map((host) => (
              <div key={host.name} className="host-card">
                <span className="host-card__name">{host.name}</span>
                {host.character && <span className="host-card__character">{host.character}</span>}
              </div>
            ))}
          </div>

          <div className="station-hero__actions">
            {firstPlayable ? (
              <button
                type="button"
                className="button button--primary"
                onClick={() => playStation(station.id)}
              >
                ▶ Sintonizar emisora
              </button>
            ) : (
              firstSource && (
                <a
                  className="button button--primary"
                  href={firstSource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ↗ Buscar la primera canción
                </a>
              )
            )}
            {station.previewUrl && (
              <a
                className="button button--ghost"
                href={station.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                ↗ Preview oficial
              </a>
            )}
            <button
              type="button"
              className="button button--ghost"
              onClick={() => toggleStation(station.id)}
              aria-pressed={isFavorite}
            >
              {isFavorite ? "★ Guardada" : "☆ Guardar emisora"}
            </button>
          </div>

          {station.confirmedBy && (
            <p className="source-note">
              {statusLabel(station.status)} ·{" "}
              <a href={station.confirmedBy} target="_blank" rel="noopener noreferrer">
                Ver fuente
              </a>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
