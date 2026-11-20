"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Track } from "@/lib/types";
import { TrackDetailModal } from "./TrackDetailModal";

interface TrackDetailContextValue {
  openTrack: (track: Track) => void;
}

const TrackDetailContext = createContext<TrackDetailContextValue | null>(null);

export function TrackDetailProvider({ children }: { children: ReactNode }) {
  const [track, setTrack] = useState<Track | null>(null);
  const value = useMemo(() => ({ openTrack: setTrack }), []);

  return (
    <TrackDetailContext.Provider value={value}>
      {children}
      {track && <TrackDetailModal track={track} onClose={() => setTrack(null)} />}
    </TrackDetailContext.Provider>
  );
}

export function useTrackDetail(): TrackDetailContextValue {
  const context = useContext(TrackDetailContext);
  if (!context) {
    throw new Error("useTrackDetail debe usarse dentro de TrackDetailProvider");
  }
  return context;
}
