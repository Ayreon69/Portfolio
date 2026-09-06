// Simulation de forces 2D du Data DNA — extraite telle quelle de
// prototype-persistance-canvas/lib/graph-layout.ts (prototype gele, §04.8).
//
// AUCUNE MODIFICATION de la logique de positionnement : les 27 positions
// sortent d'une simulation deterministe qui ne connait que les 53 aretes.
// Les 4 piliers ne sont pas ancres. Rien n'est choisi a la main.

import type { DNAEdge, DNANode, LaidOutGraph, LaidOutNode } from "./types";

// Graine déterministe (0..1) — jamais Math.random() : deux chargements de la
// page doivent produire exactement le même graphe, sinon on ne peut pas juger
// une composition ni la comparer d'une itération à l'autre.
function seededFraction(id: string, salt: number): number {
  let h = salt;
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i);
    h |= 0;
  }
  return (Math.abs(h) % 10000) / 10000;
}

const ITERATIONS = 700;
const WIDTH = 1000;
const HEIGHT = 640;

export function layoutGraph(
  allNodes: DNANode[],
  edges: DNAEdge[]
): LaidOutGraph {
  const rawDegree = new Map<string, number>();
  const rawWeighted = new Map<string, number>();
  const neighbors = new Map<string, Set<string>>();
  for (const node of allNodes) {
    rawDegree.set(node.id, 0);
    rawWeighted.set(node.id, 0);
    neighbors.set(node.id, new Set());
  }
  for (const e of edges) {
    if (!rawDegree.has(e.from) || !rawDegree.has(e.to)) continue;
    rawDegree.set(e.from, rawDegree.get(e.from)! + 1);
    rawDegree.set(e.to, rawDegree.get(e.to)! + 1);
    rawWeighted.set(e.from, rawWeighted.get(e.from)! + e.weight);
    rawWeighted.set(e.to, rawWeighted.get(e.to)! + e.weight);
    neighbors.get(e.from)!.add(e.to);
    neighbors.get(e.to)!.add(e.from);
  }

  // Un nœud sans aucune arête est exclu de la simulation. Ce n'est pas de la
  // cosmétique : une simulation de forces n'a rien à dire sur un nœud qui
  // n'entretient aucune relation — la répulsion seule le projetterait à
  // l'extérieur et sa position ne voudrait rien dire, tout en écrasant
  // l'échelle du vrai graphe. Le placer dans une zone « hors système » assumée
  // est plus honnête que de laisser croire que la physique l'a positionné.
  const rawNodes = allNodes.filter((nd) => (rawDegree.get(nd.id) ?? 0) > 0);
  const orphanNodes = allNodes.filter((nd) => (rawDegree.get(nd.id) ?? 0) === 0);

  const n = rawNodes.length;
  const index = new Map<string, number>();
  rawNodes.forEach((node, i) => index.set(node.id, i));

  const degree = rawNodes.map((nd) => rawDegree.get(nd.id)!);
  const weightedDegree = rawNodes.map((nd) => rawWeighted.get(nd.id)!);

  // Position initiale : cercle déterministe. Le point de départ n'a pas de
  // signification — seule la structure des arêtes fait converger la simulation.
  const px = new Float64Array(n);
  const py = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const a = seededFraction(rawNodes[i].id, 7) * Math.PI * 2;
    const r = 120 + seededFraction(rawNodes[i].id, 11) * 90;
    px[i] = Math.cos(a) * r;
    py[i] = Math.sin(a) * r;
  }

  const k = Math.sqrt((WIDTH * HEIGHT) / n);
  const dx = new Float64Array(n);
  const dy = new Float64Array(n);
  let temperature = WIDTH / 8;
  const cooling = temperature / (ITERATIONS + 1);

  for (let iter = 0; iter < ITERATIONS; iter++) {
    dx.fill(0);
    dy.fill(0);

    // Répulsion entre toutes les paires (29 nœuds = 406 paires : négligeable).
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        let ex = px[i] - px[j];
        let ey = py[i] - py[j];
        let d = Math.hypot(ex, ey);
        if (d < 0.01) {
          // Deux nœuds exactement superposés : on les sépare de façon stable
          // (dérivée de l'id) plutôt qu'au hasard.
          ex = seededFraction(rawNodes[i].id, 13) - 0.5;
          ey = seededFraction(rawNodes[i].id, 17) - 0.5;
          d = Math.hypot(ex, ey) || 0.01;
        }
        // Répulsion pondérée par le poids cumulé des deux nœuds : un nœud très
        // connecté est rendu plus gros, il lui faut donc plus de place, sinon
        // le cœur du graphe devient un amas illisible. Cela change l'ÉCHELLE
        // locale, jamais la topologie : qui est voisin de qui reste dicté par
        // les seules arêtes réelles.
        const room = 1 + 0.018 * (weightedDegree[i] + weightedDegree[j]);
        const force = ((k * k) / d) * room;
        const ux = (ex / d) * force;
        const uy = (ey / d) * force;
        dx[i] += ux;
        dy[i] += uy;
        dx[j] -= ux;
        dy[j] -= uy;
      }
    }

    // Attraction le long des arêtes réelles. Le poids de l'arête raccourcit
    // légèrement le ressort : une relation forte rapproche davantage. Effet
    // volontairement modéré — le poids module, il ne réécrit pas la topologie.
    for (const e of edges) {
      const a = index.get(e.from);
      const b = index.get(e.to);
      if (a === undefined || b === undefined) continue;
      const ex = px[a] - px[b];
      const ey = py[a] - py[b];
      const d = Math.hypot(ex, ey) || 0.01;
      const force = ((d * d) / k) * (0.7 + 0.15 * e.weight);
      const ux = (ex / d) * force;
      const uy = (ey / d) * force;
      dx[a] -= ux;
      dy[a] -= uy;
      dx[b] += ux;
      dy[b] += uy;
    }

    // Gravité très faible vers l'origine : contient la dispersion globale sans
    // écraser la structure. Les composantes réellement liées se placent seules.
    for (let i = 0; i < n; i++) {
      dx[i] -= px[i] * 0.015;
      dy[i] -= py[i] * 0.015;
    }

    for (let i = 0; i < n; i++) {
      const d = Math.hypot(dx[i], dy[i]) || 0.01;
      const step = Math.min(d, temperature);
      px[i] += (dx[i] / d) * step;
      py[i] += (dy[i] / d) * step;
    }

    temperature -= cooling;
  }

  // Normalisation dans le cadre, en conservant le ratio : on recentre et on
  // met à l'échelle, jamais on ne déforme (un étirement non uniforme mentirait
  // sur les distances relatives, donc sur la structure).
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (let i = 0; i < n; i++) {
    if (px[i] < minX) minX = px[i];
    if (px[i] > maxX) maxX = px[i];
    if (py[i] < minY) minY = py[i];
    if (py[i] > maxY) maxY = py[i];
  }
  const pad = 68;
  const scale = Math.min(
    (WIDTH - pad * 2) / Math.max(maxX - minX, 1),
    (HEIGHT - pad * 2) / Math.max(maxY - minY, 1)
  );
  const offsetX = (WIDTH - (maxX - minX) * scale) / 2 - minX * scale;
  const offsetY = (HEIGHT - (maxY - minY) * scale) / 2 - minY * scale;

  const nodes: LaidOutNode[] = rawNodes.map((node, i) => ({
    ...node,
    x: px[i] * scale + offsetX,
    y: py[i] * scale + offsetY,
    degree: degree[i],
    weightedDegree: weightedDegree[i],
    display: node.fr?.title ?? node.fr?.label ?? node.label,
  }));

  // Filet de sécurité uniquement : après deriveNarrativeGraph, aucun nœud sans
  // arête ne devrait arriver ici. S'il en arrive un, il est exclu de la
  // simulation (une physique de forces n'a rien à dire d'un nœud sans relation)
  // et remonté à l'appelant plutôt que dessiné à une position inventée.
  const orphans: LaidOutNode[] = orphanNodes.map((node) => ({
    ...node,
    x: NaN,
    y: NaN,
    degree: 0,
    weightedDegree: 0,
    display: node.fr?.title ?? node.fr?.label ?? node.label,
  }));

  const byId = new Map([...nodes, ...orphans].map((nd) => [nd.id, nd]));

  return { nodes, edges, byId, neighbors, orphans };
}

