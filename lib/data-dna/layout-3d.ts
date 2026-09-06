// Layout radial 3D du halo du HERO — extrait tel quel de
// prototype-persistance-canvas/lib/data-dna-layout.ts (prototype gele, §08.1).
//
// AUCUNE MODIFICATION : rayons compactes, angles de pilier, graine
// deterministe, angle des projets derive de la moyenne ponderee des piliers
// qu'ils alimentent. Les types sont importes depuis ./types au lieu d'etre
// redeclares — c'est la seule difference, et elle ne touche pas la logique.
//
// Ce module sera consomme par le HERO avec le graphe NARRATIF (27/53), pas
// avec les donnees brutes : c'est l'ecart E-1 du plan d'integration.

import type { DNAEdge, DNANode, PositionedNode } from "./types";

// Angle fixe par pillar — reprend la topologie du §04.2 du blueprint
// (AI / ML / AUTOMATION / DATA autour de BUILD), disposée en croix plutôt
// qu'en diagramme ASCII linéaire pour une scène 3D.
const PILLAR_ANGLE: Record<string, number> = {
  ai: Math.PI / 2, // haut
  ml: Math.PI, // gauche
  automation: (3 * Math.PI) / 2, // bas
  data: 0, // droite
};

// Petit hash déterministe (0..1) à partir d'une chaîne — sert de graine stable
// par nœud, jamais Math.random() (qui casserait la stabilité entre montages).
function seededFraction(id: string, salt: number): number {
  let h = salt;
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i);
    h |= 0;
  }
  return (Math.abs(h) % 10000) / 10000;
}

export function computeLayout(
  nodes: DNANode[],
  edges: DNAEdge[]
): PositionedNode[] {
  const pillarAngleById = new Map<string, number>();
  for (const n of nodes) {
    if (n.type === "pillar" && n.cluster) {
      pillarAngleById.set(n.id, PILLAR_ANGLE[n.cluster]);
    }
  }

  // Rayons compactés (2026-09-05, après test du Hero) : le halo doit tenir
  // dans une zone à droite du nom, jamais la concurrencer. Voir DataDNAHero.tsx
  // pour le décalage + la rotation bornée qui complètent cette contrainte.
  const RING_CORE = 0;
  const RING_PILLAR = 0.8;
  const RING_PROJECT = 1.5;
  const RING_CAPABILITY = 2.2;

  // Angle "naturel" d'un projet/expérience : moyenne des angles des pillars
  // auxquels il envoie une arête feeds, pondérée par le poids de l'arête —
  // dérivé du vrai graphe, jamais une position choisie à la main.
  const experimentAngle = new Map<string, number>();
  for (const n of nodes) {
    if (n.type !== "experiment" && n.type !== "experience") continue;
    const feeds = edges.filter((e) => e.from === n.id && e.kind === "feeds");
    if (feeds.length === 0) {
      experimentAngle.set(n.id, seededFraction(n.id, 1) * Math.PI * 2);
      continue;
    }
    let sx = 0,
      sy = 0,
      total = 0;
    for (const e of feeds) {
      const angle = pillarAngleById.get(e.to);
      if (angle === undefined) continue;
      sx += Math.cos(angle) * e.weight;
      sy += Math.sin(angle) * e.weight;
      total += e.weight;
    }
    experimentAngle.set(n.id, total > 0 ? Math.atan2(sy, sx) : 0);
  }

  return nodes.map((n): PositionedNode => {
    let ring: PositionedNode["ring"];
    let radius: number;
    let angle: number;

    if (n.type === "output") {
      ring = "core";
      radius = RING_CORE;
      angle = 0;
    } else if (n.type === "pillar") {
      ring = "pillar";
      radius = RING_PILLAR;
      angle = n.cluster ? PILLAR_ANGLE[n.cluster] : 0;
    } else if (n.type === "experiment" || n.type === "experience") {
      ring = "project";
      radius = RING_PROJECT;
      angle = experimentAngle.get(n.id) ?? 0;
      // léger décalage stable pour ne pas empiler deux projets sur le même rayon
      angle += (seededFraction(n.id, 2) - 0.5) * 0.5;
    } else {
      ring = "capability";
      radius = RING_CAPABILITY;
      const base = n.cluster ? PILLAR_ANGLE[n.cluster] : 0;
      // dispersion stable autour de l'ancre du cluster, +/- ~35°
      angle = base + (seededFraction(n.id, 3) - 0.5) * ((70 * Math.PI) / 180);
    }

    // légère élévation hors du plan pour donner du volume à la scène
    const y = (seededFraction(n.id, 4) - 0.5) * radius * 0.5;

    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    return { ...n, position: [x, y, z], ring };
  });
}
