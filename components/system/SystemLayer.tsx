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

export default function SystemLayer({
  nodes,
  edges,
}: {
  nodes: DNANode[];
  edges: DNAEdge[];
}) {
  // Les données descendent du serveur : le HERO et PROFIL lisent le MÊME
  // graphe narratif 27/53, seuls leurs layouts diffèrent.
  return <PersistentScene nodes={nodes} edges={edges} />;
}
