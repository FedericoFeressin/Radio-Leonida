import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { PlayerProvider } from "@/components/player/PlayerProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Radio Leonida · GTA VI",
  description:
    "Emisoras y música confirmada de Grand Theft Auto VI, con fuentes autorizadas y reproductor persistente.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <PlayerProvider>
          <Header />
          <main className="site-main">{children}</main>
        </PlayerProvider>
      </body>
    </html>
  );
}
