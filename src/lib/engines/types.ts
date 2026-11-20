import type { EngineEvent, Source } from "../types";

export interface AudioEngine {
  load(source: Source, options?: { autoplay?: boolean }): Promise<void>;
  play(): Promise<void>;
  pause(): void;
  seek(seconds: number): void;
  setVolume(volume: number): void;
  setMuted(muted: boolean): void;
  getPosition(): number;
  getDuration(): number;
  destroy(): void;
  on(event: EngineEvent, callback: (payload?: unknown) => void): () => void;
}
