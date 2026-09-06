// Instance liée aux données réelles.
//
// PARCOURS lit le GRAPHE NARRATIF (27/53), pas le dataset source : c'est déjà
// le cas du halo du HERO et du Data DNA de PROFIL. Conséquence directe et
// voulue : BUILD n'apparaît nulle part, y compris comme « produit » d'une
// expérience — l'arête `produces → build` n'existe plus dans ce graphe.

import experienceActions from "../../content/parcours/actions";
import { narrativeGraph } from "../data-dna/source";
import { deriveExperiences, type Experience } from "./derive";

/** Les 2 expériences professionnelles, dans l'ordre du dataset. */
export const experiences: Experience[] = deriveExperiences(
  narrativeGraph.nodes,
  narrativeGraph.edges,
  experienceActions
);

export type { Experience };
