import type { ProjectContent } from "@/lib/laboratoire/derive";

/**
 * CHURN PREDICTION — sections 02 et 04 uniquement.
 *
 * Matière : PORTFOLIO-SOURCE-DE-VERITE-v4.md §04.4.05 et §09.5.
 * Contrainte §09.4 : implémentation originale PERDUE. La reconstruction est
 * méthodologique et doit l'annoncer, jamais suggérer une preuve qui n'existe
 * pas — d'où la seconde moitié de la section 04.
 *
 * 06 RECUL reste vide : le blueprint ne contient aucune matière de recul.
 */
const churnPrediction: ProjectContent = {
  construction: {
    paragraphs: [
      "Un pipeline de classification supervisée pour anticiper le risque de résiliation plutôt que de le constater après coup.",
      "Le feature engineering est manuel, construit sur l'historique clients. C'est là qu'est passé l'essentiel du travail — pas dans le choix de l'algorithme, tranché par comparaison.",
      "Ce n'est pas un système qui tourne : c'est un projet analytique ponctuel, sans automatisation de bout en bout, et sans aucune brique LLM ou agentique.",
    ],
  },

  // 03 - la chaine et le point de decision, distinct de 02.
  system: {
    chain: ["HISTORIQUE CLIENTS", "EDA", "FEATURE ENGINEERING", "COMPARAISON DE MODÈLES", "GRADIENT BOOSTING"],
    paragraphs: [
      "La chaîne est une analyse, pas un service : chaque étape produit l'entrée de la suivante, et la dernière rend un risque de résiliation par client.",
      "Le modèle final n'est pas choisi a priori. Plusieurs familles sont entraînées sur les mêmes variables puis comparées, et le gradient boosting est retenu sur ses résultats — pas sur sa réputation.",
      "Le vrai point de décision n'est pas l'algorithme mais l'arbitrage entre les deux erreurs possibles : détecter un maximum de clients réellement à risque, quitte à en relancer inutilement. Tout le réglage du système découle de ce choix.",
    ],
  },

  donnees: {
    paragraphs: [
      "L'historique clients d'ECA Assurances, où plus de 50 % des clients résiliaient avant leur première année : une classe cible assez présente pour être apprise, et un problème assez coûteux pour justifier le projet.",
      "L'implémentation d'origine est perdue — ni code, ni capture d'écran. Les volumes exacts et les variables finalement retenues ne peuvent donc pas être reproduits ici : ce qui est décrit sur cette page est reconstruit de mémoire, et se limite à ce qui peut l'être honnêtement.",
    ],
    stack: ["Python", "XGBoost / LightGBM", "pandas", "feature engineering manuel"],
  },

  result: {
    paragraphs: [
      "Recall de 85 % sur la classe résiliation. Dit autrement : environ un client sur sept qui allait effectivement partir passait encore inaperçu — c'est ce chiffre-là qui dit où en est le modèle, pas les 85 %.",
      "L'arbitrage était le bon pour le contexte : manquer un client qui va résilier coûte plus cher qu'une relance inutile, dans un portefeuille où plus de la moitié partait avant la première année.",
      "La limite de la preuve est nette : aucun code, aucune capture, aucune trace de déploiement. Ce qui subsiste est la méthode et son résultat, restitués aussi honnêtement que possible.",
    ],
  },
};

export default churnPrediction;