export const VIEWBOX = { width: WIDTH, height: HEIGHT };


/* --------------------------------------------------------------------------
 * Placement des labels et hierarchie visuelle — extraits tels quels de
 * prototype-persistance-canvas/app/data-dna/page.tsx (prototype gele, §04.8).
 *
 * SEULE difference avec le prototype : le parametre `level: "A" | "B" | "C"`
 * disparait. A et B etaient des instruments de TEST, pas des modes destines au
 * visiteur ; le site ne rend qu'un seul etat (hierarchie + interaction). Les
 * VALEURS conservees sont exactement celles du niveau B valide — la branche
 * `level === "A"` (rayon uniforme de 4 px) etait du gabarit de test.
 * -------------------------------------------------------------------------- */

/** Ordre de peinture : ce qui structure la lecture passe par-dessus. Déclaré
 *  avant le composant — un `const` module placé après lui reste dans la zone
 *  morte temporelle pour certains ordres d'évaluation du bundle client, ce qui
 *  casse l'hydratation sans casser le rendu serveur (page affichée, boutons
 *  inertes). */
export const LAYERS: LaidOutNode["type"][][] = [
  ["capability"],
  ["experiment", "experience"],
  ["pillar", "output"],
];

export function nodeRadius(n: LaidOutNode): number {
  switch (n.type) {
    case "output":
      return 16;
    case "pillar":
      return 11 + n.weightedDegree * 0.55;
    case "experiment":
    case "experience":
      return 7 + n.weightedDegree * 0.32;
    default:
      return 3 + n.weightedDegree * 0.5;
  }
}

