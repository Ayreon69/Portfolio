"use client";

import { useMemo, useState } from "react";
import snapshotData from "@/public/univers/ai-watch/ai-watch-2026-08-22.json";
import { sortedSources, type SortMode, type Snapshot } from "@/lib/univers/ai-watch/engine";
import styles from "./AiWatchUniverse.module.css";

/**
 * UNIVERS AI WATCH — section 03 SYSTÈME de /laboratoire/ai-watch.
 *
 * Ce que ça doit faire ressentir : un grand volume de collecte n'est pas un
 * grand rendement informationnel. Les 34 sources sont les mêmes dans les deux
 * modes — seul l'ordre change, et l'ordre est calculé une fois, ici, sur le
 * navigateur du lecteur, à partir de nombres déjà mesurés à l'export.
 *
 * SOURCE UNIQUE : le JSON importé ci-dessus, gelé et daté (D-17). Aucune
 * requête réseau, aucune lecture du vault : les chiffres sont dans le bundle,
 * comme n'importe quelle donnée statique du site.
 *
 * COHABITATION AVEC LE CANVAS PERSISTANT : ce composant est un enfant normal
 * de `<main>` (z-index 1), au-dessus du halo (z-index 0, pointer-events none).
 * Aucun canvas ici — SVG/DOM uniquement (D-18) : rien à cohabiter côté contexte
 * de rendu.
 *
 * MOUVEMENT : la seule transition est le déplacement des lignes au changement
 * de tri (transform + largeur de barre). `prefers-reduced-motion` la coupe
 * sans retirer une seule ligne de contenu — le classement final est identique.
 */

const data = snapshotData as Snapshot;
const ROW_H = 56;

export default function AiWatchUniverse() {
  const [mode, setMode] = useState<SortMode>("volume");

  const rows = useMemo(() => sortedSources(data.sources, mode), [mode]);
  const maxItems = useMemo(
    () => Math.max(...data.sources.map((s) => s.items), 1),
    []
  );

  return (
    <div className={styles.wrapper}>
      <p className={styles.lead}>
        Les 34 sources déclarées de la veille, classées deux fois sur les mêmes
        nombres : par volume collecté, puis par rendement réel — la part de ce
        volume jugée utile. Rien n&apos;est recalculé au changement de tri, le
        classement se contente de se relire dans l&apos;autre sens.
      </p>

      <p className={`mono ${styles.snapshot}`}>
        Fenêtre du {data.meta.fenetre_debut} au {data.meta.fenetre_fin} (
        {data.meta.fenetre_jours} jours) · seuil utile {data.meta.seuil_utile
          .toString()
          .replace(".", ",")} · {data.meta.exclusions}
      </p>

      <div className={styles.controls} role="group" aria-label="Ordre du classement">
        <button
          type="button"
          aria-pressed={mode === "volume"}
          onClick={() => setMode("volume")}
        >
          Trier par volume
        </button>
        <button
          type="button"
          aria-pressed={mode === "rendement"}
          onClick={() => setMode("rendement")}
        >
          Trier par rendement
        </button>
      </div>

      <ul
        className={styles.list}
        style={{ height: rows.length * ROW_H }}
        aria-label={`Sources classées par ${mode === "volume" ? "volume" : "rendement"}`}
      >
        {rows.map((s) => {
          const rank = rows.indexOf(s);
          const width =
            s.items === 0
              ? 0
              : mode === "volume"
                ? (s.items / maxItems) * 100
                : (s.rendement ?? 0) * 100;

          return (
            <li
              key={s.id}
              className={styles.row}
              data-empty={s.items === 0 ? "" : undefined}
              style={{ transform: `translateY(${rank * ROW_H}px)` }}
            >
              <div className={styles.nameLine}>
                <span className={`mono ${styles.name}`}>{s.nom}</span>
                <span className={`mono ${styles.figures}`}>
                  {s.items === 0
                    ? "0 item sur la fenêtre"
                    : `${s.items} item${s.items > 1 ? "s" : ""} · ${s.utiles} utile${
                        s.utiles > 1 ? "s" : ""
                      } · ${Math.round((s.rendement ?? 0) * 100)} %`}
                </span>
              </div>
              <span className={styles.barTrack}>
                <span className={styles.bar} style={{ width: `${width}%` }} />
              </span>
            </li>
          );
        })}
      </ul>

      <p className={`mono ${styles.totals}`}>
        Sur la fenêtre, hors signets (comptes individuels, pipeline distinct) :{" "}
        <strong>{data.totaux.items.toLocaleString("fr-FR")}</strong> items,{" "}
        <strong>{data.totaux.utiles.toLocaleString("fr-FR")}</strong> jugés
        utiles. Les sept sources coupées au rendement représentaient{" "}
        <strong>{data.sous_ensemble_coupe.items}</strong> de ces items pour{" "}
        <strong>{data.sous_ensemble_coupe.utiles}</strong> utiles —{" "}
        {data.meta.sources_presentes} des {data.meta.sources_declarees} sources
        déclarées ont produit au moins un item sur la fenêtre,{" "}
        {data.meta.sources_sans_item} n&apos;en ont produit aucun.
      </p>
    </div>
  );
}
