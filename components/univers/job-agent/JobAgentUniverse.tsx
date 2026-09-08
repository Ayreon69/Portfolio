"use client";

import { useMemo, useRef, useState } from "react";
import snapshotData from "@/public/univers/job-agent/job-agent-trace-24.json";
import { formatDistance, type Snapshot, type Vue } from "@/lib/univers/job-agent/engine";
import styles from "./JobAgentUniverse.module.css";

/**
 * UNIVERS JOB AGENT — section 03 SYSTÈME de /laboratoire/job-agent.
 *
 * Ce que ça doit faire ressentir : une exigence composite peut sembler
 * correctement satisfaite alors que sa décomposition révèle un manque
 * précis. Les 10 lignes ne changent jamais de nature — seul leur repli
 * s'ouvre ou se ferme. C'est la transformation d'un même système, pas deux
 * tableaux qui se disputent l'écran.
 *
 * SOURCE UNIQUE : job-agent-trace-24.json, gelé et daté (D-17), dérivé de
 * deux traces réelles du pipeline de scoring RAG — offre 24, jamais
 * rejouée. Aucun score global : chaque nombre affiché est une distance de
 * similarité déjà mesurée à l'exécution du pipeline, jamais recalculée ici.
 *
 * CE QUE CE COMPOSANT NE DIT JAMAIS : que le système « comprend mieux »,
 * « apprend » ou « découvre une vérité » en passant à l'atomique. Il montre
 * seulement qu'un signal absent du résultat composite existe dans sa
 * décomposition — rien de plus, rien de moins.
 *
 * ACCESSIBILITÉ SANS JS : chaque exigence est un <details> natif. Que le
 * bouton de bascule fonctionne ou non, n'importe quelle ligne reste
 * ouvrable au clavier ou à la souris — l'atomique n'est jamais un contenu
 * caché derrière du JavaScript, seulement replié par défaut.
 *
 * COHABITATION AVEC LE CANVAS PERSISTANT : enfant normal de `<main>`
 * (z-index 1), au-dessus du halo (z-index 0, pointer-events none). Aucun
 * canvas ici — SVG/DOM uniquement (D-18).
 */

const data = snapshotData as Snapshot;

