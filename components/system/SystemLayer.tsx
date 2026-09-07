"use client";

import dynamic from "next/dynamic";

import type { DNAEdge, DNANode } from "@/lib/data-dna/types";

/**
 * Frontière client du système visuel.
 *
 * `next/dynamic` avec `ssr: false` n'est pas autorisé dans un composant serveur
 * (Next 16) : ce wrapper est le plus petit composant client possible dont le
 * seul rôle est de porter cette contrainte, pour que `app/layout.tsx` reste un
 * composant serveur.
 *
 * L'effet recherché est inchangé : le canvas n'est jamais rendu côté serveur et
 * le texte ne l'attend pas (§00.4 / D-12), tout en restant monté dans le layout
 * racine, donc jamais démonté entre deux routes (§07.1).
 */
const PersistentScene = dynamic(() => import("./PersistentScene"), {
  ssr: false,
});

/**
 * Drapeau unique du système visuel — source de vérité depuis le 2026-09-07.
 *
 * `false` : le HERO est en direction éditoriale typographique, le système ne
 * dessine rien. Tant que rien n'est dessiné, monter le canvas ne garantit
 * aucune persistance — il ne persiste rien — mais coûte tout `three.js`
 * (~229 Ko gzip) sur la homepage. On ne rend donc PAS `PersistentScene` :
 * `next/dynamic` ne va chercher le module qu'au rendu, le chunk n'entre donc
 * jamais dans le graphe de la page.
 *
 * Toute l'infrastructure reste en place et compilée — `PersistentScene`,
 * `LivingInfrastructure`, `DataSculpture`, `HeroHalo`, `layout-3d.ts` : le
 * retour en arrière reste ce seul booléen, et `three` reste en dépendance
 * pour que le code désactivé continue de typechecker.
 */
export const SYSTEM_VISIBLE = false;

export default function SystemLayer({
  nodes,
  edges,
}: {
  nodes: DNANode[];
  edges: DNAEdge[];
}) {
  if (!SYSTEM_VISIBLE) return null;

  // Les données descendent du serveur : le HERO et PROFIL lisent le MÊME
  // graphe narratif 27/53, seuls leurs layouts diffèrent.
  return <PersistentScene nodes={nodes} edges={edges} />;
}
