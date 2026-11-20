import type { EngineEvent, Source } from "../types";
import type { AudioEngine } from "./types";

/**
 * Motor de fallback: no reproduce audio, abre la fuente autorizada en otra pestaña.
 * Se usa cuando una canción no tiene un vídeo embebible verificado.
 */
export class ExternalEngine implements AudioEngine {
  private source: Source | null = null;
  private listeners = new Map<EngineEvent, Set<(payload?: unknown) => void>>();

  async load(source: Source): Promise<void> {
    this.source = source;
    this.emit("ready");
  }

  async play(): Promise<void> {
    if (!this.source) return;
    window.open(this.source.url, "_blank", "noopener,noreferrer");
  }

  pause(): void {
    // No hay audio propio que pausar.
  }

  seek(): void {
    // No aplica.
  }

  setVolume(): void {
    // No aplica.
  }

  setMuted(): void {
    // No aplica.
  }

  getPosition(): number {
    return 0;
  }

  getDuration(): number {
    return 0;
  }

  destroy(): void {
    this.source = null;
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
