"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { DNAEdge, DNANode } from "@/lib/data-dna/types";

/**
 * PROTOTYPE B — « Living Infrastructure » — HERO, alternative à DataSculpture.
 *
 * Rejet du prototype A (2026-09-06) : même travaillé (arcs, matière,
 * éclairage), le rendu restait lisible comme « boules + lignes = réseau » —
 * trop proche du langage visuel générique des démos Three.js. Ce composant
 * change de grammaire visuelle entière : AUCUNE sphère, AUCUN segment
 * nœud-à-nœud. Le Data DNA détermine une structure architecturale — plaques,
 * poutres, densité de surface — jamais un graphe.
 *
 * DATA DNA → STRUCTURE → ARCHITECTURE (jamais → GRAPH 3D) :
 * - 4 piliers → 4 plaques primaires, dimensionnées par leur degré pondéré
 *   réel (somme des poids `feeds` entrants) — PAS une taille éditoriale.
 * - 7 expériences/projets → 7 plaques secondaires, plus petites, positionnées
 *   à la moyenne pondérée des piliers qu'elles alimentent (même principe que
 *   le layout gelé du prototype A, réimplémenté ici localement).
 * - 17 arêtes `feeds` → 17 poutres fines reliant CORNER à CORNER deux
 *   plaques, jamais centre-à-centre façon ligne de graphe.
 * - 36 arêtes `uses` (→ 16 capabilities) → jamais dessinées comme des
 *   segments : elles deviennent la DENSITÉ de petites marques de surface sur
 *   la plaque du pilier de leur cluster. C'est la règle explicite du brief :
 *   « aucune arête ne doit simplement devenir une ligne entre deux boules ».
 *
 * Aucune sphère dans tout ce fichier — seulement des volumes rectangulaires
 * très fins (plaques), des poutres (boîtes fines orientées), et de minuscules
 * marques plates (rivets). C'est ce qui doit lire comme une architecture,
 * pas comme un réseau de neurones.
 */

// Même convention que §04.2 (AI en haut, ML à gauche, AUTOMATION en bas,
// DATA à droite), réexprimée en direction unitaire — indépendant du layout
// gelé de layout-3d.ts, jamais importé ni modifié ici.
const PILLAR_DIR: Record<string, [number, number]> = {
  ai: [0, 1],
  ml: [-1, 0],
  automation: [0, -1],
  data: [1, 0],
};

const INK = "#1a1a18";
const WARM = "#8a7f6a";

type PillarPlate = {
  id: string;
  label: string;
  center: THREE.Vector3;
  size: [number, number, number];
  rotationY: number;
  appearAt: number;
};

type ExperimentPlate = {
  id: string;
  center: THREE.Vector3;
  size: [number, number, number];
  rotationY: number;
  feedsTo: string[]; // ids de plaques pilier atteintes
  appearAt: number;
};

type Mark = {
  id: string;
  plateId: string; // pilier hôte
  local: [number, number]; // position locale sur la surface, -0.5..0.5
  appearAt: number;
};

type Beam = {
  a: THREE.Vector3;
  b: THREE.Vector3;
  appearAt: number;
};

function hash(id: string, salt: number): number {
  let h = salt;
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i);
    h |= 0;
  }
  return (Math.abs(h) % 10000) / 10000;
}

/**
 * Construit la structure architecturale à partir du graphe narratif réel.
 * Aucune dimension, position ou densité n'est éditoriale : tout dérive des
 * arêtes et de leurs poids.
 */
