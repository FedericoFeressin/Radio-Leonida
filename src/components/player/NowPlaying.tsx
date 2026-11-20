"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { Glyph } from "@/components/common/Glyph";
import { usePlayer } from "@/components/player/PlayerProvider";
import { getStation, getTrack } from "@/lib/catalog";
import { formatTime } from "@/lib/format";

const LABELS: Record<string, string> = {
  idle: "Señal en espera",
  loading: "Sintonizando",
  playing: "Sonando ahora",
  paused: "En pausa",
  ended: "Fin de cola",
  error: "Sin señal",
  "no-source": "Sin fuente",
  external: "Fuente externa",
};

export function NowPlaying() {
  const { state, toggle, next, prev } = usePlayer();
  const track = getTrack(state.currentTrackId);
  const station = getStation(state.stationId);

  if (!track) {
    return (
      <section className="now-playing now-playing--empty">
        <div className="now-playing__pulse" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className="eyebrow">CENTRO DE CONTROL</p>
        <h2>La señal está esperando</h2>
        <p>Elige una emisora y pon a Leonida a sonar. Nada arranca solo.</p>
        <Link className="button button--primary" href="/emisoras">
          Explorar emisoras →
        </Link>
      </section>
    );
  }

  const progress = state.duration > 0 ? (state.position / state.duration) * 100 : 0;

  return (
    <section className="now-playing" style={{ "--accent": `var(--${track.artwork?.token ?? "pink"})` } as CSSProperties}>
      <div className="now-playing__art" aria-hidden="true">
        <Glyph name={station?.glyph ?? "wave"} />
      </div>
      <div className="now-playing__body">
        <div className="now-playing__top">
          <span className="live-pill">
            <span className="live-dot" aria-hidden="true" />
            {LABELS[state.playback] ?? state.playback}
          </span>
          {station && <span className="now-playing__station">{station.name}</span>}
        </div>
        <h2>{track.title}</h2>
        <p className="now-playing__artist">{track.artist}</p>

        <div className="now-playing__progress" aria-hidden="true">
          <span style={{ width: `${Math.min(100, progress)}%` }} />
        </div>
        <div className="now-playing__times">
          <span>{formatTime(state.position)}</span>
          <span>{formatTime(state.duration)}</span>
        </div>

        <div className="now-playing__controls">
          <button type="button" className="icon-button" onClick={prev} aria-label="Anterior">
            ◀◀
          </button>
          <button
            type="button"
            className="play-button play-button--large"
            onClick={toggle}
            aria-label={state.playback === "playing" ? "Pausar" : "Reproducir"}
          >
            {state.playback === "playing" ? "❚❚" : "▶"}
          </button>
          <button type="button" className="icon-button" onClick={next} aria-label="Siguiente">
            ▶▶
          </button>
        </div>
        {state.error && <p className="now-playing__error">{state.error}</p>}
      </div>
    </section>
  );
}
