// Dérivation « dataset source → graphe narratif ». Fonction PURE : elle ne
// connaît aucun fichier, aucun chemin, aucun bundler. C'est ce qui permet de la
// tester hors Next (scripts/check-data.ts) exactement telle qu'elle tourne en
// production.
//
// Extraite telle quelle de prototype-persistance-canvas/lib/graph-layout.ts.
// AUCUNE MODIFICATION de la logique.

import type { DNAEdge, DNANode, Exclusion } from "./types.ts";

/**
 * Dataset source → graphe narratif.
 *
 * Décision actée le 2026-09-05, après le prototype : tout ce qui existe dans
 * les données n'a pas sa place dans ce qui est montré. `data/nodes.json` et
 * `data/edges.json` restent la source complète (29 nœuds / 60 arêtes) ; le
 * graphe affiché en est une dérivation documentée (27 / 53).
 *
 * Deux retraits, deux raisons distinctes :
 *
 * 1. `build` — les 7 projets/expériences lui envoient un `produces` de poids 1,
 *    sans exception. L'arête ne dit rien d'autre que « ce projet construit
 *    quelque chose » : couche sémantique redondante qui tire tout vers le
 *    barycentre sans rien distinguer. BUILD reste un concept ÉDITORIAL du site
 *    (la boucle FRICTION → COMPRENDRE → CONSTRUIRE → AUTOMATISER → ITÉRER),
 *    pas un nœud du graphe.
 *
 * 2. Les nœuds devenus sans aucune arête (aujourd'hui `power-bi`) — aucune
 *    grille §04.4 ne les supporte. Ils restent dans le profil, le CV et les
 *    expériences ; ils n'ont simplement pas de relation à montrer ici.
 *
 * Le retrait est calculé, jamais codé en dur sur une liste de nœuds : si une
 * grille future crée une arête vers `power-bi`, il rentre automatiquement.
 */
export function deriveNarrativeGraph(
  sourceNodes: DNANode[],
  sourceEdges: DNAEdge[]
): { nodes: DNANode[]; edges: DNAEdge[]; excluded: Exclusion[] } {
  const excluded: Exclusion[] = [];

  const nodesSansBuild = sourceNodes.filter((n) => {
    if (n.type !== "output") return true;
    excluded.push({
      id: n.id,
      label: n.fr?.label ?? n.label,
      reason: "sortie tautologique — reçoit un `produces` de poids 1 des 7 projets",
    });
    return false;
  });
  const excludedIds = new Set(excluded.map((e) => e.id));
  const edges = sourceEdges.filter(
    (e) => !excludedIds.has(e.from) && !excludedIds.has(e.to)
  );

  const connected = new Set<string>();
  for (const e of edges) {
    connected.add(e.from);
    connected.add(e.to);
  }

  const nodes = nodesSansBuild.filter((n) => {
    if (connected.has(n.id)) return true;
    excluded.push({
      id: n.id,
      label: n.fr?.label ?? n.label,
      reason: "aucune arête — non supporté par une grille §04.4",
    });
    return false;
  });

  return { nodes, edges, excluded };
}
