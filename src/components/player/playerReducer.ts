import type { EngineEvent, PlayerState, RepeatMode } from "@/lib/types";

export const initialPlayerState: PlayerState = {
  queue: [],
  index: -1,
  currentTrackId: null,
  stationId: null,
  playback: "idle",
  position: 0,
  duration: 0,
  volume: 0.8,
  muted: false,
  error: null,
  shuffle: false,
  repeat: "off",
  history: [],
};

export interface EngineErrorPayload {
  code?: number | string;
  message?: string;
}

export type PlayerAction =
  | { type: "HYDRATE"; volume: number; shuffle?: boolean; repeat?: RepeatMode; history?: string[] }
  | { type: "PLAY_STATION"; stationId: string; trackIds: string[] }
  | { type: "PLAY_TRACK"; trackId: string; trackIds: string[]; stationId: string | null }
  | { type: "TOGGLE" }
  | { type: "NEXT"; randomIndex?: number; stationId?: string | null }
  | { type: "PREV"; stationId?: string | null }
  | { type: "PLAY_QUEUE_TRACK"; trackId: string; stationId: string | null }
  | { type: "ADD_TO_QUEUE"; trackId: string; next: boolean }
  | { type: "REMOVE_FROM_QUEUE"; trackId: string; stationId?: string | null }
  | { type: "MOVE_IN_QUEUE"; trackId: string; direction: -1 | 1 }
  | { type: "CLEAR_UP_NEXT" }
  | { type: "TOGGLE_SHUFFLE" }
  | { type: "SET_REPEAT"; repeat: RepeatMode }
  | { type: "SEEK"; position: number }
  | { type: "SET_VOLUME"; volume: number }
  | { type: "TOGGLE_MUTE" }
  | { type: "SET_POSITION"; position: number }
  | { type: "SET_DURATION"; duration: number }
  | { type: "EXTERNAL" }
  | { type: "ENGINE_EVENT"; event: EngineEvent; payload?: unknown };

const YT_ERRORS: Record<number, string> = {
  2: "El identificador del vídeo no es válido.",
  5: "Este vídeo no se puede reproducir en HTML5.",
  100: "El vídeo ya no está disponible.",
  101: "El propietario no permite la reproducción embebida.",
  150: "El propietario no permite la reproducción embebida.",
};

function errorMessage(payload: unknown): string {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object") {
    const data = payload as EngineErrorPayload;
    if (data.message) return data.message;
    if (data.code === "no-source") {
      return "Esta canción no tiene una fuente embebible verificada.";
    }
    if (typeof data.code === "number" && YT_ERRORS[data.code]) {
      return YT_ERRORS[data.code];
    }
  }
  return "No se pudo reproducir esta fuente.";
}

function withHistory(state: PlayerState, trackId: string | null): string[] {
  if (!trackId) return state.history;
  return [trackId, ...state.history.filter((id) => id !== trackId)].slice(0, 30);
}

function move(state: PlayerState, delta: number, randomIndex?: number, stationId?: string | null): PlayerState {
  if (state.queue.length === 0) return state;
  let index = state.index + delta;
  if (delta > 0 && state.shuffle && state.queue.length > 1) {
    index = randomIndex ?? (state.index + 1) % state.queue.length;
  } else if (index >= state.queue.length) {
    if (state.repeat === "off") return { ...state, playback: "ended" };
    index = 0;
  } else if (index < 0) {
    index = state.repeat === "all" ? state.queue.length - 1 : 0;
  }
  const trackId = state.queue[index] ?? null;
  return {
    ...state,
    index,
    currentTrackId: trackId,
    stationId: stationId === undefined ? state.stationId : stationId,
    playback: "loading",
    position: 0,
    duration: 0,
    error: null,
    history: withHistory(state, trackId),
  };
}

