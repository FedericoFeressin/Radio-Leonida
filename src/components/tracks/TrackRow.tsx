"use client";

import type { CSSProperties } from "react";
import { ConfirmBadge } from "@/components/common/ConfirmBadge";
import { Glyph } from "@/components/common/Glyph";
import { usePlayer } from "@/components/player/PlayerProvider";
import { useTrackDetail } from "@/components/tracks/TrackDetailProvider";
import { useFavorites } from "@/hooks/useFavorites";
import { getStation } from "@/lib/catalog";
import type { Track } from "@/lib/types";

export function TrackRow({
  track,
  index,
  showStation = true,
}: {
  track: Track;
  index?: number;
  showStation?: boolean;
}) {
  const { state, playTrack, toggle, addToQueue } = usePlayer();
  const { openTrack } = useTrackDetail();
  const { isTrackFavorite, toggleTrack } = useFavorites();
  const station = getStation(track.stationId);
  const isCurrent = state.currentTrackId === track.id;
  const isPlaying = isCurrent && state.playback === "playing";
  const isFavorite = isTrackFavorite(track.id);
  const token = track.artwork?.token ?? "pink";

  return (
    <div
      className={`track-row ${isCurrent ? "is-current" : ""}`}
      style={{ "--accent": `var(--${token})` } as CSSProperties}
    >
      <button
        type="button"
        className="track-row__play"
        onClick={() => (isCurrent ? toggle() : playTrack(track.id, track.stationId))}
        aria-label={isPlaying ? `Pausar ${track.title}` : `Reproducir ${track.title}`}
      >
        <span aria-hidden="true">{isPlaying ? "❚❚" : "▶"}</span>
      </button>

      <button
        type="button"
        className="queue-add-button"
        onClick={() => addToQueue(track.id)}
        disabled={state.queue.includes(track.id)}
        aria-label={state.queue.includes(track.id) ? `${track.title} ya está en la cola` : `Agregar ${track.title} a la cola`}
        title={state.queue.includes(track.id) ? "Ya está en la cola" : "Agregar a la cola"}
      >
        {state.queue.includes(track.id) ? "✓" : "+"}
      </button>

      {typeof index === "number" && <span className="track-row__index">{String(index + 1).padStart(2, "0")}</span>}

      <div className={`track-row__art track-art--${token}`} aria-hidden="true">
        <Glyph name={station?.glyph ?? "wave"} />
      </div>

      <div className="track-row__main">
        <button
          type="button"
          className="track-row__title"
          onClick={() => openTrack(track)}
        >
          {track.title}
        </button>
        <span className="track-row__artist">{track.artist}</span>
      </div>

      {showStation && (
        <span className="track-row__station">{station?.name ?? "Sin emisora"}</span>
      )}

      <div className="track-row__badge">
        <ConfirmBadge status={track.status} compact />
      </div>

      <button
        type="button"
        className={`favorite-button ${isFavorite ? "is-favorite" : ""}`}
        onClick={() => toggleTrack(track.id)}
        aria-label={isFavorite ? `Quitar ${track.title} de favoritos` : `Guardar ${track.title} en favoritos`}
        aria-pressed={isFavorite}
        title={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
      >
        {isFavorite ? "★" : "☆"}
      </button>
    </div>
  );
}
