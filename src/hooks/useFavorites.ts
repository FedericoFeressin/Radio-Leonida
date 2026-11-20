"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { readStorage, writeStorage } from "@/lib/storage";

const KEY = "favorites";
const EVENT = "gta6radio:favorites";

interface FavoritesData {
  tracks: string[];
  stations: string[];
}

const EMPTY: FavoritesData = { tracks: [], stations: [] };

type Toggle = (id: string) => void;

export function useFavorites() {
  const [data, setData] = useState<FavoritesData>(EMPTY);
  const dataRef = useRef<FavoritesData>(EMPTY);

  useEffect(() => {
    const stored = readStorage<FavoritesData>(KEY, EMPTY);
    const initial: FavoritesData = {
      tracks: Array.isArray(stored.tracks) ? stored.tracks : [],
      stations: Array.isArray(stored.stations) ? stored.stations : [],
    };
    dataRef.current = initial;
    setData(initial);

    const onFavorites = (event: Event) => {
      const next = (event as CustomEvent<FavoritesData>).detail;
      if (!next) return;
      dataRef.current = next;
      setData(next);
    };
    window.addEventListener(EVENT, onFavorites);
    return () => window.removeEventListener(EVENT, onFavorites);
  }, []);

  const update = useCallback((next: FavoritesData) => {
    dataRef.current = next;
    setData(next);
    writeStorage(KEY, next);
    window.dispatchEvent(new CustomEvent<FavoritesData>(EVENT, { detail: next }));
  }, []);

  const toggleTrack: Toggle = useCallback(
    (id) => {
      const current = dataRef.current;
      const tracks = current.tracks.includes(id)
        ? current.tracks.filter((item) => item !== id)
        : [...current.tracks, id];
      update({ ...current, tracks });
    },
    [update],
  );

  const toggleStation: Toggle = useCallback(
    (id) => {
      const current = dataRef.current;
      const stations = current.stations.includes(id)
        ? current.stations.filter((item) => item !== id)
        : [...current.stations, id];
      update({ ...current, stations });
    },
    [update],
  );

  return {
    tracks: data.tracks,
    stations: data.stations,
    isTrackFavorite: (id: string) => data.tracks.includes(id),
    isStationFavorite: (id: string) => data.stations.includes(id),
    toggleTrack,
    toggleStation,
  };
}
