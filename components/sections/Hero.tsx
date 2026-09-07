import styles from "./Hero.module.css";

/**
 * HERO — direction éditoriale typographique (2026-09-07).
 *
 * Remplace la composition « texte à gauche / système 3D à droite » (§08.1) par
 * une composition centrée de type couverture : label, nom, fil rouge,
 * indicateur de défilement. Le système visuel n'est plus présent dans le HERO
 * — mais l'infrastructure (`PersistentScene`, `layout-3d.ts`,
 * `LivingInfrastructure`) reste en place, désactivée par le seul drapeau
 * `SYSTEM_VISIBLE` de `SystemLayer.tsx`, pour pouvoir revenir en arrière sans
 * rien reconstruire. Tant qu'il est à `false`, `three.js` n'est pas chargé.
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
        {/* Le HERO est une couverture, pas une section : il ne porte pas de
            numéro. La numérotation des sections commence donc à PHILOSOPHIE
            (01) et va jusqu'à CONTACT (06) — elle ne cohabite plus avec la
            numérotation 01-05 des projets du LABORATOIRE dans la même graisse
            mono. */}
        <p className={`mono ${styles.label}`}>
          Data Scientist · AI Builder
        </p>
        <h1 id="hero-nom" className={styles.name}>
          Rayan Jemai
        </h1>
        {/* Le fil rouge, à la première personne : c'est l'étape FRICTION de la
            boucle, dite par Rayan avant que PHILOSOPHIE ne dise le système.
            Il vit ICI et nulle part ailleurs — la signature professionnelle
            (« Je construis des systèmes… ») referme PHILOSOPHIE et ne doit pas
            être dupliquée dans le HERO. */}
        <p className={styles.statement}>
          Je n'aime pas faire deux fois la même chose.
        </p>
      </div>

      {/* Le flux reste HERO → PHILOSOPHIE → PROFIL : l'indicateur pointe la
          section suivante, et reste un lien réel pour le clavier et le crawler.
          Le MOT « Philosophie » est en revanche retiré du rendu visuel : il est
          déjà dans la nav, dans le même écran, vers la même ancre. La flèche
          seule se lit universellement comme « défiler » ; la cible reste
          explicite pour un lecteur d'écran. */}
      <p className={`mono ${styles.scroll}`}>
        <a href="#philosophie">
          <span className="visually-hidden">Aller à la section Philosophie</span>
          <span aria-hidden="true">↓</span>
        </a>
      </p>
    </section>
  );
}
