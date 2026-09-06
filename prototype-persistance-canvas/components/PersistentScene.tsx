"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import DataDNAHero from "@/components/DataDNAHero";
import { useSystemVisibility } from "@/lib/system-visibility";

// Couleur et vitesse de rotation dérivées de la route courante : le système
// "change d'état" au lieu de se recréer, conformément au §07.1 du blueprint.
function routeState(pathname: string) {
  if (pathname.startsWith("/laboratoire")) {
    return { color: "#e0704a", speed: 2.2, label: "LABORATOIRE" };
  }
  return { color: "#4a90e0", speed: 0.6, label: "HERO" };
}

function RotatingMesh({ onFrame }: { onFrame: () => void }) {
  const meshRef = useRef<import("three").Mesh>(null);
  const pathname = usePathname();
  const { color, speed } = routeState(pathname);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * speed;
      meshRef.current.rotation.y += delta * speed * 0.7;
    }
    onFrame();
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.4, 0]} />
      <meshStandardMaterial color={color} wireframe />
    </mesh>
  );
}

export default function PersistentScene() {
  const pathname = usePathname();
  const isHero = pathname === "/";
  // Sur /data-dna, le Data DNA EST le contenu de la page (rendu en 2D, lisible).
  // Le canvas reste monté — la règle de persistance (§07.1) ne bouge pas — mais
  // il ne rend rien : superposer une scène 3D derrière une visualisation à lire
  // n'ajouterait aucune compréhension, donc ça se supprime.
  const isEmptyScene = pathname.startsWith("/data-dna");
  const { hidden } = useSystemVisibility();

  // Fixé une seule fois, côté client uniquement (évite le mismatch
  // d'hydratation SSR/client sur Date.now()) : si ce composant est démonté
  // puis remonté au changement de route, ce timestamp change. S'il ne change
  // jamais, le canvas a survécu à la navigation.
  const [mountedAt, setMountedAt] = useState<string | null>(null);
  useEffect(() => {
    setMountedAt((prev) => prev ?? new Date().toISOString());
  }, []);
  const frameCountRef = useRef(0);
  const [frameCount, setFrameCount] = useState(0);

  const handleFrame = () => {
    frameCountRef.current += 1;
    // Ne met à jour l'état React (donc le DOM) qu'une fois par ~30 frames :
    // évite de spammer un re-render à 60fps juste pour l'affichage de preuve.
    if (frameCountRef.current % 30 === 0) {
      setFrameCount(frameCountRef.current);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "auto",
        // §08.1 : le canvas ne monte/démonte jamais avec la route (persistance,
        // §07.1) — mais peut être masqué visuellement pour le test
        // d'acceptation "le Hero reste-t-il excellent sans le système ?".
        visibility: hidden ? "hidden" : "visible",
      }}
    >
      <Canvas camera={{ position: [0, 0, isHero ? 6 : 4] }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[5, 5, 5]} />
        {isEmptyScene ? null : isHero ? (
          <DataDNAHero />
        ) : (
          <RotatingMesh onFrame={handleFrame} />
        )}
      </Canvas>

      <div
        id="persistence-proof"
        style={{
          display: isEmptyScene ? "none" : "block",
          position: "fixed",
          bottom: 12,
          right: 12,
          fontFamily: "monospace",
          fontSize: 11,
          color: "#111",
          background: "rgba(255,255,255,0.85)",
          padding: "6px 10px",
          borderRadius: 6,
          lineHeight: 1.5,
          pointerEvents: "none",
        }}
      >
        <div>
          monté à : <strong id="mounted-at">{mountedAt ?? "…"}</strong>
        </div>
        <div>
          route actuelle : <strong id="current-pathname">{pathname}</strong>
        </div>
        <div>
          frames rendus : <strong id="frame-count">{frameCount}</strong>
        </div>
      </div>
    </div>
  );
}