function buildStructure(nodes: DNANode[], edges: DNAEdge[], compact: boolean) {
  const pillars = nodes.filter((n) => n.type === "pillar" && n.cluster);
  const experiments = nodes.filter((n) => n.type === "experiment" || n.type === "experience");
  const capabilities = compact ? [] : nodes.filter((n) => n.type === "capability");

  const feeds = edges.filter((e) => e.kind === "feeds");
  const uses = edges.filter((e) => e.kind === "uses");

  // Degré pondéré réel de chaque pilier — détermine sa taille de plaque.
  const pillarWeight = new Map<string, number>();
  for (const e of feeds) {
    pillarWeight.set(e.to, (pillarWeight.get(e.to) ?? 0) + e.weight);
  }
  const maxPillarWeight = Math.max(1, ...pillarWeight.values());

  // Quatre plaques primaires, en profondeur étagée (façon plateaux d'un
  // bâtiment vu en perspective) plutôt qu'en étoile radiale — c'est
  // l'étoile radiale qui, dans le prototype A, ramenait immédiatement au
  // langage du graphe.
  const zByIndex = [-1.1, -0.4, 0.35, 1.05];
  const pillarPlates = new Map<string, PillarPlate>();
  pillars.forEach((p, i) => {
    const dir = p.cluster ? PILLAR_DIR[p.cluster] : [0, 0];
    const w = pillarWeight.get(p.id) ?? 0;
    const sizeFactor = 0.5 + (w / maxPillarWeight) * 0.9;
    const z = zByIndex[i % zByIndex.length];
    const center = new THREE.Vector3(dir[0] * 0.55, dir[1] * 0.4, z);
    pillarPlates.set(p.id, {
      id: p.id,
      label: p.cluster ?? p.id,
      center,
      size: [1.1 * sizeFactor, 0.72 * sizeFactor, 0.035],
      rotationY: (hash(p.id, 41) - 0.5) * 0.25,
      appearAt: 0.05 + i * 0.05,
    });
  });

  // Plaques secondaires (expériences) — moyenne pondérée des piliers
  // qu'elles alimentent, exactement le principe déjà validé du layout gelé,
  // réimplémenté ici sans y toucher.
  const experimentWeight = new Map<string, number>();
  for (const e of feeds) {
    experimentWeight.set(e.from, (experimentWeight.get(e.from) ?? 0) + e.weight);
  }
  const maxExpWeight = Math.max(1, ...experimentWeight.values());

  const experimentPlates: ExperimentPlate[] = experiments.map((exp, i) => {
    const own = feeds.filter((e) => e.from === exp.id);
    let acc = new THREE.Vector3();
    let total = 0;
    const feedsTo: string[] = [];
    for (const e of own) {
      const plate = pillarPlates.get(e.to);
      if (!plate) continue;
      acc = acc.add(plate.center.clone().multiplyScalar(e.weight));
      total += e.weight;
      feedsTo.push(e.to);
    }
    const center = total > 0 ? acc.multiplyScalar(1 / total) : new THREE.Vector3();
    // Décalée vers la caméra par rapport à la moyenne de ses piliers : une
    // plaque plus petite, suspendue légèrement en avant de la structure
    // qu'elle alimente.
    center.z += 0.55 + hash(exp.id, 42) * 0.3;
    center.x += (hash(exp.id, 43) - 0.5) * 0.5;
    center.y += (hash(exp.id, 44) - 0.5) * 0.35;

    const w = experimentWeight.get(exp.id) ?? 0;
    const sizeFactor = 0.35 + (w / maxExpWeight) * 0.4;

    return {
      id: exp.id,
      center,
      size: [0.5 * sizeFactor, 0.32 * sizeFactor, 0.025],
      rotationY: (hash(exp.id, 45) - 0.5) * 0.4,
      feedsTo,
      appearAt: 0.35 + i * 0.04,
    };
  });

  const experimentById = new Map(experimentPlates.map((p) => [p.id, p]));

  // Poutres : une par arête `feeds`, coin à coin entre deux VOLUMES, jamais
  // centre à centre entre deux points — ce qui les distingue d'un trait de
  // graphe reliant deux nœuds.
  const beams: Beam[] = [];
  feeds.forEach((e, i) => {
    const exp = experimentById.get(e.from);
    const pillar = pillarPlates.get(e.to);
    if (!exp || !pillar) return;
    const cornerA = exp.center
      .clone()
      .add(new THREE.Vector3((hash(e.from + e.to, 46) - 0.5) * exp.size[0], (hash(e.from + e.to, 47) - 0.5) * exp.size[1], -exp.size[2]));
    const cornerB = pillar.center
      .clone()
      .add(new THREE.Vector3((hash(e.to + e.from, 48) - 0.5) * pillar.size[0], (hash(e.to + e.from, 49) - 0.5) * pillar.size[1], pillar.size[2]));
    beams.push({ a: cornerA, b: cornerB, appearAt: 0.65 + i * 0.02 });
  });

  // Marques de surface : les arêtes `uses` ne sont jamais des lignes — elles
  // deviennent la densité de petits repères sur la plaque du pilier de leur
  // cluster. Une capability utilisée par plusieurs expériences (plusieurs
  // `uses`) obtient plusieurs marques, légèrement dispersées : la densité
  // porte l'information, pas un tracé.
  const marks: Mark[] = [];
  capabilities.forEach((cap) => {
    const plate = cap.cluster ? pillarPlates.get(`pillar-${cap.cluster}`) : undefined;
    const hostId = plate ? plate.id : pillars[0]?.id;
    if (!hostId) return;
    const usesForCap = uses.filter((e) => e.to === cap.id);
    const count = Math.max(1, usesForCap.length);
    for (let i = 0; i < count; i++) {
      const salt = 50 + i;
      marks.push({
        id: `${cap.id}-${i}`,
        plateId: hostId,
        local: [hash(cap.id, salt) - 0.5, hash(cap.id, salt + 1) - 0.5],
        appearAt: 0.8 + hash(cap.id, salt + 2) * 0.3,
      });
    }
  });

  return { pillarPlates: [...pillarPlates.values()], experimentPlates, beams, marks };
}

