import Link from "next/link";
import { experiences } from "@/lib/parcours/source";
import styles from "./Parcours.module.css";

/**
 * PARCOURS — §08.5.
 *
 * « Pas de timeline. Ensemble de rôles + systèmes construits. » Il n'y a donc
 * ici ni axe, ni date en tête de bloc, ni ordre chronologique : les deux
 * expériences sont dans l'ordre du dataset (2025 puis 2026 — l'inverse d'une
 * frise, et c'est volontaire).
 *
 * Les trois colonnes SONT la logique du wireframe :
 *     ce que tu as fait → avec quoi → ce que ça a produit
 *
 * Tout est rendu côté serveur et lisible en diagonale, sans interaction :
 * §05 l'exige explicitement (« PARCOURS lisible en diagonale, sans
 * interaction »). Les seuls éléments cliquables sont des liens vers les
 * systèmes du laboratoire — un raccourci, jamais une condition de lecture.
 *
 * Aucun texte de projet n'est écrit ici : friction, système, résultat et
 * métrique viennent de data/nodes.json ; compétences et piliers sont calculés
 * depuis data/edges.json (voir lib/parcours/derive.ts).
 */

// Intitulé du poste — celui du CV (« Data Scientist »), et non
// celui du wireframe §08.5 (« Data Scientist / Études actuarielles ») :
// décision de Rayan du 2026-09-06. Le positionnement public du site est
// `Data Scientist · AI Builder`, et l'assurance n'y apparaît que comme
// contexte d'une expérience — jamais comme spécialisation. Deux effets : plus
// aucune mention d'études actuarielles sur le site, et plus de divergence
// entre cette ligne et le CV téléchargeable. L'employeur vient des données
// (`universe`). L'ancienneté est celle actée en A-08 : en poste depuis
// septembre 2022, « afficher 4 ANS ».
const ROLE = "Data Scientist";
const SENIORITY = "4 ans";

export default function Parcours() {
  const employer = experiences[0]?.employer;

  return (
    <section
      id="parcours"
      aria-labelledby="parcours-titre"
      className={styles.section}
    >
      <p className={`mono ${styles.eyebrow}`}>
        <span aria-hidden="true">04 — </span>Parcours
      </p>

      <h2 id="parcours-titre" className={styles.title}>
        Un poste, deux systèmes
      </h2>

      <p className={`mono ${styles.role}`}>
        {employer && <span className={styles.employer}>{employer}</span>}
        <span>{ROLE}</span>
        <span className={styles.seniority}>{SENIORITY}</span>
      </p>

      <div className={styles.list}>
        {experiences.map((xp) => (
          <article key={xp.id} className={styles.entry}>
            <h3 className={styles.name}>{xp.title}</h3>

            <div className={styles.columns}>
              <div className={styles.col}>
                <p className={`mono ${styles.colLabel}`}>Ce que j&apos;ai fait</p>
                {xp.action.map((t, i) => (
                  <p key={i} className={styles.text}>
                    {t}
                  </p>
                ))}
              </div>

              <div className={styles.col}>
                <p className={`mono ${styles.colLabel}`}>Avec quoi</p>
                <ul className={styles.caps}>
                  {xp.capabilities.map((c) => (
                    <li key={c.id} className={`mono ${styles.cap}`}>
                      {c.label}{" "}
                    </li>
                  ))}
                </ul>
                {xp.pillars.length > 0 && (
                  <p className={`mono ${styles.pillars}`}>
                    Alimente {xp.pillars.join(" · ")}
                  </p>
                )}
              </div>

              <div className={styles.col}>
                <p className={`mono ${styles.colLabel}`}>
                  Ce que ça a produit
                </p>
                {/* Le chiffre, puis la phrase. `metric.label` n'est PAS affiché
                    ici : pour les deux expériences, il est déjà contenu dans
                    `fr.result` — l'afficher écrirait deux fois la même chose. */}
                {xp.metric && (
                  <p className={styles.metricValue}>{xp.metric.value}</p>
                )}
                {xp.result && <p className={styles.text}>{xp.result}</p>}
              </div>
            </div>

            {xp.sharedWith.length > 0 && (
              <p className={`mono ${styles.shared}`}>
                <span className={styles.sharedLabel}>
                  Compétences communes
                </span>{" "}
                {xp.sharedWith.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/laboratoire/${p.slug}`}
                    className={styles.sharedItem}
                  >
                    {p.title} <span className={styles.count}>{p.shared}</span>{" "}
                  </Link>
                ))}
              </p>
            )}
          </article>
        ))}
      </div>

      <p className={`mono ${styles.legend}`}>
        Le chiffre indique le nombre de compétences que ce système partage avec
        l&apos;expérience — calculé sur les arêtes réelles du graphe.
      </p>
    </section>
  );
}
