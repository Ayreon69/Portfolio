"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  computeLayout,
  type DNAEdge,
  type DNANode,
  type PositionedNode,
} from "@/lib/data-dna-layout";

const RING_COLOR: Record<PositionedNode["ring"], string> = {
  core: "#1A1A18",
  pillar: "#1A1A18",
  project: "#E0704A", // même ambre que le prototype de persistance (§07.1)
  capability: "#8A7F6A",
};

const RING_SIZE: Record<PositionedNode["ring"], number> = {
  core: 0.09,
  pillar: 0.075,
  project: 0.06,
  capability: 0.035,
};

function useDNAData() {
  const [data, setData] = useState<{
    nodes: PositionedNode[];
    edges: DNAEdge[];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/data/nodes.json").then((r) => r.json()),
      fetch("/data/edges.json").then((r) => r.json()),
    ]).then(([rawNodes, rawEdges]: [DNANode[], DNAEdge[]]) => {
      if (cancelled) return;
      setData({ nodes: computeLayout(rawNodes, rawEdges), edges: rawEdges });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}

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
  // pas un <line> par arête (60 lignes ≠ 60 objets three.js).
  const geometry = useMemo(() => {
    const positions: number[] = [];
    for (const e of edges) {
      const a = byId.get(e.from);
      const b = byId.get(e.to);
      if (!a || !b) continue;
      positions.push(...a.position, ...b.position);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    return geo;
  }, [edges, byId]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        color="#8A7F6A"
        transparent
        opacity={0.22}
        depthWrite={false}
      />
    </lineSegments>
  );
}

function Nodes({
  nodes,
  hovered,
  onHover,
}: {
  nodes: PositionedNode[];
  hovered: string | null;
  onHover: (id: string | null) => void;
}) {
  return (
    <group>
      {nodes.map((n) => (
        <mesh
          key={n.id}
          position={n.position}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(n.id);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            if (hovered === n.id) onHover(null);
          }}
        >
          <sphereGeometry
            args={[hovered === n.id ? RING_SIZE[n.ring] * 1.8 : RING_SIZE[n.ring], 12, 12]}
          />
          <meshBasicMaterial color={RING_COLOR[n.ring]} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Le Data DNA réel (29 nœuds, 60 arêtes — data/nodes.json, data/edges.json)
 * comme halo autour du nom, pas comme remplacement du nom. Voir §08.1 :
 * si ce composant ne montait jamais, le Hero (nom + citation + rôle en HTML
 * réel, hors de ce canvas) doit rester complet — testé via le bouton
 * "masquer le système" dans app/page.tsx.
 */
export default function DataDNAHero() {
  const data = useDNAData();
  const [hovered, setHovered] = useState<string | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  const mountedAtRef = useRef(0);

  useEffect(() => {
    mountedAtRef.current = performance.now();
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const elapsed = (performance.now() - mountedAtRef.current) / 1000;
    // 0 -> ~1.2s : le système "arrive" (échelle 0 -> 1), déjà en mouvement.
    const introScale = Math.min(1, elapsed / 1.2);
    groupRef.current.scale.setScalar(introScale);

    // Dérive OSCILLANTE, bornée — pas une rotation continue à 360°. Une
    // rotation qui tourne indéfiniment balaie fatalement tout l'espace,
    // y compris la zone du texte. Un sway de +/-0.22 rad (~12°) reste
    // "vivant" (§06) sans jamais faire quitter la zone droite au halo.
    // Contrainte de composition actée le 2026-09-05 : le système encadre
    // le nom, il ne le concurrence jamais — résolu spatialement, pas en
    // z-index.
    const sway = Math.sin(elapsed * 0.18) * 0.22;
    groupRef.current.rotation.y = sway;

    // réaction douce à la souris (parallax), amortie et bornée — même
    // logique : "précise sur l'interface, vivante sur le système" (§06),
    // jamais au point de faire sortir le halo de sa zone.
    const targetX = pointer.y * 0.12;
    const targetZ = pointer.x * 0.12;
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.04;
    groupRef.current.rotation.z += (targetZ - groupRef.current.rotation.z) * 0.04;
  });

  if (!data) return null;

  // Décalage à droite du nom : le halo reste dans sa zone, quelques arêtes
  // peuvent visuellement "tendre" vers le centre (kind: 'feeds' vers build),
  // mais aucun nœud n'entre dans la zone typographique.
  return (
    <group position={[3.2, 0, -1]}>
      <group ref={groupRef}>
        <EdgeLines nodes={data.nodes} edges={data.edges} />
        <Nodes nodes={data.nodes} hovered={hovered} onHover={setHovered} />
      </group>
    </group>
  );
}
