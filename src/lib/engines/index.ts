import type { Source } from "../types";
import { ExternalEngine } from "./external";
import type { AudioEngine } from "./types";
import { YouTubeEngine } from "./youtube";

/**
 * Factoría: elige el motor según la fuente verificada.
 * Nunca se elude una restricción de embed: si no es embebible, se abre la fuente oficial.
 */
export function createEngine(source: Source, container: HTMLElement): AudioEngine {
  if (source.kind === "youtube" && source.embeddable && source.videoId) {
    return new YouTubeEngine(container);
  }
  return new ExternalEngine();
}

export type { AudioEngine } from "./types";