export function labelFontSize(n: LaidOutNode): number {
  if (n.type === "pillar") return 14;
  if (n.type === "output") return 11;
  if (n.type === "capability") return 9.5;
  return 12.5;
}

export function isStructural(n: LaidOutNode) {
  return n.type === "pillar" || n.type === "output";
}

type Box = { x0: number; y0: number; x1: number; y1: number };
const overlaps = (a: Box, b: Box) =>
  a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

/**
 * Placement des étiquettes par évitement de collision.
 *
 * Le cœur du graphe est dense — c'est un fait structurel du profil, pas un
 * défaut à corriger en déplaçant les nœuds. Mais des étiquettes qui se
 * chevauchent, elles, sont un défaut de rendu : elles feraient juger le
 * placement du texte au lieu de la structure. On ne bouge donc jamais un nœud ;
 * on choisit, pour chaque label, la position la moins encombrée parmi quatre,
 * en traitant d'abord les nœuds les plus structurants (ils gagnent la place).
 */
export function placeLabels(nodes: LaidOutNode[]) {
  const rank = (n: LaidOutNode) =>
    n.type === "pillar" ? 0 : n.type === "output" ? 1 : n.type === "capability" ? 3 : 2;

  // Les nœuds eux-mêmes sont des obstacles : un label ne doit jamais recouvrir
  // un disque, même celui d'un autre nœud.
  const obstacles: Box[] = nodes.map((n) => {
    const r = nodeRadius(n) + 1.5;
    return { x0: n.x - r, y0: n.y - r, x1: n.x + r, y1: n.y + r };
  });

  const placed = new Map<
    string,
    { dx: number; dy: number; anchor: "start" | "middle" | "end" }
  >();

  const ordered = [...nodes].sort((a, b) => rank(a) - rank(b) || b.weightedDegree - a.weightedDegree);

  for (const n of ordered) {
    const r = nodeRadius(n);
    const fs = labelFontSize(n);
    // Largeur approchée : suffisant pour de la détection de chevauchement, et
    // évite de mesurer 27 textes dans le DOM à chaque rendu.
    const w = n.display.length * fs * (isStructural(n) ? 0.72 : 0.55);
    const h = fs * 1.15;

    const vx = n.x - VIEWBOX.width / 2;
    const vy = n.y - VIEWBOX.height / 2;

    const candidates = [
      { dx: 0, dy: r + fs + 5, anchor: "middle" as const, dir: [0, 1] },
      { dx: 0, dy: -(r + 7), anchor: "middle" as const, dir: [0, -1] },
      { dx: r + 7, dy: fs * 0.36, anchor: "start" as const, dir: [1, 0] },
      { dx: -(r + 7), dy: fs * 0.36, anchor: "end" as const, dir: [-1, 0] },
    ];

    let best = candidates[0];
    let bestScore = Infinity;
    for (const c of candidates) {
      const x = n.x + c.dx;
      const y = n.y + c.dy;
      const x0 = c.anchor === "middle" ? x - w / 2 : c.anchor === "start" ? x : x - w;
      const box: Box = { x0, y0: y - h * 0.8, x1: x0 + w, y1: y + h * 0.25 };

      let score = 0;
      for (const o of obstacles) if (overlaps(box, o)) score += 3;
      for (const [id, p] of placed) {
        const other = nodes.find((nd) => nd.id === id)!;
        const ofs = labelFontSize(other);
        const ow = other.display.length * ofs * (isStructural(other) ? 0.72 : 0.55);
        const ox = other.x + p.dx;
        const oy = other.y + p.dy;
        const ox0 =
          p.anchor === "middle" ? ox - ow / 2 : p.anchor === "start" ? ox : ox - ow;
        if (
          overlaps(box, {
            x0: ox0,
            y0: oy - ofs * 0.92,
            x1: ox0 + ow,
            y1: oy + ofs * 0.29,
          })
        )
          score += 4;
      }
      // Sort du cadre : rédhibitoire.
      if (box.x0 < 4 || box.x1 > VIEWBOX.width - 4 || box.y0 < 4) score += 20;
      // À encombrement égal, on préfère la direction qui éloigne du centre du
      // nuage : les étiquettes s'ouvrent vers l'extérieur plutôt que vers
      // l'intérieur, ce qui garde le cœur lisible.
      const outward = Math.sign(vx) * c.dir[0] + Math.sign(vy) * c.dir[1];
      score += outward > 0 ? 0 : outward === 0 ? 0.4 : 0.8;

      if (score < bestScore) {
        bestScore = score;
        best = c;
      }
    }
    placed.set(n.id, { dx: best.dx, dy: best.dy, anchor: best.anchor });
  }

  return placed;
}
