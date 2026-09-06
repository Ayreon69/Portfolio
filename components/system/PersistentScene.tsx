"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import HeroHalo from "@/components/hero/HeroHalo";
import type { DNAEdge, DNANode } from "@/lib/data-dna/types";

/**
 * Le canvas persistant — pattern validé §07.1.
 *
 * 1. Monté dans `app/layout.tsx` RACINE, jamais dans un `page.tsx` ni un layout
 *    de segment : il ne se démonte donc jamais lors d'une navigation client.
 * 2. Il lit `usePathname()` pour DÉRIVER son état — jamais pour se recréer.
 *    Le système « change d'état », il ne se rejoue pas (§04.6).
 * 3. Le texte ne l'attend jamais : chargé dynamiquement, sans SSR.
 *
 * La transition HERO → section suivante est un simple fondu d'opacité piloté
 * par un IntersectionObserver. Pas de morphing entre les deux layouts : il
 * imposerait une géométrie commune, donc des positions choisies pour la
 * transition — ce qui violerait la règle « aucune position choisie
 * manuellement ». Pas de travelling caméra non plus : le scroll reste un
 * scroll.
 */
export default function PersistentScene({
  nodes,
  edges,
}: {
  nodes: DNANode[];
  edges: DNAEdge[];
}) {
  const pathname = usePathname();
  const isHero = pathname === "/";

  // Preuve de persistance (§07.1), et non simple diagnostic : cet horodatage
  // est figé à la PREMIÈRE exécution du composant. S'il reste identique après
  // une navigation client vers /laboratoire/<slug> et retour, c'est que le
  // canvas n'a jamais été démonté. C'est exactement le protocole du prototype.
  // Aucun risque de désynchronisation SSR : SystemLayer monte ce composant
  // sans rendu serveur.
  const [mountedAt] = useState(() => Date.now());

  const [still, setStill] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Opacité du halo : 1 sur le HERO, 0 une fois la section suivante installée.
  // Calculée dans le callback de l'IntersectionObserver — aucun écouteur de
  // scroll, aucune boucle d'animation supplémentaire.
  //
  // La cible est la PREMIÈRE section après le HERO, dans l'ordre du document :
  // PHILOSOPHIE aujourd'hui, PROFIL si elle n'est pas montée. C'est là que
  // "les connexions se simplifient" (§04.6) — la boucle qui apparaît alors est
  // du texte, pas un second système 3D. Point d'accroche si un jour un état
  // PHILOSOPHIE du système est développé : ici, et nulle part ailleurs.
  const [haloOpacity, setHaloOpacity] = useState(1);
  useEffect(() => {
    const target = document.querySelector("#philosophie, #profil");
    if (!target) {
      setHaloOpacity(1);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        const vh = window.innerHeight || 1;
        // Progression de l'entrée de la section dans le viewport : le halo a
        // entièrement cédé quand la section a monté d'une demi-hauteur d'écran.
        const entered = vh - entry.boundingClientRect.top;
        const progress = Math.min(1, Math.max(0, entered / (vh * 0.5)));
        setHaloOpacity(1 - progress);
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <div
      aria-hidden="true"
      data-persistent-scene
      data-route={pathname}
      data-mounted-at={mountedAt}
      data-halo-nodes={nodes.length}
      data-halo-edges={edges.length}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        // Le système n'intercepte jamais les événements du contenu : c'est le
        // texte qui prime. Le halo lit le pointeur au niveau de la fenêtre.
        pointerEvents: "none",
        opacity: haloOpacity,
        transition: "opacity 320ms linear",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 6] }}
        // `demand` sous reduced-motion : la scène est rendue puis se tait.
        frameloop={still ? "demand" : "always"}
      >
        {isHero && <HeroHalo nodes={nodes} edges={edges} still={still} />}
      </Canvas>
    </div>
  );
}