function easeOutCubic(t: number) {
  const c = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - c, 3);
}

function Plate({
  plate,
  elapsedRef,
  still,
}: {
  plate: PillarPlate | ExperimentPlate;
  elapsedRef: React.RefObject<number>;
  still: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = useMemo(
    () => new THREE.BoxGeometry(plate.size[0], plate.size[1], plate.size[2]),
    [plate.size]
  );
  const edgesGeometry = useMemo(() => new THREE.EdgesGeometry(geometry), [geometry]);
  useEffect(() => () => {
    geometry.dispose();
    edgesGeometry.dispose();
  }, [geometry, edgesGeometry]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = still ? 1 : easeOutCubic(((elapsedRef.current ?? 0) - plate.appearAt) / 0.45);
    mesh.scale.set(1, 1, t);
    (mesh.material as THREE.MeshStandardMaterial).opacity = 0.94 * t;
  });

  return (
    <group position={plate.center} rotation={[0, plate.rotationY, 0]}>
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial color={INK} roughness={0.92} metalness={0.04} transparent opacity={0} />
      </mesh>
      <lineSegments geometry={edgesGeometry}>
        <lineBasicMaterial color={WARM} transparent opacity={0.35} />
      </lineSegments>
    </group>
  );
}

function Beams({ beams, still }: { beams: Beam[]; still: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const items = useMemo(
    () =>
      beams.map((b) => {
        const dir = b.b.clone().sub(b.a);
        const length = dir.length();
        const mid = b.a.clone().add(b.b).multiplyScalar(0.5);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir.clone().normalize()
        );
        return { mid, length, quaternion, appearAt: b.appearAt };
      }),
    [beams]
  );

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    const elapsed = still ? 999 : clock.elapsedTime;
    group.children.forEach((child, i) => {
      const t = still ? 1 : easeOutCubic((elapsed - items[i].appearAt) / 0.3);
      child.scale.y = t;
    });
  });

  return (
    <group ref={groupRef}>
      {items.map((it, i) => (
        <mesh
          key={i}
          position={it.mid}
          ref={(m) => {
            if (m) m.quaternion.copy(it.quaternion);
          }}
        >
          <boxGeometry args={[0.012, it.length, 0.012]} />
          <meshStandardMaterial color={WARM} roughness={0.7} transparent opacity={0.55} />
        </mesh>
      ))}
    </group>
  );
}

