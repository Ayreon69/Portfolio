"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { computeLayout } from "@/lib/data-dna/layout-3d";
import type { DNAEdge, DNANode, PositionedNode } from "@/lib/data-dna/types";

/**
 * PROTOTYPE A — « Data Sculpture » — HERO, remplace HeroHalo.
 *
 * Même donnée, autre lecture : `computeLayout` (§08.1, gelé, non modifié)
 * reste la seule source des positions — même topologie angulaire, mêmes
 * clusters, mêmes poids. Ce module ajoute une couche de mise en volume
 * PUREMENT locale (jitter 3D, taille par nœud, arcs courbes) pour que le
 * même graphe se lise comme une sculpture plutôt qu'un diagramme de
 * relations. Aucune arête ni aucun nœud n'est inventé — seule
 * l'interprétation spatiale change.
 *
 * Anti-cliché « réseau de neurones » : hiérarchie de taille très marquée
 * (peu de gros nœuds mats, beaucoup de petits), connexions en arcs (pas de
 * grille de segments droits), matériau mat éclairé (pas d'émissif/glow),
 * densité irrégulière plutôt qu'un maillage régulier.
 *
 * PROFIL (DataDNAGraph) reste la lecture analytique du même graphe ; ceci
 * est sa présence — « voici le système vivant », pas « voici comment mes
 * compétences se connectent ».
 */

const RING_SIZE: Record<PositionedNode["ring"], number> = {
  core: 0.2,
  pillar: 0.13,
  project: 0.085,
  capability: 0.03,
};

const RING_COLOR: Record<PositionedNode["ring"], string> = {
  core: "#1a1a18",
  pillar: "#1a1a18",
  project: "#2b2a26",
  capability: "#8a7f6a",
};

// Séquence d'apparition — un ring après l'autre, jamais tout d'un coup.
// Cf. §08.1 : « le système vient de se construire », pas « il apparaît ».
const RING_DELAY: Record<PositionedNode["ring"], number> = {
  core: 0,
  pillar: 0.15,
  project: 0.35,
  capability: 0.55,
};
const APPEAR_DURATION = 0.5;
const EDGES_START = 0.4;
const EDGES_END = 0.95;

function easeOutCubic(t: number) {
  const c = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - c, 3);
}

// Hash déterministe local — délibérément distinct de celui de layout-3d.ts
// (sel différent) : cette couche est une INTERPRÉTATION supplémentaire du
// graphe, pas une extension de son layout gelé.
function hash(id: string, salt: number): number {
  let h = salt;
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i);
    h |= 0;
  }
  return (Math.abs(h) % 10000) / 10000;
}

type SculptedNode = PositionedNode & {
  sizeScale: number;
  appearAt: number;
};

function sculpt(nodes: PositionedNode[]): SculptedNode[] {
  return nodes.map((n) => {
    const [x, y, z] = n.position;
    // Volume réel plutôt qu'un disque quasi plat : jitter sur les trois axes,
    // plus large en profondeur (z) pour donner plusieurs plans à la scène.
    const jx = (hash(n.id, 21) - 0.5) * 0.3;
    const jy = (hash(n.id, 22) - 0.5) * 0.3;
    const jz = (hash(n.id, 23) - 0.5) * 0.7;
    const sizeScale = 0.75 + hash(n.id, 24) * 0.6;
    const appearAt = RING_DELAY[n.ring] + hash(n.id, 25) * 0.12;
    return { ...n, position: [x + jx, y + jy, z + jz], sizeScale, appearAt };
  });
}

const CURVE_SEGMENTS = 10;

