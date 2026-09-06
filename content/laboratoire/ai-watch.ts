import type { ProjectContent } from "@/lib/laboratoire/derive";

/**
 * AI WATCH — sections 02 et 04 uniquement.
 *
 * Matière : PORTFOLIO-SOURCE-DE-VERITE-v4.md §04.4.04 et §09.5.
 * 06 RECUL vient des réponses de Rayan, pas du blueprint.
 */
const aiWatch: ProjectContent = {
  construction: {
    paragraphs: [
      "Un collecteur qui tourne seul sur GitHub Actions — aucun PC allumé n'est requis. Il agrège environ 34 sources en RSS et scraping ciblé, score chaque item, et publie un digest quotidien à 05:00 UTC et un hebdomadaire le lundi à 06:00 UTC.",
      "Le scoring ne juge pas un article dans l'absolu : il le confronte à un profil de pertinence personnel — agentic coding, Claude Code, automatisation, migration SAS → Python — via l'API Gemini, sur son tier gratuit. Un article développé à la demande l'est à partir du contenu réel de la page, pas du seul titre.",
      "Le même générateur produit une seconde version, publique et expurgée : elle republie les actualités, jamais les résumés personnels. Chaque lecteur y développe un article avec sa propre clé API — elle ne quitte pas son navigateur, rien n'est collecté, et l'hébergement ne me coûte rien.",
    ],
  },

  // 03 — les deux boucles et leur frontière, distinct de 02.
  system: {
    chain: ["~34 SOURCES", "COLLECTE (CRON)", "SCORING PAR PROFIL", "DIGEST", "VAULT OBSIDIAN"],
    paragraphs: [
      "Deux boucles cohabitent et ne partagent que le collecteur. La première est privée : le cron déclenche la collecte, chaque item est scoré contre le profil, et le digest est écrit dans le vault Obsidian. Le vault est le stockage — il n'y a pas de base séparée à maintenir à côté.",
      "La seconde est publique : le même générateur produit une version expurgée, déployée sur Cloudflare Pages. Les résumés personnels ne franchissent jamais cette frontière ; seules les actualités passent.",
      "Développer un article n'appartient à aucune des deux. Un Worker Cloudflare récupère le contenu réel de la page, et l'appel au modèle part du navigateur du lecteur avec sa propre clé : rien ne passe par mon quota, rien n'est stocké côté site.",
    ],
  },

  donnees: {
    paragraphs: [
      "15 733 fiches en base, dont 180 nouvelles le jour de la mesure, pour environ 34 sources suivies.",
      "Les sources ne sont pas arbitrées au volume mais au rendement, mesuré source par source : Claude Code documentation ressort à 100 % d'éléments jugés utiles, Next.ink à 7 %. Sept sources ont été désactivées sur cette base — 26 % du volume collecté pour 5 % de ce qui servait vraiment. Il en reste 23 actives.",
    ],
    stack: [
      "Python",
      "GitHub Actions",
      "API Gemini",
      "feedparser / httpx",
      "Cloudflare Pages + Worker",
      "Obsidian",
    ],
  },

  result: {
    paragraphs: [
      "Le système tourne dans le cloud sans qu'aucune de mes machines soit allumée, et 23 des 34 sources restent actives après arbitrage.",
      "La mesure a produit un effet net : les sept sources coupées pesaient 26 % du volume collecté pour 5 % de ce qui était jugé utile. Retirer un quart du bruit en perdant un vingtième de la valeur — c'est ça, le résultat, pas le nombre de fiches accumulées.",
    ],
  },

  // 06 - RECUL : redige par Rayan (2026-09-06). Seule section de cette page dont
  // la matiere ne vient pas du blueprint - celui-ci n'en contient aucune.
  // Reponses mises en forme editoriale, sans ajout factuel.
  recul: {
    paragraphs: [
      "Sept sources coupées, mais le vrai risque tenait à deux autres. Anthropic News et Mistral AI ont été explicitement épargnées malgré deux éléments en dix-neuf jours, parce que leur rendement restait à 100 % : le critère retenu est le rendement, pas le volume, et c'est ce qui les a sauvées.",
      "Les sept coupées, elles, avaient soit un rendement mesuré sous 10 %, soit zéro élément utile en dix-neuf jours. Pour une source qui publie plusieurs fois par semaine, zéro sur dix-neuf jours n'est pas un échantillon fragile.",
      "Ce que je n'ai pas vérifié avant de couper : si l'une d'elles publie par rafales rares et à forte valeur — un article par mois qui compterait, noyé dans dix-huit jours de bruit. Dix-neuf jours ne couvrent pas un cycle mensuel. C'est un angle mort réel de la mesure, pas seulement une possibilité théorique.",
      "Et je ne rejuge que passivement : j'ai noté dans le journal « refaire la mesure sur un mois complet », sans aucun mécanisme qui m'y oblige. Rien n'empêche que ça glisse. Le contrôle honnête serait actif — garder les flux désactivés en veille silencieuse, collectés mais ni scorés ni publiés, pour comparer sur un mois ce qu'ils auraient produit contre ce qu'ils ont réellement raté, au lieu de se fier à ma mémoire pour relancer la mesure.",
      "Le profil de pertinence, lui, ne bouge pas, et je ne sais pas ce qu'il m'a fait manquer : rien dans le système ne détecte un désalignement entre ce profil et ce qui m'intéresse réellement maintenant. C'est la faille structurelle de la conception — le scoring est un filtre à sens unique, sans boucle de retour qui dirait « ce que tu ignores depuis trois semaines redevient pertinent », ou l'inverse.",
      "Un signal existe pourtant, indirect : les favoris. Un élément classé « bruit » mais mis de côté à répétition serait le signe que le profil sous-évalue quelque chose. Rien ne l'agrège aujourd'hui — les favoris sont stockés, jamais réinjectés dans le profil ni dans le prompt de scoring.",
      "La correction à court terme est manuelle et concrète : relire une fois par mois les éléments notés « bruit » de la semaine et vérifier à la main si l'un d'eux aurait dû remonter. Cinq minutes, mais qui ferment la boucle que le système n'a pas. À plus long terme, faire dériver une partie du poids de scoring des favoris effectivement gardés, pour que le profil déclaré et le comportement réel se recalent l'un sur l'autre au lieu de diverger silencieusement.",
      "Le BYOK a un coût que je ne minimise pas, et qu'il vaut mieux redire sans filtre : la fonctionnalité phare du site public — développer un article — est cassée par défaut pour n'importe quel visiteur qui ne s'attend pas à devoir créer un compte et coller une clé API avant de cliquer sur un bouton. Aucun utilisateur d'un produit grand public n'accepterait cette friction sans explication préalable.",
      "Pire : le mode dégradé sans clé, titre et extrait, est exactement celui qui avait produit l'erreur factuelle à l'origine de la lecture complète des articles. Le visiteur sans clé récupère donc précisément le défaut que la fonctionnalité a été conçue pour éliminer.",
      "Je l'assume tel quel, mais pas sans réserve. La contrepartie est réelle : zéro coût d'hébergement, aucune clé personnelle exposée, aucune dépendance à mon quota. Et elle est alignée avec ce qu'est ce projet — un outil personnel rendu public par générosité, pas un produit avec des utilisateurs à convertir. Si l'objectif changeait, si l'intention devenait de le faire vraiment adopter plutôt que de le rendre consultable, l'arbitrage ne tiendrait plus : il faudrait soit absorber un budget partagé avec un plafond dur, soit assumer que « développer » reste réservé aux utilisateurs avertis — et l'afficher dès l'accueil, au lieu de le laisser découvrir au clic.",
    ],
  },
};

export default aiWatch;
