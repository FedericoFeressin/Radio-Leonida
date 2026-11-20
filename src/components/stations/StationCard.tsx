"use client";

import { motion } from "motion/react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ConfirmBadge } from "@/components/common/ConfirmBadge";
import { Glyph } from "@/components/common/Glyph";
import { usePlayer } from "@/components/player/PlayerProvider";
import { useFavorites } from "@/hooks/useFavorites";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { getPlayableSource, getSources, getStationTracks } from "@/lib/catalog";
import type { Station } from "@/lib/types";

export function StationCard({ station }: { station: Station }) {
  const { state, playStation } = usePlayer();
  const { isStationFavorite, toggleStation } = useFavorites();
  const reduced = useReducedMotion();
  const stationTracks = getStationTracks(station);
  const hasTracks = stationTracks.length > 0;
  const hasPlayable = stationTracks.some((track) => getPlayableSource(track));
  const firstSource = hasTracks ? getSources(stationTracks[0])[0] : undefined;
  const isActive = state.stationId === station.id && Boolean(state.currentTrackId);
  const isFavorite = isStationFavorite(station.id);

  return (
    <motion.article
      className={`station-card ${isActive ? "is-active" : ""}`}
      style={{ "--accent": `var(--${station.accent})` } as CSSProperties}
      whileHover={reduced ? undefined : { y: -6 }}
      whileTap={reduced ? undefined : { scale: 0.99 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
    >
      <div className="station-card__glow" aria-hidden="true" />
      <div className="station-card__head">
        <div className={`station-glyph station-glyph--${station.accent}`}>
          <Glyph name={station.glyph} />
        </div>
        <button
          type="button"
          className={`favorite-button ${isFavorite ? "is-favorite" : ""}`}
          onClick={() => toggleStation(station.id)}
          aria-label={isFavorite ? `Quitar ${station.name} de favoritos` : `Guardar ${station.name} en favoritos`}
          aria-pressed={isFavorite}
          title={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
        >
          {isFavorite ? "★" : "☆"}
        </button>
      </div>

      <div className="station-card__meta">
        <ConfirmBadge status={station.status} compact />
        {station.frequency && <span className="frequency">{station.frequency} FM</span>}
      </div>

      <h3>{station.name}</h3>
      <p className="station-card__genre">{station.genre}</p>
      <p className="station-card__description">{station.description}</p>

      <div className="station-card__hosts">
        {station.hosts.map((host) => (
          <span key={host.name} className="host-chip">
            {host.name}
            {host.character && <em>{host.character}</em>}
          </span>
        ))}
      </div>

      <div className="station-card__actions">
        {hasPlayable ? (
          <button
            type="button"
            className="button button--primary button--small"
            onClick={() => playStation(station.id)}
          >
            {isActive && state.playback === "playing" ? "● Al aire" : "▶ Sintonizar"}
          </button>
        ) : firstSource ? (
          <a
            className="button button--primary button--small"
            href={firstSource.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            ↗ Buscar la primera
          </a>
        ) : station.previewUrl ? (
          <a
            className="button button--ghost button--small"
            href={station.previewUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            ↗ Preview oficial
          </a>
        ) : null}
        <Link className="button button--ghost button--small" href={`/emisoras/${station.id}`}>
          Ver emisora →
        </Link>
      </div>

      {!hasTracks && (
        <p className="station-card__note">
          {station.status === "official"
            ? "Sin canciones nominadas por Rockstar todavía."
            : "Sin canciones publicadas todavía."}
        </p>
      )}
    </motion.article>
  );
}
