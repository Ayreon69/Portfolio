"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { DNAEdge, DNANode } from "@/lib/data-dna/types";
import DataDNAGraph from "./DataDNAGraph";
import styles from "./DataDNASurface.module.css";

/**
 * Décide laquelle des deux représentations est montrée.
 *
 * L'index (`children`, rendu côté serveur) est TOUJOURS dans le DOM. Le graphe
 * ne se monte que par-dessus, quand deux conditions sont réunies :
 *
 *   · `pointer: fine` — le Data System repose sur trois interactions
 *     inexistantes au doigt : position du curseur, survol, survol prolongé
 *     (§10.1). Détection par capacité, jamais par user-agent (§10.3) ;
 *   · viewport ≥ 900 px — en deçà, la bande périphérique libre du canvas
 *     (~29 % de sa largeur) ne suffit plus au panneau de détail. Seuil mesuré
 *     sur le prototype.
 *
 * Quand le graphe est monté, l'index reste lu par les technologies d'assistance
 * mais sort du flux visuel : un seul contenu accessible, jamais deux. Sous le
 * seuil, l'index est la représentation — « desktop = système spatial, mobile =
 * système indexé » (§10.1), pas une miniature du desktop.
 */
export default function DataDNASurface({
  nodes,
  edges,
  children,
}: {
  nodes: DNANode[];
  edges: DNAEdge[];
  children: ReactNode;
}) {
  // Faux au premier rendu : le serveur ne connaît ni le pointeur ni la largeur.
  // L'index est donc ce que voient le HTML initial, un crawler et un visiteur
  // sans JavaScript.
  const [showGraph, setShowGraph] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine) and (min-width: 900px)");
    const sync = () => setShowGraph(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <div className={styles.surface}>
      <div className={showGraph ? "visually-hidden" : undefined}>{children}</div>
      {showGraph && <DataDNAGraph nodes={nodes} edges={edges} />}
    </div>
  );
}
