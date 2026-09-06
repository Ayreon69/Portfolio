// Layout 2D du Data DNA pour la PAGE (pas pour le Hero).
//
// Distinction actée : le Hero rend le Data DNA comme atmosphère (3D, composition
// compacte, lib/data-dna-layout.ts) ; la page le rend comme information
// (2D, lisible, exploration). Mêmes données, deux niveaux de lecture.
//
// Principe du prototype : la position d'un nœud n'est JAMAIS choisie à la main.
// Elle est le résultat d'une simulation de forces qui ne connaît que les 60
// arêtes réelles. Si la structure réelle produit une zone dense et une zone
// vide, on la garde — c'est une information sur le profil, pas un défaut de
// composition à corriger.
//
// Conséquence importante pour le test : les 4 piliers ne sont PAS ancrés à des
// positions décidées d'avance. La question « est-ce que AI / ML / AUTOMATION /
// DATA apparaissent naturellement ? » ne peut recevoir une réponse honnête que
// si le layout n'est pas truqué pour garantir un oui.

export type DNANode = {
  id: string;
  label: string;
  type: "pillar" | "output" | "experiment" | "experience" | "capability";
  cluster: "ai" | "ml" | "automation" | "data" | null;
  fr?: { label?: string; title?: string };
};

export type DNAEdge = {
  from: string;
  to: string;
  kind: "feeds" | "uses" | "produces";
  weight: number;
};

export type LaidOutNode = DNANode & {
  x: number;
  y: number;
  degree: number;
  weightedDegree: number;
  /** Nom affichable : fr.title pour un projet, fr.label sinon, label en dernier. */
  display: string;
};

export type LaidOutGraph = {
  nodes: LaidOutNode[];
  edges: DNAEdge[];
  byId: Map<string, LaidOutNode>;
  /** ids des voisins, dans les deux sens. */
  neighbors: Map<string, Set<string>>;
  /** Nœuds sans aucune arête — sortis de la simulation, affichés à part,
   *  jamais masqués : un nœud non supporté par une grille §04.4 doit se voir. */
  orphans: LaidOutNode[];
};

export type Exclusion = { id: string; label: string; reason: string };

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
