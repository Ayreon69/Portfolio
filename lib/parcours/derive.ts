// Dérivation de PARCOURS — les deux nœuds `experience` du Data DNA.
//
// Pure, sans import de données : exécutable sous Node nu par
// scripts/check-data.ts (même contrat que lib/data-dna/derive.ts et
// lib/laboratoire/derive.ts).
//
// RIEN n'est saisi ici : le texte vient de data/nodes.json, les compétences et
// les piliers viennent de data/edges.json. Le seul calcul est le rapprochement
// entre une expérience et les systèmes du laboratoire — et il compte les
// compétences réellement partagées plutôt que d'affirmer une parenté.

import type { DNAEdge, DNANode } from "../data-dna/types.ts";

export type Experience = {
  id: string;
  title: string;
  /** Employeur — le champ `universe` du nœud. */
  employer: string | null;
  friction: string | null;
  system: string | null;
  /** Colonne « Ce que j'ai fait », reformulée à la première personne. */
  action: string[];
  metric: { value: string; label: string } | null;
  result: string | null;
  /** Arêtes `uses`, du poids le plus fort au plus faible. */
  capabilities: { id: string; label: string; weight: number }[];
  /** Arêtes `feeds` vers un pilier. */
  pillars: string[];
  /** Systèmes du laboratoire, ordonnés par nombre de compétences partagées. */
  sharedWith: { slug: string; title: string; shared: number }[];
};

const displayOf = (n: DNANode) => n.fr?.title ?? n.fr?.label ?? n.label;

export function deriveExperiences(
  nodes: DNANode[],
  edges: DNAEdge[],
  /** Reformulations de content/parcours — le graphe reste la source des faits. */
  actions: Record<string, string[]> = {}
): Experience[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const order = new Map(nodes.map((n, i) => [n.id, i]));

  /** ids des capabilities utilisées par un nœud. */
  const usedBy = (id: string) =>
    edges
      .filter(
        (e) => e.from === id && e.kind === "uses" && byId.get(e.to)?.type === "capability"
      )
      .map((e) => ({ id: e.to, weight: e.weight }));

  return nodes
    .filter((n) => n.type === "experience")
    .map((n) => {
      const capabilities = usedBy(n.id)
        // Poids décroissant, puis ordre du dataset : tri stable et reproductible,
        // jamais alphabétique — le poids EST l'information.
        .sort(
          (a, b) =>
            b.weight - a.weight ||
            (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)
        )
        .map((c) => ({
          id: c.id,
          label: displayOf(byId.get(c.id)!),
          weight: c.weight,
        }));

      const capIds = new Set(capabilities.map((c) => c.id));

      const pillars = edges
        .filter(
          (e) =>
            e.from === n.id &&
            e.kind === "feeds" &&
            byId.get(e.to)?.type === "pillar"
        )
        .map((e) => displayOf(byId.get(e.to)!));

      const sharedWith = nodes
        .filter((p) => p.type === "experiment")
        .map((p) => ({
          slug: p.slug ?? p.id,
          title: displayOf(p),
          shared: usedBy(p.id).filter((c) => capIds.has(c.id)).length,
          rank: order.get(p.id) ?? 0,
        }))
        .filter((p) => p.shared > 0)
        // Le plus de compétences partagées d'abord ; à égalité, l'ordre du
        // dataset (donc la numérotation 01→05 du laboratoire).
        .sort((a, b) => b.shared - a.shared || a.rank - b.rank)
        .map(({ slug, title, shared }) => ({ slug, title, shared }));

      return {
        id: n.id,
        title: n.fr?.title ?? n.label,
        employer: n.universe ?? null,
        friction: n.fr?.friction ?? n.friction ?? null,
        system: n.fr?.system ?? null,
        // Reformulation si elle existe, sinon les deux champs du graphe dans
        // l'ordre où ils s'y trouvent : la colonne n'est jamais vide.
        action:
          actions[n.id] ??
          ([n.fr?.friction ?? n.friction, n.fr?.system].filter(Boolean) as string[]),
        metric: n.metric ?? null,
        result: n.fr?.result ?? null,
        capabilities,
        pillars,
        sharedWith,
      };
    });
}
