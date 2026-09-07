import type { Metadata } from "next";
import { Bodoni_Moda, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import SystemLayer from "@/components/system/SystemLayer";
import { narrativeGraph } from "@/lib/data-dna/source";

// §03.4 — familles figées le 2026-09-05 (D-06). Le sous-ensemble `latin`
// standard couvre les accents français, œ/Œ et les guillemets « » : aucun
// sous-ensemble étendu à charger.
const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700"],
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
  display: "swap",
});
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600"],
  display: "swap",
});


export const metadata: Metadata = {
  title: "Rayan Jemai — Data Scientist · AI Builder",
  description:
    "Portfolio construit comme un système : projets, compétences et expériences reliés par leurs dépendances réelles.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${bodoniModa.variable} ${plexMono.variable} ${plexSans.variable}`}
    >
      <body>
        {/* Monté ici, dans le layout RACINE : jamais démonté entre routes (§07.1). */}
        <SystemLayer nodes={narrativeGraph.nodes} edges={narrativeGraph.edges} />
        <main style={{ position: "relative", zIndex: 1 }}>{children}</main>
      </body>
    </html>
  );
}
