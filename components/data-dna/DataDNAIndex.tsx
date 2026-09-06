import { buildIndexModel } from "@/lib/data-dna/index-model";
import { narrativeGraph } from "@/lib/data-dna/source";
import styles from "./DataDNAIndex.module.css";

/**
 * Le Data DNA en texte structuré — COMPOSANT SERVEUR, aucun `use client`.
 *
 * Un seul artefact pour trois problèmes (§10.2) :
 *   · fallback sans JavaScript, pour un crawler ou un lecteur d'écran ;
 *   · représentation mobile (« desktop = système spatial, mobile = système
 *     indexé » — §10.1) ;
 *   · contenu accessible quand la représentation graphique sera montée
 *     par-dessus sur desktop.
 *
 * Tout ce qui s'affiche ici descend de data/edges.json. Aucun lien, aucun
 * compte n'est écrit à la main : c'est la condition pour que la phrase
 * « ces liens viennent du graphe réel » soit vraie et le reste.
 *
 * Jamais de capture d'image du graphe en guise de fallback (règle explicite).
 */
export default function DataDNAIndex() {
  const model = buildIndexModel(narrativeGraph);

  return (
    <div className={styles.index}>
      <ul className={styles.clusters}>
        {model.clusters.map((cluster) => (
          <li key={cluster.id} className={styles.cluster}>
            <h3 className={`mono ${styles.clusterLabel}`}>{cluster.label}</h3>

            {/* Les compétences du cluster, les plus partagées en tête. */}
            <ul className={styles.capabilities}>
              {cluster.capabilities.map((cap) => (
                <li key={cap.id} className={styles.capability}>
                  <span className={styles.capabilityName}>{cap.label}</span>
                  <span className={`mono ${styles.capabilityCount}`}>
                    {cap.usedBy.length}
                  </span>
                  {/* Le « qu'est-ce qu'il a construit avec ? » de §08.3, en
                      clair et sans interaction : lisible sans JS. */}
                  <span className={styles.capabilityUsers}>
                    {cap.usedBy.map((u) => u.label).join(" · ")}
                  </span>
                </li>
              ))}
            </ul>

            {/* Ce qui alimente le pilier : la relation `feeds`, distincte de
                `uses` ci-dessus. Les deux seules natures d'arête du graphe. */}
            <p className={`mono ${styles.fedBy}`}>
              <span className={styles.fedByLabel}>Alimenté par</span>{" "}
              {cluster.fedBy.map((p) => p.label).join(" · ")}
            </p>
          </li>
        ))}
      </ul>

      {model.mostShared && (
        <p className={styles.spine}>
          <strong className={`mono ${styles.spineName}`}>
            {model.mostShared.label}
          </strong>{" "}
          {/* Espace explicite : les deux éléments sont des items flex, séparés
              visuellement par `gap`. Sans ce nœud de texte, la restitution
              vocale et l'extraction textuelle lisent « Pythonutilisé ». */}
          <span className={styles.spineText}>
            utilisé par {model.mostShared.usedByCount} des {model.systemCount}{" "}
            systèmes construits — {model.mostShared.pillars.join(" · ")}
          </span>
        </p>
      )}
    </div>
  );
}
