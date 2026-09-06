import styles from "./Hero.module.css";

/**
 * HERO — structure validée §08.1, portée telle quelle.
 *
 * Test d'acceptation qui a présidé à sa conception : **le Hero doit rester
 * excellent si le système disparaît complètement.** Tout ce qui est ci-dessous
 * est du HTML réel, rendu côté serveur, hors du canvas — sans WebGL, sans JS,
 * sans le halo, le Hero est complet. Le halo n'ajoute qu'une présence.
 *
 * Le halo lui-même vit dans le canvas persistant (components/hero/HeroHalo),
 * décalé dans une zone à droite du nom : le système encadre le nom, il ne le
 * concurrence jamais. Aucune particule décorative n'épelle le nom — le système
 * montré est le système réel.
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
        <h1 id="hero-nom" className={styles.name}>
          Rayan Jemai
        </h1>
        <p className={styles.quote}>
          «&nbsp;Je n&apos;aime pas faire deux fois la même chose.&nbsp;»
        </p>
        <p className={`mono ${styles.role}`}>Data Scientist · AI Builder · Data</p>
      </div>

      {/* Pointe la section SUIVANTE, pas PROFIL : depuis l'insertion de
          PHILOSOPHIE, le flux est HERO → PHILOSOPHIE → PROFIL. Seule
          modification apportée au HERO validé. */}
      <p className={`mono ${styles.scroll}`}>
        <a href="#philosophie">[ 01 ] Explorer le système →</a>
      </p>
    </section>
  );
}
