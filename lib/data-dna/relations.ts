// Groupement des relations d'un noeud — extrait tel quel de
// prototype-persistance-canvas/app/data-dna/page.tsx (prototype gele, §04.8).
//
// Les quatre intitules traduisent exactement les deux `kind` restants
// (`feeds`, `uses`) selon le sens de lecture. Rien de plus : la nuance
// « utilise dans » / « structure » n'existe pas dans edges.json.

import type { DNAEdge, LaidOutGraph, LaidOutNode } from "./types";

/**
 * Relations du nœud sélectionné, groupées par (kind, sens).
 *
 * Les quatre intitulés traduisent exactement les deux `kind` restants de
 * edges.json (`feeds`, `uses`) selon le sens de lecture. Rien de plus : la
 * nuance « utilisé dans » / « structure » n'existe pas dans les données —
 * `job-agent → python` et `job-agent → agentic-ai` sont toutes deux
 * `uses` / poids 3. L'inventer ici casserait la règle du §04.7.
 */
export function relationGroups(node: LaidOutNode, graph: LaidOutGraph) {
  const defs: { title: string; kind: DNAEdge["kind"]; outgoing: boolean }[] = [
    { title: "ALIMENTE", kind: "feeds", outgoing: true },
    { title: "UTILISE", kind: "uses", outgoing: true },
    { title: "ALIMENTÉ PAR", kind: "feeds", outgoing: false },
    { title: "UTILISÉ PAR", kind: "uses", outgoing: false },
  ];

  return defs
    .map((d) => ({
      title: d.title,
      items: graph.edges
        .filter(
          (e) =>
            e.kind === d.kind &&
            (d.outgoing ? e.from === node.id : e.to === node.id)
        )
        .map((e) => {
          const otherId = d.outgoing ? e.to : e.from;
          return {
            id: `${d.title}-${otherId}`,
            label: graph.byId.get(otherId)?.display ?? otherId,
            weight: e.weight,
          };
        })
        .sort((a, b) => b.weight - a.weight || a.label.localeCompare(b.label, "fr")),
    }))
    .filter((g) => g.items.length > 0);
}
