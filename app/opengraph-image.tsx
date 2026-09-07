import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * Carte de partage du site — générée AU BUILD, pas dessinée à la main.
 *
 * Elle reprend la composition du HERO : le libellé de positionnement en mono
 * espacé, le nom en Bodoni capitales, le fil rouge en dessous. Les trois textes
 * sont ceux de `components/sections/Hero.tsx`, recopiés nulle part ailleurs —
 * si le HERO change, cette carte doit changer avec lui, et le doublon est
 * volontairement visible plutôt que masqué derrière une abstraction.
 *
 * Les polices viennent de `assets/fonts/` (jamais de `public/`) : elles sont
 * lues ici, au build, et ne partent jamais chez le visiteur. Voir le README de
 * ce dossier pour le détail.
 */

export const alt =
  "Rayan Jemai — Data Scientist · AI Builder. « Je n'aime pas faire deux fois la même chose. »";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// §03.3 — mêmes valeurs que `app/globals.css`, écrites en dur parce que Satori
// ne lit aucune feuille de style : il n'y a pas de variable CSS à résoudre ici.
const CREAM = "#f4efe4";
const INK = "#1a1a18";
const INK_MID = "#55534c";

const fontDir = join(process.cwd(), "assets", "fonts");

export default async function Image() {
  const bodoni = readFileSync(join(fontDir, "BodoniModa-Bold.ttf"));
  const mono = readFileSync(join(fontDir, "IBMPlexMono-Regular.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: CREAM,
          color: INK,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 70px",
        }}
      >
        <div
          style={{
            fontFamily: "IBM Plex Mono",
            fontSize: 26,
            letterSpacing: 8,
            color: INK_MID,
            marginBottom: 54,
          }}
        >
          {/* Mis en capitales ici, pas en CSS : `text-transform` n'est pas
              fiable dans Satori. */}
          DATA SCIENTIST · AI BUILDER
        </div>

        <div
          style={{
            fontFamily: "Bodoni Moda",
            fontSize: 112,
            lineHeight: 1,
            letterSpacing: 1,
            // Le HERO tient le nom sur UNE ligne : la carte doit faire pareil.
            // Coupé en deux, il perd son centrage optique et cesse de ressembler
            // à la page qu'il annonce. La taille est calée sur cette contrainte,
            // pas choisie pour elle-même.
            whiteSpace: "nowrap",
          }}
        >
          RAYAN JEMAI
        </div>

        <div
          style={{
            fontFamily: "Bodoni Moda",
            fontSize: 36,
            color: INK_MID,
            marginTop: 54,
          }}
        >
          Je n&apos;aime pas faire deux fois la même chose.
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Bodoni Moda", data: bodoni, style: "normal", weight: 700 },
        { name: "IBM Plex Mono", data: mono, style: "normal", weight: 400 },
      ],
    }
  );
}
