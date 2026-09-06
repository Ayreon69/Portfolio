/**
 * PARCOURS — la colonne « Ce que j'ai fait ».
 *
 * Le graphe porte deux champs distincts : `fr.friction` (le problème) et
 * `fr.system` (le système). La colonne les affichait à la suite, ce qui rangeait
 * la friction sous un intitulé d'action — et `fr.system` de la migration parle
 * de Rayan à la troisième personne, seule occurrence du site.
 *
 * Ce fichier ne corrige que la FORMULATION, à la première personne, à partir de
 * §04.4.06 et §04.4.07. Aucun fait ajouté, et data/nodes.json n'est pas touché :
 * même séparation content/ vs data/ que pour les pages projet.
 */
export const experienceActions: Record<string, string[]> = {
  "exp-commissions": [
    "J'étais le seul dans l'entreprise à maîtriser les règles de commissionnement — mode, règles, taux. Toute question, de n'importe qui, passait par moi, et consommait du temps des deux côtés.",
    "J'ai construit et utilisé en conditions réelles le système qui existe aussi en version laboratoire sous le nom de Commission Bot, pour que la réponse à une question déterministe ne dépende plus de ma disponibilité.",
  ],
  "exp-sas-python": [
    "Une trentaine de programmes de production tournaient sous SAS : une licence pour toute l'équipe, de la lenteur, et une fiabilité en retrait par rapport à une alternative moderne.",
    "J'ai préconisé la migration vers Python, puis je l'ai menée — la décision stratégique autant que le travail d'exécution.",
  ],
};

export default experienceActions;
