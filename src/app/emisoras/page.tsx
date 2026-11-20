import type { Metadata } from "next";
import { Reveal } from "@/components/common/Reveal";
import { StationGrid } from "@/components/stations/StationGrid";
import { stations } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Emisoras · Radio Leonida",
  description: "Todas las emisoras documentadas de GTA VI y su estado de confirmación.",
};

export default function StationsPage() {
  return (
    <div className="page-shell">
      <header className="page-head">
        <p className="eyebrow">EL DIAL COMPLETO</p>
        <h1>Emisoras</h1>
        <p>
          {stations.filter((station) => station.status === "official").length} emisoras
          confirmadas por Rockstar y el resto reportadas dentro del juego. Cada tarjeta
          muestra su estado de confirmación y su fuente.
        </p>
      </header>
      <Reveal>
        <StationGrid stations={stations} />
      </Reveal>
    </div>
  );
}