export default function JobAgentUniverse() {
  const [vue, setVue] = useState<Vue>("composite");
  const detailsRefs = useRef<Map<string, HTMLDetailsElement>>(new Map());

  const setDetailRef = (key: string) => (el: HTMLDetailsElement | null) => {
    if (el) detailsRefs.current.set(key, el);
    else detailsRefs.current.delete(key);
  };

  // Le bouton n'ouvre/referme que les <details> : chaque ligne reste par
  // ailleurs manipulable individuellement, avec ou sans ce contrôle.
  const setVueAndFold = (next: Vue) => {
    setVue(next);
    for (const el of detailsRefs.current.values()) {
      el.open = next === "atomique";
    }
  };

  const totals =
    vue === "composite"
      ? {
          label: "exigences",
          n: data.composite.requirements,
          retenues: data.composite.retenues,
          signaux: data.composite.signaux,
        }
      : {
          label: "atomes",
          n: data.atomique.atomes,
          retenues: data.atomique.retenus,
          signaux: data.atomique.signaux,
        };

  return (
    <div className={styles.wrapper}>
      <p className={styles.lead}>
        Une même offre, deux granularités de la même mesure. En composite,
        chaque exigence est confrontée au profil en un bloc. En atomique,
        elle est éclatée en ses composants avant d&apos;être confrontée un par
        un. Ouvrez n&apos;importe quelle ligne pour voir sa décomposition, que
        le bouton ci-dessous soit utilisé ou non.
      </p>

      <p className={`mono ${styles.snapshot}`}>
        Offre {data.meta.offer_id} · traces réelles, non rejouées (
        {data.meta.source_composite} / {data.meta.source_atomic}) ·{" "}
        {data.meta.note}
      </p>

      <div className={styles.controls} role="group" aria-label="Granularité affichée">
        <button
          type="button"
          aria-pressed={vue === "composite"}
          onClick={() => setVueAndFold("composite")}
        >
          Composite
        </button>
        <button
          type="button"
          aria-pressed={vue === "atomique"}
          onClick={() => setVueAndFold("atomique")}
        >
          Atomique
        </button>
      </div>

      <p className={`mono ${styles.readout}`} aria-live="polite">
        {vue === "composite" ? "Vue composite" : "Vue atomique"} :{" "}
        <strong>{totals.n}</strong> {totals.label} → <strong>{totals.retenues}</strong>{" "}
        retenu{totals.retenues > 1 ? "s" : ""} →{" "}
        <strong>{totals.signaux}</strong> signal{totals.signaux > 1 ? "aux" : ""}.
      </p>

      <ul className={styles.list}>
        {data.composite.items.map((item) => {
          const isQms = item.texte === data.atomique.qms.texte;

          if (!isQms) {
            return (
              <li key={item.texte} className={styles.row}>
                <div className={styles.rowHead}>
                  <span className={styles.rowText}>{item.texte}</span>
                  <span className={`mono ${styles.rowFigures}`}>
                    {formatDistance(item.distance)} ·{" "}
                    {item.verdict === "retenu" ? "retenu" : "signal"}
                  </span>
                </div>
              </li>
            );
          }

          // La seule ligne dont le texte est identique dans les deux
          // traces : c'est elle, et uniquement elle, qui se transforme
          // sous les yeux du lecteur — pas une reformulation de plus.
          return (
            <li key="qms" className={styles.row}>
              <details className={styles.details} ref={setDetailRef("qms")}>
                <summary>
                  <div className={styles.rowHead}>
                    <span className={styles.rowText}>
                      <span className={styles.marker} aria-hidden="true">
                        ▸
                      </span>{" "}
                      {item.texte}
                    </span>
                    <span className={`mono ${styles.rowFigures}`}>
                      {formatDistance(item.distance)} · retenu
                    </span>
                  </div>
                </summary>

                <div className={styles.detailBody}>
                  <ul className={styles.atoms}>
                    {data.atomique.qms.atomes.map((atom) => (
                      <li
                        key={atom.label}
                        className={styles.atom}
                        data-flag={atom.verdict === "flag_uncertain" ? "" : undefined}
                      >
                        <span className={styles.atomLabel}>{atom.label}</span>
                        <span className={styles.atomFigures}>
                          {formatDistance(atom.distance)} ·{" "}
                          {atom.verdict === "retenu" ? "retenu" : "aucun match fiable"}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className={styles.flagNote}>
                    Six des sept composants de cette exigence sont couverts.
                    ISO 13485 ne l&apos;est pas : le résultat composite ne
                    montrait pas cette absence.
                  </p>
                </div>
              </details>
            </li>
          );
        })}
      </ul>

      {/* Les 9 autres exigences existent aussi côté pipeline atomique, mais
          sous une formulation différente (deux extractions séparées de la
          même offre) : impossible de les faire correspondre ligne à ligne
          sans l'inventer. Elles restent donc à part, jamais mêlées aux 10
          lignes ci-dessus, avec leur propre texte. */}
      <details className={styles.details} ref={setDetailRef("autres")}>
        <summary>
          <div className={styles.rowHead}>
            <span className={styles.rowText}>
              <span className={styles.marker} aria-hidden="true">
                ▸
              </span>{" "}
              Les 9 autres exigences, vues par le pipeline atomique
            </span>
            <span className={`mono ${styles.rowFigures}`}>
              {data.atomique.resume_autres.length} exigences
            </span>
          </div>
        </summary>
        <div className={styles.detailBody}>
          <p className={styles.flagNote}>
            Le pipeline atomique reformule les exigences avant de les
            décomposer : leur texte diffère de celui de la trace composite
            ci-dessus, même s&apos;il s&apos;agit du même profil de poste.
            Aucune correspondance ligne à ligne n&apos;est affirmée ici.
          </p>
          <ul className={styles.atoms}>
            {data.atomique.resume_autres.map((r) => (
              <li key={r.texte} className={styles.atom}>
                <span className={styles.atomLabel}>{r.texte}</span>
                <span className={styles.atomFigures}>
                  {r.atomes} atome{r.atomes > 1 ? "s" : ""}, meilleure
                  distance {formatDistance(r.distance)} ·{" "}
                  {r.verdict === "retenu" ? "retenu" : "signal"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </div>
  );
}
