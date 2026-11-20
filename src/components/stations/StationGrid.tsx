"use client";

import { useMemo, useState } from "react";
import { StationCard } from "@/components/stations/StationCard";
import type { ConfirmationStatus, Station } from "@/lib/types";

type StatusFilter = "all" | "official" | "press-reported";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "official", label: "Confirmadas" },
  { value: "press-reported", label: "Reportadas" },
];

function matchesStatus(status: ConfirmationStatus, filter: StatusFilter): boolean {
  if (filter === "all") return true;
  if (filter === "official") return status === "official" || status === "official-material";
  return status === "press-reported" || status === "rumor";
}

export function StationGrid({ stations }: { stations: Station[] }) {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [genre, setGenre] = useState("Todos");

  const genres = useMemo(() => {
    const values = new Set<string>();
    stations.forEach((station) => station.genres.forEach((item) => values.add(item)));
    return ["Todos", ...[...values].sort((a, b) => a.localeCompare(b, "es"))];
  }, [stations]);

  const visible = stations.filter((station) => {
    if (!matchesStatus(station.status, status)) return false;
    if (genre !== "Todos" && !station.genres.includes(genre)) return false;
    return true;
  });

  return (
    <>
      <div className="station-filters">
        <div className="filter-pills" role="group" aria-label="Filtrar emisoras por estado">
          {STATUS_FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`filter-pill ${status === item.value ? "is-active" : ""}`}
              onClick={() => setStatus(item.value)}
              aria-pressed={status === item.value}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="select-field">
          <span className="sr-only">Filtrar por género</span>
          <select value={genre} onChange={(event) => setGenre(event.target.value)}>
            {genres.map((item) => (
              <option key={item} value={item}>
                {item === "Todos" ? "Todos los géneros" : item}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="result-count">
        {visible.length} {visible.length === 1 ? "emisora" : "emisoras"}
      </p>
      <div className="station-grid">
        {visible.map((station) => (
          <StationCard key={station.id} station={station} />
        ))}
      </div>
    </>
  );
}
