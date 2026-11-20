"use client";

import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { StationCard } from "@/components/stations/StationCard";
import { TrackRow } from "@/components/tracks/TrackRow";
import { useFavorites } from "@/hooks/useFavorites";
import { getStation, getTrack } from "@/lib/catalog";

export function FavoritesView() {
  const { tracks, stations } = useFavorites();
  const [tab, setTab] = useState<"tracks" | "stations">("tracks");

  const favoriteTracks = tracks
    .map((id) => getTrack(id))
    .filter((track) => track !== undefined);
  const favoriteStations = stations
    .map((id) => getStation(id))
    .filter((station) => station !== undefined);

  return (
    <div className="favorites">
      <div className="tabs" role="tablist" aria-label="Tipo de favoritos">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "tracks"}
          className={`tab ${tab === "tracks" ? "is-active" : ""}`}
          onClick={() => setTab("tracks")}
        >
          Canciones <span>{favoriteTracks.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "stations"}
          className={`tab ${tab === "stations" ? "is-active" : ""}`}
          onClick={() => setTab("stations")}
        >
          Emisoras <span>{favoriteStations.length}</span>
        </button>
      </div>

      {tab === "tracks" &&
        (favoriteTracks.length > 0 ? (
          <div className="track-list">
            {favoriteTracks.map((track, index) => (
              <TrackRow key={track.id} track={track} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Todavía no guardaste canciones"
            description="Tocá la estrella junto a cualquier tema para tenerlo siempre a mano en este dispositivo."
          >
            <Link className="button button--primary" href="/biblioteca">
              Ir a la biblioteca
            </Link>
          </EmptyState>
        ))}

      {tab === "stations" &&
        (favoriteStations.length > 0 ? (
          <div className="station-grid">
            {favoriteStations.map((station) => (
              <StationCard key={station.id} station={station} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No hay emisoras guardadas"
            description="Sintonizá una emisora y guardala con la estrella para acceder rápido."
          >
            <Link className="button button--primary" href="/emisoras">
              Ver emisoras
            </Link>
          </EmptyState>
        ))}
    </div>
  );
}
