"use client";

import { useEffect, useMemo, useState } from "react";
import {
  isStructural,
  labelFontSize,
  LAYERS,
  layoutGraph,
  nodeRadius,
  placeLabels,
  VIEWBOX,
} from "@/lib/data-dna/layout-2d";
import type { DNAEdge, DNANode } from "@/lib/data-dna/types";
import DataDNAPanel from "./DataDNAPanel";
import styles from "./DataDNAGraph.module.css";

/**
 * Le Data DNA visuel — portage du prototype validé (§04.8), pas une réécriture.
 *
 * Ce qui change par rapport au prototype, et rien d'autre :
 *   · plus de niveaux A / B / C — le site affiche directement la représentation
 *     finale (hiérarchie + interaction). Les branches `level === "A"` étaient du
 *     gabarit de test ; les valeurs conservées sont celles du niveau B validé ;
 *   · les données arrivent en props depuis le serveur au lieu d'un `fetch()` ;
 *   · les couleurs viennent des tokens du design system, définis une seule fois
 *     dans le module CSS, au lieu d'être répétées en dur.
 *
 * Ce qui NE change pas : positions (simulation déterministe, aucune position
 * choisie), placement anti-collision des labels, ordre de peinture par couches,
 * isolation au survol, épinglage au clic, Échap, `feeds` plein / `uses`
 * pointillé à la sélection, et la règle « le panneau ne modifie jamais la
 * géométrie du graphe ».
 *
 * `aria-hidden` : ce SVG est un encodage VISUEL de DataDNAIndex, qui reste le
 * contenu accessible. Un seul contenu pour les technologies d'assistance.
 */