function Marks({
  marks,
  plates,
  still,
}: {
  marks: Mark[];
  plates: (PillarPlate | ExperimentPlate)[];
  still: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const plateById = useMemo(() => new Map(plates.map((p) => [p.id, p])), [plates]);

  const positioned = useMemo(
    () =>
      marks
        .map((m) => {
          const plate = plateById.get(m.plateId);
          if (!plate) return null;
          const local = new THREE.Vector3(
            m.local[0] * plate.size[0],
            m.local[1] * plate.size[1],
            plate.size[2] / 2 + 0.004
          );
          local.applyEuler(new THREE.Euler(0, plate.rotationY, 0));
          return { position: plate.center.clone().add(local), appearAt: m.appearAt };
        })
        .filter((x): x is { position: THREE.Vector3; appearAt: number } => x !== null),
    [marks, plateById]
  );

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    const elapsed = still ? 999 : clock.elapsedTime;
    group.children.forEach((child, i) => {
      const t = still ? 1 : easeOutCubic((elapsed - positioned[i].appearAt) / 0.25);
      child.scale.setScalar(t);
    });
  });

  return (
    <group ref={groupRef}>
      {positioned.map((p, i) => (
        <mesh key={i} position={p.position}>
          <boxGeometry args={[0.02, 0.02, 0.006]} />
          <meshStandardMaterial color={WARM} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

export default function LivingInfrastructure({
  nodes,
  edges,
  still,
  compact,
}: {
  nodes: DNANode[];
  edges: DNAEdge[];
  /** `prefers-reduced-motion` : structure finale immédiate, sans construction ni dérive. */
  still: boolean;
  /** Petit écran : retire les marques de capability, garde la structure porteuse. */
  compact: boolean;
}) {
  const structure = useMemo(() => buildStructure(nodes, edges, compact), [nodes, edges, compact]);
  const allPlates = useMemo(
    () => [...structure.pillarPlates, ...structure.experimentPlates],
    [structure]
  );

  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const mountedAtRef = useRef(0);
  const elapsedRef = useRef(0);
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
    elapsedRef.current = elapsed;

    if (still) {
      group.position.set(0, 0, 0);
      group.rotation.set(0, 0, 0);
      if (lightRef.current) lightRef.current.position.set(-1.5, 1, 3);
      return;
    }

    // Dérive quasi immobile — une infrastructure ne respire pas, elle tient.
    group.rotation.y = Math.sin(elapsed * 0.07) * 0.05;
    group.rotation.x = Math.sin(elapsed * 0.05 + 2) * 0.025;

    if (interactive.current) {
      const targetX = pointerRef.current.x * 0.14;
      const targetY = pointerRef.current.y * 0.08;
      group.position.x += (targetX - group.position.x) * 0.025;
      group.position.y += (targetY - group.position.y) * 0.025;

      const targetRotY = pointerRef.current.x * 0.06;
      group.rotation.y += (targetRotY - group.rotation.y) * 0.02;

      if (lightRef.current) {
        const lx = pointerRef.current.x * 2.4;
        const ly = pointerRef.current.y * 1.6;
        lightRef.current.position.x += (lx - lightRef.current.position.x) * 0.04;
        lightRef.current.position.y += (ly + 0.6 - lightRef.current.position.y) * 0.04;
      }
    }
  });

  return (
    <group position={[3.2, 0, -1]}>
      <ambientLight intensity={0.6} color="#f4efe4" />
      <directionalLight position={[2, 3, 4]} intensity={0.3} color="#f4efe4" />
      <pointLight ref={lightRef} position={[-1.5, 1, 3]} intensity={0.55} color="#fffaf0" distance={6} decay={2} />

      <group ref={groupRef}>
        {allPlates.map((p) => (
          <Plate key={p.id} plate={p} elapsedRef={elapsedRef} still={still} />
        ))}
        <Beams beams={structure.beams} still={still} />
        <Marks marks={structure.marks} plates={allPlates} still={still} />
      </group>
    </group>
  );
}
