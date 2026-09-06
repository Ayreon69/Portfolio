"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { computeLayout } from "@/lib/data-dna/layout-3d";
import type { DNAEdge, DNANode, PositionedNode } from "@/lib/data-dna/types";

/**
 * Le halo du HERO — portage du prototype validé (§08.1), pas une réécriture.
 *
 * Mêmes données que PROFIL (le graphe narratif 27/53), layout indépendant :
 * radial et compact ici, simulation de forces là-bas. C'est ce qui donne son
 * sens à « mêmes données, deux niveaux de représentation » — le HERO comme
 * présence, PROFIL comme lecture.
 *
 * Conservé tel quel : décalage à droite du nom, oscillation bornée (jamais une
 * rotation à 360°, qui balaierait fatalement la zone typographique), parallax
 * souris amorti, intro à l'échelle sur ~1,2 s.
 *
 * Toujours pas de particules décoratives pour épeler le nom : le système montré
 * est le système réel, et rien d'autre.
 */

// Aucun accent projet. §03.3 est explicite : « un accent projet n'apparaît que
// sur la page de ce projet. Jamais dans la navigation globale, LE HERO, ou une
// autre page. » Le prototype colorait les nœuds `project` en #E0704A (l'accent
// Job Agent) ; le site s'en tient à l'encre et au neutre chaud, exactement
// comme le graphe de PROFIL.
const RING_COLOR: Record<PositionedNode["ring"], string> = {
  core: "#1a1a18",
  pillar: "#1a1a18",
  project: "#1a1a18",
  capability: "#8a7f6a",
};

const RING_SIZE: Record<PositionedNode["ring"], number> = {
  core: 0.09,
  pillar: 0.075,
  project: 0.06,
  capability: 0.035,
};

function EdgeLines({
  nodes,
  edges,
}: {
  nodes: PositionedNode[];
  edges: DNAEdge[];
}) {
  const byId = useMemo(() => {
    const m = new Map<string, PositionedNode>();
    for (const n of nodes) m.set(n.id, n);
    return m;
  }, [nodes]);

  // Une seule géométrie de segments pour toutes les arêtes : un draw call,
  // pas un objet three.js par arête.
  const geometry = useMemo(() => {
    const positions: number[] = [];
    for (const e of edges) {
      const a = byId.get(e.from);
      const b = byId.get(e.to);
      if (!a || !b) continue;
      positions.push(...a.position, ...b.position);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [edges, byId]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        color="#8a7f6a"
        transparent
        opacity={0.22}
        depthWrite={false}
      />
    </lineSegments>
  );
}

function Nodes({ nodes }: { nodes: PositionedNode[] }) {
  return (
    <group>
      {nodes.map((n) => (
        <mesh key={n.id} position={n.position}>
          <sphereGeometry args={[RING_SIZE[n.ring], 12, 12]} />
          <meshBasicMaterial color={RING_COLOR[n.ring]} />
        </mesh>
      ))}
    </group>
  );
}

export default function HeroHalo({
  nodes,
  edges,
  still,
}: {
  nodes: DNANode[];
  edges: DNAEdge[];
  /** `prefers-reduced-motion` : le système devient très calme, pas absent. */
  still: boolean;
}) {
  const positioned = useMemo(() => computeLayout(nodes, edges), [nodes, edges]);
  const groupRef = useRef<THREE.Group>(null);
  const mountedAtRef = useRef(0);

  // Le conteneur du canvas est en `pointer-events: none` : le système
  // n'intercepte jamais un clic destiné au contenu. R3F ne reçoit donc aucun
  // événement de pointeur, et son `pointer` resterait à zéro — d'où cette
  // lecture au niveau de la fenêtre. Le COMPORTEMENT validé est inchangé
  // (réaction subtile, amortie, bornée) ; seule la source du signal diffère.
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    mountedAtRef.current = performance.now();
    if (still) return;
    const onMove = (e: PointerEvent) => {
      pointerRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1),
      };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [still]);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    if (still) {
      group.scale.setScalar(1);
      group.rotation.set(0, 0, 0);
      return;
    }

    const elapsed = (performance.now() - mountedAtRef.current) / 1000;

    // 0 → ~1,2 s : le système « arrive » (échelle 0 → 1), déjà en mouvement.
    group.scale.setScalar(Math.min(1, elapsed / 1.2));

    // Dérive OSCILLANTE, bornée — pas une rotation continue à 360°. Une
    // rotation qui tourne indéfiniment balaie fatalement tout l'espace, y
    // compris la zone du texte. Un sway de ±0,22 rad (~12°) reste vivant sans
    // jamais faire quitter sa zone au halo. Contrainte de composition : le
    // système encadre le nom, il ne le concurrence jamais — résolu
    // spatialement, pas en z-index.
    group.rotation.y = Math.sin(elapsed * 0.18) * 0.22;

    const targetX = pointerRef.current.y * 0.12;
    const targetZ = pointerRef.current.x * 0.12;
    group.rotation.x += (targetX - group.rotation.x) * 0.04;
    group.rotation.z += (targetZ - group.rotation.z) * 0.04;
  });

  // Décalage à droite du nom : le halo reste dans sa zone. Aucun nœud n'entre
  // dans la zone typographique.
  return (
    <group position={[3.2, 0, -1]}>
      <group ref={groupRef}>
        <EdgeLines nodes={positioned} edges={edges} />
        <Nodes nodes={positioned} />
      </group>
    </group>
  );
}
