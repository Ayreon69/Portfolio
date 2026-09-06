// Dérivation des 5 expérimentations du LABORATOIRE.
//
// Pure, sans import de données ni connaissance du bundler : le script
// scripts/check-data.ts l'exécute sous Node nu (même contrat que
// lib/data-dna/derive.ts).
//
// SOURCE UNIQUE : data/nodes.json. Tout ce qui s'affiche dans la galerie et
// dans une page projet vient de ce fichier — friction, métrique, univers,
// niveau de preuve, liens, contenus FR. Aucun composant ne réécrit un contenu
// projet en dur.

import type { DNANode, ProofLevel } from "../data-dna/types.ts";

/**
 * Tags de galerie — transcrits VERBATIM du wireframe §08.4 :
 *
 *   01  JOB AGENT           AUTOMATION / AI / PYTHON
 *   02  ARAM STATS          DATA / API / VISUALIZATION
 *   03  COMMISSION BOT      AI / AUTOMATION
 *   04  AI WATCH            AI / AUTOMATION / DATA
 *   05  CHURN PREDICTION    MACHINE LEARNING / INSURANCE
 *
 * Ils ne sont PAS dérivés du graphe : le Data DNA relie des compétences
 * réelles, le wireframe annonce un territoire de lecture. Les recalculer
 * produirait d'autres chaînes que celles validées — donc on les transcrit,
 * une seule fois, ici.
 */
export const GALLERY_TAGS: Record<string, string[]> = {
  "job-agent": ["Automation", "AI", "Python"],
  "aram-stats": ["Data", "API", "Visualization"],
  "commission-bot": ["AI", "Automation"],
  "ai-watch": ["AI", "Automation", "Data"],
  "churn-prediction": ["Machine Learning", "Insurance"],
};

export const PROOF_LABEL: Record<ProofLevel, string> = {
  "live-demo": "Démo en ligne",
  "case-study": "Case study",
};

/** Clés des six sections du §09.2, dans l'ordre. */
export type SectionKey =
  | "friction"
  | "construction"
  | "system"
  | "donnees"
  | "result"
  | "recul";

export type SectionContent = {
  paragraphs?: string[];
  /** Chaîne du pipeline (§09.3), rendue telle quelle. */
  chain?: string[];
  /** Stack §09.5, affichée en 04 — DONNÉES. */
  stack?: string[];
};

/**
 * Contenu éditorial d'une page projet, par section. Vit dans content/, jamais
 * dans data/ : le Data DNA est un graphe, pas un CMS. Une section absente
 * retombe sur le texte court du graphe, puis sur « Contenu à intégrer » —
 * la page dit toujours la vérité sur son état.
 */
export type ProjectContent = Partial<Record<SectionKey, SectionContent>>;

export type Project = {
  /** 01 à 05 — l'ordre de data/nodes.json EST la numérotation du §08.4. */
  number: string;
  slug: string;
  title: string;
  subtitle: string | null;
  /** Friction courte : la version déjà raccourcie portée par `fr.friction`. */
  friction: string | null;
  metric: { value: string; label: string } | null;
  tags: string[];
  proofLevel: ProofLevel | null;
  /** Niveau de preuve prêt à afficher, dépôt public compris. */
  proof: string;
  links: { repo?: string; live?: string } | null;
  universe: string | null;
  year: number | null;
  status: "live" | "archived" | "lost" | null;
  anonymized: boolean;
  cluster: DNANode["cluster"];
  /** Les six sections du §09.2, dans l'ordre. `paragraphs` vide = à intégrer. */
  sections: {
    number: string;
    label: string;
    paragraphs: string[];
    chain?: string[];
    stack?: string[];
  }[];
};

export function deriveProjects(
  nodes: DNANode[],
  content: Record<string, ProjectContent> = {}
): Project[] {
  return nodes
    .filter((n) => n.type === "experiment")
    .map((n, i) => {
      const slug = n.slug ?? n.id;
      const fr = n.fr ?? {};
      const proofLevel = n.proofLevel ?? null;
      const editorial = content[slug] ?? {};

      // Le contenu éditorial gagne quand il existe ; sinon on retombe sur la
      // phrase courte du graphe. Jamais de texte de remplissage.
      const section = (
        number: string,
        label: string,
        key: SectionKey,
        fallback?: string | null
      ) => {
        const c = editorial[key];
        const paragraphs = c?.paragraphs ?? (fallback ? [fallback] : []);
        return { number, label, paragraphs, chain: c?.chain, stack: c?.stack };
      };
      const proofParts = [
        proofLevel ? PROOF_LABEL[proofLevel] : null,
        n.links?.repo ? "Dépôt public" : null,
        n.anonymized ? "Anonymisé" : null,
      ].filter(Boolean) as string[];

      return {
        number: String(i + 1).padStart(2, "0"),
        slug,
        title: fr.title ?? n.label,
        subtitle: fr.subtitle ?? null,
        friction: fr.friction ?? n.friction ?? null,
        metric: n.metric ?? null,
        tags: GALLERY_TAGS[slug] ?? [],
        proofLevel,
        proof: proofParts.join(" · "),
        links: n.links ?? null,
        universe: n.universe ?? null,
        year: n.year ?? null,
        status: n.status ?? null,
        anonymized: n.anonymized ?? false,
        cluster: n.cluster,
        // §09.2 — structure de page validée, six sections, libellés français.
        sections: [
          section("01", "Friction", "friction", fr.friction ?? n.friction),
          section("02", "Construction", "construction", fr.construction),
          section("03", "Système", "system", fr.system),
          section("04", "Données", "donnees", fr.donnees),
          section("05", "Résultat", "result", fr.result),
          section("06", "Recul", "recul", fr.recul),
        ],
      };
    });
}
