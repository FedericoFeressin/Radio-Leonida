import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConfirmBadge } from "@/components/common/ConfirmBadge";
import { EmptyState } from "@/components/common/EmptyState";
import { StationHero } from "@/components/stations/StationHero";
import { TrackRow } from "@/components/tracks/TrackRow";
import { getStation, getStationTracks, stations } from "@/lib/catalog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return stations.map((station) => ({ slug: station.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const station = getStation(slug);
  return {
    title: station ? `${station.name} · Radio Leonida` : "Emisora no encontrada",
    description: station?.description,
  };
}

export default async function StationPage({ params }: PageProps) {
  const { slug } = await params;
  const station = getStation(slug);
  if (!station) notFound();

  const stationTracks = getStationTracks(station);
  const isOfficial = station.status === "official";
  const sourceLabel = isOfficial
    ? "la web oficial de música de GTA VI"
    : "el informe de emisoras de GameSpot";

  return (
    <div className="page-shell">
      <StationHero station={station} trackCount={stationTracks.length} />

      <section className="section" aria-labelledby="tracklist-title">
        <div className="section__head">
          <div>
            <p className="eyebrow">PROGRAMACIÓN</p>
            <h2 id="tracklist-title">
              {isOfficial ? "Canciones confirmadas" : "Canciones reportadas"}
            </h2>
          </div>
          <ConfirmBadge status={station.status} />
        </div>

        {stationTracks.length > 0 ? (
          <div className="track-list">
            {stationTracks.map((track, index) => (
              <TrackRow key={track.id} track={track} index={index} showStation={false} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Todavía no hay canciones nominadas"
            description={
              station.previewUrl
                ? "Rockstar publicó el preview de esta emisora, pero no ha revelado su lista de temas. Escuchá la muestra oficial mientras tanto."
                : "Es una emisora de formato hablado o su lista de temas aún no se conoce. No publicamos canciones sin una fuente verificable."
            }
          >
            {station.previewUrl && (
              <a
                className="button button--primary"
                href={station.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                ↗ Escuchar preview oficial
              </a>
            )}
          </EmptyState>
        )}
      </section>

      <p className="source-note source-note--page">
        Información obtenida de{" "}
        <a
          href={station.confirmedBy ?? "https://www.rockstargames.com/VI/music"}
          target="_blank"
          rel="noopener noreferrer"
        >
          {sourceLabel}
        </a>
        . Las canciones sin fuente embebible se abren en la plataforma autorizada.
      </p>
    </div>
  );
}
