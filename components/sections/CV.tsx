import { cvFileName, cvPdf } from "@/lib/identity";
import styles from "./CV.module.css";

/**
 * CV — §08.6, « zéro expérimentation ».
 *
 * C'est la seule section du site dont la qualité se mesure à ce qu'elle
 * n'essaie pas de faire : pas de graphe, pas de canvas, pas d'interaction.
 * « Le recruteur ne doit jamais chercher le bouton » — deux boutons, à taille
 * réelle, au-dessus de la ligne de flottaison de la section.
 *
 * La phrase de contexte est celle du blueprint (§08.6, `VALIDÉ`). Les deux
 * boutons pointent le même PDF servi depuis `public/` : « Voir » l'ouvre dans
 * un onglet, « Télécharger » l'enregistre — l'attribut `download` suffit.
 */
export default function CV() {
  return (
    <section id="cv" aria-labelledby="cv-titre" className={styles.section}>
      <p className={`mono ${styles.eyebrow}`}>
        <span aria-hidden="true">05 — </span>CV
      </p>

      <h2 id="cv-titre" className={styles.title}>
        CV
      </h2>

      <p className={`mono ${styles.roles}`}>Data Scientist · AI Builder · Data</p>

      <p className={styles.context}>
        Le portfolio est l&apos;expérience. Le CV est le résumé exportable de
        cette expérience.
      </p>

      <p className={styles.actions}>
        <a
          className={`mono ${styles.button}`}
          href={cvPdf}
          target="_blank"
          rel="noreferrer noopener"
        >
          Voir le CV
        </a>
        <a
          className={`mono ${styles.button}`}
          href={cvPdf}
          download={cvFileName}
        >
          Télécharger le PDF
        </a>
      </p>

    </section>
  );
}
