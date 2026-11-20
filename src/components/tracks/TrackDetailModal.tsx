"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ConfirmBadge } from "@/components/common/ConfirmBadge";
import { Glyph } from "@/components/common/Glyph";
import { usePlayer } from "@/components/player/PlayerProvider";
import { useFavorites } from "@/hooks/useFavorites";
import { getSources, getStation } from "@/lib/catalog";
import { statusLabel } from "@/lib/format";
import type { Track } from "@/lib/types";
import { SourceButton } from "./SourceButton";

export function TrackDetailModal({
  track,
  onClose,
}: {
  track: Track;
  onClose: () => void;
}) {
  const { state, playTrack, addToQueue } = usePlayer();
  const { isTrackFavorite, toggleTrack } = useFavorites();
  const station = getStation(track.stationId);
  const sources = getSources(track);
  const canPlay = sources.some((source) => source.kind === "youtube" && source.embeddable);
  const isFavorite = isTrackFavorite(track.id);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="track-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="modal__close"
          onClick={onClose}
          aria-label="Cerrar ficha"
          autoFocus
        >
          ×
        </button>

        <div className="modal__body">
          <div
            className={`modal__art track-art--${track.artwork?.token ?? "pink"}`}
            aria-hidden="true"
          >
            <Glyph name={station?.glyph ?? "wave"} />
          </div>

          <div className="modal__info">
            <div className="modal__badges">
              <ConfirmBadge status={track.status} />
              <span className="modal__status">{statusLabel(track.status)}</span>
            </div>
            <h2 id="track-modal-title">{track.title}</h2>
            <p className="modal__artist">{track.artist}</p>

            <dl className="modal__facts">
              <div>
                <dt>Emisora</dt>
                <dd>
                  {station ? (
                    <Link href={`/emisoras/${station.id}`} onClick={onClose}>
                      {station.name}
                    </Link>
                  ) : (
                    "Del tráiler · emisora desconocida"
                  )}
                </dd>
              </div>
              {track.genre && (
                <div>
                  <dt>Género</dt>
                  <dd>{track.genre}</dd>
                </div>
              )}
              {track.album && (
                <div>
                  <dt>Álbum</dt>
                  <dd>{track.album}</dd>
                </div>
              )}
              {track.year !== null && (
                <div>
                  <dt>Año</dt>
                  <dd>{track.year}</dd>
                </div>
              )}
              {track.confirmedBy && (
                <div>
                  <dt>Confirmación</dt>
                  <dd>
                    <a href={track.confirmedBy} target="_blank" rel="noopener noreferrer">
                      Fuente oficial ↗
                    </a>
                  </dd>
                </div>
              )}
            </dl>

            <div className="modal__sources">
              <h3>Fuentes autorizadas</h3>
              {sources.map((source) => (
                <SourceButton key={source.id} source={source} />
              ))}
            </div>

            <div className="modal__actions">
              <button
                type="button"
                className="button button--primary button--small"
                onClick={() => {
                  playTrack(track.id, track.stationId);
                  onClose();
                }}
              >
                {canPlay ? "▶ Reproducir" : "↗ Abrir fuente oficial"}
              </button>
              <button
                type="button"
                className="button button--ghost button--small"
                onClick={() => toggleTrack(track.id)}
                aria-pressed={isFavorite}
              >
                {isFavorite ? "★ En favoritos" : "☆ Guardar"}
              </button>
              <button
                type="button"
                className="button button--ghost button--small"
                onClick={() => addToQueue(track.id, true)}
                disabled={state.queue.includes(track.id)}
              >
                {state.queue.includes(track.id) ? "✓ En cola" : "+ Agregar a cola"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