export function playerReducer(
  state: PlayerState,
  action: PlayerAction,
): PlayerState {
  switch (action.type) {
    case "HYDRATE":
      return {
        ...state,
        volume: action.volume,
        shuffle: action.shuffle ?? state.shuffle,
        repeat: action.repeat ?? state.repeat,
        history: action.history ?? state.history,
      };

    case "PLAY_STATION": {
      if (action.trackIds.length === 0) return state;
      return {
        ...state,
        queue: action.trackIds,
        index: 0,
        currentTrackId: action.trackIds[0] ?? null,
        stationId: action.stationId,
        playback: "loading",
        position: 0,
        duration: 0,
        error: null,
        history: withHistory(state, action.trackIds[0] ?? null),
      };
    }

    case "PLAY_TRACK": {
      const index = action.trackIds.indexOf(action.trackId);
      const queue = index >= 0 ? action.trackIds : [action.trackId];
      return {
        ...state,
        queue,
        index: index >= 0 ? index : 0,
        currentTrackId: action.trackId,
        stationId: action.stationId,
        playback: "loading",
        position: 0,
        duration: 0,
        error: null,
        history: withHistory(state, action.trackId),
      };
    }

    case "TOGGLE":
      if (!state.currentTrackId) return state;
      if (state.playback === "playing") {
        return { ...state, playback: "paused" };
      }
      if (state.playback === "error" || state.playback === "no-source" || state.playback === "external") {
        return state;
      }
      return { ...state, playback: "playing", error: null };

    case "NEXT":
      return move(state, 1, action.randomIndex, action.stationId);

    case "PREV":
      return move(state, -1, undefined, action.stationId);

    case "PLAY_QUEUE_TRACK": {
      const index = state.queue.indexOf(action.trackId);
      if (index < 0) return state;
      return {
        ...state,
        index,
        currentTrackId: action.trackId,
        stationId: action.stationId,
        playback: "loading",
        position: 0,
        duration: 0,
        error: null,
        history: withHistory(state, action.trackId),
      };
    }

    case "ADD_TO_QUEUE": {
      if (state.queue.includes(action.trackId)) return state;
      const queue = [...state.queue];
      const insertionIndex = action.next && state.index >= 0 ? state.index + 1 : queue.length;
      queue.splice(insertionIndex, 0, action.trackId);
      return { ...state, queue };
    }

    case "REMOVE_FROM_QUEUE": {
      const removedIndex = state.queue.indexOf(action.trackId);
      if (removedIndex < 0) return state;
      const queue = state.queue.filter((id) => id !== action.trackId);
      if (queue.length === 0) {
        return {
          ...state,
          queue,
          index: -1,
          currentTrackId: null,
          stationId: null,
          playback: "idle",
          position: 0,
          duration: 0,
          error: null,
        };
      }
      if (removedIndex === state.index) {
        const index = Math.min(removedIndex, queue.length - 1);
        return {
          ...state,
          queue,
          index,
          currentTrackId: queue[index] ?? null,
          stationId: action.stationId === undefined ? state.stationId : action.stationId,
          playback: "loading",
          position: 0,
          duration: 0,
          error: null,
        };
      }
      return {
        ...state,
        queue,
        index: removedIndex < state.index ? state.index - 1 : state.index,
      };
    }

    case "MOVE_IN_QUEUE": {
      const from = state.queue.indexOf(action.trackId);
      const floor = state.currentTrackId ? state.index + 1 : 0;
      const to = from + action.direction;
      if (from < floor || to < floor || to >= state.queue.length) return state;
      const queue = [...state.queue];
      [queue[from], queue[to]] = [queue[to]!, queue[from]!];
      return { ...state, queue };
    }

    case "CLEAR_UP_NEXT": {
      if (!state.currentTrackId) return { ...state, queue: [], index: -1 };
      return { ...state, queue: [state.currentTrackId], index: 0 };
    }

    case "TOGGLE_SHUFFLE":
      return { ...state, shuffle: !state.shuffle };

    case "SET_REPEAT":
      return { ...state, repeat: action.repeat };

    case "SEEK":
      return { ...state, position: Math.max(0, action.position) };

    case "SET_POSITION":
      return { ...state, position: action.position };

    case "SET_DURATION":
      return { ...state, duration: action.duration };

    case "SET_VOLUME":
      return {
        ...state,
        volume: Math.min(1, Math.max(0, action.volume)),
        muted: false,
      };

    case "TOGGLE_MUTE":
      return { ...state, muted: !state.muted };

    case "EXTERNAL":
      return { ...state, playback: "external" };

    case "ENGINE_EVENT":
      switch (action.event) {
        case "playing":
          return { ...state, playback: "playing", error: null };
        case "paused":
          return state.playback === "playing" ? { ...state, playback: "paused" } : state;
        case "ended":
          return move(state, 1);
        case "ready":
          return state;
        case "error": {
          const payload = action.payload as EngineErrorPayload | undefined;
          const noSource = payload?.code === "no-source";
          return {
            ...state,
            playback: noSource ? "no-source" : "error",
            error: errorMessage(action.payload),
          };
        }
        default:
          return state;
      }

    default:
      return state;
  }
}
