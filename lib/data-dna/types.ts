// Types du Data DNA. Extraits tels quels de
// prototype-persistance-canvas/lib/graph-layout.ts (prototype gele, §04.8).
// Aucune modification : le modele de donnees est fige.

export type ProofLevel = "live-demo" | "case-study";

/**
 * Champs deja presents dans data/nodes.json pour les noeuds `experiment` et
 * `experience`, jusqu'ici absents du type parce qu'aucun ecran ne les lisait.
 * LABORATOIRE les lit : le type est elargi pour DECRIRE la donnee existante.
 * Aucune valeur n'a ete ajoutee, modifiee ni deplacee dans data/nodes.json.
 * Tous optionnels : ils valent `null` sur les piliers et les capabilities.
 */
export type DNANode = {
  id: string;
  label: string;
  type: "pillar" | "output" | "experiment" | "experience" | "capability";
  cluster: "ai" | "ml" | "automation" | "data" | null;
  slug?: string;
  year?: number | null;
  status?: "live" | "archived" | "lost" | null;
  friction?: string | null;
  metric?: { value: string; label: string } | null;
  treatment?: string | null;
  mobileTreatment?: string | null;
  proofLevel?: ProofLevel | null;
  anonymized?: boolean;
  universe?: string | null;
  links?: { repo?: string; live?: string } | null;
  fr?: {
    label?: string;
    title?: string;
    description?: string;
    subtitle?: string | null;
    friction?: string | null;
    system?: string | null;
    result?: string | null;
    construction?: string | null;
    donnees?: string | null;
    recul?: string | null;
  };
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

/** Noeud place par le layout radial 3D du HERO (lib/data-dna/layout-3d.ts). */
export type PositionedNode = DNANode & {
  position: [number, number, number];
  ring: "core" | "pillar" | "project" | "capability";
};
