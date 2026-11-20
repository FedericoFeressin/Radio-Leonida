import type { Metadata } from "next";
import { FavoritesView } from "@/components/library/FavoritesView";

export const metadata: Metadata = {
  title: "Favoritos · Radio Leonida",
  description: "Tus canciones y emisoras guardadas en este dispositivo.",
};

export default function FavoritesPage() {
  return (
    <div className="page-shell">
      <header className="page-head">
        <p className="eyebrow">TU SELECCIÓN</p>
        <h1>Favoritos</h1>
        <p>
          Se guardan en este navegador con LocalStorage. No se envían a ningún servidor.
        </p>
      </header>
      <FavoritesView />
    </div>
  );
}
