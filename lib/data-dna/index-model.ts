// Modèle de l'index Data DNA — la représentation TEXTUELLE du graphe narratif.
//
// C'est un seul artefact pour trois problèmes (§10.2) : le fallback sans JS,
// la version mobile, et le contenu accessible / indexable. Il est calculé côté
// serveur à partir du même graphe 27/53 que la future représentation
// graphique — jamais d'une liste écrite à la main.
//
// Règle absolue : AUCUN chiffre, AUCUN lien n'est codé en dur. Tout descend de
// data/edges.json. Le wireframe affichait « Python présent dans les 5
// systèmes » ; la donnée réelle en compte 7 (5 expérimentations + 2
// expériences). C'est la donnée qui a raison, pas la maquette.

import type { DNAEdge, DNANode } from "./types";

/** Le strict minimum dont l'index a besoin : pas de positions, pas de layout.
 *  Prendre le graphe en paramètre (plutôt que de l'importer) garde ce module
 *  pur, donc testable hors bundler. */
export type IndexSource = { nodes: DNANode[]; edges: DNAEdge[] };

const CLUSTER_ORDER = ["ai", "ml", "automation", "data"] as const;
export type ClusterId = (typeof CLUSTER_ORDER)[number];

export type IndexLink = { id: string; label: string; weight: number };

export type IndexCapability = {
  id: string;
  label: string;
  /** Projets et expériences qui déclarent `uses` vers cette compétence. */
  usedBy: IndexLink[];
};

export type IndexCluster = {
  id: ClusterId;
  /** Libellé du nœud `pillar` correspondant, jamais une chaîne inventée. */
  label: string;
  description: string | null;
  capabilities: IndexCapability[];
  /** Projets/expériences qui alimentent ce pilier (`feeds`). */
  fedBy: IndexLink[];
};

export type DataDNAIndexModel = {
  clusters: IndexCluster[];
  /** Expérimentations + expériences professionnelles : les « systèmes ». */
  systemCount: number;
  counts: { nodes: number; edges: number };
  /**
   * La compétence partagée par le plus de systèmes. Calculée, pas choisie :
   * si un jour une autre compétence dépasse Python, c'est elle qui s'affiche.
   */
  mostShared: {
    label: string;
    usedByCount: number;
    /** Piliers alimentés par les systèmes qui l'utilisent. */
    pillars: string[];
  } | null;
};

const displayOf = (n: DNANode) => n.fr?.title ?? n.fr?.label ?? n.label;

const isSystem = (n: DNANode) =>
  n.type === "experiment" || n.type === "experience";

export function buildIndexModel(graph: IndexSource): DataDNAIndexModel {
  const { nodes, edges } = graph;
  const byId = new Map(nodes.map((n) => [n.id, n]));

  const linksTo = (kind: DNAEdge["kind"], target: string): IndexLink[] =>
    edges
      .filter((e) => e.kind === kind && e.to === target)
      .map((e) => ({
        id: e.from,
        label: byId.get(e.from) ? displayOf(byId.get(e.from)!) : e.from,
        weight: e.weight,
      }))
      .sort(
        (a, b) => b.weight - a.weight || a.label.localeCompare(b.label, "fr")
      );

  const clusters: IndexCluster[] = CLUSTER_ORDER.flatMap((id) => {
    const pillar = nodes.find((n) => n.type === "pillar" && n.cluster === id);
    if (!pillar) return [];

    const capabilities: IndexCapability[] = nodes
      .filter((n) => n.type === "capability" && n.cluster === id)
      .map((n) => ({ id: n.id, label: displayOf(n), usedBy: linksTo("uses", n.id) }))
      // Les plus partagées d'abord : c'est la donnée qui ordonne la lecture.
      .sort(
        (a, b) =>
          b.usedBy.length - a.usedBy.length ||
          a.label.localeCompare(b.label, "fr")
      );

    return [
      {
        id,
        label: displayOf(pillar),
        description: pillar.fr?.description ?? null,
        capabilities,
        fedBy: linksTo("feeds", pillar.id),
      },
    ];
  });

  // Compétence la plus partagée, et les piliers qu'alimentent ses utilisateurs.
  let mostShared: DataDNAIndexModel["mostShared"] = null;
  for (const cluster of clusters) {
    for (const cap of cluster.capabilities) {
      if (mostShared && cap.usedBy.length <= mostShared.usedByCount) continue;
      const pillars = new Set<string>();
      for (const user of cap.usedBy) {
        for (const e of edges) {
          if (e.kind !== "feeds" || e.from !== user.id) continue;
          const p = byId.get(e.to);
          if (p) pillars.add(displayOf(p));
        }
      }
      mostShared = {
        label: cap.label,
        usedByCount: cap.usedBy.length,
        pillars: CLUSTER_ORDER.flatMap((c) => {
          const p = nodes.find((n) => n.type === "pillar" && n.cluster === c);
          return p && pillars.has(displayOf(p)) ? [displayOf(p)] : [];
        }),
      };
    }
  }

  return {
    clusters,
    systemCount: nodes.filter(isSystem).length,
    counts: { nodes: nodes.length, edges: edges.length },
    mostShared,
  };
}
