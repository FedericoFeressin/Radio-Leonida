"use client";

import type { CSSProperties, ReactNode, RefObject } from "react";
import { useCallback, useEffect, useState } from "react";
import { Glyph } from "@/components/common/Glyph";
import { usePlayer } from "@/components/player/PlayerProvider";
import { useTrackDetail } from "@/components/tracks/TrackDetailProvider";
import { getStation, getTrack } from "@/lib/catalog";
import { formatTime } from "@/lib/format";
import type { PlaybackStatus, RepeatMode, Track } from "@/lib/types";

type IconName =
  | "play"
  | "pause"
  | "prev"
  | "next"
  | "volume"
  | "mute"
  | "info"
  | "external"
  | "shuffle"
  | "repeat"
  | "queue"
  | "expand"
  | "close"
  | "plus";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    play: <path d="M7 4.5v15l13-7.5-13-7.5Z" fill="currentColor" stroke="none" />,
    pause: (
      <g fill="currentColor" stroke="none">
        <rect x="6" y="4" width="4" height="16" rx="1" />
        <rect x="14" y="4" width="4" height="16" rx="1" />
      </g>
    ),
    prev: (
      <g fill="currentColor" stroke="none">
        <rect x="4" y="4" width="3.5" height="16" rx="1" />
        <path d="M20 4.5v15L8 12l12-7.5Z" />
      </g>
    ),
    next: (
      <g fill="currentColor" stroke="none">
        <rect x="16.5" y="4" width="3.5" height="16" rx="1" />
        <path d="M4 4.5v15L16 12 4 4.5Z" />
      </g>
    ),
    volume: (
      <>
        <path d="M4 9h4l5-4v14l-5-4H4V9Z" fill="currentColor" stroke="none" />
        <path d="M16 8c2 2 2 6 0 8M19 5c3.5 3.5 3.5 10.5 0 14" />
      </>
    ),
    mute: (
      <>
        <path d="M4 9h4l5-4v14l-5-4H4V9Z" fill="currentColor" stroke="none" />
        <path d="m16 9 6 6m0-6-6 6" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6M12 7.5v.5" />
      </>
    ),
    external: (
      <>
        <path d="M13 4h7v7M20 4l-9 9" />
        <path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />
      </>
    ),
    shuffle: <path d="M16 3h5v5M4 20 20 4M21 16v5h-5M4 4l5 5m4 4 4 4" />,
    repeat: <path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4m14-1v2a3 3 0 0 1-3 3H3" />,
    queue: <><path d="M4 6h16M4 12h10M4 18h10" /><path d="m17 16 4 3-4 3z" fill="currentColor" stroke="none" /></>,
    expand: <><path d="M8 3H3v5M16 3h5v5M3 16v5h5m13-5v5h-5" /><path d="m3 3 6 6m12-6-6 6M3 21l6-6m12 6-6-6" /></>,
    close: <path d="m5 5 14 14M19 5 5 19" />,
    plus: <path d="M12 5v14M5 12h14" />,
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className="icon"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}

const STATUS_TEXT: Record<PlaybackStatus, string> = {
  idle: "En espera",
  loading: "Sintonizando",
  playing: "Al aire",
  paused: "En pausa",
  ended: "Fin de cola",
  error: "Sin señal",
  "no-source": "Sin fuente",
  external: "Fuente externa",
};

