import type { Metadata } from "next";
import { Bodoni_Moda, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import PersistentScene from "@/components/PersistentScene";
import { SystemVisibilityProvider } from "@/lib/system-visibility";

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700", "900"],
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Prototype — Hero & persistance du canvas",
  description: "Valide le risque technique n°1 (§07.1) et le Hero réel (§08.1)",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`h-full ${bodoniModa.variable} ${plexMono.variable} ${plexSans.variable}`}
    >
      <body
        className="min-h-full"
        style={{
          background: "#F4EFE4",
          color: "#1A1A18",
          fontFamily: "var(--font-sans)",
        }}
      >
        <SystemVisibilityProvider>
          <PersistentScene />
          <main style={{ position: "relative", zIndex: 1 }}>{children}</main>
        </SystemVisibilityProvider>
      </body>
    </html>
  );
}
