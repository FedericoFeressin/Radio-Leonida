"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";
import { PlayerBar } from "@/components/layout/PlayerBar";
import { getPlayableSource, getSources, getStation, getStationTracks, getTrack } from "@/lib/catalog";
import { createEngine, type AudioEngine } from "@/lib/engines";
import { readStorage, writeStorage } from "@/lib/storage";
import type { PlayerState, RepeatMode } from "@/lib/types";
import { TrackDetailProvider } from "@/components/tracks/TrackDetailProvider";
import { initialPlayerState, playerReducer, type PlayerAction } from "./playerReducer";

interface PlayerContextValue {
  state: PlayerState;
  dispatch: Dispatch<PlayerAction>;
  playStation: (stationId: string) => void;
  playTrack: (trackId: string, stationId?: string | null) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  playQueueTrack: (trackId: string) => void;
  addToQueue: (trackId: string, next?: boolean) => void;
  moveQueueTrack: (trackId: string, direction: -1 | 1) => void;
  removeFromQueue: (trackId: string) => void;
  clearUpNext: () => void;
  toggleShuffle: () => void;
  setRepeat: (repeat: RepeatMode) => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  openSource: () => void;
  stageVisible: boolean;
  toggleStage: () => void;
}

function pickNextIndex(state: PlayerState): number | undefined {
  if (!state.shuffle || state.queue.length < 2) return undefined;
  const candidates = state.queue
    .map((_, index) => index)
    .filter((index) => index !== state.index);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function nextQueueIndex(state: PlayerState, randomIndex?: number): number {
  if (state.shuffle && randomIndex !== undefined) return randomIndex;
  const next = state.index + 1;
  if (next < state.queue.length) return next;
  return state.repeat === "off" ? state.index : 0;
}

function previousQueueIndex(state: PlayerState): number {
  if (state.index > 0) return state.index - 1;
  return state.repeat === "all" ? state.queue.length - 1 : 0;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer(): PlayerContextValue {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer debe usarse dentro de PlayerProvider");
  return context;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, initialPlayerState);
  const [stageVisible, setStageVisible] = useState(true);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<AudioEngine | null>(null);
  const shouldAutoplayRef = useRef(true);
  const stateRef = useRef(state);
  const volumeRef = useRef(state.volume);
  const mutedRef = useRef(state.muted);
  const currentTrackIdRef = useRef(state.currentTrackId);

  volumeRef.current = state.volume;
  mutedRef.current = state.muted;
  currentTrackIdRef.current = state.currentTrackId;
  stateRef.current = state;

  useEffect(() => {
    const volume = readStorage<number>("volume", 0.8);
    const preferences = readStorage<{
      shuffle?: boolean;
      repeat?: RepeatMode;
      history?: string[];
    }>("player-preferences", {});
    dispatch({
      type: "HYDRATE",
      volume: typeof volume === "number" && Number.isFinite(volume)
        ? Math.min(1, Math.max(0, volume))
        : 0.8,
      shuffle: preferences.shuffle === true,
      repeat: preferences.repeat === "one" || preferences.repeat === "all"
        ? preferences.repeat
        : "off",
      history: Array.isArray(preferences.history)
        ? preferences.history.filter((id) => Boolean(getTrack(id))).slice(0, 30)
        : [],
    });
    setPreferencesReady(true);
  }, []);

  useEffect(() => {
    if (!preferencesReady) return;
    writeStorage("volume", state.volume);
    writeStorage("player-preferences", {
      shuffle: state.shuffle,
      repeat: state.repeat,
      history: state.history,
    });
  }, [preferencesReady, state.volume, state.shuffle, state.repeat, state.history]);

  useEffect(() => {
    if (!stageVisible) return;
    const container = stageRef.current;
    const track = getTrack(currentTrackIdRef.current);
    if (!container || !track) return;

    const source = getPlayableSource(track);
    if (!source) {
      dispatch({
        type: "ENGINE_EVENT",
        event: "error",
        payload: { code: "no-source" },
      });
      return;
    }

    let engine: AudioEngine;
    try {
      engine = createEngine(source, container);
    } catch (error) {
      dispatch({
        type: "ENGINE_EVENT",
        event: "error",
        payload: {
          message: error instanceof Error ? error.message : "No se pudo iniciar el motor",
        },
      });
      return;
    }

    engineRef.current = engine;
    const unsubscribers = [
      engine.on("playing", () => dispatch({ type: "ENGINE_EVENT", event: "playing" })),
      engine.on("paused", () => dispatch({ type: "ENGINE_EVENT", event: "paused" })),
      engine.on("ended", () => {
        const current = stateRef.current;
        if (current.repeat === "one") {
          engine.seek(0);
          void engine.play();
          dispatch({ type: "SEEK", position: 0 });
          return;
        }
        const randomIndex = pickNextIndex(current);
        const targetIndex = nextQueueIndex(current, randomIndex);
        const stationId = getTrack(current.queue[targetIndex])?.stationId ?? null;
        dispatch({ type: "NEXT", randomIndex, stationId });
      }),
      engine.on("error", (payload) =>
        dispatch({ type: "ENGINE_EVENT", event: "error", payload }),
      ),
    ];

    engine.setVolume(volumeRef.current);
    engine.setMuted(mutedRef.current);
    engine.load(source, { autoplay: shouldAutoplayRef.current }).catch((error: unknown) => {
      dispatch({
        type: "ENGINE_EVENT",
        event: "error",
        payload: {
          message: error instanceof Error ? error.message : "No se pudo cargar la fuente",
        },
      });
    });

    const timer = window.setInterval(() => {
      if (engineRef.current !== engine) return;
      const duration = engine.getDuration();
      if (Number.isFinite(duration) && duration > 0) {
        dispatch({ type: "SET_DURATION", duration });
      }
      dispatch({ type: "SET_POSITION", position: engine.getPosition() });
    }, 500);

    return () => {
      window.clearInterval(timer);
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      engine.destroy();
      if (engineRef.current === engine) engineRef.current = null;
    };
  }, [state.currentTrackId, stageVisible]);

  useEffect(() => {
    engineRef.current?.setVolume(state.volume);
  }, [state.volume]);

  useEffect(() => {
    engineRef.current?.setMuted(state.muted);
  }, [state.muted]);

  const playStation = useCallback(
    (stationId: string) => {
      const station = getStation(stationId);
      if (!station) return;
      const stationTracks = getStationTracks(station);
      if (stationTracks.length === 0) return;
      // La cola continua sólo con temas que pueden sonar. Si ninguno tiene fuente
      // embebible, se muestra la primera y la UI ofrece el enlace autorizado.
      const playable = stationTracks.filter((track) => getPlayableSource(track));
      const queue = playable.length > 0 ? playable : stationTracks;
      const startTrack = queue[0];
      shouldAutoplayRef.current = true;
      if (!stageVisible) setStageVisible(true);
      dispatch({
        type: "PLAY_TRACK",
        trackId: startTrack.id,
        trackIds: queue.map((track) => track.id),
        stationId: station.id,
      });
    },
    [stageVisible],
  );

  const playTrack = useCallback(
    (trackId: string, stationId?: string | null) => {
      const track = getTrack(trackId);
      if (!track) return;
      const station = getStation(stationId ?? track.stationId);
      shouldAutoplayRef.current = true;
      if (!stageVisible) setStageVisible(true);
      dispatch({
        type: "PLAY_TRACK",
        trackId,
        trackIds: [trackId],
        stationId: station?.id ?? track.stationId ?? null,
      });
    },
    [stageVisible],
  );

  const playQueueTrack = useCallback(
    (trackId: string) => {
      if (!stateRef.current.queue.includes(trackId)) return;
      shouldAutoplayRef.current = true;
      if (!stageVisible) setStageVisible(true);
      dispatch({ type: "PLAY_QUEUE_TRACK", trackId, stationId: getTrack(trackId)?.stationId ?? null });
    },
    [stageVisible],
  );

  const addToQueue = useCallback((trackId: string, next = false) => {
    dispatch({ type: "ADD_TO_QUEUE", trackId, next });
  }, []);

  const moveQueueTrack = useCallback((trackId: string, direction: -1 | 1) => {
    dispatch({ type: "MOVE_IN_QUEUE", trackId, direction });
  }, []);

  const removeFromQueue = useCallback((trackId: string) => {
    const current = stateRef.current;
    const removedIndex = current.queue.indexOf(trackId);
    let stationId: string | null | undefined;
    if (current.currentTrackId === trackId) {
      shouldAutoplayRef.current = true;
      const remaining = current.queue.filter((id) => id !== trackId);
      const nextIndex = remaining.length > 0 ? Math.min(removedIndex, remaining.length - 1) : -1;
      stationId = nextIndex >= 0 ? getTrack(remaining[nextIndex]!)?.stationId ?? null : null;
    }
    dispatch({ type: "REMOVE_FROM_QUEUE", trackId, stationId });
  }, []);

  const clearUpNext = useCallback(() => {
    dispatch({ type: "CLEAR_UP_NEXT" });
  }, []);

  const toggleShuffle = useCallback(() => {
    dispatch({ type: "TOGGLE_SHUFFLE" });
  }, []);

  const setRepeat = useCallback((repeat: RepeatMode) => {
    dispatch({ type: "SET_REPEAT", repeat });
  }, []);

  const toggle = useCallback(() => {
    if (state.playback === "playing") {
      engineRef.current?.pause();
      dispatch({ type: "TOGGLE" });
      return;
    }
    if (state.playback === "error" || state.playback === "no-source" || state.playback === "external") {
      const track = getTrack(currentTrackIdRef.current);
      if (track) {
        const source = getSources(track)[0];
        if (source) window.open(source.url, "_blank", "noopener,noreferrer");
        dispatch({ type: "EXTERNAL" });
      }
      return;
    }
    shouldAutoplayRef.current = true;
    if (!stageVisible) setStageVisible(true);
    void engineRef.current?.play();
    dispatch({ type: "TOGGLE" });
  }, [state.playback, stageVisible]);

  const next = useCallback(() => {
    const current = stateRef.current;
    if (
      current.repeat === "off" &&
      !current.shuffle &&
      current.index >= current.queue.length - 1
    ) {
      shouldAutoplayRef.current = false;
      engineRef.current?.pause();
    } else {
      shouldAutoplayRef.current = true;
    }
    const randomIndex = pickNextIndex(current);
    const targetIndex = nextQueueIndex(current, randomIndex);
    const stationId = getTrack(current.queue[targetIndex])?.stationId ?? null;
    dispatch({ type: "NEXT", randomIndex, stationId });
  }, []);

  const prev = useCallback(() => {
    const current = stateRef.current;
    if (current.index <= 0 && current.repeat !== "all") {
      engineRef.current?.seek(0);
      dispatch({ type: "SEEK", position: 0 });
      return;
    }
    shouldAutoplayRef.current = true;
    const targetIndex = previousQueueIndex(current);
    const stationId = getTrack(current.queue[targetIndex])?.stationId ?? null;
    dispatch({ type: "PREV", stationId });
  }, []);

  const seek = useCallback((seconds: number) => {
    engineRef.current?.seek(seconds);
    dispatch({ type: "SEEK", position: seconds });
  }, []);

  const setVolume = useCallback((volume: number) => {
    dispatch({ type: "SET_VOLUME", volume });
  }, []);

  const toggleMute = useCallback(() => {
    dispatch({ type: "TOGGLE_MUTE" });
  }, []);

  const openSource = useCallback(() => {
    const track = getTrack(currentTrackIdRef.current);
    if (!track) return;
    const source = getSources(track)[0];
    if (!source) return;
    window.open(source.url, "_blank", "noopener,noreferrer");
    dispatch({ type: "EXTERNAL" });
  }, []);

  const toggleStage = useCallback(() => {
    if (stageVisible) {
      shouldAutoplayRef.current = false;
      engineRef.current?.pause();
      setStageVisible(false);
    } else {
      shouldAutoplayRef.current = state.playback === "playing";
      setStageVisible(true);
    }
  }, [stageVisible, state.playback]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
      if (document.querySelector('[role="dialog"]')) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        target.closest("input, textarea, select, button, a, [contenteditable='true'], [role='button']")
      ) return;

      switch (event.code === "Space" ? "space" : event.key.toLowerCase()) {
        case "space":
        case "k":
          event.preventDefault();
          toggle();
          break;
        case "n":
          event.preventDefault();
          next();
          break;
        case "p":
          event.preventDefault();
          prev();
          break;
        case "m":
          event.preventDefault();
          toggleMute();
          break;
        case "j":
          event.preventDefault();
          seek(Math.max(0, stateRef.current.position - 10));
          break;
        case "l":
          event.preventDefault();
          seek(Math.min(stateRef.current.duration, stateRef.current.position + 10));
          break;
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [toggle, next, prev, toggleMute, seek]);

  const value = useMemo<PlayerContextValue>(
    () => ({
      state,
      dispatch,
      playStation,
      playTrack,
      toggle,
      next,
      prev,
      playQueueTrack,
      addToQueue,
      moveQueueTrack,
      removeFromQueue,
      clearUpNext,
      toggleShuffle,
      setRepeat,
      seek,
      setVolume,
      toggleMute,
      openSource,
      stageVisible,
      toggleStage,
    }),
    [
      state,
      playStation,
      playTrack,
      toggle,
      next,
      prev,
      playQueueTrack,
      addToQueue,
      moveQueueTrack,
      removeFromQueue,
      clearUpNext,
      toggleShuffle,
      setRepeat,
      seek,
      setVolume,
      toggleMute,
      openSource,
      stageVisible,
      toggleStage,
    ],
  );

  return (
    <PlayerContext.Provider value={value}>
      <TrackDetailProvider>
        {children}
        <PlayerBar stageRef={stageRef} />
      </TrackDetailProvider>
    </PlayerContext.Provider>
  );
}
