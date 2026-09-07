import DataDNAIndex from "@/components/data-dna/DataDNAIndex";
import DataDNASurface from "@/components/data-dna/DataDNASurface";
import { narrativeGraph } from "@/lib/data-dna/source";
import styles from "./Profil.module.css";

/**
 * Section PROFIL — le Data DNA comme objet de LECTURE (le HERO l'utilisera
 * comme présence visuelle : mêmes données, deux niveaux de représentation).
 *
 * L'index structuré est rendu côté serveur et reste le contenu accessible.
 * La représentation graphique (SVG 27/53 + interaction) se monte PAR-DESSUS,
 * seulement si le pointeur est fin et le viewport assez large — elle est un
 * enrichissement, jamais une condition de lecture.
 *
 * Structure volontairement courte : un titre, une phrase, la donnée, une
 * légende. Aucun paragraphe ajouté pour remplir.
 */
export default function Profil() {
  return (
    <section id="profil" aria-labelledby="profil-titre" className={styles.section}>
      <p className={`mono ${styles.eyebrow}`}>
        <span aria-hidden="true">02 — </span>Profil
      </p>

      <h2 id="profil-titre" className={styles.title}>
        Compétences connectées au système
      </h2>

      <p className={styles.intro}>
        Pas de timeline, pas de barres de pourcentage. Chaque lien ci-dessous
        vient du graphe réel : une compétence n&apos;apparaît que si un projet
        s&apos;en sert vraiment.
      </p>

      <DataDNASurface
        nodes={narrativeGraph.nodes}
        edges={narrativeGraph.edges}
      >
        <DataDNAIndex />
      </DataDNASurface>

      <p className={`mono ${styles.legend}`}>
        Taille des nœuds = poids cumulé réel des arêtes. À la sélection, trait
        plein : alimente ; pointillé : utilise.
      </p>
    </section>
  );
}
