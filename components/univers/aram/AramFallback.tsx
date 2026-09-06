import fallback from "@/public/univers/aram/aram-16.17.fallback.json";
import styles from "./AramUniverse.module.css";

/**
 * Repli d'univers ARAM — rendu par le SERVEUR, toujours.
 *
 * C'est le même livrable pour trois cas (§10.2) : sans JavaScript, sur mobile,
 * et pendant que les colonnes se décodent. Il est calculé une fois à l'export
 * (scripts/export-aram-snapshot.py), pas au build : le mobile n'a donc jamais
 * à télécharger les 140 Ko de colonnes pour lire un classement.
 *
 * La barre est une largeur en pourcentage, en CSS pur — aucun canvas, aucune
 * mesure JS, et elle survit à `prefers-reduced-motion` sans rien perdre.
 */
export default function AramFallback() {
  const rows = fallback.augment;
  const max = Math.max(...rows.map((r) => r.winrate));

  return (
    <div className={styles.fallback}>
      <table className={styles.table}>
        <caption className={`mono ${styles.caption}`}>
          Augments les plus gagnants — patch {fallback.patch},{" "}
          {fallback.games.toLocaleString("fr-FR")} parties, export du{" "}
          {fallback.exportedAt}. Échantillon minimum&nbsp;: 200 parties.{" "}
          {/* Sans cette phrase, un lecteur sur mobile vient de lire « le moteur
              tourne dans le navigateur » et ne voit aucun filtre : il croirait
              à une page tronquée plutôt qu'à une représentation choisie. */}
          Ce classement est calculé à l&apos;export&nbsp;; sur écran large, les
          mêmes données sont rechargées et recalculées dans le navigateur à
          chaque filtre.
        </caption>
        <thead className="mono">
          <tr>
            <th scope="col">Augment</th>
            <th scope="col">Parties</th>
            <th scope="col">Victoires</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td>
                <span className={styles.barLabel}>{r.label}</span>
                <span
                  aria-hidden="true"
                  className={styles.bar}
                  style={{ width: `${(r.winrate / max) * 100}%` }}
                />
              </td>
              <td className="mono">{r.n.toLocaleString("fr-FR")}</td>
              <td className="mono">
                {r.winrate.toFixed(1).replace(".", ",")} %
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