function QueuePanel({ onClose, expanded = false }: { onClose: () => void; expanded?: boolean }) {
  const { state, playQueueTrack, removeFromQueue, moveQueueTrack, clearUpNext, playTrack } = usePlayer();
  const queueTracks = state.queue
    .map((id, index) => ({ track: getTrack(id), index }))
    .filter((item): item is { track: Track; index: number } => Boolean(item.track));
  const historyTracks = state.history
    .map((id) => getTrack(id))
    .filter((track): track is Track => Boolean(track));

  return (
    <section className={`queue-panel ${expanded ? "queue-panel--expanded" : ""}`} aria-label="Cola e historial">
      <div className="queue-panel__head">
        <div className="queue-panel__title">
          <p className="eyebrow">EN ESPERA</p>
          <h2>Cola <span>{queueTracks.length}</span></h2>
        </div>
        <button type="button" className="icon-button queue-panel__close" onClick={onClose} aria-label="Cerrar cola">
          <Icon name="close" />
        </button>
      </div>
      <p className="queue-panel__label">REPRODUCCIÓN ACTUAL Y SIGUIENTES</p>
      {queueTracks.length > 0 ? (
        <ol className="queue-panel__list">
          {queueTracks.map(({ track, index }) => {
            const current = track.id === state.currentTrackId;
            return (
              <li key={track.id} className={`queue-item ${current ? "is-current" : ""}`}>
                <button
                  type="button"
                  className="queue-item__select"
                  onClick={() => playQueueTrack(track.id)}
                  aria-current={current ? "true" : undefined}
                >
                  <span className="queue-item__index">{current ? "♪" : String(index + 1).padStart(2, "0")}</span>
                  <span className="queue-item__text">
                    <strong>{track.title}</strong>
                    <span>{track.artist}{current ? " · Sonando" : ""}</span>
                  </span>
                </button>
                {!current && (
                  <div className="queue-item__reorder" aria-label={`Ordenar ${track.title}`}>
                    <button type="button" onClick={() => moveQueueTrack(track.id, -1)} disabled={state.shuffle || index <= state.index + 1} aria-label={`Subir ${track.title}`} title="Subir en la cola">↑</button>
                    <button type="button" onClick={() => moveQueueTrack(track.id, 1)} disabled={state.shuffle || index >= state.queue.length - 1} aria-label={`Bajar ${track.title}`} title="Bajar en la cola">↓</button>
                  </div>
                )}
                <button
                  type="button"
                  className="queue-item__remove"
                  onClick={() => removeFromQueue(track.id)}
                  aria-label={`Quitar ${track.title} de la cola`}
                  title="Quitar de la cola"
                >
                  <Icon name="close" />
                </button>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="queue-panel__empty">La cola está vacía. Agrega canciones desde la biblioteca o una emisora.</p>
      )}
      {queueTracks.length > 0 && (
        <button type="button" className="queue-panel__clear" onClick={clearUpNext} disabled={state.currentTrackId ? queueTracks.length < 2 : queueTracks.length === 0}>
          {state.currentTrackId ? "Vaciar siguientes" : "Vaciar cola"}
        </button>
      )}
      <div className="queue-panel__history">
        <p className="queue-panel__label">RECIENTES</p>
        {historyTracks.length > 0 ? (
          <ul className="queue-panel__recent-list">
            {historyTracks.slice(0, 5).map((track) => (
              <li key={track.id}>
                <button type="button" onClick={() => playTrack(track.id, track.stationId)}>
                  <strong>{track.title}</strong><span>{track.artist}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="queue-panel__empty queue-panel__empty--recent">Las canciones que reproduzcas aparecerán aquí.</p>
        )}
      </div>
    </section>
  );
}

function repeatLabel(mode: RepeatMode): string {
  if (mode === "one") return "Repetir canción";
  if (mode === "all") return "Repetir cola";
  return "Activar repetición";
}

function ExpandedPlayer({
  onClose,
  queueOpen,
  toggleQueue,
}: {
  onClose: () => void;
  queueOpen: boolean;
  toggleQueue: () => void;
}) {
  const { state, toggle, next, prev, seek, setVolume, toggleMute, toggleShuffle, setRepeat } = usePlayer();
  const track = getTrack(state.currentTrackId);
  const station = getStation(state.stationId);
  const progress = state.duration > 0 ? Math.min(100, (state.position / state.duration) * 100) : 0;
  const cycleRepeat = () => setRepeat(state.repeat === "off" ? "all" : state.repeat === "all" ? "one" : "off");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="player-expanded__backdrop" onMouseDown={onClose}>
      <section className="player-expanded" role="dialog" aria-modal="true" aria-label="Reproductor expandido" onMouseDown={(event) => event.stopPropagation()}>
        <div className="player-expanded__header">
          <div><p className="eyebrow">RADIO LEONIDA</p><span>{station?.name ?? "CENTRO DE REPRODUCCIÓN"}</span></div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Cerrar reproductor"><Icon name="close" /></button>
        </div>
        <div className={`player-expanded__art track-art--${track?.artwork?.token ?? "pink"}`} aria-hidden="true">
          <Glyph name={station?.glyph ?? "wave"} /><span className="player-expanded__art-label">VICE CITY · ON AIR</span>
        </div>
        <div className="player-expanded__track">
          <span className="live-pill"><span className="live-dot" />{STATUS_TEXT[state.playback]}</span>
          <h2>{track?.title ?? "Nada en el aire"}</h2>
          <p>{track?.artist ?? "Elige una canción o emisora para empezar"}</p>
        </div>
        <div className="player-progress player-expanded__progress">
          <span className="player-time">{formatTime(state.position)}</span>
          <input type="range" className="range range--progress" min={0} max={Math.max(state.duration, 1)} step={0.1} value={Math.min(state.position, state.duration || 1)} onChange={(event) => seek(Number(event.target.value))} disabled={!track || state.duration === 0} aria-label="Progreso de la canción" style={{ "--fill": `${progress}%` } as CSSProperties} />
          <span className="player-time">{formatTime(state.duration)}</span>
        </div>
        <div className="player-expanded__controls">
          <button type="button" className={`icon-button player-mode-button ${state.shuffle ? "is-on" : ""}`} onClick={toggleShuffle} aria-pressed={state.shuffle} aria-label={state.shuffle ? "Desactivar aleatorio" : "Activar aleatorio"}><Icon name="shuffle" /></button>
          <button type="button" className="icon-button" onClick={prev} disabled={state.queue.length === 0} aria-label="Canción anterior"><Icon name="prev" /></button>
          <button type="button" className={`play-button ${state.playback === "playing" ? "is-playing" : ""}`} onClick={toggle} disabled={!track} aria-label={state.playback === "playing" ? "Pausar" : "Reproducir"}><Icon name={state.playback === "playing" ? "pause" : "play"} /></button>
          <button type="button" className="icon-button" onClick={next} disabled={state.queue.length === 0} aria-label="Canción siguiente"><Icon name="next" /></button>
          <button type="button" className={`icon-button player-mode-button ${state.repeat !== "off" ? "is-on" : ""}`} onClick={cycleRepeat} aria-label={repeatLabel(state.repeat)} title={repeatLabel(state.repeat)}><Icon name="repeat" />{state.repeat === "one" && <span className="repeat-one-mark">1</span>}</button>
        </div>
        <div className="player-expanded__tools">
          <div className="volume-control">
            <button type="button" className="icon-button" onClick={toggleMute} aria-label={state.muted ? "Activar sonido" : "Silenciar"}><Icon name={state.muted || state.volume === 0 ? "mute" : "volume"} /></button>
            <input type="range" className="range range--volume" min={0} max={1} step={0.01} value={state.muted ? 0 : state.volume} onChange={(event) => setVolume(Number(event.target.value))} aria-label="Volumen" style={{ "--fill": `${(state.muted ? 0 : state.volume) * 100}%` } as CSSProperties} />
          </div>
          <button type="button" className={`button button--ghost button--small ${queueOpen ? "is-selected" : ""}`} onClick={toggleQueue}><Icon name="queue" /> Cola y recientes</button>
        </div>
        <p className="player-expanded__shortcuts">Atajos: <kbd>Espacio</kbd> reproducir · <kbd>N</kbd> siguiente · <kbd>P</kbd> anterior · <kbd>M</kbd> silenciar · <kbd>J/L</kbd> buscar 10 s</p>
        {queueOpen && <QueuePanel expanded onClose={toggleQueue} />}
      </section>
    </div>
  );
}

export function PlayerBar({
  stageRef,
}: {
  stageRef: RefObject<HTMLDivElement | null>;
}) {
  const [queueOpen, setQueueOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const closeExpanded = useCallback(() => setExpanded(false), []);
  const {
    state,
    toggle,
    next,
    prev,
    seek,
    setVolume,
    toggleMute,
    openSource,
    stageVisible,
    toggleStage,
    toggleShuffle,
    setRepeat,
  } = usePlayer();
  const { openTrack } = useTrackDetail();
  const track = getTrack(state.currentTrackId);
  const station = getStation(state.stationId);
  const token = track?.artwork?.token ?? "pink";
  const progress =
    state.duration > 0 ? Math.min(100, (state.position / state.duration) * 100) : 0;
  const needsSource = state.playback === "error" || state.playback === "no-source";
  const cycleRepeat = () => setRepeat(state.repeat === "off" ? "all" : state.repeat === "all" ? "one" : "off");
  const toggleQueue = () => setQueueOpen((open) => !open);

  return (
    <>
      {stageVisible ? (
        <aside className="mini-stage" aria-label="Vídeo de la reproducción actual">
          <div className="mini-stage__top">
            <span className="mini-stage__label">
              <span className="live-dot" aria-hidden="true" /> LIVE FEED
            </span>
            <button
              type="button"
              className="mini-stage__close"
              onClick={toggleStage}
              aria-label="Ocultar vídeo y pausar"
              title="Ocultar vídeo y pausar"
            >
              −
            </button>
          </div>
          <div className="mini-stage__screen">
            <div ref={stageRef} className="mini-stage__target" />
            {!track && (
              <div className="mini-stage__placeholder">
                <Glyph name="pulse" className="mini-stage__glyph" />
                <strong>SIN SEÑAL</strong>
                <span>Sintoniza una emisora</span>
              </div>
            )}
          </div>
        </aside>
      ) : (
        <button type="button" className="stage-reopen" onClick={toggleStage}>
          <Icon name="play" /> Ver vídeo
        </button>
      )}

      {expanded && <ExpandedPlayer onClose={closeExpanded} queueOpen={queueOpen} toggleQueue={toggleQueue} />}

      <footer className="player-bar" aria-label="Reproductor">
        {queueOpen && !expanded && <QueuePanel onClose={() => setQueueOpen(false)} />}
        <div className="player-bar__inner">
          <div className="player-track" style={{ "--track-accent": `var(--${token})` } as CSSProperties}>
            <div className={`track-art track-art--${token}`} aria-hidden="true">
              {station ? <Glyph name={station.glyph} className="track-art__glyph" /> : <Glyph name="wave" className="track-art__glyph" />}
            </div>
            <div className="player-track__text">
              <strong>{track ? track.title : "Nada en el aire"}</strong>
              <span>{track ? track.artist : "Elige una emisora para empezar"}</span>
            </div>
            {track && (
              <button
                type="button"
                className="icon-button player-track__info"
                onClick={() => openTrack(track)}
                aria-label="Ver ficha de la canción"
                title="Ver ficha"
              >
                <Icon name="info" />
              </button>
            )}
            <button type="button" className={`icon-button player-track__queue ${queueOpen ? "is-on" : ""}`} onClick={toggleQueue} aria-label={`Abrir cola de reproducción, ${state.queue.length} canciones`} title="Cola y recientes">
              <Icon name="queue" /><span>{state.queue.length}</span>
            </button>
            <button type="button" className="icon-button player-track__expand" onClick={() => setExpanded(true)} aria-label="Expandir reproductor" title="Expandir reproductor">
              <Icon name="expand" />
            </button>
          </div>

          <div className="player-center">
            <div className="player-controls">
              <button
                type="button"
                className={`icon-button player-mode-button ${state.shuffle ? "is-on" : ""}`}
                onClick={toggleShuffle}
                aria-pressed={state.shuffle}
                aria-label={state.shuffle ? "Desactivar aleatorio" : "Activar aleatorio"}
                title={state.shuffle ? "Aleatorio activado" : "Activar aleatorio"}
              >
                <Icon name="shuffle" />
              </button>
              <button
                type="button"
                className="icon-button"
                onClick={prev}
                disabled={state.queue.length === 0}
                aria-label="Canción anterior"
                title="Anterior"
              >
                <Icon name="prev" />
              </button>
              <button
                type="button"
                className={`play-button ${state.playback === "playing" ? "is-playing" : ""}`}
                onClick={toggle}
                disabled={!track}
                aria-label={state.playback === "playing" ? "Pausar" : "Reproducir"}
              >
                <Icon name={state.playback === "playing" ? "pause" : "play"} />
              </button>
              <button
                type="button"
                className="icon-button"
                onClick={next}
                disabled={state.queue.length === 0}
                aria-label="Canción siguiente"
                title="Siguiente"
              >
                <Icon name="next" />
              </button>
              <button
                type="button"
                className={`icon-button player-mode-button ${state.repeat !== "off" ? "is-on" : ""}`}
                onClick={cycleRepeat}
                aria-label={repeatLabel(state.repeat)}
                title={repeatLabel(state.repeat)}
              >
                <Icon name="repeat" />
                {state.repeat === "one" && <span className="repeat-one-mark">1</span>}
              </button>
            </div>

            <div className="player-progress">
              <span className="player-time">{formatTime(state.position)}</span>
              <input
                type="range"
                className="range range--progress"
                min={0}
                max={Math.max(state.duration, 1)}
                step={0.1}
                value={Math.min(state.position, state.duration || 1)}
                onChange={(event) => seek(Number(event.target.value))}
                disabled={!track || state.duration === 0}
                aria-label="Progreso de la canción"
                style={{ "--fill": `${progress}%` } as CSSProperties}
              />
              <span className="player-time">{formatTime(state.duration)}</span>
            </div>
          </div>

          <div className="player-right">
            <span
              className={`playback-status playback-status--${state.playback}`}
              aria-live="polite"
            >
              <span className="playback-status__dot" aria-hidden="true" />
              {STATUS_TEXT[state.playback]}
            </span>
            {needsSource && (
              <button type="button" className="source-chip" onClick={openSource}>
                <Icon name="external" /> Abrir fuente oficial
              </button>
            )}
            <div className="volume-control">
              <button
                type="button"
                className="icon-button"
                onClick={toggleMute}
                aria-label={state.muted ? "Activar sonido" : "Silenciar"}
                title={state.muted ? "Activar sonido" : "Silenciar"}
              >
                <Icon name={state.muted || state.volume === 0 ? "mute" : "volume"} />
              </button>
              <input
                type="range"
                className="range range--volume"
                min={0}
                max={1}
                step={0.01}
                value={state.muted ? 0 : state.volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                aria-label="Volumen"
                style={{ "--fill": `${(state.muted ? 0 : state.volume) * 100}%` } as CSSProperties}
              />
            </div>
          </div>
        </div>
        {state.error && (
          <p className="player-error" role="status">
            {state.error}
          </p>
        )}
      </footer>
    </>
  );
}
