import Link from "next/link";
import { projects } from "@/lib/laboratoire/source";
import styles from "./Laboratoire.module.css";

/**
 * LABORATOIRE — galerie numérotée (§08.4).
 *
 * « Galerie numérotée immédiatement lisible » : une ligne = un projet, lisible
 * en diagonale — numéro, nom, friction courte, territoire, niveau de preuve.
 * Aucune carte, aucune grille de vignettes (§03.1 interdit explicitement la
 * grille de 4 cartes).
 *
 * La ligne entière est un lien `<a href>` rendu côté serveur : le clic ne
 * dépend d'aucune animation, d'aucun JavaScript et d'aucun WebGL. Le hover
 * n'ajoute qu'un fond — il révèle la ligne, il ne conditionne pas l'accès.
 *
 * Power BI n'est pas ici : retiré du laboratoire en v4.4 (pas de friction
 * métier à raconter). Il reste un nœud `capability` dans le Data DNA.
 */
export default function Laboratoire() {
  return (
    <section
      id="laboratoire"
      aria-labelledby="laboratoire-titre"
      className={styles.section}
    >
      <p className={`mono ${styles.eyebrow}`}>
        <span aria-hidden="true">03 — </span>Laboratoire
      </p>

      <h2 id="laboratoire-titre" className={styles.title}>
        Cinq systèmes construits
      </h2>

      <ol className={styles.list}>
        {projects.map((p) => (
          <li key={p.slug}>
            <Link href={`/laboratoire/${p.slug}`} className={styles.row}>
              <span className={`mono ${styles.number}`}>{p.number}</span>{" "}
              <span className={styles.body}>
                <span className={styles.name}>{p.title}</span>{" "}
                {p.friction && (
                  <span className={styles.friction}>{p.friction}</span>
                )}
              </span>{" "}
              <span className={styles.meta}>
                <span className={`mono ${styles.tags}`}>
                  {p.tags.join(" / ")}
                </span>{" "}
                <span className={`mono ${styles.proof}`}>{p.proof}</span>
              </span>

              <span className={styles.go} aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
