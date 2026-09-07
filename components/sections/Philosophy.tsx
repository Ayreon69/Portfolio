import styles from "./Philosophy.module.css";

/**
 * PHILOSOPHIE — §02 (contenu `VALIDÉ`) et §08.2 (« Très peu de texte »).
 *
 * Les trois phrases ci-dessous sont celles du blueprint, non réécrites, et
 * chacune a un rôle distinct :
 *   - le fil rouge (« Je n'aime pas faire deux fois la même chose ») vit dans
 *     le HERO, et y est bien présent — il n'est PAS répété ici ;
 *   - le sous-titre explicatif en est la suite logique, donc le titre de cette
 *     section ;
 *   - la signature professionnelle la referme.
 * La boucle entre les deux est le mécanisme.
 *
 * `CONSTRUIRE` (BUILD) réapparaît ici, et uniquement ici : comme étape de la
 * boucle éditoriale. Il reste hors du Data DNA, où il avait été retiré pour
 * cause de tautologie (§04.7) — un concept narratif n'est pas un nœud.
 *
 * Aucune animation : la boucle est du HTML au repos, lisible sans JS, sans
 * WebGL et sans mouvement. Le gel des effets (§03.2) s'applique.
 */

const STEPS = [
  "Friction",
  "Comprendre",
  "Construire",
  "Automatiser",
  "Itérer",
];

export default function Philosophy() {
  return (
    <section
      id="philosophie"
      aria-labelledby="philosophie-titre"
      className={styles.section}
    >
      <p className={`mono ${styles.eyebrow}`}>
        <span aria-hidden="true">01 — </span>Philosophie
      </p>

      <h2 id="philosophie-titre" className={styles.title}>
        Quand une tâche devient répétitive, je cherche à en faire un système.
      </h2>

      <div className={styles.loopFrame}>
        <ol
          className={styles.loop}
          aria-label="Boucle : friction, comprendre, construire, automatiser, itérer, puis retour à la friction"
        >
          {STEPS.map((step, i) => (
            <li key={step} className={styles.step}>
              <span className={`mono ${styles.term}`}>{step}</span>
              {i < STEPS.length - 1 && (
                <span className={styles.arrow} aria-hidden="true" />
              )}
            </li>
          ))}
        </ol>

        {/* Le retour à la friction : la boucle se referme. Décoratif — la
            fermeture est déjà dite dans l'`aria-label` de la liste. */}
        <div className={styles.loopReturn} aria-hidden="true">
          <span className={styles.glyph}>↺</span>
        </div>
      </div>

      <p className={styles.signature}>
        Je construis des systèmes qui suppriment le travail répétitif.
      </p>
    </section>
  );
}