function buildCurvedEdges(byId: Map<string, SculptedNode>, edges: DNAEdge[]) {
  const positions: number[] = [];
  // Un même index de segment doit garder son point milieu de courbe pour que
  // l'opacité de "dessin" progressif reste lisible par arête entière.
  const edgeSpans: { start: number; count: number }[] = [];

  for (const e of edges) {
    const a = byId.get(e.from);
    const b = byId.get(e.to);
    if (!a || !b) continue;
    const pa = new THREE.Vector3(...a.position);
    const pb = new THREE.Vector3(...b.position);
    const mid = pa.clone().add(pb).multiplyScalar(0.5);
    // Arc qui bombe légèrement vers l'extérieur du centre : des fibres, pas
    // des câbles rectilignes — la principale rupture avec l'esthétique
    // "réseau de neurones".
    const outward = mid.clone();
    if (outward.lengthSq() < 0.0001) outward.set(0, 1, 0);
    outward.normalize().multiplyScalar(mid.length() * 0.16 + 0.12);
    const control = mid.add(outward);
    const curve = new THREE.QuadraticBezierCurve3(pa, control, pb);
    const pts = curve.getPoints(CURVE_SEGMENTS);

    const start = positions.length / 3;
    for (let i = 0; i < pts.length - 1; i++) {
      positions.push(pts[i].x, pts[i].y, pts[i].z, pts[i + 1].x, pts[i + 1].y, pts[i + 1].z);
    }
    edgeSpans.push({ start, count: (pts.length - 1) * 2 });
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return { geometry, edgeSpans };
}

export default function DataSculpture({
  nodes,
  edges,
  still,
  compact,
}: {
  nodes: DNANode[];
  edges: DNAEdge[];
  /** `prefers-reduced-motion` : structure finale immédiate, sans intro ni dérive. */
  still: boolean;
  /** Petit écran : on retire le nuage de capabilities, pas seulement sa taille. */
  compact: boolean;
}) {
  const sculpted = useMemo(() => {
    const base = computeLayout(nodes, edges);
    const filtered = compact ? base.filter((n) => n.ring !== "capability") : base;
    return sculpt(filtered);
  }, [nodes, edges, compact]);

  const byId = useMemo(() => {
    const m = new Map<string, SculptedNode>();
    for (const n of sculpted) m.set(n.id, n);
    return m;
  }, [sculpted]);

  const visibleEdges = useMemo(
    () => (compact ? edges.filter((e) => byId.has(e.from) && byId.has(e.to)) : edges),
    [edges, byId, compact]
  );

  const { geometry: edgeGeometry } = useMemo(
    () => buildCurvedEdges(byId, visibleEdges),
    [byId, visibleEdges]
  );
  useEffect(() => () => edgeGeometry.dispose(), [edgeGeometry]);

  const edgeMaterialRef = useRef<THREE.LineBasicMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);
  const nodeRefs = useRef<Map<string, THREE.Mesh>>(new Map());
  const lightRef = useRef<THREE.PointLight>(null);
  const mountedAtRef = useRef(0);

  // Cf. HeroHalo : le conteneur est `pointer-events: none`, donc R3F ne voit
  // jamais le pointeur — lecture au niveau de la fenêtre, comme le pattern
  // déjà validé.
  const pointerRef = useRef({ x: 0, y: 0 });
  const interactive = useRef(false);

  useEffect(() => {
    mountedAtRef.current = performance.now();
    interactive.current = window.matchMedia("(pointer: fine)").matches;
    if (still || !interactive.current) return;
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

    const elapsed = still ? 999 : (performance.now() - mountedAtRef.current) / 1000;

    // Apparition par nœud, ring après ring — jamais toute la structure d'un coup.
    for (const n of sculpted) {
      const mesh = nodeRefs.current.get(n.id);
      if (!mesh) continue;
      const t = still ? 1 : easeOutCubic((elapsed - n.appearAt) / APPEAR_DURATION);
      mesh.scale.setScalar(RING_SIZE[n.ring] * n.sizeScale * t);
    }

    if (edgeMaterialRef.current) {
      const t = still
        ? 1
        : easeOutCubic((elapsed - EDGES_START) / (EDGES_END - EDGES_START));
      edgeMaterialRef.current.opacity = 0.16 * t;
    }

    if (still) {
      group.position.set(0, 0, 0);
      group.rotation.set(0, 0, 0);
      if (lightRef.current) lightRef.current.position.set(-1.5, 1, 2);
      return;
    }

    // Dérive organique lente — deux fréquences superposées, jamais une
    // rotation continue qui balaierait la zone du texte.
    group.rotation.y = Math.sin(elapsed * 0.12) * 0.16 + Math.sin(elapsed * 0.05) * 0.08;
    group.rotation.x = Math.sin(elapsed * 0.09 + 1.4) * 0.05;

    if (interactive.current) {
      // Parallaxe : un léger déplacement, pas seulement une rotation — c'est
      // ce qui donne l'impression de profondeur plutôt que d'objet qui pivote.
      const targetX = pointerRef.current.x * 0.18;
      const targetY = pointerRef.current.y * 0.1;
      group.position.x += (targetX - group.position.x) * 0.03;
      group.position.y += (targetY - group.position.y) * 0.03;

      const targetRotX = pointerRef.current.y * 0.08;
      const targetRotZ = pointerRef.current.x * 0.08;
      group.rotation.x += (targetRotX - group.rotation.x) * 0.02;
      group.rotation.z += (targetRotZ - group.rotation.z) * 0.02;

      // La lumière suit le pointeur : elle révèle la matière sous des angles
      // différents plutôt que de faire tourner la caméra ou l'objet.
      if (lightRef.current) {
        const lx = pointerRef.current.x * 2.2;
        const ly = pointerRef.current.y * 1.6;
        lightRef.current.position.x += (lx - lightRef.current.position.x) * 0.04;
        lightRef.current.position.y += (ly + 0.6 - lightRef.current.position.y) * 0.04;
      }
    }
  });

  return (
    <group position={[3.2, 0, -1]}>
      <ambientLight intensity={0.55} color="#f4efe4" />
      <directionalLight position={[2, 3, 4]} intensity={0.35} color="#f4efe4" />
      <pointLight ref={lightRef} position={[-1.5, 1, 2]} intensity={0.6} color="#fffaf0" distance={6} decay={2} />

      <group ref={groupRef}>
        <lineSegments geometry={edgeGeometry}>
          <lineBasicMaterial ref={edgeMaterialRef} color="#8a7f6a" transparent opacity={0} depthWrite={false} />
        </lineSegments>

        {sculpted.map((n) => (
          <mesh
            key={n.id}
            position={n.position}
            scale={0}
            ref={(m) => {
              if (m) nodeRefs.current.set(n.id, m);
              else nodeRefs.current.delete(n.id);
            }}
          >
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color={RING_COLOR[n.ring]} roughness={0.85} metalness={0.05} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
