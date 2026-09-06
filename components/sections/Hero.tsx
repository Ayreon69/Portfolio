import styles from "./Hero.module.css";

/**
 * HERO — direction éditoriale typographique (2026-09-07).
 *
 * Remplace la composition « texte à gauche / système 3D à droite » (§08.1) par
 * une composition centrée de type couverture : label, nom, énoncé, indicateur
 * de défilement. Le système visuel n'est plus présent dans le HERO — mais
 * l'infrastructure (`PersistentScene`, `layout-3d.ts`, `LivingInfrastructure`)
 * reste en place, désactivée par un seul drapeau, pour pouvoir revenir en
 * arrière sans rien reconstruire.
 *
 * Le test d'acceptation d'origine tient toujours, et plus strictement encore :
 * **le HERO est du HTML réel rendu côté serveur.** Sans WebGL, sans JS, sans
 * CSS d'animation, il est complet et lisible. L'animation d'entrée est purement
 * CSS, en `both`, donc neutralisée sans perte par `prefers-reduced-motion`.
 */
export default function Hero() {
  return (
    <section id="hero" aria-labelledby="hero-nom" className={styles.hero}>
      <nav className={`mono ${styles.nav}`} aria-label="Sections du site">
        <a href="#philosophie">Philosophie</a>{" "}
        <a href="#profil">Profil</a>{" "}
        <a href="#laboratoire">Laboratoire</a>{" "}
        <a href="#parcours">Parcours</a>{" "}
        <a href="#cv">CV</a>{" "}
        <a href="#contact">Contact</a>
      </nav>

      <div className={styles.identity}>
        <p className={`mono ${styles.label}`}>
          01 — Data Scientist · AI Builder · Data
        </p>
        <h1 id="hero-nom" className={styles.name}>
          Rayan Jemai
        </h1>
        <p className={styles.statement}>
          Je construis des systèmes qui suppriment le travail répétitif.
        </p>
      </div>

      {/* Le flux reste HERO → PHILOSOPHIE → PROFIL : l'indicateur pointe la
          section suivante, et reste un lien réel pour le clavier et le crawler. */}
      <p className={`mono ${styles.scroll}`}>
        <a href="#philosophie">
          Philosophie <span aria-hidden="true">↓</span>
        </a>
      </p>
    </section>
  );
}
