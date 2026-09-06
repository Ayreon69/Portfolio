// SOURCE UNIQUE du Data DNA.
//
// Les données sont importées STATIQUEMENT depuis data/*.json à la racine du
// dépôt : elles entrent dans le bundle au build, il n'y a aucun fetch() et
// aucune copie dans public/. C'est ce qui rend le rendu serveur possible, donc
// le fallback sans JavaScript (§10.2).
//
// Le prototype chargeait les mêmes fichiers par fetch() dans un useEffect :
// sans JS, la page était vide. C'est le seul changement de flux entre le
// prototype et le site ; la dérivation elle-même est reprise à l'identique
// (voir ./derive.ts).
//
// Chemins relatifs volontaires : data/ vit à la racine du dépôt, hors de app/.

import rawNodes from "../../data/nodes.json";
import rawEdges from "../../data/edges.json";
import { deriveNarrativeGraph } from "./derive";
import type { DNAEdge, DNANode } from "./types";

/** Dataset source, complet et inchangé : 29 nœuds / 60 arêtes. */
export const sourceNodes = rawNodes as DNANode[];
export const sourceEdges = rawEdges as DNAEdge[];

/**
 * Graphe narratif canonique : 27 nœuds / 53 arêtes.
 *
 * Calculé une seule fois à l'import du module, côté serveur. C'est l'unique jeu
 * de données que consomment le halo du HERO et le Data DNA de PROFIL — « mêmes
 * données, deux niveaux de représentation » n'est vrai que si les deux lisent
 * bien cet objet-ci.
 */
export const narrativeGraph = deriveNarrativeGraph(sourceNodes, sourceEdges);
