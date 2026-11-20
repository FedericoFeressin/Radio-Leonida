import type { Metadata } from "next";
import { LibraryView } from "@/components/library/LibraryView";
import { tracks } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Biblioteca · Radio Leonida",
  description: "Buscá y filtrá la música catalogada de GTA VI.",
};

export default function LibraryPage() {
  return (
    <div className="page-shell">
      <header className="page-head">
        <p className="eyebrow">CATÁLOGO</p>
        <h1>Biblioteca musical</h1>
        <p>
          Buscá por canción, artista o emisora. Cada fila indica si el tema fue confirmado
          por Rockstar o reportado por prensa: los datos sin verificar nunca se mezclan
          con los confirmados.
        </p>
      </header>
      <LibraryView tracks={tracks} />
    </div>
  );
}