export default function DataDNAGraph({
  nodes,
  edges,
}: {
  nodes: DNANode[];
  edges: DNAEdge[];
}) {
  // Le layout tourne une fois pour la vie du composant. Sélectionner un nœud ne
  // redistribue jamais le graphe.
  const graph = useMemo(() => layoutGraph(nodes, edges), [nodes, edges]);
  const labels = useMemo(() => placeLabels(graph.nodes), [graph]);

  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const active = pinned ?? hovered;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPinned(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /**
   * Où poser le panneau de détail, et jusqu'à quelle largeur.
   *
   * Mesure sur la géométrie RÉELLE déjà calculée (nœuds + boîtes de labels,
   * mêmes heuristiques que placeLabels) la bande périphérique libre à gauche et
   * à droite du nuage, puis retient la plus large. Le panneau est ensuite borné
   * à cette bande — il ne peut donc pas recouvrir un nœud, quelle que soit la
   * largeur du viewport, et il se replacera tout seul si la topologie change.
   * C'est le panneau qui s'adapte au graphe ; jamais l'inverse.
   */
  const panelZone = useMemo(() => {
    let minX = VIEWBOX.width;
    let maxX = 0;
    for (const n of graph.nodes) {
      const r = nodeRadius(n);
      minX = Math.min(minX, n.x - r);
      maxX = Math.max(maxX, n.x + r);
      const off = labels.get(n.id);
      if (!off) continue;
      const fs = labelFontSize(n);
      const w = n.display.length * fs * (isStructural(n) ? 0.72 : 0.55);
      const x = n.x + off.dx;
      const x0 =
        off.anchor === "middle" ? x - w / 2 : off.anchor === "start" ? x : x - w;
      minX = Math.min(minX, x0);
      maxX = Math.max(maxX, x0 + w);
    }
    const free = {
      left: Math.max(0, minX),
      right: Math.max(0, VIEWBOX.width - maxX),
    };
    const side = free.left >= free.right ? ("left" as const) : ("right" as const);
    // -3 % de marge : le panneau s'arrête avant de flirter avec le nuage.
    const maxPct = Math.max(0, (free[side] / VIEWBOX.width) * 100 - 3);
    return { side, maxPct };
  }, [graph, labels]);

  const activeNode = active ? graph.byId.get(active) ?? null : null;
  const activeNeighbors = active ? graph.neighbors.get(active) : undefined;

  const isDimmed = (id: string) =>
    !!active && id !== active && !(activeNeighbors?.has(id) ?? false);

  return (
    <div className={styles.wrapper} aria-hidden="true">
      <svg
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
        className={styles.svg}
        onClick={() => setPinned(null)}
      >
        {graph.edges.map((e, i) => {
          const a = graph.byId.get(e.from);
          const b = graph.byId.get(e.to);
          if (!a || !b) return null;
          const touchesActive =
            !!active && (e.from === active || e.to === active);
          const dim = !!active && !touchesActive;
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              className={touchesActive ? styles.edgeActive : styles.edge}
              strokeWidth={
                touchesActive ? 0.5 + e.weight * 0.5 : 0.4 + e.weight * 0.32
              }
              strokeOpacity={dim ? 0.06 : touchesActive ? 0.75 : 0.34}
              // La nature de l'arête n'est rendue perceptible qu'à la
              // sélection : `feeds` en trait plein, `uses` en pointillé.
              // L'encoder en permanence encombrerait 53 arêtes pour une
              // information qu'on ne lit que nœud par nœud.
              strokeDasharray={
                touchesActive && e.kind === "uses" ? "3 3" : undefined
              }
            />
          );
        })}

        {/* Rendu en couches, du moins structurant au plus structurant :
            compétences → projets → piliers. Un label de pilier ne doit jamais
            passer sous un label de compétence — la hiérarchie de lecture doit
            être vraie jusque dans l'ordre de peinture. */}
        {LAYERS.map((layer) => (
          <g key={`shapes-${layer.join()}`}>
            {graph.nodes
              .filter((n) => layer.includes(n.type))
              .map((n) => {
                const r = nodeRadius(n);
                const hollow = n.type === "pillar" || n.type === "output";
                const shape = {
                  className: hollow
                    ? n.type === "pillar"
                      ? styles.nodeHollowStrong
                      : styles.nodeHollow
                    : styles.nodeFilled,
                  opacity: isDimmed(n.id) ? 0.12 : 1,
                };
                return (
                  <g
                    key={n.id}
                    data-node-id={n.id}
                    className={styles.node}
                    onMouseEnter={() => setHovered(n.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      setPinned((p) => (p === n.id ? null : n.id));
                    }}
                  >
                    {/* Cible de survol confortable, invisible. */}
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={Math.max(r + 9, 14)}
                      fill="transparent"
                    />
                    {n.id === active && (
                      <circle
                        cx={n.x}
                        cy={n.y}
                        r={r + 7}
                        className={styles.activeRing}
                      />
                    )}
                    {/* Expérience professionnelle = losange. Distinction de
                        forme, pas de couleur : « vécu en entreprise » vs
                        « construit en propre » doit se lire d'un coup d'œil. */}
                    {n.type === "experience" ? (
                      <rect
                        x={n.x - r}
                        y={n.y - r}
                        width={r * 2}
                        height={r * 2}
                        transform={`rotate(45 ${n.x} ${n.y})`}
                        {...shape}
                      />
                    ) : (
                      <circle cx={n.x} cy={n.y} r={r} {...shape} />
                    )}
                  </g>
                );
              })}
          </g>
        ))}

        {LAYERS.map((layer) => (
          <g key={`labels-${layer.join()}`} className={styles.labelLayer}>
            {graph.nodes
              .filter((n) => layer.includes(n.type))
              .map((n) => {
                const off = labels.get(n.id) ?? {
                  dx: 0,
                  dy: nodeRadius(n) + 14,
                  anchor: "middle" as const,
                };
                const structural = isStructural(n);
                return (
                  <text
                    key={n.id}
                    x={n.x + off.dx}
                    y={n.y + off.dy}
                    textAnchor={off.anchor}
                    className={`${styles.label} ${
                      structural ? styles.labelStructural : ""
                    } ${n.type === "capability" ? styles.labelCapability : ""}`}
                    style={{
                      fontSize: labelFontSize(n),
                      fontWeight:
                        n.type === "experiment" || n.type === "experience"
                          ? 600
                          : 500,
                      opacity: isDimmed(n.id) ? 0.1 : 1,
                    }}
                  >
                    {n.display}
                  </text>
                );
              })}
          </g>
        ))}
      </svg>

      <DataDNAPanel node={activeNode} graph={graph} zone={panelZone} />
    </div>
  );
}
