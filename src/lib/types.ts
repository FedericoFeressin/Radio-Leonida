export type ConfirmationStatus =
  | "official"
  | "official-material"
  | "press-reported"
  | "trailer"
  | "rumor";

export type SourceKind =
  | "youtube"
  | "spotify"
  | "official-link"
  | "rockstar-preview";

export interface Source {
  id: string;
  kind: SourceKind;
  url: string;
  label: string;
  verifiedAt: string;
  embeddable: boolean;
  videoId?: string;
}

export interface Host {
  name: string;
  character?: string;
}

export interface Station {
  id: string;
  name: string;
  frequency: string | null;
  genre: string;
  genres: string[];
  description: string;
  hosts: Host[];
  status: ConfirmationStatus;
  trackIds: string[];
  previewUrl?: string;
  accent: AccentToken;
  glyph: GlyphName;
  confirmedBy?: string;
}

export type AccentToken = "pink" | "coral" | "orange" | "cyan" | "violet";
export type GlyphName = "wave" | "sun" | "pulse" | "bolt" | "disc" | "star" | "orbit";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  year: number | null;
  stationId: string | null;
  genre: string | null;
  status: ConfirmationStatus;
  sourceIds: string[];
  artwork: { kind: "gradient"; token: AccentToken } | null;
  confirmedBy?: string;
  confirmedAt?: string;
}

export type PlaybackStatus =
  | "idle"
  | "loading"
  | "playing"
  | "paused"
  | "ended"
  | "error"
  | "no-source"
  | "external";

export type RepeatMode = "off" | "all" | "one";

export interface PlayerState {
  queue: string[];
  index: number;
  currentTrackId: string | null;
  stationId: string | null;
  playback: PlaybackStatus;
  position: number;
  duration: number;
  volume: number;
  muted: boolean;
  error: string | null;
  shuffle: boolean;
  repeat: RepeatMode;
  history: string[];
}

export type EngineEvent = "ready" | "playing" | "paused" | "ended" | "error";
