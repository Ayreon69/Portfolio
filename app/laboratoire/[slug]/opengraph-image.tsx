import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { projectBySlug, projects } from "@/lib/laboratoire/source";

/**
 * Carte de partage d'une page projet — une par expérimentation.
 *
 * C'est le vrai gain de A4 : les pages projet sont le meilleur contenu du site
 * et donc le plus partagé. Sans elle, un lien vers Job Agent affichait la même
 * carte qu'un lien vers l'accueil, et le lecteur ne savait pas sur quoi il
 * cliquait.
 *
 * Tout le texte vient de `projects` (dérivé de `data/nodes.json`) : numéro,
 * titre, friction, niveau de preuve. Rien n'est recopié ici — reformuler une
 * friction dans les données met la carte à jour au build suivant.
 *
 * C'est aussi, avec la page projet elle-même, le seul endroit où un accent est
 * lu (§03.3 : un accent n'apparaît que pour son propre projet).
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CREAM = "#f4efe4";
const INK = "#1a1a18";
const INK_MID = "#55534c";
const WARM = "#8a7f6a";

// §03.3 — les cinq accents figés (D-05). Écrits en dur parce que Satori ne lit
// aucune feuille de style : il n'y a pas de variable CSS à résoudre ici.
const ACCENT: Record<string, string> = {
  "job-agent": "#e0704a",
  "aram-stats": "#3e8e7e",
  "commission-bot": "#b08d3e",
  "ai-watch": "#4a6fa5",
};

const fontDir = join(process.cwd(), "assets", "fonts");

/** Prérend les 4 images au build, comme `page.tsx` prérend les 4 pages. */
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

/**
 * `alt` est constant, pas dérivé du projet. Le rendre dynamique impose de
 * passer par `generateImageMetadata`, qui fait basculer la route dans un
 * sous-segment `[__metadata_id__]` où les `params` ne sont pas fournis à la
 * phase de collecte — le build échoue alors sur « id property is required ».
 * Le titre du projet voyage déjà dans `og:title` : l'`alt` n'a pas à le
 * répéter, et ne justifie pas de contourner le framework.
 */
export const alt =
  "Expérimentation du laboratoire de Rayan Jemai — friction, système et niveau de preuve";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projectBySlug.get(slug);
  const bodoni = readFileSync(join(fontDir, "BodoniModa-Bold.ttf"));
  const mono = readFileSync(join(fontDir, "IBMPlexMono-Regular.ttf"));
  const accent = ACCENT[slug] ?? INK;

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
          justifyContent: "center",
          padding: "0 90px",
        }}
      >
        <div
          style={{
            fontFamily: "IBM Plex Mono",
            fontSize: 24,
            letterSpacing: 7,
            color: accent,
            marginBottom: 34,
          }}
        >
          {/* Une seule chaîne, pas `TEXTE {variable}` : Satori compte deux
              enfants et exige alors un `display` explicite sur le parent. */}
          {`EXPÉRIMENTATION ${project?.number ?? "—"}`}
        </div>

        <div
          style={{
            fontFamily: "Bodoni Moda",
            fontSize: 92,
            lineHeight: 1.05,
          }}
        >
          {project?.title ?? "Laboratoire"}
        </div>

        {project?.friction && (
          <div
            style={{
              fontFamily: "Bodoni Moda",
              fontSize: 30,
              lineHeight: 1.4,
              color: INK_MID,
              marginTop: 30,
              // La friction est une phrase entière dans les données. Bornée
              // ici en hauteur plutôt que tronquée dans le texte : couper une
              // phrase à un nombre de caractères produit des fins hasardeuses.
              maxHeight: 130,
              overflow: "hidden",
            }}
          >
            {project.friction}
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: 46,
          }}
        >
          <div style={{ width: 120, height: 2, background: accent }} />
          <div
            style={{
              fontFamily: "IBM Plex Mono",
              fontSize: 21,
              letterSpacing: 4,
              color: WARM,
              marginLeft: 26,
            }}
          >
            {(project?.proof ?? "").toUpperCase()}
          </div>
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
