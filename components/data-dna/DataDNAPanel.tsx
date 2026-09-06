"use client";

import { relationGroups } from "@/lib/data-dna/relations";
import type { LaidOutGraph, LaidOutNode } from "@/lib/data-dna/types";
import styles from "./DataDNAPanel.module.css";

const CLUSTER_LABEL: Record<string, string> = {
  ai: "AI",
  ml: "ML",
  automation: "AUTOMATION",
  data: "DATA",
};

const TYPE_LABEL: Record<LaidOutNode["type"], string> = {
  pillar: "Pilier",
  output: "Sortie",
  experiment: "Expérimentation",
  experience: "Expérience",
  capability: "Compétence",
};

/**
 * Panneau de détail — portage du comportement validé (§04.8).
 *
 * RÈGLE CENTRALE, mesurée et vérifiée sur le prototype : **le panneau ne modifie
 * jamais la géométrie ni l'échelle du graphe.** Deux mécanismes s'en chargent,
 * et il faut les deux :
 *
 *   1. positionnement absolu dans la bande périphérique libre du canvas — le
 *      panneau ne prend donc aucune largeur au graphe (`zone` est calculée sur
 *      la géométrie réelle, voir DataDNAGraph) ;
 *   2. `scrollbar-gutter: stable` sur `html` (app/globals.css). Sans lui, un
 *      panneau qui allonge la page fait APPARAÎTRE la barre de défilement,
 *      retire ~15 px au viewport, donc au SVG en `width: 100%`, donc rescale
 *      tout le graphe. C'est le piège trouvé et corrigé sur le prototype.
 *
 * Le contenu est celui validé : type, nom, nombre de relations, poids cumulé,
 * relations groupées par nature et par sens, poids réel rendu tel quel.
 */
export default function DataDNAPanel({
  node,
  graph,
  zone,
}: {
  node: LaidOutNode | null;
  graph: LaidOutGraph;
  zone: { side: "left" | "right"; maxPct: number };
}) {
  return (
    <aside
      className={styles.panel}
      style={{
        left: zone.side === "left" ? 12 : undefined,
        right: zone.side === "right" ? 12 : undefined,
        // Largeur bornée par la bande périphérique réellement libre : le
        // panneau ne peut pas mordre sur un nœud, quelle que soit la largeur.
        width: `clamp(196px, ${zone.maxPct.toFixed(1)}%, 268px)`,
      }}
    >
      {!node && (
        <p className={`mono ${styles.hint}`}>
          Survoler un nœud pour isoler ses relations. Cliquer pour figer. Échap
          pour revenir.
        </p>
      )}

      {node && (
        <>
          <p className={`mono ${styles.kind}`}>
            {TYPE_LABEL[node.type]}
            {node.cluster ? ` · ${CLUSTER_LABEL[node.cluster]}` : ""}
          </p>
          <h3 className={styles.name}>{node.display}</h3>
          <p className={`mono ${styles.meta}`}>
            {node.degree} relation{node.degree > 1 ? "s" : ""} · poids cumulé{" "}
            {node.weightedDegree}
          </p>

          {/* Groupé par (nature, sens), du point de vue du nœud sélectionné.
              Les quatre intitulés sont la traduction littérale des deux `kind`
              de edges.json — aucune nuance ajoutée. */}
          {relationGroups(node, graph).map((group) => (
            <div key={group.title} className={styles.group}>
              <p className={`mono ${styles.groupTitle}`}>
                {group.title} <span>({group.items.length})</span>
              </p>
              <ul className={styles.items}>
                {group.items.map((item) => (
                  <li key={item.id} className={styles.item}>
                    <span>{item.label}</span>
                    <WeightBar weight={item.weight} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}
    </aside>
  );
}

/** Poids réel de l'arête (1 à 3), rendu tel quel. Aucun mot n'est plaqué
 *  dessus : « structurant » ou « secondaire » seraient une interprétation que
 *  les données ne portent pas. */
function WeightBar({ weight }: { weight: number }) {
  return (
    <span className={styles.weight}>
      {[1, 2, 3].map((i) => (
        <span key={i} data-on={i <= weight ? "" : undefined} />
      ))}
    </span>
  );
}
