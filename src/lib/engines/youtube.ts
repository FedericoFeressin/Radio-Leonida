import type { EngineEvent, Source } from "../types";
import type { AudioEngine } from "./types";

type PlayerStateCode = -1 | 0 | 1 | 2 | 3 | 5;

interface YTPlayer {
  cueVideoById(videoId: string): void;
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(volume: number): void;
  mute(): void;
  unMute(): void;
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
}

interface YTNamespace {
  Player: new (
    element: HTMLElement,
    options: {
      width: string;
      height: string;
      videoId: string;
      playerVars: Record<string, string | number>;
      events: {
        onReady: (event: { target: YTPlayer }) => void;
        onStateChange: (event: { data: PlayerStateCode }) => void;
        onError: (event: { data: number }) => void;
      };
    },
  ) => YTPlayer;
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const API_URL = "https://www.youtube.com/iframe_api";
let apiPromise: Promise<YTNamespace> | null = null;

function loadYouTubeApi(): Promise<YTNamespace> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube requiere un navegador"));
  }
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<YTNamespace>((resolve, reject) => {
    const timeout = window.setTimeout(
      () => reject(new Error("Tiempo de espera agotado al cargar YouTube IFrame API")),
      15000,
    );
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      window.clearTimeout(timeout);
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error("YouTube IFrame API no disponible"));
    };

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${API_URL}"]`,
    );
    if (existing) {
      existing.addEventListener(
        "error",
        () => {
          window.clearTimeout(timeout);
          reject(new Error("No se pudo cargar YouTube IFrame API"));
        },
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = API_URL;
    script.async = true;
    script.onerror = () => {
      window.clearTimeout(timeout);
      reject(new Error("No se pudo cargar YouTube IFrame API"));
    };
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    document.querySelector(`script[src="${API_URL}"]`)?.remove();
    apiPromise = null;
    throw error;
  });

  return apiPromise;
}

/**
 * Motor principal. El <div> del player permanece visible (≥200×200 px)
 * para cumplir con los requisitos de YouTube IFrame API.
 */
export class YouTubeEngine implements AudioEngine {
  private player: YTPlayer | null = null;
  private ready = false;
  private muted = false;
  private volume = 0.8;
  private pendingAutoplay = false;
  private destroyed = false;
  private listeners = new Map<EngineEvent, Set<(payload?: unknown) => void>>();

  constructor(private readonly container: HTMLElement) {}

  async load(source: Source, options?: { autoplay?: boolean }): Promise<void> {
    if (!source.videoId) throw new Error("Fuente sin identificador de vídeo");
    this.pendingAutoplay = Boolean(options?.autoplay);
    const YT = await loadYouTubeApi();

    // React puede destruir el motor mientras la API sigue cargando.
    if (this.destroyed) return;

    if (!this.player) {
      this.player = new YT.Player(this.container, {
        width: "100%",
        height: "100%",
        videoId: source.videoId,
        playerVars: {
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            this.ready = true;
            this.player?.setVolume(this.muted ? 0 : Math.round(this.volume * 100));
            this.emit("ready");
            if (this.pendingAutoplay) {
              this.pendingAutoplay = false;
              void this.play();
            }
          },
          onStateChange: ({ data }) => {
            if (data === 1) this.emit("playing");
            if (data === 2) this.emit("paused");
            if (data === 0) this.emit("ended");
          },
          onError: ({ data }) => {
            this.emit("error", { code: data });
          },
        },
      });
    } else {
      // cue = cargar sin reproducir; el usuario ya habilitó el autoplay con su click.
      this.player.cueVideoById(source.videoId);
      if (this.pendingAutoplay) {
        this.pendingAutoplay = false;
        await this.play();
      }
    }
  }

  async play(): Promise<void> {
    if (!this.player || !this.ready) return;
    this.player.playVideo();
  }

  pause(): void {
    this.player?.pauseVideo();
  }

  seek(seconds: number): void {
    if (!this.player || !this.ready) return;
    this.player.seekTo(Math.max(0, seconds), true);
  }

  setVolume(volume: number): void {
    this.volume = Math.min(1, Math.max(0, volume));
    if (!this.player || !this.ready) return;
    this.player.setVolume(Math.round(this.volume * 100));
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (!this.player || !this.ready) return;
    if (muted) this.player.mute();
    else this.player.unMute();
  }

  getPosition(): number {
    return this.player && this.ready ? this.player.getCurrentTime() : 0;
  }

  getDuration(): number {
    return this.player && this.ready ? this.player.getDuration() : 0;
  }

  destroy(): void {
    this.destroyed = true;
    this.player?.destroy();
    this.player = null;
    this.ready = false;
    this.listeners.clear();
  }

  on(event: EngineEvent, callback: (payload?: unknown) => void): () => void {
    const set = this.listeners.get(event) ?? new Set();
    set.add(callback);
    this.listeners.set(event, set);
    return () => set.delete(callback);
  }

  private emit(event: EngineEvent, payload?: unknown): void {
    this.listeners.get(event)?.forEach((callback) => callback(payload));
  }
}
