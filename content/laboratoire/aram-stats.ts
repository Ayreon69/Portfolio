import type { ProjectContent } from "@/lib/laboratoire/derive";

/**
 * ARAM STATS — sections 02 et 04 uniquement.
 *
 * Matière : PORTFOLIO-SOURCE-DE-VERITE-v4.md §04.4.02 (grille d'extraction) et
 * §09.5 (tableau projet). Reformulation éditoriale ; aucun chiffre, aucune
 * techno, aucun comportement ajouté.
 *
 * 01, 03 et 05 retombent volontairement sur le texte court du graphe.
 * 06 RECUL vient des réponses de Rayan, pas du blueprint.
 */
const aramStats: ProjectContent = {
  construction: {
    paragraphs: [
      "Puisque l'API publique est fermée sur cette file, le crawler passe ailleurs : par l'API locale du client League (LCU). Il progresse en boule de neige — chaque partie collectée donne les joueurs qui mènent aux parties suivantes.",
      "La collecte descend dans SQLite, puis remonte par deux interfaces distinctes : un explorateur local pour creuser, et un site public dont le moteur de filtrage tourne entièrement dans le navigateur, sans serveur derrière.",
      "Le crawl est fait pour tourner longtemps sans surveillance : reprise après interruption, détection automatique du patch en cours, et des garde-fous mémoire qui allègent le client League dès que la RAM franchit un seuil.",
    ],
  },

  // 03 — le CHEMIN de la donnée, distinct de 02 qui dit ce qui a été construit.
  system: {
    chain: ["CLIENT LEAGUE (LCU)", "CRAWL BOULE DE NEIGE", "SQLITE (WAL)", "AGRÉGATS PRÉCALCULÉS", "EXPORT BINAIRE", "NAVIGATEUR"],
    paragraphs: [
      "Collecte et restitution ne se parlent jamais directement : elles ne partagent que la base. En amont, un pool de threads interroge le client local et écrit dans SQLite en mode WAL, où la lecture ne bloque pas l'écriture. En aval, rien ne relit cette base à chaud — le site consomme un export figé.",
      "Les tables sont dénormalisées, picks, items et participants séparés, pour qu'une agrégation n'ait aucune jointure à faire ; un pipeline d'agrégats précalculés est posé par-dessus.",
      "Ce qui part vers le navigateur est encodé en binaire : dictionnaire des valeurs, tri, disposition colonne-majeur, décompressé nativement à l'arrivée. Le moteur de filtrage devient alors une passe unique sur des TypedArrays — aucun serveur n'est interrogé pendant qu'on manipule les filtres.",
    ],
  },

  donnees: {
    paragraphs: [
      "150 140 parties, 1,5 million de lignes joueur, une base SQLite de 2,0 Go en mode WAL.",
      "La contrainte réelle n'est pas la taille de la base mais ce que le navigateur doit avaler : 9,8 Mo compressés au premier affichage, environ 49 Mo de TypedArrays une fois en mémoire. C'est ce budget-là, et pas le nombre de parties, qui décide de ce que le site peut montrer.",
    ],
    stack: [
      "Python 3.11",
      "SQLite (WAL)",
      "requests / ThreadPoolExecutor",
      "numpy",
      "Pillow",
      "psutil / ctypes",
      "JS vanilla",
      "TypedArray / ArrayBuffer",
      "DecompressionStream",
      "Cloudflare Pages",
    ],
  },

  result: {
    paragraphs: [
      "1,5 million de lignes filtrées et agrégées en 11 à 37 ms, dans le navigateur : plus rapide qu'un aller-retour réseau vers un serveur qui aurait fait le même calcul.",
      "Le volume atteint suffit à décider, ce qui était tout l'enjeu. Sur un patch, environ un million de lignes joueur donnent ~10 000 picks pour un augment présent à 1 %, soit un winrate à ±1 point — quand les paliers de tier sont espacés de 1,5 point. La question de départ, quels augments dominent réellement, est devenue tranchable.",
      "Et elle l'est sans identité : l'export public ne contient ni pseudo, ni identifiant de joueur, ni identifiant de partie.",
    ],
  },

  // 06 - RECUL : redige par Rayan (2026-09-06). Seule section de cette page dont
  // la matiere ne vient pas du blueprint - celui-ci n'en contient aucune.
  // Reponses mises en forme editoriale, sans ajout factuel.
  recul: {
    paragraphs: [
      "La limite ne porte pas sur l'astuce d'accès, mais sur ce qui sort de la machine. Le 403 sur cette file est une décision produit, pas une barrière de sécurité, et le client local répond parce que je suis authentifié dans mon propre client, avec mon propre lockfile : rien n'est cassé, aucune authentification n'est forcée. Je ne prétends pas pour autant que ça règle la question — Riot a fermé une porte, le projet en emprunte une autre pour arriver au même endroit.",
      "La ligne est donc ailleurs, et je la formule ainsi : produire des statistiques agrégées sur l'équilibrage d'un mode de jeu, oui ; construire une surface où l'on retrouve des individus, non. L'export public ne contient aucun identifiant de joueur, aucun identifiant de partie, aucun pseudo — vérifié à chaque fois que le format binaire a changé. Les cartes d'exemple montrent le champion et le build, rien d'autre. La base locale stocke des identifiants parce que le graphe de crawl en a besoin ; ils s'arrêtent à ma machine.",
      "Sur la tenue du filtrage navigateur, ce n'est pas le calcul qui lâcherait en premier. À 1,5 million de lignes en 11 à 37 ms, le moteur garderait de la marge jusqu'à 10 millions de lignes sous 250 ms. Le mur est ailleurs : le premier affichage coûte déjà 9,8 Mo compressés, et une fois en mémoire les trois blocs pèsent environ 49 Mo de TypedArrays, plus les pics de décompression. Le coût est strictement linéaire — à 5 millions de lignes, soit environ 500 000 parties, le premier affichage passe à ~33 Mo. C'est là que ça meurt, et ça meurt sur mobile bien avant.",
      "L'échappatoire existe et elle est bon marché : découper les fichiers par patch, puisque le site sélectionne déjà la dernière version par défaut — il ne chargerait qu'un fragment. Cela repousserait le mur d'un ordre de grandeur, toujours sans backend. Je ne l'ai pas fait parce qu'aucun usage ne l'exigeait encore.",
      "Trois choses ont été payées pour en arriver là. La fraîcheur : le site est un instantané daté ; l'explorateur local suit la base en direct, le site attend un réexport. L'ordre : trier les augments et les objets améliore nettement la compression, mais détruit l'ordre de ramassage — impossible de demander quel augment a été pris en premier, ni d'analyser les choix tour par tour. C'était un vrai arbitrage, pas un oubli, et c'est le plus coûteux des trois. La forme des questions, enfin : le moteur est une passe unique, les filtres sont une conjonction inclure/exclure et rien d'autre — pas de OU, pas de « au moins 2 parmi ces 3 », pas de série temporelle inter-patch, et surtout pas de matrice de co-occurrence, qui serait en O(n × k²) et incompatible avec la passe unique.",
      "S'y ajoutent six objets finis au maximum, une durée quantifiée à 15 secondes, et aucune identité — donc aucun suivi d'un joueur d'une partie à l'autre, ni rang, ni région. En revanche les dégâts sont restés exacts, en u16 : la quantification s'était révélée fausse sur 1 443 lignes, et là ça méritait de payer.",
      "150 140 parties n'est pas un seuil. La file comptait encore 475 428 joueurs en attente : elle n'était pas épuisée, loin de là. Ce qui a arrêté le crawl, c'est la machine qui saturait, la borne à six heures, puis simplement le fait de ne plus l'avoir relancé pendant des semaines. A posteriori, s'arrêter là était juste : sur le patch 16.16, 102 624 parties donnent environ un million de lignes joueur, et un augment présent à 1 % compte ~10 000 picks, soit un winrate à ±1 point quand les paliers de tier sont à 1,5 point. La partie marginale n'achète plus rien de décidable ; continuer aurait été de la collecte pour la collecte.",
      "Le snowball, oui — la stratégie autour, non. Le snowball reste le seul mécanisme possible : il n'existe aucune liste de joueurs de ce mode, la seule façon de les énumérer est de les découvrir dans les parties des autres. Ce que je referais autrement tient en un point : le crawl visite chaque joueur exactement une fois, pour toujours, alors que la fenêtre du client ne remonte que vingt parties. Le rendement total est donc plafonné par le nombre de joueurs atteints, pendant que les mêmes 13 087 joueurs continuent de jouer tous les jours. Revisiter un joueur actif chaque semaine transformerait une collecte unique en flux continu — et c'est très exactement ce qui a manqué quand le nouveau patch est sorti.",
      "Second point : la file grossit sans borne, trente-six joueurs empilés pour un visité. Le ramassage est gratuit — il vient avec un détail déjà payé — mais il a laissé un reliquat de 475 000 entrées qui, trois semaines plus tard, s'est retrouvé en travers du chemin. Une file bornée ou vieillissante aurait évité d'avoir à inventer une colonne de priorité.",
    ],
  },
};

export default aramStats;
